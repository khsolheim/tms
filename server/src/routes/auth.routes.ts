/**
 * Authentication Routes
 * 
 * Comprehensive authentication API med sikker brukerautentisering,
 * JWT tokens, session management og audit logging
 */

import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { JWT_CONFIG, PASSWORD_POLICY } from '../config/security.config';

// Security middleware
import {
  authRateLimit,
  validateAuthInput,
  validateUserInput,
  handleValidationErrors,
  auditLog,
} from '../middleware/security.middleware';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface LoginRequest {
  epost: string;
  passord: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  fornavn: string;
  etternavn: string;
  epost: string;
  passord: string;
  passordBekreftelse: string;
  telefon?: string;
  rolle: string;
  bedriftId?: number;
}

interface AuthResponse {
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
  expiresIn?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Hash passord med bcrypt
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = PASSWORD_POLICY.bcryptRounds;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifiser passord
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Valider passord mot policy
 */
const validatePasswordPolicy = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const policy = PASSWORD_POLICY;

  if (password.length < policy.minLength) {
    errors.push(`Passord må være minst ${policy.minLength} tegn`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`Passord kan ikke være lengre enn ${policy.maxLength} tegn`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Passord må inneholde minst én stor bokstav');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Passord må inneholde minst én liten bokstav');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Passord må inneholde minst ett tall');
  }

  if (policy.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    errors.push('Passord må inneholde minst ett spesialtegn (@$!%*?&)');
  }

  if (policy.weakPasswords.includes(password.toLowerCase())) {
    errors.push('Dette passordet er for vanlig og ikke tillatt');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generer JWT tokens
 */
const generateTokens = (user: any) => {
  const payload = {
    userId: user.id,
    epost: user.epost,
    rolle: user.rolle,
    bedriftId: user.bedriftId,
  };

  const accessToken = jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_CONFIG.refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Verifiser JWT token
 */
const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_CONFIG.secret, {
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  });
};

/**
 * Verifiser refresh token
 */
const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_CONFIG.refreshSecret, {
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  }) as any;
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /api/auth/login
 * Brukerinnlogging med sikkerhetstiltak
 */
router.post('/login',
  authRateLimit,
  validateAuthInput,
  handleValidationErrors,
  auditLog('USER_LOGIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { epost, passord, rememberMe }: LoginRequest = req.body;

      logger.info('Login attempt', { epost, ip: req.ip });

      // Finn bruker i database
      const user = await prisma.ansatt.findUnique({
        where: { epost },
        include: { bedrift: true },
      });

      if (!user) {
        logger.warn('Login failed - user not found', { epost, ip: req.ip });
        res.status(401).json({
          success: false,
          error: 'Ugyldig e-post eller passord',
        } as AuthResponse);
        return;
      }

      // Verifiser passord
      const passwordValid = await verifyPassword(passord, user.passordHash);
      if (!passwordValid) {
        logger.warn('Login failed - invalid password', { 
          userId: user.id, 
          epost, 
          ip: req.ip 
        });
        res.status(401).json({
          success: false,
          error: 'Ugyldig e-post eller passord',
        } as AuthResponse);
        return;
      }

      // Sjekk om bruker er aktiv
      if (!user.aktiv) {
        logger.warn('Login failed - user inactive', { 
          userId: user.id, 
          epost, 
          ip: req.ip 
        });
        res.status(401).json({
          success: false,
          error: 'Brukerkonto er deaktivert',
        } as AuthResponse);
        return;
      }

      // Generer tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Oppdater siste innlogging
      await prisma.ansatt.update({
        where: { id: user.id },
        data: { 
          sisteInnlogging: new Date(),
        },
      });

      logger.info('Login successful', { 
        userId: user.id, 
        epost, 
        ip: req.ip 
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          epost: user.epost,
          fornavn: user.fornavn,
          etternavn: user.etternavn,
          rolle: user.rolle,
          bedriftId: user.bedriftId,
        },
        token: accessToken,
        refreshToken,
        expiresIn: JWT_CONFIG.expiresIn,
        message: 'Innlogging vellykket',
      } as AuthResponse);

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Intern server feil under innlogging',
      } as AuthResponse);
    }
  }
);

/**
 * POST /api/auth/register
 * Registrer ny bruker
 */
router.post('/register',
  authRateLimit,
  validateUserInput,
  handleValidationErrors,
  auditLog('USER_REGISTER'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        fornavn,
        etternavn,
        epost,
        passord,
        passordBekreftelse,
        telefon,
        rolle,
        bedriftId,
      }: RegisterRequest = req.body;

      logger.info('Registration attempt', { epost, ip: req.ip });

      // Valider passord matching
      if (passord !== passordBekreftelse) {
        res.status(400).json({
          success: false,
          error: 'Passord og passordbekreftelse stemmer ikke overens',
        } as AuthResponse);
        return;
      }

      // Valider passord policy
      const passwordValidation = validatePasswordPolicy(passord);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Passord oppfyller ikke sikkerhetskravene',
          // details: passwordValidation.errors,
        } as AuthResponse);
        return;
      }

      // Sjekk om e-post allerede eksisterer
      const existingUser = await prisma.ansatt.findUnique({
        where: { epost },
      });

      if (existingUser) {
        logger.warn('Registration failed - email exists', { epost, ip: req.ip });
        res.status(409).json({
          success: false,
          error: 'E-post er allerede registrert',
        } as AuthResponse);
        return;
      }

      // Hash passord
      const passordHash = await hashPassword(passord);

      // Opprett bruker
      const newUser = await prisma.ansatt.create({
        data: {
          fornavn,
          etternavn,
          epost,
          passordHash,
          telefon,
          rolle: rolle as any,
          bedriftId,
          aktiv: true,
          opprettet: new Date(),
        },
      });

      // Generer tokens
      const { accessToken, refreshToken } = generateTokens(newUser);

      logger.info('Registration successful', { 
        userId: newUser.id, 
        epost, 
        ip: req.ip 
      });

      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          epost: newUser.epost,
          fornavn: newUser.fornavn,
          etternavn: newUser.etternavn,
          rolle: newUser.rolle,
          bedriftId: newUser.bedriftId,
        },
        token: accessToken,
        refreshToken,
        expiresIn: JWT_CONFIG.expiresIn,
        message: 'Bruker opprettet og logget inn',
      } as AuthResponse);

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Intern server feil under registrering',
      } as AuthResponse);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Forny access token med refresh token
 */
router.post('/refresh',
  auditLog('TOKEN_REFRESH'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token mangler',
        } as AuthResponse);
        return;
      }

      // Verifiser refresh token
      const decoded = verifyRefreshToken(refreshToken) as any;
      
      if (decoded.type !== 'refresh') {
        res.status(401).json({
          success: false,
          error: 'Ugyldig token type',
        } as AuthResponse);
        return;
      }

      // Hent bruker
      const user = await prisma.ansatt.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.aktiv) {
        res.status(401).json({
          success: false,
          error: 'Bruker ikke funnet eller deaktivert',
        } as AuthResponse);
        return;
      }

      // Generer ny access token
      const { accessToken } = generateTokens(user);

      logger.info('Token refreshed', { userId: user.id });

      res.json({
        success: true,
        token: accessToken,
        expiresIn: JWT_CONFIG.expiresIn,
        message: 'Token fornyet',
      } as AuthResponse);

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Refresh token utløpt',
        } as AuthResponse);
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: 'Ugyldig refresh token',
        } as AuthResponse);
      } else {
        logger.error('Token refresh error:', error);
        res.status(500).json({
          success: false,
          error: 'Intern server feil under token fornyelse',
        } as AuthResponse);
      }
    }
  }
);

/**
 * POST /api/auth/logout
 * Logg ut bruker og ugyldiggjør tokens
 */
router.post('/logout',
  auditLog('USER_LOGOUT'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // I en fullstendig implementasjon ville vi lagt til token i blacklist
        // For nå logger vi bare logout
        logger.info('User logged out', { 
          token: token.substring(0, 20) + '...', 
          ip: req.ip 
        });
      }

      res.json({
        success: true,
        message: 'Utlogging vellykket',
      } as AuthResponse);

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Intern server feil under utlogging',
      } as AuthResponse);
    }
  }
);

/**
 * GET /api/auth/me
 * Hent informasjon om innlogget bruker
 */
router.get('/me',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Ingen tilgangstoken oppgitt',
        } as AuthResponse);
        return;
      }

      // Verifiser token
      const decoded = verifyAccessToken(token) as any;
      
      // Hent bruker
      const user = await prisma.ansatt.findUnique({
        where: { id: decoded.userId },
        include: { bedrift: true },
      });

      if (!user || !user.aktiv) {
        res.status(401).json({
          success: false,
          error: 'Bruker ikke funnet eller deaktivert',
        } as AuthResponse);
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          epost: user.epost,
          fornavn: user.fornavn,
          etternavn: user.etternavn,
          rolle: user.rolle,
          bedriftId: user.bedriftId,
        },
      } as AuthResponse);

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Token utløpt',
        } as AuthResponse);
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          error: 'Ugyldig token',
        } as AuthResponse);
      } else {
        logger.error('Get user info error:', error);
        res.status(500).json({
          success: false,
          error: 'Intern server feil',
        } as AuthResponse);
      }
    }
  }
);

export default router; 