#!/bin/bash
# =============================================================================
# TMS Production Readiness Checker
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to log results
log_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

log_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((TOTAL_CHECKS++))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Header
echo -e "${BLUE}"
echo "=============================================="
echo "🔍 TMS PRODUCTION READINESS CHECK"
echo "=============================================="
echo -e "${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker
check_docker() {
    echo -e "\n${BLUE}📦 DOCKER & CONTAINERIZATION${NC}"
    
    if command_exists docker; then
        log_pass "Docker is installed"
        
        if docker info >/dev/null 2>&1; then
            log_pass "Docker is running"
            
            # Check Docker version
            DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null)
            if [ ! -z "$DOCKER_VERSION" ]; then
                log_pass "Docker version: $DOCKER_VERSION"
            fi
        else
            log_fail "Docker is not running"
        fi
    else
        log_fail "Docker is not installed"
    fi
    
    if command_exists docker-compose; then
        COMPOSE_VERSION=$(docker-compose version --short 2>/dev/null)
        log_pass "Docker Compose is installed: $COMPOSE_VERSION"
    else
        log_fail "Docker Compose is not installed"
    fi
}

# Function to check system resources
check_system_resources() {
    echo -e "\n${BLUE}💾 SYSTEM RESOURCES${NC}"
    
    # Check RAM
    TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [ "$TOTAL_RAM" -ge 8 ]; then
        log_pass "RAM: ${TOTAL_RAM}GB (Sufficient)"
    elif [ "$TOTAL_RAM" -ge 4 ]; then
        log_warning "RAM: ${TOTAL_RAM}GB (Minimum requirements, consider upgrading)"
    else
        log_fail "RAM: ${TOTAL_RAM}GB (Insufficient - minimum 4GB required)"
    fi
    
    # Check CPU cores
    CPU_CORES=$(nproc)
    if [ "$CPU_CORES" -ge 4 ]; then
        log_pass "CPU cores: $CPU_CORES (Sufficient)"
    elif [ "$CPU_CORES" -ge 2 ]; then
        log_warning "CPU cores: $CPU_CORES (Minimum requirements)"
    else
        log_fail "CPU cores: $CPU_CORES (Insufficient - minimum 2 cores required)"
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {printf "%.0f", $4/1048576}')
    if [ "$AVAILABLE_SPACE" -ge 50 ]; then
        log_pass "Disk space: ${AVAILABLE_SPACE}GB available (Sufficient)"
    elif [ "$AVAILABLE_SPACE" -ge 20 ]; then
        log_warning "Disk space: ${AVAILABLE_SPACE}GB available (Consider adding more space)"
    else
        log_fail "Disk space: ${AVAILABLE_SPACE}GB available (Insufficient - minimum 20GB required)"
    fi
}

# Function to check network
check_network() {
    echo -e "\n${BLUE}🌐 NETWORK CONNECTIVITY${NC}"
    
    if ping -c 1 google.com >/dev/null 2>&1; then
        log_pass "Internet connectivity"
    else
        log_fail "No internet connectivity"
    fi
    
    if command_exists curl; then
        log_pass "curl is installed"
    else
        log_fail "curl is not installed"
    fi
}

# Function to check environment files
check_environment_files() {
    echo -e "\n${BLUE}⚙️  ENVIRONMENT CONFIGURATION${NC}"
    
    if [ -f ".env.production" ]; then
        log_pass "Production environment file exists"
        
        # Check critical variables
        source .env.production 2>/dev/null || true
        
        if [ ! -z "$JWT_SECRET" ] && [ "$JWT_SECRET" != "CHANGE_ME" ]; then
            log_pass "JWT_SECRET is configured"
        else
            log_fail "JWT_SECRET is not properly configured"
        fi
        
        if [ ! -z "$DB_PASSWORD" ] && [ "$DB_PASSWORD" != "CHANGE_ME" ]; then
            log_pass "DB_PASSWORD is configured"
        else
            log_fail "DB_PASSWORD is not properly configured"
        fi
        
        if [ ! -z "$CORS_ORIGIN" ]; then
            log_pass "CORS_ORIGIN is configured"
        else
            log_fail "CORS_ORIGIN is not configured"
        fi
        
    else
        log_fail "Production environment file (.env.production) not found"
    fi
}

# Function to check project files
check_project_files() {
    echo -e "\n${BLUE}📁 PROJECT FILES${NC}"
    
    # Check Docker files
    if [ -f "docker-compose.production.yml" ]; then
        log_pass "Production Docker Compose file exists"
    else
        log_fail "Production Docker Compose file missing"
    fi
    
    if [ -f "client/Dockerfile.prod" ]; then
        log_pass "Client production Dockerfile exists"
    else
        log_fail "Client production Dockerfile missing"
    fi
    
    if [ -f "server/Dockerfile.prod" ]; then
        log_pass "Server production Dockerfile exists"
    else
        log_fail "Server production Dockerfile missing"
    fi
    
    # Check scripts
    if [ -f "scripts/deploy-production.sh" ] && [ -x "scripts/deploy-production.sh" ]; then
        log_pass "Deployment script exists and is executable"
    else
        log_fail "Deployment script missing or not executable"
    fi
    
    # Check nginx config
    if [ -f "client/nginx.prod.conf" ]; then
        log_pass "Production nginx configuration exists"
    else
        log_fail "Production nginx configuration missing"
    fi
}

# Function to check security
check_security() {
    echo -e "\n${BLUE}🔒 SECURITY CONFIGURATION${NC}"
    
    if command_exists openssl; then
        log_pass "OpenSSL is installed"
    else
        log_fail "OpenSSL is not installed"
    fi
    
    # Check firewall
    if command_exists ufw; then
        if ufw status | grep -q "Status: active"; then
            log_pass "Firewall (UFW) is active"
        else
            log_warning "Firewall (UFW) is installed but not active"
        fi
    else
        log_warning "UFW firewall not installed"
    fi
    
    # Check fail2ban
    if command_exists fail2ban-server; then
        if systemctl is-active --quiet fail2ban; then
            log_pass "Fail2ban is active"
        else
            log_warning "Fail2ban is installed but not active"
        fi
    else
        log_warning "Fail2ban not installed"
    fi
}

# Function to check monitoring
check_monitoring() {
    echo -e "\n${BLUE}📊 MONITORING & LOGGING${NC}"
    
    # Check if monitoring directories exist
    if [ -d "monitoring" ]; then
        log_pass "Monitoring configuration directory exists"
        
        if [ -f "monitoring/prometheus/prometheus.yml" ]; then
            log_pass "Prometheus configuration exists"
        else
            log_warning "Prometheus configuration missing"
        fi
        
        if [ -d "monitoring/grafana" ]; then
            log_pass "Grafana configuration exists"
        else
            log_warning "Grafana configuration missing"
        fi
    else
        log_warning "Monitoring configuration not found"
    fi
}

# Function to check database readiness
check_database() {
    echo -e "\n${BLUE}🗄️  DATABASE CONFIGURATION${NC}"
    
    if [ -f "server/prisma/schema.prisma" ]; then
        log_pass "Prisma schema exists"
    else
        log_fail "Prisma schema missing"
    fi
    
    if [ -d "server/prisma/migrations" ]; then
        MIGRATION_COUNT=$(find server/prisma/migrations -name "*.sql" | wc -l)
        log_pass "Database migrations exist ($MIGRATION_COUNT migration files)"
    else
        log_warning "No database migrations found"
    fi
}

# Function to check build readiness
check_build_readiness() {
    echo -e "\n${BLUE}🏗️  BUILD READINESS${NC}"
    
    # Check if we can build the client
    if [ -f "client/package.json" ]; then
        log_pass "Client package.json exists"
        
        cd client
        if npm list --depth=0 >/dev/null 2>&1; then
            log_pass "Client dependencies are installed"
        else
            log_warning "Client dependencies may need to be installed"
        fi
        cd ..
    else
        log_fail "Client package.json missing"
    fi
    
    # Check if we can build the server
    if [ -f "server/package.json" ]; then
        log_pass "Server package.json exists"
        
        cd server
        if npm list --depth=0 >/dev/null 2>&1; then
            log_pass "Server dependencies are installed"
        else
            log_warning "Server dependencies may need to be installed"
        fi
        
        # Check if TypeScript can compile
        if npx tsc --noEmit >/dev/null 2>&1; then
            log_pass "Server TypeScript compilation check passed"
        else
            log_warning "Server TypeScript compilation issues detected"
        fi
        cd ..
    else
        log_fail "Server package.json missing"
    fi
}

# Function to check documentation
check_documentation() {
    echo -e "\n${BLUE}📚 DOCUMENTATION${NC}"
    
    if [ -f "PRODUCTION_SETUP.md" ]; then
        log_pass "Production setup documentation exists"
    else
        log_warning "Production setup documentation missing"
    fi
    
    if [ -f "README.md" ]; then
        log_pass "Main README exists"
    else
        log_warning "Main README missing"
    fi
}

# Run all checks
main() {
    check_docker
    check_system_resources
    check_network
    check_environment_files
    check_project_files
    check_security
    check_monitoring
    check_database
    check_build_readiness
    check_documentation
    
    # Summary
    echo -e "\n${BLUE}📋 READINESS SUMMARY${NC}"
    echo "=============================================="
    echo -e "Total checks: $TOTAL_CHECKS"
    echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
    echo -e "${YELLOW}Warnings: $((TOTAL_CHECKS - PASSED_CHECKS - FAILED_CHECKS))${NC}"
    echo "=============================================="
    
    # Calculate readiness percentage
    READINESS_PERCENT=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 SYSTEM IS PRODUCTION READY! ($READINESS_PERCENT%)${NC}"
        echo -e "${GREEN}You can proceed with deployment using:${NC}"
        echo -e "${GREEN}./scripts/deploy-production.sh${NC}"
        exit 0
    elif [ $READINESS_PERCENT -ge 80 ]; then
        echo -e "\n${YELLOW}⚠️  SYSTEM IS MOSTLY READY ($READINESS_PERCENT%)${NC}"
        echo -e "${YELLOW}Please address the failed checks before deployment.${NC}"
        exit 1
    else
        echo -e "\n${RED}❌ SYSTEM IS NOT READY FOR PRODUCTION ($READINESS_PERCENT%)${NC}"
        echo -e "${RED}Please address the critical issues before proceeding.${NC}"
        exit 2
    fi
}

# Run the main function
main "$@" 