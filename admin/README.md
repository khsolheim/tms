# TMS Admin Portal

## 📋 Oversikt

Denne mappen inneholder planlegging og implementering av TMS Admin Portal - en separat administrativ grensesnitt for systemstyring og tjeneste-aktivering.

## 📚 Dokumentasjon

### [TMS_ARKITEKTUR_PLAN.md](./TMS_ARKITEKTUR_PLAN.md)
**Hovedarkitekturdokument** som beskriver:
- 🏗️ Komplett arkitektur oversikt
- 🔐 Sikkerhet og rollbasert tilgangskontroll  
- 🛠️ Tjeneste-aktivering system
- 🎨 Frontend arkitektur (bruker vs admin)
- 📊 Backend utvidelser og API design
- 🔄 6-ukers implementeringsplan
- 🚀 Fremtidige utvidelser

### [IMPLEMENTERING_GUIDE.md](./IMPLEMENTERING_GUIDE.md)
**Teknisk implementeringsguide** med:
- 📋 Konkrete steg-for-steg instruksjoner
- 🔧 Kodeeksempler og komponenter
- 🗂️ Mappestruktur oppsett
- ⚙️ Backend middleware og API routes
- 🎨 Frontend komponenter og hooks
- ✅ Sjekkliste for implementering

## 🎯 Hovedmål

### Brukerside (client/)
- **Fokus**: Kundevendt portal for bedrifter og elever
- **Innhold**: Aktiverte tjenester, daglig bruk, brukeropplevelse
- **Tilgang**: Alle brukere basert på aktiverte tjenester

### Adminside (admin/)
- **Fokus**: Systemadministrasjon og kontroll
- **Innhold**: Tjenestestyring, sikkerhet, monitoring, konfigurasjon
- **Tilgang**: Kun administratorer (ADMIN, SUPER_ADMIN)

## 🛠️ Tjeneste-aktivering System

Bedrifter kan aktivere/deaktivere moduler:
- **HR**: Ansattadministrasjon, fravær, lønn
- **Økonomi**: Fakturering, regnskap, rapporter  
- **Quiz**: Kunnskapstest og sertifisering
- **Sikkerhetskontroll**: Kjøretøy inspeksjon
- **Førerkort**: Teoriprøver og kursing
- **Kurs**: Opplæringsprogrammer
- **Rapporter**: Avansert rapportering
- **Integrasjoner**: API og tredjepartstjenester

## 🔐 Sikkerhet

### Roller Hierarki
- **SUPER_ADMIN**: Full systemtilgang
- **ADMIN**: Bedrift administrasjon  
- **HR_MANAGER**: HR modul tilgang
- **INSTRUCTOR**: Undervisning/Quiz
- **EMPLOYEE**: Basis bruker
- **STUDENT**: Elev/kursant

### Tilgangskontroll
- JWT tokens med service permissions
- Route guards basert på aktiverte tjenester
- API middleware for service validering
- Audit logging for alle admin handlinger

## 🏗️ Arkitektur

### Nåværende Struktur
```
TMS/
├── client/          # Monolittisk frontend
├── server/          # Backend API
└── admin/           # (denne mappen)
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

## 🔄 Implementeringsplan

### Fase 1: Planlegging (✅ Ferdig)
- [x] Arkitekturdokument
- [x] Implementeringsguide
- [x] Teknisk spesifikasjon

### Fase 2: Backend Utvidelser (Neste)
- [ ] Service og BedriftService modeller
- [ ] Admin API endepunkter
- [ ] Service check middleware
- [ ] Database migrasjoner

### Fase 3: Admin Interface
- [ ] React app oppsett
- [ ] Dashboard komponenter
- [ ] Tjenestestyring interface
- [ ] Sikkerhetspanel

### Fase 4: Brukerside Refaktorering
- [ ] Dynamisk navigasjon
- [ ] Service guards
- [ ] Eksisterende komponenter

### Fase 5: Testing og Deployment
- [ ] Enhetstesting
- [ ] Integrasjonstesting
- [ ] Performance optimalisering

## 🚀 Kom i gang

1. **Les arkitekturdokumentet** for å forstå helheten
2. **Følg implementeringsguiden** for konkrete steg
3. **Start med backend utvidelser** (Service modeller)
4. **Bygg admin interface** parallelt
5. **Refaktorer brukerside** til slutt

## 📞 Support

For spørsmål om arkitekturen eller implementeringen, se dokumentasjonen eller kontakt utviklingsteamet.

---

**Estimert implementeringstid**: 6 uker  
**Kompleksitet**: Høy  
**Verdi**: Svært høy - gir fleksibilitet og skalerbarhet 