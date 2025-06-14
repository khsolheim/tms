import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { setupContainer } from './container';
import { configureExpress, configureErrorHandling } from './config/express';
import { configureRoutes } from './config/routes';
import { startServer, configureProcessHandlers } from './config/server';
import logger from './utils/logger';

async function bootstrap() {
  try {
    // Initialize Prisma
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$connect();
    logger.info('Database tilkobling etablert');

    // Setup dependency injection container
    setupContainer();

    // Configure Express app
    const app = configureExpress();

    // Configure all routes
    configureRoutes(app);

    // Configure error handling (must be last)
    configureErrorHandling(app);

    // Configure process handlers
    configureProcessHandlers();

    // Start server
    startServer(app);

  } catch (error) {
    logger.error('Feil under oppstart av server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Start application
bootstrap(); 