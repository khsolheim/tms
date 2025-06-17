import express from 'express';

const app = express();
const PORT = process.env.PORT || 8004;

app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sikkerhetskontroll-service', timestamp: new Date().toISOString() });
});

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Sikkerhetskontroll Service',
    version: '1.0.0',
    status: 'running'
  });
});

// Simple sikkerhetskontroll endpoints
app.get('/sikkerhetskontroll', (req, res) => {
  res.json({ 
    message: 'Sikkerhetskontroll service is running',
    endpoints: [
      'GET /health',
      'GET /',
      'GET /sikkerhetskontroll'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Sikkerhetskontroll service running on port ${PORT}`);
}); 