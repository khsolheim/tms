import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../utils/logger";
import {
  hentVarslingsinnstillingerSchema,
  oppdaterVarslingsinnstillingerSchema,
  hentKlasserSchema,
  healthCheckSchema
} from "../validation/misc.validation";
import { sjekkRolle } from '../middleware/auth';
import { dbPerformanceAnalyzer } from '../utils/database-performance';

const router = Router();
const prisma = new PrismaClient();

// Hent varslingsinnstillinger
router.get("/notification-settings", 
  verifyToken,
  validate(hentVarslingsinnstillingerSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.info('Henter varslingsinnstillinger', { userId: req.bruker!.id });

    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { varslingsinnstillinger: true }
    });

    res.json(bruker?.varslingsinnstillinger || {});
  })
);

// Oppdater varslingsinnstillinger
router.put("/notification-settings", 
  verifyToken,
  validate(oppdaterVarslingsinnstillingerSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { innstillinger, epostAktiv, smsAktiv, daglingSammendrag, umiddelbareVarsler } = req.body;

    logger.info('Oppdaterer varslingsinnstillinger', { 
      userId: req.bruker!.id,
      endringer: req.body
    });

    await prisma.ansatt.update({
      where: { id: req.bruker!.id },
      data: {
        varslingsinnstillinger: {
          innstillinger,
          epostAktiv,
          smsAktiv,
          daglingSammendrag,
          umiddelbareVarsler
        }
      }
    });

    res.json({ success: true, message: "Varslingsinnstillinger oppdatert" });
  })
);

// Hent alle tilgjengelige førerkortklasser
router.get("/klasser", 
  verifyToken,
  validate(hentKlasserSchema),
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    logger.info('Henter førerkortklasser');

    const klasser = [
      { kode: 'A1', omfatter: 'Lett motorsykkel, snøscooter', alder: '16 år' },
      { kode: 'A2', omfatter: 'Mellomklasse motorsykkel', alder: '18 år' },
      { kode: 'A', omfatter: 'Motorsykkel (Utvidelse: 20 år - Direkte 24 år)', alder: '20 eller 24 år' },
      { kode: 'B', omfatter: 'Personbil, varebil', alder: '18 år' },
      { kode: 'BE', omfatter: 'Personbil med tilhenger', alder: '18 år' },
      { kode: 'C1', omfatter: 'Lett lastebil', alder: '18 eller 21 år¹' },
      { kode: 'C1E', omfatter: 'Lett lastebil med tilhenger', alder: '18 eller 21 år¹' },
      { kode: 'C', omfatter: 'Lastebil', alder: '18 eller 21 år¹' },
      { kode: 'CE', omfatter: 'Vogntog', alder: '18 eller 21 år¹' },
      { kode: 'D1', omfatter: 'Minibuss', alder: '21 år' },
      { kode: 'D1E', omfatter: 'Minibuss med tilhenger', alder: '21 år' },
      { kode: 'D', omfatter: 'Buss', alder: '21 år' },
      { kode: 'DE', omfatter: 'Buss med tilhenger', alder: '21 år' },
      { kode: 'E', omfatter: 'Tilhenger og tilhengerredskap (tillegg til klasse B, C1, C, D1 og D) (tilhenger over 750 kilo: 21 år)', alder: '18 eller 21 år' },
      { kode: 'S', omfatter: 'Beltemotorsykkel', alder: '16 år' },
      { kode: 'T', omfatter: 'Traktor', alder: '16 år' },
      { kode: 'M 147', omfatter: 'Tre- og firehjuls moped', alder: '16 år' },
    ];
    res.json(klasser);
  })
);

// Helsekontroll
router.get("/health", 
  validate(healthCheckSchema),
  (_req: Request, res: Response): void => {
    res.json({ status: "ok" });
  }
);

// Database performance analyse (kun admin)
router.get('/database-performance', 
  verifyToken,
  sjekkRolle(['ADMIN']),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    logger.info('Starter database performance analyse', {
      bruker: req.bruker?.id,
      tidspunkt: new Date().toISOString()
    });

    const report = await dbPerformanceAnalyzer.generatePerformanceReport();
    
    logger.info('Database performance analyse fullført', {
      avgExecutionTime: report.analyses
        .filter(a => a.executionTime > 0)
        .reduce((sum, a) => sum + a.executionTime, 0) / report.analyses.length,
      slowQueries: report.analyses.filter(a => a.executionTime > 100).length
    });

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  })
);

export default router; 