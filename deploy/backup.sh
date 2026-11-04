#!/bin/sh
set -eu
mkdir -p /backups
ts=$(date +%Y%m%d-%H%M)
pg_dump -h "$PGHOST" -U "$PGUSER" "$PGDATABASE" | gzip > "/backups/bookstore-$ts.sql.gz"
# keep 7 days
find /backups -name 'bookstore-*.sql.gz' -mtime +7 -delete
echo "backup written bookstore-$ts.sql.gz"
