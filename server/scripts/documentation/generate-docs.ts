#!/usr/bin/env node

/**
 * API Documentation Generator
 * 
 * Genererer comprehensive API dokumentasjon med:
 * - OpenAPI/Swagger spec
 * - Postman collection  
 * - Testing examples
 * - Integration guides
 */

import fs from 'fs/promises';
import path from 'path';
import swaggerService from '../../src/services/swagger.service';
import logger from '../../src/utils/logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface DocGeneratorConfig {
  outputDir: string;
  includeExamples: boolean;
  includeTestingGuides: boolean;
  includePostmanCollection: boolean;
  environment: 'development' | 'staging' | 'production';
}

const config: DocGeneratorConfig = {
  outputDir: path.resolve(__dirname, '../../../docs/api'),
  includeExamples: true,
  includeTestingGuides: true,
  includePostmanCollection: true,
  environment: (process.env.NODE_ENV as any) || 'development'
};

// ============================================================================
// POSTMAN COLLECTION GENERATOR
// ============================================================================

/**
 * Generate Postman collection from OpenAPI spec
 */
async function generatePostmanCollection(swaggerSpec: any): Promise<any> {
  const collection = {
    info: {
      name: 'TMS API Collection',
      description: 'Comprehensive API collection for TMS (Training Management System)',
      version: swaggerSpec.info.version,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{jwt_token}}',
          type: 'string'
        }
      ]
    },
    event: [
      {
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            'console.log("Sending request to:", pm.request.url);'
          ]
        }
      },
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            'pm.test("Status code is success", function () {',
            '    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);',
            '});',
            '',
            'pm.test("Response time is reasonable", function () {',
            '    pm.expect(pm.response.responseTime).to.be.below(5000);',
            '});'
          ]
        }
      }
    ],
    variable: [
      {
        key: 'base_url',
        value: config.environment === 'production' 
          ? 'https://api.tms.example.com/api/v1'
          : 'http://localhost:3001/api/v1',
        type: 'string'
      },
      {
        key: 'jwt_token',
        value: '',
        type: 'string'
      }
    ],
    item: [] as any[]
  };

  // Generate folders and requests from OpenAPI spec
  const paths = swaggerSpec.paths || {};
  const folders = new Map<string, any>();

  Object.entries(paths).forEach(([pathUrl, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      if (method === 'parameters' || !operation) return;

      const tag = operation.tags?.[0] || 'General';
      
      if (!folders.has(tag)) {
        folders.set(tag, {
          name: tag,
          description: `${tag} related endpoints`,
          item: []
        });
      }

      const request = {
        name: operation.summary || `${method.toUpperCase()} ${pathUrl}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text'
            }
          ],
          url: {
            raw: `{{base_url}}${pathUrl}`,
            host: ['{{base_url}}'],
            path: pathUrl.split('/').filter(p => p)
          },
          description: operation.description || operation.summary
        },
        response: []
      };

      // Add auth header if required
      if (operation.security || swaggerSpec.security) {
        request.request.header.push({
          key: 'Authorization',
          value: 'Bearer {{jwt_token}}',
          type: 'text'
        });
      }

      // Add request body for POST/PUT methods
      if (['post', 'put', 'patch'].includes(method) && operation.requestBody) {
        const schema = operation.requestBody.content?.['application/json']?.schema;
        if (schema) {
          request.request.body = {
            mode: 'raw',
            raw: JSON.stringify(generateExampleFromSchema(schema), null, 2),
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }
      }

      folders.get(tag)!.item.push(request);
    });
  });

  collection.item = Array.from(folders.values());
  return collection;
}

/**
 * Generate example data from JSON schema
 */
function generateExampleFromSchema(schema: any): any {
  if (schema.example) {
    return schema.example;
  }

  if (schema.type === 'object' && schema.properties) {
    const example: any = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      example[key] = generateExampleFromSchema(prop);
    });
    return example;
  }

  if (schema.type === 'array' && schema.items) {
    return [generateExampleFromSchema(schema.items)];
  }

  // Default examples based on type
  switch (schema.type) {
    case 'string':
      if (schema.format === 'email') return 'example@test.com';
      if (schema.format === 'date') return '2023-01-01';
      if (schema.format === 'date-time') return '2023-01-01T10:00:00Z';
      return 'string';
    case 'integer':
      return 1;
    case 'number':
      return 1.0;
    case 'boolean':
      return true;
    default:
      return null;
  }
}

// ============================================================================
// TESTING GUIDE GENERATOR
// ============================================================================

/**
 * Generate comprehensive testing guide
 */
async function generateTestingGuide(swaggerSpec: any): Promise<string> {
  const guide = `# TMS API Testing Guide

## Oversikt

Denne guiden viser hvordan du tester TMS API-et med forskjellige verktøy og metoder.

## 🚀 Rask Start

### 1. Autentisering

Alle API-kall (unntatt innlogging) krever JWT token:

\`\`\`bash
# Logg inn for å få token
curl -X POST http://localhost:3001/api/v1/auth/logg-inn \\
  -H "Content-Type: application/json" \\
  -d '{
    "epost": "admin@example.com",
    "passord": "password123"
  }'
\`\`\`

Response:
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "bruker": {
    "id": 1,
    "navn": "Admin User",
    "epost": "admin@example.com",
    "rolle": "ADMIN"
  }
}
\`\`\`

Bruk token i Authorization header:
\`\`\`bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 2. Rate Limiting

API-et har rate limiting:
- **General API**: 1000 requests per 15 minutter
- **Authentication**: 5 requests per 15 minutter

Headers i response:
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
\`\`\`

## 📋 Testing med curl

### Authentication
\`\`\`bash
# Innlogging
curl -X POST http://localhost:3001/api/v1/auth/logg-inn \\
  -H "Content-Type: application/json" \\
  -d '{"epost": "test@example.com", "passord": "password123"}'

# Impersonering (admin only)
curl -X POST http://localhost:3001/api/v1/auth/impersonate/2 \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"
\`\`\`

### Bedrifter
\`\`\`bash
# Hent alle bedrifter
curl -X GET http://localhost:3001/api/v1/bedrift \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Opprett bedrift
curl -X POST http://localhost:3001/api/v1/bedrift \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "navn": "Test Bedrift AS",
    "organisasjonsnummer": "123456789",
    "adresse": "Testgate 1",
    "postnummer": "0123",
    "poststed": "Oslo"
  }'
\`\`\`

### Kontrakter
\`\`\`bash
# Hent kontrakter med paginering
curl -X GET "http://localhost:3001/api/v1/kontrakter?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Opprett ny kontrakt
curl -X POST http://localhost:3001/api/v1/kontrakter \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "elevId": 1,
    "startDato": "2023-01-01",
    "sluttDato": "2023-12-31",
    "pris": 25000,
    "beskrivelse": "Full sertifiseringskurs"
  }'
\`\`\`

## 🧪 Testing med Jest/Supertest

\`\`\`javascript
import request from 'supertest';
import app from '../src/app';

describe('Auth Endpoints', () => {
  let authToken = '';

  beforeAll(async () => {
    // Login to get token
    const response = await request(app)
      .post('/api/v1/auth/logg-inn')
      .send({
        epost: 'test@example.com',
        passord: 'password123'
      });
    
    authToken = response.body.token;
  });

  test('should authenticate user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logg-inn')
      .send({
        epost: 'test@example.com',
        passord: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('bruker');
  });

  test('should get user profile', async () => {
    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', \`Bearer \${authToken}\`);

    expect(response.status).toBe(200);
    expect(response.body.bruker).toHaveProperty('epost');
  });
});
\`\`\`

## 🔧 Postman Testing

1. **Import Collection**: Last ned \`TMS-API.postman_collection.json\`
2. **Set Environment**: 
   - \`base_url\`: http://localhost:3001/api/v1
   - \`jwt_token\`: (settes automatisk etter innlogging)

3. **Run Authentication**: Kjør "Login" request først
4. **Test Endpoints**: Token settes automatisk i andre requests

### Postman Scripts

Pre-request script (for auto-token):
\`\`\`javascript
// Auto-refresh token if expired
const token = pm.environment.get('jwt_token');
if (!token) {
  console.log('No token found, please login first');
}
\`\`\`

Test script (for validation):
\`\`\`javascript
// Validate response
pm.test('Response is JSON', () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

pm.test('No server errors', () => {
  pm.expect(pm.response.code).to.be.below(500);
});

// Auto-save token from login
if (pm.response.json().token) {
  pm.environment.set('jwt_token', pm.response.json().token);
  console.log('Token saved to environment');
}
\`\`\`

## 🐍 Python Testing

\`\`\`python
import requests
import json

class TMSAPIClient:
    def __init__(self, base_url='http://localhost:3001/api/v1'):
        self.base_url = base_url
        self.token = None
        
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/logg-inn', json={
            'epost': email,
            'passord': password
        })
        
        if response.status_code == 200:
            self.token = response.json()['token']
            return True
        return False
    
    def get_headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers
    
    def get_companies(self):
        return requests.get(
            f'{self.base_url}/bedrift',
            headers=self.get_headers()
        )

# Usage
client = TMSAPIClient()
client.login('admin@example.com', 'password123')
companies = client.get_companies()
print(companies.json())
\`\`\`

## 📊 Performance Testing

### Apache Bench (ab)
\`\`\`bash
# Test login endpoint
ab -n 100 -c 10 -T 'application/json' \\
   -p login.json \\
   http://localhost:3001/api/v1/auth/logg-inn

# login.json:
# {"epost": "test@example.com", "passord": "password123"}
\`\`\`

### Artillery
\`\`\`yaml
# artillery-config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'API Load Test'
    flow:
      - post:
          url: '/api/v1/auth/logg-inn'
          json:
            epost: 'test@example.com'
            passord: 'password123'
          capture:
            - json: '$.token'
              as: 'token'
      - get:
          url: '/api/v1/bedrift'
          headers:
            Authorization: 'Bearer {{ token }}'
\`\`\`

Run: \`artillery run artillery-config.yml\`

## 🔒 Security Testing

### SQL Injection Testing
\`\`\`bash
# Test various injection attempts
curl -X POST http://localhost:3001/api/v1/auth/logg-inn \\
  -H "Content-Type: application/json" \\
  -d '{"epost": "admin@test.com\\'; DROP TABLE users; --", "passord": "test"}'
\`\`\`

### XSS Testing
\`\`\`bash
# Test XSS in input fields
curl -X POST http://localhost:3001/api/v1/bedrift \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"navn": "<script>alert(\\\"xss\\\")</script>"}'
\`\`\`

## 📈 Monitoring og Debugging

### Request Logging
Alle requests logges med:
- Request ID (for sporing)
- Responstid
- Status kode
- IP adresse

### Error Responses
Konsistent error format:
\`\`\`json
{
  "error": "Beskrivende feilmelding",
  "details": ["Spesifikke detaljer"],
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2023-01-01T10:00:00Z"
}
\`\`\`

### Health Check
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

Response:
\`\`\`json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected"
}
\`\`\`

## 🔍 API Documentation

- **Swagger UI**: http://localhost:3001/api/v1/docs
- **OpenAPI Spec**: http://localhost:3001/api/v1/docs/json
- **API Statistics**: http://localhost:3001/api/v1/docs/stats

## 🛠️ Development Tools

### NPM Scripts
\`\`\`bash
npm run dev          # Start development server
npm run test         # Run tests
npm run test:api     # Run API integration tests
npm run docs:generate # Generate API documentation
\`\`\`

### Environment Variables
\`\`\`bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
API_VERSION=1.0.0
\`\`\`
`;

  return guide;
}

// ============================================================================
// INTEGRATION GUIDE GENERATOR
// ============================================================================

/**
 * Generate integration guide for developers
 */
async function generateIntegrationGuide(): Promise<string> {
  const guide = `# TMS API Integration Guide

## Oversikt

Denne guiden viser hvordan du integrerer med TMS API-et i forskjellige programmeringsspråk og rammeverk.

## 🔐 Autentisering

TMS API bruker JWT (JSON Web Tokens) for autentisering.

### Flow:
1. Send POST request til \`/auth/logg-inn\` med epost og passord
2. Motta JWT token i response
3. Inkluder token i \`Authorization: Bearer <token>\` header for alle andre requests

### Token Lifetime:
- Standard: 24 timer
- Refresh: Logg inn på nytt når token utløper

## 📚 SDK Examples

### JavaScript/TypeScript
\`\`\`typescript
class TMSClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001/api/v1') {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string): Promise<boolean> {
    const response = await fetch(\`\${this.baseUrl}/auth/logg-inn\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ epost: email, passord: password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.token = data.token;
      return true;
    }
    return false;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }
    
    return headers;
  }

  async getCompanies(): Promise<any[]> {
    const response = await fetch(\`\${this.baseUrl}/bedrift\`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    return response.json();
  }

  async createContract(contract: {
    elevId: number;
    startDato: string;
    sluttDato: string;
    pris: number;
    beskrivelse?: string;
  }): Promise<any> {
    const response = await fetch(\`\${this.baseUrl}/kontrakter\`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contract),
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    return response.json();
  }
}

// Usage
const client = new TMSClient();
await client.login('admin@example.com', 'password123');
const companies = await client.getCompanies();
\`\`\`

### Python
\`\`\`python
import requests
from typing import Optional, Dict, List
from datetime import datetime

class TMSClient:
    def __init__(self, base_url: str = 'http://localhost:3001/api/v1'):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()
    
    def login(self, email: str, password: str) -> bool:
        response = self.session.post(
            f'{self.base_url}/auth/logg-inn',
            json={'epost': email, 'passord': password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {self.token}'
            })
            return True
        return False
    
    def get_companies(self) -> List[Dict]:
        response = self.session.get(f'{self.base_url}/bedrift')
        response.raise_for_status()
        return response.json()
    
    def create_contract(self, elev_id: int, start_date: str, 
                       end_date: str, price: int, description: str = '') -> Dict:
        contract_data = {
            'elevId': elev_id,
            'startDato': start_date,
            'sluttDato': end_date,
            'pris': price,
            'beskrivelse': description
        }
        
        response = self.session.post(
            f'{self.base_url}/kontrakter',
            json=contract_data
        )
        response.raise_for_status()
        return response.json()

# Usage
client = TMSClient()
client.login('admin@example.com', 'password123')
companies = client.get_companies()
\`\`\`

### C# (.NET)
\`\`\`csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class TMSClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private string _token;

    public TMSClient(string baseUrl = "http://localhost:3001/api/v1")
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
    }

    public async Task<bool> LoginAsync(string email, string password)
    {
        var loginData = new { epost = email, passord = password };
        var json = JsonSerializer.Serialize(loginData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/auth/logg-inn", content);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            _token = result.GetProperty("token").GetString();
            
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _token);
            
            return true;
        }
        return false;
    }

    public async Task<string> GetCompaniesAsync()
    {
        var response = await _httpClient.GetAsync($"{_baseUrl}/bedrift");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}

// Usage
var client = new TMSClient();
await client.LoginAsync("admin@example.com", "password123");
var companies = await client.GetCompaniesAsync();
\`\`\`

### PHP
\`\`\`php
<?php

class TMSClient 
{
    private $baseUrl;
    private $token;
    
    public function __construct($baseUrl = 'http://localhost:3001/api/v1') 
    {
        $this->baseUrl = $baseUrl;
    }
    
    public function login($email, $password) 
    {
        $data = [
            'epost' => $email,
            'passord' => $password
        ];
        
        $response = $this->makeRequest('POST', '/auth/logg-inn', $data);
        
        if ($response && isset($response['token'])) {
            $this->token = $response['token'];
            return true;
        }
        return false;
    }
    
    public function getCompanies() 
    {
        return $this->makeRequest('GET', '/bedrift');
    }
    
    private function makeRequest($method, $endpoint, $data = null) 
    {
        $curl = curl_init();
        
        $headers = ['Content-Type: application/json'];
        if ($this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->baseUrl . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $data ? json_encode($data) : null,
        ]);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        }
        
        return null;
    }
}

// Usage
$client = new TMSClient();
$client->login('admin@example.com', 'password123');
$companies = $client->getCompanies();
?>
\`\`\`

## 🔄 Webhooks (Planlagt)

TMS vil støtte webhooks for real-time notifikasjoner:

\`\`\`json
{
  "event": "contract.created",
  "timestamp": "2023-01-01T10:00:00Z",
  "data": {
    "id": 123,
    "elevId": 456,
    "status": "AKTIV"
  }
}
\`\`\`

## 📊 Batch Operations

For bulk operasjoner, bruk batch endpoints:

\`\`\`typescript
// Bulk create students
const students = [
  { fornavn: 'John', etternavn: 'Doe', epost: 'john@example.com' },
  { fornavn: 'Jane', etternavn: 'Smith', epost: 'jane@example.com' }
];

const response = await fetch(\`\${baseUrl}/elever/bulk\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ students })
});
\`\`\`

## 🔍 Filtering og Pagination

\`\`\`typescript
// Get contracts with filtering
const params = new URLSearchParams({
  page: '1',
  limit: '20',
  sort: 'createdAt:desc',
  search: 'aktiv',
  status: 'AKTIV'
});

const response = await fetch(\`\${baseUrl}/kontrakter?\${params}\`);
\`\`\`

## 🚨 Error Handling

TMS API returnerer konsistente error responses:

\`\`\`json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "epost",
      "message": "E-post er påkrevd"
    }
  ],
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2023-01-01T10:00:00Z"
}
\`\`\`

Handle errors gracefully:

\`\`\`typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error);
    console.error('Request ID:', error.requestId);
    
    if (error.details) {
      error.details.forEach(detail => {
        console.error(\`Field \${detail.field}: \${detail.message}\`);
      });
    }
  }
  
  return await response.json();
} catch (networkError) {
  console.error('Network Error:', networkError);
}
\`\`\`

## 📱 Mobile Integration

### React Native
\`\`\`typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class TMSMobileClient extends TMSClient {
  async saveToken(token: string) {
    await AsyncStorage.setItem('tms_token', token);
  }
  
  async loadToken(): Promise<string | null> {
    return await AsyncStorage.getItem('tms_token');
  }
  
  async autoLogin(): Promise<boolean> {
    const savedToken = await this.loadToken();
    if (savedToken) {
      this.token = savedToken;
      return true;
    }
    return false;
  }
}
\`\`\`

### Flutter/Dart
\`\`\`dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class TMSClient {
  final String baseUrl;
  String? token;
  
  TMSClient({this.baseUrl = 'http://localhost:3001/api/v1'});
  
  Future<bool> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/logg-inn'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'epost': email, 'passord': password}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      token = data['token'];
      
      // Save token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('tms_token', token!);
      
      return true;
    }
    return false;
  }
}
\`\`\`

## 🔧 Development Tips

### 1. Environment Management
\`\`\`typescript
const config = {
  development: 'http://localhost:3001/api/v1',
  staging: 'https://staging-api.tms.example.com/api/v1',
  production: 'https://api.tms.example.com/api/v1'
};

const apiUrl = config[process.env.NODE_ENV || 'development'];
\`\`\`

### 2. Request Logging
\`\`\`typescript
const client = axios.create({
  baseURL: apiUrl,
  timeout: 10000
});

client.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

client.interceptors.response.use(
  response => {
    console.log('Response:', response.status);
    return response;
  },
  error => {
    console.error('Request failed:', error.response?.data);
    return Promise.reject(error);
  }
);
\`\`\`

### 3. Auto Token Refresh
\`\`\`typescript
client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        return client(error.config);
      }
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
\`\`\`

## 📋 Best Practices

1. **Always handle errors gracefully**
2. **Implement retry logic for network failures**
3. **Cache responses when appropriate**
4. **Use environment-specific configurations**
5. **Log API calls for debugging**
6. **Implement proper token storage and security**
7. **Follow rate limiting guidelines**
8. **Use TypeScript for better type safety**

## 🔗 Resources

- **API Documentation**: http://localhost:3001/api/v1/docs
- **OpenAPI Spec**: http://localhost:3001/api/v1/docs/json
- **Postman Collection**: Download from docs
- **GitHub Repository**: [Link to repo]
- **Support**: support@tms.example.com
`;

  return guide;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate all documentation
 */
async function generateAPIDocumentation(): Promise<void> {
  try {
    logger.info('Starting API documentation generation...');

    // Create output directory
    await fs.mkdir(config.outputDir, { recursive: true });

    // Initialize Swagger service and generate spec
    swaggerService.addSchemasFromValidation();
    const swaggerSpec = swaggerService.getSwaggerSpec();

    // Generate OpenAPI spec file
    await fs.writeFile(
      path.join(config.outputDir, 'openapi.json'),
      JSON.stringify(swaggerSpec, null, 2)
    );

    // Generate YAML version
    await fs.writeFile(
      path.join(config.outputDir, 'openapi.yaml'),
      JSON.stringify(swaggerSpec, null, 2) // YAML conversion kan implementeres med js-yaml bibliotek ved behov
    );

    // Generate Postman collection
    if (config.includePostmanCollection) {
      const postmanCollection = await generatePostmanCollection(swaggerSpec);
      await fs.writeFile(
        path.join(config.outputDir, 'TMS-API.postman_collection.json'),
        JSON.stringify(postmanCollection, null, 2)
      );
    }

    // Generate testing guide
    if (config.includeTestingGuides) {
      const testingGuide = await generateTestingGuide(swaggerSpec);
      await fs.writeFile(
        path.join(config.outputDir, 'TESTING_GUIDE.md'),
        testingGuide
      );

      const integrationGuide = await generateIntegrationGuide();
      await fs.writeFile(
        path.join(config.outputDir, 'INTEGRATION_GUIDE.md'),
        integrationGuide
      );
    }

    // Generate API statistics
    const stats = swaggerService.getApiStatistics();
    await fs.writeFile(
      path.join(config.outputDir, 'api-statistics.json'),
      JSON.stringify({
        ...stats,
        generatedAt: new Date().toISOString(),
        environment: config.environment
      }, null, 2)
    );

    // Generate README
    const readme = generateMainREADME(stats);
    await fs.writeFile(
      path.join(config.outputDir, 'README.md'),
      readme
    );

    logger.info('API documentation generated successfully', {
      outputDir: config.outputDir,
      files: [
        'openapi.json',
        'openapi.yaml',
        'TMS-API.postman_collection.json',
        'TESTING_GUIDE.md',
        'INTEGRATION_GUIDE.md',
        'api-statistics.json',
        'README.md'
      ]
    });

    console.log('\n✅ API Documentation Generated Successfully!');
    console.log(`📁 Output directory: ${config.outputDir}`);
    console.log('\n📄 Generated files:');
    console.log('  - openapi.json (OpenAPI 3.0 specification)');
    console.log('  - openapi.yaml (YAML version)');
    console.log('  - TMS-API.postman_collection.json (Postman collection)');
    console.log('  - TESTING_GUIDE.md (Testing documentation)');
    console.log('  - INTEGRATION_GUIDE.md (Integration examples)');
    console.log('  - api-statistics.json (API metrics)');
    console.log('  - README.md (Main documentation)');
    console.log('\n🌐 Access documentation at: http://localhost:3001/api/v1/docs');

  } catch (error) {
    logger.error('Failed to generate API documentation', error);
    throw error;
  }
}

/**
 * Generate main README file
 */
function generateMainREADME(stats: any): string {
  return `# TMS API Documentation

## 📋 Oversikt

TMS (Training Management System) API er en comprehensive REST API for å administrere opplæringsprogrammer, studenter, bedrifter og sikkerhetskontroller.

### 📊 API Statistikk

- **Total endpoints**: ${stats.totalEndpoints}
- **Sikrede endpoints**: ${stats.securityRequiredEndpoints}
- **Kategorier**: ${Object.keys(stats.tagCounts).length}
- **Versjoner**: v1 (current)

### 🔗 Rask Tilgang

- **Swagger UI**: [http://localhost:3001/api/v1/docs](http://localhost:3001/api/v1/docs)
- **OpenAPI Spec**: [openapi.json](./openapi.json)
- **Postman Collection**: [TMS-API.postman_collection.json](./TMS-API.postman_collection.json)

## 📚 Dokumentasjon

### For Utviklere
- [📖 Integration Guide](./INTEGRATION_GUIDE.md) - Hvordan integrere med API-et
- [🧪 Testing Guide](./TESTING_GUIDE.md) - Omfattende testing eksempler
- [📊 API Statistics](./api-statistics.json) - Detaljerte API metrics

### Teknisk Dokumentasjon
- [📄 OpenAPI Specification](./openapi.json) - Maskinlesbar API spec
- [📋 YAML Format](./openapi.yaml) - YAML versjon av API spec

## 🚀 Kom i Gang

### 1. Autentisering
\`\`\`bash
curl -X POST http://localhost:3001/api/v1/auth/logg-inn \\
  -H "Content-Type: application/json" \\
  -d '{"epost": "admin@example.com", "passord": "password123"}'
\`\`\`

### 2. Bruk Token
\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  http://localhost:3001/api/v1/bedrift
\`\`\`

### 3. Utforsk API
Besøk [Swagger UI](http://localhost:3001/api/v1/docs) for interaktiv testing.

## 🏗️ API Arkitektur

### Hovedkategorier
${Object.entries(stats.tagCounts).map(([tag, count]) => 
  `- **${tag}**: ${count} endpoints`
).join('\n')}

### HTTP Metoder
${Object.entries(stats.methodCounts).map(([method, count]) => 
  `- **${method}**: ${count} endpoints`
).join('\n')}

## 🔒 Sikkerhet

- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: 1000 req/15min (general), 5 req/15min (auth)
- **Input Validation**: Comprehensive Zod validation
- **Security Headers**: CSRF, XSS, HSTS protection

## 📞 Support

- **Dokumentasjon**: Swagger UI
- **Issues**: GitHub Issues
- **E-post**: support@tms.example.com

---

**Generert**: ${new Date().toISOString()}  
**Miljø**: ${config.environment}  
**API Versjon**: v1
`;
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'generate':
      case undefined:
        await generateAPIDocumentation();
        break;
        
      default:
        console.log(`
API Documentation Generator

Usage:
  node generate-docs.ts [command]

Commands:
  generate      Generate all API documentation (default)

Examples:
  node generate-docs.ts generate
        `);
        break;
    }

  } catch (error) {
    logger.error('Documentation generation failed', error);
    console.log(`\n❌ Generation failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  generateAPIDocumentation,
  generatePostmanCollection,
  generateTestingGuide,
  generateIntegrationGuide
}; 