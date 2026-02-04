#!/bin/bash

# Helper script for Docker development commands

case "$1" in
  start)
    echo "🚀 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up
    ;;
  stop)
    echo "🛑 Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    ;;
  restart)
    echo "🔄 Restarting development environment..."
    docker-compose -f docker-compose.dev.yml restart
    ;;
  rebuild)
    echo "🔨 Rebuilding containers..."
    docker-compose -f docker-compose.dev.yml up --build
    ;;
  logs)
    echo "📋 Showing logs..."
    docker-compose -f docker-compose.dev.yml logs -f
    ;;
  mysql)
    echo "🗄️  Connecting to MySQL..."
    docker-compose -f docker-compose.dev.yml exec db mysql -u wrigs_user -p wrigs_fashion
    ;;
  clean)
    echo "🧹 Cleaning up (WARNING: This will delete the database)..."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose -f docker-compose.dev.yml down -v
      echo "✅ Cleaned up!"
    fi
    ;;
  *)
    echo "Wrigs Fashion - Docker Development Helper"
    echo ""
    echo "Usage: ./scripts/docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start    - Start development environment"
    echo "  stop     - Stop development environment"
    echo "  restart  - Restart containers"
    echo "  rebuild  - Rebuild and restart containers"
    echo "  logs     - Show application logs"
    echo "  mysql    - Connect to MySQL shell"
    echo "  clean    - Remove containers and volumes (deletes database)"
    echo ""
    ;;
esac
