#!/bin/bash
# =============================================================================
# TMS VPS Deployment Script
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_USER="root"
VPS_HOST=""
VPS_PORT="22"
DEPLOY_DIR="/opt/tms"
REPO_URL=""
BRANCH="main"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if required variables are set
check_config() {
    if [ -z "$VPS_HOST" ]; then
        echo -e "${YELLOW}VPS_HOST is not set. Please provide VPS details:${NC}"
        read -p "VPS IP/Domain: " VPS_HOST
    fi
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${YELLOW}Repository URL not set. Detecting from git...${NC}"
        if [ -d ".git" ]; then
            REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
        fi
        
        if [ -z "$REPO_URL" ]; then
            read -p "Git repository URL: " REPO_URL
        fi
    fi
    
    info "VPS Host: $VPS_HOST"
    info "Repository: $REPO_URL"
    info "Deploy Directory: $DEPLOY_DIR"
}

# Test SSH connection
test_ssh() {
    log "Testing SSH connection to VPS..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'SSH connection successful'" 2>/dev/null; then
        log "✅ SSH connection successful"
    else
        error "❌ Cannot connect to VPS via SSH. Please check:
        - VPS IP/domain: $VPS_HOST
        - SSH key is configured
        - Port $VPS_PORT is open
        - User $VPS_USER exists"
    fi
}

# Prepare local repository
prepare_local() {
    log "Preparing local repository..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        error "Not in a git repository. Please run this script from the project root."
    fi
    
    # Stage all new production files
    log "Staging production files..."
    git add .gitignore
    git add .env.production.example
    git add docker-compose.production.yml
    git add client/Dockerfile.prod
    git add server/Dockerfile.prod
    git add client/nginx.prod.conf
    git add scripts/deploy-production.sh
    git add scripts/production-readiness-check.sh
    git add scripts/vps-deploy.sh
    git add server/scripts/startup.sh
    git add PRODUCTION_SETUP.md
    git add PRODUCTION_DEPLOYMENT_SUCCESS.md
    git add package.json
    
    # Commit production files
    log "Committing production configuration..."
    git commit -m "feat: Add production configuration and deployment scripts

- Docker production builds for client and server
- Production environment configuration
- Nginx production configuration with SSL/TLS
- Automated deployment scripts
- Production readiness checker
- Comprehensive documentation
- Zero-downtime deployment support" || warning "No new changes to commit"
    
    # Push to repository
    log "Pushing to repository..."
    git push origin $BRANCH || error "Failed to push to repository"
    
    log "✅ Local repository prepared and pushed"
}

# Setup VPS environment
setup_vps() {
    log "Setting up VPS environment..."
    
    # Create deployment script for VPS
    cat > /tmp/vps-setup.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Setting up TMS on VPS..."

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    nano \
    htop \
    ufw \
    fail2ban \
    postgresql \
    postgresql-contrib \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Setup firewall
echo "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup fail2ban
echo "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create deployment directory
mkdir -p /opt/tms
chown $USER:$USER /opt/tms

echo "✅ VPS setup completed"
EOF

    # Copy and execute setup script on VPS
    log "Uploading setup script to VPS..."
    scp -P $VPS_PORT /tmp/vps-setup.sh $VPS_USER@$VPS_HOST:/tmp/
    
    log "Executing setup script on VPS..."
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "chmod +x /tmp/vps-setup.sh && /tmp/vps-setup.sh"
    
    # Cleanup
    rm /tmp/vps-setup.sh
    
    log "✅ VPS environment setup completed"
}

# Deploy application to VPS
deploy_app() {
    log "Deploying application to VPS..."
    
    # Create deployment script
    cat > /tmp/app-deploy.sh << EOF
#!/bin/bash
set -e

echo "🚀 Deploying TMS application..."

# Navigate to deployment directory
cd $DEPLOY_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "Cloning repository..."
    git clone $REPO_URL .
    git checkout $BRANCH
fi

# Create production environment file
if [ ! -f ".env.production" ]; then
    echo "Creating production environment file..."
    cp .env.production.example .env.production
    echo "⚠️  IMPORTANT: Please edit .env.production with your actual configuration!"
    echo "   File location: $DEPLOY_DIR/.env.production"
fi

# Create required directories
mkdir -p nginx/ssl
mkdir -p docker-volumes/postgres
mkdir -p docker-volumes/redis
mkdir -p backups
mkdir -p logs

# Set permissions
chown -R $USER:$USER $DEPLOY_DIR
chmod +x scripts/*.sh

echo "✅ Application deployed successfully"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Edit $DEPLOY_DIR/.env.production with your configuration"
echo "2. Add SSL certificates to $DEPLOY_DIR/nginx/ssl/"
echo "3. Run: cd $DEPLOY_DIR && ./scripts/production-readiness-check.sh"
echo "4. Run: cd $DEPLOY_DIR && ./scripts/deploy-production.sh"
echo ""
EOF

    # Upload and execute deployment script
    log "Uploading deployment script to VPS..."
    scp -P $VPS_PORT /tmp/app-deploy.sh $VPS_USER@$VPS_HOST:/tmp/
    
    log "Executing deployment script on VPS..."
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "chmod +x /tmp/app-deploy.sh && /tmp/app-deploy.sh"
    
    # Cleanup
    rm /tmp/app-deploy.sh
    
    log "✅ Application deployment completed"
}

# Setup SSL certificates
setup_ssl() {
    info "Setting up SSL certificates..."
    
    echo -e "${YELLOW}SSL Certificate Setup:${NC}"
    echo "1. Manual certificate upload"
    echo "2. Let's Encrypt automatic"
    echo "3. Skip for now"
    read -p "Choose option (1-3): " ssl_option
    
    case $ssl_option in
        1)
            log "Manual certificate upload selected"
            echo "Please upload your certificates to the VPS:"
            echo "- Certificate: $DEPLOY_DIR/nginx/ssl/cert.crt"
            echo "- Private key: $DEPLOY_DIR/nginx/ssl/cert.key"
            echo "- CA bundle: $DEPLOY_DIR/nginx/ssl/ca-bundle.crt"
            ;;
        2)
            log "Setting up Let's Encrypt..."
            read -p "Enter your domain name: " domain
            
            ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
# Stop nginx if running
systemctl stop nginx 2>/dev/null || true

# Get Let's Encrypt certificate
certbot certonly --standalone -d $domain --agree-tos --no-eff-email

# Copy certificates to TMS directory
mkdir -p $DEPLOY_DIR/nginx/ssl
cp /etc/letsencrypt/live/$domain/fullchain.pem $DEPLOY_DIR/nginx/ssl/cert.crt
cp /etc/letsencrypt/live/$domain/privkey.pem $DEPLOY_DIR/nginx/ssl/cert.key

# Set permissions
chown -R $USER:$USER $DEPLOY_DIR/nginx/ssl
chmod 600 $DEPLOY_DIR/nginx/ssl/*
EOF
            log "✅ Let's Encrypt SSL certificates configured"
            ;;
        3)
            warning "SSL setup skipped. Remember to configure SSL before production use!"
            ;;
        *)
            warning "Invalid option. SSL setup skipped."
            ;;
    esac
}

# Main deployment function
main() {
    log "🚀 Starting TMS VPS Deployment"
    echo "=================================="
    
    # Configuration check
    check_config
    
    # Confirm deployment
    echo -e "\n${YELLOW}Deployment Configuration:${NC}"
    echo "VPS Host: $VPS_HOST"
    echo "VPS User: $VPS_USER"
    echo "Deploy Directory: $DEPLOY_DIR"
    echo "Repository: $REPO_URL"
    echo "Branch: $BRANCH"
    echo ""
    read -p "Continue with deployment? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        error "Deployment cancelled by user"
    fi
    
    # Start deployment
    log "Starting deployment process..."
    
    # Step 1: Test SSH connection
    test_ssh
    
    # Step 2: Prepare local repository
    prepare_local
    
    # Step 3: Setup VPS environment
    setup_vps
    
    # Step 4: Deploy application
    deploy_app
    
    # Step 5: Setup SSL certificates
    setup_ssl
    
    # Deployment complete
    log "🎉 TMS VPS Deployment Completed Successfully!"
    echo ""
    echo "=================================="
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo "=================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. SSH to your VPS: ssh $VPS_USER@$VPS_HOST"
    echo "2. Navigate to: cd $DEPLOY_DIR"
    echo "3. Edit environment: nano .env.production"
    echo "4. Check readiness: ./scripts/production-readiness-check.sh"
    echo "5. Deploy application: ./scripts/deploy-production.sh"
    echo ""
    echo "🌐 Your TMS system will be available at: https://$VPS_HOST"
    echo ""
    echo "📚 Documentation: $DEPLOY_DIR/PRODUCTION_SETUP.md"
    echo "🔧 Troubleshooting: Check logs with 'npm run docker:logs'"
    echo ""
    log "Deployment completed! 🚀"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "TMS VPS Deployment Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --vps-host HOST    VPS IP address or domain"
        echo "  --vps-user USER    VPS user (default: root)"
        echo "  --vps-port PORT    SSH port (default: 22)"
        echo "  --deploy-dir DIR   Deployment directory (default: /opt/tms)"
        echo "  --repo-url URL     Git repository URL"
        echo "  --branch BRANCH    Git branch (default: main)"
        echo "  --help, -h         Show this help message"
        echo ""
        echo "Example:"
        echo "  $0 --vps-host 192.168.1.100 --repo-url https://github.com/user/tms.git"
        exit 0
        ;;
    --vps-host)
        VPS_HOST="$2"
        shift 2
        ;;
    --vps-user)
        VPS_USER="$2"
        shift 2
        ;;
    --vps-port)
        VPS_PORT="$2"
        shift 2
        ;;
    --deploy-dir)
        DEPLOY_DIR="$2"
        shift 2
        ;;
    --repo-url)
        REPO_URL="$2"
        shift 2
        ;;
    --branch)
        BRANCH="$2"
        shift 2
        ;;
esac

# Run main function
main "$@" 