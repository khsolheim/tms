# 🚛 TMS - Traffic Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-org/tms)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://hub.docker.com/r/your-org/tms)
[![Kubernetes](https://img.shields.io/badge/kubernetes-ready-326ce5.svg)](https://kubernetes.io/)
[![API Documentation](https://img.shields.io/badge/API-documented-orange.svg)](http://localhost:4000/api-docs)
[![Monitoring](https://img.shields.io/badge/monitoring-grafana-ff6b35.svg)](http://localhost:3001)

Omfattende Traffic Management System bygget med moderne teknologier for norske transportbedrifter.

## 🎯 Oversikt

TMS er et komplett system for håndtering av trafikksikkerhet, bedriftsstyring, og compliance for transportbedrifter. Systemet inkluderer avansert sikkerhetskontroll, real-time monitoring, og omfattende rapportering.

### ✨ Hovedfunksjoner

- 🔐 **Avansert Sikkerhet**: Multi-layer sikkerhet med trussel-deteksjon og IP-blokkering
- 🏢 **Bedriftshåndtering**: Komplett bedrifts- og brukerstyring
- 🛡️ **Sikkerhetskontroll**: Digitale inspeksjoner og compliance-tracking
- 📊 **Real-time Monitoring**: Prometheus + Grafana dashboard
- 🚀 **High Performance**: Avansert caching og database-optimalisering
- 📋 **API-first**: Komplett REST API med Swagger-dokumentasjon
- 🐳 **Container-ready**: Docker og Kubernetes deployment
- 🧪 **Load Testing**: Artillery-basert performance testing

## 🏗️ Arkitektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────►│   (Cache)       │◄─────────────┘
                        │   Port: 6379    │
                        └─────────────────┘
                                 │
                    ┌─────────────────────────────┐
                    │      Monitoring Stack       │
                    │                             │
                    │  ┌─────────┐ ┌─────────┐   │
                    │  │Prometheus│ │ Grafana │   │
                    │  │Port: 9090│ │Port:3001│   │
                    │  └─────────┘ └─────────┘   │
                    │                             │
                    │  ┌─────────┐ ┌─────────┐   │
                    │  │AlertMgr │ │  Nginx  │   │
                    │  │Port: 9093│ │Port: 80 │   │
                    │  └─────────┘ └─────────┘   │
                    └─────────────────────────────┘
```

## 🚀 Rask Start

### Forutsetninger

- **Node.js** 18+ 
- **Docker** & **Docker Compose**
- **PostgreSQL** 14+
- **Redis** 6+

### 1. Klon Repository

```bash
git clone https://github.com/your-org/tms.git
cd tms
```

### 2. Miljøvariabler

```bash
# Kopier environment template
cp server/.env.example server/.env

# Rediger miljøvariabler
nano server/.env
```

### 3. Start med Docker Compose

```bash
# Start alle tjenester
docker-compose up -d

# Eller bruk deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh development
```

### 4. Tilgang til Tjenester

| Tjeneste | URL | Beskrivelse |
|----------|-----|-------------|
| **TMS API** | http://localhost:4000 | Hovedapplikasjon |
| **API Docs** | http://localhost:4000/api-docs | Swagger dokumentasjon |
| **Grafana** | http://localhost:3001 | Monitoring dashboard |
| **Prometheus** | http://localhost:9090 | Metrics database |
| **AlertManager** | http://localhost:9093 | Alert management |

**Standard innlogging:**
- Grafana: `admin` / `admin123`

## 📚 Dokumentasjon

### API Dokumentasjon
- **Swagger UI**: http://localhost:4000/api-docs
- **OpenAPI JSON**: http://localhost:4000/api-docs.json

### Systemdokumentasjon
- [Implementeringsrapport](docs/FINAL_IMPLEMENTATION_REPORT.md)
- [Sikkerhetsdokumentasjon](docs/SECURITY_IMPLEMENTATION.md)
- [Database Schema](server/prisma/schema.prisma)

## 🔧 Utvikling

### Lokal Utvikling

```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start

# Database migrations
cd server
npx prisma migrate dev
npx prisma generate
```

### Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load testing
cd tests/load
artillery run artillery-config.yml
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## 🐳 Deployment

### Docker Deployment

```bash
# Development
./scripts/deploy.sh development

# Med performance testing
./scripts/deploy.sh development --test

# Med monitoring setup
./scripts/deploy.sh development --test --monitoring
```

### Kubernetes Deployment

```bash
# Production deployment
./scripts/deploy.sh production

# Manual kubectl
kubectl apply -f k8s/base/
kubectl apply -f k8s/overlays/production/
```

### Environment Variables

| Variable | Beskrivelse | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection | - |
| `REDIS_URL` | Redis connection | - |
| `JWT_SECRET` | JWT signing key | - |
| `LOG_LEVEL` | Logging level | `info` |

## 📊 Monitoring & Observability

### Metrics

TMS eksponerer omfattende metrics via Prometheus:

- **HTTP Metrics**: Request rate, response time, error rate
- **Database Metrics**: Connection pool, query performance
- **Cache Metrics**: Hit rate, memory usage
- **Security Metrics**: Threat detection, blocked IPs
- **Business Metrics**: User activity, system usage

### Dashboards

Grafana dashboards inkluderer:

- **System Overview**: Health, performance, errors
- **API Performance**: Response times, throughput
- **Security Dashboard**: Threats, incidents, blocks
- **Business Metrics**: User activity, feature usage

### Alerting

Automatiske varsler for:

- 🚨 **Kritiske**: System down, høy feilrate
- ⚠️ **Advarsler**: Høy responstid, minnebruk
- 📊 **Info**: Deployment, configuration changes

## 🛡️ Sikkerhet

### Implementerte Sikkerhetstiltak

- **Autentisering**: JWT Bearer tokens
- **Autorisasjon**: Role-based access control (RBAC)
- **Input Validering**: Zod schema validation
- **Rate Limiting**: Adaptive rate limiting per endpoint
- **Threat Detection**: 15 avanserte trussel-mønstre
- **IP Protection**: Intelligent blokkering med whitelist
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Audit Logging**: Komplett audit trail

### Sikkerhetskonfigurasjon

```typescript
// Eksempel sikkerhetskonfigurasjon
const securityConfig = {
  enableThreatDetection: true,
  enableIPBlocking: true,
  blockDuration: 3600000, // 1 time
  alertThreshold: 10,
  trustedProxies: ['127.0.0.1', '::1']
};
```

## 🧪 Performance Testing

### Load Testing med Artillery

```bash
# Kjør load test
cd tests/load
artillery run artillery-config.yml

# Generer rapport
artillery report report.json --output report.html
```

### Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Response Time (P95) | < 1000ms | ~200ms |
| Throughput | > 100 req/s | ~500 req/s |
| Error Rate | < 1% | ~0.1% |
| Cache Hit Rate | > 80% | ~95% |

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build Docker image
        run: docker build -t tms:${{ github.sha }} .
```

## 📈 Skalerbarhet

### Horizontal Scaling

```bash
# Docker Compose scaling
docker-compose up -d --scale tms-backend=3

# Kubernetes scaling
kubectl scale deployment tms-backend --replicas=5
```

### Database Optimalisering

- **Connection Pooling**: 10 connections per instance
- **Query Optimization**: Intelligent query analyzer
- **Indexing**: Automatisk index-anbefalinger
- **Caching**: Multi-layer cache med Redis

## 🤝 Bidrag

### Utvikling

1. Fork repository
2. Opprett feature branch (`git checkout -b feature/amazing-feature`)
3. Commit endringer (`git commit -m 'Add amazing feature'`)
4. Push til branch (`git push origin feature/amazing-feature`)
5. Åpne Pull Request

### Code Standards

- **TypeScript**: Strict mode aktivert
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📄 Lisens

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 🆘 Support

### Dokumentasjon
- [API Dokumentasjon](http://localhost:4000/api-docs)
- [System Monitoring](http://localhost:3001)
- [Implementeringsguide](docs/)

### Kontakt
- **Email**: support@tms.no
- **Issues**: [GitHub Issues](https://github.com/your-org/tms/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/tms/discussions)

---

## 🎉 Takk til

Spesiell takk til alle bidragsytere som har gjort TMS til et robust og skalerbart system for norske transportbedrifter.

**Bygget med ❤️ i Norge** 🇳🇴 