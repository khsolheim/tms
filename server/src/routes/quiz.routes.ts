import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import quizService from '../services/quiz.service';

const router = Router();
const prisma = new PrismaClient();

// =======================
// QUIZ KATEGORI ROUTES
// =======================

/**
 * @swagger
 * /api/quiz/kategorier:
 *   get:
 *     summary: Hent alle quiz kategorier
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Liste over quiz kategorier
 */
router.get('/kategorier', async (req, res) => {
  try {
    const kategorier = await quizService.hentKategorier();
    res.json({
      success: true,
      data: kategorier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av kategorier',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/kategorier:
 *   post:
 *     summary: Opprett ny quiz kategori
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - navn
 *               - klasse
 *             properties:
 *               navn:
 *                 type: string
 *               klasse:
 *                 type: string
 *               beskrivelse:
 *                 type: string
 *               farge:
 *                 type: string
 *               ikon:
 *                 type: string
 *               moduleType:
 *                 type: string
 *               estimatedDuration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Kategori opprettet
 */
router.post('/kategorier', async (req, res) => {
  try {
    const kategori = await quizService.opprettKategori(req.body);
    res.status(201).json({
      success: true,
      data: kategori
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Feil ved opprettelse av kategori',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// =======================
// QUIZ SPØRSMÅL ROUTES
// =======================

/**
 * @swagger
 * /api/quiz/sporsmal:
 *   get:
 *     summary: Hent quiz spørsmål
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: kategoriId
 *         schema:
 *           type: integer
 *         description: Filter by kategori ID
 *       - in: query
 *         name: vanskelighetsgrad
 *         schema:
 *           type: string
 *           enum: [Lett, Middels, Vanskelig]
 *         description: Filter by difficulty
 *     responses:
 *       200:
 *         description: Liste over spørsmål
 */
router.get('/sporsmal', async (req, res) => {
  try {
    const { kategoriId, vanskelighetsgrad } = req.query;
    const sporsmal = await quizService.hentSporsmal(
      kategoriId ? parseInt(kategoriId as string) : undefined,
      vanskelighetsgrad as string
    );
    res.json({
      success: true,
      data: sporsmal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av spørsmål',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/sporsmal:
 *   post:
 *     summary: Opprett nytt quiz spørsmål
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tekst
 *               - svaralternativer
 *               - riktigSvar
 *               - klasser
 *             properties:
 *               tekst:
 *                 type: string
 *               svaralternativer:
 *                 type: array
 *                 items:
 *                   type: string
 *               riktigSvar:
 *                 type: number
 *               klasser:
 *                 type: array
 *                 items:
 *                   type: string
 *               kategoriId:
 *                 type: number
 *               vanskelighetsgrad:
 *                 type: string
 *               mediaType:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Spørsmål opprettet
 */
router.post('/sporsmal', async (req, res) => {
  try {
    const sporsmal = await quizService.opprettSporsmal(req.body);
    res.status(201).json({
      success: true,
      data: sporsmal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Feil ved opprettelse av spørsmål',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// =======================
// QUIZ SESSION ROUTES
// =======================

/**
 * @swagger
 * /api/quiz/sessions/start:
 *   post:
 *     summary: Start en quiz session
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - quizType
 *               - questionsTotal
 *               - difficulty
 *             properties:
 *               userId:
 *                 type: number
 *               kategoriId:
 *                 type: number
 *               quizType:
 *                 type: string
 *               questionsTotal:
 *                 type: number
 *               difficulty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz session startet
 */
router.post('/sessions/start', async (req, res) => {
  try {
    const session = await quizService.startQuizSession(req.body);
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Feil ved start av quiz session',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/sessions/{sessionId}/answer:
 *   post:
 *     summary: Submit svar for quiz session
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - userAnswer
 *               - timeSpent
 *             properties:
 *               questionId:
 *                 type: number
 *               userAnswer:
 *                 type: number
 *               timeSpent:
 *                 type: number
 *               confidence:
 *                 type: number
 *     responses:
 *       201:
 *         description: Svar submittet
 */
router.post('/sessions/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const answerData = { ...req.body, sessionId };
    const answer = await quizService.submitAnswer(answerData);
    res.status(201).json({
      success: true,
      data: answer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Feil ved submitting av svar',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/sessions/{sessionId}/complete:
 *   post:
 *     summary: Fullfør quiz session
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz session fullført
 */
router.post('/sessions/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await quizService.completeQuizSession(sessionId);
    
    // Trigger adaptive difficulty adjustment
    if (session.kategoriId && session.percentage !== null) {
      await quizService.adjustDifficulty(
        session.userId, 
        session.kategoriId, 
        session.percentage
      );
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Feil ved fullføring av quiz session',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// =======================
// ANALYTICS ROUTES
// =======================

/**
 * @swagger
 * /api/quiz/analytics/{userId}:
 *   get:
 *     summary: Hent bruker analytics
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Bruker analytics data
 */
router.get('/analytics/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const analytics = await quizService.getUserAnalytics(userId);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av analytics',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/recommendations/{userId}:
 *   get:
 *     summary: Hent quiz anbefalinger for bruker
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Quiz anbefalinger
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const recommendations = await quizService.generateRecommendations(userId);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved generering av anbefalinger',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// =======================
// GAMIFICATION ROUTES
// =======================

/**
 * @swagger
 * /api/quiz/achievements/{userId}:
 *   get:
 *     summary: Hent bruker achievements
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Bruker achievements
 */
router.get('/achievements/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const achievements = await prisma.userAchievement.findMany({
      where: { userId }
    });
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av achievements',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/xp/{userId}:
 *   get:
 *     summary: Hent bruker XP
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Bruker XP data
 */
router.get('/xp/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const xpData = await prisma.quizXP.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' }
    });
    
    const totalXP = await prisma.quizXP.aggregate({
      where: { userId },
      _sum: { xpGained: true }
    });
    
    res.json({
      success: true,
      data: {
        totalXP: totalXP._sum.xpGained || 0,
        xpHistory: xpData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av XP data',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @swagger
 * /api/quiz/leaderboard:
 *   get:
 *     summary: Hent leaderboard
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, all_time]
 *         description: Leaderboard type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'weekly', category } = req.query;
    
    // Generate current period identifier
    const now = new Date();
    let period: string;
    
    switch (type) {
      case 'daily':
        period = now.toISOString().split('T')[0];
        break;
      case 'weekly':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        period = startOfWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        period = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        period = 'all_time';
    }
    
    // Try to get existing leaderboard
    let leaderboard = await prisma.leaderboard.findFirst({
      where: {
        type: type as string,
        category: category as string || null,
        period
      }
    });
    
    // Generate leaderboard if not exists or outdated
    if (!leaderboard || new Date(leaderboard.updatedAt) < new Date(Date.now() - 3600000)) {
      const rankings = await generateLeaderboardRankings(type as string, category as string, period);
      
             if (leaderboard) {
         leaderboard = await prisma.leaderboard.update({
           where: { id: leaderboard.id },
           data: {
             rankings,
             updatedAt: new Date()
           }
         });
       } else {
         leaderboard = await prisma.leaderboard.create({
           data: {
             name: `${type} leaderboard`,
             type: type as string,
             category: category as string,
             period,
             rankings
           }
         });
       }
    }
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av leaderboard',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// =======================
// SECURITY ROUTES
// =======================

/**
 * @swagger
 * /api/quiz/security/events:
 *   get:
 *     summary: Hent security events (admin only)
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Security events
 */
router.get('/security/events', async (req, res) => {
  try {
    const { severity, userId } = req.query;
    const where: any = {};
    
    if (severity) where.severity = severity;
    if (userId) where.userId = parseInt(userId as string);
    
    const events = await prisma.securityEvent.findMany({
      where,
      include: {
        user: {
          select: { fornavn: true, etternavn: true, epost: true }
        }
      },
      orderBy: { detectedAt: 'desc' },
      take: 100
    });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av security events',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// =======================
// HELPER FUNCTIONS
// =======================

async function generateLeaderboardRankings(type: string, category: string, period: string) {
  let dateFilter: any = {};
  
  if (type !== 'all_time') {
    const now = new Date();
    switch (type) {
      case 'daily':
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        dateFilter = { earnedAt: { gte: startOfDay, lte: endOfDay } };
        break;
      case 'weekly':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        dateFilter = { earnedAt: { gte: startOfWeek, lte: endOfWeek } };
        break;
      case 'monthly':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        dateFilter = { earnedAt: { gte: startOfMonth, lte: endOfMonth } };
        break;
    }
  }
  
  // Get top users by XP
  const userXP = await prisma.quizXP.groupBy({
    by: ['userId'],
    where: dateFilter,
    _sum: { xpGained: true },
    orderBy: { _sum: { xpGained: 'desc' } },
    take: 50
  });
  
  const rankings = [];
  
  for (let i = 0; i < userXP.length; i++) {
    const userXPData = userXP[i];
    const user = await prisma.ansatt.findUnique({
      where: { id: userXPData.userId },
      select: { fornavn: true, etternavn: true, epost: true }
    });
    
    if (user) {
      rankings.push({
        rank: i + 1,
        userId: userXPData.userId,
        userName: `${user.fornavn} ${user.etternavn}`,
        totalXP: userXPData._sum.xpGained || 0
      });
    }
  }
  
  return rankings;
}

export default router;