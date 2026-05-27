#!/usr/bin/env bash
# Self-contained one-shot setup for the Lucent static site on a fresh Ubuntu
# EC2 instance (22.04 / 24.04). Installs Nginx + Certbot, writes the site
# config, pulls the current site so it is live immediately, and (optionally)
# enables HTTPS.
#
# Run ON the instance as the default 'ubuntu' user:
#   curl -fsSL https://raw.githubusercontent.com/mshbp92zt8-png/Lucent_website/main/deploy/bootstrap.sh | bash -s -- yourdomain.com you@example.com
# or copy this file up and:
#   chmod +x bootstrap.sh && ./bootstrap.sh yourdomain.com you@example.com
#
# The email is optional; omit it to set up HTTP only and run HTTPS later.

set -euo pipefail

DOMAIN="${1:?Usage: bootstrap.sh <domain> [email]   e.g. ./bootstrap.sh lucentapp.com you@example.com}"
EMAIL="${2:-}"
REPO_URL="https://github.com/mshbp92zt8-png/Lucent_website.git"
WEBROOT="/var/www/lucent"

echo "==> Installing nginx, certbot, git, rsync"
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx git rsync

echo "==> Creating web root $WEBROOT (owned by $USER so CI can rsync without sudo)"
sudo mkdir -p "$WEBROOT"
sudo chown -R "$USER":"$USER" "$WEBROOT"

echo "==> Writing Nginx site config for $DOMAIN"
sudo tee /etc/nginx/sites-available/lucent.conf >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $WEBROOT;
    index index.html;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json image/svg+xml application/manifest+json;

    location = /index.html { add_header Cache-Control "no-cache"; }

    location ~* \.(?:css|js|woff2?|ttf|otf|eot|webp|png|jpe?g|gif|svg|ico|mp4|webm)\$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    location / {
        try_files \$uri \$uri.html \$uri/ =404;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/lucent.conf /etc/nginx/sites-enabled/lucent.conf
sudo rm -f /etc/nginx/sites-enabled/default

echo "==> Pulling current site into $WEBROOT"
TMP="$(mktemp -d)"
git clone --depth 1 "$REPO_URL" "$TMP/repo"
rsync -a --delete \
  --exclude '.git' --exclude '.github' --exclude 'deploy' \
  --exclude 'DEPLOYMENT.md' --exclude '.gitignore' \
  "$TMP/repo/" "$WEBROOT/"
rm -rf "$TMP"

echo "==> Validating and reloading Nginx"
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

if [ -n "$EMAIL" ]; then
  echo "==> Attempting HTTPS via Let's Encrypt (needs DNS already pointing here)"
  if sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
        --non-interactive --agree-tos -m "$EMAIL" --redirect; then
    echo "    HTTPS enabled; renewal is automatic."
  else
    echo "    Certbot failed (likely DNS not propagated yet). Re-run later:"
    echo "      sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m $EMAIL --redirect"
  fi
else
  echo "==> Skipping HTTPS (no email given). After DNS resolves, run:"
  echo "      sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m you@example.com --redirect"
fi

echo
echo "Done. Site is live over HTTP at http://$DOMAIN (once DNS points at this instance)."
echo "Future pushes to main auto-deploy via the GitHub Actions workflow."
