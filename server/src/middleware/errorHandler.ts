import { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError } from '../utils/ApiError';
import logger from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log feilen
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).bruker?.id
  });

  // Hvis det er en ApiError, bruk den direkte
  if (isApiError(error)) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Håndter Prisma-feil
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        res.status(409).json({
          error: {
            message: 'Duplikat: Denne verdien eksisterer allerede',
            code: 'DUPLICATE_ENTRY',
            statusCode: 409
          }
        });
        return;
        
      case 'P2025':
        res.status(404).json({
          error: {
            message: 'Ressursen ble ikke funnet',
            code: 'NOT_FOUND',
            statusCode: 404
          }
        });
        return;
        
      case 'P2003':
        res.status(400).json({
          error: {
            message: 'Ugyldig referanse til relatert data',
            code: 'FOREIGN_KEY_CONSTRAINT',
            statusCode: 400
          }
        });
        return;
    }
  }

  // Håndter Zod validation-feil
  if (error.name === 'ZodError') {
    const zodError = error as any;
    const firstError = zodError.errors[0];
    
    res.status(422).json({
      error: {
        message: `Valideringsfeil: ${firstError.message}`,
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        details: zodError.errors
      }
    });
    return;
  }

  // Håndter JWT-feil
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: {
        message: 'Ugyldig token',
        code: 'INVALID_TOKEN',
        statusCode: 401
      }
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: {
        message: 'Token er utløpt',
        code: 'TOKEN_EXPIRED',
        statusCode: 401
      }
    });
    return;
  }

  // Standard 500-feil for ukjente feil
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'En uventet feil oppstod' 
        : error.message,
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500
    }
  });
}

// Async error wrapper for å fange opp async-feil
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 