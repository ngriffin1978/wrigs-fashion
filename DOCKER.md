# Docker Deployment Guide

This guide covers running Wrigs Fashion with Docker for maximum portability.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)

## Quick Start (Development)

### 1. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and set your passwords (or use defaults for local dev):

```bash
DB_ROOT_PASSWORD=root
DB_PASSWORD=password
AUTH_SECRET=dev_secret_change_in_production
```

### 2. Start Development Environment

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts:
- **App container** on http://localhost:3000 (with hot reload)
- **MySQL container** on port 3306

### 3. Stop Development Environment

```bash
docker-compose -f docker-compose.dev.yml down
```

## Production Deployment

### 1. Set Production Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with **secure** values:

```bash
# Generate secure passwords
DB_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
AUTH_SECRET=$(openssl rand -base64 32)

# Add your Cloudflare R2 credentials
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret"
R2_BUCKET_NAME="wrigs-fashion-uploads"
R2_PUBLIC_URL="https://your-bucket.r2.dev"

# Your domain
PUBLIC_APP_URL="https://yourdomain.com"
```

### 2. Build and Start Production

```bash
docker-compose up -d --build
```

### 3. Check Logs

```bash
docker-compose logs -f app
```

### 4. Stop Production

```bash
docker-compose down
```

## Common Commands

### Development

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove containers + volumes (WARNING: deletes database)
docker-compose -f docker-compose.dev.yml down -v

# Access MySQL shell
docker-compose -f docker-compose.dev.yml exec db mysql -u wrigs_user -p wrigs_fashion
```

### Production

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f app
docker-compose logs -f db

# Restart app only
docker-compose restart app

# View running containers
docker ps

# Stop all
docker-compose down

# Backup database
docker-compose exec db mysqldump -u wrigs_user -p wrigs_fashion > backup.sql

# Restore database
docker-compose exec -T db mysql -u wrigs_user -p wrigs_fashion < backup.sql
```

## Deploying to VPS (Hostinger, DigitalOcean, etc.)

### 1. Prepare VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Upload Project

```bash
# Option A: Clone from Git
git clone https://github.com/yourusername/wrigs-fashion.git
cd wrigs-fashion

# Option B: Upload via SCP
scp -r wrigs-fashion user@your-vps-ip:~/
```

### 3. Configure Environment

```bash
cd wrigs-fashion
cp .env.example .env
nano .env  # Edit with your production credentials
```

### 4. Start Application

```bash
docker-compose up -d --build
```

### 5. Set Up Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/wrigs-fashion
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/wrigs-fashion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Install SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Architecture

```
┌─────────────────────────────────────────┐
│        Docker Host (VPS/Local)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  App Container                  │   │
│  │  - SvelteKit (Node.js)          │   │
│  │  - Port 3000                    │   │
│  │  - Hot reload (dev mode)        │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│  ┌────────────▼────────────────────┐   │
│  │  DB Container                   │   │
│  │  - MySQL 8.0                    │   │
│  │  - Port 3306 (internal)         │   │
│  │  - Volume: mysql-data           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
                │
                ▼
    ┌────────────────────┐
    │  Cloudflare R2     │
    │  (External)        │
    │  - Images          │
    │  - PDFs            │
    └────────────────────┘
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Or kill the process
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Database Connection Failed

```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Try recreating database
docker-compose down -v
docker-compose up -d
```

### App Won't Start

```bash
# Check app logs
docker-compose logs app

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Cannot Connect from Host

Make sure ports are properly exposed:

```bash
# Check if containers are running
docker ps

# Check port bindings
docker port wrigs-fashion-app
```

## Development Workflow

1. Make code changes in your editor
2. Changes auto-reload (hot module replacement)
3. View changes at http://localhost:3000
4. Database persists between restarts

## Benefits of Docker

✅ **Portability:** Same environment everywhere (local, VPS, cloud)
✅ **Isolation:** No conflicts with other projects
✅ **Easy Setup:** One command to start entire stack
✅ **Consistency:** Same Node.js, MySQL versions everywhere
✅ **Easy Deployment:** Build once, deploy anywhere
✅ **Easy Cleanup:** Remove everything with one command

## Next Steps

- Set up database migrations (Drizzle)
- Add Cloudflare R2 storage integration
- Implement authentication (Lucia Auth)
- Add image processing (Jimp)
- Implement PDF generation (pdfmake)
