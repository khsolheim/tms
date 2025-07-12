import { Express, Request, Response } from "express";
import authRoutes from "../routes/auth";
import bedrifterRoutes from "../routes/bedrifter";
import sikkerhetskontrollLaeringRoutes from "../routes/sikkerhetskontroll-laering.routes";
import dashboardRoutes from "../routes/dashboard.routes";
import quizRoutes from "../routes/quiz.routes";
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
  
  // Bedrifter routes
  app.use('/api/bedrifter', bedrifterRoutes);
  
  // Sikkerhetskontroll læring routes
  app.use('/api/sikkerhetskontroll-laering', sikkerhetskontrollLaeringRoutes);
  
  // Dashboard routes
  app.use('/api/dashboard', dashboardRoutes);
  
  // Quiz routes - enhanced quiz system
  app.use('/api/quiz', quizRoutes);

  console.log('✅ Routes konfigurert!');
}

 