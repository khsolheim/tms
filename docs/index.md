# 📚 TMS Dokumentasjon

Velkommen til dokumentasjonen for Training Management System (TMS).

## 📑 Innholdsfortegnelse

### 🚀 Kom i gang
- **[README](../README.md)** - Hovedoversikt og rask start
- **[Refaktorering](REFACTORING_SUMMARY.md)** - Oversikt over kodeopprydding

### 🏗️ Arkitektur og Utvikling
- **[Forbedringplan](IMPROVEMENT_PLAN.md)** - Fremtidige utviklingsplaner
- **[API Dokumentasjon](openapi.yaml)** - OpenAPI/Swagger spesifikasjon
- **[Feilhåndtering](ERROR_HANDLING_GUIDE.md)** - Guide for feilhåndtering

### 📊 System og Database
- **[Database Schema](../server/prisma/schema.prisma)** - Prisma database skjema
- **[Migreringer](../server/prisma/migrations/)** - Database migreringsfiler

### 🔧 Setup og Konfigurasjon
- **[Server Setup](server-setup.md)** - Backend oppsett (hvis tilgjengelig)
- **[Environment](../server/.env.example)** - Miljøvariabler template

### 🧪 Testing
- **[E2E Tests](../e2e/)** - Playwright end-to-end tester
- **[Unit Tests](../server/tests/)** - Backend unit tester

### 📱 Komponenter
- **[Frontend](../client/src/)** - React frontend kode
- **[Mobile](../mobile/src/)** - React Native mobile app
- **[Backend](../server/src/)** - Node.js/Express backend

## 🎯 Nyttige Lenker

### Development
- **Server**: `http://localhost:4000`
- **Client**: `http://localhost:3000`
- **API Docs**: `http://localhost:4000/api/v1/docs`

### Kommandoer
```bash
# Start hele systemet
npm run dev

# Start kun server  
npm run server

# Enkel server start
node simple-server.js

# Kjør tester
npm run test
```

## 📞 Support og Bidrag

For spørsmål eller bidrag, se [README](../README.md) for kontaktinformasjon.

---

**Oppdatert**: 2024
**TMS Team** 