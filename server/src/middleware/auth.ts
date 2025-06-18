import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getJwtSecret } from "../config/auth";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  bruker?: {
    id: number;
    rolle: string;
    bedriftId: number | null;
    originalUserId?: number;
    isImpersonating?: boolean;
  };
}

// Demo mode constants
const DEMO_TOKEN = 'demo-token-123';
const DEMO_USER = {
  id: 1,
  rolle: 'ADMIN',
  bedriftId: 1,
  originalUserId: undefined,
  isImpersonating: false
};

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.log('No token found in request');
    res.status(401).json({ error: "Ingen token funnet" });
    return;
  }

  // Check for demo token first
  if (token === DEMO_TOKEN) {
    console.log('Demo token detected - using demo user');
    req.bruker = DEMO_USER;
    next();
    return;
  }

  try {
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id: number;
      originalUserId?: number;
      isImpersonating?: boolean;
    };
    
    const bruker = await prisma.ansatt.findUnique({
      where: { id: decoded.id },
      select: { id: true, rolle: true, bedriftId: true }
    });

    if (!bruker) {
      console.log('User not found for token');
      res.status(401).json({ error: "Ugyldig bruker" });
      return;
    }

    console.log('Token verified for user:', bruker.id);
    req.bruker = {
      ...bruker,
      originalUserId: decoded.originalUserId,
      isImpersonating: decoded.isImpersonating
    };
    next();
  } catch (error) {
    console.log('Token verification failed:', error instanceof Error ? error.message : error);
    res.status(401).json({ error: "Ugyldig token" });
  }
};

export const sjekkRolle = (roller: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.bruker) {
      res.status(401).json({ error: "Ikke autentisert" });
      return;
    }

    if (!roller.includes(req.bruker.rolle)) {
      res.status(403).json({ error: "Ikke tilgang" });
      return;
    }

    next();
  };
}; 