#!/bin/bash

# TMS Simple System Startup Script
# Starter kun backend (port 4000) og frontend (port 3000)

set -e

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

# Sjekk om Node.js er installert
if ! command -v node &> /dev/null; then
    error "Node.js er ikke installert. Installer Node.js 18+ først."
    exit 1
fi

# Sjekk om npm er installert
if ! command -v npm &> /dev/null; then
    error "npm er ikke installert. Installer npm først."
    exit 1
fi

log "🚀 Starter TMS-systemet..."

# Stopp eventuelle eksisterende prosesser
info "Stopper eksisterende prosesser på porter 3000 og 4000..."
pkill -f "port.*3000" 2>/dev/null || true
pkill -f "port.*4000" 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 4000/tcp 2>/dev/null || true

# Installer avhengigheter hvis nødvendig
log "🔧 Sjekker avhengigheter..."

if [ ! -d "server/node_modules" ]; then
    info "Installerer server-avhengigheter..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    info "Installerer client-avhengigheter..."
    cd client && npm install && cd ..
fi

# Opprett logs-mappe
mkdir -p logs

# Database setup
log "🗄️ Setter opp database..."
cd server

# Generer Prisma klient
info "Genererer Prisma klient..."
npx prisma generate

# Kjør migrasjoner
info "Kjører database migrasjoner..."
npx prisma migrate deploy

cd ..

# Start backend
log "🖥️ Starter backend server (port 4000)..."
cd server
nohup npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Vent litt for backend å starte
sleep 3

# Start frontend
log "🌐 Starter frontend client (port 3000)..."
cd client
nohup npm start > ../logs/client.log 2>&1 &
CLIENT_PID=$!
echo $CLIENT_PID > ../logs/client.pid
cd ..

# Vent på at tjenestene starter
log "⏳ Venter på at tjenestene starter opp..."
sleep 8

# Sjekk at tjenestene kjører
BACKEND_RUNNING=false
CLIENT_RUNNING=false

if lsof -i:4000 > /dev/null 2>&1; then
    BACKEND_RUNNING=true
    log "✅ Backend kjører på http://localhost:4000"
fi

if lsof -i:3000 > /dev/null 2>&1; then
    CLIENT_RUNNING=true
    log "✅ Frontend kjører på http://localhost:3000"
fi

echo ""
if $BACKEND_RUNNING && $CLIENT_RUNNING; then
    log "🎉 TMS-systemet er startet!"
    echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
    echo -e "${GREEN}Backend API:${NC} http://localhost:4000"
    echo ""
    echo -e "${BLUE}Logger:${NC}"
    echo "  Backend: logs/backend.log"
    echo "  Frontend: logs/client.log"
    echo ""
    echo -e "${BLUE}For å stoppe systemet:${NC} ./scripts/stop.sh"
else
    error "❌ Noen tjenester startet ikke korrekt. Sjekk loggfilene:"
    echo "  Backend log: logs/backend.log"
    echo "  Frontend log: logs/client.log"
    exit 1
fi