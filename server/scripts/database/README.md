# Database Backup System

Omfattende backup og recovery system for TMS database med automatiserte backups, point-in-time recovery, og disaster recovery funktionalitet.

## 🌟 Funksjoner

- **Full Database Backups**: Komplette database dumps med komprimering og kryptering
- **Incremental Backups**: WAL-baserte incremental backups for minimal storage
- **Point-in-Time Recovery**: Gjenopprett database til spesifikt tidspunkt
- **Automatisert Scheduling**: Cron-basert scheduling av alle backup operasjoner
- **Integritetstesting**: Automatisk testing av backup-filer for å sikre validitet
- **Cleanup Policies**: Automatisk sletting av gamle backups basert på retention regler
- **Cloud Storage**: S3-integrasjon for offsite backup storage
- **Monitoring**: Comprehensive logging og backup status rapportering

## 📁 Filstruktur

```
server/scripts/database/
├── backup.ts          # Hovedbackup service
├── run-backup.ts      # CLI for backup operasjoner
├── scheduler.ts       # Automatisert scheduling
└── README.md         # Denne dokumentasjonen
```

## 🚀 Rask Start

### 1. Installer Dependencies

```bash
cd server
npm install node-cron @types/node-cron
```

### 2. Sett Environment Variables

```bash
# Database connection
export DATABASE_URL="postgresql://user:password@localhost:5432/tms"

# Backup configuration
export BACKUP_DIR="/path/to/backup/directory"
export BACKUP_RETENTION_DAYS="30"
export BACKUP_COMPRESSION_LEVEL="6"
export BACKUP_ENCRYPTION_KEY="your-secret-key"

# Scheduler (optional)
export BACKUP_SCHEDULER_ENABLED="true"
export BACKUP_TIMEZONE="Europe/Oslo"
```

### 3. Kjør Din Første Backup

```bash
# Full backup
npx ts-node scripts/database/run-backup.ts full

# Vis status
npx ts-node scripts/database/run-backup.ts status
```

## 📋 Kommandoer

### Backup Operasjoner

```bash
# Full database backup
npx ts-node run-backup.ts full

# Incremental backup (WAL)
npx ts-node run-backup.ts incremental

# Cleanup gamle backups
npx ts-node run-backup.ts cleanup

# Test backup integritet
npx ts-node run-backup.ts test

# Vis backup status
npx ts-node run-backup.ts status
```

### Recovery Operasjoner

```bash
# Restore fra backup
npx ts-node run-backup.ts restore backup_id_here [target_db_name]

# Point-in-time recovery
npx ts-node run-backup.ts pitr "2025-01-01T12:00:00Z" [target_db_name]
```

### Scheduler

```bash
# Start backup scheduler
npx ts-node scheduler.ts start

# Vis scheduler status
npx ts-node scheduler.ts status

# Vis konfigurasjon
npx ts-node scheduler.ts config
```

## ⚙️ Konfiguration

### Environment Variables

| Variabel | Standard | Beskrivelse |
|----------|----------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `BACKUP_DIR` | `./backups` | Directory for backup lagring |
| `BACKUP_RETENTION_DAYS` | `30` | Dager å beholde backups |
| `BACKUP_COMPRESSION_LEVEL` | `6` | Gzip compression level (1-9) |
| `BACKUP_ENCRYPTION_KEY` | - | Krypteringsnøkkel for backups |
| `BACKUP_S3_BUCKET` | - | S3 bucket for cloud storage |

### Scheduler Configuration

| Variabel | Standard | Beskrivelse |
|----------|----------|-------------|
| `BACKUP_SCHEDULER_ENABLED` | `false` | Enable/disable scheduler |
| `BACKUP_SCHEDULE_FULL` | `0 2 * * *` | Cron for full backups |
| `BACKUP_SCHEDULE_INCREMENTAL` | `0 */6 * * *` | Cron for incremental |
| `BACKUP_SCHEDULE_CLEANUP` | `0 4 * * 0` | Cron for cleanup |
| `BACKUP_SCHEDULE_INTEGRITY` | `0 5 * * *` | Cron for testing |
| `BACKUP_TIMEZONE` | `Europe/Oslo` | Timezone for scheduling |

## 🔄 Backup Types

### Full Backup
- Komplett database dump med `pg_dump`
- Inkluderer alle tabeller, data, og metadata
- Komprimert og eventuelt kryptert
- Automatisk integritetstesting

### Incremental Backup  
- WAL (Write-Ahead Log) basert
- Lagrer kun endringer siden siste full backup
- Minimal storage og network impact
- Krever full backup som base

## 🛠️ Recovery Scenarios

### 1. Standard Database Restore

```bash
# List tilgjengelige backups
npx ts-node run-backup.ts status

# Restore til ny database
npx ts-node run-backup.ts restore full_2025-01-01T10-00-00-000Z restored_db
```

### 2. Point-in-Time Recovery

```bash
# Gjenopprett til spesifikt tidspunkt
npx ts-node run-backup.ts pitr "2025-01-01T14:30:00Z" recovery_db
```

### 3. Disaster Recovery

```bash
# 1. Restore siste full backup
npx ts-node run-backup.ts restore latest_backup_id production

# 2. Eller bruk PITR til siste kjente gode state
npx ts-node run-backup.ts pitr "2025-01-01T12:00:00Z" production
```

## 📊 Monitoring & Alerting

### Backup Status

```bash
# Detaljert status rapport
npx ts-node run-backup.ts status
```

Output eksempel:
```
=== BACKUP STATUS ===
Health Status: HEALTHY
Total Backups: 15
Total Size: 2.34 GB
Last Backup: 2025-01-01T02:00:00.000Z
Last Backup Size: 156.78 MB
Last Backup Duration: 45s
```

### Log Monitoring

Backup systemet logger til Winston med strukturert JSON format:

```json
{
  "level": "info",
  "message": "Full backup completed successfully",
  "backupId": "full_2025-01-01T02-00-00-000Z",
  "size": 164523776,
  "duration": 45123,
  "path": "/backups/full/full_2025-01-01T02-00-00-000Z.sql.gz"
}
```

## 🔒 Sikkerhet

### Kryptering

Backups kan krypteres med AES-256-CBC:

```bash
export BACKUP_ENCRYPTION_KEY="your-very-secure-key-here"
```

### Tilgangskontroll

- Sikre backup directory med riktige file permissions
- Bruk dedicated backup user med minimal database privileges
- Roter krypteringsnøkler regelmessig

### Best Practices

1. **Test recovery prosedyrer regelmessig**
2. **Lagre backups offsite (S3 eller annen cloud)**
3. **Monitor backup status daglig**
4. **Dokumenter recovery prosedyrer**
5. **Tren teamet på disaster recovery**

## 🔧 Troubleshooting

### Vanlige Problemer

#### Backup Feiler

```bash
# Sjekk PostgreSQL tilkobling
psql -d $DATABASE_URL -c "SELECT version();"

# Sjekk disk space
df -h /path/to/backup/dir

# Sjekk permissions
ls -la /path/to/backup/dir
```

#### Recovery Feiler

```bash
# Test backup integritet
npx ts-node run-backup.ts test backup_id

# Sjekk PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

#### Scheduler Problemer

```bash
# Sjekk scheduler status
npx ts-node scheduler.ts status

# Sjekk cron logs
journalctl -u backup-scheduler
```

### Performance Tuning

#### Backup Performance

```bash
# Øk compression level for mindre filer (langsommere)
export BACKUP_COMPRESSION_LEVEL="9"

# Reduser compression for raskere backups
export BACKUP_COMPRESSION_LEVEL="1"
```

#### Recovery Performance

```bash
# Bruk parallelle connections for raskere restore
export PGDUMP_JOBS="4"
```

## 📈 Metrics & KPIs

### Backup Metrics

- **Backup Success Rate**: % successful backups siste 30 dager
- **Backup Size Trend**: Vekst i backup størrelse over tid
- **Backup Duration**: Tid brukt på backup operasjoner
- **Storage Utilization**: Disk space brukt for backups

### Recovery Metrics

- **Recovery Time Objective (RTO)**: Mål for restore tid
- **Recovery Point Objective (RPO)**: Maksimal acceptable dataforlusts
- **Test Recovery Success Rate**: % vellykkede recovery tester

## 🔄 Maintenance

### Daglige Oppgaver

- Sjekk backup status
- Bekreft at scheduler kjører
- Monitor disk space

### Ukentlige Oppgaver

- Test recovery prosedyre
- Review backup logs
- Cleanup gamle backups

### Månedlige Oppgaver

- Full disaster recovery test
- Review og oppdater retention policies
- Performance tuning

## 📞 Support

For spørsmål eller problemer:

1. Sjekk denne dokumentasjonen
2. Se på backup logs: `tail -f /path/to/logs/backup.log`
3. Test backup integritet: `npx ts-node run-backup.ts test`
4. Kontakt databaseadministrator

---

## 🎯 Roadmap

### Planlagte Forbedringer

- [ ] Grafana dashboard for backup metrics
- [ ] Slack/email notifikasjoner
- [ ] Automated disaster recovery testing
- [ ] Multi-region backup replication
- [ ] Backup encryption key rotation
- [ ] PostgreSQL streaming replication support 