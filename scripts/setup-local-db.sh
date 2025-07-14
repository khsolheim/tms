#!/bin/bash

# =============================================================================
# TMS Local Database Setup Script
# =============================================================================
# Dette scriptet hjelper med å sette opp en lokal PostgreSQL database for TMS

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

# Sjekk om PostgreSQL er installert
check_postgresql() {
    if ! command -v psql &> /dev/null; then
        error "PostgreSQL er ikke installert!"
        echo ""
        echo "Installer PostgreSQL med en av følgende metoder:"
        echo ""
        echo "macOS (med Homebrew):"
        echo "  brew install postgresql"
        echo "  brew services start postgresql"
        echo ""
        echo "Ubuntu/Debian:"
        echo "  sudo apt update"
        echo "  sudo apt install postgresql postgresql-contrib"
        echo "  sudo systemctl start postgresql"
        echo ""
        echo "Windows:"
        echo "  Last ned fra: https://www.postgresql.org/download/windows/"
        echo ""
        exit 1
    fi
    
    log "✅ PostgreSQL er installert"
}

# Sjekk om PostgreSQL kjører
check_postgresql_running() {
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        error "PostgreSQL kjører ikke på port 5432!"
        echo ""
        echo "Start PostgreSQL med:"
        echo "  macOS (Homebrew): brew services start postgresql"
        echo "  Ubuntu/Debian: sudo systemctl start postgresql"
        echo "  Windows: Start PostgreSQL service fra Services"
        echo ""
        exit 1
    fi
    
    log "✅ PostgreSQL kjører på port 5432"
}

# Opprett database og bruker
create_database() {
    local db_name="tms_db"
    local db_user="postgres"
    
    info "Oppretter database '$db_name'..."
    
    # Sjekk om database allerede eksisterer
    if psql -h localhost -U $db_user -lqt | cut -d \| -f 1 | grep -qw $db_name; then
        warning "Database '$db_name' eksisterer allerede"
        
        read -p "Vil du slette og gjenopprette databasen? (j/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            info "Sletter eksisterende database..."
            dropdb -h localhost -U $db_user $db_name || true
        else
            log "Bruker eksisterende database"
            return 0
        fi
    fi
    
    # Opprett database
    createdb -h localhost -U $db_user $db_name
    log "✅ Database '$db_name' opprettet"
}

# Opprett .env fil hvis den ikke eksisterer
create_env_file() {
    cd "$(dirname "$0")/../server"
    
    if [ ! -f .env ]; then
        info "Oppretter .env fil..."
        cp .env.example .env
        
        # Generer JWT secret
        JWT_SECRET=$(openssl rand -base64 32)
        SESSION_SECRET=$(openssl rand -base64 32)
        
        # Oppdater .env med genererte secrets
        sed -i.bak "s/your-super-secret-jwt-key-min-32-characters/$JWT_SECRET/" .env
        sed -i.bak "s/your-super-secret-session-key-min-32-characters/$SESSION_SECRET/" .env
        rm .env.bak
        
        log "✅ .env fil opprettet med genererte secrets"
    else
        warning ".env fil eksisterer allerede"
    fi
    
    cd - > /dev/null
}

# Test database tilkobling
test_connection() {
    info "Tester database tilkobling..."
    
    cd "$(dirname "$0")/../server"
    
    # Sjekk om node_modules eksisterer
    if [ ! -d node_modules ]; then
        info "Installerer npm avhengigheter..."
        npm install
    fi
    
    # Test tilkobling med Prisma
    if npx prisma db push --preview-feature &> /dev/null; then
        log "✅ Database tilkobling fungerer"
    else
        error "❌ Kunne ikke koble til database"
        echo "Sjekk DATABASE_URL i .env filen"
        exit 1
    fi
    
    cd - > /dev/null
}

# Kjør migrasjoner og seeding
setup_schema() {
    info "Setter opp database schema..."
    
    cd "$(dirname "$0")/../server"
    
    # Generer Prisma client
    info "Genererer Prisma client..."
    npx prisma generate
    
    # Kjør migrasjoner
    info "Kjører database migrasjoner..."
    npx prisma migrate deploy
    
    # Seed database
    info "Seeder database med initial data..."
    npx prisma db seed
    
    cd - > /dev/null
    
    log "✅ Database schema og data er satt opp"
}

# Hovedfunksjon
main() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    TMS Local Database Setup           ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    
    check_postgresql
    check_postgresql_running
    create_database
    create_env_file
    test_connection
    setup_schema
    
    echo ""
    log "🎉 Database setup fullført!"
    echo ""
    echo -e "${GREEN}Database URL:${NC} postgresql://postgres:postgres@localhost:5432/tms_db"
    echo -e "${GREEN}Admin bruker:${NC} admin@test.no / admin123"
    echo ""
    echo -e "${BLUE}Du kan nå starte TMS-systemet med:${NC}"
    echo "  ./scripts/start.sh"
    echo ""
}

# Kjør hovedfunksjon
main "$@"