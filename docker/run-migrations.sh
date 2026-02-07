#!/bin/bash
# Run database migrations inside the container

set -e

echo "🔄 Running database migrations..."

cd /app

# Wait for MySQL to be ready
for i in {1..30}; do
    if mysqladmin ping -h localhost --silent; then
        break
    fi
    sleep 1
done

# Run drizzle push to sync schema
echo "📊 Syncing database schema..."
npx drizzle-kit push

echo "✅ Migrations complete!"
