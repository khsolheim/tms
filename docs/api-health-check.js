#!/usr/bin/env node
/**
 * TMS API Health Check & Endepunkt Verifikasjon
 * Sjekker alle API-endepunkter systematisk
 */

const http = require('http');
const BASE_URL = 'http://localhost:4000';

// Komplett liste over forventede API-endepunkter
const API_ENDPOINTS = [
  // Authentication
  { method: 'POST', path: '/api/auth/logg-inn', expectStatus: [400, 401], category: 'Auth' },
  { method: 'POST', path: '/api/auth/registrer', expectStatus: [400, 401, 404], category: 'Auth' },
  
  // Employee Management (Ansatt)
  { method: 'GET', path: '/api/ansatt', expectStatus: [401, 200, 404], category: 'Ansatt', critical: true },
  { method: 'GET', path: '/api/ansatt/profile', expectStatus: [401], category: 'Ansatt' },
  { method: 'POST', path: '/api/ansatt/create', expectStatus: [401, 404], category: 'Ansatt', critical: true },
  { method: 'POST', path: '/api/ansatt/change-password', expectStatus: [401], category: 'Ansatt' },
  
  // Company Management (Bedrift)
  { method: 'GET', path: '/api/bedrift', expectStatus: [401], category: 'Bedrift' },
  { method: 'POST', path: '/api/bedrift', expectStatus: [401], category: 'Bedrift' },
  
  // Students (Elever)
  { method: 'GET', path: '/api/elever', expectStatus: [401], category: 'Elever' },
  { method: 'POST', path: '/api/elever', expectStatus: [401], category: 'Elever' },
  
  // Quiz System
  { method: 'GET', path: '/api/quiz/kategorier', expectStatus: [401], category: 'Quiz' },
  { method: 'GET', path: '/api/quiz/sporsmaal', expectStatus: [401, 404], category: 'Quiz' },
  
  // Safety Controls (Sikkerhet)
  { method: 'GET', path: '/api/sikkerhetskontroll', expectStatus: [401], category: 'Sikkerhet' },
  { method: 'GET', path: '/api/sjekkpunkter', expectStatus: [401], category: 'Sikkerhet' },
  { method: 'GET', path: '/api/kontroll-maler', expectStatus: [401], category: 'Sikkerhet' },
  
  // Contracts (Kontrakter)
  { method: 'GET', path: '/api/kontrakter', expectStatus: [401], category: 'Kontrakter' },
  
  // File Management
  { method: 'GET', path: '/api/bilder', expectStatus: [401], category: 'Filer' },
  
  // System Configuration
  { method: 'GET', path: '/api/systemconfig', expectStatus: [401], category: 'System' },
  
  // Validation
  { method: 'GET', path: '/api/validation', expectStatus: [401, 200, 404], category: 'Validering', critical: true },
  { method: 'GET', path: '/api/validation/email', expectStatus: [401], category: 'Validering' },
  
  // External Integrations
  { method: 'GET', path: '/api/bronnoysund/bedrift/123456789', expectStatus: [401], category: 'Eksternt' },
  { method: 'GET', path: '/api/regnskaps-integrasjon/status', expectStatus: [401], category: 'Eksternt' },
  
  // Communication
  { method: 'GET', path: '/api/email', expectStatus: [401], category: 'Kommunikasjon' },
  
  // Tenants
  { method: 'GET', path: '/api/tenants', expectStatus: [401], category: 'Tenants' },
  
  // Documentation
  { method: 'GET', path: '/api/v1/docs/json', expectStatus: [200], category: 'Docs' },
  { method: 'GET', path: '/api/v1/docs/stats', expectStatus: [200], category: 'Docs' },
];

async function makeRequest(method, path) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 4000,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', () => resolve({ status: 0, error: 'Connection failed' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'Timeout' }); });
    
    if (method === 'POST') req.write('{}');
    req.end();
  });
}

async function testEndpoint(endpoint) {
  const { method, path, expectStatus, category, critical } = endpoint;
  const result = await makeRequest(method, path);
  const success = expectStatus.includes(result.status);
  
  const icon = success ? '✅' : (critical ? '🚨' : '❌');
  const status = result.status || 'ERR';
  
  console.log(`${icon} ${category.padEnd(12)} | ${method.padEnd(4)} ${path.padEnd(40)} | ${status} (expect: ${expectStatus.join('/')})`);
  
  return { ...endpoint, actualStatus: status, success, result };
}

async function runHealthCheck() {
  console.log('🔍 TMS API HEALTH CHECK');
  console.log('='.repeat(80));
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log(`🔍 Testing ${API_ENDPOINTS.length} endpoints\n`);

  const results = [];
  for (const endpoint of API_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }

  // Sammendrag
  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const critical = results.filter(r => r.critical && !r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n📊 SAMMENDRAG');
  console.log('='.repeat(50));
  console.log(`✅ Fungerer: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  console.log(`❌ Feilet: ${failed.length}/${total}`);
  console.log(`🚨 Kritiske feil: ${critical.length}`);

  // Vis kategorier
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) categories[r.category] = { total: 0, passed: 0 };
    categories[r.category].total++;
    if (r.success) categories[r.category].passed++;
  });

  console.log('\n📋 RESULTATER PER KATEGORI');
  console.log('='.repeat(50));
  Object.entries(categories).forEach(([cat, stats]) => {
    const pct = Math.round(stats.passed / stats.total * 100);
    const icon = pct === 100 ? '✅' : pct >= 80 ? '⚠️' : '❌';
    console.log(`${icon} ${cat}: ${stats.passed}/${stats.total} (${pct}%)`);
  });

  // Kritiske problemer
  if (critical.length > 0) {
    console.log('\n🚨 KRITISKE PROBLEMER');
    console.log('='.repeat(50));
    critical.forEach(r => {
      console.log(`• ${r.method} ${r.path} - Status: ${r.actualStatus} (forventet: ${r.expectStatus.join('/')})`);
    });
  }

  // Alle feil
  if (failed.length > 0) {
    console.log('\n❌ ALLE FEILEDE ENDEPUNKTER');
    console.log('='.repeat(50));
    failed.forEach(r => {
      const priority = r.critical ? '🚨 KRITISK' : '⚠️ Normal';
      console.log(`${priority} | ${r.method} ${r.path} - ${r.actualStatus} (forventet: ${r.expectStatus.join('/')})`);
    });
  }

  console.log('\n🏁 Health Check Fullført!');
  return { total, passed, failed: failed.length, critical: critical.length };
}

// Kjør health check
runHealthCheck().then(summary => {
  if (summary.critical > 0) {
    console.log('\n🚨 KRITISK: Systemet har kritiske feil som må fikses!');
    process.exit(2);
  } else if (summary.failed > 0) {
    console.log('\n⚠️ ADVARSEL: Systemet har mindre feil');
    process.exit(1);
  } else {
    console.log('\n✅ SUCCESS: Alle endepunkter fungerer!');
    process.exit(0);
  }
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(3);
}); 