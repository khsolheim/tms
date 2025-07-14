#!/bin/bash

# TMS Simple System Stop Script
# Stopper kun backend (port 4000) og frontend (port 3000)

# Farger for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Gå til rot-mappen
cd "$(dirname "$0")/.."

log "🛑 Stopper TMS-systemet..."

# Stopp prosesser via PID filer hvis de eksisterer
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        info "Stopper backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm -f logs/backend.pid
    else
        warning "Backend prosess ikke funnet via PID"
    fi
fi

if [ -f "logs/client.pid" ]; then
    CLIENT_PID=$(cat logs/client.pid)
    if kill -0 $CLIENT_PID 2>/dev/null; then
        info "Stopper frontend client (PID: $CLIENT_PID)..."
        kill $CLIENT_PID
        rm -f logs/client.pid
    else
        warning "Frontend prosess ikke funnet via PID"
    fi
fi

# Stopp prosesser på porter som backup
info "Stopper prosesser på porter 3000 og 4000..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 4000/tcp 2>/dev/null || true

# Stopp Node.js prosesser som backup
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Vent litt og sjekk status
sleep 2

BACKEND_RUNNING=false
CLIENT_RUNNING=false

if lsof -i:4000 > /dev/null 2>&1; then
    BACKEND_RUNNING=true
    warning "Backend kjører fortsatt på port 4000"
fi

if lsof -i:3000 > /dev/null 2>&1; then
    CLIENT_RUNNING=true
    warning "Frontend kjører fortsatt på port 3000"
fi

if ! $BACKEND_RUNNING && ! $CLIENT_RUNNING; then
    log "✅ TMS-systemet er stoppet"
else
    error "❌ Noen tjenester kjører fortsatt. Prøv å stoppe manuelt:"
    if $BACKEND_RUNNING; then
        echo "  Backend: fuser -k 4000/tcp"
    fi
    if $CLIENT_RUNNING; then
        echo "  Frontend: fuser -k 3000/tcp"
    fi
fi