# TMS Arkitektur Plan - Bruker/Admin Separasjon

## 📋 Oversikt
Dette dokumentet beskriver den dramatiske omstruktureringen av TMS-applikasjonen fra en monolittisk løsning til en todelt arkitektur med separate bruker- og admin-grensesnitt.

## 🎯 Hovedmål
1. **Brukerside**: Kundevendt portal for bedrifter og elever
2. **Adminside**: Administrativ kontrollpanel for systemstyring
3. **Tjeneste-aktivering**: Bedrifter kan aktivere/deaktivere moduler
4. **Felles design**: Konsistent utseende på begge sider
5. **Sikkerhet**: Rollbasert tilgangskontroll

---

## 🏗️ Arkitektur Oversikt

### Nåværende Struktur
```
TMS/
├── client/          # Monolittisk frontend
├── server/          # Backend API
└── admin/           # (ny mappe)
```

### Ny Struktur
```
TMS/
├── client/          # Brukerside (kunde-portal)
├── admin/           # Adminside (kontrollpanel)
├── shared/          # Delte komponenter og utilities
├── server/          # Backend API (utvidet)
└── docs/            # Dokumentasjon
```

---

## 🔄 Fase 1: Planlegging og Forberedelse

### 1.1 Mappestruktur Oppsett
```
admin/
├── src/
│   ├── components/
│   │   ├── common/          # Delte komponenter
│   │   ├── dashboard/       # Dashboard komponenter
│   │   ├── security/        # Sikkerhetsstyring
│   │   ├── services/        # Tjenestestyring
│   │   └── monitoring/      # System monitoring
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Security/
│   │   ├── Services/
│   │   ├── Bedrifter/
│   │   ├── Brukere/
│   │   └── System/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── public/
├── package.json
└── README.md

shared/
├── components/
│   ├── ui/              # Basis UI komponenter
│   ├── layout/          # Layout komponenter
│   └── forms/           # Form komponenter
├── styles/
│   ├── globals.css
│   └── themes/
├── types/
│   ├── api.ts
│   ├── user.ts
│   └── services.ts
└── utils/
    ├── auth.ts
    ├── api.ts
    └── validation.ts
```

### 1.2 Backend Utvidelser
```
server/src/
├── routes/
│   ├── admin/           # Admin-spesifikke ruter
│   │   ├── dashboard.routes.ts
│   │   ├── security.routes.ts
│   │   ├── services.routes.ts
│   │   └── monitoring.routes.ts
│   ├── services/        # Tjenestestyring
│   └── monitoring/      # System monitoring
├── middleware/
│   ├── adminAuth.ts     # Admin autentisering
│   └── serviceCheck.ts  # Tjeneste tilgangskontroll
└── models/
    ├── Service.ts       # Tjeneste modell
    └── BedriftService.ts # Bedrift-tjeneste kobling
```

---

## 🔐 Fase 2: Sikkerhet og Autentisering

### 2.1 Rollbasert Tilgangskontroll

#### Roller Hierarki
```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',     // Full systemtilgang
  ADMIN = 'ADMIN',                 // Bedrift admin
  HR_MANAGER = 'HR_MANAGER',       // HR modul tilgang
  INSTRUCTOR = 'INSTRUCTOR',       // Undervisning/Quiz
  EMPLOYEE = 'EMPLOYEE',           // Basis bruker
  STUDENT = 'STUDENT'              // Elev/kursant
}
```

#### Tilgangskontroll Matrix
| Rolle | Brukerside | Adminside | Tjenestestyring | Sikkerhet |
|-------|------------|-----------|-----------------|-----------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ❌ |
| HR_MANAGER | ✅ | ⚠️ (begrenset) | ❌ | ❌ |
| INSTRUCTOR | ✅ | ❌ | ❌ | ❌ |
| EMPLOYEE | ✅ | ❌ | ❌ | ❌ |
| STUDENT | ✅ | ❌ | ❌ | ❌ |

### 2.2 Autentisering Strategi
```typescript
// JWT Token Structure
interface JWTPayload {
  id: number;
  epost: string;
  rolle: UserRole;
  bedriftId: number;
  permissions: string[];
  activeServices: string[];
  exp: number;
}
```

---

## 🛠️ Fase 3: Tjeneste-aktivering System

### 3.1 Tilgjengelige Tjenester
```typescript
enum ServiceType {
  HR = 'HR',
  ECONOMY = 'ECONOMY',
  QUIZ = 'QUIZ',
  SIKKERHETSKONTROLL = 'SIKKERHETSKONTROLL',
  FORERKORT = 'FORERKORT',
  KURS = 'KURS',
  RAPPORTER = 'RAPPORTER',
  INTEGRASJONER = 'INTEGRASJONER'
}

interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  isActive: boolean;
  requiredRole: UserRole;
  dependencies: string[];
  pricing: {
    monthly: number;
    yearly: number;
  };
}
```

### 3.2 Bedrift-Tjeneste Kobling
```typescript
interface BedriftService {
  id: number;
  bedriftId: number;
  serviceId: string;
  isActive: boolean;
  activatedAt: Date;
  activatedBy: number;
  settings: Record<string, any>;
  usage: {
    monthlyUsers: number;
    totalTransactions: number;
  };
}
```

### 3.3 Tjeneste Konfigurasjon
```typescript
// HR Tjeneste Eksempel
const hrServiceConfig = {
  id: 'hr',
  name: 'HR Management',
  description: 'Komplett HR-løsning med ansattadministrasjon',
  features: [
    'Ansatt registrering',
    'Fravær tracking',
    'Lønn oversikt',
    'Performance reviews'
  ],
  permissions: [
    'hr:read',
    'hr:write',
    'hr:delete',
    'hr:reports'
  ],
  routes: [
    '/hr/ansatte',
    '/hr/fravar',
    '/hr/lonn',
    '/hr/rapporter'
  ]
};
```

---

## 🎨 Fase 4: Frontend Arkitektur

### 4.1 Brukerside (client/)
**Fokus**: Kundeopplevelse og daglig bruk

#### Hovedsider
- **Dashboard**: Personlig oversikt
- **Tjenester**: Aktiverte moduler
- **Profil**: Brukerinnstillinger
- **Support**: Hjelp og dokumentasjon

#### Dynamisk Navigasjon
```typescript
// Navigation basert på aktiverte tjenester
const generateNavigation = (activeServices: string[]) => {
  const baseNav = [
    { path: '/', label: 'Dashboard', icon: 'home' }
  ];
  
  if (activeServices.includes('HR')) {
    baseNav.push({ path: '/hr', label: 'HR', icon: 'users' });
  }
  
  if (activeServices.includes('QUIZ')) {
    baseNav.push({ path: '/quiz', label: 'Quiz', icon: 'brain' });
  }
  
  return baseNav;
};
```

### 4.2 Adminside (admin/)
**Fokus**: Systemadministrasjon og kontroll

#### Hovedsider
- **Dashboard**: System oversikt
- **Tjenester**: Aktivering/deaktivering
- **Sikkerhet**: Tilgangskontroll og logging
- **Brukere**: Brukeradministrasjon
- **Monitoring**: System helse og ytelse
- **Innstillinger**: Systemkonfigurasjon

#### Admin Dashboard Komponenter
```typescript
interface AdminDashboardProps {
  systemHealth: SystemHealth;
  activeServices: Service[];
  userActivity: UserActivity[];
  securityAlerts: SecurityAlert[];
}
```

---

## 📊 Fase 5: Backend Utvidelser

### 5.1 Nye API Endepunkter

#### Admin API
```typescript
// Service Management
GET    /api/admin/services              // Liste alle tjenester
POST   /api/admin/services              // Opprett ny tjeneste
PUT    /api/admin/services/:id          // Oppdater tjeneste
DELETE /api/admin/services/:id          // Slett tjeneste

// Bedrift Service Management
GET    /api/admin/bedrift/:id/services  // Bedriftens tjenester
POST   /api/admin/bedrift/:id/services  // Aktiver tjeneste
PUT    /api/admin/bedrift/:id/services/:serviceId // Oppdater tjeneste
DELETE /api/admin/bedrift/:id/services/:serviceId // Deaktiver tjeneste

// Security & Monitoring
GET    /api/admin/security/logs         // Sikkerhetslogs
GET    /api/admin/monitoring/health     // System helse
GET    /api/admin/monitoring/metrics    // System metrics
```

#### Service Check Middleware
```typescript
const serviceCheckMiddleware = (requiredService: ServiceType) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userServices = await getUserActiveServices(req.bruker!.bedriftId);
    
    if (!userServices.includes(requiredService)) {
      return res.status(403).json({
        error: 'SERVICE_NOT_ACTIVATED',
        message: `Tjenesten ${requiredService} er ikke aktivert for din bedrift`
      });
    }
    
    next();
  };
};
```

### 5.3 API Design og Dokumentasjon

#### RESTful API Prinsipper
- **Konsistent URL struktur** (`/api/v1/resource/:id`)
- **HTTP verb semantikk** (GET, POST, PUT, DELETE, PATCH)
- **Statuskoder** (200, 201, 400, 401, 403, 404, 500)
- **Pagination** for store datasett
- **Filtering og sorting** query parameters
- **Rate limiting** per bruker/IP
- **API versioning** for bakoverkompatibilitet

#### OpenAPI/Swagger Dokumentasjon
```typescript
// Automatisk API dokumentasjon
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TMS API',
      version: '1.0.0',
      description: 'TMS Platform API Documentation'
    },
    servers: [
      { url: 'http://localhost:4000/api/v1', description: 'Development' },
      { url: 'https://api.tms.no/v1', description: 'Production' }
    ]
  },
  apis: ['./src/routes/*.ts']
};
```

#### GraphQL Support (Fremtidig)
- **Fleksible queries** for komplekse data-behov
- **Type safety** med schema-first approach
- **Real-time subscriptions** for live data
- **Efficient data fetching** (løser N+1 problem)

### 5.2 Database Utvidelser

#### Nye Tabeller
```sql
-- Tjenester
CREATE TABLE "Service" (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  required_role VARCHAR(50),
  pricing_monthly DECIMAL(10,2),
  pricing_yearly DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bedrift-Tjeneste kobling
CREATE TABLE "BedriftService" (
  id SERIAL PRIMARY KEY,
  bedrift_id INTEGER REFERENCES "Bedrift"(id),
  service_id VARCHAR(50) REFERENCES "Service"(id),
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP DEFAULT NOW(),
  activated_by INTEGER REFERENCES "Ansatt"(id),
  settings JSONB DEFAULT '{}',
  usage_data JSONB DEFAULT '{}',
  UNIQUE(bedrift_id, service_id)
);

-- Sikkerhetslogs
CREATE TABLE "SecurityLog" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "Ansatt"(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Fase 6: Implementeringsplan

### Steg 1: Grunnleggende Oppsett (Uke 1)
- [ ] Opprett admin/ mappe struktur
- [ ] Sett opp shared/ komponenter
- [ ] Konfigurer build system for begge apper
- [ ] Implementer basis autentisering
- [ ] Sett opp development, staging og production miljøer
- [ ] Konfigurer CI/CD pipeline
- [ ] Implementer environment-spesifikke konfigurasjoner

### Steg 2: Backend Utvidelser (Uke 2)
- [ ] Opprett Service og BedriftService modeller
- [ ] Implementer admin API endepunkter
- [ ] Legg til service check middleware
- [ ] Database migrasjoner

### Steg 3: Admin Interface (Uke 3-4)
- [ ] Admin dashboard
- [ ] Tjenestestyring interface
- [ ] Sikkerhetspanel
- [ ] System monitoring

### Steg 4: Brukerside Refaktorering (Uke 5)
- [ ] Flytt eksisterende komponenter
- [ ] Implementer dynamisk navigasjon
- [ ] Service-basert tilgangskontroll
- [ ] Oppdater alle ruter

### Steg 5: Testing og Optimalisering (Uke 6)
- [ ] Enhetstesting (Jest/Vitest)
- [ ] Integrasjonstesting (Cypress/Playwright)
- [ ] API testing (Postman/Newman)
- [ ] Performance optimalisering og load testing
- [ ] Sikkerhetstesting og penetration testing
- [ ] Accessibility testing (WCAG compliance)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

---

## 🌍 Miljøer og Deployment

### Environment Strategi
```typescript
// Environment konfiguration
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  API_BASE_URL: string;
  ADMIN_BASE_URL: string;
  CLIENT_BASE_URL: string;
  SENTRY_DSN?: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
```

### Deployment Pipeline
1. **Development** - Lokal utvikling med hot reload
2. **Staging** - Pre-production testing med produksjonsdata
3. **Production** - Live miljø med full monitoring

### Container Strategi
```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

### Infrastructure as Code
- **Terraform** for cloud infrastructure
- **Docker Compose** for lokal utvikling
- **Kubernetes** for production orchestration
- **Helm charts** for deployment management

---

## 🛡️ Sikkerhetshensyn

### Tilgangskontroll
- JWT tokens med service permissions
- Route guards basert på aktiverte tjenester
- API middleware for service validering
- Audit logging for alle admin handlinger

### Data Sikkerhet
- Krypterte sensitive data (AES-256)
- Rollbasert data tilgang (RBAC)
- Sikker session håndtering
- GDPR compliance og data retention
- SQL injection beskyttelse
- XSS og CSRF beskyttelse
- Input validering og sanitization
- Secure headers (HSTS, CSP, etc.)
- Regular security audits
- Vulnerability scanning
- Data backup encryption
- Secure API endpoints (HTTPS only)

---

## 🎨 Brukeropplevelse og Tilgjengelighet

### UX/UI Prinsipper
- **Konsistent design system** på tvers av bruker- og admin-sider
- **Responsive design** for alle enheter (desktop, tablet, mobil)
- **Dark/Light mode** support
- **Accessibility first** - WCAG 2.1 AA compliance
- **Progressive Web App** (PWA) capabilities
- **Offline functionality** for kritiske features
- **Fast loading times** (<3 sekunder initial load)
- **Intuitive navigation** og breadcrumbs

### Internationalisering (i18n)
- **Multi-språk support** (norsk, engelsk, svensk, dansk)
- **Lokalisering** av datoer, valuta og tall-formater
- **RTL support** for fremtidige markeder
- **Dynamisk språkbytte** uten page reload

### Performance Optimalisering
- **Code splitting** og lazy loading
- **Image optimization** og WebP support
- **Bundle size optimization**
- **Caching strategier** (browser, CDN, API)
- **Service Workers** for offline support
- **Critical CSS** inlining
- **Preloading** av kritiske ressurser

---

## 📈 Monitoring og Logging

### System Metrics
- Aktive brukere per tjeneste
- API responstider
- Feilrater
- Resource bruk

### Business Metrics
- Tjeneste aktivering/deaktivering
- Bruker engasjement per modul
- Support henvendelser
- Fakturering data

---

## 🚀 Fremtidige Utvidelser

### Fase 2 Funksjoner
- Marketplace for tredjepartstjenester
- API for eksterne integrasjoner
- Avansert rapportering
- Mobile app support
- White-label løsninger for partnere
- Multi-tenant arkitektur
- Real-time collaboration features
- AI/ML baserte anbefalinger

### Skalerbarhet
- Microservices arkitektur
- Container deployment (Docker/Kubernetes)
- Load balancing og auto-scaling
- Database sharding og read replicas
- CDN for statiske ressurser
- Caching strategier (Redis/Memcached)
- Message queues (RabbitMQ/Apache Kafka)
- Event-driven arkitektur

### DevOps og Deployment
- CI/CD pipelines (GitHub Actions/Jenkins)
- Infrastructure as Code (Terraform)
- Monitoring og alerting (Prometheus/Grafana)
- Log aggregation (ELK Stack)
- Blue-green deployments
- Feature flags og A/B testing
- Automated testing og quality gates

---

## 📝 Konklusjon

Denne omfattende arkitekturen gir oss:

### 🎯 Umiddelbare Fordeler
1. **Fleksibilitet**: Bedrifter kan velge og betale for kun de tjenestene de trenger
2. **Skalerbarhet**: Modulær oppbygging som vokser med bedriftens behov
3. **Sikkerhet**: Enterprise-grade sikkerhet med rollbasert tilgangskontroll
4. **Vedlikeholdbarhet**: Separerte ansvarsområder og clean code architecture
5. **Brukeropplevelse**: Skreddersydde grensesnitt for ulike brukergrupper

### 🚀 Langsiktige Gevinster
6. **Performance**: Optimalisert for hastighet og responsivitet
7. **Tilgjengelighet**: WCAG-kompatibel og universell utforming
8. **Internasjonalisering**: Klar for globale markeder
9. **DevOps Excellence**: Automatiserte pipelines og infrastructure as code
10. **Observability**: Komplett monitoring og logging for proaktiv drift

### 📊 Business Impact
- **Økt kundetilfredshet** gjennom skreddersydde løsninger
- **Reduserte driftskostnader** gjennom automatisering
- **Raskere time-to-market** for nye features
- **Bedre compliance** og sikkerhet
- **Skalerbar forretningsmodell** med tjeneste-basert prising

### ⏱️ Implementering
**Estimert tid**: 6-8 uker med dedikert team  
**Kompleksitet**: Høy, men godt planlagt  
**ROI**: Svært høy - fundamentet for fremtidig vekst  

Denne arkitekturen posisjonerer TMS som en moderne, skalerbar og konkurransedyktig plattform klar for fremtidens utfordringer. 