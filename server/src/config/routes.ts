import { Express, Request, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { getValidationDashboardData } from "../middleware/validationMonitoring";
import { getPerformanceMetrics } from "../middleware/performance";
import logger from "../utils/logger";

// Import alle route modules
import brønnøysundRoutes from "../routes/brønnøysund";
import emailRoutes from "../routes/email.routes";
import ansattRoutes from "../routes/ansatt.routes";
import authRoutes from "../routes/auth";
import sikkerhetskontrollRoutes from "../routes/sikkerhetskontroll.routes";
import quizRoutes from "../routes/quiz.routes";
import bilderRoutes from "../routes/bilder.routes";
import sjekkpunktRoutes from "../routes/sjekkpunkt.routes";
import systemConfigRoutes from "../routes/systemconfig.routes";
import kontrollmalRoutes from "../routes/kontrollmal.routes";
import bedriftRoutes from "../routes/bedrifter";
import kontraktRoutes from "../routes/kontrakt.routes";
import elevRoutes from "../routes/elev.routes";
import brukereRoutes from "../routes/brukere.routes";
import miscRoutes from "../routes/misc.routes";
import { validationRoutes } from "../routes/validation.routes";
import docsRoutes from "../routes/docs.routes";
import regnskapsIntegrasjonsRoutes from "../routes/regnskaps-integrasjon.routes";
import tenantsRoutes from "../routes/tenants.routes";
import referenceRoutes from "../routes/reference.routes";

export function configureRoutes(app: Express): void {
  // Debug logging
  logger.info('🚀 Registrerer API routes...');
  
  // API routes
  app.use('/api/bronnoysund', brønnøysundRoutes);
  app.use('/api/email', verifyToken, emailRoutes);
  
  logger.info('📋 Registrerer ansatt routes...');
  
  // Test route uten middleware
  app.get('/api/ansatt-test', (req, res) => {
    res.json({ success: true, message: 'Ansatt test route fungerer!' });
  });
  
  app.use('/api/ansatt', verifyToken, ansattRoutes);
  logger.info('✅ Ansatt routes registrert');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/sikkerhetskontroll', sikkerhetskontrollRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/bilder', bilderRoutes);
  app.use('/api/sjekkpunkter', sjekkpunktRoutes);
  app.use('/api/systemconfig', systemConfigRoutes);
  app.use('/api/kontroll-maler', kontrollmalRoutes);
  app.use('/api/bedrift', bedriftRoutes);
  app.use('/api/brukere', brukereRoutes);
  app.use('/api/elever', elevRoutes);
  app.use('/api/kontrakter', kontraktRoutes);
  app.use('/api/validation', validationRoutes);
  app.use('/api/regnskaps-integrasjon', regnskapsIntegrasjonsRoutes);
  app.use('/api/tenants', tenantsRoutes);
  app.use('/api/reference', referenceRoutes);
  app.use('/api/v1/docs', docsRoutes);
  app.use('/api', miscRoutes);

  // Admin routes
  configureAdminRoutes(app);
}

function configureAdminRoutes(app: Express): void {
  // Validation monitoring dashboard (admin only)
  app.get('/api/admin/validation-monitoring', verifyToken, (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = (req as any).bruker;
      if (!user || user.rolle !== 'ADMIN') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Kun administratorer kan se validation monitoring',
            statusCode: 403
          }
        });
      }

      const dashboardData = getValidationDashboardData();
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      logger.error('Error fetching validation monitoring data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Feil ved henting av validation monitoring data',
          statusCode: 500
        }
      });
    }
  });

  // Performance metrics dashboard (admin only)
  app.get('/api/admin/performance-metrics', verifyToken, getPerformanceMetrics);
} 