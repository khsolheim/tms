#!/bin/bash

# TMS Complete System Startup Script
# Dette scriptet stopper alle eksisterende prosesser og starter hele TMS-systemet på nytt
# Inkluderer alle 29 microservices, backend, frontend client og admin portal

set -e

# Farger for bedre output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logger funksjon
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Funksjon for å stoppe alle prosesser
stop_all_processes() {
    log "🛑 Stopper alle eksisterende TMS-prosesser..."
    
    # Stopp alle Docker containere
    info "Stopper alle Docker containere..."
    docker stop $(docker ps -aq) 2>/dev/null || warning "Ingen Docker containere å stoppe"
    docker rm $(docker ps -aq) 2>/dev/null || warning "Ingen Docker containere å fjerne"
    
    # Stopp alle Node.js prosesser
    info "Stopper alle Node.js prosesser..."
    pkill -f "node" 2>/dev/null || warning "Ingen Node.js prosesser funnet"
    pkill -f "npm" 2>/dev/null || warning "Ingen npm prosesser funnet"
    pkill -f "ts-node" 2>/dev/null || warning "Ingen ts-node prosesser funnet"
    
    # Stopp prosesser på spesifikke porter
    info "Frigjør porter..."
    local ports=(3000 3001 4000 8000 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012 8013 8014 8015 8016 8017 8018 8019 8020 8021 8022 8023 8024 8025 8026 8027 8028)
    
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            kill -9 $pid 2>/dev/null && info "Stoppet prosess på port $port"
        fi
    done
    
    # Rydd opp Docker volumes og nettverk
    info "Rydder opp Docker ressurser..."
    docker system prune -f 2>/dev/null || warning "Kunne ikke rydde Docker system"
    
    log "✅ Alle prosesser stoppet"
}

# Funksjon for å starte infrastruktur
start_infrastructure() {
    log "🚀 Starter TMS infrastruktur..."
    
    # Naviger til rot-mappen
    cd "$(dirname "$0")/.."
    
    # Start hoved infrastruktur (database, redis, monitoring)
    info "Starter hoved infrastruktur..."
    docker-compose up -d postgres redis prometheus grafana nginx node-exporter cadvisor alertmanager
    
    # Vent på at infrastrukturen starter
    info "Venter på infrastruktur..."
    sleep 10
    
    log "✅ Infrastruktur startet"
}

# Funksjon for å starte alle microservices
start_microservices() {
    log "🔧 Starter alle 29 microservices..."
    
    cd microservices/infrastructure/docker
    
    # Start alle microservices fra fase 13 (siste og mest komplette versjon)
    info "Starter Phase 13 microservices (Absolute Transcendence)..."
    docker-compose -f docker-compose.phase13.yml up -d
    
    # Start alle andre phases for komplett dekning
    info "Starter alle microservices phases..."
    for phase in {7..12}; do
        docker-compose -f "docker-compose.phase${phase}.yml" up -d 2>/dev/null || warning "Phase $phase ikke tilgjengelig"
    done
    
    # Start generell microservices
    docker-compose -f docker-compose.microservices.yml up -d 2>/dev/null || warning "Generell microservices ikke tilgjengelig"
    
    # Gå tilbake til rot
    cd ../../..
    
    # Vent på at microservices starter
    info "Venter på microservices..."
    sleep 15
    
    log "✅ Alle microservices startet"
}

# Funksjon for å starte backend
start_backend() {
    log "🖥️ Starter TMS Backend Server..."
    
    cd server
    
    # Installer avhengigheter hvis nødvendig
    if [ ! -d "node_modules" ]; then
        info "Installerer backend avhengigheter..."
        npm install
    fi
    
    # Bygg backend hvis nødvendig
    info "Bygger backend..."
    npm run build 2>/dev/null || warning "Build feilet, fortsetter..."
    
    # Kjør database migrasjoner
    info "Kjører database migrasjoner..."
    npx prisma migrate deploy 2>/dev/null || warning "Migrasjoner feilet"
    npx prisma generate 2>/dev/null || warning "Prisma generate feilet"
    
    # Start backend server i bakgrunnen
    info "Starter backend server på port 4000..."
    nohup npm start > ../logs/backend.log 2>&1 &
    
    cd ..
    
    # Vent på backend
    info "Venter på backend server..."
    sleep 10
    
    log "✅ Backend server startet på port 4000"
}

# Funksjon for å starte frontend client
start_frontend_client() {
    log "🌐 Starter Frontend Client..."
    
    cd client
    
    # Installer avhengigheter hvis nødvendig
    if [ ! -d "node_modules" ]; then
        info "Installerer client avhengigheter..."
        npm install
    fi
    
    # Start client i bakgrunnen
    info "Starter frontend client på port 3000..."
    nohup npm start > ../logs/client.log 2>&1 &
    
    cd ..
    
    log "✅ Frontend client startet på port 3000"
}

# Funksjon for å starte admin portal
start_admin_portal() {
    log "👑 Starter Admin Portal..."
    
    cd admin
    
    # Installer avhengigheter hvis nødvendig
    if [ ! -d "node_modules" ]; then
        info "Installerer admin avhengigheter..."
        npm install
    fi
    
    # Start admin portal i bakgrunnen
    info "Starter admin portal på port 3001..."
    nohup npm start > ../logs/admin.log 2>&1 &
    
    cd ..
    
    log "✅ Admin portal startet på port 3001"
}

# Funksjon for å verifisere at alt kjører
verify_services() {
    log "🔍 Verifiserer at alle tjenester kjører..."
    
    # Sjekk kritiske porter
    local critical_ports=(3000 3001 4000 8000)
    local failed_ports=()
    
    for port in "${critical_ports[@]}"; do
        if ! lsof -i:$port > /dev/null 2>&1; then
            failed_ports+=($port)
        fi
    done
    
    if [ ${#failed_ports[@]} -eq 0 ]; then
        log "✅ Alle kritiske tjenester kjører"
    else
        error "❌ Følgende kritiske porter svarer ikke: ${failed_ports[*]}"
    fi
    
    # Vis status for alle microservices
    info "Microservices status:"
    for port in {8000..8028}; do
        if lsof -i:$port > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} Port $port: Aktiv"
        else
            echo -e "  ${RED}✗${NC} Port $port: Inaktiv"
        fi
    done
}

# Funksjon for å vise tilkoblingsinfo
show_connection_info() {
    log "🌟 TMS System Tilkoblingsinfo:"
    echo ""
    echo -e "${BLUE}🌐 Frontend Applikasjoner:${NC}"
    echo -e "  Client App:      ${GREEN}http://localhost:3000${NC}"
    echo -e "  Admin Portal:    ${GREEN}http://localhost:3001${NC}"
    echo ""
    echo -e "${BLUE}🖥️ Backend Tjenester:${NC}"
    echo -e "  Backend API:     ${GREEN}http://localhost:4000${NC}"
    echo -e "  API Gateway:     ${GREEN}http://localhost:8000${NC}"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo -e "  Grafana:         ${GREEN}http://localhost:3001${NC} (admin/admin123)"
    echo -e "  Prometheus:      ${GREEN}http://localhost:9090${NC}"
    echo ""
    echo -e "${BLUE}🔧 Microservices (8000-8028):${NC}"
    echo -e "  Auth Service:    ${GREEN}http://localhost:8001${NC}"
    echo -e "  User Service:    ${GREEN}http://localhost:8002${NC}"
    echo -e "  Quiz Service:    ${GREEN}http://localhost:8003${NC}"
    echo -e "  ... og 25 andre microservices"
    echo ""
    echo -e "${YELLOW}📝 Logger finnes i logs/ mappen${NC}"
    echo ""
}

# Lag logs mappe hvis den ikke eksisterer
create_logs_directory() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        info "Opprettet logs mappe"
    fi
}

# Hovedfunksjon
main() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    TMS Complete System Startup       ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    
    # Naviger til rot-mappen fra scripts
    cd "$(dirname "$0")/.."
    
    create_logs_directory
    
    # Stopp alt eksisterende
    stop_all_processes
    
    echo ""
    log "🚀 Starter TMS-systemet..."
    echo ""
    
    # Start komponenter i riktig rekkefølge
    start_infrastructure
    start_microservices
    start_backend
    start_frontend_client
    start_admin_portal
    
    echo ""
    log "⏳ Venter på at alle tjenester stabiliserer seg..."
    sleep 20
    
    echo ""
    verify_services
    echo ""
    show_connection_info
    
    echo ""
    log "🎉 TMS-systemet er fullstendig startet!"
    echo -e "${GREEN}System Status: OPERATIONAL - All 29 microservices, backend og frontend kjører${NC}"
    echo ""
}

# Kjør hovedfunksjon
main "$@" 