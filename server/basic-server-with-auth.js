const http = require('http');
const url = require('url');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 4000;

// Database connection
const client = new Client({
  connectionString: "postgresql://db_tms:oiq3-DEOH-jck4@91.108.121.251:5432/db_tms"
});

// Initialize database connection
let dbConnected = false;
client.connect()
  .then(() => {
    console.log('🗄️ Connected to PostgreSQL database');
    dbConnected = true;
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('⚠️ Falling back to demo mode');
  });

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

// Database authentication function
async function authenticateUser(epost, passord) {
  if (!dbConnected) {
    throw new Error('Database not connected');
  }
  
  try {
    const result = await client.query(
      'SELECT id, fornavn, etternavn, epost, "passordHash", rolle, tilganger, aktiv FROM "Ansatt" WHERE epost = $1 AND "isDeleted" = false',
      [epost]
    );
    
    if (result.rows.length === 0) {
      return null; // User not found
    }
    
    const user = result.rows[0];
    
    if (!user.aktiv) {
      return null; // User inactive
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(passord, user.passordHash);
    if (!isValidPassword) {
      return null; // Invalid password
    }
    
    // Return user without password hash
    return {
      id: user.id,
      navn: `${user.fornavn} ${user.etternavn}`,
      epost: user.epost,
      rolle: user.rolle,
      tilganger: user.tilganger
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
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
        version: '1.0.0',
        database: dbConnected ? 'connected' : 'disconnected'
      }));
    }
    // Auth endpoints - real authentication if database connected
    else if (parsedUrl.pathname === '/api/auth/logg-inn' && req.method === 'POST') {
      const body = await readBody(req);
      const data = JSON.parse(body);
      console.log('🔐 Login attempt:', data.epost);
      
      if (dbConnected) {
        try {
          const user = await authenticateUser(data.epost, data.passord);
          
          if (user) {
            console.log('✅ Authentication successful for:', user.epost);
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              token: 'real-auth-token-' + Date.now(),
              bruker: {
                id: user.id,
                navn: user.navn,
                epost: user.epost,
                rolle: user.rolle,
                tilganger: user.tilganger,
                bedrift: null // TODO: Add bedrift relation
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
        } catch (error) {
          console.error('❌ Authentication error:', error);
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            error: 'Intern serverfeil'
          }));
        }
      } else {
        // Fallback to demo mode
        console.log('🔐 Demo login (database not connected):', data.epost);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'demo-token-123',
          bruker: {
            id: '1',
            navn: 'Demo Bruker',
            epost: data.epost || 'demo@tms.no',
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
    // Auth login (English endpoint)
    else if (parsedUrl.pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      const data = JSON.parse(body);
      console.log('🔐 Login attempt (EN):', data.epost);
      
      if (dbConnected) {
        try {
          const user = await authenticateUser(data.epost, data.passord);
          
          if (user) {
            console.log('✅ Authentication successful for:', user.epost);
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              token: 'real-auth-token-' + Date.now(),
              bruker: {
                id: user.id,
                navn: user.navn,
                epost: user.epost,
                rolle: user.rolle,
                tilganger: user.tilganger,
                bedrift: null // TODO: Add bedrift relation
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
        } catch (error) {
          console.error('❌ Authentication error:', error);
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            error: 'Internal server error'
          }));
        }
      } else {
        // Fallback to demo mode
        console.log('🔐 Demo login (database not connected):', data.epost);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token: 'demo-token-123',
          bruker: {
            id: '1',
            navn: 'Demo Bruker',
            epost: data.epost || 'demo@tms.no',
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
      // In real implementation, verify token and get user from database
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        bruker: {
          id: '2',
          navn: 'Admin Bruker',
          epost: 'admin@test.no',
          rolle: 'ADMIN',
          tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
          bedrift: null
        }
      }));
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
        message: 'TMS Server with Database Authentication',
        mode: dbConnected ? 'database' : 'demo',
        database: dbConnected ? 'connected' : 'disconnected',
        endpoints: [
          'GET /api/v1/health',
          'POST /api/auth/logg-inn (with real auth)',
          'POST /api/auth/login (with real auth)',
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
  console.log(`🗄️ Database: ${dbConnected ? 'Connected' : 'Demo mode'}`);
  console.log(`🔐 Real authentication: ${dbConnected ? 'Enabled' : 'Disabled'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/auth/logg-inn - ${dbConnected ? 'Real auth' : 'Demo'} login (Norwegian)`);
  console.log(`   POST /api/auth/login - ${dbConnected ? 'Real auth' : 'Demo'} login (English)`);
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
  client.end();
  process.exit(0);
}); 