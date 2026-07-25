#!/usr/bin/env bash
# Snapshot the waitlist SQLite DB and upload a gzipped copy to S3.
# Runs as www-data via /etc/cron.d/lucent-backup (installed by setup-backup.sh).
# Uses the backend venv's Python: sqlite3 for a consistent snapshot, boto3 to
# upload with the instance IAM role (no stored AWS keys).
set -euo pipefail

DB="${WAITLIST_DB_PATH:-/var/lib/lucent/waitlist.db}"
BUCKET="${LUCENT_BACKUP_BUCKET:?set LUCENT_BACKUP_BUCKET}"
PREFIX="${LUCENT_BACKUP_PREFIX:-waitlist-backups}"
PY="${LUCENT_VENV_PYTHON:-/opt/lucent-backend/.venv/bin/python}"

STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
SNAP="$TMP/waitlist-$STAMP.db"

# Online backup: transactionally consistent even with concurrent writers (WAL).
"$PY" - "$DB" "$SNAP" <<'PY'
import sqlite3, sys
src = sqlite3.connect(sys.argv[1])
src.execute("PRAGMA busy_timeout=5000")
dst = sqlite3.connect(sys.argv[2])
with dst:
    src.backup(dst)
dst.close(); src.close()
PY

gzip "$SNAP"
KEY="$PREFIX/waitlist-$STAMP.db.gz"

"$PY" - "$SNAP.gz" "$BUCKET" "$KEY" <<'PY'
import sys, boto3
boto3.client("s3").upload_file(sys.argv[1], sys.argv[2], sys.argv[3])
PY

echo "$(date -u +%FT%TZ) ok s3://$BUCKET/$KEY"
