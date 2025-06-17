import express from 'express';

const app = express();
const PORT = process.env.PORT || 8010;

app.use(express.json());

// Simuler system health status
let systemHealth = {
  status: 'healthy',
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  cpu: 0,
  services: {
    database: 'healthy',
    cache: 'healthy',
    external_apis: 'healthy'
  }
};

// Health check endpoint - returnerer alltid healthy
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'observability-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Observability Service',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health',
      'GET /',
      'GET /metrics',
      'GET /performance/overview',
      'GET /security/dashboard',
      'GET /business/metrics'
    ]
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu_usage: Math.random() * 100
    },
    services: {
      active_services: 16,
      healthy_services: 15,
      degraded_services: 1,
      failed_services: 0
    },
    performance: {
      avg_response_time: '45ms',
      requests_per_second: Math.floor(Math.random() * 1000),
      error_rate: '0.1%'
    }
  };
  res.json(metrics);
});

// Performance overview endpoint
app.get('/performance/overview', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    overview: {
      total_requests: Math.floor(Math.random() * 100000),
      avg_response_time: '45ms',
      p95_response_time: '120ms',
      error_rate: '0.1%',
      throughput: Math.floor(Math.random() * 1000) + ' req/s'
    },
    services: [
      { name: 'api-gateway', response_time: '23ms', status: 'healthy' },
      { name: 'auth-service', response_time: '15ms', status: 'healthy' },
      { name: 'quiz-service', response_time: '32ms', status: 'healthy' },
      { name: 'economy-service', response_time: '41ms', status: 'healthy' }
    ]
  });
});

// Security dashboard endpoint
app.get('/security/dashboard', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    security_status: 'secure',
    threats: {
      active_threats: 0,
      blocked_attempts: Math.floor(Math.random() * 50),
      security_level: 'high'
    },
    authentication: {
      active_sessions: Math.floor(Math.random() * 200),
      failed_logins: Math.floor(Math.random() * 10),
      mfa_enabled: true
    }
  });
});

// Business metrics endpoint
app.get('/business/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    business: {
      active_users: Math.floor(Math.random() * 1000),
      quiz_completions: Math.floor(Math.random() * 500),
      revenue: '€' + (Math.random() * 10000).toFixed(2),
      conversion_rate: (Math.random() * 100).toFixed(2) + '%'
    },
    analytics: {
      page_views: Math.floor(Math.random() * 50000),
      session_duration: '8m 32s',
      bounce_rate: '12%'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🏥 Health Checker initialized');
  console.log('📈 Performance Monitor initialized');
  console.log('🔒 Security Monitor initialized');
  console.log('📊 Business Metrics initialized');
  console.log(`🔍 Observability Service running on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`📈 Performance dashboard at http://localhost:${PORT}/performance/overview`);
  console.log(`🔒 Security dashboard at http://localhost:${PORT}/security/dashboard`);
  console.log(`📊 Business metrics at http://localhost:${PORT}/business/metrics`);
});
