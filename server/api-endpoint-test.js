#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:4000';

// Liste over alle API-endepunkter som skal testes
const endpoints = [
  // Authentication
  { method: 'POST', path: '/api/auth/logg-inn', expectStatus: [400, 401], description: 'Login endpoint' },
  
  // Documentation
  { method: 'GET', path: '/api/v1/docs/json', expectStatus: [200], description: 'API docs JSON' },
  { method: 'GET', path: '/api/v1/docs/stats', expectStatus: [200], description: 'API stats' },
  
  // Protected endpoints (should return 401 without token)
  { method: 'GET', path: '/api/bedrift', expectStatus: [401], description: 'Companies endpoint' },
  { method: 'GET', path: '/api/ansatt', expectStatus: [401], description: 'Employees endpoint' },
  { method: 'GET', path: '/api/elever', expectStatus: [401], description: 'Students endpoint' },
  { method: 'GET', path: '/api/quiz/kategorier', expectStatus: [401], description: 'Quiz categories' },
  { method: 'GET', path: '/api/systemconfig', expectStatus: [401], description: 'System config' },
  { method: 'GET', path: '/api/sikkerhetskontroll', expectStatus: [401], description: 'Security controls' },
  { method: 'GET', path: '/api/bilder', expectStatus: [401], description: 'Images endpoint' },
  { method: 'GET', path: '/api/sjekkpunkter', expectStatus: [401], description: 'Checkpoints' },
  { method: 'GET', path: '/api/kontroll-maler', expectStatus: [401], description: 'Control templates' },
  { method: 'GET', path: '/api/kontrakter', expectStatus: [401], description: 'Contracts' },
  { method: 'GET', path: '/api/tenants', expectStatus: [401], description: 'Tenants' },
  
  // Brønnøysund (requires auth)
  { method: 'GET', path: '/api/bronnoysund/bedrift/123456789', expectStatus: [401], description: 'Brønnøysund lookup' },
  
  // Email (requires auth)
  { method: 'GET', path: '/api/email', expectStatus: [401], description: 'Email service' },
  
  // Validation
  { method: 'GET', path: '/api/validation', expectStatus: [401], description: 'Validation endpoint' },
  
  // Regnskaps-integrasjon
  { method: 'GET', path: '/api/regnskaps-integrasjon/status', expectStatus: [401], description: 'Accounting integration' },
  
  // Non-existent endpoints (should return 404)
  { method: 'GET', path: '/api/nonexistent', expectStatus: [404], description: 'Non-existent endpoint' },
  { method: 'GET', path: '/api/auth/health', expectStatus: [404], description: 'Non-existent auth endpoint' },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TMS-API-Tester/1.0'
      }
    };

    // For POST requests, add a simple body
    let postData = '';
    if (endpoint.method === 'POST') {
      postData = JSON.stringify({});
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const result = {
          ...endpoint,
          actualStatus: res.statusCode,
          success: endpoint.expectStatus.includes(res.statusCode),
          response: data
        };
        resolve(result);
      });
    });

    req.on('error', (err) => {
      resolve({
        ...endpoint,
        actualStatus: 'ERROR',
        success: false,
        error: err.message
      });
    });

    // Send POST data if needed
    if (endpoint.method === 'POST') {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing TMS API Endpoints...\n');
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log(`🔍 Testing ${endpoints.length} endpoints\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.method} ${endpoint.path}... `);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.actualStatus} (expected ${result.expectStatus.join('/')})`);
    } else {
      console.log(`❌ ${result.actualStatus} (expected ${result.expectStatus.join('/')})`);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`🎯 Success Rate: ${Math.round((successful / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  • ${result.method} ${result.path}: got ${result.actualStatus}, expected ${result.expectStatus.join('/')}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
  }
  
  console.log('\n🏁 Test completed!\n');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
http.get(`${BASE_URL}/api/v1/docs/stats`, (res) => {
  if (res.statusCode === 200) {
    runTests();
  } else {
    console.error('❌ Server is not responding correctly. Please start the server first.');
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('❌ Cannot connect to server. Please start the server first.');
  console.error(`   Run: cd server && npm run dev`);
  process.exit(1);
}); 