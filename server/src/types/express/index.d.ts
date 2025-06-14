// Global typeutvidelse for Express Request
import 'express';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: number;
        epost: string;
        rolle: string;
        bedriftId?: number;
        ansattId?: number;
      };
    }
  }
} 