#!/usr/bin/env bash
# One-command VPS deploy helper for the Bible in a Year Traefik/SQLite stack.
# Mirrors the Covenanters app's deploy-vps.sh, adapted for this app's simpler
# single-file SQLite store (no separate database service or migration step —
# tables are created automatically on first access). Assumes the repo already
# lives on the server at /docker/bible-in-a-year and the data directory is
# bind-mounted from ./data (see docker-compose.yaml).

set -euo pipefail

REPO_DIR="${REPO_DIR:-/docker/bible-in-a-year}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yaml}"
BRANCH="${BRANCH:-main}"
BACKUP_DIR="${BACKUP_DIR:-data/backups}"
DB_FILE="${DB_FILE:-data/bible.sqlite}"

cd "$REPO_DIR"

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

sqlite_settings_count() {
  compose exec -T bible node -e "
    try {
      const Database = require('better-sqlite3');
      const db = new Database(process.env.SQLITE_DB_PATH);
      console.log(db.prepare('SELECT COUNT(*) AS c FROM bible_reading_settings').get().c);
    } catch (e) {
      console.log(0);
    }
  " 2>/dev/null | tr -d '[:space:]' || echo "0"
}

wait_for_app() {
  local attempt
  for attempt in $(seq 1 30); do
    if compose exec -T bible node -e "fetch('http://127.0.0.1:3000/').then((r)=>{console.log('HTTP', r.status); if (r.status >= 500) process.exit(1)}).catch(()=>process.exit(1))" >/dev/null 2>&1; then
      compose exec -T bible node -e "fetch('http://127.0.0.1:3000/').then((r)=>console.log('HTTP', r.status))"
      return 0
    fi
    sleep 2
  done

  echo "Bible in a Year did not return a healthy HTTP response in time." >&2
  return 1
}

echo "Updating Bible in a Year from origin/$BRANCH..."
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

mkdir -p data "$BACKUP_DIR"

TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"

if [ -f "$DB_FILE" ]; then
  BACKUP_FILE="$BACKUP_DIR/pre-deploy-bible-$TIMESTAMP.sqlite"
  echo "Backing up SQLite database to $BACKUP_FILE..."
  cp "$DB_FILE" "$BACKUP_FILE"
else
  echo "No existing database file yet (first deploy) — skipping backup."
fi

PRE_DEPLOY_SETTINGS_ROWS="0"
if compose ps bible >/dev/null 2>&1; then
  PRE_DEPLOY_SETTINGS_ROWS="$(sqlite_settings_count)"
fi

echo "Building production image..."
compose build bible

echo "Restarting application container..."
compose up -d --no-deps bible

echo "Checking application from inside the container..."
wait_for_app

POST_DEPLOY_SETTINGS_ROWS="$(sqlite_settings_count)"

if [ "$PRE_DEPLOY_SETTINGS_ROWS" -gt 0 ] && [ "$POST_DEPLOY_SETTINGS_ROWS" -lt "$PRE_DEPLOY_SETTINGS_ROWS" ]; then
  echo "Database safety check failed: settings rows before deploy=$PRE_DEPLOY_SETTINGS_ROWS, after=$POST_DEPLOY_SETTINGS_ROWS." >&2
  echo "Restore data/bible.sqlite from the backup above if this wasn't expected." >&2
  exit 1
fi

echo "Deployment complete. Current container state:"
compose ps
