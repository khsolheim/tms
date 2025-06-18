# 🚀 TMS PRODUCTION SETUP GUIDE

Denne guiden tar deg gjennom hele prosessen for å sette opp TMS i produksjon med Docker containerisering, sikkerhet og overvåking.

## 📋 FORUTSETNINGER

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 8GB, anbefalt 16GB+
- **CPU**: Minimum 4 cores, anbefalt 8+ cores
- **Storage**: Minimum 100GB SSD
- **Network**: Stabil internettforbindelse

### Software Dependencies
- Docker 24.0+
- Docker Compose 2.0+
- Git
- curl
- sudo tilgang

## 🔧 QUICK START

### 1. Forbered Server
```bash
# Oppdater systemet
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log ut og inn igjen for Docker-tilgangene
```

### 2. Klon Prosjektet
```bash
git clone https://github.com/your-org/tms.git
cd tms
```

### 3. Konfigurer Environment
```bash
# Kopier og rediger produksjonsmiljøet
cp .env.production.example .env.production
nano .env.production
```

### 4. Deploy til Produksjon
```bash
# Kjør deployment-scriptet
./scripts/deploy-production.sh
```

🎉 **Det er det!** TMS er nå kjørende i produksjon!

---

## 🔐 DETALJERT SIKKERHETSOPPSETT

### Environment Variables (.env.production)

**KRITISKE SIKKERHETSINNSTILLINGER som MÅ endres:**

```bash
# =============================================================================
# SIKKERHETSKONFIGURATION (ENDRE DISSE!)
# =============================================================================

# JWT Secret - Generer en sterk hemmelighet
JWT_SECRET="generer-en-meget-sikker-tilfeldig-streng-her-64-tegn-minimum"
JWT_REFRESH_SECRET="en-annen-meget-sikker-tilfeldig-streng-for-refresh-tokens"

# Database Sikkerhet
DB_PASSWORD="veldig-sikker-database-passord-her"
POSTGRES_PASSWORD="samme-som-db-password"

# Redis Sikkerhet
REDIS_PASSWORD="sikker-redis-passord-her"

# Session Sikkerhet
SESSION_SECRET="sikker-session-hemmelighet-her"

# =============================================================================
# API KONFIGURATION
# =============================================================================
API_URL="https://yourdomain.com/api"
CORS_ORIGIN="https://yourdomain.com"

# =============================================================================
# SSL/TLS KONFIGURATION
# =============================================================================
SSL_CERT_PATH="/opt/tms/ssl/cert.pem"
SSL_KEY_PATH="/opt/tms/ssl/private.key"

# =============================================================================
# OVERVÅKING OG LOGGING
# =============================================================================
SENTRY_DSN="https://your-sentry-dsn-here"
LOG_LEVEL="error"
ENABLE_METRICS="true"

# =============================================================================
# SECURITY HEADERS
# =============================================================================
SECURITY_HEADERS="true"
RATE_LIMITING="true"
RATE_LIMIT_REQUESTS="100"
RATE_LIMIT_WINDOW="15"
```

### Generere Sikre Hemmeligheter

```bash
# Generer JWT Secret (64 tegn)
openssl rand -base64 48

# Generer database passord (32 tegn)
openssl rand -base64 24

# Generer session secret (32 tegn)
openssl rand -base64 24
```

---

## 🌐 DOMENE OG SSL SETUP

### 1. Domene Konfigurasjon

Oppdater DNS-innstillinger for ditt domene:

```
Type: A
Name: @
Value: DIN_SERVER_IP

Type: A  
Name: www
Value: DIN_SERVER_IP

Type: CNAME
Name: api
Value: yourdomain.com
```

### 2. SSL Sertifikater (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install certbot

# Generer SSL sertifikater
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Kopier sertifikatene til TMS
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/tms/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/tms/ssl/private.key

# Sett riktige tilganger
sudo chown nginx:nginx /opt/tms/ssl/*.pem
sudo chmod 600 /opt/tms/ssl/private.key
sudo chmod 644 /opt/tms/ssl/cert.pem

# Auto-fornyelse (crontab)
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /path/to/docker-compose.production.yml restart tms-client" | sudo crontab -
```

### 3. Oppdater Nginx Konfigurasjon

Rediger `client/nginx.prod.conf` og erstatt `yourdomain.com` med ditt faktiske domene.

---

## 📊 OVERVÅKING OG LOGGING

### Grafana Dashboard

Tilgang: `http://yourdomain.com:3000`

**Standard innlogging:**
- Username: `admin`
- Password: Se `GRAFANA_ADMIN_PASSWORD` i `.env.production`

**Dashboards inkluderer:**
- System Performance
- Application Metrics
- Error Rates
- Database Performance
- User Activity

### Prometheus Metrics

Tilgang: `http://yourdomain.com:9090`

**Viktige metrics:**
- `http_requests_total` - API forespørsler
- `http_request_duration_seconds` - Responstid
- `nodejs_memory_usage_bytes` - Minnebruk
- `postgres_connections_active` - Database tilkoblinger

### Log Overvåking

```bash
# Se live logs
docker-compose -f docker-compose.production.yml logs -f

# Se spesifikke tjenester
docker-compose -f docker-compose.production.yml logs -f tms-backend
docker-compose -f docker-compose.production.yml logs -f tms-client

# Log filer på disk
ls -la /opt/tms/logs/
```

---

## 🔧 VEDLIKEHOLD OG OPERASJONER

### Daglige Operasjoner

```bash
# Sjekk system status
docker-compose -f docker-compose.production.yml ps

# Restart tjenester
docker-compose -f docker-compose.production.yml restart

# Oppdater containere
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Rens ubrukte ressurser
docker system prune -f
```

### Database Backup

```bash
# Manuell backup
docker exec tms-postgres-prod pg_dump -U tms_prod_user tms_production | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Automatisk backup (crontab)
echo "0 2 * * * docker exec tms-postgres-prod pg_dump -U tms_prod_user tms_production | gzip > /opt/tms/backups/auto_backup_\$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz" | crontab -
```

### Database Restore

```bash
# Stopp applikasjonen
docker-compose -f docker-compose.production.yml stop tms-backend

# Restore database
gunzip -c backup_file.sql.gz | docker exec -i tms-postgres-prod psql -U tms_prod_user -d tms_production

# Start applikasjonen
docker-compose -f docker-compose.production.yml start tms-backend
```

---

## 🛡️ SIKKERHET BEST PRACTICES

### Firewall Konfigurasjon

```bash
# Installer UFW
sudo apt install ufw

# Konfigurer firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Aktiver firewall
sudo ufw enable
```

### System Hardening

```bash
# Oppdater system regelmessig
echo "0 6 * * * apt update && apt upgrade -y" | sudo crontab -

# Konfigurer fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Konfigurer logrotate for Docker logs
sudo tee /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
```

### Brukertilgang

```bash
# Opprett dedikert bruker for TMS
sudo useradd -m -s /bin/bash tms
sudo usermod -aG docker tms

# Sett opp SSH nøkler (ikke passord)
sudo mkdir -p /home/tms/.ssh
sudo cp ~/.ssh/authorized_keys /home/tms/.ssh/
sudo chown -R tms:tms /home/tms/.ssh
sudo chmod 700 /home/tms/.ssh
sudo chmod 600 /home/tms/.ssh/authorized_keys
```

---

## 🚨 PROBLEMLØSING

### Vanlige Problemer

**1. Container starter ikke**
```bash
# Sjekk logs
docker-compose -f docker-compose.production.yml logs container-name

# Sjekk ressurser
docker stats
df -h
free -h
```

**2. Database tilkoblingsproblemer**
```bash
# Test database tilkobling
docker exec tms-postgres-prod pg_isready -U tms_prod_user

# Sjekk database logs
docker-compose -f docker-compose.production.yml logs tms-postgres
```

**3. SSL/TLS problemer**
```bash
# Test SSL sertifikat
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Sjekk sertifikat utløpsdato
openssl x509 -in /opt/tms/ssl/cert.pem -text -noout | grep "Not After"
```

**4. Performance problemer**
```bash
# Sjekk systemressurser
htop
iotop
nethogs

# Analyser Docker performance
docker stats --no-stream
```

### Emergency Procedures

**Rollback til forrige versjon:**
```bash
# Stopp gjeldende deployment
docker-compose -f docker-compose.production.yml down

# Bytt til forrige versjon
git checkout PREVIOUS_TAG

# Deploy forrige versjon
./scripts/deploy-production.sh
```

**Database recovery:**
```bash
# Restore fra backup
gunzip -c /opt/tms/backups/latest_backup.sql.gz | docker exec -i tms-postgres-prod psql -U tms_prod_user -d tms_production
```

---

## 📈 PERFORMANCE TUNING

### Database Optimalisering

Rediger `docker-compose.production.yml` PostgreSQL konfigurasjon:

```yaml
environment:
  - POSTGRES_SHARED_BUFFERS=256MB
  - POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
  - POSTGRES_WORK_MEM=4MB
  - POSTGRES_MAINTENANCE_WORK_MEM=64MB
  - POSTGRES_MAX_CONNECTIONS=100
```

### Redis Optimalisering

```yaml
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru --save 900 1
```

### Nginx Optimalisering

Se `client/nginx.prod.conf` for optimaliserte innstillinger inkludert:
- Gzip komprimering
- Browser caching
- Rate limiting
- Security headers

---

## 📞 SUPPORT OG VEDLIKEHOLD

### Monitoring Alerts

Konfigurer alerts i Grafana for:
- High CPU usage (>80%)
- High memory usage (>85%)
- Disk space low (<10%)
- High error rates (>5%)
- Database connection failures

### Backup Strategy

- **Daglig**: Database backup + uploads
- **Ukentlig**: Full system backup
- **Månedlig**: Offsite backup til cloud storage
- **Testing**: Test restore prosedyrer månedlig

### Update Procedure

1. Test oppdateringer i staging miljø
2. Ta backup før produksjon oppdatering  
3. Utfør oppdatering i vedlikehold-vindu
4. Kjør smoke tests etter oppdatering
5. Overvåk system i 24 timer etter oppdatering

---

## 🎯 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Server oppfyller minimum krav
- [ ] Docker og Docker Compose installert
- [ ] DNS konfigurert
- [ ] SSL sertifikater klare
- [ ] Environment variabler konfigurert
- [ ] Firewall konfigurert

### Deployment
- [ ] `./scripts/deploy-production.sh` kjørt suksessfullt
- [ ] Alle containers kjører
- [ ] Health checks passerer
- [ ] SSL/TLS fungerer
- [ ] Database tilkobling OK

### Post-Deployment
- [ ] Overvåking konfigurert
- [ ] Backup system aktivert
- [ ] Performance testing utført
- [ ] Security scanning utført
- [ ] Dokumentasjon oppdatert
- [ ] Team informert

---

## 📚 EKSTRA RESSURSER

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Nginx Security Headers](https://owasp.org/www-project-secure-headers/)
- [Let's Encrypt Setup](https://letsencrypt.org/getting-started/)

---

**🚀 TMS er nå produksjonsklar!**

For spørsmål eller support, kontakt utviklingsteamet eller lag en issue i prosjektets repository. 