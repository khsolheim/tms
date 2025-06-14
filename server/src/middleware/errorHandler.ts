import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import { AppError, isOperationalError, DatabaseError, ConflictError, ValidationError } from '../utils/errors';

// Error response interface
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    requestId: string;
    timestamp: string;
    details?: any;
  };
}

// Convert Prisma errors to our custom errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[];
      return new ConflictError(`Duplikat verdi for ${field?.join(', ') || 'ukjent felt'}`);
    
    case 'P2025':
      // Record not found
      return new AppError('Post ikke funnet', 404, 'NOT_FOUND');
    
    case 'P2003':
      // Foreign key constraint failed
      return new ValidationError('Relatert post finnes ikke');
    
    case 'P2014':
      // Required relation violation
      return new ValidationError('Påkrevd relasjon mangler');
    
    default:
      return new DatabaseError('Database operasjon feilet', { code: error.code });
  }
};

// Main error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'En uventet feil oppstod';
  let details: any = undefined;
  let isOperational = false;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
    isOperational = error.isOperational;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const appError = handlePrismaError(error);
    statusCode = appError.statusCode;
    code = appError.code;
    message = appError.message;
    details = appError.details;
    isOperational = appError.isOperational;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Ugyldig data format';
    isOperational = true;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Ugyldig token';
    isOperational = true;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Token utløpt';
    isOperational = true;
  }

  // Log error
  const errorLog = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    message,
    stack: error.stack,
    userId: (req as any).bruker?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    details,
  };

  if (isOperational) {
    logger.warn('Operational error', errorLog);
  } else {
    logger.error('Non-operational error', errorLog);
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    message = 'En uventet feil oppstod';
    details = undefined;
  }

  // Send error response
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      statusCode,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to catch async errors
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 