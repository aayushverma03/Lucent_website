#!/usr/bin/env bash
# Obtain and install a free Let's Encrypt certificate, and turn on the
# HTTP->HTTPS redirect. Run this AFTER GoDaddy DNS points at this server,
# otherwise the domain-validation check will fail.
#
# Usage:  ./enable-https.sh <domain> <email>
# Example: ./enable-https.sh lucentapp.com you@example.com

set -euo pipefail

DOMAIN="${1:?Usage: enable-https.sh <domain> <email>}"
EMAIL="${2:?Usage: enable-https.sh <domain> <email>}"

sudo certbot --nginx \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos -m "$EMAIL" --redirect

echo
echo "==> Arming automatic renewal"
"$(dirname "$0")/enable-auto-renew.sh"
