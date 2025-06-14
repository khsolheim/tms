# TMS API Dokumentasjon

## Oversikt

TMS (Training Management System) API er en omfattende tjeneste for håndtering av opplæringsprogrammer, studenter, bedrifter og sikkerhetskontroller.

## API Statistikk

- **Totalt endpoints**: 17
- **Sikkerhetskrevende endpoints**: 17
- **Kategorier**: 4

### Endpoints per HTTP-metode
- **POST**: 7
- **GET**: 7
- **DELETE**: 2
- **PUT**: 1

### Endpoints per kategori
- **Authentication**: 1
- **System**: 3
- **Regnskapsintegrasjon**: 5
- **Tenants**: 8

## Tilgjengelige formater

### Interaktiv dokumentasjon
- **Swagger UI**: http://localhost:4000/api/v1/docs
- Utforsk og test alle endpoints direkte i nettleseren

### Maskinlesbare formater
- **OpenAPI JSON**: `docs/openapi.json`
- **OpenAPI YAML**: `docs/openapi.yaml`
- **API Statistikk**: `docs/api-stats.json`

## Autentisering

De fleste endpoints krever autentisering med JWT token:

```
Authorization: Bearer <your-jwt-token>
```

Få token via innlogging: `POST /api/auth/login`

## Rate Limiting

- **Generell API**: 1000 forespørsler per 15 minutter
- **Autentisering**: 5 forespørsler per 15 minutter

## Feilhåndtering

Alle endpoints returnerer konsistente feilresponser:

```json
{
  "error": "Feilmelding på norsk",
  "details": {
    "field": ["Detaljert feilmelding"]
  },
  "requestId": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Generert

Dokumentasjonen genereres automatisk fra Zod schemas og route kommentarer.

**Sist oppdatert**: 2025-06-12T21:43:33.059Z
**Environment**: development
