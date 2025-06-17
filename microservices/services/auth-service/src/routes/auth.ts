import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.ansatt.findUnique({
      where: { epost: email },
      include: { bedrift: true }
    });

    if (!user || !user.passord) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passord);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.epost,
        role: user.rolle,
        bedriftId: user.bedriftId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${user.epost}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.epost,
        fornavn: user.fornavn,
        etternavn: user.etternavn,
        rolle: user.rolle,
        bedrift: user.bedrift?.navn
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fornavn').notEmpty(),
  body('etternavn').notEmpty(),
  body('bedriftId').isUUID()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fornavn, etternavn, bedriftId, rolle = 'BRUKER' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.ansatt.findUnique({
      where: { epost: email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.ansatt.create({
      data: {
        epost: email,
        passord: hashedPassword,
        fornavn,
        etternavn,
        rolle,
        bedriftId,
        isActive: true
      },
      include: { bedrift: true }
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.epost,
        role: user.rolle,
        bedriftId: user.bedriftId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`New user registered: ${user.epost}`);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.epost,
        fornavn: user.fornavn,
        etternavn: user.etternavn,
        rolle: user.rolle,
        bedrift: user.bedrift?.navn
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Get fresh user data
    const user = await prisma.ansatt.findUnique({
      where: { id: decoded.id },
      include: { bedrift: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.epost,
        fornavn: user.fornavn,
        etternavn: user.etternavn,
        rolle: user.rolle,
        bedrift: user.bedrift?.navn
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRoutes }; 