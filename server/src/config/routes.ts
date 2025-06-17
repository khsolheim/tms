import { Express, Request, Response } from "express";
import authRoutes from "../routes/auth";
import logger from "../utils/logger";

export function configureRoutes(app: Express): void {
  console.log('🚀 Konfigurerer routes...');

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'TMS API is running'
    });
  });

  // Auth routes for login
  app.use('/api/auth', authRoutes);

  console.log('✅ Routes konfigurert!');
}

 