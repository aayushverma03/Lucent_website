# Lucent waitlist API

Tiny FastAPI service: stores email+name signups in SQLite, sends an AWS SES
alert per signup. Served behind Nginx at `/api/` (bound to `127.0.0.1:8787`).

## Endpoints
- `POST /api/waitlist` — body `{email, name, company?, source?}`. `company` is a
  honeypot. Returns `201` new, `409` duplicate, `422` invalid, `429` throttled,
  `200` (silent) if the honeypot is filled.
- `GET /api/waitlist/export` — `Authorization: Bearer <WAITLIST_ADMIN_TOKEN>` → CSV.
- `GET /api/health` → `{"ok": true}`.

## Run locally
```
cd backend
WAITLIST_DB_PATH=./waitlist.db WAITLIST_ADMIN_TOKEN=dev \
  uv run uvicorn app:app --host 127.0.0.1 --port 8787
```

## Deploy (on the EC2 box)
```
# from the repo checkout on the server:
sudo ./deploy/setup-backend.sh          # installs uv, builds venv, starts the service
# add the /api/ proxy block (already in deploy/nginx/lucent.conf.template) then:
sudo nginx -t && sudo systemctl reload nginx
```
Fill `WAITLIST_FROM_EMAIL` / `WAITLIST_ALERT_TO` in `/etc/lucent/waitlist.env`
and verify both in SES for alerts to send.

## Export signups
```
curl -H "Authorization: Bearer $WAITLIST_ADMIN_TOKEN" \
  https://<domain>/api/waitlist/export -o waitlist.csv
```

Config is env-driven — see `.env.example`.
