# Admin Bruker Opprettelse

Dette dokumentet beskriver de forskjellige måtene å opprette admin brukere på i TMS systemet.

## 1. Test Admin (Utviklingsmiljø)

For utviklingsmiljø har vi en standard test admin som opprettes automatisk via seeding:

```bash
cd server
npm run prisma:seed
```

**Test admin detaljer:**
- E-post: `admin@test.no`
- Passord: `admin123`
- Rolle: ADMIN med full tilgang
- Tilknyttet: Test Bedrift AS

## 2. Super Admin via Miljøvariabler (Anbefalt for produksjon)

Legg til følgende i din `.env` fil:

```env
SUPER_ADMIN_EMAIL="admin@dinbedrift.no"
SUPER_ADMIN_PASSWORD="dittSikkertPassord123!"
SUPER_ADMIN_NAME="Super Administrator"
```

Deretter kjør seeding:

```bash
npm run prisma:seed
```

Super admin vil ikke være tilknyttet noen spesifikk bedrift og har global tilgang.

## 3. Interaktiv Admin Opprettelse (Anbefalt)

### Super Admin (Global tilgang)
```bash
cd server
npm run create-admin super
```

### Bedrifts Admin
```bash
cd server
npm run create-admin company
```

Disse kommandoene vil guide deg gjennom en sikker opprettelse med:
- Validering av e-post
- Sikker passord input (skjult)
- Høyere sikkerhet (bcrypt runder: 12)
- Bekreftelse av passord

## 4. Admin Roller og Tilganger

### ADMIN (Super Admin)
- Global tilgang til hele systemet
- Kan administrere alle bedrifter
- Kan opprette nye bedrifter
- Kan endre brukerroller
- `bedriftId: null` (ikke tilknyttet spesifikk bedrift)

### HOVEDBRUKER (Bedrifts Admin)
- Administrerer en spesifikk bedrift
- Kan opprette ansatte i sin bedrift
- Kan administrere kjøretøy
- Kan opprette sikkerhetskontroller
- `bedriftId: X` (tilknyttet spesifikk bedrift)

### TRAFIKKLARER
- Standard bruker rolle
- Begrenset tilgang til sin bedrift
- Kan utføre sikkerhetskontroller
- Kan ikke administrere andre brukere

## 5. Sikkerhetshensyn

### Passord Krav
- Minimum 8 tegn
- Anbefaler sterke passord med tall, bokstaver og symboler

### Produksjon
- Bruk alltid sterke, unike passord
- Ikke bruk test admin i produksjon
- Vurder å deaktivere test admin i produksjon
- Bruk miljøvariabler eller interaktiv opprettelse

### Admin Tilgang
- Super admin bør kun brukes for system administrasjon
- Daglig bruk bør skje med bedrifts admin eller trafikklærer roller
- Logg alle admin handlinger (kan implementeres senere)

## 6. Eksempel Kommandoer

```bash
# Opprett super admin interaktivt
npm run create-admin super

# Opprett bedrifts admin interaktivt  
npm run create-admin company

# Seed database med test data og miljøvariabler
npm run prisma:seed

# Reset database og seed på nytt
npx prisma migrate reset
```

## 7. Feilsøking

Hvis innlogging feiler:
1. Sjekk at DATABASE_URL er riktig i .env
2. Sjekk at JWT_SECRET er satt
3. Verifiser at brukeren eksisterer i databasen
4. Sjekk server logs for detaljer

Hvis admin opprettelse feiler:
1. Sjekk database tilkobling
2. Verifiser at e-post ikke allerede er i bruk
3. Sjekk at alle påkrevde felt er fylt ut 