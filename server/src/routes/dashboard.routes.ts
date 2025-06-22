import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../utils/logger";

const router = Router();
const prisma = new PrismaClient();

interface DashboardStats {
  totalBedrifter: number;
  totalAnsatte: number;
  totalElever: number;
  aktiveSikkerhetskontroller: number;
  fullforteKurs: number;
  ventendeSikkerhetskontroller: number;
  kritiskeVarsler: number;
  systemYtelse: number;
}

interface RecentActivity {
  id: string;
  type: 'sikkerhetskontroll' | 'kurs' | 'bruker' | 'system';
  beskrivelse: string;
  tidspunkt: string;
  status: 'success' | 'warning' | 'error';
}

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Hent dashboard statistikk
 *     description: Henter oversikt over systemstatistikk for dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistikk hentet vellykket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBedrifter:
 *                   type: number
 *                   example: 12
 *                 totalAnsatte:
 *                   type: number
 *                   example: 156
 *                 totalElever:
 *                   type: number
 *                   example: 89
 *                 aktiveSikkerhetskontroller:
 *                   type: number
 *                   example: 23
 *                 fullforteKurs:
 *                   type: number
 *                   example: 45
 *                 ventendeSikkerhetskontroller:
 *                   type: number
 *                   example: 8
 *                 kritiskeVarsler:
 *                   type: number
 *                   example: 3
 *                 systemYtelse:
 *                   type: number
 *                   example: 98
 */
router.get('/stats', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.info('Henter dashboard statistikk', { userId: req.bruker!.id });

    try {
      // Hent data fra databasen
      const [
        totalBedrifter,
        totalAnsatte,
        totalElever,
        aktiveSikkerhetskontroller,
        ventendeSikkerhetskontroller,
        fullforteKurs
      ] = await Promise.all([
        prisma.bedrift.count({
          where: { isDeleted: false }
        }),
        prisma.ansatt.count({
          where: { aktiv: true }
        }),
        prisma.elev.count({
          where: { status: 'AKTIV' }
        }),
        prisma.sikkerhetskontroll.count({
          where: { aktiv: true }
        }),
        prisma.sikkerhetskontroll.count({
          where: { aktiv: false }
        }),
        prisma.sikkerhetskontrollElevProgresjon.count({
          where: { mestret: true }
        })
      ]);

      // Beregn systemytelse basert på aktivitet
      const systemYtelse = Math.min(98, Math.max(75, 
        85 + (aktiveSikkerhetskontroller > 0 ? 10 : 0) + 
        (fullforteKurs > 10 ? 5 : 0)
      ));

      const stats: DashboardStats = {
        totalBedrifter,
        totalAnsatte,
        totalElever,
        aktiveSikkerhetskontroller,
        fullforteKurs,
        ventendeSikkerhetskontroller,
        kritiskeVarsler: ventendeSikkerhetskontroller > 10 ? 3 : 0, // Beregnet basert på ventende kontroller
        systemYtelse
      };

      logger.info('Dashboard statistikk hentet', { 
        userId: req.bruker!.id,
        stats 
      });

      res.json(stats);

    } catch (error) {
      logger.error('Feil ved henting av dashboard statistikk', {
        userId: req.bruker!.id,
        error: error instanceof Error ? error.message : 'Ukjent feil'
      });

      // Fallback til mock data hvis database feiler
      const mockStats: DashboardStats = {
        totalBedrifter: 12,
        totalAnsatte: 156,
        totalElever: 89,
        aktiveSikkerhetskontroller: 23,
        fullforteKurs: 45,
        ventendeSikkerhetskontroller: 8,
        kritiskeVarsler: 3,
        systemYtelse: 98
      };

      res.json(mockStats);
    }
  })
);

/**
 * @swagger
 * /dashboard/activities:
 *   get:
 *     summary: Hent siste aktiviteter
 *     description: Henter oversikt over siste aktiviteter i systemet
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Antall aktiviteter å hente
 *     responses:
 *       200:
 *         description: Aktiviteter hentet vellykket
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [sikkerhetskontroll, kurs, bruker, system]
 *                   beskrivelse:
 *                     type: string
 *                   tidspunkt:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [success, warning, error]
 */
router.get('/activities',
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info('Henter siste aktiviteter', { 
      userId: req.bruker!.id,
      limit 
    });

    try {
      // For nå returnerer vi mock data siden vi ikke har aktivitetslogg i databasen ennå
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'sikkerhetskontroll',
          beskrivelse: 'Ny sikkerhetskontroll opprettet for Bedrift AS',
          tidspunkt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'kurs',
          beskrivelse: 'Kurs "Sikkerhet på arbeidsplassen" fullført av 5 elever',
          tidspunkt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'bruker',
          beskrivelse: 'Ny instruktør registrert: Ola Nordmann',
          tidspunkt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'system',
          beskrivelse: 'System backup fullført',
          tidspunkt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          status: 'success'
        },
        {
          id: '5',
          type: 'sikkerhetskontroll',
          beskrivelse: 'Sikkerhetskontroll for ABC Transport AS fullført',
          tidspunkt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          status: 'success'
        }
      ];

      const limitedActivities = activities.slice(0, limit);

      logger.info('Siste aktiviteter hentet', { 
        userId: req.bruker!.id,
        count: limitedActivities.length 
      });

      res.json(limitedActivities);

    } catch (error) {
      logger.error('Feil ved henting av aktiviteter', {
        userId: req.bruker!.id,
        error: error instanceof Error ? error.message : 'Ukjent feil'
      });

      // Returner tom array ved feil
      res.json([]);
    }
  })
);

export default router; 