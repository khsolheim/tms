// Base types
export interface AdminUser {
  id: number;
  fornavn: string;
  etternavn: string;
  epost: string;
  rolle: 'ADMIN' | 'SUPER_ADMIN';
  tilganger: string[];
  bedriftId?: number;
  bedrift?: {
    id: number;
    navn: string;
  };
  sistInnlogget?: string;
  opprettet: string;
  isActive: boolean;
}

export interface Bruker {
  id: number;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon?: string;
  rolle: 'SUPER_ADMIN' | 'ADMIN' | 'HOVEDBRUKER' | 'ANSATT' | 'ELEV';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING';
  bedriftId?: number;
  bedrift?: {
    id: number;
    navn: string;
    organisasjonsnummer: string;
  };
  tofaAktivert: boolean;
  sistInnlogget?: string;
  opprettet: string;
  sistOppdatert: string;
  tilganger?: string[];
  metadata?: Record<string, any>;
}

export interface Bedrift {
  id: number;
  navn: string;
  organisasjonsnummer: string;
  epost?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  hovedbruker?: {
    id: number;
    fornavn: string;
    etternavn: string;
    epost: string;
  };
  ansatte: number;
  elever: number;
  aktiveTjenester: number;
  opprettet: string;
  sistAktiv?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface Service {
  id: number;
  navn: string;
  type: string;
  beskrivelse: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  versjon: string;
  aktiveBedrifter: number;
  totalBrukere: number;
  opprettet: string;
  sistOppdatert: string;
  konfigurasjon?: Record<string, any>;
  avhengigheter?: string[];
}

export interface BedriftService {
  id: number;
  bedriftId: number;
  serviceId: number;
  service: Service;
  isActive: boolean;
  aktivertAv: number;
  aktivertDato: string;
  innstillinger: Record<string, any>;
  bruksdata: {
    sistBrukt?: string;
    antallBrukere: number;
    antallTransaksjoner: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalBedrifter: number;
  aktiveBedrifter: number;
  totalBrukere: number;
  activeServices: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
}

export interface SystemStats {
  activeBedrifter: number;
  totalBedrifter: number;
  totalBrukere: number;
  activeServices: number;
}

export interface ActivityItem {
  id: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'error' | 'warning' | 'info';
  user: string;
  action: string;
  details?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    responseTime: number;
    queries: number;
  };
}

// Security types
export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_change' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ipAddress: string;
  userAgent: string;
  description: string;
  timestamp: string;
  success: boolean;
  details: Record<string, any>;
}

export interface ThreatAlert {
  id: string;
  type: 'brute_force' | 'suspicious_activity' | 'malware' | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  timestamp: string;
  status: 'active' | 'mitigated' | 'false_positive';
  actions: string[];
  affectedUsers?: number[];
  affectedSystems?: string[];
}

export interface SecurityThreat {
  id: string;
  timestamp: string;
  type: 'brute_force' | 'suspicious_activity' | 'malware' | 'ddos' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  status: 'active' | 'mitigated' | 'false_positive';
  actions: string[];
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
    preventReuse: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
    rememberMe: boolean;
  };
  ipSecurity: {
    enableWhitelist: boolean;
    enableBlacklist: boolean;
    autoBlockSuspicious: boolean;
    blockDuration: number;
    maxFailedAttempts: number;
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
    windowSize: number;
  };
  twoFactorAuth: {
    required: boolean;
    methods: ('sms' | 'email' | 'app')[];
    backupCodes: boolean;
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
}

// System types
export interface SystemConfiguration {
  application: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  database: {
    host: string;
    port: number;
    name: string;
    maxConnections: number;
    connectionTimeout: number;
    queryTimeout: number;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    host?: string;
    port?: number;
    username?: string;
    fromAddress: string;
    fromName: string;
    templates: Record<string, string>;
  };
  storage: {
    provider: 'local' | 's3' | 'azure' | 'gcp';
    maxFileSize: number;
    allowedTypes: string[];
    storageQuota: number;
  };
  integrations: {
    bronnøysund: {
      enabled: boolean;
      apiKey?: string;
      endpoint: string;
    };
    sms: {
      enabled: boolean;
      provider: 'twilio' | 'nexmo' | 'local';
      apiKey?: string;
    };
  };
}

export interface BackupInfo {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  size: number;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress';
  duration: number;
  location: string;
  checksum: string;
  description?: string;
}

export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  source: string;
  userId?: number;
  requestId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Filter and search types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  severity?: string;
  [key: string]: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: {
    label: string;
    action: string;
    primary?: boolean;
  }[];
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard/monitoring types som manglet
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'security' | 'system' | 'performance' | 'business';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  disk: number;
  database: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    maxConnections: number;
    responseTime: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    requestsPerMinute: number;
    responseTime: number;
    errorRate: number;
  };
  services: {
    name: string;
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastCheck: string;
  }[];
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

export interface AccessControl {
  id: string;
  userId: number;
  userName: string;
  email: string;
  status: 'active' | 'locked' | 'pending' | 'inactive';
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: number;
  action: string;
  resource: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, any>;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  dangerous?: boolean;
  confirmMessage?: string;
} 