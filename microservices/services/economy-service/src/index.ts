import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8006;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'economy-service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'TMS Economy Service',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health',
      'GET /',
      'GET /invoices',
      'GET /expenses',
      'GET /budgets'
    ]
  });
});

// Mock endpoints
app.get('/invoices', (req, res) => {
  res.json({
    invoices: [
      { id: 1, amount: 1000, status: 'paid', date: '2024-01-01' },
      { id: 2, amount: 2500, status: 'pending', date: '2024-01-15' }
    ],
    total: 2
  });
});

app.get('/expenses', (req, res) => {
  res.json({
    expenses: [
      { id: 1, amount: 500, category: 'office', date: '2024-01-01' },
      { id: 2, amount: 200, category: 'travel', date: '2024-01-10' }
    ],
    total: 2
  });
});

app.get('/budgets', (req, res) => {
  res.json({
    budgets: [
      { id: 1, name: 'Q1 2024', amount: 10000, spent: 7500, remaining: 2500 }
    ],
    total: 1
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
  console.log(`🏦 Economy Service running on port ${PORT}`);
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