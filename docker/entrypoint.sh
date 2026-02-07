#!/bin/bash
set -e

echo "🚀 Starting Wrigs Fashion Docker Container..."
echo "=========================================="

# Generate AUTH_SECRET if not provided
if [ -z "$AUTH_SECRET" ]; then
    export AUTH_SECRET=$(openssl rand -hex 32)
    echo "✅ Generated AUTH_SECRET: $AUTH_SECRET"
    echo "   (Save this for future use!)"
fi

# Initialize MySQL if not already initialized
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo ""
    echo "📦 Initializing MySQL database..."
    mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
fi

# Start MySQL temporarily to run initialization
echo ""
echo "🔧 Starting MySQL for initialization..."
mysqld --user=mysql --datadir=/var/lib/mysql &
MYSQL_PID=$!

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to start..."
for i in {1..30}; do
    if mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "✅ MySQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MySQL failed to start"
        exit 1
    fi
    sleep 1
done

# Run database initialization
echo ""
echo "🗄️ Setting up database and user..."
mysql -u root <<-EOSQL
    CREATE DATABASE IF NOT EXISTS wrigs_fashion;
    CREATE USER IF NOT EXISTS 'wrigs_user'@'localhost' IDENTIFIED BY 'wrigs_password';
    CREATE USER IF NOT EXISTS 'wrigs_user'@'%' IDENTIFIED BY 'wrigs_password';
    GRANT ALL PRIVILEGES ON wrigs_fashion.* TO 'wrigs_user'@'localhost';
    GRANT ALL PRIVILEGES ON wrigs_fashion.* TO 'wrigs_user'@'%';
    FLUSH PRIVILEGES;
EOSQL

# Run any custom SQL initialization
if [ -f /docker-entrypoint-initdb.d/init.sql ]; then
    echo "📝 Running custom SQL initialization..."
    mysql -u wrigs_user -pwrigs_password wrigs_fashion < /docker-entrypoint-initdb.d/init.sql
fi

# Skip migrations on first boot - tables already exist from init.sql
# Migrations can be run manually if needed: docker exec wrigs-fashion /usr/local/bin/run-migrations.sh
echo ""
echo "✅ Database initialized (migrations skipped - run manually if needed)"

# Stop temporary MySQL
echo ""
echo "🛑 Stopping temporary MySQL..."
mysqladmin -u root shutdown 2>/dev/null || true
wait $MYSQL_PID 2>/dev/null || true

# Create log directory for supervisor
mkdir -p /var/log/supervisor

echo ""
echo "=========================================="
echo "✨ Starting services with supervisor..."
echo "🌐 App will be available at: https://localhost:443"
echo "🔒 Note: Using self-signed SSL certificate"
echo "   (Your browser will show a security warning)"
echo "=========================================="
echo ""

# Start supervisor to manage all services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
