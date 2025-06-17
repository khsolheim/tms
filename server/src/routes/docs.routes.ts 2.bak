/**
 * API Documentation Routes
 * 
 * Swagger UI og OpenAPI spec endpoints for API dokumentasjon
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerService from '../services/swagger.service';
import logger from '../utils/logger';

const router = express.Router();

// ============================================================================
// SWAGGER DOCUMENTATION ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API Documentation UI
 *     description: Interactive Swagger UI for exploring and testing the API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Swagger UI HTML page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /docs/json:
 *   get:
 *     summary: OpenAPI Specification (JSON)
 *     description: Get the complete OpenAPI 3.0 specification in JSON format
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: OpenAPI 3.0 specification
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /docs/stats:
 *   get:
 *     summary: API Statistics
 *     description: Get statistics about the API endpoints and structure
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEndpoints:
 *                   type: integer
 *                   description: Total number of API endpoints
 *                   example: 45
 *                 methodCounts:
 *                   type: object
 *                   description: Count of endpoints by HTTP method
 *                   example:
 *                     GET: 20
 *                     POST: 15
 *                     PUT: 8
 *                     DELETE: 2
 *                 tagCounts:
 *                   type: object
 *                   description: Count of endpoints by tag/category
 *                   example:
 *                     Companies: 8
 *                     Employees: 6
 *                     Students: 7
 *                 securityRequiredEndpoints:
 *                   type: integer
 *                   description: Number of endpoints requiring authentication
 *                   example: 40
 *                 deprecatedEndpoints:
 *                   type: integer
 *                   description: Number of deprecated endpoints
 *                   example: 0
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: When these statistics were generated
 *                 environment:
 *                   type: string
 *                   description: Current environment
 *                   example: development
 */

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// JSON specification endpoint
router.get('/json', (req, res) => {
  try {
    logger.info('API specification requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const spec = swaggerService.getSwaggerSpec();
    res.json(spec);
  } catch (error) {
    logger.error('Failed to serve API specification', error);
    res.status(500).json({
      error: 'Failed to generate API specification',
      requestId: (req as any).requestId
    });
  }
});

// API statistics endpoint
router.get('/stats', (req, res) => {
  try {
    logger.info('API statistics requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const stats = swaggerService.getApiStatistics();
    
    res.json({
      ...stats,
      generatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      apiVersion: process.env.API_VERSION || '1.0.0'
    });
  } catch (error) {
    logger.error('Failed to generate API statistics', error);
    res.status(500).json({
      error: 'Failed to generate API statistics',
      requestId: (req as any).requestId
    });
  }
});

// Refresh documentation endpoint (development only)
router.post('/refresh', (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Documentation refresh not allowed in production',
        requestId: (req as any).requestId
      });
    }

    logger.info('API documentation refresh requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    swaggerService.refresh();
    
    res.json({
      message: 'API documentation refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to refresh API documentation', error);
    res.status(500).json({
      error: 'Failed to refresh API documentation',
      requestId: (req as any).requestId
    });
  }
});

// ============================================================================
// SWAGGER UI SETUP
// ============================================================================

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/api/v1/docs/json',
        name: 'TMS API v1'
      }
    ],
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add request logging for API testing
      logger.debug('Swagger UI API request', {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { 
      background-color: #2c3e50; 
    }
    .swagger-ui .topbar .download-url-wrapper { 
      display: none; 
    }
    .swagger-ui .info { 
      margin: 20px 0; 
    }
    .swagger-ui .info .title { 
      color: #2c3e50; 
    }
    .swagger-ui .scheme-container { 
      background: #fafafa; 
      padding: 15px; 
      border-radius: 4px; 
    }
    .swagger-ui .opblock.opblock-post { 
      border-color: #27ae60; 
    }
    .swagger-ui .opblock.opblock-get { 
      border-color: #3498db; 
    }
    .swagger-ui .opblock.opblock-put { 
      border-color: #f39c12; 
    }
    .swagger-ui .opblock.opblock-delete { 
      border-color: #e74c3c; 
    }
  `,
  customSiteTitle: 'TMS API Documentation',
  customfavIcon: '/favicon.ico'
};

// Swagger UI middleware
router.use('/', swaggerUi.serveFiles(undefined, swaggerUiOptions));
router.get('/', swaggerUi.setup(undefined, swaggerUiOptions));

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Add CORS headers for documentation
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initialize schemas on startup
swaggerService.generateComprehensiveDocumentation();

export default router; 