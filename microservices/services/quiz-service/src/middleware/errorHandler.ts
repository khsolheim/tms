import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Default error
  let status = 500;
  let message = 'Internal server error';

  // Validation errors
  if (error.name === 'ValidationError') {
    status = 400;
    message = error.message;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}; 