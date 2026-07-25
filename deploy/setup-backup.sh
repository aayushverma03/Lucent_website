#!/usr/bin/env bash
# Install the daily S3 backup cron for the waitlist DB. Run on the EC2 box:
#   sudo ./deploy/setup-backup.sh <s3-bucket> [prefix]
# Requires the backend already installed (deploy/setup-backend.sh) and an
# instance IAM role allowing s3:PutObject on the bucket/prefix.
set -euo pipefail

BUCKET="${1:?Usage: setup-backup.sh <s3-bucket> [prefix]}"
PREFIX="${2:-waitlist-backups}"
HERE="$(cd "$(dirname "$0")" && pwd)"
APP_DIR=/opt/lucent-backend
SCRIPT="$APP_DIR/backup-waitlist.sh"
LOG=/var/log/lucent-backup.log

echo "==> Installing backup script to $SCRIPT"
sudo cp "$HERE/backup-waitlist.sh" "$SCRIPT"
# Match the service user chosen by setup-backend.sh (www-data on Debian,
# nginx on RHEL/Amazon Linux, lucent as fallback).
SERVICE_USER=www-data
id -u "$SERVICE_USER" >/dev/null 2>&1 || SERVICE_USER=nginx
id -u "$SERVICE_USER" >/dev/null 2>&1 || SERVICE_USER=lucent

sudo chown "$SERVICE_USER:$SERVICE_USER" "$SCRIPT"
sudo chmod 750 "$SCRIPT"

echo "==> Log file $LOG"
sudo touch "$LOG"
sudo chown "$SERVICE_USER:$SERVICE_USER" "$LOG"

echo "==> Cron entry /etc/cron.d/lucent-backup (daily 03:17 UTC)"
sudo tee /etc/cron.d/lucent-backup >/dev/null <<EOF
# Lucent waitlist DB -> S3. Managed by deploy/setup-backup.sh.
PATH=/usr/bin:/bin
LUCENT_BACKUP_BUCKET=$BUCKET
LUCENT_BACKUP_PREFIX=$PREFIX
17 3 * * * $SERVICE_USER $SCRIPT >> $LOG 2>&1
EOF
sudo chmod 644 /etc/cron.d/lucent-backup

echo "==> Running one backup now to verify (uploads to S3)"
sudo -u "$SERVICE_USER" env LUCENT_BACKUP_BUCKET="$BUCKET" LUCENT_BACKUP_PREFIX="$PREFIX" "$SCRIPT"

echo
echo "==> Done. Daily backups land in s3://$BUCKET/$PREFIX/"
echo "    Watch:   tail -f $LOG"
echo "    Retention: add an S3 lifecycle rule to expire old objects (see DEPLOYMENT.md)."
