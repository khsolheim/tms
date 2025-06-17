import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware som krever admin-rolle for tilgang
 */
export const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).bruker;
    
    if (!user) {
      logger.warn('Admin access denied - no user', { 
        ip: req.ip,
        path: req.path 
      });
      return res.status(401).json({
        success: false,
        error: 'Autentisering kreves',
        code: 'UNAUTHORIZED'
      });
    }

    // Sjekk om bruker har admin-rolle
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.rolle)) {
      logger.warn('Admin access denied - insufficient role', { 
        userId: user.id,
        rolle: user.rolle,
        ip: req.ip,
        path: req.path 
      });
      return res.status(403).json({
        success: false,
        error: 'Kun administratorer har tilgang til denne funksjonen',
        code: 'FORBIDDEN'
      });
    }

    logger.debug('Admin access granted', { 
      userId: user.id,
      rolle: user.rolle,
      path: req.path 
    });

    next();
  } catch (error) {
    logger.error('Error in requireAdminRole middleware', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      ip: req.ip
    });
    
    res.status(500).json({
      success: false,
      error: 'Intern server feil',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * Middleware som krever spesifikke roller for tilgang
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).bruker;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Autentisering kreves',
          code: 'UNAUTHORIZED'
        });
      }

      if (!allowedRoles.includes(user.rolle)) {
        logger.warn('Role access denied', { 
          userId: user.id,
          rolle: user.rolle,
          allowedRoles,
          ip: req.ip,
          path: req.path 
        });
        return res.status(403).json({
          success: false,
          error: `Tilgang krever en av følgende roller: ${allowedRoles.join(', ')}`,
          code: 'FORBIDDEN'
        });
      }

      next();
    } catch (error) {
      logger.error('Error in requireRoles middleware', {
        error: error instanceof Error ? error.message : 'Unknown error',
        allowedRoles,
        path: req.path,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        error: 'Intern server feil',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
}; 