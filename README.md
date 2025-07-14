# 🚛 TMS - Treningssystem for Sikkerhetskontroll

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-org/tms)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18%2B-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5%2B-blue.svg)](https://typescriptlang.org/)
[![API Documentation](https://img.shields.io/badge/API-documented-orange.svg)](http://localhost:3000/api-docs)

Omfattende treningssystem for sikkerhetskontroll bygget med moderne web-teknologier for norske transportbedrifter.

## 🎯 Oversikt

TMS er et komplett system for håndtering av sikkerhetskontroll, bedriftsstyring, og compliance-training for transportbedrifter. Systemet inkluderer interaktive treningsmoduler, digital inspeksjon, og omfattende brukeradministrasjon.

### ✨ Hovedfunksjoner

- 🎓 **Interaktiv Opplæring**: Sikkerhetskontroll-treningssystem
- 🏢 **Bedriftshåndtering**: Komplett bedrifts- og brukerstyring
- 🛡️ **Sikkerhetskontroll**: Digitale inspeksjoner og compliance-tracking
- 👥 **Brukeradministrasjon**: Integrert admin-portal
- 📊 **Rapportering**: Detaljert progresjon og statistikk
- 🔐 **Sikkerhet**: Rolle-basert tilgangskontroll
- 📱 **Responsiv Design**: Optimalisert for alle enheter

## 🏗️ Arkitektur

```
┌─────────────────────────────────────────────────────────┐
│                   TMS Applikasjon                       │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Frontend      │    │        Backend API          │ │
│  │   (React)       │◄──►│       (Node.js)             │ │
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

## 🚀 Rask Start

### Forutsetninger

- **Node.js** 18+ 
- **npm** 8+
- **PostgreSQL** 14+ (kjørende på port 5432)

### 1. Klon Repository

```bash
git clone https://github.com/your-org/tms.git
cd tms
```

### 2. Installer Dependencies

```bash
# Installer alle dependencies
npm run install:all
```

### 3. Database Oppsett

Sørg for at PostgreSQL kjører på port 5432. Database-migrasjoner kjøres automatisk ved oppstart.

### 4. Miljøvariabler

```bash
# Kopier environment template
cp server/.env.example server/.env

# Rediger miljøvariabler (DATABASE_URL til din PostgreSQL)
nano server/.env
```

### 5. Start Applikasjonen

```bash
# Enkel oppstart (anbefalt)
npm start

# Eller start hele systemet for utvikling
npm run dev

# Eller start individuelt:
npm run dev:server  # Backend på port 4000
npm run dev:client  # Frontend på port 3000
```

### 6. Tilgang til Systemet

- **TMS Applikasjon**: http://localhost:3000
- **API Dokumentasjon**: http://localhost:4000/api-docs

## 🆕 NYHET: Docker-fri Arkitektur!

🎉 **TMS har blitt forenklet!** Docker og mikroservices er fjernet for en enklere, raskere utviklingsopplevelse.

- ⚡ **10x raskere oppstart** - Fra 2-3 minutter til 10 sekunder
- 🔧 **Enklere vedlikehold** - En Node.js server i stedet for 29 mikroservices  
- 💾 **Mindre ressursbruk** - Ingen Docker overhead
- 📱 **SQLite for utvikling** - Ingen database-server nødvendig

Se `DOCKER_MICROSERVICE_REMOVAL_REPORT.md` for fullstendige detaljer.

## 📚 Systemmoduleer

### 🎓 Sikkerhetskontroll Læring
- Interaktive treningsmoduler
- Progresjonssporing
- Sertifisering og badges
- Mester-test funksjonalitet

### 🏢 Bedriftshåndtering
- Bedriftsregistrering og -administrasjon
- Brukeradministrasjon
- Rolle- og tilgangsstyring
- Organisasjonsstruktur

### 👥 Admin Portal
- Integrert administratorpanel
- System-overvåkning
- Bruker- og bedriftsstyring
- Sikkerhetskonfigurasjon

### 📊 Rapportering
- Detaljert progresjonsoversikt
- Statistikk og analyser
- Export-funksjonalitet
- Compliance-rapporter

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
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   └── services/      # Business logic
│   └── prisma/            # Database schema
├── shared/                 # Delte types og utilities
└── scripts/               # Deployment og utility scripts
```

### Tilgjengelige Scripts

```bash
# Utvikling
npm run dev                 # Start alle tjenester
npm run dev:client         # Start kun frontend
npm run dev:server         # Start kun backend

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
npm run lint:fix          # Fiks linting-problemer
npm run type-check        # TypeScript type checking
```

### Database Administrasjon

```bash
# Prisma commands
cd server
npx prisma studio          # Database GUI
npx prisma migrate dev     # Opprett ny migrasjon
npx prisma generate        # Generer Prisma klient
npx prisma seed           # Seed database
```

## 🛡️ Sikkerhet

### Sikkerhetsfunksjoner

- **Autentisering**: JWT-basert autentisering
- **Autorisasjon**: Rolle-basert tilgangskontroll
- **Input Validering**: Omfattende validering av alle inputs
- **Rate Limiting**: Beskytte mot misbruk
- **SQL Injection Prevention**: Parameteriserte queries
- **XSS Protection**: Content Security Policy

### Roller og Tilganger

| Rolle | Beskrivelse | Tilganger |
|-------|-------------|-----------|
| **ADMIN** | Systemadministrator | Full systemtilgang |
| **HOVEDBRUKER** | Bedriftsleder | Bedriftsstyring, rapporter |
| **BRUKER** | Standard bruker | Treningsmoduler, egen profil |
| **ELEV** | Lærling/trainee | Begrenset tilgang til treningssystem |

## 🧪 Testing

### Testtyper

```bash
# Unit testing
npm run test:unit

# Integration testing  
npm run test:integration

# End-to-end testing
npm run test:e2e

# Performance testing
npm run test:performance
```

### Test Coverage

Systemet har omfattende test-dekning:
- Unit tests for alle komponenter
- Integration tests for API-endepunkter
- E2E tests for kritiske brukerflyter
- Performance tests for responsivitet

## 📈 Deployment

### Lokal Deployment

```bash
# Produksjonsmodus
npm run build
npm start
```

### Environment Variables

| Variable | Beskrivelse | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | - |
| `JWT_SECRET` | JWT signing key | - |
| `LOG_LEVEL` | Logging level | `info` |

## 🤝 Bidrag

### Utvikling

1. Fork repository
2. Opprett feature branch (`git checkout -b feature/ny-funksjon`)
3. Commit endringer (`git commit -m 'Legg til ny funksjon'`)
4. Push til branch (`git push origin feature/ny-funksjon`)
5. Åpne Pull Request

### Code Standards

- **TypeScript**: Strict mode aktivert
- **ESLint**: Airbnb configuration
- **Prettier**: Automatisk code formatting
- **Husky**: Pre-commit hooks for kvalitetssikring

## 📄 Lisens

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 🆘 Support

### Dokumentasjon
- [API Dokumentasjon](http://localhost:3000/api-docs)
- [Utviklerdokumentasjon](docs/)

### Kontakt
- **Issues**: [GitHub Issues](https://github.com/your-org/tms/issues)
- **Diskusjoner**: [GitHub Discussions](https://github.com/your-org/tms/discussions)

---

**Bygget med ❤️ for norske transportbedrifter** 🇳🇴 