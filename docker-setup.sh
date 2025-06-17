#!/bin/bash

# TMS Docker Management Script
# Håndterer både hovedapp og mikrotjenester

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}🐳 TMS DOCKER MANAGEMENT SYSTEM${NC}"
    echo -e "${BLUE}Fullstendig containerisert applikasjon med mikrotjenester${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    print_header
    echo -e "${GREEN}HOVEDKOMMANDOER:${NC}"
    echo "  dev                    - Start development environment (client, admin, backend)"
    echo "  prod                   - Start production environment med monitoring"
    echo "  microservices         - Start mikrotjenester (3 tjenester)"
    echo "  microservices-medium  - Start medium mikrotjeneste-oppsett (6 tjenester)"
    echo "  microservices-full    - Start alle 28 mikrotjenester"
    echo "  all                   - Start både hovedapp og mikrotjenester"
    echo ""
    echo -e "${GREEN}ADMINISTRASJON:${NC}"
    echo "  stop [service]        - Stopp alle eller spesifikk tjeneste"
    echo "  restart [env]         - Restart development/production/microservices"
    echo "  status                - Vis status og ressursbruk"
    echo "  logs [service]        - Vis logger for tjeneste"
    echo "  clean                 - Stopp og fjern alle containers/volumes"
    echo ""
    echo -e "${GREEN}DATABASE:${NC}"
    echo "  migrate               - Kjør database migrasjoner"
    echo ""
    echo -e "${GREEN}TESTER:${NC}"
    echo "  health                - Sjekk health på alle tjenester"
    echo ""
    echo -e "${GREEN}EKSEMPLER:${NC}"
    echo "  $0 dev                - Start development environment"
    echo "  $0 microservices      - Start kun mikrotjenester"
    echo "  $0 all                - Start alt sammen"
    echo "  $0 logs api-gateway   - Vis API Gateway logger"
    echo "  $0 stop               - Stopp alt"
}

start_development() {
    print_status "Starter TMS Development Environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development environment startet!"
    echo -e "${BLUE}Tilgjengelig på:${NC}"
    echo "  🌐 Client:  http://localhost:3000"
    echo "  ⚙️  Admin:   http://localhost:3001" 
    echo "  🔧 Backend: http://localhost:4000"
}

start_production() {
    print_status "Starter TMS Production Environment..."
    docker-compose up -d
    print_success "Production environment startet!"
    echo -e "${BLUE}Tilgjengelig på:${NC}"
    echo "  🌐 Client:  http://localhost"
    echo "  ⚙️  Admin:   http://localhost:3001"
    echo "  🔧 Backend: http://localhost:4000"
    echo "  📊 Grafana: http://localhost:3300"
}

start_microservices() {
    print_status "Starter TMS Mikrotjenester (3 tjenester)..."
    docker-compose -f docker-compose.microservices-small.yml up -d
    print_success "Mikrotjenester startet!"
    echo -e "${BLUE}Tilgjengelige tjenester:${NC}"
    echo "  🚪 API Gateway:        http://localhost:8000"
    echo "  💰 Economy Service:    http://localhost:8006" 
    echo "  📱 Notification Service: http://localhost:8008"
}

start_microservices_medium() {
    print_status "Starter TMS Mikrotjenester (6 tjenester)..."
    if [ ! -f "docker-compose.microservices-medium.yml" ]; then
        print_error "docker-compose.microservices-medium.yml ikke funnet"
        return 1
    fi
    docker-compose -f docker-compose.microservices-medium.yml up -d
    print_success "Medium mikrotjeneste-oppsett startet!"
}

start_microservices_full() {
    print_status "Starter ALLE TMS Mikrotjenester (28 tjenester)..."
    print_warning "Dette krever mye ressurser og kan ta lang tid..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Alle mikrotjenester startet!"
}

start_all() {
    print_status "Starter KOMPLETT TMS System..."
    start_development
    sleep 5
    start_microservices
    print_success "Komplett TMS system startet!"
    echo -e "${GREEN}🎉 TMS er nå fullstendig operasjonelt!${NC}"
}

stop_services() {
    local service=$1
    if [ -z "$service" ]; then
        print_status "Stopper alle TMS tjenester..."
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        docker-compose -f docker-compose.microservices-small.yml down 2>/dev/null || true
        docker-compose -f docker-compose.microservices-medium.yml down 2>/dev/null || true
        docker-compose down 2>/dev/null || true
        print_success "Alle tjenester stoppet!"
    else
        print_status "Stopper $service..."
        docker-compose -f docker-compose.dev.yml stop "$service" 2>/dev/null || true
        docker-compose -f docker-compose.microservices-small.yml stop "$service" 2>/dev/null || true
        print_success "$service stoppet!"
    fi
}

show_status() {
    print_header
    echo -e "${GREEN}🐳 DOCKER CONTAINER STATUS${NC}"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | grep -E "(tms-|NAMES)" || echo "Ingen TMS containers kjører"
    
    echo -e "\n${GREEN}📊 RESOURCE USAGE${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -10
    
    echo -e "\n${GREEN}🏥 HEALTH STATUS${NC}"
    test_all_health
}

show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Specify service name. Available: client-dev, admin-dev, backend-dev, api-gateway, economy-service, notification-service"
        return 1
    fi
    
    print_status "Viser logger for $service..."
    # Try different compose files
    docker-compose -f docker-compose.dev.yml logs -f "$service" 2>/dev/null || \
    docker-compose -f docker-compose.microservices-small.yml logs -f "$service" 2>/dev/null || \
    docker-compose logs -f "$service" 2>/dev/null || \
    print_error "Kunne ikke finne service: $service"
}

clean_all() {
    print_warning "Dette vil fjerne ALLE TMS containers og volumes!"
    read -p "Er du sikker? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Rydder opp..."
        docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        docker-compose -f docker-compose.microservices-small.yml down -v 2>/dev/null || true
        docker-compose -f docker-compose.microservices-medium.yml down -v 2>/dev/null || true
        docker-compose down -v 2>/dev/null || true
        docker system prune -f
        print_success "Opprydding fullført!"
    else
        print_status "Avbrutt"
    fi
}

run_migrations() {
    print_status "Kjører database migrasjoner..."
    docker-compose -f docker-compose.dev.yml exec backend-dev npm run migrate 2>/dev/null || \
    docker-compose exec backend npm run migrate 2>/dev/null || \
    print_error "Kunne ikke kjøre migrasjoner - er backend oppe?"
}

test_all_health() {
    print_status "Tester health på alle tjenester..."
    
    # Test main app
    check_service_health "Client" "http://localhost:3000" || true
    check_service_health "Admin" "http://localhost:3001" || true  
    check_service_health "Backend" "http://localhost:4000/health" || true
    
    # Test microservices
    check_service_health "API Gateway" "http://localhost:8000/health" || true
    check_service_health "Economy Service" "http://localhost:8006/health" || true
    check_service_health "Notification Service" "http://localhost:8008/health" || true
}

check_service_health() {
    local name=$1
    local url=$2
    local response=$(curl -s "$url" 2>/dev/null)
    
    if [ $? -eq 0 ] && [[ $response == *"healthy"* || $response == *"<!DOCTYPE html>"* ]]; then
        echo -e "  ✅ $name: ${GREEN}Healthy${NC}"
        return 0
    else
        echo -e "  ❌ $name: ${RED}Unhealthy${NC}"
        return 1
    fi
}

restart_environment() {
    local env=$1
    case $env in
        dev|development)
            stop_services
            start_development
            ;;
        prod|production)
            stop_services  
            start_production
            ;;
        microservices)
            docker-compose -f docker-compose.microservices-small.yml down
            start_microservices
            ;;
        all)
            stop_services
            start_all
            ;;
        *)
            print_error "Ukjent environment: $env"
            echo "Tilgjengelige: dev, prod, microservices, all"
            ;;
    esac
}

# Main command handling
case "${1:-help}" in
    dev|development)
        start_development
        ;;
    prod|production)
        start_production
        ;;
    microservices)
        start_microservices
        ;;
    microservices-medium)
        start_microservices_medium
        ;;
    microservices-full)
        start_microservices_full
        ;;
    all)
        start_all
        ;;
    stop)
        stop_services $2
        ;;
    restart)
        restart_environment $2
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    clean)
        clean_all
        ;;
    migrate)
        run_migrations
        ;;
    health)
        test_all_health
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Ukjent kommando: $1"
        show_help
        exit 1
        ;;
esac 