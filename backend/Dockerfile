FROM php:8.4-fpm-alpine

# ── System packages ──────────────────────────────────────────────────────────
RUN apk add --no-cache \
    bash curl git zip unzip supervisor \
    libpng-dev libzip-dev libxml2-dev oniguruma-dev \
    icu-dev freetype-dev libjpeg-turbo-dev \
    mysql-client

# ── PHP extensions ────────────────────────────────────────────────────────────
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql mbstring bcmath pcntl exif zip gd intl

# ── Composer 2 ───────────────────────────────────────────────────────────────
COPY --from=composer:2.9 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ── Install PHP dependencies (cached layer) ───────────────────────────────────
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# ── Copy application source ───────────────────────────────────────────────────
COPY . .

# ── Finalise autoload & permissions ──────────────────────────────────────────
RUN composer dump-autoload --optimize \
    && mkdir -p storage/logs storage/framework/{sessions,views,cache} bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# ── Docker helpers ────────────────────────────────────────────────────────────
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/supervisord.conf /etc/supervisord.conf
RUN chmod +x /entrypoint.sh

EXPOSE 8000 8080

ENTRYPOINT ["/entrypoint.sh"]
