# TMS System Scripts

Dette er samlingsstedet for alle TMS system management scripts.

## 🚀 Start/Stopp Scripts

### `start.sh` - Enkelt System Start
Starter TMS-systemet med backend og frontend.

```bash
./scripts/start.sh
```

**Dette scriptet:**
- � Installerer npm avhengigheter hvis nødvendig
- �️ Setter opp PostgreSQL database (lokalt på port 5432)
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
- � Stopper frontend client
- 🔌 Frigjør porter 3000 og 4000
- ✅ Verifiserer at alt er stoppet

## 📋 System Oversikt

### Frontend Applikasjoner
| Port | Applikasjon | URL |
|------|-------------|-----|
| 3000 | Client App | http://localhost:3000 |

### Backend Tjenester
| Port | Tjeneste | URL |
|------|----------|-----|
| 4000 | Backend API | http://localhost:4000 |

### Database
| Port | Tjeneste | URL | Beskrivelse |
|------|----------|-----|-------------|
| 5432 | PostgreSQL | localhost:5432 | Hoveddatabase |

## 📝 Logger

Alle logger lagres i `logs/` mappen:
- `logs/backend.log` - Backend server logger
- `logs/client.log` - Frontend client logger
- `logs/backend.pid` - Backend prosess ID
- `logs/client.pid` - Frontend prosess ID

## 🔧 Andre Scripts

### `backup.sh` - Backup script
Backup av database og konfigurasjon.

## 🆘 Feilsøking

### Problemer med oppstart?
1. Sjekk at Node.js er installert: `node --version`
2. Sjekk at npm er installert: `npm --version`
3. Sjekk at PostgreSQL kjører på port 5432: `pg_isready -p 5432`
4. Sjekk at portene er ledige: `lsof -i:3000` og `lsof -i:4000`

### Logger viser feil?
- Backend: `tail -f logs/backend.log`
- Frontend: `tail -f logs/client.log`

### Tjenester starter ikke?
- Stopp alt: `./scripts/stop.sh`
- Start på nytt: `./scripts/start.sh`

### Database-problemer?
- Sjekk miljøvariabler i `server/.env`
- Kjør migrasjoner manuelt: `cd server && npx prisma migrate deploy`

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

Dette gir deg direkte tilgang til console.log output. 