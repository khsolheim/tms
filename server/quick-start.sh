#!/bin/bash
# =============================================================================
# TMS Server Quick Start Script for VPS
# =============================================================================

echo "🚀 TMS Server Quick Start for VPS"
echo "=================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Error: This script must be run as root"
    echo "   Run: sudo bash quick-start.sh"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y nodejs npm postgresql postgresql-contrib redis-server nginx curl wget git

# Start and enable services
echo "🔄 Starting and enabling services..."
systemctl start postgresql
systemctl enable postgresql
systemctl start redis-server
systemctl enable redis-server
systemctl start nginx
systemctl enable nginx

# Create database and user
echo "🗄️ Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE tms_db;"
sudo -u postgres psql -c "CREATE USER tms_user WITH PASSWORD 'tms_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tms_db TO tms_user;"

# Navigate to server directory
cd /root/tms/server

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Create .env file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://tms_user:tms_password@localhost:5432/tms_db"

# JWT Configuration
JWT_SECRET="$(openssl rand -base64 32)"

# Server Configuration
NODE_ENV=production
PORT=4000

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Security Configuration
CORS_ORIGIN="http://91.108.121.251"
SESSION_SECRET="$(openssl rand -base64 32)"

# Logging Configuration
LOG_LEVEL="info"
LOG_FILE="/root/tms/server/logs/app.log"
EOF

# Create directories
mkdir -p logs uploads backups

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Install systemd service
echo "📦 Installing systemd service..."
cp tms-server.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable tms-server.service

# Configure nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/tms-server << EOF
server {
    listen 80;
    server_name 91.108.121.251;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    client_max_body_size 50M;
}
EOF

ln -sf /etc/nginx/sites-available/tms-server /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Start TMS server
echo "🚀 Starting TMS Server..."
systemctl start tms-server.service

# Check status
echo "📊 Checking service status..."
sleep 5
systemctl status tms-server.service --no-pager -l

echo ""
echo "🎉 TMS Server installation completed!"
echo "🌐 Server should be available at: http://91.108.121.251"
echo ""
echo "📋 Useful commands:"
echo "  systemctl status tms-server.service   # Check status"
echo "  journalctl -u tms-server.service -f   # Follow logs"
echo "  systemctl restart tms-server.service  # Restart service"
echo "" 