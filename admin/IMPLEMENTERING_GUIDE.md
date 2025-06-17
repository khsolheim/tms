# TMS Implementeringsguide - Bruker/Admin Separasjon

## 🚀 Hurtigstart Guide

Denne guiden gir deg konkrete steg for å implementere den nye arkitekturen.

---

## 📋 Steg 1: Mappestruktur og Oppsett

### 1.1 Opprett Mappestruktur
```bash
# Fra TMS root directory
mkdir -p admin/src/{components,pages,hooks,utils,types}
mkdir -p admin/src/components/{common,dashboard,security,services,monitoring}
mkdir -p admin/src/pages/{Security,Services,Bedrifter,Brukere,System}
mkdir -p admin/public
mkdir -p shared/{components,styles,types,utils}
mkdir -p shared/components/{ui,layout,forms}
mkdir -p shared/styles/themes
mkdir -p server/src/routes/admin
mkdir -p server/src/middleware
```

### 1.2 Admin Package.json
```json
{
  "name": "tms-admin",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.18.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.0",
    "tailwindcss": "^3.2.0",
    "react-icons": "^4.7.0",
    "recharts": "^2.5.0",
    "date-fns": "^2.29.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:4000",
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

---

## 🔐 Steg 2: Backend Utvidelser

### 2.1 Database Schema Utvidelser
```sql
-- Legg til i Prisma schema
model Service {
  id              String            @id
  name            String
  description     String?
  type            ServiceType
  isActive        Boolean           @default(true)
  requiredRole    AnsattRolle?
  pricingMonthly  Decimal?
  pricingYearly   Decimal?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  bedriftServices BedriftService[]

  @@map("Service")
}

model BedriftService {
  id           Int      @id @default(autoincrement())
  bedriftId    Int
  serviceId    String
  isActive     Boolean  @default(true)
  activatedAt  DateTime @default(now())
  activatedBy  Int
  settings     Json     @default("{}")
  usageData    Json     @default("{}")

  bedrift      Bedrift  @relation(fields: [bedriftId], references: [id])
  service      Service  @relation(fields: [serviceId], references: [id])
  activator    Ansatt   @relation(fields: [activatedBy], references: [id])

  @@unique([bedriftId, serviceId])
  @@map("BedriftService")
}

model SecurityLog {
  id         Int      @id @default(autoincrement())
  userId     Int?
  action     String
  resource   String?
  ipAddress  String?
  userAgent  String?
  success    Boolean
  details    Json?
  createdAt  DateTime @default(now())

  user       Ansatt?  @relation(fields: [userId], references: [id])

  @@map("SecurityLog")
}

enum ServiceType {
  HR
  ECONOMY
  QUIZ
  SIKKERHETSKONTROLL
  FORERKORT
  KURS
  RAPPORTER
  INTEGRASJONER
}
```

### 2.2 Service Check Middleware
```typescript
// server/src/middleware/serviceCheck.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ServiceType } from '@prisma/client';

export interface AuthRequest extends Request {
  bruker?: {
    id: number;
    bedriftId: number;
    rolle: string;
  };
}

export const serviceCheckMiddleware = (requiredService: ServiceType) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.bruker) {
        return res.status(401).json({ error: 'Ikke autentisert' });
      }

      const bedriftService = await prisma.bedriftService.findFirst({
        where: {
          bedriftId: req.bruker.bedriftId,
          serviceId: requiredService,
          isActive: true
        }
      });

      if (!bedriftService) {
        return res.status(403).json({
          error: 'SERVICE_NOT_ACTIVATED',
          message: `Tjenesten ${requiredService} er ikke aktivert for din bedrift`,
          requiredService
        });
      }

      next();
    } catch (error) {
      console.error('Service check error:', error);
      res.status(500).json({ error: 'Intern serverfeil' });
    }
  };
};

export const adminOnlyMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.bruker || !['ADMIN', 'SUPER_ADMIN'].includes(req.bruker.rolle)) {
    return res.status(403).json({ error: 'Admin tilgang kreves' });
  }
  next();
};
```

### 2.3 Admin API Routes
```typescript
// server/src/routes/admin/services.routes.ts
import { Router } from 'express';
import { prisma } from '../../config/database';
import { verifyToken } from '../../middleware/auth';
import { adminOnlyMiddleware, AuthRequest } from '../../middleware/serviceCheck';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Hent alle tilgjengelige tjenester
router.get('/services', 
  verifyToken,
  adminOnlyMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { bedriftServices: true }
        }
      }
    });
    res.json(services);
  })
);

// Hent bedriftens aktiverte tjenester
router.get('/bedrift/:bedriftId/services',
  verifyToken,
  adminOnlyMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const bedriftId = parseInt(req.params.bedriftId);
    
    const bedriftServices = await prisma.bedriftService.findMany({
      where: { bedriftId },
      include: {
        service: true,
        activator: {
          select: { fornavn: true, etternavn: true }
        }
      }
    });
    
    res.json(bedriftServices);
  })
);

// Aktiver tjeneste for bedrift
router.post('/bedrift/:bedriftId/services',
  verifyToken,
  adminOnlyMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const bedriftId = parseInt(req.params.bedriftId);
    const { serviceId, settings = {} } = req.body;
    
    const bedriftService = await prisma.bedriftService.create({
      data: {
        bedriftId,
        serviceId,
        activatedBy: req.bruker!.id,
        settings,
        isActive: true
      },
      include: {
        service: true
      }
    });
    
    res.json(bedriftService);
  })
);

// Deaktiver tjeneste
router.delete('/bedrift/:bedriftId/services/:serviceId',
  verifyToken,
  adminOnlyMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const bedriftId = parseInt(req.params.bedriftId);
    const { serviceId } = req.params;
    
    await prisma.bedriftService.updateMany({
      where: {
        bedriftId,
        serviceId
      },
      data: {
        isActive: false
      }
    });
    
    res.json({ success: true });
  })
);

export default router;
```

---

## 🎨 Steg 3: Shared Components

### 3.1 Basis UI Komponenter
```typescript
// shared/components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
    >
      {children}
    </button>
  );
};
```

### 3.2 Layout Komponenter
```typescript
// shared/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title }) => {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      
      <nav className="mt-6">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
```

---

## 🔧 Steg 4: Admin Interface

### 4.1 Admin Dashboard
```typescript
// admin/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaServer, FaShieldAlt, FaCog } from 'react-icons/fa';

interface SystemStats {
  totalUsers: number;
  activeServices: number;
  securityAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Feil ved henting av dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Laster...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Totale Brukere"
          value={stats?.totalUsers || 0}
          icon={<FaUsers className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Aktive Tjenester"
          value={stats?.activeServices || 0}
          icon={<FaServer className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Sikkerhetsvarsler"
          value={stats?.securityAlerts || 0}
          icon={<FaShieldAlt className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="System Helse"
          value={stats?.systemHealth || 'unknown'}
          icon={<FaCog className="w-6 h-6" />}
          color="yellow"
        />
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Siste Aktivitet</h2>
        {/* Activity list component */}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

### 4.2 Tjenestestyring Interface
```typescript
// admin/src/pages/Services/ServiceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/ui/Button';

interface Service {
  id: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  pricingMonthly: number;
  pricingYearly: number;
}

interface BedriftService {
  id: number;
  bedriftId: number;
  serviceId: string;
  isActive: boolean;
  activatedAt: string;
  service: Service;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [bedriftServices, setBedriftServices] = useState<BedriftService[]>([]);
  const [selectedBedrift, setSelectedBedrift] = useState<number | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedBedrift) {
      fetchBedriftServices(selectedBedrift);
    }
  }, [selectedBedrift]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Feil ved henting av tjenester:', error);
    }
  };

  const fetchBedriftServices = async (bedriftId: number) => {
    try {
      const response = await fetch(`/api/admin/bedrift/${bedriftId}/services`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBedriftServices(data);
    } catch (error) {
      console.error('Feil ved henting av bedrift tjenester:', error);
    }
  };

  const activateService = async (serviceId: string) => {
    if (!selectedBedrift) return;

    try {
      await fetch(`/api/admin/bedrift/${selectedBedrift}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ serviceId })
      });
      
      fetchBedriftServices(selectedBedrift);
    } catch (error) {
      console.error('Feil ved aktivering av tjeneste:', error);
    }
  };

  const deactivateService = async (serviceId: string) => {
    if (!selectedBedrift) return;

    try {
      await fetch(`/api/admin/bedrift/${selectedBedrift}/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      fetchBedriftServices(selectedBedrift);
    } catch (error) {
      console.error('Feil ved deaktivering av tjeneste:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tjenestestyring</h1>
      
      {/* Bedrift Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Velg Bedrift
        </label>
        <select
          value={selectedBedrift || ''}
          onChange={(e) => setSelectedBedrift(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Velg bedrift...</option>
          {/* Populate with bedrifter */}
        </select>
      </div>

      {selectedBedrift && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Services */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tilgjengelige Tjenester</h2>
            <div className="space-y-4">
              {services.map((service) => {
                const isActivated = bedriftServices.some(
                  bs => bs.serviceId === service.id && bs.isActive
                );
                
                return (
                  <div key={service.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {service.pricingMonthly} kr/mnd
                      </span>
                      <Button
                        variant={isActivated ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => isActivated 
                          ? deactivateService(service.id)
                          : activateService(service.id)
                        }
                      >
                        {isActivated ? 'Deaktiver' : 'Aktiver'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Services */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Aktive Tjenester</h2>
            <div className="space-y-4">
              {bedriftServices
                .filter(bs => bs.isActive)
                .map((bedriftService) => (
                  <div key={bedriftService.id} className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold">{bedriftService.service.name}</h3>
                    <p className="text-sm text-gray-600">
                      Aktivert: {new Date(bedriftService.activatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
```

---

## 🔄 Steg 5: Brukerside Refaktorering

### 5.1 Dynamisk Navigasjon
```typescript
// client/src/hooks/useActiveServices.ts
import { useState, useEffect } from 'react';

interface ActiveService {
  id: string;
  name: string;
  type: string;
  settings: Record<string, any>;
}

export const useActiveServices = () => {
  const [activeServices, setActiveServices] = useState<ActiveService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveServices();
  }, []);

  const fetchActiveServices = async () => {
    try {
      const response = await fetch('/api/user/active-services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setActiveServices(data);
    } catch (error) {
      console.error('Feil ved henting av aktive tjenester:', error);
    } finally {
      setLoading(false);
    }
  };

  return { activeServices, loading, refetch: fetchActiveServices };
};
```

### 5.2 Service Guard Component
```typescript
// client/src/components/ServiceGuard.tsx
import React from 'react';
import { useActiveServices } from '../hooks/useActiveServices';

interface ServiceGuardProps {
  requiredService: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ServiceGuard: React.FC<ServiceGuardProps> = ({
  requiredService,
  children,
  fallback
}) => {
  const { activeServices, loading } = useActiveServices();

  if (loading) {
    return <div>Laster...</div>;
  }

  const hasService = activeServices.some(service => service.type === requiredService);

  if (!hasService) {
    return fallback || (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tjeneste ikke tilgjengelig
        </h2>
        <p className="text-gray-600">
          Tjenesten {requiredService} er ikke aktivert for din bedrift.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## 🚀 Steg 6: Deployment og Testing

### 6.1 Build Scripts
```json
// package.json (root)
{
  "scripts": {
    "dev:client": "cd client && npm start",
    "dev:admin": "cd admin && npm start",
    "dev:server": "cd server && npm run dev",
    "build:client": "cd client && npm run build",
    "build:admin": "cd admin && npm run build",
    "build:all": "npm run build:client && npm run build:admin",
    "start:all": "concurrently \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:admin\""
  }
}
```

### 6.2 Environment Variables
```bash
# .env
# Database
DATABASE_URL="postgresql://tms_user:password@localhost:5432/tms_db"

# JWT
JWT_SECRET="your-secret-key"

# Admin
ADMIN_PORT=3001
CLIENT_PORT=3000
SERVER_PORT=4000

# Security
SECURITY_ENABLED=true
RATE_LIMIT_ENABLED=true
```

---

## ✅ Sjekkliste for Implementering

### Backend
- [ ] Opprett Service og BedriftService modeller
- [ ] Implementer serviceCheckMiddleware
- [ ] Legg til admin API routes
- [ ] Database migrasjoner
- [ ] Sikkerhetslogs implementering

### Admin Interface
- [ ] Sett opp admin React app
- [ ] Dashboard komponenter
- [ ] Tjenestestyring interface
- [ ] Sikkerhetspanel
- [ ] System monitoring

### Brukerside
- [ ] Refaktorer eksisterende komponenter
- [ ] Implementer ServiceGuard
- [ ] Dynamisk navigasjon
- [ ] Service-basert routing

### Testing
- [ ] Unit tests for middleware
- [ ] Integration tests for API
- [ ] E2E tests for admin interface
- [ ] Performance testing

Denne guiden gir deg alt du trenger for å implementere den nye arkitekturen steg for steg! 