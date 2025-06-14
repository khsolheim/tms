# Error Handling og Logging Guide

## Oversikt

TMS bruker nå et strukturert error handling og logging system basert på:
- Winston for strukturert logging
- Custom error klasser for konsistent error håndtering
- Global error middleware
- Request ID tracking for correlation
- Audit logging for sensitive operasjoner

## Error Klasser

### Tilgjengelige Error Klasser

```typescript
import { 
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError
} from '../utils/errors';
```

### Eksempler på bruk

```typescript
// Validation error
if (!bedriftId) {
  throw new ValidationError('Ugyldig bedrift-id');
}

// Not found error
const bedrift = await prisma.bedrift.findUnique({ where: { id } });
if (!bedrift) {
  throw new NotFoundError('Bedrift', id);
}

// Forbidden error
if (req.bruker!.rolle !== 'ADMIN') {
  throw new ForbiddenError('Kun admin har tilgang');
}

// Conflict error (f.eks. duplikat)
if (eksisterende) {
  throw new ConflictError('E-post allerede i bruk');
}
```

## Async Handler

Bruk `asyncHandler` for å automatisk håndtere async errors:

```typescript
import { asyncHandler } from '../middleware/errorHandler';

router.get('/:id', verifyToken, asyncHandler(async (req, res) => {
  // Async kode her - errors fanges automatisk
  const data = await someAsyncOperation();
  res.json(data);
}));
```

## Logging

### Logger Import

```typescript
import logger, { auditLog, performanceLog } from '../utils/logger';
```

### Log Levels

- `error`: Kritiske feil som krever oppmerksomhet
- `warn`: Advarsler og potensielle problemer
- `info`: Generell informasjon
- `http`: HTTP request logging (håndteres av Morgan)
- `debug`: Detaljert debug informasjon

### Eksempler på logging

```typescript
// Info logging
logger.info('Oppretter ny kontrakt', {
  userId: req.bruker!.id,
  kontraktData: { lan: 50000, lopetid: 24 }
});

// Error logging (håndteres automatisk av error middleware)
logger.error('Database feil', {
  error: error.message,
  stack: error.stack,
  userId: req.bruker!.id
});

// Debug logging
logger.debug('Detaljert info for debugging', {
  requestData: req.body,
  calculatedValues: beregning
});
```

### Audit Logging

For sensitive operasjoner:

```typescript
// Audit log for sletting
auditLog(
  req.bruker!.id,
  'DELETE_BEDRIFT',
  'Bedrift',
  {
    bedriftId,
    navn: bedrift.navn,
    orgNummer: bedrift.orgNummer
  }
);

// Audit log for oppdatering
auditLog(
  req.bruker!.id,
  'UPDATE_KONTRAKT_STATUS',
  'Kontrakt',
  {
    kontraktId,
    oldStatus: 'UTKAST',
    newStatus: 'GODKJENT'
  }
);
```

### Performance Logging

For å spore ytelse:

```typescript
const startTime = Date.now();

// Utfør operasjon
const result = await heavyOperation();

performanceLog(
  'Heavy operation completed',
  Date.now() - startTime,
  { recordCount: result.length }
);
```

## Error Response Format

Alle errors returneres i standardisert format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ugyldig bedrift-id",
    "statusCode": 400,
    "requestId": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2024-01-21T14:30:00.000Z",
    "details": {
      "field": "bedriftId",
      "value": "abc"
    }
  }
}
```

## Request ID Tracking

Alle requests får automatisk en unik ID som:
- Legges til i response header: `X-Request-ID`
- Inkluderes i alle logger
- Returneres i error responses

Dette gjør det enkelt å spore en request gjennom hele systemet.

## Log Filer

Logger lagres i:
- `server/logs/application-YYYY-MM-DD.log` - Alle logger
- `server/logs/error-YYYY-MM-DD.log` - Kun error logger

Logger roteres daglig og slettes etter:
- Application logs: 14 dager
- Error logs: 30 dager

## Miljøvariabler

```env
# Log level (error, warn, info, http, debug)
LOG_LEVEL=info

# Node miljø
NODE_ENV=production
```

## Best Practices

1. **Bruk alltid asyncHandler** for async route handlers
2. **Kast custom errors** istedenfor å sende response direkte
3. **Logg viktige operasjoner** med relevant kontekst
4. **Bruk audit logging** for alle sensitive operasjoner
5. **Inkluder userId** i logger når tilgjengelig
6. **Ikke logg sensitive data** som passord eller tokens
7. **Bruk riktig log level** - ikke bruk error for warnings

## Migrering av eksisterende kode

Fra:
```typescript
router.get('/:id', async (req, res) => {
  try {
    const data = await prisma.bedrift.findUnique({ where: { id } });
    if (!data) {
      res.status(404).json({ error: 'Ikke funnet' });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Feil:', error);
    res.status(500).json({ error: 'Server feil' });
  }
});
```

Til:
```typescript
router.get('/:id', asyncHandler(async (req, res) => {
  const data = await prisma.bedrift.findUnique({ where: { id } });
  if (!data) {
    throw new NotFoundError('Bedrift', id);
  }
  res.json(data);
}));
``` 