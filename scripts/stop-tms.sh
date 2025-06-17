#!/bin/bash

# TMS Complete System Stop Script
# Dette scriptet stopper alle TMS-prosesser helt

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

# Hovedfunksjon for å stoppe alt
stop_all_processes() {
    log "🛑 Stopper hele TMS-systemet..."
    echo ""
    
    # Stopp alle Docker containere
    info "Stopper alle Docker containere..."
    if [ $(docker ps -aq | wc -l) -gt 0 ]; then
        docker stop $(docker ps -aq) 2>/dev/null && info "Docker containere stoppet"
        docker rm $(docker ps -aq) 2>/dev/null && info "Docker containere fjernet"
    else
        warning "Ingen Docker containere å stoppe"
    fi
    
    # Stopp alle Node.js prosesser
    info "Stopper alle Node.js prosesser..."
    if pgrep -f "node" > /dev/null 2>&1; then
        pkill -f "node" && info "Node.js prosesser stoppet"
    else
        warning "Ingen Node.js prosesser funnet"
    fi
    
    if pgrep -f "npm" > /dev/null 2>&1; then
        pkill -f "npm" && info "npm prosesser stoppet"
    else
        warning "Ingen npm prosesser funnet"
    fi
    
    if pgrep -f "ts-node" > /dev/null 2>&1; then
        pkill -f "ts-node" && info "ts-node prosesser stoppet"
    else
        warning "Ingen ts-node prosesser funnet"
    fi
    
    # Stopp prosesser på spesifikke porter
    info "Frigjør alle TMS-porter..."
    local ports=(3000 3001 4000 8000 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012 8013 8014 8015 8016 8017 8018 8019 8020 8021 8022 8023 8024 8025 8026 8027 8028 5432 6379 9090 9093)
    local stopped_ports=()
    
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            kill -9 $pid 2>/dev/null && stopped_ports+=($port)
        fi
    done
    
    if [ ${#stopped_ports[@]} -gt 0 ]; then
        info "Stoppet prosesser på porter: ${stopped_ports[*]}"
    else
        warning "Ingen prosesser funnet på TMS-porter"
    fi
    
    # Rydd opp Docker ressurser
    info "Rydder opp Docker ressurser..."
    docker system prune -f 2>/dev/null && info "Docker system ryddet"
    
    # Fjern Docker volumes (valgfritt - kommenter ut hvis du vil beholde data)
    # warning "Fjerner Docker volumes (alle data vil gå tapt)..."
    # docker volume prune -f 2>/dev/null && info "Docker volumes fjernet"
    
    echo ""
    log "✅ Hele TMS-systemet er stoppet"
    echo ""
}

# Funksjon for å verifisere at alt er stoppet
verify_stopped() {
    log "🔍 Verifiserer at alle tjenester er stoppet..."
    
    # Sjekk kritiske porter
    local critical_ports=(3000 3001 4000 8000 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012 8013 8014 8015 8016 8017 8018 8019 8020 8021 8022 8023 8024 8025 8026 8027 8028)
    local active_ports=()
    
    for port in "${critical_ports[@]}"; do
        if lsof -i:$port > /dev/null 2>&1; then
            active_ports+=($port)
        fi
    done
    
    if [ ${#active_ports[@]} -eq 0 ]; then
        log "✅ Alle TMS-tjenester er stoppet"
    else
        error "❌ Følgende porter er fortsatt aktive: ${active_ports[*]}"
        warning "Prøv å stoppe dem manuelt eller restart systemet"
    fi
    
    # Sjekk Docker containere
    local running_containers=$(docker ps -q 2>/dev/null | wc -l)
    if [ $running_containers -eq 0 ]; then
        info "✅ Ingen Docker containere kjører"
    else
        warning "❌ $running_containers Docker containere kjører fortsatt"
    fi
    
    # Sjekk Node.js prosesser
    local node_processes=$(pgrep -f "node" 2>/dev/null | wc -l)
    if [ $node_processes -eq 0 ]; then
        info "✅ Ingen Node.js prosesser kjører"
    else
        warning "❌ $node_processes Node.js prosesser kjører fortsatt"
    fi
}

# Hovedfunksjon
main() {
    echo ""
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo -e "${RED}     TMS Complete System Stop          ${NC}"
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo ""
    
    # Naviger til rot-mappen fra scripts
    cd "$(dirname "$0")/.."
    
    # Stopp alt
    stop_all_processes
    
    # Verifiser at alt er stoppet
    verify_stopped
    
    echo ""
    echo -e "${BLUE}💡 For å starte systemet igjen, kjør:${NC}"
    echo -e "${GREEN}./scripts/start-tms.sh${NC}"
    echo ""
    log "🏁 TMS system shutdown komplett"
    echo ""
}

# Kjør hovedfunksjon
main "$@" 