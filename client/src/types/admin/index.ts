// Admin Portal Type Definitions

export interface ActivityItem {
  id: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'system' | 'error' | 'warning' | 'info';
  user: string;
  action: string;
  details?: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success' | 'security' | 'system' | 'performance' | 'business';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    maxConnections: number;
    responseTime: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'error';
    port?: number;
    uptime: number;
    lastCheck?: string;
  }>;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
}

export interface Stats {
  activeBedrifter: number;
  totalBedrifter: number;
  totalBrukere: number;
  activeServices: number;
  totalServices: number;
  systemUptime: number;
}

export interface Bedrift {
  id: string;
  navn: string;
  organisasjonsnummer: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  hovedbruker?: {
    navn: string;
    epost: string;
  };
  antallAnsatte: number;
  antallElever: number;
  ansatte: number;
  elever: number;
  aktiveTjenester: number;
  opprettet: string;
  sistAktiv?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
}

export interface Bruker {
  id: string;
  fornavn: string;
  etternavn: string;
  navn?: string;
  epost: string;
  rolle: 'SUPER_ADMIN' | 'ADMIN' | 'BRUKER' | 'ELEV';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';
  bedrift?: {
    navn: string;
    id: string;
  };
  telefon?: string;
  sistInnlogget?: string;
  opprettet: string;
  tofaAktivert: boolean;
}

export interface Service {
  id: string;
  navn: string;
  type: 'microservice' | 'api' | 'database' | 'cache';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  versjon: string;
  port: number;
  aktiveBedrifter: number;
  totalBrukere: number;
  sistOppdatert: string;
  beskrivelse: string;
  url?: string;
}

export interface ServiceMetrics {
  requestCount: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface AccessControl {
  id: string;
  userId: string;
  navn: string;
  userName?: string;
  epost: string;
  email?: string;
  rolle: string;
  status: 'active' | 'locked' | 'pending';
  failedLoginAttempts: number;
  lastLogin?: string;
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent?: string;
  resource?: string;
  action: string;
  timestamp: string;
  details?: any;
}

export interface ThreatAlert {
  id: string;
  type: 'BRUTE_FORCE' | 'SUSPICIOUS_ACTIVITY' | 'MALWARE' | 'PRIVILEGE_ESCALATION' | 'brute_force' | 'sql_injection' | 'xss' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'investigating' | 'blocked' | 'mitigated';
  title: string;
  description: string;
  source: string;
  sourceIp?: string;
  targetResource?: string;
  affectedResource?: string;
  affectedUsers?: string[];
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  actions?: string[];
  mitigationActions?: string[];
  riskScore?: number;
  details?: any;
}

export interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'xss' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'mitigated' | 'investigating';
  description: string;
  sourceIp: string;
  targetResource: string;
  timestamp: string;
  actions: string[];
  details?: any;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
    preventReuse?: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
    maxDuration?: number;
    idleTimeout?: number;
  };
  accessControl?: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
    geoBlocking: boolean;
    allowedCountries: string[];
  };
  ipSecurity: {
    whitelist: string[];
    blacklist: string[];
    enabled: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMinutes: number;
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: string[];
    enforced?: boolean;
    allowedMethods?: string[];
    backupCodes?: boolean;
  };
  auditLogging: {
    enabled: boolean;
    retention: number;
    logFailedAttempts: boolean;
  };
  auditSettings?: {
    logLevel: string;
    retentionDays: number;
    realTimeAlerts: boolean;
    exportEnabled: boolean;
  };
}

export interface Middleware {
  id: string;
  name: string;
  type: 'security' | 'logging' | 'rate-limiting' | 'cors' | 'auth' | 'compression';
  status: 'active' | 'disabled' | 'error';
  order: number;
  description: string;
  config: {
    enabled: boolean;
    [key: string]: any;
  };
  metrics: {
    requestCount: number;
    responseTime: number;
    errorCount: number;
    lastUsed: string;
  };
}

export interface SystemConfiguration {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'system' | 'security' | 'email' | 'backup' | 'performance';
  lastModified: string;
  modifiedBy: string;
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'failed' | 'in_progress';
  created: string;
  duration: number;
  location: string;
}

export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  source: string;
  category: string;
  metadata?: any;
}

// Pagination interfaces
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
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
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// API Response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Hook interfaces
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UsePaginatedApiResult<T> {
  data: PaginatedResponse<T> | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  execute: () => Promise<void>;
}

// Additional types for components
export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: (row: T) => boolean;
  show?: (row: T) => boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<any>;
  className?: string;
}

// Export all types from admin.ts that are not conflicting
export type { 
  AdminUser,
  BedriftService,
  DashboardStats,
  SystemStats,
  SystemMetrics,
  Notification,
  Permission,
  Role,
  QuickAction
} from './admin'; 