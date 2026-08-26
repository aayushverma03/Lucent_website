#!/usr/bin/env bash
# Turn on automatic certificate renewal and prove it is actually armed.
#
# The certbot RPM on Amazon Linux ships certbot-renew.timer DISABLED, unlike
# the Debian/Ubuntu package which enables certbot.timer on install. Assuming
# "renewal is automatic" silently expired the lucent-ai.app cert in Aug 2026.
# Run this after any certbot issuance. Safe to re-run.

set -euo pipefail

for unit in certbot-renew.timer certbot.timer; do
  if systemctl list-unit-files "$unit" >/dev/null 2>&1 &&
     systemctl list-unit-files "$unit" | grep -q "$unit"; then
    sudo systemctl enable --now "$unit"
    TIMER="$unit"
    break
  fi
done

if [ -z "${TIMER:-}" ]; then
  echo "ERROR: no certbot renewal timer unit found. Renewal is NOT automatic." >&2
  echo "       Install one, or add a systemd timer running 'certbot renew'." >&2
  exit 1
fi

if ! systemctl is-active --quiet "$TIMER"; then
  echo "ERROR: $TIMER did not become active. Renewal is NOT automatic." >&2
  exit 1
fi

echo "==> $TIMER is enabled and active. Next run:"
systemctl list-timers "$TIMER" --no-pager
