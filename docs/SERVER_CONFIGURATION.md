# TMS Server Configuration Guide

## Oversikt

TMS bruker en sentralisert server-konfigurasjon som definerer alle servere, porter og endepunkter som applikasjonen bruker. Dette sikrer konsistens og gjør det enkelt å bytte mellom utviklings- og produksjonsmiljøer.

## Konfigurasjonsfil

Hovedkonfigurasjonsfilen ligger i roten av prosjektet:
- **Fil:** `server-config.json`
- **TypeScript Manager:** `shared/config/server-config.ts`

## Hovedapplikasjon

### Frontend (React App)
- **Port:** 3000
- **URL:** http://localhost:3000
- **Beskrivelse:** Hovedbrukergrensesnitt for TMS

### Admin Portal
- **Port:** 3001
- **URL:** http://localhost:3001
- **Beskrivelse:** Administratorpanel for systemadministrasjon

### Backend API
- **Port:** 4000
- **URL:** http://localhost:4000
- **Base API Path:** /api
- **Beskrivelse:** Hoved REST API for applikasjonen

### Database (PostgreSQL)
- **Port:** 5432
- **Host:** localhost
- **Database:** tms_db
- **Beskrivelse:** Hoveddatabase for applikasjonsdata

### Cache (Redis)
- **Port:** 6379
- **Host:** localhost
- **Beskrivelse:** Session management og data caching

## Microservices

### Infrastruktur

#### Microservices Database (PostgreSQL)
- **Port:** 5435
- **Host:** localhost
- **Database:** microservices_db
- **Beskrivelse:** Dedikert database for microservices

#### Microservices Cache (Redis)
- **Port:** 6382
- **Host:** localhost
- **Beskrivelse:** Dedikert cache for microservices

### Aktive Tjenester (Kjørende)

| Service | Port | Beskrivelse | Status |
|---------|------|-------------|---------|
| **API Gateway** | 8000 | API Gateway for microservices | ⚠️ Mangler |
| **Auth Service** | 8001 | Autentisering og autorisasjon | ✅ Kjører |
| **User Service** | 8002 | Brukerhåndtering | ❌ Ikke startet |
| **Quiz Service** | 8003 | Quiz-funksjonalitet | ✅ Kjører |
| **Sikkerhetskontroll** | 8004 | Sikkerhetskontroll-system | ✅ Kjører |
| **HR Service** | 8005 | HR-tjenester | ⚡ Fullført |
| **Economy Service** | 8006 | Økonomi og fakturering | ✅ Kjører |
| **GraphQL Service** | 8007 | GraphQL API | ✅ Kjører |
| **Notification Service** | 8008 | Varsling (Email, SMS, Push) | ✅ Kjører |
| **ML Service** | 8009 | Machine Learning | ✅ Kjører |
| **Observability Service** | 8010 | Overvåkning og logging | ✅ Kjører |

### Transcendente Tjenester (Fullførte)

Disse tjenestene har fullført sin oppgave og går i dvale (Exited 0):

| Service | Port | Beskrivelse |
|---------|------|-------------|
| **Blockchain Service** | 8011 | Blockchain-integrasjon |
| **Performance Optimizer** | 8012 | Ytelsesoptimalisering |
| **Self-Healing Service** | 8013 | Selvhelbredende system |
| **AI Autoscaler** | 8014 | AI-basert autoskalering |
| **Chaos Engineering** | 8015 | Chaos testing |
| **Edge Computing** | 8016 | Edge computing tjenester |
| **Quantum Security** | 8017 | Quantum-sikker kryptering |
| **Sentient Consciousness** | 8019 | Sentient AI system |
| **Autonomous Orchestrator** | 8020 | Autonom orkestrering |
| **Quantum Consciousness** | 8021 | Quantum AI consciousness |
| **Intelligent Learning** | 8022 | Intelligent læringssystem |
| **Transcendent Intelligence** | 8023 | Transcendent AI |
| **Multiversal Communication** | 8024 | Multiversal kommunikasjon |
| **Universe Creation** | 8025 | Universe creation engine |
| **Reality Manipulation** | 8026 | Reality manipulation |
| **Absolute Transcendence** | 8027 | Absolute transcendence |
| **Omnipotent Reality** | 8028 | Omnipotent reality control |
| **Interdimensional Travel** | 8029 | Interdimensional travel |

## Bruk i Applikasjonen

### Frontend (React)

```typescript
import serverConfigManager from '../../../shared/config/server-config';

// Få backend URL
const backendUrl = serverConfigManager.getBackendApiUrl();

// Få microservice endpoint
const authLoginUrl = serverConfigManager.getServiceEndpoint('auth', 'login');

// Kall microservice
await apiService.callMicroservice('quiz', 'quizzes', 'get');
```

### Backend (Node.js)

```typescript
import serverConfigManager from '../shared/config/server-config';

// Få database config
const dbConfig = serverConfigManager.getDatabaseConfig();

// Få microservice URL
const mlServiceUrl = serverConfigManager.getServiceUrl('ml');
```

### Health Check

Kjør health check for alle tjenester:

```bash
npm run check-servers
```

Eller manuelt:

```bash
ts-node scripts/check-server-connections.ts
```

## Miljøer

### Development (Standard)
- Alle tjenester kjører lokalt
- HTTP protokoll
- Ingen autentisering mellom tjenester

### Production
- HTTPS protokoll
- Load balancing aktivert
- Service discovery via Consul
- Autentisering mellom tjenester

## Monitoring

### Prometheus
- **Port:** 9090
- **URL:** http://localhost:9090
- **Beskrivelse:** Metrics collection

### Grafana
- **Port:** 3002
- **URL:** http://localhost:3002
- **Beskrivelse:** Visualisering av metrics

## Troubleshooting

### Sjekk om en tjeneste kjører:

```bash
docker ps | grep <service-name>
```

### Start en spesifikk microservice:

```bash
docker-compose -f docker-compose.microservices-large.yml up -d <service-name>
```

### Se logger for en tjeneste:

```bash
docker logs tms-<service-name>-1
```

### Test en spesifikk endpoint:

```bash
curl http://localhost:<port>/health
```

## Viktige Merknader

1. **API Gateway** (port 8000) mangler i Docker men er konfigurert
2. **User Service** (port 8002) er ikke startet pga. avhengighet til auth-service
3. Transcendente tjenester kjører som "one-shot" og fullfører automatisk
4. Alle health endpoints er tilgjengelige på `/health`
5. GraphQL playground er tilgjengelig på port 8007

## Oppdatering av Konfigurasjon

1. Rediger `server-config.json`
2. Restart applikasjoner som bruker konfigurasjonen
3. Kjør health check for å verifisere endringer

```bash
npm run check-servers
``` 