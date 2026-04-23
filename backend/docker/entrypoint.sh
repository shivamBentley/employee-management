#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[EMS]${NC} $*"; }
ok()   { echo -e "${GREEN}[EMS]${NC} $*"; }
warn() { echo -e "${YELLOW}[EMS]${NC} $*"; }
err()  { echo -e "${RED}[EMS]${NC} $*"; exit 1; }

# ── 1. Requirements check ─────────────────────────────────────────────────────
log "Checking required environment variables..."
: "${DB_HOST:?DB_HOST is required}"
: "${DB_DATABASE:?DB_DATABASE is required}"
: "${DB_USERNAME:?DB_USERNAME is required}"

PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')
log "PHP version: ${PHP_VER}"

for EXT in pdo_mysql mbstring bcmath pcntl exif zip gd; do
    php -m | grep -qi "^${EXT}$" \
        && ok "  extension ${EXT} ✓" \
        || err "  Required PHP extension missing: ${EXT}"
done

# ── 2. Wait for MySQL ─────────────────────────────────────────────────────────
log "Waiting for MySQL at ${DB_HOST}:${DB_PORT:-3306}..."
MAX=60; COUNT=0
until php -r "
    try {
        new PDO(
            'mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_DATABASE}',
            '${DB_USERNAME}',
            '${DB_PASSWORD}'
        );
        exit(0);
    } catch (Exception \$e) {
        exit(1);
    }
" 2>/dev/null; do
    COUNT=$((COUNT+1))
    [ $COUNT -ge $MAX ] && err "MySQL did not become ready in time."
    warn "  MySQL not ready yet (${COUNT}/${MAX})… retrying in 3s"
    sleep 3
done
ok "MySQL is ready!"

# ── 3. Ensure .env exists (required by artisan commands) ─────────────────────
if [ ! -f /var/www/.env ]; then
    log "Creating .env from environment variables..."
    cat > /var/www/.env <<EOF
APP_NAME="${APP_NAME:-Employee Management System}"
APP_ENV=${APP_ENV:-local}
APP_KEY=${APP_KEY:-}
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=${APP_URL:-http://localhost:8000}

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-employee_management}
DB_USERNAME=${DB_USERNAME:-root}
DB_PASSWORD=${DB_PASSWORD:-}

CACHE_DRIVER=${CACHE_DRIVER:-database}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}
SESSION_DRIVER=${SESSION_DRIVER:-database}

BROADCAST_CONNECTION=${BROADCAST_CONNECTION:-reverb}
REVERB_APP_ID=${REVERB_APP_ID:-employee-ms}
REVERB_APP_KEY=${REVERB_APP_KEY:-employee-ms-key}
REVERB_APP_SECRET=${REVERB_APP_SECRET:-employee-ms-secret}
REVERB_HOST=${REVERB_HOST:-0.0.0.0}
REVERB_PORT=${REVERB_PORT:-8080}
REVERB_SCHEME=${REVERB_SCHEME:-http}

SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-localhost:3000,localhost:5173}

MAIL_MAILER=${MAIL_MAILER:-log}
EOF
    ok ".env created."
fi

# ── 4. Generate application key if missing ────────────────────────────────────
if [ -z "${APP_KEY}" ] || [[ "${APP_KEY}" == "SomeRandomString" ]] || [[ "${APP_KEY}" == "base64:" ]]; then
    log "Generating application key..."
    php artisan key:generate --force
    ok "Application key generated."
fi

# ── 4. Build / migrate database ───────────────────────────────────────────────
log "Running database migrations..."
php artisan migrate --force
ok "Migrations complete."

log "Seeding database (idempotent)..."
php artisan db:seed --force
ok "Seeding complete."

# ── 5. Storage & caches ───────────────────────────────────────────────────────
log "Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || warn "Storage link already exists."

log "Caching configuration and routes..."
php artisan config:cache
php artisan route:cache
ok "Cache warmed."

# ── 6. Start all services via Supervisord ─────────────────────────────────────
ok "All checks passed. Starting services..."
echo ""
exec /usr/bin/supervisord -n -c /etc/supervisord.conf
