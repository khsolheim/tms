import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { stream } from "../utils/logger";
import { corsOptions } from "./cors";
import { requestIdMiddleware } from "../middleware/requestId";
import { combinedSecurityMiddleware, generalRateLimit } from "../middleware/security";
import { tmsApiVersioning } from "../middleware/apiVersioning";
import { validationFailureLoggingMiddleware, commonValidationErrorsMiddleware } from "../middleware/validationMonitoring";
import { performanceMiddleware } from "../middleware/performance";
import { cacheMiddleware, invalidateCache } from "../middleware/cache";
import { errorHandler } from "../middleware/errorHandler";

export function configureExpress(): Express {
  const app = express();

  // Request ID middleware - må være først
  app.use(requestIdMiddleware);

  // Performance monitoring - sporer responstider og detekterer slow queries
  app.use(performanceMiddleware);

  // Security middleware - aktiverer XSS, SQL injection, command injection, path traversal protection
  app.use(combinedSecurityMiddleware);

  // API versioning middleware - håndterer versjonering og deprecation
  app.use('/api', tmsApiVersioning);

  // Validation monitoring - logger og sporer validation failures
  app.use(validationFailureLoggingMiddleware);
  app.use(commonValidationErrorsMiddleware);

  // Global rate limiting
  app.use(generalRateLimit);

  // HTTP request logging med Morgan
  app.use(morgan('combined', { stream }));

  // CORS configuration
  app.use(cors(corsOptions));

  app.use(express.json());

  // Cache middleware for GET requests (5 minute cache)
  app.use(cacheMiddleware({
    ttl: 300, // 5 minutes
    excludePatterns: [
      /\/api\/auth\//,
      /\/api\/admin\//,
      /\/api\/validation\//,
      /\/api\/performance\//
    ]
  }));

  // Cache invalidation for mutations
  app.use(invalidateCache());

  // Serve static files fra uploads mappen
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

  return app;
}

export function configureErrorHandling(app: Express): void {
  // 404 handler - må være etter alle routes
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint ikke funnet',
        statusCode: 404,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      }
    });
  });

  // Global error handler - må være sist
  app.use(errorHandler);
} 