# Wrigs Fashion - Docker Deployment Guide

Complete guide for deploying Wrigs Fashion in a Docker container with HTTPS support.

## 🎯 Quick Start

The fastest way to get started:

```bash
./docker-run.sh
```

This script will:
1. Build the Docker image
2. Create an `.env` file with generated secrets
3. Start the container
4. Show you the logs

## 📦 What's Included

The Docker container includes:
- **SvelteKit App** (Node.js 18)
- **MySQL 8.0** (database)
- **Nginx** (HTTPS reverse proxy on port 443)
- **Supervisor** (process manager)
- **Self-signed SSL certificate** (for localhost HTTPS)

## 🚀 Manual Deployment

### 1. Build the Image

```bash
docker-compose build
```

### 2. Start the Container

```bash
docker-compose up -d
```

### 3. View Logs

```bash
docker-compose logs -f
```

### 4. Access the App

- **HTTPS:** https://localhost:443
- **HTTP:** http://localhost:80 (redirects to HTTPS)

**Note:** Your browser will show a security warning because we're using a self-signed SSL certificate. This is normal for localhost development. Click "Advanced" → "Proceed to localhost" to continue.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required
NODE_ENV=production
DATABASE_URL=mysql://wrigs_user:wrigs_password@localhost:3306/wrigs_fashion
PUBLIC_APP_URL=https://localhost
AUTH_SECRET=your_32_character_random_secret_key

# Optional
PORT=3000
```

**Generate AUTH_SECRET:**
```bash
openssl rand -hex 32
```

### Ports

- **443** - HTTPS (Nginx → SvelteKit)
- **80** - HTTP (redirects to HTTPS)
- **3306** - MySQL (internal only)

## 📁 Data Persistence

Docker volumes are used for persistent data:

```yaml
volumes:
  mysql-data:      # Database data
  uploads-data:    # User uploaded images
  pdfs-data:       # Generated paper doll PDFs
```

### Backup Data

```bash
# Backup database
docker exec wrigs-fashion mysqldump -u wrigs_user -pwrigs_password wrigs_fashion > backup.sql

# Backup uploads
docker cp wrigs-fashion:/app/static/uploads ./backup-uploads

# Backup PDFs
docker cp wrigs-fashion:/app/static/pdfs ./backup-pdfs
```

### Restore Data

```bash
# Restore database
docker exec -i wrigs-fashion mysql -u wrigs_user -pwrigs_password wrigs_fashion < backup.sql

# Restore uploads
docker cp ./backup-uploads/. wrigs-fashion:/app/static/uploads/

# Restore PDFs
docker cp ./backup-pdfs/. wrigs-fashion:/app/static/pdfs/
```

## 🔄 Database Migrations

Migrations run automatically on container start. To manually run migrations:

```bash
docker exec wrigs-fashion /usr/local/bin/run-migrations.sh
```

## 🛠️ Useful Commands

### Container Management

```bash
# Start container
docker-compose up -d

# Stop container
docker-compose down

# Restart container
docker-compose restart

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f wrigs-fashion
```

### Inside the Container

```bash
# Access container shell
docker exec -it wrigs-fashion bash

# Access MySQL
docker exec -it wrigs-fashion mysql -u wrigs_user -pwrigs_password wrigs_fashion

# Check running processes
docker exec wrigs-fashion supervisorctl status

# Restart a service
docker exec wrigs-fashion supervisorctl restart sveltekit
```

### Cleanup

```bash
# Stop and remove container
docker-compose down

# Remove container and volumes (DELETES ALL DATA!)
docker-compose down -v

# Remove image
docker rmi wrigs-fashion

# Clean up everything
docker system prune -a --volumes
```

## 🔍 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Check MySQL logs specifically
docker exec wrigs-fashion tail -f /var/log/supervisor/mysql.log

# Check app logs
docker exec wrigs-fashion tail -f /var/log/supervisor/sveltekit.log
```

### Port already in use

```bash
# Check what's using port 443
sudo lsof -ti:443

# Kill the process
sudo kill -9 $(sudo lsof -ti:443)

# Or change the port in docker-compose.yml
ports:
  - "8443:443"  # Use 8443 instead
```

### Database connection issues

```bash
# Check MySQL is running
docker exec wrigs-fashion supervisorctl status mysql

# Restart MySQL
docker exec wrigs-fashion supervisorctl restart mysql

# Check MySQL logs
docker exec wrigs-fashion tail -f /var/log/supervisor/mysql_error.log
```

### SSL certificate issues

The container uses a self-signed certificate. Your browser will show a warning. This is expected and safe for localhost development.

To proceed:
1. Click "Advanced" or "Show details"
2. Click "Proceed to localhost" or "Accept risk"

### Migrations not running

```bash
# Manually run migrations
docker exec wrigs-fashion /usr/local/bin/run-migrations.sh

# Check migration logs
docker exec wrigs-fashion cat /var/log/supervisor/sveltekit.log
```

## 📊 Health Checks

The container includes health checks:

```bash
# Check health status
docker ps

# View health check logs
docker inspect wrigs-fashion --format='{{json .State.Health}}' | jq
```

## 🔒 Security Notes

### For Production Deployment:

1. **Replace self-signed certificate** with real SSL certificate (Let's Encrypt)
2. **Change default MySQL password** in `docker-compose.yml` and `entrypoint.sh`
3. **Set strong AUTH_SECRET** (don't use generated one in production without saving it)
4. **Configure firewall** to only expose ports 80/443
5. **Enable MySQL external access** only if needed (currently internal only)
6. **Regular backups** of database and uploaded files
7. **Update base images** regularly for security patches

## 📈 Performance Tuning

### MySQL Configuration

Edit `/etc/mysql/my.cnf` inside the container:

```bash
docker exec -it wrigs-fashion bash
nano /etc/mysql/my.cnf
```

Add:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 64M
```

Restart MySQL:
```bash
supervisorctl restart mysql
```

### Node.js Memory

Edit `docker-compose.yml` to add:

```yaml
environment:
  - NODE_OPTIONS=--max-old-space-size=2048
```

## 🎨 Architecture

```
┌─────────────────────────────────────┐
│         Docker Container             │
│                                      │
│  ┌──────────┐      ┌─────────────┐ │
│  │  Nginx   │─────→│  SvelteKit  │ │
│  │ (SSL:443)│      │  (Node:3000)│ │
│  └──────────┘      └─────────────┘ │
│                           │          │
│                           ↓          │
│                    ┌────────────┐   │
│                    │   MySQL    │   │
│                    │  (Port     │   │
│                    │   3306)    │   │
│                    └────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │      Supervisor              │   │
│  │  (Process Manager)           │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 📝 Files Reference

- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Container orchestration
- `docker/nginx.conf` - Nginx reverse proxy config
- `docker/supervisord.conf` - Process management
- `docker/entrypoint.sh` - Container initialization
- `docker/init-db.sql` - Database initialization
- `docker/run-migrations.sh` - Migration runner
- `.dockerignore` - Build context exclusions

## 🚀 Next Steps

1. ✅ Build and run container
2. ✅ Access app at https://localhost
3. ✅ Register first user account
4. ✅ Create some designs and paper dolls
5. ✅ Create circles and share with friends!

For production deployment on Hostinger VPS or other servers, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md).

---

**Need help?** Check the [main documentation](CLAUDE.md) or [Phase 5 summary](PHASE5_IMPLEMENTATION_SUMMARY.md).
