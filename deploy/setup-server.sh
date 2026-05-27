#!/usr/bin/env bash
# One-time provisioning for the Lucent static site on a fresh Ubuntu EC2
# instance (22.04 / 24.04). Installs Nginx + Certbot, creates the web root,
# and installs the site config.
#
# Usage:  ./setup-server.sh <domain>
# Example: ./setup-server.sh lucentapp.com

set -euo pipefail

DOMAIN="${1:?Usage: setup-server.sh <domain>   e.g. ./setup-server.sh lucentapp.com}"
WEBROOT="/var/www/lucent"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "==> Installing nginx, certbot, rsync"
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx rsync

echo "==> Creating web root $WEBROOT (owned by $USER so CI can rsync without sudo)"
sudo mkdir -p "$WEBROOT"
sudo chown -R "$USER":"$USER" "$WEBROOT"

echo "==> Installing Nginx site config for $DOMAIN"
sed "s/__DOMAIN__/$DOMAIN/g" "$HERE/nginx/lucent.conf.template" \
  | sudo tee /etc/nginx/sites-available/lucent.conf >/dev/null
sudo ln -sf /etc/nginx/sites-available/lucent.conf /etc/nginx/sites-enabled/lucent.conf
sudo rm -f /etc/nginx/sites-enabled/default

echo "==> Seeding a placeholder page (replaced on first deploy)"
[ -f "$WEBROOT/index.html" ] || echo "<h1>Lucent - deploying...</h1>" > "$WEBROOT/index.html"

echo "==> Validating and reloading Nginx"
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

cat <<EOF

Server is provisioned. Next steps:
  1) Point GoDaddy DNS at this instance's Elastic IP (A @ and CNAME www).
  2) Once DNS resolves, enable HTTPS:   ./enable-https.sh $DOMAIN you@example.com
  3) Add the GitHub secrets and push to main to deploy the real site.
EOF
