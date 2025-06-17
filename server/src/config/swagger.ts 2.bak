import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TMS API - Traffic Management System',
      version: '1.0.0',
      description: `
        Omfattende API for Traffic Management System (TMS).
        
        ## Funksjoner
        - 🔐 Autentisering og autorisasjon
        - 🏢 Bedriftshåndtering
        - 👥 Brukerhåndtering
        - 🛡️ Sikkerhetskontroll
        - 📊 Rapportering og analytics
        - 🚗 Kjøretøyhåndtering
        - 📋 Quiz og testing
        - 🔧 System administrasjon
        
        ## Sikkerhet
        API-et bruker JWT Bearer tokens for autentisering.
        Alle endepunkter krever gyldig token med mindre annet er spesifisert.
        
        ## Rate Limiting
        - Generelle API-kall: 100 req/min
        - Autentisering: 5 req/15min
        - Admin-operasjoner: 20 req/min
        
        ## Feilhåndtering
        Alle feil returneres i standardisert format med norske feilmeldinger.
      `,
      contact: {
        name: 'TMS Support',
        email: 'support@tms.no',
        url: 'https://tms.no/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.tms.no',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for API authentication'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for service-to-service communication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['success', 'error', 'code'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Feilmelding på norsk',
              example: 'Ugyldig forespørsel'
            },
            code: {
              type: 'string',
              description: 'Feilkode for programmatisk håndtering',
              example: 'VALIDATION_ERROR'
            },
            details: {
              type: 'object',
              description: 'Detaljert feilinformasjon',
              additionalProperties: true
            },
            requestId: {
              type: 'string',
              description: 'Unik ID for forespørselen',
              example: 'req_123456789'
            }
          }
        },
        Success: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Suksessmelding på norsk',
              example: 'Operasjon fullført'
            },
            data: {
              type: 'object',
              description: 'Responsdata',
              additionalProperties: true
            },
            requestId: {
              type: 'string',
              description: 'Unik ID for forespørselen',
              example: 'req_123456789'
            }
          }
        },
        Bruker: {
          type: 'object',
          required: ['id', 'fornavn', 'etternavn', 'epost', 'rolle'],
          properties: {
            id: {
              type: 'string',
              description: 'Unik bruker-ID',
              example: 'usr_123456789'
            },
            fornavn: {
              type: 'string',
              description: 'Brukerens fornavn',
              example: 'Ola'
            },
            etternavn: {
              type: 'string',
              description: 'Brukerens etternavn',
              example: 'Nordmann'
            },
            epost: {
              type: 'string',
              format: 'email',
              description: 'Brukerens e-postadresse',
              example: 'ola.nordmann@example.com'
            },
            telefon: {
              type: 'string',
              description: 'Brukerens telefonnummer',
              example: '+47 12345678'
            },
            rolle: {
              type: 'string',
              enum: ['BRUKER', 'INSTRUKTØR', 'ADMIN', 'SUPER_ADMIN'],
              description: 'Brukerens rolle i systemet'
            },
            bedriftId: {
              type: 'string',
              description: 'ID til brukerens bedrift',
              example: 'bed_123456789'
            },
            isAktiv: {
              type: 'boolean',
              description: 'Om brukeren er aktiv',
              example: true
            },
            opprettet: {
              type: 'string',
              format: 'date-time',
              description: 'Når brukeren ble opprettet'
            },
            sistInnlogget: {
              type: 'string',
              format: 'date-time',
              description: 'Siste innlogging'
            }
          }
        },
        Bedrift: {
          type: 'object',
          required: ['id', 'navn', 'organisasjonsnummer'],
          properties: {
            id: {
              type: 'string',
              description: 'Unik bedrift-ID',
              example: 'bed_123456789'
            },
            navn: {
              type: 'string',
              description: 'Bedriftens navn',
              example: 'Eksempel Transport AS'
            },
            organisasjonsnummer: {
              type: 'string',
              description: 'Bedriftens organisasjonsnummer',
              example: '123456789'
            },
            epost: {
              type: 'string',
              format: 'email',
              description: 'Bedriftens e-postadresse',
              example: 'post@eksempel.no'
            },
            telefon: {
              type: 'string',
              description: 'Bedriftens telefonnummer',
              example: '+47 12345678'
            },
            adresse: {
              type: 'string',
              description: 'Bedriftens adresse',
              example: 'Eksempelveien 1, 0123 Oslo'
            },
            postnummer: {
              type: 'string',
              description: 'Postnummer',
              example: '0123'
            },
            poststed: {
              type: 'string',
              description: 'Poststed',
              example: 'Oslo'
            },
            isAktiv: {
              type: 'boolean',
              description: 'Om bedriften er aktiv',
              example: true
            },
            opprettet: {
              type: 'string',
              format: 'date-time',
              description: 'Når bedriften ble opprettet'
            }
          }
        },
        HealthStatus: {
          type: 'object',
          required: ['status', 'timestamp'],
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'Systemets helsetilstand'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Tidspunkt for helsesjekk'
            },
            uptime: {
              type: 'number',
              description: 'Oppetid i sekunder',
              example: 3600
            },
            version: {
              type: 'string',
              description: 'API-versjon',
              example: '1.0.0'
            },
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['connected', 'disconnected', 'error']
                },
                connections: {
                  type: 'object',
                  properties: {
                    active: { type: 'number' },
                    idle: { type: 'number' },
                    total: { type: 'number' }
                  }
                }
              }
            },
            cache: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['connected', 'disconnected', 'error']
                },
                hitRate: {
                  type: 'number',
                  description: 'Cache hit rate i prosent'
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Ikke autentisert - ugyldig eller manglende token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Ikke autentisert',
                code: 'UNAUTHORIZED',
                requestId: 'req_123456789'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Ikke autorisert - utilstrekkelige rettigheter',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Ikke autorisert for denne operasjonen',
                code: 'FORBIDDEN',
                requestId: 'req_123456789'
              }
            }
          }
        },
        ValidationError: {
          description: 'Valideringsfeil - ugyldig input',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Valideringsfeil',
                code: 'VALIDATION_ERROR',
                details: {
                  epost: 'Ugyldig e-postformat'
                },
                requestId: 'req_123456789'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressurs ikke funnet',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Ressurs ikke funnet',
                code: 'NOT_FOUND',
                requestId: 'req_123456789'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit overskredet',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'For mange forespørsler',
                code: 'RATE_LIMIT_EXCEEDED',
                requestId: 'req_123456789'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Intern serverfeil',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Intern serverfeil',
                code: 'INTERNAL_SERVER_ERROR',
                requestId: 'req_123456789'
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
        name: 'Health',
        description: 'System health og status endepunkter'
      },
      {
        name: 'Auth',
        description: 'Autentisering og autorisasjon'
      },
      {
        name: 'Brukere',
        description: 'Brukerhåndtering'
      },
      {
        name: 'Bedrifter',
        description: 'Bedriftshåndtering'
      },
      {
        name: 'Sikkerhetskontroll',
        description: 'Sikkerhetskontroll og inspeksjoner'
      },
      {
        name: 'Quiz',
        description: 'Quiz og testing'
      },
      {
        name: 'Rapporter',
        description: 'Rapportering og analytics'
      },
      {
        name: 'Admin',
        description: 'Administrativ funksjoner'
      },
      {
        name: 'Monitoring',
        description: 'System monitoring og metrics'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/middleware/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
    `,
    customSiteTitle: 'TMS API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2
    }
  }));

  // JSON endpoint for API specification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export { specs }; 