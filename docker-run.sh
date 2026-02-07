#!/bin/bash
# Quick start script for Wrigs Fashion Docker

set -e

echo "🎨 Wrigs Fashion - Docker Deployment"
echo "====================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Generate AUTH_SECRET if .env doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    AUTH_SECRET=$(openssl rand -hex 32)
    cat > .env <<EOL
# Wrigs Fashion Environment Variables
NODE_ENV=production
DATABASE_URL=mysql://wrigs_user:wrigs_password@localhost:3306/wrigs_fashion
PUBLIC_APP_URL=https://localhost
AUTH_SECRET=$AUTH_SECRET
EOL
    echo "✅ Created .env file with generated AUTH_SECRET"
fi

echo ""
echo "🔨 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting container..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "✅ Container is running!"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🌐 Access the app:"
echo "   https://localhost (HTTPS - will show security warning)"
echo "   http://localhost (HTTP - redirects to HTTPS)"
echo ""
echo "🛑 Stop the container:"
echo "   docker-compose down"
echo ""
echo "🗑️  Remove volumes (reset database):"
echo "   docker-compose down -v"
echo ""

# Follow logs
echo "📋 Following container logs (Ctrl+C to exit)..."
echo "=========================================="
docker-compose logs -f
