const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 4000;

// Helper function to read body data
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Set content type
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Routes
    if (parsedUrl.pathname === '/api/v1/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }));
    }
    // Auth endpoints
    else if (parsedUrl.pathname === '/api/auth/logg-inn' && req.method === 'POST') {
      const body = await readBody(req);
      const data = JSON.parse(body);
      console.log('🔐 Login attempt:', data.epost);
      
      // Sjekk spesielt for admin-brukeren
      if (data.epost === 'admin@test.no' && data.passord === 'admin123') {
        console.log('✅ Admin authentication successful');
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'admin-auth-token-' + Date.now(),
          bruker: {
            id: 2,
            navn: 'Admin Bruker',
            epost: 'admin@test.no',
            rolle: 'ADMIN',
            tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
            bedrift: null
          }
        }));
      } else {
        console.log('❌ Authentication failed for:', data.epost);
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          error: 'Ugyldig e-post eller passord'
        }));
      }
    }
    // Auth login (English endpoint)
    else if (parsedUrl.pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const data = JSON.parse(body);
      console.log('🔐 Login attempt (EN):', data.epost);
      
      // Sjekk spesielt for admin-brukeren
      if (data.epost === 'admin@test.no' && data.passord === 'admin123') {
        console.log('✅ Admin authentication successful');
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'admin-auth-token-' + Date.now(),
          bruker: {
            id: 2,
            navn: 'Admin Bruker',
            epost: 'admin@test.no',
            rolle: 'ADMIN',
            tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
            bedrift: null
          }
        }));
      } else {
        console.log('❌ Authentication failed for:', data.epost);
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        }));
      }
    }
    // Auth refresh
    else if (parsedUrl.pathname === '/api/auth/refresh' && req.method === 'POST') {
      console.log('🔄 Token refresh');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        token: 'refreshed-token-' + Date.now()
      }));
    }
    // Auth me endpoint
    else if (parsedUrl.pathname === '/api/auth/me') {
      console.log('👤 User info request');
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('admin-auth-token-')) {
        // Return admin user info
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          bruker: {
            id: 2,
            navn: 'Admin Bruker',
            epost: 'admin@test.no',
            rolle: 'ADMIN',
            tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
            bedrift: null
          }
        }));
      } else {
        // Fallback to demo user
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          bruker: {
            id: '1',
            navn: 'Demo Bruker',
            epost: 'demo@tms.no',
            rolle: 'ADMIN',
            tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
            bedrift: {
              id: 1,
              navn: 'Demo Bedrift AS'
            }
          }
        }));
      }
    }
    // Default demo response for any other API call
    else if (parsedUrl.pathname.startsWith('/api/')) {
      console.log('🔧 API call:', req.method, parsedUrl.pathname);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: [],
        message: 'API endpoint - mock response'
      }));
    }
    // Root endpoint
    else if (parsedUrl.pathname === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'TMS Server with Admin Authentication',
        endpoints: [
          'GET /api/v1/health',
          'POST /api/auth/logg-inn (admin@test.no / admin123)',
          'POST /api/auth/login (admin@test.no / admin123)',
          'POST /api/auth/refresh',
          'GET /api/auth/me',
          'Any /api/* - Mock API responses'
        ]
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'Not found'
      }));
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 TMS Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔐 Admin authentication enabled`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/auth/logg-inn - Admin login (Norwegian)`);
  console.log(`   POST /api/auth/login - Admin login (English)`);
  console.log(`   POST /api/auth/refresh - Token refresh`);
  console.log(`   GET /api/auth/me - User info`);
  console.log(`   Any /api/* - Mock API responses`);
  console.log(``);
  console.log(`🔑 Admin credentials:`);
  console.log(`   E-post: admin@test.no`);
  console.log(`   Passord: admin123`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});
