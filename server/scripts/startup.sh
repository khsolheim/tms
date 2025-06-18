#!/bin/bash
# =============================================================================
# TMS Server Production Startup Script
# =============================================================================

set -e

echo "🚀 Starting TMS Server Production..."

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to wait for database
wait_for_database() {
    log "Waiting for database connection..."
    
    # Extract database info from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
    DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
    
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; do
        log "Database is unavailable - sleeping"
        sleep 2
    done
    
    log "✅ Database is ready!"
}

# Function to wait for Redis
wait_for_redis() {
    log "Waiting for Redis connection..."
    
    # Extract Redis info from REDIS_URL
    REDIS_HOST=$(echo $REDIS_URL | sed 's/.*@\([^:]*\):.*/\1/' | sed 's/redis:\/\/.*@\([^:]*\):.*/\1/')
    REDIS_PORT=$(echo $REDIS_URL | sed 's/.*:\([0-9]*\)$/\1/')
    
    until redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null 2>&1; do
        log "Redis is unavailable - sleeping"
        sleep 2
    done
    
    log "✅ Redis is ready!"
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    log "✅ Database migrations completed!"
}

# Function to seed database if needed
seed_database() {
    if [ "$SEED_DATABASE" = "true" ]; then
        log "Seeding database..."
        npm run seed
        log "✅ Database seeding completed!"
    fi
}

# Function to validate environment
validate_environment() {
    log "Validating environment variables..."
    
    # Check required environment variables
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "NODE_ENV"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log "❌ Error: Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log "✅ Environment validation passed!"
}

# Function to create required directories
create_directories() {
    log "Creating required directories..."
    
    mkdir -p /app/uploads
    mkdir -p /app/logs
    mkdir -p /app/backups
    
    log "✅ Directories created!"
}

# Main startup sequence
main() {
    log "🔄 Starting TMS Server Production Setup..."
    
    # Validate environment
    validate_environment
    
    # Create directories
    create_directories
    
    # Wait for dependencies
    wait_for_database
    
    if [ ! -z "$REDIS_URL" ]; then
        wait_for_redis
    fi
    
    # Run migrations
    run_migrations
    
    # Seed database if requested
    seed_database
    
    log "✅ Setup completed successfully!"
    log "🚀 Starting TMS Server..."
    
    # Start the application
    exec node dist/index.js
}

# Handle signals gracefully
trap 'log "Received SIGTERM, shutting down gracefully..."; exit 0' SIGTERM
trap 'log "Received SIGINT, shutting down gracefully..."; exit 0' SIGINT

# Run main function
main 