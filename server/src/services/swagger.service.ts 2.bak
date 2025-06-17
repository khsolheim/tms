/**
 * Swagger API Documentation Service
 * 
 * Automatisk generering av OpenAPI/Swagger dokumentasjon
 * fra Zod schemas og route kommentarer
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { Request, Response, NextFunction } from 'express';
import { zodToJsonSchema } from 'zod-to-json-schema';
import logger from '../utils/logger';
import path from 'path';

// ============================================================================
// SWAGGER CONFIGURATION
// ============================================================================

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TMS API',
    version: '1.0.0',
    description: `
    # TMS (Training Management System) API
    
    Comprehensive API for managing training programs, students, companies, and security controls.
    
    ## Features
    - 🏢 **Company Management**: Manage companies and their employees
    - 👨‍🎓 **Student Management**: Handle student registration and tracking
    - 📋 **Contract Management**: Create and manage training contracts
    - 🔒 **Security Controls**: Safety inspections and compliance tracking
    - 📊 **Quiz System**: Training assessments and evaluations
    - 🚗 **Vehicle Management**: Fleet and vehicle tracking
    - 📈 **Reporting**: Comprehensive reporting and analytics
    
    ## Authentication
    Most endpoints require authentication using JWT tokens.
    Include the token in the Authorization header:
    \`Authorization: Bearer <your-jwt-token>\`
    
    ## Rate Limiting
    - General API: 1000 requests per 15 minutes
    - Authentication endpoints: 5 requests per 15 minutes
    
    ## Error Handling
    All endpoints return consistent error responses with:
    - Error message in Norwegian
    - HTTP status codes
    - Request ID for tracking
    
    ## API Versioning
    Current version: v1
    - Path versioning: \`/api/v1/...\`
    - Header versioning: \`Accept-Version: 1.0\`
    `,
    termsOfService: 'https://tms.example.com/terms',
    contact: {
      name: 'TMS API Support',
      email: 'support@tms.example.com',
      url: 'https://tms.example.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Development server'
    },
    {
      url: 'https://staging.tms.example.com/api/v1',
      description: 'Staging server'
    },
    {
      url: 'https://api.tms.example.com/api/v1',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication'
      }
    },
    parameters: {
      pageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      limitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20
        }
      },
      sortParam: {
        name: 'sort',
        in: 'query',
        description: 'Sort field and direction (e.g., "name:asc", "createdAt:desc")',
        required: false,
        schema: {
          type: 'string',
          pattern: '^[a-zA-Z]+:(asc|desc)$',
          example: 'name:asc'
        }
      },
      searchParam: {
        name: 'search',
        in: 'query',
        description: 'Search term for filtering results',
        required: false,
        schema: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Ugyldig input data'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                },
                requestId: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized - Invalid or missing authentication',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Ikke autorisert - ugyldig token'
                },
                requestId: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Ingen tilgang til denne ressursen'
                },
                requestId: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found - Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Ressurs ikke funnet'
                },
                requestId: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      },
      RateLimited: {
        description: 'Too Many Requests - Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'For mange forespørsler, prøv igjen senere'
                },
                retryAfter: {
                  type: 'string',
                  example: '15 minutter'
                }
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  example: 'Intern server feil'
                },
                requestId: {
                  type: 'string',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Companies',
      description: 'Company management endpoints'
    },
    {
      name: 'Employees',
      description: 'Employee management endpoints'
    },
    {
      name: 'Students',
      description: 'Student management endpoints'
    },
    {
      name: 'Contracts',
      description: 'Training contract management endpoints'
    },
    {
      name: 'Security Controls',
      description: 'Safety inspection and compliance endpoints'
    },
    {
      name: 'Quizzes',
      description: 'Assessment and quiz management endpoints'
    },
    {
      name: 'Vehicles',
      description: 'Vehicle and fleet management endpoints'
    },
    {
      name: 'Reports',
      description: 'Reporting and analytics endpoints'
    },
    {
      name: 'System',
      description: 'System health and configuration endpoints'
    }
  ]
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../validation/*.ts'),
    path.join(__dirname, '../validation/*.js'),
    path.join(__dirname, '../types/*.ts'),
    path.join(__dirname, '../types/*.js')
  ]
};

// ============================================================================
// SWAGGER SERVICE
// ============================================================================

export class SwaggerService {
  private static instance: SwaggerService;
  private swaggerSpec: any;

  private constructor() {
    this.generateSwaggerSpec();
  }

  public static getInstance(): SwaggerService {
    if (!SwaggerService.instance) {
      SwaggerService.instance = new SwaggerService();
    }
    return SwaggerService.instance;
  }

  /**
   * Generate Swagger specification
   */
  private generateSwaggerSpec(): void {
    try {
      this.swaggerSpec = swaggerJSDoc(swaggerOptions);
      logger.info('Swagger specification generated successfully');
    } catch (error) {
      logger.error('Failed to generate Swagger specification', error);
      throw error;
    }
  }

  /**
   * Get Swagger specification
   */
  public getSwaggerSpec(): any {
    return this.swaggerSpec;
  }

  /**
   * Convert Zod schema to JSON schema for Swagger
   */
  public zodToSwaggerSchema(zodSchema: any, options: any = {}): any {
    try {
      const jsonSchema = zodToJsonSchema(zodSchema, {
        name: options.name || undefined,
        target: 'openApi3',
        ...options
      });

      // Remove $schema property as it's not needed in OpenAPI
      if (jsonSchema.$schema) {
        delete jsonSchema.$schema;
      }

      return jsonSchema;
    } catch (error) {
      logger.error('Failed to convert Zod schema to Swagger schema', { error, options });
      return {
        type: 'object',
        description: 'Schema conversion failed'
      };
    }
  }

  /**
   * Add schema to Swagger components
   */
  public addSchema(name: string, zodSchema: any): void {
    try {
      const jsonSchema = this.zodToSwaggerSchema(zodSchema, { name });
      
      if (!this.swaggerSpec.components) {
        this.swaggerSpec.components = {};
      }
      
      if (!this.swaggerSpec.components.schemas) {
        this.swaggerSpec.components.schemas = {};
      }

      this.swaggerSpec.components.schemas[name] = jsonSchema;
      
      logger.debug('Added schema to Swagger spec', { name });
    } catch (error) {
      logger.error('Failed to add schema to Swagger spec', { name, error });
    }
  }

  /**
   * Add multiple schemas from validation modules
   */
  public addSchemasFromValidation(): void {
    try {
      // Import validation schemas
      const validationModules = [
        '../validation/ansatt.validation',
        '../validation/bedrift.validation',
        '../validation/elev.validation',
        '../validation/kontrakt.validation',
        '../validation/sikkerhetskontroll.validation',
        '../validation/quiz.validation'
      ];

      validationModules.forEach(modulePath => {
        try {
          const validationModule = require(modulePath);
          
          Object.entries(validationModule).forEach(([key, schema]) => {
            if (schema && typeof schema === 'object' && (schema as any)._def) {
              // This is likely a Zod schema
              this.addSchema(key, schema);
            }
          });
          
        } catch (moduleError) {
          logger.warn('Could not load validation module', { modulePath, error: moduleError });
        }
      });

      logger.info('Added validation schemas to Swagger spec');
    } catch (error) {
      logger.error('Failed to add schemas from validation', error);
    }
  }

  /**
   * Auto-generate API documentation from route files with Zod validation
   */
  public autoGenerateRouteDocumentation(): void {
    try {
      const routeFiles = [
        '../routes/ansatt.routes',
        '../routes/auth.routes', 
        '../routes/bedrift.routes',
        '../routes/elev.routes',
        '../routes/kontrakt.routes',
        '../routes/sikkerhetskontroll.routes',
        '../routes/quiz.routes',
        '../routes/bilder.routes'
      ];

      routeFiles.forEach(routeFile => {
        try {
          // Dynamically require each route file
          const routeModule = require(routeFile);
          
          // If route file exports validation schemas or route metadata
          if (routeModule.routeDocumentation) {
            this.addRouteDocumentation(routeModule.routeDocumentation);
          }
          
        } catch (moduleError) {
          logger.warn('Could not load route module for documentation', { 
            routeFile, 
            error: moduleError instanceof Error ? moduleError.message : 'Unknown error' 
          });
        }
      });

      logger.info('Auto-generated route documentation complete');
    } catch (error) {
      logger.error('Failed to auto-generate route documentation', error);
    }
  }

  /**
   * Add route documentation to Swagger spec
   */
  private addRouteDocumentation(routeDoc: any): void {
    try {
      if (!this.swaggerSpec.paths) {
        this.swaggerSpec.paths = {};
      }

      Object.entries(routeDoc.paths || {}).forEach(([path, pathDoc]: [string, any]) => {
        this.swaggerSpec.paths[path] = {
          ...this.swaggerSpec.paths[path],
          ...pathDoc
        };
      });

      // Add any additional schemas
      if (routeDoc.schemas) {
        Object.entries(routeDoc.schemas).forEach(([name, schema]: [string, any]) => {
          this.addSchema(name, schema);
        });
      }

    } catch (error) {
      logger.error('Failed to add route documentation', { routeDoc, error });
    }
  }

  /**
   * Generate comprehensive API documentation with examples
   */
  public generateComprehensiveDocumentation(): void {
    try {
      // Add validation schemas
      this.addSchemasFromValidation();
      
      // Auto-generate route documentation
      this.autoGenerateRouteDocumentation();
      
      // Add common examples and error responses
      this.addCommonExamples();
      
      // Add security documentation
      this.addSecurityDocumentation();
      
      logger.info('Comprehensive API documentation generated');
    } catch (error) {
      logger.error('Failed to generate comprehensive documentation', error);
    }
  }

  /**
   * Add common examples and responses
   */
  private addCommonExamples(): void {
    try {
      if (!this.swaggerSpec.components) {
        this.swaggerSpec.components = {};
      }

      if (!this.swaggerSpec.components.examples) {
        this.swaggerSpec.components.examples = {};
      }

      // Common examples
      this.swaggerSpec.components.examples = {
        ...this.swaggerSpec.components.examples,
        SuccessResponse: {
          summary: 'Vellykket respons',
          value: {
            success: true,
            data: {},
            timestamp: '2025-06-11T20:00:00.000Z'
          }
        },
        ValidationError: {
          summary: 'Valideringsfeil',
          value: {
            error: 'Valideringsfeil i forespørselen',
            details: {
              'body.epost': ['Ugyldig e-postadresse'],
              'body.passord': ['Passord må være minst 8 tegn']
            },
            requestId: '123e4567-e89b-12d3-a456-426614174000'
          }
        },
        UnauthorizedError: {
          summary: 'Ikke autorisert',
          value: {
            error: 'Ikke autorisert - ugyldig token',
            requestId: '123e4567-e89b-12d3-a456-426614174000'
          }
        }
      };

      // Enhanced error responses
      if (!this.swaggerSpec.components.responses) {
        this.swaggerSpec.components.responses = {};
      }

      this.swaggerSpec.components.responses = {
        ...this.swaggerSpec.components.responses,
        ValidationError: {
          description: 'Valideringsfeil i input data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Valideringsfeil i forespørselen' },
                  details: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    example: {
                      'body.epost': ['Ugyldig e-postadresse'],
                      'body.passord': ['Passord må være minst 8 tegn']
                    }
                  },
                  requestId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' }
                }
              },
              examples: {
                validationError: { $ref: '#/components/examples/ValidationError' }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Intern serverfeil',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Intern serverfeil' },
                  requestId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' }
                }
              }
            }
          }
        }
      };

    } catch (error) {
      logger.error('Failed to add common examples', error);
    }
  }

  /**
   * Add security documentation
   */
  private addSecurityDocumentation(): void {
    try {
      // Add global security requirements
      if (!this.swaggerSpec.security) {
        this.swaggerSpec.security = [
          { bearerAuth: [] }
        ];
      }

      // Add security scheme info
      if (!this.swaggerSpec.components.securitySchemes) {
        this.swaggerSpec.components.securitySchemes = {};
      }

      this.swaggerSpec.components.securitySchemes.bearerAuth = {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: `
        JWT token for authentication. Obtain a token by logging in via /api/auth/login.
        
        **Usage:**
        \`Authorization: Bearer <your-jwt-token>\`
        
        **Token expiry:** 7 days for regular users, 30 days for admin users.
        
        **Refresh:** Tokens cannot be refreshed. Login again to get a new token.
        `
      };

    } catch (error) {
      logger.error('Failed to add security documentation', error);
    }
  }

  /**
   * Generate API documentation middleware
   */
  public generateDocumentationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Add dynamic information to the spec
        const dynamicSpec = {
          ...this.swaggerSpec,
          info: {
            ...this.swaggerSpec.info,
            version: process.env.API_VERSION || '1.0.0',
            'x-generated-at': new Date().toISOString(),
            'x-environment': process.env.NODE_ENV || 'development'
          }
        };

        res.json(dynamicSpec);
      } catch (error) {
        logger.error('Failed to generate documentation', error);
        res.status(500).json({
          error: 'Failed to generate API documentation',
          requestId: (req as any).requestId
        });
      }
    };
  }

  /**
   * Refresh Swagger specification
   */
  public refresh(): void {
    try {
      this.generateSwaggerSpec();
      this.addSchemasFromValidation();
      logger.info('Swagger specification refreshed');
    } catch (error) {
      logger.error('Failed to refresh Swagger specification', error);
    }
  }

  /**
   * Get API statistics for documentation
   */
  public getApiStatistics(): any {
    try {
      const spec = this.swaggerSpec;
      const paths = spec.paths || {};
      
      const statistics = {
        totalEndpoints: 0,
        methodCounts: {} as Record<string, number>,
        tagCounts: {} as Record<string, number>,
        securityRequiredEndpoints: 0,
        deprecatedEndpoints: 0
      };

      Object.values(paths).forEach((pathItem: any) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (method !== 'parameters' && operation && typeof operation === 'object') {
            statistics.totalEndpoints++;
            
            // Count methods
            statistics.methodCounts[method.toUpperCase()] = 
              (statistics.methodCounts[method.toUpperCase()] || 0) + 1;
            
            // Count tags
            if (operation.tags) {
              operation.tags.forEach((tag: string) => {
                statistics.tagCounts[tag] = (statistics.tagCounts[tag] || 0) + 1;
              });
            }
            
            // Count security requirements
            if (operation.security || spec.security) {
              statistics.securityRequiredEndpoints++;
            }
            
            // Count deprecated endpoints
            if (operation.deprecated) {
              statistics.deprecatedEndpoints++;
            }
          }
        });
      });

      return statistics;
    } catch (error) {
      logger.error('Failed to generate API statistics', error);
      return {
        totalEndpoints: 0,
        methodCounts: {},
        tagCounts: {},
        securityRequiredEndpoints: 0,
        deprecatedEndpoints: 0
      };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const swaggerService = SwaggerService.getInstance();

export default swaggerService; 