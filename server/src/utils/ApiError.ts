export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number, 
    message: string, 
    code?: string, 
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    // Sikrer at stack trace peker til riktig sted
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for vanlige feil
  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, code);
  }

  static unauthorized(message: string = 'Ikke autorisert', code?: string): ApiError {
    return new ApiError(401, message, code);
  }

  static forbidden(message: string = 'Ingen tilgang', code?: string): ApiError {
    return new ApiError(403, message, code);
  }

  static notFound(message: string = 'Ikke funnet', code?: string): ApiError {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code?: string): ApiError {
    return new ApiError(409, message, code);
  }

  static internal(message: string = 'Intern serverfeil', code?: string): ApiError {
    return new ApiError(500, message, code, false);
  }

  static validation(message: string, code?: string): ApiError {
    return new ApiError(422, message, code);
  }

  // Konverter til JSON for API-respons
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode
      }
    };
  }
}

// Type guard for å sjekke om en feil er en ApiError
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
} 