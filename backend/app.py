"""Lucent waitlist API.

A tiny FastAPI service that stores email+name signups in SQLite and sends an
AWS SES alert on each new signup. Runs behind Nginx at /api/ (localhost only).
"""

import csv
import hmac
import io
import os
import re
import sqlite3
import time
from collections import OrderedDict, deque
from contextlib import closing
from datetime import datetime, timezone

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from email_validator import EmailNotValidError, validate_email
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

# Signups hold PII: keep the DB and its WAL sidecars owner-only (0600).
os.umask(0o077)

DB_PATH = os.environ.get("WAITLIST_DB_PATH", "waitlist.db")
ADMIN_TOKEN = os.environ.get("WAITLIST_ADMIN_TOKEN", "")
FROM_EMAIL = os.environ.get("WAITLIST_FROM_EMAIL", "")
ALERT_TO = os.environ.get("WAITLIST_ALERT_TO", "")
AWS_REGION = os.environ.get("AWS_REGION", "eu-west-1")
RATE_MAX = int(os.environ.get("WAITLIST_RATE_MAX", "10"))
RATE_WINDOW = int(os.environ.get("WAITLIST_RATE_WINDOW", "60"))
SES_MAX_PER_HOUR = int(os.environ.get("WAITLIST_SES_MAX_PER_HOUR", "200"))
MAX_TRACKED_IPS = 10_000

app = FastAPI(title="Lucent Waitlist", docs_url=None, redoc_url=None, openapi_url=None)


def _db():
    # timeout gives writers a deterministic lock-wait across Python versions
    # (default busy_timeout is 0 on 3.11) instead of an immediate "database is locked".
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _init_db():
    with closing(_db()) as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS signups (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 email TEXT NOT NULL UNIQUE,
                 name TEXT NOT NULL,
                 created_at TEXT NOT NULL,
                 ip TEXT,
                 user_agent TEXT,
                 source TEXT,
                 consent INTEGER NOT NULL DEFAULT 1
               )"""
        )
        conn.commit()


_init_db()

# Per-IP sliding-window rate limit (in-process; single uvicorn worker).
# Bounded LRU: a many-distinct-IP flood evicts the oldest keys instead of
# growing without bound (nginx limit_req is the primary edge throttle).
_hits: "OrderedDict[str, deque]" = OrderedDict()


def _rate_ok(ip: str) -> bool:
    now = time.monotonic()
    q = _hits.get(ip)
    if q is None:
        q = _hits[ip] = deque()
    else:
        _hits.move_to_end(ip)
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_MAX:
        return False
    q.append(now)
    while len(_hits) > MAX_TRACKED_IPS:
        _hits.popitem(last=False)
    return True


# One SES client for the process; global hourly budget caps alert cost/abuse.
_ses = boto3.client("ses", region_name=AWS_REGION) if (FROM_EMAIL and ALERT_TO) else None
_ses_sends: deque = deque()
_CTRL = re.compile(r"[\x00-\x1f\x7f]")


def _send_alert(email: str, name: str) -> None:
    """Best effort, off the request path. Never raises."""
    if _ses is None:
        return
    now = time.monotonic()
    while _ses_sends and now - _ses_sends[0] > 3600:
        _ses_sends.popleft()
    if len(_ses_sends) >= SES_MAX_PER_HOUR:
        print("[waitlist] SES hourly budget reached; skipping alert")
        return
    _ses_sends.append(now)
    try:
        _ses.send_email(
            Source=FROM_EMAIL,
            Destination={"ToAddresses": [ALERT_TO]},
            Message={
                "Subject": {"Data": f"New waitlist signup: {name}"},
                "Body": {"Text": {"Data": f"Name: {name}\nEmail: {email}\n"}},
            },
        )
    except (BotoCoreError, ClientError) as exc:
        print(f"[waitlist] SES alert failed: {exc}")


def _clean_name(raw: str) -> str:
    """Drop control chars (incl. CR/LF) and collapse whitespace; cap length."""
    return " ".join(_CTRL.sub(" ", raw).split())[:100]


def _csv_safe(value) -> str:
    """Neutralise spreadsheet formula injection in exported fields.

    Guards a leading formula char even behind whitespace (some parsers strip it).
    """
    s = "" if value is None else str(value)
    return "'" + s if (s[:1] in ("\t", "\r") or s.lstrip()[:1] in ("=", "+", "-", "@")) else s


class Signup(BaseModel):
    email: str = Field(default="", max_length=254)
    name: str = Field(default="", max_length=200)
    company: str = Field(default="", max_length=200)  # honeypot: real users never fill this
    source: str = Field(default="", max_length=60)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/waitlist")
def join(payload: Signup, request: Request, background: BackgroundTasks):
    # Honeypot first, so bot traffic doesn't consume a shared IP's rate budget.
    if payload.company.strip():
        return JSONResponse({"ok": True}, status_code=200)

    ip = request.headers.get("x-real-ip") or (request.client.host if request.client else "")
    if ip and not _rate_ok(ip):
        raise HTTPException(429, "Too many requests. Please try again shortly.")

    try:
        email = validate_email(payload.email.strip(), check_deliverability=False).normalized.lower()
    except EmailNotValidError:
        raise HTTPException(422, "Enter a valid email address.")

    name = _clean_name(payload.name)
    if not name:
        raise HTTPException(422, "Please enter your name.")

    ua = request.headers.get("user-agent", "")[:300]
    source = (payload.source or "website")[:60]
    now = datetime.now(timezone.utc).isoformat()

    try:
        with closing(_db()) as conn:
            conn.execute(
                "INSERT INTO signups (email, name, created_at, ip, user_agent, source, consent)"
                " VALUES (?, ?, ?, ?, ?, ?, 1)",
                (email, name, now, ip, ua, source),
            )
            conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(409, "You're already on the list.")

    background.add_task(_send_alert, email, name)
    return JSONResponse({"ok": True}, status_code=201)


@app.get("/api/waitlist/export")
def export(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").strip()
    if not ADMIN_TOKEN or not hmac.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(401, "Unauthorized")
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["id", "email", "name", "created_at", "ip", "user_agent", "source", "consent"])
    with closing(_db()) as conn:
        rows = conn.execute(
            "SELECT id, email, name, created_at, ip, user_agent, source, consent"
            " FROM signups ORDER BY id"
        )
        for row in rows:
            writer.writerow([_csv_safe(v) for v in row])
    return Response(
        out.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=waitlist.csv"},
    )
