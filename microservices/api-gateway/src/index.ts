import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Simple middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Service registry endpoint
app.get('/services', (req, res) => {
  res.json({
    gateway: `http://localhost:${PORT}`,
    services: {
      'notification-service': 'http://localhost:8008',
      'economy-service': 'http://localhost:8006',
      'graphql-service': 'http://localhost:8007',
      'ml-service': 'http://localhost:8009',
      'observability-service': 'http://localhost:8010'
    }
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'TMS API Gateway',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health',
      'GET /services', 
      'GET /'
    ]
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 