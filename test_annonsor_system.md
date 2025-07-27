# Annonsør & Sponsor System - Test Dokumentasjon

## Oversikt
Dette dokumentet beskriver hvordan man tester det implementerte annonsør- og sponsor-systemet.

## Implementerte Komponenter

### 1. Database Schema ✅
- **GeografiskEnhet**: Geografisk targeting (land, fylke, kommune, bydel, skole)
- **AnnonsorSponsor**: Annonsører og sponsorer med kontaktinfo og budsjett
- **Annonse**: Annonser med innhold, CTA og targeting
- **AnnonseTargeting**: Geografisk og skole-spesifikk targeting
- **AnnonseStatistikk**: Daglig statistikk for visninger og klikk
- **AnnonseInteraksjon**: Detaljerte interaksjoner for analyse

### 2. Backend API ✅
- **Server routes**: `/api/annonsor/*` - Komplett CRUD API
- **Autentisering**: JWT-basert med rolle-basert tilgang
- **Validering**: Input validering og feilhåndtering
- **Statistikk**: Sanntids statistikk og rapportering

### 3. Frontend Komponenter ✅

#### Admin Sider:
- **AnnonsorAdmin**: Hovedoversikt for annonsører/sponsorer
- **AnnonsorSponsorer**: Sponsor-spesifikk administrasjon
- **AnnonsorAnnonser**: Annonse-administrasjon
- **AnnonsorStatistikk**: Statistikk og analytics
- **AnnonsorSponsorForm**: Opprett/rediger sponsorer
- **PageAccessAdmin**: Side-tilgang administrasjon

#### Elev Sider:
- **Fordeler**: Elev-side for å se annonser og tilbud

### 4. Navigasjon ✅
- **Sidebar**: Komplett navigasjon med rolle-basert tilgang
- **Routing**: Alle sider er koblet til i App.tsx
- **Ikoner**: Heroicons for alle seksjoner

## Test Instruksjoner

### 1. Database Test
```bash
# Kjør database migrasjoner
cd server
npx prisma migrate dev

# Generer Prisma klient
npx prisma generate

# Seed test data (hvis tilgjengelig)
npm run seed
```

### 2. Backend Test
```bash
# Start server
cd server
npm run dev

# Test API endpoints
curl -X GET http://localhost:3001/api/annonsor/sponsorer \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Frontend Test
```bash
# Start klient
cd client
npm start

# Naviger til:
# - /admin/annonsor - Hovedadmin
# - /admin/annonsor/sponsorer - Sponsor admin
# - /admin/annonsor/annonser - Annonse admin
# - /admin/annonsor/statistikk - Statistikk
# - /fordeler - Elev-side
```

## Test Scenarier

### Scenario 1: Opprett Sponsor
1. Gå til `/admin/annonsor/sponsorer`
2. Klikk "Ny Sponsor"
3. Fyll ut skjema:
   - Navn: "Test Sponsor"
   - Bedrift: Velg en bedrift
   - Kontaktperson: "Test Person"
   - Telefon: "12345678"
   - E-post: "test@example.com"
   - Startdato: I dag
4. Klikk "Opprett Sponsor"
5. Verifiser at sponsoren vises i listen

### Scenario 2: Opprett Annonse
1. Gå til `/admin/annonsor/annonser`
2. Klikk "Ny Annonse"
3. Fyll ut skjema:
   - Tittel: "Test Annonse"
   - Innledning: "Dette er en test annonse"
   - Full innhold: "Detaljert beskrivelse..."
   - Annonsør: Velg en sponsor
   - Startdato: I dag
4. Klikk "Opprett Annonse"
5. Verifiser at annonsen vises i listen

### Scenario 3: Elev-visning
1. Logg inn som elev
2. Gå til `/fordeler`
3. Verifiser at annonser vises
4. Test interaksjoner:
   - Klikk på annonse
   - Ekspander innhold
   - Test CTA-knapper

### Scenario 4: Statistikk
1. Gå til `/admin/annonsor/statistikk`
2. Verifiser at statistikk vises
3. Test filtre (7 dager, 30 dager, 90 dager)
4. Sjekk topp-performere

### Scenario 5: Side-tilgang
1. Gå til `/admin/page-access`
2. Verifiser at sider vises
3. Test å aktivere/deaktivere sider
4. Sjekk rolle-tilganger

## API Endpoints

### Sponsorer
- `GET /api/annonsor/sponsorer` - Hent alle sponsorer
- `POST /api/annonsor/sponsorer` - Opprett ny sponsor
- `GET /api/annonsor/sponsorer/:id` - Hent spesifikk sponsor
- `PUT /api/annonsor/sponsorer/:id` - Oppdater sponsor
- `DELETE /api/annonsor/sponsorer/:id` - Slett sponsor
- `POST /api/annonsor/sponsorer/:id/godkjenn` - Godkjenn sponsor
- `POST /api/annonsor/sponsorer/:id/avvis` - Avvis sponsor

### Annonser
- `GET /api/annonsor/annonser` - Hent alle annonser
- `POST /api/annonsor/annonser` - Opprett ny annonse
- `GET /api/annonsor/annonser/:id` - Hent spesifikk annonse
- `PUT /api/annonsor/annonser/:id` - Oppdater annonse
- `DELETE /api/annonsor/annonser/:id` - Slett annonse
- `PATCH /api/annonsor/annonser/:id/status` - Endre status

### Statistikk
- `GET /api/annonsor/statistikk` - Hent statistikk
- `POST /api/annonsor/registrer-interaksjon` - Registrer interaksjon

### Elev
- `GET /api/annonsor/elev-annonser` - Hent relevante annonser for elev

## Feilsøking

### Vanlige Problemer

1. **Database tilkobling**
   ```bash
   # Sjekk DATABASE_URL i .env
   # Kjør prisma studio for å se data
   npx prisma studio
   ```

2. **API feil**
   ```bash
   # Sjekk server logs
   # Verifiser JWT token
   # Test med Postman/curl
   ```

3. **Frontend routing**
   ```bash
   # Sjekk at alle routes er definert i App.tsx
   # Verifiser lazy loading
   # Sjekk console for feil
   ```

4. **Autentisering**
   ```bash
   # Sjekk localStorage for token
   # Verifiser rolle-basert tilgang
   # Test med forskjellige brukerroller
   ```

## Neste Steg

### Implementering av Manglende Funksjoner
1. **Geografisk targeting**: Implementer automatisk deteksjon basert på elevens postnummer
2. **Personalisering**: AI-baserte anbefalinger
3. **Budsjett-kontroll**: Automatisk stopp når budsjett er brukt opp
4. **A/B testing**: Test forskjellige versjoner av annonser
5. **Push-notifikasjoner**: Varsle om nye relevante tilbud

### Forbedringer
1. **Performance**: Implementer caching og optimalisering
2. **Mobile**: Forbedre mobile opplevelse
3. **Analytics**: Mer avanserte rapporter og visualiseringer
4. **Integrasjoner**: Koble til eksterne systemer

## Konklusjon

Annonsør- og sponsor-systemet er nå implementert med:
- ✅ Komplett database schema
- ✅ Backend API med alle nødvendige endpoints
- ✅ Frontend admin-grensesnitt
- ✅ Elev-side for å se tilbud
- ✅ Navigasjon og routing
- ✅ Rolle-basert tilgangskontroll
- ✅ Side-tilgang administrasjon

Systemet er klart for testing og kan utvides med flere funksjoner etter behov.