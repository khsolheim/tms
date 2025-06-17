# TMS Microservices Architecture

## 🏗️ Arkitektur Oversikt

TMS (Transport Management System) er bygget med en moderne microservices-arkitektur som gir skalerbarhet, vedlikeholdbarhet og fleksibilitet.

### 🔧 Komponenter

#### API Gateway (Port 8000)
- **Rolle**: Sentral inngangsport for alle API-kall
- **Ansvar**: Routing, autentisering, rate limiting, logging
- **Teknologi**: Express.js, HTTP Proxy Middleware
- **URL**: http://localhost:8000

#### Microservices

1. **Auth Service (Port 8001)**
   - Brukerautentisering og autorisasjon
   - JWT token-håndtering
   - Passord-hashing og validering

2. **User Service (Port 8002)**
   - Brukeradministrasjon
   - Profil-håndtering
   - Rolle- og tilgangsstyring

3. **Quiz Service (Port 8003)**
   - Quiz-opprettelse og -administrasjon
   - Spørsmål og svar-håndtering
   - Resultat-tracking

4. **Sikkerhetskontroll Service (Port 8004)**
   - Sikkerhetskontroller og sjekklister
   - Kontroll-resultater
   - Compliance-rapportering

5. **HR Service (Port 8005)**
   - Ansatt-administrasjon
   - Organisasjonsstruktur
   - HR-prosesser

6. **Economy Service (Port 8006)**
   - Økonomiske transaksjoner
   - Fakturering og betalinger
   - Finansiell rapportering

#### Infrastruktur

- **PostgreSQL**: Primær database (Port 5432)
- **Redis**: Caching og session-håndtering (Port 6379)
- **Prometheus**: Metrics og monitoring (Port 9090)
- **Grafana**: Visualisering og dashboards (Port 3002)

## 🚀 Kom i Gang

### Forutsetninger

- Docker og Docker Compose installert
- Node.js 18+ (for lokal utvikling)
- Git

### Rask Start

```bash
# Klon repository
git clone <repository-url>
cd tms/microservices

# Start alle services
./scripts/start-microservices.sh

# Stopp alle services
./scripts/stop-microservices.sh
```

### Lokal Utvikling

For å utvikle en enkelt service lokalt:

```bash
# Naviger til service-mappen
cd services/auth-service

# Installer avhengigheter
npm install

# Start i development-modus
npm run dev
```

## 📊 Service Discovery

API Gateway bruker en innebygd service registry for å holde styr på alle microservices. Services registrerer seg automatisk ved oppstart.

### Health Checks

Alle services har health check-endepunkter:

- **API Gateway**: http://localhost:8000/health
- **Service Status**: http://localhost:8000/services
- **Individual Services**: http://localhost:[PORT]/health

## 🔐 Sikkerhet

### Autentisering

1. Brukere logger inn via Auth Service
2. JWT token returneres
3. Token sendes i Authorization header: `Bearer <token>`
4. API Gateway validerer token før routing

### Autorisasjon

- Rolle-basert tilgangskontroll (RBAC)
- Service-nivå autorisasjon
- Endpoint-spesifikke tilganger

## 📈 Monitoring og Logging

### Prometheus Metrics

Tilgjengelig på http://localhost:9090

- Request rates og latency
- Error rates
- Service health status
- Custom business metrics

### Grafana Dashboards

Tilgjengelig på http://localhost:3002 (admin/admin)

- Service performance dashboards
- Infrastructure monitoring
- Business metrics visualization

### Logging

Alle services logger til:
- Console (development)
- File-baserte logs
- Strukturert JSON-logging

## 🔄 Inter-Service Communication

### Synkron Kommunikasjon

- HTTP REST API-kall via API Gateway
- Service-to-service kommunikasjon via interne endepunkter

### Asynkron Kommunikasjon

- Event-driven arkitektur (planlagt)
- Message queues for bakgrunnsjobber
- Pub/Sub for real-time oppdateringer

## 🗄️ Database Design

### Shared Database Pattern

Alle services deler samme PostgreSQL-database men har:
- Separate tabeller per domene
- Klare data-eierskap grenser
- Transaksjonell konsistens

### Migration Strategy

```bash
# Kjør database migrasjoner
cd server
npx prisma migrate deploy
```

## 🐳 Docker og Deployment

### Development Environment

```bash
# Start med Docker Compose
docker-compose -f infrastructure/docker/docker-compose.microservices.yml up -d
```

### Production Deployment

Kubernetes manifester er tilgjengelige i `infrastructure/kubernetes/`:

```bash
# Deploy til Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

## 🧪 Testing

### Unit Tests

```bash
# Test en enkelt service
cd services/auth-service
npm test
```

### Integration Tests

```bash
# Test hele systemet
npm run test:integration
```

### Load Testing

```bash
# Performance testing
npm run test:load
```

## 📝 API Dokumentasjon

### OpenAPI/Swagger

Hver service har sin egen API-dokumentasjon:

- Auth Service: http://localhost:8001/docs
- User Service: http://localhost:8002/docs
- Quiz Service: http://localhost:8003/docs
- osv.

### Postman Collection

Import `docs/postman/TMS-Microservices.json` for komplett API-testing.

## 🔧 Utvikling

### Legge til Ny Service

1. Opprett service-mappe i `services/`
2. Kopier template fra eksisterende service
3. Oppdater Docker Compose-fil
4. Legg til routing i API Gateway
5. Oppdater dokumentasjon

### Code Standards

- TypeScript for type safety
- ESLint og Prettier for code formatting
- Conventional commits for git history
- Jest for testing

## 🚨 Troubleshooting

### Vanlige Problemer

**Service ikke tilgjengelig:**
```bash
# Sjekk service status
docker-compose -f infrastructure/docker/docker-compose.microservices.yml ps

# Se logs
docker-compose -f infrastructure/docker/docker-compose.microservices.yml logs [service-name]
```

**Database connection issues:**
```bash
# Restart database
docker-compose -f infrastructure/docker/docker-compose.microservices.yml restart postgres

# Check database logs
docker-compose -f infrastructure/docker/docker-compose.microservices.yml logs postgres
```

**Port conflicts:**
```bash
# Check what's using ports
lsof -i :8000-8006
```

## 📞 Support

For spørsmål eller problemer:
- Opprett issue i repository
- Kontakt development team
- Se dokumentasjon i `docs/` mappen

## 🗺️ Roadmap

### Neste Steg

1. **Event-Driven Architecture**: Implementer asynkron kommunikasjon
2. **Service Mesh**: Istio for avansert networking
3. **CQRS**: Command Query Responsibility Segregation
4. **Event Sourcing**: For audit trails og replay-muligheter
5. **Distributed Tracing**: Jaeger for request tracing
6. **Circuit Breakers**: Resilience patterns

### Fremtidige Forbedringer

- Auto-scaling basert på load
- Blue-green deployments
- Canary releases
- Multi-region deployment
- Advanced security scanning 