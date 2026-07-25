#!/usr/bin/env bash
# Idempotently adds the waitlist /api/ reverse proxy to the live nginx config.
# Works on the certbot-managed conf without regenerating it: inserts the
# rate-limit zone above the first server block and the location block inside
# the HTTPS server block (falls back to the first server block on an
# HTTP-only conf). Backs up, validates with nginx -t, reverts on failure.
#
#   sudo ./deploy/install-api-proxy.sh                      # real run
#   ./deploy/install-api-proxy.sh --conf FILE --no-reload   # test mode
set -euo pipefail

# Same conf location logic as bootstrap.sh: Debian vs RHEL/Amazon Linux.
if [ -d /etc/nginx/sites-enabled ]; then
  CONF=/etc/nginx/sites-available/lucent.conf
else
  CONF=/etc/nginx/conf.d/lucent.conf
fi
RELOAD=1
while [ $# -gt 0 ]; do
  case "$1" in
    --conf) CONF="$2"; shift 2 ;;
    --no-reload) RELOAD=0; shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

[ -f "$CONF" ] || { echo "conf not found: $CONF" >&2; exit 1; }

if grep -q 'location /api/' "$CONF"; then
  echo "==> /api/ proxy already present in $CONF"
  exit 0
fi

NEED_ZONE=1
grep -q 'zone=lucent_api' "$CONF" && NEED_ZONE=0
TARGET443=0
grep -q 'listen[^;]*443' "$CONF" && TARGET443=1

BACKUP="$CONF.bak.$(date +%s)"
cp "$CONF" "$BACKUP"
echo "==> Backup at $BACKUP"

TMP="$(mktemp)"
awk -v need_zone="$NEED_ZONE" -v target443="$TARGET443" '
  function flush_block(insert,   i) {
    if (insert) {
      for (i = 0; i < nbuf - 1; i++) print buf[i]
      print "    location /api/ {"
      print "        limit_req zone=lucent_api burst=10 nodelay;"
      print "        limit_req_status 429;"
      print "        client_max_body_size 4k;"
      print "        proxy_pass http://127.0.0.1:8787;"
      print "        proxy_set_header Host $host;"
      print "        proxy_set_header X-Real-IP $remote_addr;"
      print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
      print "        proxy_set_header X-Forwarded-Proto $scheme;"
      print "    }"
      print buf[nbuf - 1]
      loc_done = 1
    } else {
      for (i = 0; i < nbuf; i++) print buf[i]
    }
    nbuf = 0; inserver = 0; seen_open = 0; depth = 0
  }
  {
    line = $0
    if (!inserver && line ~ /^[ \t]*server([ \t{]|$)/) {
      if (need_zone && !zone_done) {
        print "limit_req_zone $binary_remote_addr zone=lucent_api:10m rate=20r/m;"
        print ""
        zone_done = 1
      }
      inserver = 1; nbuf = 0; depth = 0; seen_open = 0
    }
    if (inserver) {
      buf[nbuf++] = line
      o = line; opens = gsub(/\{/, "{", o)
      c = line; closes = gsub(/\}/, "}", c)
      if (opens > 0) seen_open = 1
      depth += opens - closes
      if (seen_open && depth <= 0) {
        is_target = 0
        if (!loc_done) {
          if (target443) {
            for (i = 0; i < nbuf; i++) if (buf[i] ~ /listen[^;]*443/) is_target = 1
          } else {
            is_target = 1
          }
        }
        flush_block(is_target)
      }
      next
    }
    print line
  }
  END { if (nbuf > 0) flush_block(0) }
' "$CONF" > "$TMP"

if ! grep -q 'location /api/' "$TMP"; then
  echo "ERROR: failed to insert the /api/ block (no matching server block?)" >&2
  rm -f "$TMP"
  exit 1
fi

cp "$TMP" "$CONF"
rm -f "$TMP"
echo "==> Inserted /api/ proxy into $CONF"

if [ "$RELOAD" = 1 ]; then
  if nginx -t; then
    systemctl reload nginx
    echo "==> nginx reloaded"
  else
    echo "ERROR: nginx -t failed, reverting to backup" >&2
    cp "$BACKUP" "$CONF"
    nginx -t || true
    exit 1
  fi
fi
