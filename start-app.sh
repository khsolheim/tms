#!/bin/bash

# TMS System Startup Script
# Dette scriptet starter hele TMS-applikasjonen automatisk

set -e  # Stop ved feil

# Farger for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funksjoner for logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Sjekk om Docker er installert og kjører
check_docker() {
    log_info "Sjekker Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker er ikke installert. Vennligst installer Docker først."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker kjører ikke. Vennligst start Docker først."
        exit 1
    fi
    log_success "Docker er tilgjengelig"
}

# Sjekk Node.js versjon
check_node() {
    log_info "Sjekker Node.js versjon..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js er ikke installert. Vennligst installer Node.js 18+ først."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js versjon $NODE_VERSION er for gammel. Krever versjon 18+"
        exit 1
    fi
    log_success "Node.js versjon $(node -v) er kompatibel"
}

# Installer avhengigheter
install_dependencies() {
    log_info "Installerer alle avhengigheter..."
    
    # Installer root dependencies
    npm install
    
    # Installer workspace dependencies
    npm run install:all
    
    log_success "Alle avhengigheter er installert"
}

# Start databaser
start_databases() {
    log_info "Starter databaser med Docker Compose..."
    
    # Stopp eksisterende containere hvis de kjører
    docker-compose down 2>/dev/null || true
    
    # Start databaser
    docker-compose up -d
    
    # Vent på at databasene er klare
    log_info "Venter på at PostgreSQL er klar..."
    until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        sleep 2
    done
    
    log_info "Venter på at Redis er klar..."
    until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        sleep 2
    done
    
    log_success "Databaser er startet og klare"
}

# Generer Prisma klient og kjør migrasjoner
setup_database() {
    log_info "Setter opp database..."
    
    cd server
    
    # Generer Prisma klient
    log_info "Genererer Prisma klient..."
    npm run prisma:generate
    
    # Kjør migrasjoner
    log_info "Kjører database migrasjoner..."
    npm run prisma:migrate
    
    # Seed database
    log_info "Seeder database med initial data..."
    npm run prisma:seed
    
    cd ..
    
    log_success "Database er satt opp"
}

# Sjekk om porter er ledige
check_ports() {
    log_info "Sjekker om porter er ledige..."
    
    local ports=(3000 4000 5432 6379)
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Port $port er allerede i bruk"
        else
            log_success "Port $port er ledig"
        fi
    done
}

# Start applikasjonen
start_application() {
    log_info "Starter TMS-applikasjonen..."
    
    # Start applikasjonen i bakgrunnen
    nohup npm run dev > app.log 2>&1 &
    APP_PID=$!
    
    # Lagre PID for senere bruk
    echo $APP_PID > .app.pid
    
    log_success "Applikasjonen starter (PID: $APP_PID)"
    log_info "Loggfil: app.log"
    
    # Vent litt og sjekk status
    sleep 5
    
    if kill -0 $APP_PID 2>/dev/null; then
        log_success "Applikasjonen kjører!"
        log_info "Client: http://localhost:3000"
        log_info "Server: http://localhost:4000"
        log_info "API Docs: http://localhost:4000/api/v1/docs"
    else
        log_error "Applikasjonen startet ikke. Sjekk app.log for detaljer."
        exit 1
    fi
}

# Hovedfunksjon
main() {
    echo "=========================================="
    echo "    TMS System Startup Script"
    echo "=========================================="
    echo ""
    
    # Sjekk forutsetninger
    check_docker
    check_node
    check_ports
    
    # Installer avhengigheter
    install_dependencies
    
    # Start databaser
    start_databases
    
    # Sett opp database
    setup_database
    
    # Start applikasjonen
    start_application
    
    echo ""
    echo "=========================================="
    echo "    TMS System er startet!"
    echo "=========================================="
    echo ""
    echo "For å stoppe applikasjonen, kjør:"
    echo "  ./stop-app.sh"
    echo ""
    echo "For å se logger:"
    echo "  tail -f app.log"
    echo ""
}

# Håndter avbrudd
cleanup() {
    log_info "Stopper applikasjonen..."
    if [ -f .app.pid ]; then
        PID=$(cat .app.pid)
        kill $PID 2>/dev/null || true
        rm -f .app.pid
    fi
    log_success "Applikasjonen stoppet"
}

# Registrer cleanup funksjon
trap cleanup EXIT INT TERM

# Kjør hovedfunksjon
main "$@"