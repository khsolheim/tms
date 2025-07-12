# Advertiser and Sponsor Implementation

## Overview
This document outlines the complete implementation of the advertiser and sponsor system for the TMS (Traffic Management System). The system allows administrators to manage advertisers and sponsors, which can be connected to companies and displayed on a student benefits page called "Fordeler".

## Database Schema Changes

### New Models Added to `server/prisma/schema.prisma`

```prisma
model Annonsor {
  id                Int        @id @default(autoincrement())
  navn              String
  beskrivelse       String?
  logoUrl           String?
  hjemmeside        String?
  telefon           String?
  epost             String?
  bedriftId         Int?       // Optional connection to existing company
  kategori          String     @default("GENERELT") // "RABATT", "TJENESTER", "PRODUKTER", "UTDANNING", etc.
  tags              String[]   @default([])
  aktiv             Boolean    @default(true)
  prioritet         Int        @default(1) // For sorting/display order
  visninger         Int        @default(0) // Track views
  klikk             Int        @default(0) // Track clicks
  opprettet         DateTime   @default(now())
  oppdatert         DateTime   @default(now()) @updatedAt
  deletedAt         DateTime?
  deletedBy         Int?
  isDeleted         Boolean    @default(false)
  
  bedrift           Bedrift?   @relation("AnnonsorBedrift", fields: [bedriftId], references: [id], onDelete: SetNull)
  deletedByUser     Ansatt?    @relation("AnnonsorDeletedBy", fields: [deletedBy], references: [id])
  fordeler          AnnonsorFordel[]
  
  @@index([aktiv])
  @@index([kategori])
  @@index([prioritet])
  @@index([opprettet])
  @@index([isDeleted])
  @@index([bedriftId])
  @@index([navn])
}

model Sponsor {
  id                Int        @id @default(autoincrement())
  navn              String
  beskrivelse       String?
  logoUrl           String?
  hjemmeside        String?
  telefon           String?
  epost             String?
  bedriftId         Int?       // Optional connection to existing company
  type              String     @default("GENERELL") // "HOVEDSPONSOR", "GULLSPONSOR", "SØLVSPONSOR", "BRONSESPONSOR", etc.
  kategori          String     @default("GENERELT") // "TEKNOLOGI", "TRANSPORT", "UTDANNING", etc.
  sponsorbelop      Int?       // Amount sponsored in øre
  kontraktStartDato DateTime?
  kontraktSluttDato DateTime?
  aktiv             Boolean    @default(true)
  prioritet         Int        @default(1) // For sorting/display order
  visninger         Int        @default(0) // Track views
  klikk             Int        @default(0) // Track clicks
  opprettet         DateTime   @default(now())
  oppdatert         DateTime   @default(now()) @updatedAt
  deletedAt         DateTime?
  deletedBy         Int?
  isDeleted         Boolean    @default(false)
  
  bedrift           Bedrift?   @relation("SponsorBedrift", fields: [bedriftId], references: [id], onDelete: SetNull)
  deletedByUser     Ansatt?    @relation("SponsorDeletedBy", fields: [deletedBy], references: [id])
  fordeler          SponsorFordel[]
  
  @@index([aktiv])
  @@index([type])
  @@index([kategori])
  @@index([prioritet])
  @@index([opprettet])
  @@index([isDeleted])
  @@index([bedriftId])
  @@index([navn])
  @@index([kontraktStartDato])
  @@index([kontraktSluttDato])
}

model AnnonsorFordel {
  id                Int        @id @default(autoincrement())
  annonsorId        Int
  tittel            String
  beskrivelse       String
  rabattKode        String?
  rabattProsent     Int?       // Percentage discount
  rabattBelop       Int?       // Fixed discount amount in øre
  gyldigFra         DateTime?
  gyldigTil         DateTime?
  maksAntallBruk    Int?       // Max number of uses
  antallBrukt       Int        @default(0) // Current usage count
  aktiv             Boolean    @default(true)
  vilkar            String?    // Terms and conditions
  bildeUrl          String?
  linkUrl           String?    // Link to the offer
  opprettet         DateTime   @default(now())
  oppdatert         DateTime   @default(now()) @updatedAt
  
  annonsor          Annonsor   @relation(fields: [annonsorId], references: [id], onDelete: Cascade)
  
  @@index([annonsorId])
  @@index([aktiv])
  @@index([gyldigFra])
  @@index([gyldigTil])
  @@index([opprettet])
}

model SponsorFordel {
  id                Int        @id @default(autoincrement())
  sponsorId         Int
  tittel            String
  beskrivelse       String
  rabattKode        String?
  rabattProsent     Int?       // Percentage discount
  rabattBelop       Int?       // Fixed discount amount in øre
  gyldigFra         DateTime?
  gyldigTil         DateTime?
  maksAntallBruk    Int?       // Max number of uses
  antallBrukt       Int        @default(0) // Current usage count
  aktiv             Boolean    @default(true)
  vilkar            String?    // Terms and conditions
  bildeUrl          String?
  linkUrl           String?    // Link to the offer
  opprettet         DateTime   @default(now())
  oppdatert         DateTime   @default(now()) @updatedAt
  
  sponsor           Sponsor    @relation(fields: [sponsorId], references: [id], onDelete: Cascade)
  
  @@index([sponsorId])
  @@index([aktiv])
  @@index([gyldigFra])
  @@index([gyldigTil])
  @@index([opprettet])
}
```

### Updated Relations

Added to `Bedrift` model:
```prisma
// Advertiser and sponsor relations
annonsorer           Annonsor[]       @relation("AnnonsorBedrift")
sponsorer            Sponsor[]        @relation("SponsorBedrift")
```

Added to `Ansatt` model:
```prisma
// Advertiser and sponsor delete relations
deletedAnnonsorer                Annonsor[]           @relation("AnnonsorDeletedBy")
deletedSponsorer                 Sponsor[]            @relation("SponsorDeletedBy")
```

## Backend API Routes

### 1. Advertiser Routes (`server/src/routes/annonsorer.routes.ts`)

#### Endpoints:
- `GET /annonsorer` - Get all advertisers with filtering and pagination
- `GET /annonsorer/:id` - Get specific advertiser with details
- `POST /annonsorer` - Create new advertiser
- `PUT /annonsorer/:id` - Update advertiser
- `DELETE /annonsorer/:id` - Soft delete advertiser
- `GET /annonsorer/:id/fordeler` - Get benefits for specific advertiser
- `POST /annonsorer/:id/fordeler` - Create new benefit for advertiser
- `POST /annonsorer/:id/click` - Track click statistics

#### Features:
- Full CRUD operations
- Soft delete functionality
- Search and filtering
- Pagination support
- Click tracking
- Connection to existing companies
- Comprehensive logging

### 2. Sponsor Routes (`server/src/routes/sponsorer.routes.ts`)

#### Endpoints:
- `GET /sponsorer` - Get all sponsors with filtering and pagination
- `GET /sponsorer/:id` - Get specific sponsor with details
- `POST /sponsorer` - Create new sponsor
- `PUT /sponsorer/:id` - Update sponsor
- `DELETE /sponsorer/:id` - Soft delete sponsor
- `GET /sponsorer/:id/fordeler` - Get benefits for specific sponsor
- `POST /sponsorer/:id/fordeler` - Create new benefit for sponsor
- `POST /sponsorer/:id/click` - Track click statistics

#### Features:
- Full CRUD operations
- Soft delete functionality
- Search and filtering
- Pagination support
- Click tracking
- Contract management (start/end dates, amounts)
- Sponsor type classification
- Connection to existing companies

### 3. Student Benefits Routes (`server/src/routes/fordeler.routes.ts`)

#### Endpoints:
- `GET /fordeler` - Get all active benefits for students
- `GET /fordeler/kategorier` - Get available categories
- `GET /fordeler/fordel/:type/:id` - Get specific benefit details
- `POST /fordeler/klikk/:type/:id` - Track benefit click

#### Features:
- Combined view of advertiser and sponsor benefits
- Category filtering
- Search functionality
- Only shows active and valid benefits
- Click tracking for analytics
- Pagination support

## Frontend Components

### 1. Student Benefits Page (`client/src/pages/Fordeler.tsx`)

#### Features:
- **Modern UI Design**: Clean, responsive design with Tailwind CSS
- **Search and Filtering**: 
  - Text search across names and descriptions
  - Filter by category
  - Filter by type (advertiser/sponsor)
  - Advanced filter panel
- **Benefit Cards**: 
  - Logo display with fallback
  - Benefit type badges
  - Category tags
  - Multiple benefits per card
  - Expiration dates
  - Usage limits
  - Click tracking
- **Interactive Elements**:
  - Clickable benefit cards
  - External link handling
  - Click tracking
  - Pagination
- **Loading States**: 
  - Skeleton loading
  - Error handling
  - Empty states

#### Key Components:
- Responsive grid layout
- Search bar with filters
- Benefit cards with detailed information
- Pagination controls
- Category and type filters
- Click tracking functionality

### 2. Admin Management Pages (To be implemented)

#### Advertiser Management:
- List view with search and filtering
- Create/Edit forms
- Benefit management
- Statistics dashboard
- Connection to companies

#### Sponsor Management:
- List view with search and filtering
- Create/Edit forms with contract details
- Benefit management
- Statistics dashboard
- Connection to companies

## Key Features

### 1. Company Integration
- Advertisers and sponsors can be linked to existing companies
- Leverages existing company data (name, org number, contact info)
- Optional relationship - can exist independently

### 2. Benefit Management
- Each advertiser/sponsor can have multiple benefits
- Benefits have:
  - Title and description
  - Discount codes
  - Percentage or fixed amount discounts
  - Validity periods
  - Usage limits
  - Terms and conditions
  - Images and links

### 3. Analytics and Tracking
- View counting for performance metrics
- Click tracking for engagement
- Usage statistics for benefits
- Comprehensive logging

### 4. Content Management
- Categories for organization
- Tags for flexible classification
- Priority ordering
- Active/inactive status
- Soft delete functionality

### 5. Student Experience
- Combined view of all benefits
- Easy search and filtering
- Visual indicators for validity
- Direct links to offers
- Mobile-responsive design

## Database Migration

To apply the schema changes:

```bash
cd server
npx prisma migrate dev --name add_advertiser_sponsor_models
npx prisma generate
```

## Route Registration

Add to your main routes file (e.g., `server/src/index.ts`):

```typescript
import annonsorerRoutes from './routes/annonsorer.routes';
import sponsorerRoutes from './routes/sponsorer.routes';
import fordelerRoutes from './routes/fordeler.routes';

app.use('/api/annonsorer', annonsorerRoutes);
app.use('/api/sponsorer', sponsorerRoutes);
app.use('/api/fordeler', fordelerRoutes);
```

## Frontend Route Configuration

Add to your React Router configuration:

```typescript
import Fordeler from './pages/Fordeler';

// In your route configuration
<Route path="/fordeler" element={<Fordeler />} />
```

## API Configuration

Create or update `client/src/config/api.ts`:

```typescript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## Usage Examples

### Creating an Advertiser
```typescript
POST /api/annonsorer
{
  "navn": "TechStore AS",
  "beskrivelse": "Norges største teknologibutikk",
  "logoUrl": "https://example.com/logo.png",
  "hjemmeside": "https://techstore.no",
  "telefon": "+47 12345678",
  "epost": "kontakt@techstore.no",
  "bedriftId": 123,
  "kategori": "TEKNOLOGI",
  "tags": ["elektronikk", "datautstyr"],
  "aktiv": true,
  "prioritet": 5
}
```

### Creating a Benefit
```typescript
POST /api/annonsorer/1/fordeler
{
  "tittel": "15% rabatt på alle laptoper",
  "beskrivelse": "Få 15% rabatt på alle bærbare datamaskiner",
  "rabattKode": "STUDENT15",
  "rabattProsent": 15,
  "gyldigFra": "2024-01-01T00:00:00Z",
  "gyldigTil": "2024-12-31T23:59:59Z",
  "maksAntallBruk": 100,
  "vilkar": "Gjelder kun for studenter med gyldig studentbevis",
  "linkUrl": "https://techstore.no/student-rabatt",
  "aktiv": true
}
```

### Fetching Benefits for Students
```typescript
GET /api/fordeler?kategori=TEKNOLOGI&type=annonsor&limit=12&offset=0
```

## Security Considerations

1. **Authentication**: Admin routes require authentication
2. **Authorization**: Only authorized users can manage advertisers/sponsors
3. **Data Validation**: All inputs are validated server-side
4. **Soft Deletes**: Data is preserved for audit trails
5. **Logging**: All actions are logged for monitoring

## Future Enhancements

1. **Email Notifications**: Notify when benefits expire
2. **Advanced Analytics**: Detailed usage reports
3. **Bulk Operations**: Import/export functionality
4. **API Rate Limiting**: Prevent abuse
5. **Caching**: Improve performance for frequently accessed data
6. **Image Upload**: Built-in image management
7. **Approval Workflow**: Review process for new benefits
8. **Student Favorites**: Allow students to save preferred benefits

## Notes

- All monetary values are stored in øre (smallest currency unit)
- Dates are stored in ISO format
- The system follows the existing codebase patterns and conventions
- Error handling follows the established patterns
- Logging uses the existing logger utility
- The implementation is fully integrated with the existing user and company management systems

This implementation provides a comprehensive solution for managing advertisers and sponsors while offering students an excellent user experience for discovering and using benefits.