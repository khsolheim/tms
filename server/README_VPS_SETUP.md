# TMS Server VPS Setup Guide

## 🚀 Automatisk Oppstart på VPS

Denne guiden viser hvordan du setter opp TMS-serveren for automatisk oppstart på VPS-en din på `http://91.108.121.251/`.

## 📋 Forutsetninger

- VPS med Ubuntu/Debian Linux
- Root-tilgang eller sudo-privilegier
- Node.js og npm installert
- PostgreSQL og Redis installert

## 🔧 Rask Installasjon

### Alternativ 1: Fullautomatisk oppsett

```bash
# Last opp filene til VPS-en
scp -r server/ root@91.108.121.251:/root/tms/

# Koble til VPS-en
ssh root@91.108.121.251

# Naviger til server-mappen
cd /root/tms/server

# Kjør det automatiske oppsettet
sudo bash quick-start.sh
```

### Alternativ 2: Manuell installasjon

```bash
# 1. Installer systemd service
sudo bash install-service.sh

# 2. Konfigurer miljøvariabler
nano /root/tms/server/.env

# 3. Start servicen
sudo systemctl start tms-server.service
sudo systemctl enable tms-server.service
```

## 📁 Filer som er opprettet

### 1. `tms-server.service`
Systemd service-fil som definerer hvordan serveren skal kjøre:
- Automatisk oppstart ved boot
- Restart ved feil
- Logging til systemd journal
- Sikkerhetsinnstillinger

### 2. `install-service.sh`
Installasjonsskript som:
- Bygger applikasjonen
- Oppretter nødvendige mapper
- Installerer systemd service
- Konfigurerer nginx reverse proxy
- Setter opp firewall

### 3. `quick-start.sh`
Komplett oppsett som:
- Installerer alle avhengigheter
- Setter opp database
- Konfigurerer nginx
- Starter alle tjenester

## ⚙️ Konfigurasjon

### Miljøvariabler (.env)

```bash
# Database Configuration
DATABASE_URL="postgresql://tms_user:tms_password@localhost:5432/tms_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
NODE_ENV=production
PORT=4000

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Security Configuration
CORS_ORIGIN="http://91.108.121.251"
SESSION_SECRET="your-session-secret-here"
```

### Nginx Konfigurasjon

Nginx fungerer som reverse proxy og serverer applikasjonen på port 80:
- Proxy til Node.js server på port 4000
- Støtte for WebSocket-oppgraderinger
- Filopplasting opptil 50MB

## 🛠️ Service Management

### Grunnleggende kommandoer

```bash
# Start service
sudo systemctl start tms-server.service

# Stop service
sudo systemctl stop tms-server.service

# Restart service
sudo systemctl restart tms-server.service

# Check status
sudo systemctl status tms-server.service

# Enable auto-start on boot
sudo systemctl enable tms-server.service

# Disable auto-start on boot
sudo systemctl disable tms-server.service
```

### Logging

```bash
# Følg logger i sanntid
sudo journalctl -u tms-server.service -f

# Vis siste 50 logglinjer
sudo journalctl -u tms-server.service -n 50

# Vis logger fra i dag
sudo journalctl -u tms-server.service --since today

# Vis logger med tidsstempel
sudo journalctl -u tms-server.service -o short-iso
```

## 🔍 Feilsøking

### Service starter ikke

```bash
# Sjekk status
sudo systemctl status tms-server.service

# Vis detaljerte logger
sudo journalctl -u tms-server.service --no-pager -l

# Sjekk om port 4000 er i bruk
sudo netstat -tlnp | grep :4000

# Test database-tilkobling
sudo -u postgres psql -c "\l"
```

### Nginx problemer

```bash
# Test nginx konfigurasjon
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Sjekk nginx status
sudo systemctl status nginx

# Vis nginx logger
sudo tail -f /var/log/nginx/error.log
```

### Database problemer

```bash
# Sjekk PostgreSQL status
sudo systemctl status postgresql

# Test database-tilkobling
psql -h localhost -U tms_user -d tms_db

# Kjør Prisma migrasjoner
cd /root/tms/server
npx prisma migrate deploy
```

## 🔒 Sikkerhet

### Firewall

UFW er konfigurert med følgende regler:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

### Service sikkerhet

Systemd service har følgende sikkerhetsinnstillinger:
- `NoNewPrivileges=true` - Forhindrer eskalering av privilegier
- `PrivateTmp=true` - Isolerer temp-filer
- `ProtectSystem=strict` - Beskytter systemfiler
- `ProtectHome=true` - Beskytter hjemmemapper

## 📊 Overvåking

### System ressurser

```bash
# CPU og minne bruk
htop

# Disk bruk
df -h

# Nettverk
iftop

# Prosesser
ps aux | grep node
```

### Applikasjonsmetrikker

```bash
# Sjekk om serveren svarer
curl http://localhost:4000/health

# Test API endpoints
curl http://localhost:4000/api/v1/status
```

## 🔄 Oppdateringer

### Oppdatere applikasjonen

```bash
# Stopp service
sudo systemctl stop tms-server.service

# Oppdater kode
cd /root/tms/server
git pull

# Installer nye avhengigheter
npm install

# Bygg applikasjonen
npm run build

# Kjør migrasjoner
npx prisma migrate deploy

# Start service
sudo systemctl start tms-server.service
```

### Oppdatere systemd service

```bash
# Kopier ny service-fil
sudo cp tms-server.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Restart service
sudo systemctl restart tms-server.service
```

## 📞 Support

Hvis du støter på problemer:

1. Sjekk logger: `sudo journalctl -u tms-server.service -f`
2. Verifiser konfigurasjon: `sudo systemctl status tms-server.service`
3. Test tilkoblinger: database, redis, nginx
4. Sjekk ressursbruk: CPU, minne, disk

## 🎯 Neste steg

Etter at serveren kjører:

1. Konfigurer SSL/HTTPS med Let's Encrypt
2. Sette opp automatiske backups
3. Konfigurere overvåking og varsling
4. Optimalisere ytelse
5. Sette opp staging-miljø 