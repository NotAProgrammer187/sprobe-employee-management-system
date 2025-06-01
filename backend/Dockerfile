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
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files first for better caching
COPY composer.json composer.lock* ./

# Install PHP dependencies (update composer.lock if needed)
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-autoloader || \
    composer update --no-dev --optimize-autoloader --no-scripts --no-autoloader

# Copy the rest of the application
COPY . /var/www

# Generate autoloader
RUN composer dump-autoload --optimize

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 8000 and start php-fpm server
EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000