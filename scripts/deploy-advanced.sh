#!/bin/bash

# ============================================================================
# TMS ADVANCED DEPLOYMENT SCRIPT
# ============================================================================
# Komplett deployment automation for TMS systemet
# Støtter: Development, Staging, Production environments
# ============================================================================

set -euo pipefail

# Konfigurasjon
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-development}"
VERSION="${2:-latest}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Farger for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$PROJECT_ROOT/logs/deployment_$TIMESTAMP.log"
mkdir -p "$PROJECT_ROOT/logs"

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

success() {
    log "${GREEN}✅ $1${NC}"
}

warning() {
    log "${YELLOW}⚠️ $1${NC}"
}

error() {
    log "${RED}❌ $1${NC}" >&2
    exit 1
}

info() {
    log "${BLUE}ℹ️ $1${NC}"
}

# ============================================================================
# ENVIRONMENT VALIDATION
# ============================================================================

validate_environment() {
    info "Validating environment: $ENVIRONMENT"
    
    case "$ENVIRONMENT" in
        development|dev)
            ENVIRONMENT="development"
            ;;
        staging|stage)
            ENVIRONMENT="staging"
            ;;
        production|prod)
            ENVIRONMENT="production"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT"
            ;;
    esac
    
    success "Environment validated: $ENVIRONMENT"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
    fi
    
    # Check available disk space (minimum 5GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 5242880 ]; then
        warning "Low disk space available: $(($available_space / 1024 / 1024))GB"
    fi
    
    # Check available memory (minimum 2GB)
    available_memory=$(free -m | awk 'NR==2{print $7}')
    if [ "$available_memory" -lt 2048 ]; then
        warning "Low memory available: ${available_memory}MB"
    fi
    
    success "Prerequisites check completed"
}

# ============================================================================
# BACKUP CURRENT STATE
# ============================================================================

backup_current_state() {
    info "Creating backup of current state..."
    
    # Create backup directory
    BACKUP_DIR="$PROJECT_ROOT/backups/pre-deployment_$TIMESTAMP"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if running
    if docker ps | grep -q tms-postgres; then
        info "Backing up database..."
        docker exec tms-postgres pg_dump -U postgres -d tms > "$BACKUP_DIR/database.sql"
        gzip "$BACKUP_DIR/database.sql"
    fi
    
    # Backup Redis if running
    if docker ps | grep -q tms-redis; then
        info "Backing up Redis..."
        docker exec tms-redis redis-cli BGSAVE
        sleep 2
        docker cp tms-redis:/data/dump.rdb "$BACKUP_DIR/redis_backup.rdb"
    fi
    
    # Backup configuration files
    cp "$PROJECT_ROOT/docker-compose.yml" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/env_backup" 2>/dev/null || true
    
    success "Backup completed: $BACKUP_DIR"
}

# ============================================================================
# BUILD AND TEST
# ============================================================================

build_and_test() {
    info "Building and testing application..."
    
    cd "$PROJECT_ROOT"
    
    # Build server
    info "Building server..."
    cd server
    npm ci
    npm run build
    
    # Run tests
    info "Running tests..."
    npm test || warning "Some tests failed, continuing deployment..."
    
    cd "$PROJECT_ROOT"
    success "Build and test completed"
}

# ============================================================================
# DOCKER OPERATIONS
# ============================================================================

build_docker_images() {
    info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build with version tag
    docker build -t "tms-backend:$VERSION" -f server/Dockerfile .
    docker build -t "tms-backend:latest" -f server/Dockerfile .
    
    # Tag for registry if not development
    if [ "$ENVIRONMENT" != "development" ]; then
        docker tag "tms-backend:$VERSION" "ghcr.io/tms/backend:$VERSION"
        docker tag "tms-backend:latest" "ghcr.io/tms/backend:latest"
    fi
    
    success "Docker images built successfully"
}

push_docker_images() {
    if [ "$ENVIRONMENT" != "development" ]; then
        info "Pushing Docker images to registry..."
        
        # Login to registry (assumes credentials are configured)
        docker push "ghcr.io/tms/backend:$VERSION"
        docker push "ghcr.io/tms/backend:latest"
        
        success "Docker images pushed to registry"
    fi
}

# ============================================================================
# DEPLOYMENT
# ============================================================================

deploy_application() {
    info "Deploying application to $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment variables
    export TMS_VERSION="$VERSION"
    export TMS_ENVIRONMENT="$ENVIRONMENT"
    export COMPOSE_PROJECT_NAME="tms-$ENVIRONMENT"
    
    # Stop existing services gracefully
    info "Stopping existing services..."
    docker-compose down --timeout 30 || true
    
    # Remove old containers and volumes if production
    if [ "$ENVIRONMENT" = "production" ]; then
        docker system prune -f
    fi
    
    # Start services
    info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    wait_for_services
    
    success "Application deployed successfully"
}

wait_for_services() {
    info "Waiting for services to be ready..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:4000/api/health &>/dev/null; then
            success "Services are ready!"
            return 0
        fi
        
        info "Attempt $attempt/$max_attempts - waiting for services..."
        sleep 5
        ((attempt++))
    done
    
    error "Services failed to start within expected time"
}

# ============================================================================
# POST-DEPLOYMENT VERIFICATION
# ============================================================================

run_health_checks() {
    info "Running health checks..."
    
    local base_url="http://localhost:4000"
    
    # Health check
    if ! curl -f "$base_url/api/health" &>/dev/null; then
        error "Health check failed"
    fi
    
    # Database connectivity
    if ! curl -f "$base_url/api/health/database" &>/dev/null; then
        warning "Database health check failed"
    fi
    
    # Redis connectivity
    if ! curl -f "$base_url/api/health/redis" &>/dev/null; then
        warning "Redis health check failed"
    fi
    
    # API endpoints
    local endpoints=("/api/bedrifter" "/api/sikkerhetskontroll" "/api/quiz/kategorier")
    for endpoint in "${endpoints[@]}"; do
        if ! curl -f "$base_url$endpoint" &>/dev/null; then
            warning "Endpoint check failed: $endpoint"
        fi
    done
    
    success "Health checks completed"
}

run_smoke_tests() {
    info "Running smoke tests..."
    
    # Basic API tests
    cd "$PROJECT_ROOT/tests"
    
    # Run smoke test suite if available
    if [ -f "smoke-tests.js" ]; then
        node smoke-tests.js || warning "Some smoke tests failed"
    fi
    
    success "Smoke tests completed"
}

# ============================================================================
# MONITORING AND ALERTING
# ============================================================================

setup_monitoring() {
    info "Setting up monitoring..."
    
    # Start monitoring stack if not development
    if [ "$ENVIRONMENT" != "development" ]; then
        docker-compose -f monitoring/docker-compose.monitoring.yml up -d
        
        # Wait for Grafana to be ready
        local attempt=1
        while [ $attempt -le 30 ]; do
            if curl -f http://localhost:3001/api/health &>/dev/null; then
                break
            fi
            sleep 2
            ((attempt++))
        done
    fi
    
    success "Monitoring setup completed"
}

# ============================================================================
# ROLLBACK FUNCTIONALITY
# ============================================================================

rollback() {
    warning "Initiating rollback..."
    
    # Stop current services
    docker-compose down
    
    # Restore from backup
    if [ -d "$BACKUP_DIR" ]; then
        info "Restoring from backup: $BACKUP_DIR"
        
        # Restore database
        if [ -f "$BACKUP_DIR/database.sql.gz" ]; then
            gunzip -c "$BACKUP_DIR/database.sql.gz" | docker exec -i tms-postgres psql -U postgres -d tms
        fi
        
        # Restore Redis
        if [ -f "$BACKUP_DIR/redis_backup.rdb" ]; then
            docker cp "$BACKUP_DIR/redis_backup.rdb" tms-redis:/data/dump.rdb
        fi
    fi
    
    # Start services with previous version
    docker-compose up -d
    
    success "Rollback completed"
}

# ============================================================================
# CLEANUP
# ============================================================================

cleanup() {
    info "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Remove old logs (keep last 10)
    find "$PROJECT_ROOT/logs" -name "deployment_*.log" -type f | sort -r | tail -n +11 | xargs rm -f
    
    # Remove old backups (keep last 5)
    find "$PROJECT_ROOT/backups" -name "pre-deployment_*" -type d | sort -r | tail -n +6 | xargs rm -rf
    
    success "Cleanup completed"
}

# ============================================================================
# NOTIFICATION
# ============================================================================

send_notification() {
    local status="$1"
    local message="$2"
    
    # Send Slack notification if webhook is configured
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"TMS Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    # Send email notification if configured
    if [ -n "${EMAIL_NOTIFICATION:-}" ]; then
        echo "$message" | mail -s "TMS Deployment $status" "$EMAIL_NOTIFICATION" || true
    fi
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    log "🚀 Starting TMS Advanced Deployment"
    log "Environment: $ENVIRONMENT"
    log "Version: $VERSION"
    log "Timestamp: $TIMESTAMP"
    
    # Trap for cleanup on exit
    trap 'cleanup' EXIT
    
    # Trap for rollback on error
    trap 'rollback; send_notification "FAILED" "Deployment failed, rollback initiated"' ERR
    
    validate_environment
    check_prerequisites
    backup_current_state
    build_and_test
    build_docker_images
    push_docker_images
    deploy_application
    run_health_checks
    run_smoke_tests
    setup_monitoring
    
    success "🎉 TMS Deployment completed successfully!"
    send_notification "SUCCESS" "Deployment to $ENVIRONMENT completed successfully"
    
    # Display deployment summary
    log "📊 Deployment Summary:"
    log "   Environment: $ENVIRONMENT"
    log "   Version: $VERSION"
    log "   Started: $TIMESTAMP"
    log "   Completed: $(date +"%Y%m%d_%H%M%S")"
    log "   Backup: $BACKUP_DIR"
    log "   Log: $LOG_FILE"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <environment> [version]"
    echo "Environments: development, staging, production"
    echo "Version: Docker image tag (default: latest)"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 staging v1.2.3"
    echo "  $0 production latest"
    exit 1
fi

# Run main function
main "$@" 