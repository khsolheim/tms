# TMS System Scripts

Dette er samlingsstedet for alle TMS system management scripts.

## 🚀 Start/Stopp Scripts

### `start.sh` - Enkelt System Start
Starter TMS-systemet med backend og frontend.

```bash
./scripts/start.sh
```

**Dette scriptet:**
- 🔧 Installerer npm avhengigheter hvis nødvendig
- 🗄️ Setter opp database (kjører migrasjoner)
- 🖥️ Starter backend server (port 4000)
- 🌐 Starter frontend client (port 3000)
- ✅ Verifiserer at alle tjenester kjører

### `stop.sh` - Enkelt System Stopp
Stopper alle TMS-prosesser.

```bash
./scripts/stop.sh
```

**Dette scriptet:**
- 🛑 Stopper backend server
- 🛑 Stopper frontend client
- 🔌 Frigjør porter 3000 og 4000
- ✅ Verifiserer at alt er stoppet

## �️ Database Setup

### `setup-local-db.sh` - Automatisk Database Oppsett
Setter opp en lokal PostgreSQL database for TMS.

```bash
./scripts/setup-local-db.sh
```

**Dette scriptet:**
- ✅ Sjekker at PostgreSQL er installert og kjører
- 🗄️ Oppretter database `tms_db`
- 📝 Genererer `.env` fil med sikre secrets
- 🔧 Installerer npm avhengigheter
- 🔄 Kjører Prisma migrasjoner
- 🌱 Seeder database med test-data
- 👤 Oppretter admin-bruker (admin@test.no / admin123)

## �📋 System Oversikt

### Frontend Applikasjoner
| Port | Applikasjon | URL | Beskrivelse |
|------|-------------|-----|-------------|
| 3000 | Client App | http://localhost:3000 | Hovedapplikasjon for brukere |

### Backend Tjenester
| Port | Tjeneste | URL | Beskrivelse |
|------|----------|-----|-------------|
| 4000 | Backend API | http://localhost:4000 | REST API med integrert admin |

### Database
| Port | Tjeneste | URL | Beskrivelse |
|------|----------|-----|-------------|
| 5432 | PostgreSQL | localhost:5432 | Hoveddatabase (lokal installasjon) |

## 📝 Logger

Alle logger lagres i `logs/` mappen:
- `logs/backend.log` - Backend server logger
- `logs/client.log` - Frontend client logger
- `logs/backend.pid` - Backend prosess ID
- `logs/client.pid` - Frontend prosess ID

## 🔧 Andre Scripts

### `backup.sh` - Backup script
Backup av database og konfigurasjon.

```bash
./scripts/backup.sh
```

### `check-server-connections.ts` - Tilkoblingssjekk
TypeScript script for å sjekke server-tilkoblinger.

```bash
npx ts-node scripts/check-server-connections.ts
```

## 🆘 Feilsøking

### Problemer med oppstart?

1. **Sjekk Node.js:** `node --version` (krever 18+)
2. **Sjekk npm:** `npm --version` (krever 8+)
3. **Sjekk PostgreSQL:** `pg_isready -p 5432`
4. **Sjekk porter:** `lsof -i:3000` og `lsof -i:4000`

### Database-problemer?

```bash
# Sett opp database på nytt
./scripts/setup-local-db.sh

# Eller manuelt:
createdb tms_db
cd server
npx prisma migrate deploy
npx prisma db seed
```

### Logger viser feil?

```bash
# Følg logger i real-time
tail -f logs/backend.log
tail -f logs/client.log

# Sjekk spesifikke feil
grep "ERROR" logs/backend.log
```

### Tjenester starter ikke?

```bash
# Stopp alt og start på nytt
./scripts/stop.sh
./scripts/start.sh

# Eller kill prosesser manuelt
fuser -k 3000/tcp
fuser -k 4000/tcp
```

### Miljøvariabler mangler?

```bash
# Sjekk at .env eksisterer
ls -la server/.env

# Kopier fra eksempel
cp server/.env.example server/.env

# Rediger DATABASE_URL og secrets
nano server/.env
```

## 🎯 Utviklingsmodus

For utvikling kan du starte tjenestene separat:

```bash
# Backend i en terminal
cd server
npm run dev

# Frontend i en annen terminal
cd client  
npm start
```

Dette gir deg direkte tilgang til console.log output og hot-reload.

## 🔑 Standard Login

Etter database-oppsett kan du logge inn med:
- **E-post**: admin@test.no
- **Passord**: admin123

## 📊 System Status

Sjekk system-status:
- **Health Check**: http://localhost:4000/health
- **Database**: Via Prisma Studio: `cd server && npx prisma studio`
- **API Docs**: http://localhost:4000/api-docs (hvis aktivert)

## 🚀 Rask Kommandoer

```bash
# Full oppstart fra scratch
./scripts/setup-local-db.sh && ./scripts/start.sh

# Restart systemet
./scripts/stop.sh && ./scripts/start.sh

# Database reset
cd server && npx prisma migrate reset

# Logs cleanup
rm -rf logs/*.log logs/*.pid
``` 