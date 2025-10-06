#!/bin/bash
# =============================================================================
# TMS Server Systemd Service Installation Script
# =============================================================================

set -e

echo "🔧 Installing TMS Server as Systemd Service..."

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log "❌ Error: This script must be run as root"
        exit 1
    fi
}

# Function to check if systemd is available
check_systemd() {
    if ! command -v systemctl &> /dev/null; then
        log "❌ Error: systemd is not available on this system"
        exit 1
    fi
}

# Function to build the application
build_application() {
    log "🔨 Building TMS Server application..."
    
    cd /root/tms/server
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing npm dependencies..."
        npm install
    fi
    
    # Build TypeScript
    log "Building TypeScript..."
    npm run build
    
    log "✅ Application built successfully!"
}

# Function to create required directories
create_directories() {
    log "📁 Creating required directories..."
    
    mkdir -p /root/tms/server/logs
    mkdir -p /root/tms/server/uploads
    mkdir -p /root/tms/server/backups
    
    # Set proper permissions
    chmod 755 /root/tms/server/logs
    chmod 755 /root/tms/server/uploads
    chmod 755 /root/tms/server/backups
    
    log "✅ Directories created!"
}

# Function to install systemd service
install_service() {
    log "📦 Installing systemd service..."
    
    # Copy service file to systemd directory
    cp /root/tms/server/tms-server.service /etc/systemd/system/
    
    # Reload systemd daemon
    systemctl daemon-reload
    
    # Enable service to start on boot
    systemctl enable tms-server.service
    
    log "✅ Systemd service installed and enabled!"
}

# Function to setup environment file
setup_environment() {
    log "⚙️ Setting up environment configuration..."
    
    # Check if .env file exists
    if [ ! -f "/root/tms/server/.env" ]; then
        log "⚠️ Warning: .env file not found. Creating template..."
        cat > /root/tms/server/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/tms_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
NODE_ENV=production
PORT=4000

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Security Configuration
CORS_ORIGIN="http://91.108.121.251"
SESSION_SECRET="your-session-secret-here"

# Logging Configuration
LOG_LEVEL="info"
LOG_FILE="/root/tms/server/logs/app.log"
EOF
        
        log "⚠️ Please edit /root/tms/server/.env with your actual configuration values"
        log "⚠️ Then run: systemctl start tms-server.service"
    else
        log "✅ Environment file already exists"
    fi
}

# Function to setup firewall
setup_firewall() {
    log "🔥 Setting up firewall rules..."
    
    # Check if ufw is available
    if command -v ufw &> /dev/null; then
        # Allow HTTP and HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        # Allow custom port if different from 80/443
        ufw allow 4000/tcp
        log "✅ Firewall rules configured with ufw"
    elif command -v iptables &> /dev/null; then
        # Basic iptables rules
        iptables -A INPUT -p tcp --dport 80 -j ACCEPT
        iptables -A INPUT -p tcp --dport 443 -j ACCEPT
        iptables -A INPUT -p tcp --dport 4000 -j ACCEPT
        log "✅ Firewall rules configured with iptables"
    else
        log "⚠️ Warning: No firewall management tool found"
    fi
}

# Function to setup nginx reverse proxy (optional)
setup_nginx() {
    log "🌐 Setting up Nginx reverse proxy..."
    
    if command -v nginx &> /dev/null; then
        # Create nginx configuration
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
    
    # Increase upload size for file uploads
    client_max_body_size 50M;
}
EOF
        
        # Enable site
        ln -sf /etc/nginx/sites-available/tms-server /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        nginx -t
        
        # Reload nginx
        systemctl reload nginx
        
        log "✅ Nginx reverse proxy configured!"
    else
        log "⚠️ Warning: Nginx not found. Server will run directly on port 4000"
    fi
}

# Function to start the service
start_service() {
    log "🚀 Starting TMS Server service..."
    
    systemctl start tms-server.service
    
    # Check service status
    if systemctl is-active --quiet tms-server.service; then
        log "✅ TMS Server service started successfully!"
        log "📊 Service status:"
        systemctl status tms-server.service --no-pager -l
    else
        log "❌ Failed to start TMS Server service"
        log "📋 Service logs:"
        journalctl -u tms-server.service --no-pager -l -n 20
        exit 1
    fi
}

# Function to show useful commands
show_commands() {
    log "📋 Useful commands:"
    echo ""
    echo "  Service Management:"
    echo "    systemctl start tms-server.service    # Start service"
    echo "    systemctl stop tms-server.service     # Stop service"
    echo "    systemctl restart tms-server.service  # Restart service"
    echo "    systemctl status tms-server.service   # Check status"
    echo ""
    echo "  Logs:"
    echo "    journalctl -u tms-server.service -f   # Follow logs"
    echo "    journalctl -u tms-server.service -n 50 # Last 50 log entries"
    echo ""
    echo "  Configuration:"
    echo "    nano /root/tms/server/.env            # Edit environment"
    echo "    nano /etc/systemd/system/tms-server.service # Edit service"
    echo ""
    echo "  After editing configuration:"
    echo "    systemctl daemon-reload               # Reload systemd"
    echo "    systemctl restart tms-server.service  # Restart service"
    echo ""
}

# Main installation function
main() {
    log "🔄 Starting TMS Server installation..."
    
    # Check prerequisites
    check_root
    check_systemd
    
    # Build application
    build_application
    
    # Create directories
    create_directories
    
    # Setup environment
    setup_environment
    
    # Install service
    install_service
    
    # Setup firewall
    setup_firewall
    
    # Setup nginx (optional)
    setup_nginx
    
    # Start service
    start_service
    
    # Show useful commands
    show_commands
    
    log "🎉 TMS Server installation completed successfully!"
    log "🌐 Server should be available at: http://91.108.121.251"
}

# Run main function
main 