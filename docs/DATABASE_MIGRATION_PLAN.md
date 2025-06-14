# TMS Database Migration Plan
*Generert: 13. juni 2025*

## 📊 Analyse-sammendrag

**Kritiske funn:**
- 🔥 **164 instanser** av hardkodet data funnet
- 🎯 **80 høy prioritet** mock/dummy data (208 rader)
- 📚 **39 referanse-data** strukturer (119 rader)  
- ⚙️ **43 konfigurasjon** elementer (79 rader)

## 🚀 Migreringsplan - Fase 1: Mock Data (Høyeste prioritet)

### 1. SeedData (142 estimerte rader)
**Beskrivelse:** Generell demo/test data i 57 filer
**Status:** 🔥 Kritisk - må fjernes fra produksjonskode

**Påvirkede filer:**
- `client/src/__tests__/mocks/mockData.ts` - Test mock objekter
- `client/src/pages/Rapportering/*` - Rapport mock data
- `client/src/pages/Innstillinger/*` - Innstillinger mock data

**Løsning:**
1. Opprett `server/prisma/seeds/demo-data.ts`
2. Flytt mock data til database seed-scripts
3. Erstatt hardkodet data med API-kall
4. Legg til feature flag for demo-data

### 2. SjekkpunktSystemer (26 estimerte rader)
**Beskrivelse:** System-kategorier hardkodet i 10 filer
**Eksempel:** `['Bremser', 'Dekk', 'Styring', 'Lys', 'Drivverk', 'Annet']`

**Database løsning:**
```sql
CREATE TABLE SjekkpunktSystemer (
  id SERIAL PRIMARY KEY,
  navn VARCHAR(100) NOT NULL UNIQUE,
  beskrivelse TEXT,
  ikon VARCHAR(50),
  aktiv BOOLEAN DEFAULT true,
  rekkefølge INTEGER,
  opprettet TIMESTAMP DEFAULT NOW()
);
```

### 3. SeedBedrifter (23 estimerte rader)
**Beskrivelse:** Demo bedrifter i 9 filer
**Løsning:** Flytt til `Bedrift` tabell via seed-script

### 4. SeedElever (25 estimerte rader)  
**Beskrivelse:** Demo elever i 9 filer
**Løsning:** Flytt til `Elev` tabell via seed-script

### 5. SeedQuizData (17 estimerte rader)
**Beskrivelse:** Demo quiz-data i 4 filer
**Løsning:** Flytt til `QuizKategori` og `QuizSporsmal` tabeller

## 🔧 Migreringsplan - Fase 2: Referanse Data

### 1. FørerkortKlasser (54 estimerte rader)
**Beskrivelse:** Hardkodede førerkortklass-referanser
**Eksempel:** `['A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE']`

**Database løsning:**
```sql
CREATE TABLE FørerkortKlasser (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(10) NOT NULL UNIQUE,
  navn VARCHAR(100) NOT NULL,
  beskrivelse TEXT,
  kategori VARCHAR(50), -- 'Motorsykkel', 'Bil', 'Lastebil', etc.
  minimumsalder INTEGER,
  krav TEXT[],
  aktiv BOOLEAN DEFAULT true,
  opprettet TIMESTAMP DEFAULT NOW()
);
```

### 2. ReferenceKategorier (23 estimerte rader)
**Beskrivelse:** Quiz og sikkerhetskontroll kategorier
**Løsning:** Bruk eksisterende `QuizKategori` og `SikkerhetskontrollKategori` tabeller

## ⚙️ Migreringsplan - Fase 3: Konfigurasjon

### SystemConfiguration (74 estimerte rader)
**Beskrivelse:** System-innstillinger og konfigurasjon
**Løsning:** Bruk eksisterende `SystemConfig` tabell

## 🛠️ Implementeringsplan

### Steg 1: Database Schema Utvidelser
```sql
-- 1. Opprett nye referanse-tabeller
CREATE TABLE SjekkpunktSystemer (
  id SERIAL PRIMARY KEY,
  navn VARCHAR(100) NOT NULL UNIQUE,
  beskrivelse TEXT,
  ikon VARCHAR(50),
  aktiv BOOLEAN DEFAULT true,
  rekkefølge INTEGER,
  opprettet TIMESTAMP DEFAULT NOW()
);

CREATE TABLE FørerkortKlasser (
  id SERIAL PRIMARY KEY,  
  kode VARCHAR(10) NOT NULL UNIQUE,
  navn VARCHAR(100) NOT NULL,
  beskrivelse TEXT,
  kategori VARCHAR(50),
  minimumsalder INTEGER,
  krav TEXT[],
  aktiv BOOLEAN DEFAULT true,
  opprettet TIMESTAMP DEFAULT NOW()
);

-- 2. Opprett seed data flag
CREATE TABLE SeedDataConfig (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  beskrivelse TEXT,
  sist_oppdatert TIMESTAMP DEFAULT NOW()
);
```

### Steg 2: Prisma Schema Oppdatering
```prisma
model SjekkpunktSystem {
  id          Int      @id @default(autoincrement())
  navn        String   @unique
  beskrivelse String?
  ikon        String?
  aktiv       Boolean  @default(true)
  rekkefølge  Int?
  opprettet   DateTime @default(now())
  
  sjekkpunkter Sjekkpunkt[]
  
  @@map("SjekkpunktSystemer")
}

model FørerkortKlasse {
  id             Int      @id @default(autoincrement())
  kode           String   @unique
  navn           String
  beskrivelse    String?
  kategori       String?
  minimumsalder  Int?
  krav           String[]
  aktiv          Boolean  @default(true)
  opprettet      DateTime @default(now())
  
  @@map("FørerkortKlasser")
}
```

### Steg 3: API Endepunkter
```typescript
// server/src/routes/reference.routes.ts
router.get('/sjekkpunkt-systemer', getSjekkpunktSystemer);
router.get('/førerkort-klasser', getFørerkortKlasser);
router.get('/quiz-kategorier', getQuizKategorier);

// Admin endpoints
router.post('/admin/sjekkpunkt-systemer', createSjekkpunktSystem);
router.put('/admin/sjekkpunkt-systemer/:id', updateSjekkpunktSystem);
```

### Steg 4: Frontend Refaktorering
```typescript
// Erstatt hardkodet data:
// FØR:
const systemer = ['Bremser', 'Dekk', 'Styring', 'Lys', 'Drivverk', 'Annet'];

// ETTER:
const [systemer, setSystemer] = useState<SjekkpunktSystem[]>([]);

useEffect(() => {
  fetchSjekkpunktSystemer().then(setSystemer);
}, []);
```

### Steg 5: Seed Scripts
```typescript
// server/prisma/seeds/reference-data.ts
const sjekkpunktSystemer = [
  { navn: 'Bremser', beskrivelse: 'Bremsesystem og komponenter', ikon: 'brake', rekkefølge: 1 },
  { navn: 'Dekk', beskrivelse: 'Dekk og hjul', ikon: 'tire', rekkefølge: 2 },
  { navn: 'Styring', beskrivelse: 'Styresystem', ikon: 'steering', rekkefølge: 3 },
  { navn: 'Lys', beskrivelse: 'Lyssystem og belysning', ikon: 'light', rekkefølge: 4 },
  { navn: 'Drivverk', beskrivelse: 'Motor og drivlinje', ikon: 'engine', rekkefølge: 5 },
  { navn: 'Annet', beskrivelse: 'Øvrige kontrollpunkter', ikon: 'other', rekkefølge: 6 }
];

const førerkortKlasser = [
  { kode: 'A1', navn: 'Lett motorsykkel', kategori: 'Motorsykkel', minimumsalder: 16 },
  { kode: 'A2', navn: 'Mellomtung motorsykkel', kategori: 'Motorsykkel', minimumsalder: 18 },
  { kode: 'A', navn: 'Tung motorsykkel', kategori: 'Motorsykkel', minimumsalder: 20 },
  { kode: 'B', navn: 'Personbil', kategori: 'Bil', minimumsalder: 18 },
  { kode: 'BE', navn: 'Personbil med tilhenger', kategori: 'Bil', minimumsalder: 18 },
  { kode: 'C1', navn: 'Lett lastebil', kategori: 'Lastebil', minimumsalder: 18 },
  { kode: 'C', navn: 'Lastebil', kategori: 'Lastebil', minimumsalder: 21 },
  { kode: 'D', navn: 'Buss', kategori: 'Buss', minimumsalder: 24 }
];
```

## 📅 Tidsplan

### Uke 1: Database Setup
- [ ] Opprett nye Prisma modeller
- [ ] Generer og kjør migrasjoner  
- [ ] Opprett seed scripts
- [ ] Test database endringer

### Uke 2: API Lag
- [ ] Opprett reference data API endpoints
- [ ] Opprett admin API endpoints
- [ ] Test API med Postman/curl
- [ ] Dokumenter API

### Uke 3-4: Frontend Migrering (Høy prioritet)
- [ ] Refaktorer SjekkpunktSystemer (10 filer)
- [ ] Refaktorer FørerkortKlasser (13 filer)
- [ ] Refaktorer Mock Data (57 filer)
- [ ] Test frontend endringer

### Uke 5: Demo Data & Testing
- [ ] Opprett comprehensive seed data
- [ ] Test med demo environment
- [ ] Performance testing
- [ ] User acceptance testing

## 🎯 Suksesskriterier

✅ **100% mock data fjernet** fra produksjonskode
✅ **All referanse data** kommer fra database
✅ **Admin panel** for å administrere referanse data
✅ **Seed scripts** for demo/test miljøer
✅ **API dokumentasjon** oppdatert
✅ **Performance** opprettholdt eller bedret
✅ **Zero downtime** deployment

## 🚨 Risikofaktorer

- **Data inconsistency** under migrering
- **Frontend breaking changes** ved API endringer  
- **Performance impact** ved mange nye API-kall
- **Deployment complexity** med database migrasjoner

## 🛡️ Mitigeringsstrategier

1. **Gradvis migrering** - en kategori om gangen
2. **Feature flags** for ny vs gammel implementering
3. **Database backup** før hver migrering
4. **Comprehensive testing** på hvert steg
5. **Rollback plan** for hver fase

---

*Dette dokumentet vil bli oppdatert etter hvert som migreringen progrederer* 