# 🎓 TMS - Training Management System

Komplett system for administrasjon av trafikklærer-utdanning, sikkerhetskontroller og bedriftshåndtering.

## 🚀 Rask Start

### Forutsetninger
- Node.js 18+ 
- PostgreSQL 14+
- npm eller yarn

### Installasjon
```bash
# Installer alle dependencies
npm run install:all

# Start development server
npm run dev

# Eller start kun backend
npm run server
```

### Enkel server oppstart
```bash
# Fra root-katalogen
node simple-server.js
```

## 📁 Prosjektstruktur

```
tms/
├── client/          # React frontend applikasjon
├── server/          # Node.js backend API
├── mobile/          # React Native mobile app
├── e2e/            # End-to-end tester (Playwright)
└── docs/           # Dokumentasjon
```

## 🛠️ Scripts

| Kommando | Beskrivelse |
|----------|-------------|
| `npm run dev` | Start full-stack development |
| `npm run client` | Start kun frontend |
| `npm run server` | Start kun backend |
| `npm run build` | Bygg hele prosjektet |
| `npm run test` | Kjør Playwright tester |
| `npm start` | Start produksjonsserver |

## 🔧 Backend Arkitektur

### Modulær Service-lag
- **AuthenticationService**: Brukerautentisering og impersonering
- **AnsattManagementService**: CRUD for ansatte
- **BedriftService**: Bedriftsadministrasjon  
- **KontraktService**: Kontrakthåndtering
- **SikkerhetskontrollService**: Safety compliance

### Middleware Stack
- **Security**: XSS, SQL injection, CSRF protection
- **Authentication**: JWT token validation
- **Validation**: Input sanitization og validering
- **Caching**: Redis-basert caching
- **Logging**: Strukturert logging med Winston

## 📊 Database

### Hovedentiteter
- **Bedrift**: Virksomheter som bruker systemet
- **Ansatt**: Brukere i systemet
- **Elev**: Trafikklærer-studenter
- **Kontrakt**: Avtaler mellom bedrifter og elever
- **Sikkerhetskontroll**: Safety inspections
- **Quiz**: Kunnskapstester

## 🔒 Sikkerhet

- **Multi-layer security**: Flere sikkerhetslag
- **Role-based access**: Rollbasert tilgangskontroll
- **Audit logging**: Komplett sporbarhet
- **Rate limiting**: DDoS-beskyttelse
- **Input validation**: Comprehensive input sanitization

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📚 API Dokumentasjon

Swagger/OpenAPI dokumentasjon tilgjengelig på:
- Development: `http://localhost:4000/api/v1/docs`
- Production: `https://api.tms.no/api/v1/docs`

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Staging
```bash
npm run build
npm run start:staging
```

### Production
```bash
npm run build
npm run start:production
```

## 🤝 Bidrag

1. Fork prosjektet
2. Opprett feature branch: `git checkout -b feature/amazing-feature`
3. Commit endringene: `git commit -m 'Add amazing feature'`
4. Push til branch: `git push origin feature/amazing-feature`
5. Åpne Pull Request

## 📝 License

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 📞 Support

For spørsmål eller support, kontakt:
- **Email**: support@tms.no
- **Dokumentasjon**: [docs.tms.no](https://docs.tms.no)
- **Issues**: [GitHub Issues](https://github.com/tms/issues)

---

**Sist oppdatert**: 2024
**Versjon**: 1.0.0 