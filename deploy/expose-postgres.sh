#!/usr/bin/env bash
# Configure Postgres for remote access with TLS + password auth.
# Open port 5432 in UFW.
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

PG_VERSION="$(ls /etc/postgresql 2>/dev/null | sort -nr | head -1 || true)"
if [[ -z "$PG_VERSION" ]]; then
  echo "Postgres not installed. Run bootstrap-postgres.sh first." >&2
  exit 1
fi
PG_DIR="/etc/postgresql/$PG_VERSION/main"
PG_CONF="$PG_DIR/postgresql.conf"
PG_HBA="$PG_DIR/pg_hba.conf"

echo "==> Enabling listen_addresses + SSL in $PG_CONF"
sed -i "s|^#*listen_addresses.*|listen_addresses = '*'|" "$PG_CONF"
sed -i "s|^#*ssl =.*|ssl = on|" "$PG_CONF"

if ! grep -qE "^host\s+all\s+all\s+0.0.0.0/0\s+scram-sha-256" "$PG_HBA"; then
  echo "==> Adding remote scram-sha-256 rule to $PG_HBA"
  echo "host    all             all             0.0.0.0/0               scram-sha-256" >> "$PG_HBA"
fi

systemctl restart postgresql

echo "==> UFW: allow 5432"
ufw allow 5432/tcp >/dev/null || true
ufw status verbose | head -20 || true

echo
echo "Postgres now reachable on 0.0.0.0:5432 with password + TLS."
echo "Use DATABASE_URL_PUBLIC from /etc/vibe-coder-hub.env in Vercel."
