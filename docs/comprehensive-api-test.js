#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:4000';

// Komplett liste over alle API-endepunkter som skal sjekkes
const endpoints = [
  // ===== AUTHENTICATION & USER MANAGEMENT =====
  { method: 'POST', path: '/api/auth/logg-inn', expectStatus: [400, 401], category: 'Authentication', description: 'User login' },
  { method: 'POST', path: '/api/auth/registrer', expectStatus: [400, 401], category: 'Authentication', description: 'User registration' },
  { method: 'POST', path: '/api/auth/glemtpassord', expectStatus: [400, 404], category: 'Authentication', description: 'Password reset' },
  
  // ===== EMPLOYEE MANAGEMENT =====
  { method: 'GET', path: '/api/ansatt', expectStatus: [401, 200], category: 'Employee', description: 'Employee API root' },
  { method: 'GET', path: '/api/ansatt/profile', expectStatus: [401], category: 'Employee', description: 'Get user profile' },
  { method: 'POST', path: '/api/ansatt/create', expectStatus: [401], category: 'Employee', description: 'Create employee' },
  { method: 'POST', path: '/api/ansatt/change-password', expectStatus: [401], category: 'Employee', description: 'Change password' },
  
  // ===== COMPANY MANAGEMENT =====
  { method: 'GET', path: '/api/bedrift', expectStatus: [401], category: 'Company', description: 'Get companies' },
  { method: 'POST', path: '/api/bedrift', expectStatus: [401], category: 'Company', description: 'Create company' },
  { method: 'GET', path: '/api/bedrift/search', expectStatus: [401], category: 'Company', description: 'Search companies' },
  
  // ===== STUDENT MANAGEMENT =====
  { method: 'GET', path: '/api/elever', expectStatus: [401], category: 'Students', description: 'Get students' },
  { method: 'POST', path: '/api/elever', expectStatus: [401], category: 'Students', description: 'Create student' },
  { method: 'GET', path: '/api/elever/search', expectStatus: [401], category: 'Students', description: 'Search students' },
  
  // ===== QUIZ & TESTING =====
  { method: 'GET', path: '/api/quiz/kategorier', expectStatus: [401], category: 'Quiz', description: 'Get quiz categories' },
  { method: 'GET', path: '/api/quiz/sporsmaal', expectStatus: [401], category: 'Quiz', description: 'Get quiz questions' },
  { method: 'POST', path: '/api/quiz/resultat', expectStatus: [401], category: 'Quiz', description: 'Submit quiz result' },
  
  // ===== SAFETY CONTROLS =====
  { method: 'GET', path: '/api/sikkerhetskontroll', expectStatus: [401], category: 'Safety', description: 'Get safety controls' },
  { method: 'POST', path: '/api/sikkerhetskontroll', expectStatus: [401], category: 'Safety', description: 'Create safety control' },
  { method: 'GET', path: '/api/sjekkpunkter', expectStatus: [401], category: 'Safety', description: 'Get checkpoints' },
  { method: 'GET', path: '/api/kontroll-maler', expectStatus: [401], category: 'Safety', description: 'Get control templates' },
  
  // ===== CONTRACTS =====
  { method: 'GET', path: '/api/kontrakter', expectStatus: [401], category: 'Contracts', description: 'Get contracts' },
  { method: 'POST', path: '/api/kontrakter', expectStatus: [401], category: 'Contracts', description: 'Create contract' },
  
  // ===== FILE MANAGEMENT =====
  { method: 'GET', path: '/api/bilder', expectStatus: [401], category: 'Files', description: 'Get images' },
  { method: 'POST', path: '/api/bilder/upload', expectStatus: [401], category: 'Files', description: 'Upload image' },
  
  // ===== SYSTEM CONFIGURATION =====
  { method: 'GET', path: '/api/systemconfig', expectStatus: [401], category: 'System', description: 'Get system config' },
  { method: 'PUT', path: '/api/systemconfig', expectStatus: [401], category: 'System', description: 'Update system config' },
  
  // ===== VALIDATION SERVICES =====
  { method: 'GET', path: '/api/validation', expectStatus: [401, 200], category: 'Validation', description: 'Validation API root' },
  { method: 'GET', path: '/api/validation/email', expectStatus: [401], category: 'Validation', description: 'Validate email' },
  { method: 'GET', path: '/api/validation/personnummer', expectStatus: [401], category: 'Validation', description: 'Validate personnummer' },
  
  // ===== EXTERNAL INTEGRATIONS =====
  { method: 'GET', path: '/api/bronnoysund/bedrift/123456789', expectStatus: [401], category: 'External', description: 'Brønnøysund lookup' },
  { method: 'GET', path: '/api/regnskaps-integrasjon/status', expectStatus: [401], category: 'External', description: 'Accounting integration' },
  
  // ===== COMMUNICATION =====
  { method: 'GET', path: '/api/email', expectStatus: [401], category: 'Communication', description: 'Email API' },
  { method: 'POST', path: '/api/email/send', expectStatus: [401], category: 'Communication', description: 'Send email' },
  
  // ===== TENANT MANAGEMENT =====
  { method: 'GET', path: '/api/tenants', expectStatus: [401], category: 'Tenants', description: 'Get tenants' },
  { method: 'POST', path: '/api/tenants', expectStatus: [401], category: 'Tenants', description: 'Create tenant' },
  
  // ===== DOCUMENTATION =====
  { method: 'GET', path: '/api/v1/docs/json', expectStatus: [200], category: 'Documentation', description: 'API docs JSON' },
  { method: 'GET', path: '/api/v1/docs/stats', expectStatus: [200], category: 'Documentation', description: 'API statistics' },
  { method: 'GET', path: '/api/v1/docs/health', expectStatus: [200], category: 'Documentation', description: 'API health check' },
  
  // ===== TEST ROUTES =====
  { method: 'GET', path: '/api/nonexistent', expectStatus: [404], category: 'Test', description: 'Non-existent endpoint' },
  { method: 'GET', path: '/api/ansatt-test', expectStatus: [200], category: 'Test', description: 'Test route' }
];

// Farger for konsoll output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function makeRequest(method, path) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TMS-API-Test/1.0'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Request timeout'
      });
    });

    if (method === 'POST' || method === 'PUT') {
      req.write('{}');
    }
    
    req.end();
  });
}

async function testEndpoint(endpoint) {
  const { method, path, expectStatus, category, description } = endpoint;
  
  try {
    const result = await makeRequest(method, path);
    const success = expectStatus.includes(result.status);
    
    const statusColor = success ? colors.green : colors.red;
    const statusSymbol = success ? '✅' : '❌';
    
    console.log(`${statusSymbol} ${colors.cyan}${category}${colors.reset} | ${method} ${path} | ${statusColor}${result.status}${colors.reset} (expected ${expectStatus.join('/')}) | ${description}`);
    
    return { success, status: result.status, expected: expectStatus, endpoint };
  } catch (error) {
    console.log(`❌ ${colors.cyan}${category}${colors.reset} | ${method} ${path} | ${colors.red}ERROR${colors.reset} | ${error.message}`);
    return { success: false, error: error.message, endpoint };
  }
}

async function runTests() {
  console.log(`${colors.bold}${colors.blue}🧪 TMS API COMPREHENSIVE TEST${colors.reset}`);
  console.log(`${colors.blue}📡 Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.blue}🔍 Testing ${endpoints.length} endpoints${colors.reset}`);
  console.log('');

  const results = {
    total: endpoints.length,
    passed: 0,
    failed: 0,
    byCategory: {},
    failedTests: []
  };

  // Test alle endepunkter
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    if (!results.byCategory[endpoint.category]) {
      results.byCategory[endpoint.category] = { total: 0, passed: 0, failed: 0 };
    }
    
    results.byCategory[endpoint.category].total++;
    
    if (result.success) {
      results.passed++;
      results.byCategory[endpoint.category].passed++;
    } else {
      results.failed++;
      results.byCategory[endpoint.category].failed++;
      results.failedTests.push(result);
    }
  }

  // Vis sammendrag
  console.log('');
  console.log(`${colors.bold}📊 TEST SUMMARY${colors.reset}`);
  console.log('================');
  console.log(`${colors.green}✅ Successful: ${results.passed}/${results.total}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}/${results.total}${colors.reset}`);
  console.log(`${colors.yellow}🎯 Success Rate: ${Math.round((results.passed / results.total) * 100)}%${colors.reset}`);
  
  // Vis resultater per kategori
  console.log('');
  console.log(`${colors.bold}📋 RESULTS BY CATEGORY${colors.reset}`);
  console.log('=======================');
  Object.entries(results.byCategory).forEach(([category, stats]) => {
    const successRate = Math.round((stats.passed / stats.total) * 100);
    const categoryColor = successRate === 100 ? colors.green : successRate >= 80 ? colors.yellow : colors.red;
    console.log(`${categoryColor}${category}: ${stats.passed}/${stats.total} (${successRate}%)${colors.reset}`);
  });

  // Vis feilede tester
  if (results.failedTests.length > 0) {
    console.log('');
    console.log(`${colors.bold}${colors.red}❌ FAILED TESTS${colors.reset}`);
    console.log('===============');
    results.failedTests.forEach(test => {
      const endpoint = test.endpoint;
      if (test.error) {
        console.log(`  • ${endpoint.method} ${endpoint.path}: ${test.error}`);
      } else {
        console.log(`  • ${endpoint.method} ${endpoint.path}: got ${test.status}, expected ${test.expected.join('/')}`);
      }
    });
  }

  console.log('');
  console.log(`${colors.bold}🏁 Test completed!${colors.reset}`);
  
  // Exit med riktig kode
  process.exit(results.failed > 0 ? 1 : 0);
}

// Kjør testene
runTests().catch(error => {
  console.error(`${colors.red}💥 Fatal error:${colors.reset}`, error);
  process.exit(1);
}); 