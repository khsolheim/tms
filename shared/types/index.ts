// Brukerroller og tilganger
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BEDRIFT_ADMIN = 'BEDRIFT_ADMIN',
  HOVEDBRUKER = 'HOVEDBRUKER',
  ANSATT = 'ANSATT',
  ELEV = 'ELEV',
  STUDENT = 'STUDENT'
}

// Tjenester som kan aktiveres/deaktiveres
export enum ServiceType {
  HR = 'HR',
  ECONOMY = 'ECONOMY',
  QUIZ = 'QUIZ',
  SIKKERHETSKONTROLL = 'SIKKERHETSKONTROLL',
  FORERKORT = 'FORERKORT',
  KURS = 'KURS',
  RAPPORTER = 'RAPPORTER',
  INTEGRASJONER = 'INTEGRASJONER'
}

// Service status
export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECATED = 'DEPRECATED'
}

// Bruker interface
export interface User {
  id: number;
  fornavn: string;
  etternavn: string;
  epost: string;
  rolle: UserRole;
  bedriftId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Bedrift interface
export interface Bedrift {
  id: number;
  navn: string;
  organisasjonsnummer: string;
  epost?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Service interface
export interface Service {
  id: number;
  navn: string;
  type: ServiceType;
  beskrivelse: string;
  status: ServiceStatus;
  versjon: string;
  createdAt: Date;
  updatedAt: Date;
}

// BedriftService interface (mange-til-mange relasjon)
export interface BedriftService {
  id: number;
  bedriftId: number;
  serviceId: number;
  isActive: boolean;
  activatedAt: Date;
  deactivatedAt?: Date;
  activatedBy: number;
  deactivatedBy?: number;
  bedrift?: Bedrift;
  service?: Service;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Security og audit logging
export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId?: number;
  details?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// System metrics
export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  activeUsers: number;
  activeBedrifter: number;
  totalRequests: number;
  errorRate: number;
  responseTime: number;
  timestamp: Date;
} 