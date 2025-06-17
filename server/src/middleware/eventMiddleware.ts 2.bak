import { Request, Response, NextFunction } from 'express';
import { eventBus, EventType } from '../events/eventBus';

export const eventMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Track important business operations
  if (shouldTrackRequest(req)) {
    eventBus.publish(EventType.BUSINESS_OPERATION_STARTED, {
      operation: `${req.method} ${req.url}`,
      timestamp: new Date(),
      ip: req.ip || 'unknown'
    }).catch(console.error);
  }

  next();
};

function shouldTrackRequest(req: Request): boolean {
  const trackableEndpoints = ['/api/bedrifter', '/api/ansatte', '/api/sikkerhetskontroll'];
  return trackableEndpoints.some(endpoint => req.url.startsWith(endpoint));
} 