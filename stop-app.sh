#!/bin/bash

# TMS System Stop Script
# Dette scriptet stopper hele TMS-applikasjonen

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

# Stopp applikasjonen
stop_application() {
    log_info "Stopper TMS-applikasjonen..."
    
    if [ -f .app.pid ]; then
        PID=$(cat .app.pid)
        if kill -0 $PID 2>/dev/null; then
            log_info "Stopper prosess $PID..."
            kill $PID
            
            # Vent på at prosessen stopper
            for i in {1..10}; do
                if ! kill -0 $PID 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            
            # Force kill hvis nødvendig
            if kill -0 $PID 2>/dev/null; then
                log_warning "Prosess stopper ikke, force killing..."
                kill -9 $PID
            fi
            
            rm -f .app.pid
            log_success "Applikasjonen stoppet"
        else
            log_warning "Prosess $PID kjører ikke"
            rm -f .app.pid
        fi
    else
        log_warning "Ingen applikasjon kjører (ingen .app.pid fil funnet)"
    fi
}

# Stopp databaser
stop_databases() {
    log_info "Stopper databaser..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose down
        log_success "Databaser stoppet"
    else
        log_warning "Docker Compose ikke funnet"
    fi
}

# Rydd opp loggfiler
cleanup_logs() {
    log_info "Rydder opp loggfiler..."
    
    if [ -f app.log ]; then
        mv app.log "app.log.$(date +%Y%m%d_%H%M%S)"
        log_success "Loggfil arkivert"
    fi
}

# Hovedfunksjon
main() {
    echo "=========================================="
    echo "    TMS System Stop Script"
    echo "=========================================="
    echo ""
    
    stop_application
    stop_databases
    cleanup_logs
    
    echo ""
    echo "=========================================="
    echo "    TMS System er stoppet!"
    echo "=========================================="
    echo ""
    echo "For å starte igjen, kjør:"
    echo "  ./start-app.sh"
    echo ""
}

# Kjør hovedfunksjon
main "$@"