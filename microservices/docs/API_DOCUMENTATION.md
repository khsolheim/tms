# TMS Microservices API Documentation

## 🌐 API Gateway (Port 8000)

Sentral inngangsport for alle API-kall. Alle requests går gjennom API Gateway som håndterer autentisering, routing og rate limiting.

**Base URL**: `http://localhost:8000` (development) / `https://api.tms.example.com` (production)

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "auth-service": "healthy",
    "user-service": "healthy",
    "quiz-service": "healthy"
  }
}
```

### Service Discovery
```http
GET /services
```

**Response:**
```json
[
  {
    "name": "auth-service",
    "url": "http://auth-service:8001",
    "health": "healthy",
    "lastCheck": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
]
```

---

## 🔐 Auth Service (Port 8001)

Håndterer brukerautentisering og autorisasjon.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fornavn": "John",
    "etternavn": "Doe",
    "rolle": "BRUKER",
    "bedrift": "Example AS"
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "fornavn": "Jane",
  "etternavn": "Smith",
  "bedriftId": "uuid",
  "rolle": "BRUKER"
}
```

### Verify Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fornavn": "John",
    "etternavn": "Doe",
    "rolle": "BRUKER",
    "bedrift": "Example AS"
  }
}
```

---

## 👥 User Service (Port 8002)

Håndterer brukeradministrasjon og profiler.

**Authentication Required**: Alle endepunkter krever `Authorization: Bearer <token>` header.

### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fornavn": "John",
  "etternavn": "Doe",
  "rolle": "BRUKER",
  "telefon": "+47 12345678",
  "adresse": "Testveien 1",
  "postnummer": "0123",
  "poststed": "Oslo",
  "bedrift": {
    "id": "uuid",
    "navn": "Example AS",
    "organisasjonsnummer": "123456789"
  },
  "statistics": {
    "completedQuizzes": 5,
    "completedControls": 3
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fornavn": "John",
  "etternavn": "Doe",
  "telefon": "+47 87654321",
  "adresse": "Ny adresse 2",
  "postnummer": "0456",
  "poststed": "Bergen"
}
```

### Get Company Users (HOVEDBRUKER/ADMIN only)
```http
GET /api/users/company?page=1&limit=20&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Side nummer (default: 1)
- `limit` (optional): Antall per side (default: 20, max: 100)
- `search` (optional): Søk i navn og e-post

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "epost": "user@example.com",
      "fornavn": "John",
      "etternavn": "Doe",
      "rolle": "BRUKER",
      "telefon": "+47 12345678",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "statistics": {
        "completedQuizzes": 5,
        "completedControls": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Get User by ID (HOVEDBRUKER/ADMIN only)
```http
GET /api/users/{userId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fornavn": "John",
  "etternavn": "Doe",
  "rolle": "BRUKER",
  "telefon": "+47 12345678",
  "adresse": "Testveien 1",
  "postnummer": "0123",
  "poststed": "Oslo",
  "bedrift": {
    "id": "uuid",
    "navn": "Example AS"
  },
  "recentQuizzes": [
    {
      "id": "uuid",
      "quiz": "Sikkerhet på arbeidsplassen",
      "score": 8,
      "maxScore": 10,
      "passed": true,
      "completedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "recentControls": [
    {
      "id": "uuid",
      "control": "Daglig sikkerhetskontroll",
      "status": "BESTÅTT",
      "completedAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Update User Status (HOVEDBRUKER/ADMIN only)
```http
PATCH /api/users/{userId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "isActive": false,
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 🧠 Quiz Service (Port 8003)

Håndterer quiz-opprettelse, administrasjon og gjennomføring.

**Authentication Required**: Alle endepunkter krever `Authorization: Bearer <token>` header.

### Get Available Quizzes
```http
GET /api/quiz?page=1&limit=20&kategori=sikkerhet
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Side nummer (default: 1)
- `limit` (optional): Antall per side (default: 20, max: 100)
- `kategori` (optional): Filter på kategori

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tittel": "Sikkerhet på arbeidsplassen",
      "beskrivelse": "Grunnleggende sikkerhet for alle ansatte",
      "kategori": "Sikkerhet",
      "antallSporsmal": 10,
      "estimertTid": 15,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### Get Quiz Details
```http
GET /api/quiz/{quizId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "tittel": "Sikkerhet på arbeidsplassen",
  "beskrivelse": "Grunnleggende sikkerhet for alle ansatte",
  "kategori": "Sikkerhet",
  "sporsmal": [
    {
      "id": "uuid",
      "sporsmal": "Hva er den viktigste regelen for sikkerhet?",
      "type": "MULTIPLE_CHOICE",
      "alternativer": [
        "Bruk alltid verneutstyr",
        "Rapporter farer umiddelbart",
        "Følg alle prosedyrer",
        "Alle de over"
      ],
      "poeng": 1,
      "rekkefølge": 1
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Start Quiz
```http
POST /api/quiz/{quizId}/start
Authorization: Bearer <token>
```

**Response:**
```json
{
  "sessionId": "uuid",
  "quiz": {
    "id": "uuid",
    "tittel": "Sikkerhet på arbeidsplassen",
    "antallSporsmal": 10,
    "estimertTid": 15
  },
  "startedAt": "2024-01-15T10:30:00.000Z"
}
```

### Submit Quiz Answer
```http
POST /api/quiz/sessions/{sessionId}/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "sporsmalId": "uuid",
  "svar": "Alle de over"
}
```

**Response:**
```json
{
  "correct": true,
  "poeng": 1,
  "nextSporsmal": {
    "id": "uuid",
    "sporsmal": "Neste spørsmål...",
    "type": "MULTIPLE_CHOICE",
    "alternativer": ["A", "B", "C", "D"]
  }
}
```

### Complete Quiz
```http
POST /api/quiz/sessions/{sessionId}/complete
Authorization: Bearer <token>
```

**Response:**
```json
{
  "resultat": {
    "id": "uuid",
    "score": 8,
    "maxScore": 10,
    "bestått": true,
    "percentage": 80,
    "completedAt": "2024-01-15T10:45:00.000Z"
  },
  "certificate": {
    "url": "/certificates/uuid.pdf",
    "validUntil": "2025-01-15T10:45:00.000Z"
  }
}
```

### Get Quiz Results
```http
GET /api/quiz/results?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "quiz": {
        "id": "uuid",
        "tittel": "Sikkerhet på arbeidsplassen"
      },
      "score": 8,
      "maxScore": 10,
      "bestått": true,
      "percentage": 80,
      "startedAt": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T10:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## 🔒 Authentication

Alle API-kall (unntatt `/health` og auth-endepunkter) krever autentisering via JWT token.

### Header Format
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "BRUKER",
  "bedriftId": "company-uuid",
  "iat": 1642248000,
  "exp": 1642334400
}
```

### Roles
- `ADMIN`: Full system access
- `HOVEDBRUKER`: Company admin access
- `BRUKER`: Standard user access
- `ELEV`: Limited student access

---

## 📊 Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/profile"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Validation Errors
```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters",
      "code": "PASSWORD_TOO_SHORT"
    }
  ]
}
```

---

## 🚀 Rate Limiting

### Limits per Service
- **API Gateway**: 1000 requests/15min per IP
- **Auth Service**: 100 requests/15min per IP
- **User Service**: 500 requests/15min per IP
- **Quiz Service**: 300 requests/15min per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248900
```

---

## 🔧 Development

### Local URLs
- API Gateway: http://localhost:8000
- Auth Service: http://localhost:8001
- User Service: http://localhost:8002
- Quiz Service: http://localhost:8003

### Health Checks
- API Gateway: http://localhost:8000/health
- Auth Service: http://localhost:8001/health
- User Service: http://localhost:8002/health
- Quiz Service: http://localhost:8003/health

### Postman Collection
Import `docs/postman/TMS-Microservices.json` for complete API testing collection. 