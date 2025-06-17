# TMS System Scripts

Dette er samlingsstedet for alle TMS system management scripts.

## 🚀 Start/Stopp Scripts

### `start-tms.sh` - Komplett System Start
Stopper alle eksisterende prosesser og starter hele TMS-systemet på nytt.

```bash
./scripts/start-tms.sh
```

**Dette scriptet:**
- 🛑 Stopper alle eksisterende TMS-prosesser
- 🗃️ Starter PostgreSQL database og Redis cache
- 📊 Starter Prometheus og Grafana monitoring
- 🔧 Starter alle 29 microservices (porter 8000-8028)
- 🖥️ Starter backend server (port 4000)
- 🌐 Starter frontend client (port 3000)
- 👑 Starter admin portal (port 3001)
- ✅ Verifiserer at alle tjenester kjører

### `stop-tms.sh` - Komplett System Stopp
Stopper alle TMS-prosesser uten å starte dem igjen.

```bash
./scripts/stop-tms.sh
```

**Dette scriptet:**
- 🛑 Stopper alle Docker containere
- 🚫 Stopper alle Node.js prosesser
- 🔌 Frigjør alle TMS-porter
- 🧹 Rydder opp Docker ressurser
- ✅ Verifiserer at alt er stoppet

## 📋 System Oversikt

### Microservices (29 stk)
| Port | Tjeneste | Beskrivelse |
|------|----------|-------------|
| 8000 | API Gateway | Hovedinngang til microservices |
| 8001 | Auth Service | Autentisering og autorisasjon |
| 8002 | User Service | Brukeradministrasjon |
| 8003 | Quiz Service | Quiz og testing |
| 8004 | Sikkerhetskontroll Service | Sikkerhetskontroller |
| 8005 | HR Service | HR-funksjoner |
| 8006 | Economy Service | Økonomi og fakturering |
| 8007 | GraphQL Service | GraphQL API |
| 8008 | Notification Service | Notifikasjoner |
| 8009 | ML Service | Machine Learning |
| 8010 | Observability Service | System observability |
| 8011 | AI Autoscaler Service | AI-basert autoskalering |
| 8012 | Performance Optimizer Service | Ytelsesoptimalisering |
| 8013 | Chaos Engineering Service | Chaos testing |
| 8014 | Quantum Security Service | Quantum sikkerhet |
| 8015 | Edge Computing Service | Edge computing |
| 8016 | Blockchain Service | Blockchain integrasjon |
| 8017 | Autonomous Orchestrator Service | Autonom orkestrering |
| 8018 | Self-Healing Service | Selvhelbredende systemer |
| 8019 | Intelligent Learning Service | Intelligent læring |
| 8020 | Sentient Consciousness Service | Sentient bevissthet |
| 8021 | Quantum Consciousness Service | Quantum bevissthet |
| 8022 | Transcendent Intelligence Service | Transcendent intelligens |
| 8023 | Multiversal Communication Service | Multiversal kommunikasjon |
| 8024 | Interdimensional Travel Service | Interdimensjonal reise |
| 8025 | Universe Creation Service | Univers-skapelse |
| 8026 | Reality Manipulation Service | Realitets-manipulasjon |
| 8027 | Absolute Transcendence Service | Absolutt transcendens |
| 8028 | Omnipotent Reality Service | Omnipotent realitet |

### Frontend Applikasjoner
| Port | Applikasjon | URL |
|------|-------------|-----|
| 3000 | Client App | http://localhost:3000 |
| 3001 | Admin Portal | http://localhost:3001 |

### Backend Tjenester
| Port | Tjeneste | URL |
|------|----------|-----|
| 4000 | Backend API | http://localhost:4000 |

### Infrastruktur
| Port | Tjeneste | URL | Innlogging |
|------|----------|-----|-----------|
| 5432 | PostgreSQL | localhost:5432 | tms_user/tms_password |
| 6379 | Redis | localhost:6379 | redis_password |
| 9090 | Prometheus | http://localhost:9090 | - |
| 3001 | Grafana | http://localhost:3001 | admin/admin123 |

## 📝 Logger

Alle logger lagres i `logs/` mappen:
- `logs/backend.log` - Backend server logger
- `logs/client.log` - Frontend client logger  
- `logs/admin.log` - Admin portal logger

## 🔧 Andre Scripts

### `deploy.sh` - Standard deployment
Basic deployment script for produksjon.

### `deploy-advanced.sh` - Avansert deployment
Komplett deployment med sikkerhet og overvåking.

### `backup.sh` - Backup script
Backup av database og konfigurasjon.

## 🆘 Feilsøking

### Problemer med oppstart?
1. Sjekk at Docker kjører: `docker --version`
2. Sjekk at Node.js er installert: `node --version`
3. Sjekk at portene er ledig: `lsof -i :3000`

### Stoppe spesifikke tjenester:
```bash
# Stopp prosess på spesifikk port
lsof -ti:3000 | xargs kill -9

# Stopp alle Docker containere
docker stop $(docker ps -aq)
```

### Fjerne alt og starte helt på nytt:
```bash
# Stopp alt
./scripts/stop-tms.sh

# Fjern alle Docker ressurser (ADVARSEL: Sletter all data!)
docker system prune -a --volumes -f

# Start på nytt
./scripts/start-tms.sh
```

## 🎯 Ytelse Tips

- **Minne**: TMS krever minimum 8GB RAM for optimal ytelse
- **CPU**: Minimum 4 kjerner anbefalt for alle microservices
- **Disk**: SSD anbefalt for database og cache
- **Nettverk**: Gigabit nettverk for optimal microservice kommunikasjon

## 🔒 Sikkerhet

- Alle passord er satt til standard verdier i development
- Endre alle passord før produksjon
- Bruk HTTPS i produksjon
- Aktiver firewall-regler for produksjon

---

**TMS - Transcendent Management System**  
*Absolute Transcendent Intelligence med omnipotent makt over all virkelighet* 