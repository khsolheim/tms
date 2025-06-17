#!/bin/bash

# ============================================================================
# TMS BACKUP & DISASTER RECOVERY SCRIPT
# ============================================================================
# Komplett backup-løsning for TMS systemet
# Støtter: Database, Redis, Filer, Konfigurasjoner, Secrets
# ============================================================================

set -euo pipefail

# Konfigurasjon
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Logging
LOG_FILE="$BACKUP_DIR/backup_$TIMESTAMP.log"
mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    log "ERROR: $1" >&2
    exit 1
}

# ============================================================================
# BACKUP FUNKSJONER
# ============================================================================

backup_database() {
    log "🗄️ Backing up database..."
    local db_backup_dir="$BACKUP_DIR/database/$TIMESTAMP"
    mkdir -p "$db_backup_dir"
    
    if docker ps | grep -q tms-postgres; then
        docker exec tms-postgres pg_dump -U postgres -d tms > "$db_backup_dir/tms_full.sql"
        gzip "$db_backup_dir/tms_full.sql"
        log "✅ Database backup completed"
    else
        log "⚠️ PostgreSQL container not running"
    fi
}

backup_redis() {
    log "🔄 Backing up Redis..."
    local redis_backup_dir="$BACKUP_DIR/redis/$TIMESTAMP"
    mkdir -p "$redis_backup_dir"
    
    if docker ps | grep -q tms-redis; then
        docker exec tms-redis redis-cli BGSAVE
        sleep 2
        docker cp tms-redis:/data/dump.rdb "$redis_backup_dir/dump_$TIMESTAMP.rdb"
        gzip "$redis_backup_dir/dump_$TIMESTAMP.rdb"
        log "✅ Redis backup completed"
    else
        log "⚠️ Redis container not running"
    fi
}

backup_files() {
    log "📁 Backing up files..."
    local files_backup_dir="$BACKUP_DIR/files/$TIMESTAMP"
    mkdir -p "$files_backup_dir"
    
    if [ -d "$PROJECT_ROOT/server/uploads" ]; then
        tar -czf "$files_backup_dir/uploads.tar.gz" -C "$PROJECT_ROOT/server" uploads/
    fi
    
    if [ -d "$PROJECT_ROOT/server/logs" ]; then
        tar -czf "$files_backup_dir/logs.tar.gz" -C "$PROJECT_ROOT/server" logs/
    fi
    
    log "✅ File backup completed"
}

backup_configuration() {
    log "⚙️ Starter konfigurasjon backup..."
    
    local config_backup_dir="$BACKUP_DIR/config/$TIMESTAMP"
    mkdir -p "$config_backup_dir"
    
    # Docker Compose files
    cp "$PROJECT_ROOT/docker-compose.yml" "$config_backup_dir/"
    if [ -f "$PROJECT_ROOT/docker-compose.override.yml" ]; then
        cp "$PROJECT_ROOT/docker-compose.override.yml" "$config_backup_dir/"
    fi
    
    # Environment files (without secrets)
    if [ -f "$PROJECT_ROOT/.env" ]; then
        grep -v -E "(PASSWORD|SECRET|KEY)" "$PROJECT_ROOT/.env" > "$config_backup_dir/env_safe.txt" || true
    fi
    
    # Nginx configuration
    if [ -d "$PROJECT_ROOT/nginx/conf.d" ]; then
        cp -r "$PROJECT_ROOT/nginx/conf.d" "$config_backup_dir/"
    fi
    
    # Prometheus configuration
    if [ -d "$PROJECT_ROOT/monitoring/prometheus" ]; then
        cp -r "$PROJECT_ROOT/monitoring/prometheus" "$config_backup_dir/"
    fi
    
    # Kubernetes manifests
    if [ -d "$PROJECT_ROOT/k8s" ]; then
        cp -r "$PROJECT_ROOT/k8s" "$config_backup_dir/"
    fi
    
    # Package files
    cp "$PROJECT_ROOT/server/package.json" "$config_backup_dir/"
    cp "$PROJECT_ROOT/server/package-lock.json" "$config_backup_dir/"
    
    log "✅ Configuration backup completed"
}

backup_secrets() {
    log "🔐 Starter secrets backup (encrypted)..."
    
    local secrets_backup_dir="$BACKUP_DIR/secrets/$TIMESTAMP"
    mkdir -p "$secrets_backup_dir"
    
    # Backup environment file with secrets (encrypted)
    if [ -f "$PROJECT_ROOT/.env" ] && [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
        log "🔒 Encrypting and backing up secrets..."
        openssl enc -aes-256-cbc -salt -in "$PROJECT_ROOT/.env" -out "$secrets_backup_dir/env.enc" -k "$BACKUP_ENCRYPTION_KEY"
    else
        log "⚠️ Skipping secrets backup (no encryption key provided)"
    fi
    
    # Backup SSL private keys (encrypted)
    if [ -d "$PROJECT_ROOT/nginx/ssl" ] && [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
        tar -czf - -C "$PROJECT_ROOT/nginx/ssl" . | openssl enc -aes-256-cbc -salt -out "$secrets_backup_dir/ssl_private.tar.gz.enc" -k "$BACKUP_ENCRYPTION_KEY"
    fi
    
    log "✅ Secrets backup completed"
}

create_backup_manifest() {
    log "📋 Lager backup manifest..."
    
    local manifest_file="$BACKUP_DIR/manifest_$TIMESTAMP.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_id": "$TIMESTAMP",
  "created_at": "$(date -Iseconds)",
  "hostname": "$(hostname)",
  "user": "$(whoami)",
  "tms_version": "$(cat $PROJECT_ROOT/package.json | grep version | cut -d'"' -f4)",
  "components": {
    "database": $([ -d "$BACKUP_DIR/database/$TIMESTAMP" ] && echo "true" || echo "false"),
    "redis": $([ -d "$BACKUP_DIR/redis/$TIMESTAMP" ] && echo "true" || echo "false"),
    "files": $([ -d "$BACKUP_DIR/files/$TIMESTAMP" ] && echo "true" || echo "false"),
    "config": $([ -d "$BACKUP_DIR/config/$TIMESTAMP" ] && echo "true" || echo "false"),
    "secrets": $([ -d "$BACKUP_DIR/secrets/$TIMESTAMP" ] && echo "true" || echo "false")
  },
  "sizes": {
    "database": "$(du -sh $BACKUP_DIR/database/$TIMESTAMP 2>/dev/null | cut -f1 || echo '0')",
    "redis": "$(du -sh $BACKUP_DIR/redis/$TIMESTAMP 2>/dev/null | cut -f1 || echo '0')",
    "files": "$(du -sh $BACKUP_DIR/files/$TIMESTAMP 2>/dev/null | cut -f1 || echo '0')",
    "config": "$(du -sh $BACKUP_DIR/config/$TIMESTAMP 2>/dev/null | cut -f1 || echo '0')",
    "secrets": "$(du -sh $BACKUP_DIR/secrets/$TIMESTAMP 2>/dev/null | cut -f1 || echo '0')"
  },
  "total_size": "$(du -sh $BACKUP_DIR/*/$TIMESTAMP 2>/dev/null | awk '{sum += \$1} END {print sum "M"}' || echo '0')"
}
EOF
    
    log "✅ Backup manifest created: $manifest_file"
}

cleanup_old_backups() {
    log "🧹 Rydder opp gamle backups (eldre enn $RETENTION_DAYS dager)..."
    
    find "$BACKUP_DIR" -type d -name "*_*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
    find "$BACKUP_DIR" -name "backup_*.log" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "manifest_*.json" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log "✅ Cleanup completed"
}

verify_backup() {
    log "🔍 Verifiserer backup integritet..."
    
    local verification_failed=false
    
    # Verify database backup
    if [ -f "$BACKUP_DIR/database/$TIMESTAMP/tms_full.sql.gz" ]; then
        if ! gzip -t "$BACKUP_DIR/database/$TIMESTAMP/tms_full.sql.gz"; then
            log "❌ Database backup verification failed"
            verification_failed=true
        fi
    fi
    
    # Verify Redis backup
    if [ -f "$BACKUP_DIR/redis/$TIMESTAMP/dump_$TIMESTAMP.rdb.gz" ]; then
        if ! gzip -t "$BACKUP_DIR/redis/$TIMESTAMP/dump_$TIMESTAMP.rdb.gz"; then
            log "❌ Redis backup verification failed"
            verification_failed=true
        fi
    fi
    
    # Verify file backups
    for tar_file in "$BACKUP_DIR/files/$TIMESTAMP"/*.tar.gz; do
        if [ -f "$tar_file" ] && ! tar -tzf "$tar_file" >/dev/null 2>&1; then
            log "❌ File backup verification failed: $tar_file"
            verification_failed=true
        fi
    done
    
    if [ "$verification_failed" = true ]; then
        error "Backup verification failed!"
    else
        log "✅ Backup verification successful"
    fi
}

# ============================================================================
# RESTORE FUNKSJONER
# ============================================================================

restore_database() {
    local backup_timestamp="$1"
    log "🔄 Restoring database from backup $backup_timestamp..."
    
    local db_backup_dir="$BACKUP_DIR/database/$backup_timestamp"
    
    if [ ! -f "$db_backup_dir/tms_full.sql.gz" ]; then
        error "Database backup not found: $db_backup_dir/tms_full.sql.gz"
    fi
    
    # Stop application
    docker-compose stop tms-backend
    
    # Restore database
    gunzip -c "$db_backup_dir/tms_full.sql.gz" | docker exec -i tms-postgres psql -U postgres -d tms
    
    # Start application
    docker-compose start tms-backend
    
    log "✅ Database restore completed"
}

restore_redis() {
    local backup_timestamp="$1"
    log "🔄 Restoring Redis from backup $backup_timestamp..."
    
    local redis_backup_dir="$BACKUP_DIR/redis/$backup_timestamp"
    
    if [ ! -f "$redis_backup_dir/dump_$backup_timestamp.rdb.gz" ]; then
        error "Redis backup not found: $redis_backup_dir/dump_$backup_timestamp.rdb.gz"
    fi
    
    # Stop Redis
    docker-compose stop tms-redis
    
    # Restore RDB file
    gunzip -c "$redis_backup_dir/dump_$backup_timestamp.rdb.gz" > /tmp/dump.rdb
    docker cp /tmp/dump.rdb tms-redis:/data/dump.rdb
    rm /tmp/dump.rdb
    
    # Start Redis
    docker-compose start tms-redis
    
    log "✅ Redis restore completed"
}

# ============================================================================
# HOVEDFUNKSJON
# ============================================================================

main() {
    local command="${1:-backup}"
    
    case "$command" in
        backup)
            log "🚀 Starting TMS backup process..."
            backup_database
            backup_redis
            backup_files
            backup_configuration
            backup_secrets
            create_backup_manifest
            verify_backup
            cleanup_old_backups
            log "🎉 Backup process completed! Backup ID: $TIMESTAMP"
            ;;
        restore)
            local backup_id="${2:-}"
            if [ -z "$backup_id" ]; then
                error "Backup ID required for restore. Usage: $0 restore <backup_id>"
            fi
            log "🔄 Starter restore prosess for backup: $backup_id"
            restore_database "$backup_id"
            restore_redis "$backup_id"
            log "🎉 Restore prosess fullført!"
            ;;
        list)
            log "📋 Tilgjengelige backups:"
            find "$BACKUP_DIR" -name "manifest_*.json" -exec basename {} .json \; | sed 's/manifest_//' | sort -r
            ;;
        verify)
            local backup_id="${2:-$TIMESTAMP}"
            log "🔍 Verifiserer backup: $backup_id"
            TIMESTAMP="$backup_id"
            verify_backup
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        *)
            echo "Usage: $0 {backup|restore <backup_id>|list|verify [backup_id]|cleanup}"
            exit 1
            ;;
    esac
}

# Kjør hovedfunksjon
main "$@" 