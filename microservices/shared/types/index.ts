// User and Authentication Types
export interface User {
  id: string;
  email: string;
  fornavn: string;
  etternavn: string;
  rolle: UserRole;
  bedriftId?: string;
  bedrift?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  HOVEDBRUKER = 'HOVEDBRUKER',
  BRUKER = 'BRUKER',
  ELEV = 'ELEV'
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  bedriftId?: string;
  iat: number;
  exp: number;
}

// Service Types
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

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECATED = 'DEPRECATED'
}

export interface Service {
  id: string;
  navn: string;
  type: ServiceType;
  beskrivelse?: string;
  status: ServiceStatus;
  versjon: string;
  konfiguration?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Company Types
export interface Bedrift {
  id: string;
  navn: string;
  organisasjonsnummer?: string;
  epost?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface BedriftService {
  id: string;
  bedriftId: string;
  serviceId: string;
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  activatedBy?: string;
  deactivatedBy?: string;
  bedrift?: Bedrift;
  service?: Service;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  database?: 'connected' | 'disconnected';
  dependencies?: Record<string, 'healthy' | 'unhealthy'>;
  error?: string;
}

// Quiz Types
export interface Quiz {
  id: string;
  tittel: string;
  beskrivelse?: string;
  kategoriId: string;
  bedriftId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSporsmal {
  id: string;
  quizId: string;
  sporsmal: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'TEXT';
  alternativer?: string[];
  riktigSvar: string;
  poeng: number;
  rekkefølge: number;
}

export interface QuizResultat {
  id: string;
  quizId: string;
  ansattId: string;
  score: number;
  maxScore: number;
  bestått: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// Sikkerhetskontroll Types
export interface Sikkerhetskontroll {
  id: string;
  tittel: string;
  beskrivelse?: string;
  type: 'DAGLIG' | 'UKENTLIG' | 'MÅNEDLIG' | 'ÅRLIG';
  bedriftId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SjekkPunkt {
  id: string;
  sikkerhetskontrollId: string;
  beskrivelse: string;
  type: 'CHECKBOX' | 'TEXT' | 'NUMBER' | 'PHOTO';
  påkrevd: boolean;
  rekkefølge: number;
}

export interface KontrollResultat {
  id: string;
  sikkerhetskontrollId: string;
  ansattId: string;
  status: 'BESTÅTT' | 'IKKE_BESTÅTT' | 'UNDER_ARBEID';
  startedAt: Date;
  completedAt?: Date;
  kommentarer?: string;
}

// Event Types for Inter-Service Communication
export interface ServiceEvent {
  id: string;
  type: string;
  source: string;
  data: Record<string, any>;
  timestamp: Date;
  correlationId?: string;
}

export interface UserCreatedEvent extends ServiceEvent {
  type: 'USER_CREATED';
  data: {
    userId: string;
    email: string;
    bedriftId: string;
    rolle: UserRole;
  };
}

export interface ServiceActivatedEvent extends ServiceEvent {
  type: 'SERVICE_ACTIVATED';
  data: {
    bedriftId: string;
    serviceId: string;
    serviceType: ServiceType;
    activatedBy: string;
  };
}

export interface ServiceDeactivatedEvent extends ServiceEvent {
  type: 'SERVICE_DEACTIVATED';
  data: {
    bedriftId: string;
    serviceId: string;
    serviceType: ServiceType;
    deactivatedBy: string;
  };
}

// Error Types
export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  service: string;
  correlationId?: string;
}

export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  public readonly statusCode = 400;
  
  constructor(message: string, public readonly details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  public readonly code = 'AUTHENTICATION_ERROR';
  public readonly statusCode = 401;
  
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  public readonly code = 'AUTHORIZATION_ERROR';
  public readonly statusCode = 403;
  
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  public readonly code = 'NOT_FOUND_ERROR';
  public readonly statusCode = 404;
  
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ServiceUnavailableError extends Error {
  public readonly code = 'SERVICE_UNAVAILABLE_ERROR';
  public readonly statusCode = 503;
  
  constructor(message: string = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
} 