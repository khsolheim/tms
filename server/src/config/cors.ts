import { CorsOptions } from 'cors';

const getDevelopmentOrigins = (): string[] => [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

const getProductionOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  return origins.map(origin => origin.trim());
};

const getAllowedOrigins = (): string[] => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return getProductionOrigins();
    case 'test':
      return ['http://localhost:3000'];
    default:
      return getDevelopmentOrigins();
  }
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Tillat requests uten origin (f.eks. mobile apps eller Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Ikke tillatt av CORS-policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 timer
}; 