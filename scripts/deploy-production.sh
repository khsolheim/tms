#!/bin/bash
# =============================================================================
# TMS Production Deployment Script
# =============================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/opt/tms/backups"
DEPLOYMENT_DATE=$(date '+%Y%m%d_%H%M%S')

# Function to log with colors
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed."
        exit 1
    fi
    
    # Check if required environment file exists
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        error "Production environment file (.env.production) not found."
        error "Please create it based on .env.production template."
        exit 1
    fi
    
    # Check available disk space (minimum 10GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 10485760 ]; then
        warning "Less than 10GB disk space available. Deployment may fail."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log "✅ Prerequisites check passed!"
}

# Function to create required directories
create_directories() {
    log "Creating required directories..."
    
    sudo mkdir -p /opt/tms/{data/{postgres,redis,prometheus,grafana,alertmanager,uploads},logs,backups}
    sudo mkdir -p /opt/tms/ssl
    
    # Set proper permissions
    sudo chown -R 1001:1001 /opt/tms/data
    sudo chown -R $(whoami):$(whoami) /opt/tms/logs /opt/tms/backups
    
    log "✅ Directories created!"
}

# Function to validate environment variables
validate_environment() {
    log "Validating production environment..."
    
    # Source the production environment file
    set -a
    source "$PROJECT_ROOT/.env.production"
    set +a
    
    # Check critical variables
    critical_vars=(
        "JWT_SECRET"
        "DB_PASSWORD"
        "REDIS_PASSWORD"
        "CORS_ORIGIN"
    )
    
    for var in "${critical_vars[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" = "CHANGE_ME"* ]; then
            error "Critical environment variable $var is not properly set in .env.production"
            exit 1
        fi
    done
    
    log "✅ Environment validation passed!"
}

# Function to backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    if [ -d "/opt/tms/data/postgres" ]; then
        # Create backup directory
        backup_path="$BACKUP_DIR/deployment_backup_$DEPLOYMENT_DATE"
        sudo mkdir -p "$backup_path"
        
        # Backup database
        log "Backing up database..."
        docker exec tms-postgres-prod pg_dump -U tms_prod_user tms_production | gzip > "$backup_path/database_backup.sql.gz"
        
        # Backup uploads
        if [ -d "/opt/tms/data/uploads" ]; then
            log "Backing up uploads..."
            sudo tar -czf "$backup_path/uploads_backup.tar.gz" -C /opt/tms/data uploads
        fi
        
        log "✅ Backup created at $backup_path"
    else
        log "No existing deployment found. Skipping backup."
    fi
}

# Function to generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    log "Checking SSL certificates..."
    
    if [ ! -f "/opt/tms/ssl/cert.pem" ]; then
        warning "SSL certificates not found. Generating self-signed certificates..."
        warning "For production, replace these with proper SSL certificates from a CA."
        
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /opt/tms/ssl/private.key \
            -out /opt/tms/ssl/cert.pem \
            -subj "/C=NO/ST=Oslo/L=Oslo/O=TMS/CN=yourdomain.com"
        
        log "✅ Self-signed SSL certificates generated!"
    else
        log "✅ SSL certificates found!"
    fi
}

# Function to build and deploy containers
deploy_containers() {
    log "Building and deploying containers..."
    
    cd "$PROJECT_ROOT"
    
    # Copy production environment file
    cp .env.production .env
    
    # Build and start containers
    docker-compose -f docker-compose.production.yml down --remove-orphans
    docker-compose -f docker-compose.production.yml build --no-cache
    docker-compose -f docker-compose.production.yml up -d
    
    log "✅ Containers deployed!"
}

# Function to wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    # Wait for database
    log "Waiting for database..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if docker exec tms-postgres-prod pg_isready -U tms_prod_user -d tms_production >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        error "Database failed to start within 2 minutes"
        exit 1
    fi
    
    # Wait for backend
    log "Waiting for backend API..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:4000/health >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        error "Backend API failed to start within 2 minutes"
        exit 1
    fi
    
    log "✅ All services are ready!"
}

# Function to run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    # Test database connection
    if ! docker exec tms-postgres-prod psql -U tms_prod_user -d tms_production -c "SELECT 1;" >/dev/null 2>&1; then
        error "Database smoke test failed"
        exit 1
    fi
    
    # Test Redis connection
    if ! docker exec tms-redis-prod redis-cli ping >/dev/null 2>&1; then
        error "Redis smoke test failed"
        exit 1
    fi
    
    # Test API endpoints
    if ! curl -f http://localhost:4000/health >/dev/null 2>&1; then
        error "API health check failed"
        exit 1
    fi
    
    # Test frontend
    if ! curl -f http://localhost/health >/dev/null 2>&1; then
        error "Frontend health check failed"
        exit 1
    fi
    
    log "✅ All smoke tests passed!"
}

# Function to show deployment summary
show_deployment_summary() {
    echo ""
    echo "=============================================="
    echo "🚀 TMS PRODUCTION DEPLOYMENT COMPLETED! ✅"
    echo "=============================================="
    echo ""
    echo "📊 Deployment Information:"
    echo "  • Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "  • Environment: Production"
    echo "  • Docker Compose: docker-compose.production.yml"
    echo ""
    echo "🌐 Access Points:"
    echo "  • Frontend: https://localhost"
    echo "  • API: https://localhost/api"
    echo "  • Grafana: http://localhost:3000"
    echo "  • Prometheus: http://localhost:9090"
    echo ""
    echo "📋 Container Status:"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Update DNS records to point to your server"
    echo "  2. Replace self-signed SSL certificates with proper ones"
    echo "  3. Configure monitoring alerts"
    echo "  4. Set up automated backups"
    echo "  5. Review security settings"
    echo ""
    echo "📖 View logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "🔄 Restart: docker-compose -f docker-compose.production.yml restart"
    echo "🛑 Stop: docker-compose -f docker-compose.production.yml down"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        error "Deployment failed!"
        log "Checking container status..."
        docker-compose -f docker-compose.production.yml ps
        log "View logs with: docker-compose -f docker-compose.production.yml logs"
    fi
}

# Main deployment function
main() {
    log "🚀 Starting TMS Production Deployment..."
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Run deployment steps
    check_prerequisites
    create_directories
    validate_environment
    backup_current_deployment
    generate_ssl_certificates
    deploy_containers
    wait_for_services
    run_smoke_tests
    show_deployment_summary
    
    log "🎉 Deployment completed successfully!"
}

# Run main function
main "$@" 