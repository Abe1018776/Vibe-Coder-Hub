#!/usr/bin/env bash
# Daily pg_dump rotation. Add to /etc/cron.daily for automatic backups.
set -euo pipefail

source /etc/vibe-coder-hub.env

BACKUP_DIR="${BACKUP_DIR:-/var/backups/vibe-coder-hub}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/$DB_NAME-$TS.sql.gz"

PGPASSWORD="$DB_PASS" pg_dump -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" | gzip > "$OUT"
echo "Backup written to $OUT"

find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +"$KEEP_DAYS" -delete
