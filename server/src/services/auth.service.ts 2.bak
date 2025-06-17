/**
 * Authentication Service
 * 
 * Sikker håndtering av authentication med bcrypt hashing,
 * JWT tokens, session management og password policies
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { cacheService } from './cache.service';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface JWTPayload {
  userId: number;
  epost: string;
  rolle: string;
  bedriftId?: number;
  iat: number;
  exp: number;
}

interface AuthResult {
  success: boolean;
  user?: {
    id: number;
    epost: string;
    fornavn: string;
    etternavn: string;
    rolle: string;
    bedriftId?: number;
  };
  token?: string;
  refreshToken?: string;
  error?: string;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // dager
  preventReuse: number; // antall tidligere passord
}

interface SessionInfo {
  userId: number;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const BCRYPT_ROUNDS = 12; // Høy sikkerhet

const PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // 90 dager
  preventReuse: 5, // 5 tidligere passord
};

// ============================================================================
// AUTH SERVICE CLASS
// ============================================================================

export class AuthService {
  private cacheService = cacheService;
  private failedAttempts = new Map<string, number>();
  private lockoutUntil = new Map<string, Date>();

  constructor() {
    // cacheService is imported as singleton
  }

  // ========================================================================
  // PASSWORD MANAGEMENT
  // ========================================================================

  /**
   * Hash passord med bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      
      logger.info('Password hashed successfully');
      return hash;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Kunne ikke kryptere passord');
    }
  }

  /**
   * Verifiser passord mot hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      
      if (isValid) {
        logger.info('Password verification successful');
      } else {
        logger.warn('Password verification failed');
      }
      
      return isValid;
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Valider passord mot policy
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < PASSWORD_POLICY.minLength) {
      errors.push(`Passord må være minst ${PASSWORD_POLICY.minLength} tegn`);
    }

    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Passord må inneholde minst én stor bokstav');
    }

    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Passord må inneholde minst én liten bokstav');
    }

    if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
      errors.push('Passord må inneholde minst ett tall');
    }

    if (PASSWORD_POLICY.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
      errors.push('Passord må inneholde minst ett spesialtegn (@$!%*?&)');
    }

    // Sjekk for vanlige svake passord
    const weakPasswords = [
      'password', 'passord', '12345678', 'qwerty123', 
      'admin123', 'test1234', 'password123'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Dette passordet er for vanlig og ikke tillatt');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================================================
  // JWT TOKEN MANAGEMENT
  // ========================================================================

  /**
   * Generer JWT access token
   */
  generateAccessToken(user: any): string {
    const payload = {
      userId: user.id,
      epost: user.epost,
      rolle: user.rolle,
      bedriftId: user.bedriftId,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    logger.info('Access token generated', { userId: user.id });
    return token;
  }

  /**
   * Generer JWT refresh token
   */
  generateRefreshToken(user: any): string {
    const payload = {
      userId: user.id,
      type: 'refresh',
    };

    const token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    logger.info('Refresh token generated', { userId: user.id });
    return token;
  }

  /**
   * Verifiser JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      // Sjekk om token er blacklisted
      const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
      if (isBlacklisted) {
        logger.warn('Attempted use of blacklisted token');
        return null;
      }

      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'tms-api',
        audience: 'tms-client',
      }) as JWTPayload;

      logger.info('Token verified successfully', { userId: decoded.userId });
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid token');
      } else {
        logger.error('Token verification error:', error);
      }
      return null;
    }
  }

  /**
   * Verifiser refresh token
   */
  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'tms-api',
        audience: 'tms-client',
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      logger.info('Refresh token verified', { userId: decoded.userId });
      return decoded;
    } catch (error) {
      logger.warn('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Blacklist token (logout)
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.cacheService.set(`blacklist:${token}`, 'true', ttl);
          logger.info('Token blacklisted', { userId: decoded.userId });
        }
      }
    } catch (error) {
      logger.error('Error blacklisting token:', error);
    }
  }

  // ========================================================================
  // RATE LIMITING AND SECURITY
  // ========================================================================

  /**
   * Sjekk og håndter failed login attempts
   */
  async checkFailedAttempts(identifier: string): Promise<boolean> {
    const key = `failed_attempts:${identifier}`;
    const lockoutKey = `lockout:${identifier}`;

    // Sjekk om bruker er locked out
    const lockoutUntil = await this.cacheService.get(lockoutKey);
    if (lockoutUntil) {
      const unlockTime = new Date(lockoutUntil);
      if (new Date() < unlockTime) {
        logger.warn('User is locked out', { identifier, unlockTime });
        return false;
      } else {
        // Lockout er utløpt, fjern den
        await this.cacheService.del(lockoutKey);
        await this.cacheService.del(key);
      }
    }

    return true;
  }

  /**
   * Registrer mislykket innloggingsforsøk
   */
  async recordFailedAttempt(identifier: string): Promise<void> {
    const key = `failed_attempts:${identifier}`;
    const lockoutKey = `lockout:${identifier}`;

    // Hent current attempts
    const attempts = await this.cacheService.get(key);
    const currentAttempts = attempts ? parseInt(attempts, 10) : 0;
    const newAttempts = currentAttempts + 1;

    logger.warn('Failed login attempt recorded', { 
      identifier, 
      attempts: newAttempts 
    });

    if (newAttempts >= 5) {
      // Lock out for 15 minutes after 5 failed attempts
      const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
      await this.cacheService.set(lockoutKey, lockoutUntil.toISOString(), 15 * 60);
      await this.cacheService.del(key);
      
      logger.error('User locked out due to too many failed attempts', {
        identifier,
        lockoutUntil,
      });
    } else {
      // Store attempt count for 15 minutes
      await this.cacheService.set(key, newAttempts.toString(), 15 * 60);
    }
  }

  /**
   * Fjern failed attempts etter vellykket login
   */
  async clearFailedAttempts(identifier: string): Promise<void> {
    const key = `failed_attempts:${identifier}`;
    await this.cacheService.del(key);
    
    logger.info('Failed attempts cleared', { identifier });
  }

  // ========================================================================
  // SESSION MANAGEMENT
  // ========================================================================

  /**
   * Opprett bruker session
   */
  async createSession(userId: number, req: Request): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionData: SessionInfo = {
      userId,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    };

    // Store session for 7 days
    await this.cacheService.set(
      `session:${sessionId}`, 
      JSON.stringify(sessionData), 
      7 * 24 * 60 * 60
    );

    logger.info('Session created', { userId, sessionId });
    return sessionId;
  }

  /**
   * Hent session info
   */
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    try {
      const sessionData = await this.cacheService.get(`session:${sessionId}`);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as SessionInfo;
      
      // Update last activity
      session.lastActivity = new Date();
      await this.cacheService.set(
        `session:${sessionId}`, 
        JSON.stringify(session), 
        7 * 24 * 60 * 60
      );

      return session;
    } catch (error) {
      logger.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Slett session (logout)
   */
  async destroySession(sessionId: string): Promise<void> {
    await this.cacheService.del(`session:${sessionId}`);
    logger.info('Session destroyed', { sessionId });
  }

  /**
   * Generer session ID
   */
  private generateSessionId(): string {
    return jwt.sign({ 
      type: 'session', 
      timestamp: Date.now() 
    }, JWT_SECRET, { expiresIn: '7d' });
  }

  // ========================================================================
  // MIDDLEWARE
  // ========================================================================

  /**
   * Authentication middleware
   */
  authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({ 
          error: 'Ingen tilgangstoken oppgitt' 
        });
      }

      const decoded = await this.verifyToken(token);
      if (!decoded) {
        return res.status(403).json({ 
          error: 'Ugyldig eller utløpt token' 
        });
      }

      // Legg brukerinfo til request
      (req as any).user = decoded;
      next();
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      res.status(500).json({ 
        error: 'Intern server feil under autentisering' 
      });
    }
  };

  /**
   * Authorization middleware factory
   */
  authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Bruker ikke autentisert' 
        });
      }

      if (!allowedRoles.includes(user.rolle)) {
        logger.warn('Unauthorized access attempt', {
          userId: user.userId,
          rolle: user.rolle,
          allowedRoles,
          url: req.url,
        });

        return res.status(403).json({ 
          error: 'Ingen tilgang til denne ressursen' 
        });
      }

      next();
    };
  };
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const authService = new AuthService();
export default authService; 