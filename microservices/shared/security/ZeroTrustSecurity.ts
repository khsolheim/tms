import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface SecurityContext {
  userId: string;
  bedriftId: string;
  role: string;
  permissions: string[];
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  riskScore: number;
  lastActivity: Date;
  mfaVerified: boolean;
  deviceTrusted: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  conditions: SecurityCondition[];
  actions: SecurityAction[];
  priority: number;
  enabled: boolean;
}

export interface SecurityCondition {
  type: 'USER_ROLE' | 'IP_RANGE' | 'TIME_WINDOW' | 'DEVICE_TYPE' | 'RISK_SCORE' | 'MFA_STATUS' | 'LOCATION';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'IN_RANGE' | 'GREATER_THAN' | 'LESS_THAN';
  value: any;
}

export interface SecurityAction {
  type: 'ALLOW' | 'DENY' | 'REQUIRE_MFA' | 'REQUIRE_APPROVAL' | 'LOG_ONLY' | 'RATE_LIMIT';
  parameters?: any;
}

export interface ThreatDetection {
  id: string;
  type: 'BRUTE_FORCE' | 'ANOMALOUS_BEHAVIOR' | 'SUSPICIOUS_IP' | 'UNUSUAL_LOCATION' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  ipAddress: string;
  timestamp: Date;
  evidence: any;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
}

export class ZeroTrustSecurityManager {
  private policies: Map<string, SecurityPolicy> = new Map();
  private activeSessions: Map<string, SecurityContext> = new Map();
  private threatDetections: Map<string, ThreatDetection> = new Map();
  private riskScoreCache: Map<string, { score: number; timestamp: Date }> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
    this.startThreatDetection();
  }

  // Policy Management
  private initializeDefaultPolicies(): void {
    const defaultPolicies: SecurityPolicy[] = [
      {
        id: 'admin-access-policy',
        name: 'Admin Access Control',
        description: 'Strict controls for admin access',
        conditions: [
          { type: 'USER_ROLE', operator: 'EQUALS', value: 'ADMIN' },
          { type: 'MFA_STATUS', operator: 'EQUALS', value: true }
        ],
        actions: [
          { type: 'REQUIRE_MFA' },
          { type: 'ALLOW' }
        ],
        priority: 1,
        enabled: true
      },
      {
        id: 'high-risk-user-policy',
        name: 'High Risk User Policy',
        description: 'Additional verification for high-risk users',
        conditions: [
          { type: 'RISK_SCORE', operator: 'GREATER_THAN', value: 70 }
        ],
        actions: [
          { type: 'REQUIRE_MFA' },
          { type: 'REQUIRE_APPROVAL' }
        ],
        priority: 2,
        enabled: true
      },
      {
        id: 'suspicious-ip-policy',
        name: 'Suspicious IP Policy',
        description: 'Block access from suspicious IP addresses',
        conditions: [
          { type: 'IP_RANGE', operator: 'NOT_EQUALS', value: 'TRUSTED_RANGES' }
        ],
        actions: [
          { type: 'LOG_ONLY' },
          { type: 'RATE_LIMIT', parameters: { maxRequests: 10, windowMs: 60000 } }
        ],
        priority: 3,
        enabled: true
      },
      {
        id: 'business-hours-policy',
        name: 'Business Hours Access',
        description: 'Restrict access outside business hours',
        conditions: [
          { type: 'TIME_WINDOW', operator: 'NOT_EQUALS', value: { start: '08:00', end: '18:00' } }
        ],
        actions: [
          { type: 'REQUIRE_MFA' },
          { type: 'LOG_ONLY' }
        ],
        priority: 4,
        enabled: true
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });

    console.log('✅ Zero Trust Security policies initialized');
  }

  // Authentication & Authorization
  async authenticateRequest(
    token: string,
    request: {
      ipAddress: string;
      userAgent: string;
      path: string;
      method: string;
    }
  ): Promise<{ allowed: boolean; context?: SecurityContext; reason?: string }> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Get or create security context
      const context = await this.getOrCreateSecurityContext(decoded, request);
      
      // Calculate risk score
      const riskScore = await this.calculateRiskScore(context, request);
      context.riskScore = riskScore;
      
      // Evaluate security policies
      const policyResult = await this.evaluatePolicies(context, request);
      
      if (!policyResult.allowed) {
        await this.logSecurityEvent('ACCESS_DENIED', context, request, policyResult.reason);
        return { allowed: false, reason: policyResult.reason };
      }
      
      // Update session activity
      context.lastActivity = new Date();
      this.activeSessions.set(context.sessionId, context);
      
      await this.logSecurityEvent('ACCESS_GRANTED', context, request);
      return { allowed: true, context };
      
    } catch (error) {
      await this.logSecurityEvent('AUTHENTICATION_FAILED', null, request, error.message);
      return { allowed: false, reason: 'Invalid token' };
    }
  }

  private async getOrCreateSecurityContext(
    decoded: any,
    request: any
  ): Promise<SecurityContext> {
    const sessionId = this.generateSessionId(decoded.id, request.ipAddress);
    
    let context = this.activeSessions.get(sessionId);
    
    if (!context) {
      context = {
        userId: decoded.id,
        bedriftId: decoded.bedriftId,
        role: decoded.role,
        permissions: decoded.permissions || [],
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        sessionId,
        riskScore: 0,
        lastActivity: new Date(),
        mfaVerified: decoded.mfaVerified || false,
        deviceTrusted: await this.isDeviceTrusted(request.userAgent, request.ipAddress)
      };
    }
    
    return context;
  }

  // Risk Assessment
  private async calculateRiskScore(
    context: SecurityContext,
    request: any
  ): Promise<number> {
    const cacheKey = `${context.userId}:${context.ipAddress}`;
    const cached = this.riskScoreCache.get(cacheKey);
    
    // Use cached score if recent (5 minutes)
    if (cached && Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
      return cached.score;
    }
    
    let riskScore = 0;
    
    // Base risk factors
    if (!context.mfaVerified) riskScore += 20;
    if (!context.deviceTrusted) riskScore += 15;
    
    // IP reputation check
    const ipRisk = await this.checkIpReputation(context.ipAddress);
    riskScore += ipRisk;
    
    // Behavioral analysis
    const behaviorRisk = await this.analyzeBehavior(context, request);
    riskScore += behaviorRisk;
    
    // Time-based risk
    const timeRisk = this.calculateTimeBasedRisk();
    riskScore += timeRisk;
    
    // Location risk
    const locationRisk = await this.calculateLocationRisk(context.ipAddress);
    riskScore += locationRisk;
    
    // Cap at 100
    riskScore = Math.min(riskScore, 100);
    
    // Cache the result
    this.riskScoreCache.set(cacheKey, { score: riskScore, timestamp: new Date() });
    
    return riskScore;
  }

  private async checkIpReputation(ipAddress: string): Promise<number> {
    // Simulate IP reputation check
    const suspiciousIps = ['192.168.1.100', '10.0.0.50']; // Mock suspicious IPs
    
    if (suspiciousIps.includes(ipAddress)) {
      return 30;
    }
    
    // Check against known threat feeds (mock)
    if (ipAddress.startsWith('192.168.')) {
      return 0; // Local network
    }
    
    return 5; // Default external IP risk
  }

  private async analyzeBehavior(context: SecurityContext, request: any): Promise<number> {
    let behaviorRisk = 0;
    
    // Check for unusual access patterns
    const recentSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === context.userId);
    
    if (recentSessions.length > 5) {
      behaviorRisk += 10; // Multiple concurrent sessions
    }
    
    // Check for rapid requests (potential automation)
    const recentActivity = recentSessions
      .filter(s => Date.now() - s.lastActivity.getTime() < 60000); // Last minute
    
    if (recentActivity.length > 10) {
      behaviorRisk += 15; // High activity rate
    }
    
    // Check for privilege escalation attempts
    if (request.path.includes('/admin') && context.role !== 'ADMIN') {
      behaviorRisk += 25;
    }
    
    return behaviorRisk;
  }

  private calculateTimeBasedRisk(): number {
    const now = new Date();
    const hour = now.getHours();
    
    // Higher risk outside business hours (8 AM - 6 PM)
    if (hour < 8 || hour > 18) {
      return 10;
    }
    
    // Weekend access
    const day = now.getDay();
    if (day === 0 || day === 6) {
      return 5;
    }
    
    return 0;
  }

  private async calculateLocationRisk(ipAddress: string): Promise<number> {
    // Mock geolocation check
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return 0; // Local network
    }
    
    // Simulate location-based risk
    return 5; // Default for external IPs
  }

  // Policy Evaluation
  private async evaluatePolicies(
    context: SecurityContext,
    request: any
  ): Promise<{ allowed: boolean; reason?: string; requiredActions?: SecurityAction[] }> {
    const applicablePolicies = Array.from(this.policies.values())
      .filter(policy => policy.enabled)
      .sort((a, b) => a.priority - b.priority);
    
    const requiredActions: SecurityAction[] = [];
    
    for (const policy of applicablePolicies) {
      const conditionsMet = this.evaluateConditions(policy.conditions, context, request);
      
      if (conditionsMet) {
        for (const action of policy.actions) {
          if (action.type === 'DENY') {
            return { 
              allowed: false, 
              reason: `Access denied by policy: ${policy.name}` 
            };
          }
          
          if (action.type === 'REQUIRE_MFA' && !context.mfaVerified) {
            return { 
              allowed: false, 
              reason: 'Multi-factor authentication required',
              requiredActions: [action]
            };
          }
          
          if (action.type === 'REQUIRE_APPROVAL') {
            return { 
              allowed: false, 
              reason: 'Administrative approval required',
              requiredActions: [action]
            };
          }
          
          requiredActions.push(action);
        }
      }
    }
    
    return { allowed: true, requiredActions };
  }

  private evaluateConditions(
    conditions: SecurityCondition[],
    context: SecurityContext,
    request: any
  ): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'USER_ROLE':
          return this.evaluateCondition(context.role, condition.operator, condition.value);
        case 'RISK_SCORE':
          return this.evaluateCondition(context.riskScore, condition.operator, condition.value);
        case 'MFA_STATUS':
          return this.evaluateCondition(context.mfaVerified, condition.operator, condition.value);
        case 'IP_RANGE':
          return this.evaluateIpCondition(context.ipAddress, condition.operator, condition.value);
        case 'TIME_WINDOW':
          return this.evaluateTimeCondition(condition.operator, condition.value);
        default:
          return true;
      }
    });
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'EQUALS':
        return actual === expected;
      case 'NOT_EQUALS':
        return actual !== expected;
      case 'GREATER_THAN':
        return actual > expected;
      case 'LESS_THAN':
        return actual < expected;
      case 'CONTAINS':
        return Array.isArray(actual) ? actual.includes(expected) : actual.toString().includes(expected);
      default:
        return false;
    }
  }

  private evaluateIpCondition(ipAddress: string, operator: string, value: any): boolean {
    if (value === 'TRUSTED_RANGES') {
      const trustedRanges = ['192.168.', '10.0.', '172.16.'];
      const isTrusted = trustedRanges.some(range => ipAddress.startsWith(range));
      return operator === 'EQUALS' ? isTrusted : !isTrusted;
    }
    
    return this.evaluateCondition(ipAddress, operator, value);
  }

  private evaluateTimeCondition(operator: string, value: any): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (value.start && value.end) {
      const inWindow = currentTime >= value.start && currentTime <= value.end;
      return operator === 'EQUALS' ? inWindow : !inWindow;
    }
    
    return true;
  }

  // Threat Detection
  private startThreatDetection(): void {
    // Monitor for brute force attacks
    setInterval(() => {
      this.detectBruteForceAttacks();
    }, 60000); // Every minute
    
    // Monitor for anomalous behavior
    setInterval(() => {
      this.detectAnomalousBehavior();
    }, 300000); // Every 5 minutes
    
    console.log('🔍 Threat detection monitoring started');
  }

  private detectBruteForceAttacks(): void {
    const failedAttempts = new Map<string, number>();
    
    // This would typically analyze logs, but for demo we'll simulate
    const suspiciousIps = ['192.168.1.100'];
    
    suspiciousIps.forEach(ip => {
      const attempts = Math.floor(Math.random() * 20);
      if (attempts > 10) {
        this.createThreatDetection({
          type: 'BRUTE_FORCE',
          severity: 'HIGH',
          description: `Detected ${attempts} failed login attempts from IP ${ip}`,
          ipAddress: ip,
          evidence: { attempts, timeWindow: '5 minutes' }
        });
      }
    });
  }

  private detectAnomalousBehavior(): void {
    const activeSessions = Array.from(this.activeSessions.values());
    
    // Detect users with unusually high activity
    const userActivity = new Map<string, number>();
    
    activeSessions.forEach(session => {
      const count = userActivity.get(session.userId) || 0;
      userActivity.set(session.userId, count + 1);
    });
    
    userActivity.forEach((sessionCount, userId) => {
      if (sessionCount > 5) {
        this.createThreatDetection({
          type: 'ANOMALOUS_BEHAVIOR',
          severity: 'MEDIUM',
          description: `User ${userId} has ${sessionCount} concurrent sessions`,
          userId,
          ipAddress: 'multiple',
          evidence: { sessionCount, threshold: 5 }
        });
      }
    });
  }

  private createThreatDetection(threat: Omit<ThreatDetection, 'id' | 'timestamp' | 'status'>): void {
    const detection: ThreatDetection = {
      id: this.generateThreatId(),
      timestamp: new Date(),
      status: 'ACTIVE',
      ...threat
    };
    
    this.threatDetections.set(detection.id, detection);
    
    console.log(`🚨 Threat detected: ${detection.type} - ${detection.description}`);
    
    // In production, this would trigger alerts, notifications, etc.
    this.handleThreatDetection(detection);
  }

  private async handleThreatDetection(threat: ThreatDetection): Promise<void> {
    // Automatic response based on threat type and severity
    switch (threat.type) {
      case 'BRUTE_FORCE':
        if (threat.severity === 'HIGH') {
          await this.blockIpAddress(threat.ipAddress, 3600); // Block for 1 hour
        }
        break;
      
      case 'ANOMALOUS_BEHAVIOR':
        if (threat.userId) {
          await this.requireMfaForUser(threat.userId);
        }
        break;
    }
    
    // Send notification to security team
    await this.notifySecurityTeam(threat);
  }

  // Utility Methods
  private generateSessionId(userId: string, ipAddress: string): string {
    return crypto
      .createHash('sha256')
      .update(`${userId}:${ipAddress}:${Date.now()}`)
      .digest('hex')
      .substring(0, 16);
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async isDeviceTrusted(userAgent: string, ipAddress: string): Promise<boolean> {
    // Mock device trust check
    return ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.');
  }

  private async blockIpAddress(ipAddress: string, durationSeconds: number): Promise<void> {
    console.log(`🚫 Blocking IP ${ipAddress} for ${durationSeconds} seconds`);
    // Implementation would add IP to firewall/WAF block list
  }

  private async requireMfaForUser(userId: string): Promise<void> {
    console.log(`🔐 Requiring MFA for user ${userId}`);
    // Implementation would flag user account to require MFA
  }

  private async notifySecurityTeam(threat: ThreatDetection): Promise<void> {
    console.log(`📧 Notifying security team about threat: ${threat.id}`);
    // Implementation would send alerts via email, Slack, etc.
  }

  private async logSecurityEvent(
    event: string,
    context: SecurityContext | null,
    request: any,
    details?: string
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      event,
      userId: context?.userId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      path: request.path,
      method: request.method,
      riskScore: context?.riskScore,
      details
    };
    
    console.log(`🔒 Security Event: ${JSON.stringify(logEntry)}`);
    // In production, this would write to security logs, SIEM, etc.
  }

  // Public API Methods
  public async getThreatDetections(
    filters?: {
      type?: string;
      severity?: string;
      status?: string;
      userId?: string;
    }
  ): Promise<ThreatDetection[]> {
    let threats = Array.from(this.threatDetections.values());
    
    if (filters) {
      if (filters.type) threats = threats.filter(t => t.type === filters.type);
      if (filters.severity) threats = threats.filter(t => t.severity === filters.severity);
      if (filters.status) threats = threats.filter(t => t.status === filters.status);
      if (filters.userId) threats = threats.filter(t => t.userId === filters.userId);
    }
    
    return threats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public async getActiveSessions(): Promise<SecurityContext[]> {
    return Array.from(this.activeSessions.values());
  }

  public async revokeSession(sessionId: string): Promise<boolean> {
    return this.activeSessions.delete(sessionId);
  }

  public async updateThreatStatus(threatId: string, status: ThreatDetection['status']): Promise<boolean> {
    const threat = this.threatDetections.get(threatId);
    if (threat) {
      threat.status = status;
      return true;
    }
    return false;
  }

  public getSecurityMetrics(): {
    activeSessions: number;
    activeThreats: number;
    averageRiskScore: number;
    policiesEnabled: number;
  } {
    const activeSessions = this.activeSessions.size;
    const activeThreats = Array.from(this.threatDetections.values())
      .filter(t => t.status === 'ACTIVE').length;
    
    const riskScores = Array.from(this.activeSessions.values()).map(s => s.riskScore);
    const averageRiskScore = riskScores.length > 0 
      ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length 
      : 0;
    
    const policiesEnabled = Array.from(this.policies.values())
      .filter(p => p.enabled).length;
    
    return {
      activeSessions,
      activeThreats,
      averageRiskScore: Math.round(averageRiskScore),
      policiesEnabled
    };
  }
}

// Global instance
export const zeroTrustSecurity = new ZeroTrustSecurityManager();

// Express middleware for Zero Trust
export function zeroTrustMiddleware() {
  return async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const result = await zeroTrustSecurity.authenticateRequest(token, {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      path: req.path,
      method: req.method
    });
    
    if (!result.allowed) {
      return res.status(403).json({ 
        error: 'Access denied', 
        reason: result.reason 
      });
    }
    
    req.securityContext = result.context;
    next();
  };
} 