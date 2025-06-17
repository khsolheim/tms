import express from 'express';

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'auth-service', 
    timestamp: new Date().toISOString(),
    version: '1.0.0' 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Auth Service',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health',
      'GET /',
      'POST /auth/login',
      'POST /auth/register',
      'POST /auth/verify',
      'GET /auth/profile'
    ]
  });
});

// Simple auth endpoints
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({ 
    message: 'Login endpoint',
    token: 'mock-jwt-token',
    user: { email },
    success: true
  });
});

app.post('/auth/register', (req, res) => {
  const { email, password, navn } = req.body;
  res.json({ 
    message: 'Register endpoint',
    user: { email, navn },
    success: true
  });
});

app.post('/auth/verify', (req, res) => {
  const { token } = req.body;
  res.json({ 
    message: 'Token verification',
    valid: true,
    user: { id: '1', email: 'test@example.com' }
  });
});

app.get('/auth/profile', (req, res) => {
  res.json({ 
    message: 'User profile',
    user: { id: '1', email: 'test@example.com', navn: 'Test Bruker' }
  });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
}); 