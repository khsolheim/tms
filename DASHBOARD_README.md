# TMS Dashboard System

## Oversikt

Dette dokumentet beskriver det nye dashboard-systemet som er implementert for TMS (Trafikkskole Management System). Systemet består av tre hovedtyper dashboards:

1. **Admin Dashboard** - For systemadministratorer
2. **Bedrift Dashboard** - For trafikkskole bedrifter
3. **Elev Dashboard** - For elever/studenter

## Implementerte Komponenter

### Frontend Komponenter

#### 1. Admin Dashboard
- **Lokasjon**: `client/src/pages/Admin/Dashboard.tsx` (allerede eksisterende, utvidet)
- **Funksjonalitet**: 
  - Systemhelse og oppetid
  - Totale statistikker på tvers av alle bedrifter
  - Systemaktivitet og audit logs
  - Systemytelse (CPU, minne, database)
  - Hurtighandlinger for administratorer

#### 2. Bedrift Dashboard
- **Lokasjon**: `client/src/pages/Bedrifter/Dashboard.tsx` (ny)
- **Funksjonalitet**:
  - Ansatte og elever statistikk
  - Sikkerhetskontroller status
  - Økonomiske nøkkeltall
  - Kommende hendelser og timer
  - Hurtighandlinger for bedriftsoperasjoner

#### 3. Elev Dashboard
- **Lokasjon**: `client/src/pages/Elever/Dashboard.tsx` (ny)
- **Funksjonalitet**:
  - Progresjon i sikkerhetskontroller
  - XP og prestasjonssmerker
  - Kommende lektioner
  - Personlige statistikker
  - Gamification-elementer (streak, achievements)

### Backend Tjenester

#### 1. Dashboard Service
- **Lokasjon**: `server/src/services/dashboardService.ts` (ny)
- **Klasse**: `DashboardService`
- **Metoder**:
  - `getAdminDashboardStats()` - Administratorstatistikk
  - `getBedriftDashboardStats(bedriftId)` - Bedriftsstatistikk
  - `getElevDashboardStats(elevId)` - Elevstatistikk
  - Aktivitet og hendelser for alle brukertyper

#### 2. API Ruter
- **Lokasjon**: `server/src/routes/dashboardRoutes.ts` (ny)
- **Endepunkter**:
  - `/admin/stats` - Admin statistikk
  - `/bedrift/stats` - Bedrift statistikk
  - `/elev/stats` - Elev statistikk
  - Plus aktivitet og hendelser for hver brukertype

## Database Integration

Systemet bruker eksisterende database-skjema og tabeller:

### Admin Dashboard
- `Bedrift` - Bedriftsstatistikk
- `User` - Brukerstatistikk
- `Ansatt` - Ansatt informasjon
- `Elev` - Elev informasjon
- `AuditLog` - Systemaktivitet

### Bedrift Dashboard
- `Ansatt` - Ansatte i bedriften
- `Elev` - Elever i bedriften
- `Sikkerhetskontroll` - Sikkerhetskontroller
- `KalenderEvent` - Kommende hendelser
- `PaymentTransaction` - Økonomiske data
- `Notification` - Notifikasjoner

### Elev Dashboard
- `SikkerhetskontrollElevProgresjon` - Progresjon i sikkerhetskontroller
- `SikkerhetskontrollElevAchievement` - Prestasjonssmerker
- `SikkerhetskontrollKategori` - Kategorier og spørsmål
- `KalenderEvent` - Kommende lektioner
- `Kontrakt` - Elevens kontrakter

## Bruk og Navigasjon

### Admin Dashboard
```
URL: /admin/dashboard
Roller: ADMIN, SYSTEM_ADMIN
```

### Bedrift Dashboard
```
URL: /bedrifter/dashboard
Roller: HOVEDBRUKER, ADMIN, TRAFIKKLARER
```

### Elev Dashboard
```
URL: /elever/dashboard
Roller: ELEV
```

## API Endepunkter

### Admin Endepunkter
```
GET /api/dashboard/admin/stats
GET /api/dashboard/admin/activities
```

### Bedrift Endepunkter
```
GET /api/dashboard/bedrift/stats
GET /api/dashboard/bedrift/activities
GET /api/dashboard/bedrift/upcoming-events
```

### Elev Endepunkter
```
GET /api/dashboard/elev/stats
GET /api/dashboard/elev/activities
GET /api/dashboard/elev/upcoming-lessons
GET /api/dashboard/elev/achievements
GET /api/dashboard/elev/sikkerhetskontroll-progress
```

## Datastruktur

### Bedrift Dashboard Stats
```typescript
interface BedriftDashboardStats {
  totalAnsatte: number;
  totalElever: number;
  aktiveSikkerhetskontroller: number;
  fullforteKontroller: number;
  ventendeSoknader: number;
  aktiverKontrakter: number;
  totalInntekter: number;
  aktivKjoretoy: number;
  planlagteTimer: number;
  fullforteTimer: number;
  ventendeTasks: number;
  systemNotifikasjoner: number;
}
```

### Elev Dashboard Stats
```typescript
interface ElevDashboardStats {
  totalSikkerhetskontroller: number;
  fullforteSikkerhetskontroller: number;
  progresjonProsent: number;
  aktiveKurs: number;
  fullforteKurs: number;
  plannedeLektioner: number;
  fullforteLektioner: number;
  achievements: number;
  totalXP: number;
  streak: number;
  kontrakterAktive: number;
  sisteAktivitet: string;
}
```

## Funksjoner

### Bedrift Dashboard
- **Statistikk Kort**: Ansatte, elever, sikkerhetskontroller, økonomi
- **Aktivitetsfeed**: Siste hendelser i bedriften
- **Kommende Hendelser**: Planlagte timer og møter
- **Hurtighandlinger**: Registrer ny elev, ansatt, sikkerhetskontroll
- **Ytelsesstatistikk**: Timer, oppgaver, notifikasjoner

### Elev Dashboard
- **Progresjonskort**: Sikkerhetskontroller, XP, streak
- **Sikkerhetskontroll Progresjon**: Detaljert progresjon per kategori
- **Prestasjonssmerker**: Nylig oppnådde achievements
- **Kommende Lektioner**: Planlagte timer med instruktører
- **Hurtighandlinger**: Start sikkerhetskontroll, se kurs, kalender

### Gamification (Elev Dashboard)
- **XP System**: Poeng for fullførte aktiviteter
- **Streak**: Daglige aktivitetsrekker
- **Achievements**: Prestasjonssmerker for milepæler
- **Progresjonsbarer**: Visuell progresjon per kategori

## Autentisering og Autorisering

Dashboards bruker eksisterende autentiserings-middleware:
- JWT token validering
- Rolle-basert tilgangskontroll
- Bedrift-spesifikk data filtering

## Feilhåndtering

- Fallback til mock data ved API-feil
- Brukervenlige feilmeldinger
- Logging av alle API-feil
- Graceful degradation ved nettverksproblemer

## Ytelse

### Optimalisering
- Parallelle database-spørringer
- Caching av statistikk data
- Paginering av aktivitetsfeeds
- Lazy loading av komponenter

### Oppdateringsfrekvens
- Admin Dashboard: 30 sekunder
- Bedrift Dashboard: 60 sekunder
- Elev Dashboard: Manuell oppdatering

## Fremtidige Utvidelser

### Planlagte Funksjoner
1. **Realtids Notifikasjoner**: WebSocket for live oppdateringer
2. **Eksporter Funksjonalitet**: PDF/Excel eksport av statistikk
3. **Tilpassbare Dashboards**: Brukerdefinerte widgets
4. **Mobile App**: Responsive design for mobil
5. **Avanserte Rapporter**: Detaljerte analyserapporter

### Potensielle Forbedringer
- Automatisk refresh av data
- Drag-and-drop widget organisering
- Mørk/lys tema støtte
- Avanserte filtre og søk
- Sammenligning av tidsperioder

## Installasjon og Oppsett

### Nødvendige Avhengigheter
```bash
# Frontend
npm install @heroicons/react

# Backend
npm install express prisma
```

### Database Migrering
Ingen nye tabeller er nødvendig - bruker eksisterende skjema.

### Miljøvariabler
Ingen nye miljøvariabler er nødvendig - bruker eksisterende konfigurasjon.

## Testing

### Enhetstesting
- Tester for alle dashboard service metoder
- Mock data for frontend komponenter
- API endpoint testing

### Integrasjonstesting
- End-to-end testing av dashboard flows
- Autentisering og autorisering testing
- Ytelsestesting av database spørringer

## Vedlikehold

### Overvåking
- API responstider
- Database query ytelse
- Brukerinteraksjon metrics

### Loggføring
- Alle API kall logges
- Feilmeldinger lagres i database
- Brukeraktivitet spores

## Konklusjon

Dashboard-systemet gir en omfattende oversikt over TMS-systemet for alle brukertyper. Det er bygget på eksisterende infrastruktur og følger etablerte mønstre i applikasjonen. Systemet er skalerbart og kan enkelt utvides med nye funksjoner i fremtiden.

For spørsmål eller problemer, kontakt utviklingsteamet eller opprett en issue i prosjektets repository.