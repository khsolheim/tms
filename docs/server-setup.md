# Server Struktur

Dette er backend-serveren for TMS (Trafikkskole Management System) bygget med Express.js, TypeScript og Prisma.

## Mappestruktur

### `/src`
Hovedkildekode for serveren:

- **`/middleware`** - Express middleware
  - `auth.ts` - Autentisering og autorisasjon
  - `upload.ts` - Fileopplasting og feilhåndtering
  - `index.ts` - Eksporter alle middleware

- **`/routes`** - API-ruter organisert etter funksjonalitet
  - `auth.ts` - Pålogging, impersonering, token-håndtering
  - `users.ts` - Brukeradministrasjon og profiler
  - `bedrifter.ts` - Bedrifts- og ansattadministrasjon
  - `index.ts` - Eksporter alle ruter

- **`/config`** - Konfigurasjonfiler
  - `auth.ts` - JWT-konfigurasjoner

- **`/prisma`** - Database-relaterte filer
  - `seed.ts` - Database seed-script

- **`app.ts`** - Express app-konfigurasjoner og middleware setup
- **`index.ts`** - Hovedinngangspunkt som starter serveren

### `/scripts`
Organiserte scripts for database og setup:

- **`/setup`** - Oppsetts-scripts
  - `create-admin.ts` - Opprett admin-bruker
  - `opprett-test-brukere.ts` - Opprett testbrukere
  - `opprett-bedrift-data.ts` - Opprett testbedrifter

- **`/database`** - Database-scripts
  - `legg-til-kontroll-maler.js` - Kontrollmal-data
  - `opprett-sjekkpunkt.ts` - Sjekkpunkt-data

### `/prisma`
Prisma database-konfigurasjoner:
- `schema.prisma` - Database-skjema
- `/migrations` - Database-migrasjoner

### `/uploads`
Statiske filer og opplastede bilder:
- `/images` - Opplastede bildefiler

### `/logs`
Loggfiler:
- `server.log` - Server-logger

### `/dist`
Kompilerte TypeScript-filer (genereres ved bygging)

### `/generated`
Autogenererte filer fra Prisma

## API-struktur

### Autentisering (`/api/auth`)
- `POST /logg-inn` - Brukerinnlogging
- `POST /impersonate/:id` - Admin impersonering
- `POST /stop-impersonate` - Stopp impersonering

### Brukere (`/api/users`)
- `GET /profile` - Hent egen profil
- `GET /` - Hent alle brukere (admin)
- `PUT /:id/tilganger` - Oppdater tilganger (admin)

### Bedrifter (`/api/bedrifter`)
- `GET /` - Hent alle bedrifter
- `GET /:id` - Hent spesifikk bedrift
- `POST /` - Opprett bedrift
- `PUT /:id` - Oppdater bedrift
- `DELETE /:id` - Slett bedrift
- Og mange andre bedrifts-relaterte endepunkter...

## Kjøring

### Utvikling
```bash
npm run dev
```

### Produksjon
```bash
npm run build
npm start
```

### Database
```bash
# Kjør migrasjoner
npx prisma migrate dev

# Seed database
npx prisma db seed
```

## Miljøvariabler

Opprett `.env` fil med:
```
DATABASE_URL="postgresql://..."
JWT_SECRET="din-hemmelige-nokkel"
NODE_ENV="development"
PORT=5000
```

## Teknologier

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Autentisering
- **Bcrypt** - Passordhashing
- **Multer** - Fileopplasting
- **CORS** - Cross-origin support 