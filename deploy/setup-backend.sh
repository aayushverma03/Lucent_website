#!/usr/bin/env bash
# Installs the Lucent waitlist API as a systemd service on the EC2 box.
# Run on the server from the repo checkout:  sudo ./deploy/setup-backend.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
APP_DIR=/opt/lucent-backend
DB_DIR=/var/lib/lucent
ENV_DIR=/etc/lucent
ENV_FILE="$ENV_DIR/waitlist.env"

echo "==> Installing uv (if missing)"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "==> Copying backend to $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo cp "$HERE/../backend/app.py" "$HERE/../backend/pyproject.toml" "$HERE/../backend/uv.lock" "$APP_DIR/"
sudo chown -R "$(id -un)" "$APP_DIR"

echo "==> Building the virtualenv with uv (pinned by uv.lock)"
( cd "$APP_DIR" && uv sync --frozen )

echo "==> Data dir $DB_DIR"
sudo mkdir -p "$DB_DIR"
sudo chmod 750 "$DB_DIR"

echo "==> Env file $ENV_FILE"
if [ ! -f "$ENV_FILE" ]; then
  sudo mkdir -p "$ENV_DIR"
  TOKEN="$(openssl rand -hex 24)"
  sudo tee "$ENV_FILE" >/dev/null <<EOF
WAITLIST_DB_PATH=$DB_DIR/waitlist.db
WAITLIST_ADMIN_TOKEN=$TOKEN
AWS_REGION=${AWS_REGION:-eu-west-1}
WAITLIST_FROM_EMAIL=${WAITLIST_FROM_EMAIL:-}
WAITLIST_ALERT_TO=${WAITLIST_ALERT_TO:-}
WAITLIST_RATE_MAX=10
WAITLIST_RATE_WINDOW=60
EOF
  sudo chmod 600 "$ENV_FILE"
  echo "    generated admin token: $TOKEN"
  echo "    -> set WAITLIST_FROM_EMAIL / WAITLIST_ALERT_TO for SES alerts, then verify both in SES."
fi

# Debian/Ubuntu ships www-data; RHEL/Amazon Linux ships nginx; fall back
# to a dedicated system user if neither exists.
SERVICE_USER=www-data
if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then SERVICE_USER=nginx; fi
if ! id -u "$SERVICE_USER" >/dev/null 2>&1; then
  SERVICE_USER=lucent
  sudo useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"
fi

echo "==> Ownership for the service user ($SERVICE_USER)"
sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR" "$DB_DIR"

echo "==> systemd service (User=$SERVICE_USER)"
sed "s/^User=.*/User=$SERVICE_USER/; s/^Group=.*/Group=$SERVICE_USER/" \
  "$HERE/lucent-waitlist.service" | sudo tee /etc/systemd/system/lucent-waitlist.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable lucent-waitlist
# restart (not just enable --now) so re-runs pick up new app.py / unit changes
sudo systemctl restart lucent-waitlist
sudo systemctl status lucent-waitlist --no-pager | head -5 || true

echo
echo "==> Done. Now add the /api/ proxy (already in deploy/nginx/lucent.conf.template):"
echo "    sudo nginx -t && sudo systemctl reload nginx"
