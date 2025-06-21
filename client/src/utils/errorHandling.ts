/**
 * Standardiserte feilhåndteringsverktøy for TMS-applikasjonen
 * Forhindrer visning av "[object Object]" i feilmeldinger
 */

export interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string | { message?: string; code?: string };
      message?: string;
    };
  };
  message?: string;
  name?: string;
}

/**
 * Ekstraherer en lesbar feilmelding fra ulike typer API-feil
 * @param error - Error-objektet fra API-kall
 * @param fallbackMessage - Fallback-melding hvis ingen kan ekstraheres
 * @returns Lesbar feilmelding
 */
export function extractErrorMessage(error: ApiError, fallbackMessage: string = 'Ukjent feil'): string {
  if (!error) return fallbackMessage;

  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Håndter strukturerte error-objekter fra serveren
    if (errorData.error && typeof errorData.error === 'object') {
      return errorData.error.message || errorData.error.code || 'Ukjent server feil';
    } else if (errorData.error && typeof errorData.error === 'string') {
      return errorData.error;
    } else if (errorData.message) {
      return errorData.message;
    } else if (typeof errorData === 'string') {
      return errorData;
    }
  }

  if (error.message) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Henter HTTP statuskode-spesifikke feilmeldinger
 * @param error - Error-objektet fra API-kall
 * @returns Statuskode-spesifik feilmelding eller null
 */
export function getStatusSpecificMessage(error: ApiError): string | null {
  const statusCode = error.response?.status;
  
  switch (statusCode) {
    case 401:
      return 'Du er ikke logget inn eller sesjonen har utløpt. Vennligst logg inn på nytt.';
    case 403:
      return 'Du har ikke tilgang til denne handlingen.';
    case 404:
      return 'Den forespurte ressursen ble ikke funnet.';
    case 409:
      return 'Konflikt: Ressursen eksisterer allerede eller er i bruk.';
    case 422:
      return 'Ugyldig data ble sendt til serveren.';
    case 429:
      return 'For mange forespørsler. Vennligst vent litt før du prøver igjen.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Serverfeil. Vennligst prøv igjen senere.';
    default:
      return null;
  }
}

/**
 * Genererer en fullstendig feilmelding med kontekst
 * @param error - Error-objektet fra API-kall
 * @param context - Kontekst for feilen (f.eks. "sletting av bedrift")
 * @param fallbackMessage - Fallback-melding
 * @returns Formatert feilmelding
 */
export function formatApiErrorMessage(
  error: ApiError, 
  context?: string, 
  fallbackMessage: string = 'En ukjent feil oppstod'
): string {
  // Først sjekk for statuskode-spesifikke meldinger
  const statusMessage = getStatusSpecificMessage(error);
  if (statusMessage) {
    return statusMessage;
  }

  // Så prøv å ekstrahere melding fra responsen
  const extractedMessage = extractErrorMessage(error, fallbackMessage);
  
  // Legg til kontekst hvis spesifisert
  if (context && extractedMessage !== fallbackMessage) {
    return `Feil ved ${context}: ${extractedMessage}`;
  }
  
  return extractedMessage;
}

/**
 * Logger API-feil på en standardisert måte
 * @param error - Error-objektet
 * @param context - Kontekst for feilen
 */
export function logApiError(error: ApiError, context?: string): void {
  const message = extractErrorMessage(error);
  const statusCode = error.response?.status;
  
  console.error(`API Error${context ? ` (${context})` : ''}:`, {
    message,
    statusCode,
    error: error.response?.data || error.message,
    stack: (error as Error).stack
  });
} 