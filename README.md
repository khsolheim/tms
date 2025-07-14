# 🚛 TMS - Treningssystem for Sikkerhetskontroll

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-org/tms)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18%2B-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue.svg)](https://typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue.svg)](https://postgresql.org/)
[![API Documentation](https://img.shields.io/badge/API-documented-orange.svg)](http://localhost:4000/api-docs)

Omfattende treningssystem for sikkerhetskontroll bygget med moderne web-teknologier for norske transportbedrifter.

## 🎯 Oversikt

TMS er et komplett system for håndtering av sikkerhetskontroll, bedriftsstyring, og compliance-training for transportbedrifter. Systemet inkluderer interaktive treningsmoduler, digital inspeksjon, og omfattende brukeradministrasjon.

### ✨ Hovedfunksjoner

- 🎓 **Interaktiv Opplæring**: Sikkerhetskontroll-treningssystem med adaptiv læring
- 🏢 **Bedriftshåndtering**: Komplett bedrifts- og brukerstyring
- 🛡️ **Sikkerhetskontroll**: Digitale inspeksjoner og compliance-tracking
- 👥 **Admin Portal**: Integrert administratorpanel med real-time dashboard
- 📊 **Rapportering**: Detaljert progresjon og statistikk
- 🔐 **Sikkerhet**: Rolle-basert tilgangskontroll og 2FA-støtte
- 📱 **Responsiv Design**: Optimalisert for alle enheter
- 🎮 **Gamification**: XP-system, achievements og leaderboards

## 🏗️ Arkitektur

```
┌─────────────────────────────────────────────────────────┐
│                   TMS System                            │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Frontend      │    │        Backend API          │ │
│  │   (React)       │◄──►│       (Node.js/Express)     │ │
│  │   Port: 3000    │    │       Port: 4000            │ │
│  └─────────────────┘    └─────────────────────────────┘ │
│                                      │                  │
│                         ┌─────────────────────────────┐ │
│                         │       Database              │ │
│                         │       (PostgreSQL)          │ │
│                         │       Port: 5432            │ │
│                         └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Enkelt og effektivt:**
- **En enkelt backend server** med all business logic
- **PostgreSQL database** kjørende lokalt
- **React frontend** med modern UI/UX
- **Ingen Docker-avhengigheter** - kjører direkte på systemet

## 🚀 Rask Start

### Forutsetninger

- **Node.js** 18+ 
- **npm** 8+
- **PostgreSQL** 15+ (kjørende på port 5432)

### 1. Klon Repository

```bash
git clone https://github.com/your-org/tms.git
cd tms
```

### 2. Sett opp Database

```bash
# Automatisk database setup (anbefalt)
./scripts/setup-local-db.sh
```

Eller manuelt:
```bash
# Opprett database
createdb tms_db

# Sett opp .env fil
cp server/.env.example server/.env
# Rediger DATABASE_URL og andre miljøvariabler
```

### 3. Installer Avhengigheter

```bash
# Installer alle dependencies
npm run install:all
```

### 4. Start Systemet

```bash
# Start hele systemet (backend + frontend)
npm start

# Eller bruk utviklerscripts
./scripts/start.sh
```

### 5. Tilgang til Systemet

- **TMS Applikasjon**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Admin Login**: admin@test.no / admin123

## 📚 Systemmoduler

### 🎓 Sikkerhetskontroll Læring
- Interaktive treningsmoduler med "Bygg Bilen"-metafor
- Progresjonssporing og adaptiv vanskelighetsgrad
- XP-system med achievements og leaderboards
- Quiz-system med moderne teknologi

### 🏢 Bedriftshåndtering
- Bedriftsregistrering med Brønnøysund-integrasjon
- Ansatt- og elevadministrasjon
- Rolle- og tilgangsstyring
- Organisasjonsstruktur

### 👥 Admin Portal
- Real-time system dashboard
- Bruker- og bedriftsstyring
- Sikkerhetskonfiguration og audit logging
- System performance monitoring

### 📊 Rapportering & Analytics
- Detaljert progresjonsoversikt
- Statistikk og analyser med interaktive charts
- Export-funksjonalitet
- Compliance-rapporter

### 💰 Annonsør/Sponsor System
- Geografisk targeting av annonser
- Sponsor-management for elever
- Analytics og click-through tracking
- Revenue generation system

## 🔧 Utvikling

### Prosjektstruktur

```
tms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Gjenbrukbare komponenter
│   │   ├── pages/         # Side-komponenter
│   │   ├── services/      # API-tjenester
│   │   └── contexts/      # React contexts
│   └── public/
├── server/                 # Node.js backend (integrert admin)
│   ├── src/
│   │   ├── routes/        # API routes (inkl. admin)
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── config/        # Konfigurasjon
│   └── prisma/            # Database schema og migrasjoner
├── mobile/                 # React Native app
├── scripts/               # Setup og deployment scripts
└── docs/                  # Dokumentasjon
```

### Tilgjengelige Scripts

```bash
# Utvikling
npm start                  # Start hele systemet
npm run dev                # Start i utviklermodus
npm run dev:client         # Start kun frontend
npm run dev:server         # Start kun backend

# Database
./scripts/setup-local-db.sh # Sett opp lokal database
npm run db:migrate         # Kjør migrasjoner
npm run db:seed           # Seed database

# Bygging
npm run build              # Bygg alle moduler
npm run build:client       # Bygg frontend
npm run build:server       # Bygg backend

# Testing
npm run test               # Kjør alle tester
npm run test:client        # Test frontend
npm run test:server        # Test backend
npm run test:e2e          # End-to-end testing

# Code Quality
npm run lint              # Lint kodebase
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript sjekk

# Vedlikehold
npm run clean             # Rens build-filer
npm run security:audit    # Sikkerhetsjekk
```

## �️ Konfigurasjon

### Database Konfigurasjon

Standard database URL: `postgresql://postgres:postgres@localhost:5432/tms_db`

Juster `DATABASE_URL` i `server/.env` for ditt oppsett.

### Miljøvariabler

Kopier `server/.env.example` til `server/.env` og juster verdier:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tms_db"

# Sikkerhet
JWT_SECRET="your-secret-key"
BCRYPT_ROUNDS=12

# Server
PORT=4000
NODE_ENV=development
```

### Admin Bruker

Standard admin-bruker opprettes automatisk:
- **E-post**: admin@test.no
- **Passord**: admin123

## 🔒 Sikkerhet

- **JWT Authentication** med refresh tokens
- **Bcrypt password hashing** (12 rounds)
- **Rolle-basert tilgangskontroll** (RBAC)
- **SQL injection beskyttelse** via Prisma ORM
- **Rate limiting** på API-endepunkter
- **Input validering** med Zod
- **CORS-konfigurasjon** for sikre cross-origin requests

## 📈 Performance

- **Database indexing** for optimale spørringer
- **Connection pooling** for database-tilkoblinger
- **Lazy loading** av React-komponenter
- **Query optimization** med Prisma
- **Caching** via in-memory eller Redis
- **Bundle optimization** for frontend

## � Deployment

Systemet er designet for enkel deployment:

```bash
# Produksjonsbygg
npm run build

# Start produksjonsserver
cd server && npm start
```

For avansert deployment, se `docs/DEPLOYMENT.md`.

## 🤝 Bidrag

1. Fork prosjektet
2. Opprett feature branch (`git checkout -b feature/ny-funksjon`)
3. Commit endringer (`git commit -am 'Legger til ny funksjon'`)
4. Push til branch (`git push origin feature/ny-funksjon`)
5. Opprett Pull Request

## 📄 Lisens

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 🆘 Support

- **Dokumentasjon**: `/docs` mappen
- **API Docs**: http://localhost:4000/api-docs
- **Issues**: GitHub Issues
- **E-post**: support@tms-system.no

---

Bygget med ❤️ av TMS Team 