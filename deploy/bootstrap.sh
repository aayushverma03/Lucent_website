#!/usr/bin/env bash
# Self-contained one-shot setup for the Lucent static site on a fresh cloud VM.
# Supports Ubuntu/Debian (apt) and Amazon Linux / RHEL / Fedora (dnf or yum).
# Installs Nginx + Certbot, writes the site config, pulls the current site so
# it is live immediately, and (optionally) enables HTTPS.
#
# Run ON the instance (user is 'ubuntu' on Ubuntu, 'ec2-user' on Amazon Linux):
#   curl -fsSL https://raw.githubusercontent.com/aayushverma03/Lucent_website/main/deploy/bootstrap.sh | bash -s -- yourdomain.com you@example.com
#
# Email is optional, but .app/.dev domains require HTTPS, so provide it there.

set -euo pipefail

DOMAIN="${1:?Usage: bootstrap.sh <domain> [email]   e.g. bootstrap.sh lucent-ai.app you@example.com}"
EMAIL="${2:-}"
REPO_URL="https://github.com/aayushverma03/Lucent_website.git"
WEBROOT="/var/www/lucent"

# --- Detect package manager -------------------------------------------------
if   command -v apt-get >/dev/null 2>&1; then PM=apt
elif command -v dnf     >/dev/null 2>&1; then PM=dnf
elif command -v yum     >/dev/null 2>&1; then PM=yum
else echo "Unsupported OS: need apt, dnf, or yum." >&2; exit 1; fi
echo "==> Package manager: $PM"

echo "==> Installing nginx, certbot, git, rsync"
case "$PM" in
  apt)
    sudo apt-get update -y
    sudo apt-get install -y nginx certbot python3-certbot-nginx git rsync
    ;;
  dnf)
    sudo dnf install -y nginx git rsync
    sudo dnf install -y certbot python3-certbot-nginx \
      || echo "WARN: certbot packages unavailable via dnf; the HTTPS step may need manual setup."
    ;;
  yum)
    sudo yum install -y git rsync
    sudo yum install -y nginx || { sudo amazon-linux-extras enable nginx1 -y && sudo yum install -y nginx; }
    sudo amazon-linux-extras install -y epel 2>/dev/null || true
    sudo yum install -y certbot python2-certbot-nginx \
      || sudo yum install -y certbot python3-certbot-nginx \
      || echo "WARN: certbot packages unavailable via yum; the HTTPS step may need manual setup."
    ;;
esac

echo "==> Creating web root $WEBROOT (owned by $USER so CI can rsync without sudo)"
sudo mkdir -p "$WEBROOT"
sudo chown -R "$USER":"$USER" "$WEBROOT"

# --- Nginx config location: Debian uses sites-enabled, RHEL/AL use conf.d ----
if [ -d /etc/nginx/sites-enabled ]; then
  CONF=/etc/nginx/sites-available/lucent.conf
  LINK=/etc/nginx/sites-enabled/lucent.conf
else
  CONF=/etc/nginx/conf.d/lucent.conf
  LINK=""
fi
echo "==> Writing Nginx config to $CONF"
sudo tee "$CONF" >/dev/null <<NGINX
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

    location ~* \.(?:css|js)\$ {
        expires 5m;
        add_header Cache-Control "public, max-age=300, must-revalidate";
        access_log off;
    }

    location ~* \.(?:woff2?|ttf|otf|eot|webp|png|jpe?g|gif|svg|ico|mp4|webm)\$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    location / {
        try_files \$uri \$uri.html \$uri/ =404;
    }
}
NGINX
[ -n "$LINK" ] && sudo ln -sf "$CONF" "$LINK"
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

echo "==> Pulling current site into $WEBROOT"
TMP="$(mktemp -d)"
git clone --depth 1 "$REPO_URL" "$TMP/repo"
rsync -a --delete \
  --exclude '.git' --exclude '.github' --exclude 'deploy' \
  --exclude 'DEPLOYMENT.md' --exclude '.gitignore' \
  "$TMP/repo/" "$WEBROOT/"
rm -rf "$TMP"

# --- SELinux (Amazon Linux / RHEL): label the web root if enforcing ---------
if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" = "Enforcing" ]; then
  echo "==> SELinux enforcing: labeling $WEBROOT for nginx"
  sudo dnf install -y policycoreutils-python-utils 2>/dev/null \
    || sudo yum install -y policycoreutils-python-utils 2>/dev/null || true
  sudo semanage fcontext -a -t httpd_sys_content_t "$WEBROOT(/.*)?" 2>/dev/null || true
  sudo restorecon -R "$WEBROOT" 2>/dev/null \
    || sudo chcon -R -t httpd_sys_content_t "$WEBROOT" 2>/dev/null || true
fi

echo "==> Validating and starting Nginx"
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

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
  echo "==> No email given; HTTP only. After DNS resolves, run:"
  echo "      sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m you@example.com --redirect"
fi

echo
echo "Done. http://$DOMAIN serves once DNS points at this instance."
echo "(.app/.dev require HTTPS in browsers, so make sure the certbot step succeeded.)"
