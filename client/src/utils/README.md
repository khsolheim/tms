# Feilhåndtering i TMS Frontend

## Problemet med "[object Object]"

Tidligere hadde TMS-applikasjonen et problem hvor feilmeldinger fra serveren ble vist som "[object Object]" i stedet for lesbare meldinger. Dette skjedde fordi error-objekter fra API-kall ofte er komplekse strukturer som må håndteres riktig.

## Løsningen

Vi har implementert standardiserte feilhåndteringsverktøy i `utils/errorHandling.ts` som automatisk ekstraherer lesbare feilmeldinger fra ulike typer API-feil.

## Bruk

```typescript
import { formatApiErrorMessage } from '../utils/errorHandling';

try {
  const response = await api.delete(`/bedrift/${id}`);
  // Suksess
} catch (error: any) {
  // ✅ Bruk standardisert feilhåndtering
  const feilmelding = formatApiErrorMessage(error, 'sletting av bedrift');
  
  setNotification({
    isOpen: true,
    title: 'Feil ved sletting',
    message: feilmelding,
    type: 'error'
  });
}
```

## Funksjoner

### `formatApiErrorMessage(error, context?, fallbackMessage?)`
Hovedfunksjonen som genererer brukervenlige feilmeldinger.

### `extractErrorMessage(error, fallbackMessage?)`
Ekstraherer råmeldingen fra error-objektet.

### `getStatusSpecificMessage(error)`
Returnerer standardmeldinger basert på HTTP-statuskoder.

### `logApiError(error, context?)`
Logger feil på en standardisert måte for debugging.

## Ikke gjør dette

```typescript
// ❌ Kan resultere i "[object Object]"
const feilmelding = error.response?.data?.error || 'Ukjent feil';
```

## Gjør dette i stedet

```typescript
// ✅ Bruker standardisert feilhåndtering
const feilmelding = formatApiErrorMessage(error, 'operasjon');
``` 