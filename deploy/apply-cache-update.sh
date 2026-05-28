#!/usr/bin/env bash
# Apply the CSS/JS cache split to the live Nginx config IN-PLACE, preserving
# certbot's TLS additions. Safe to re-run.
#
# Run on the EC2 box:
#   curl -fsSL https://raw.githubusercontent.com/aayushverma03/Lucent_website/main/deploy/apply-cache-update.sh | sudo bash

set -euo pipefail

CONF=/etc/nginx/conf.d/lucent.conf
[ -f "$CONF" ] || CONF=/etc/nginx/sites-available/lucent.conf
[ -f "$CONF" ] || { echo "lucent nginx config not found"; exit 1; }

BACKUP="$CONF.bak.$(date +%s)"
cp "$CONF" "$BACKUP"
echo "==> backup: $BACKUP"

python3 - "$CONF" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
text = p.read_text()
old = '''    location ~* \\.(?:css|js|woff2?|ttf|otf|eot|webp|png|jpe?g|gif|svg|ico|mp4|webm)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }'''
new = '''    location ~* \\.(?:css|js)$ {
        expires 5m;
        add_header Cache-Control "public, max-age=300, must-revalidate";
        access_log off;
    }

    location ~* \\.(?:woff2?|ttf|otf|eot|webp|png|jpe?g|gif|svg|ico|mp4|webm)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }'''
if old in text:
    p.write_text(text.replace(old, new))
    print("==> CSS/JS cache split applied")
elif 'location ~* \\.(?:css|js)$' in text:
    print("==> already split; nothing to do")
    sys.exit(0)
else:
    print("==> WARN: expected old block not found; live config may have been hand-edited")
    sys.exit(2)
PY

if nginx -t 2>&1; then
    systemctl reload nginx
    echo "==> Nginx reloaded. CSS/JS now cached 5min; images/fonts/videos still 30d."
else
    echo "!! nginx -t FAILED — restoring backup"
    cp "$BACKUP" "$CONF"
    systemctl reload nginx
    exit 1
fi
