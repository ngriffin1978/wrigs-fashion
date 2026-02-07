# Multi-stage build for Wrigs Fashion
# Stage 1: Build the SvelteKit app
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for canvas and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Copy package files
COPY package*.json ./

# Install dependencies (including drizzle-kit for migrations)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production image with Node.js + MySQL
FROM node:18-bullseye

# Install MySQL server (default-mysql-server for Debian), nginx, supervisor
RUN apt-get update && apt-get install -y \
    default-mysql-server \
    default-mysql-client \
    nginx \
    supervisor \
    openssl \
    curl \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built app and all dependencies from builder (including drizzle-kit)
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/static ./static
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src/lib/server/db/schema.ts ./src/lib/server/db/schema.ts

# Copy configuration files
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/init-db.sql /docker-entrypoint-initdb.d/init.sql
COPY docker/run-migrations.sh /usr/local/bin/run-migrations.sh

# Create directories for MySQL and uploads
RUN mkdir -p /var/lib/mysql /var/run/mysqld /app/static/uploads /app/static/pdfs /app/drizzle /app/src/lib/server/db \
    && chown -R mysql:mysql /var/lib/mysql /var/run/mysqld \
    && chmod +x /entrypoint.sh /usr/local/bin/run-migrations.sh

# Generate self-signed SSL certificate for localhost
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=WrigsFashion/CN=localhost"

# Expose ports
EXPOSE 443 80 3306

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f -k https://localhost:443/ || exit 1

# Start services via entrypoint
ENTRYPOINT ["/entrypoint.sh"]
