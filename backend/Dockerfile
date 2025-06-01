FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies first (for better Docker caching)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application code
COPY . .

# Complete the composer installation
RUN composer dump-autoload --no-dev --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Create startup script
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'cd /var/www' >> /start.sh && \
    echo 'if [ ! -f vendor/autoload.php ]; then' >> /start.sh && \
    echo '    composer install --no-dev --optimize-autoloader' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo 'php artisan serve --host=0.0.0.0 --port=8000' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]