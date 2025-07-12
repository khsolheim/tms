const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const PORT = 4001; // Different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Simple logger
const logger = {
  info: (message, ...args) => console.log('[INFO]', message, ...args),
  error: (message, ...args) => console.error('[ERROR]', message, ...args),
  warn: (message, ...args) => console.warn('[WARN]', message, ...args)
};

// =======================
// QUIZ API ROUTES
// =======================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Quiz API Test Server' });
});

// Get quiz categories
app.get('/api/quiz/kategorier', async (req, res) => {
  try {
    const kategorier = await prisma.quizKategori.findMany({
      where: { 
        isDeleted: false,
        aktiv: true 
      },
      include: {
        underkategorier: {
          where: { isDeleted: false }
        },
        hovedkategori: true,
        _count: {
          select: { sporsmal: true }
        }
      },
      orderBy: { navn: 'asc' }
    });

    res.json({
      success: true,
      data: kategorier.map(kategori => ({
        ...kategori,
        sporsmalCount: kategori._count.sporsmal
      }))
    });
  } catch (error) {
    logger.error('Feil ved henting av kategorier:', error);
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av kategorier',
      error: error.message
    });
  }
});

// Get quiz questions
app.get('/api/quiz/sporsmal', async (req, res) => {
  try {
    const { kategoriId, vanskelighetsgrad } = req.query;
    const where = { isDeleted: false };
    
    if (kategoriId) where.kategoriId = parseInt(kategoriId);
    if (vanskelighetsgrad) where.vanskelighetsgrad = vanskelighetsgrad;

    const sporsmal = await prisma.quizSporsmal.findMany({
      where,
      include: {
        kategori: true
      },
      orderBy: { opprettet: 'desc' }
    });

    res.json({
      success: true,
      data: sporsmal.map(s => ({
        ...s,
        svaralternativer: JSON.parse(s.svaralternativer || '[]'),
        klasser: JSON.parse(s.klasser || '[]'),
        mediaMetadata: s.mediaMetadata ? JSON.parse(s.mediaMetadata) : null
      }))
    });
  } catch (error) {
    logger.error('Feil ved henting av spørsmål:', error);
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av spørsmål',
      error: error.message
    });
  }
});

// Start quiz session
app.post('/api/quiz/sessions/start', async (req, res) => {
  try {
    const { userId, kategoriId, quizType, questionsTotal, difficulty } = req.body;
    
    // Generate session integrity hash
    const crypto = require('crypto');
    const integrityData = {
      userId,
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex')
    };
    const sessionIntegrity = crypto
      .createHash('sha256')
      .update(JSON.stringify(integrityData))
      .digest('hex');

    const session = await prisma.quizSession.create({
      data: {
        userId,
        kategoriId,
        quizType,
        questionsTotal,
        difficulty,
        sessionIntegrity,
        completed: false
      }
    });

    // Create session integrity record
    await prisma.sessionIntegrity.create({
      data: {
        sessionId: session.id,
        integrityHash: sessionIntegrity,
        checksumData: integrityData,
        validationPassed: true
      }
    });

    logger.info(`Quiz session startet: ${session.id} for bruker ${userId}`);
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Feil ved start av quiz session:', error);
    res.status(400).json({
      success: false,
      message: 'Feil ved start av quiz session',
      error: error.message
    });
  }
});

// Submit answer
app.post('/api/quiz/sessions/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, userAnswer, timeSpent, confidence } = req.body;

    // Verify session
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session ikke funnet'
      });
    }

    // Get question to validate
    const question = await prisma.quizSporsmal.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Spørsmål ikke funnet'
      });
    }

    const isCorrect = userAnswer === question.riktigSvar;

    const answer = await prisma.quizSessionAnswer.create({
      data: {
        sessionId,
        questionId,
        userAnswer,
        correctAnswer: question.riktigSvar,
        isCorrect,
        timeSpent,
        confidence
      }
    });

    // Log suspicious timing
    if (timeSpent < 2) {
      await prisma.securityEvent.create({
        data: {
          sessionId,
          userId: session.userId,
          eventType: 'SUSPICIOUS_TIMING',
          severity: 'MEDIUM',
          description: `Veldig rask svar: ${timeSpent}s`,
          metadata: { questionId, timeSpent },
          reviewStatus: 'pending'
        }
      });
    }

    logger.info(`Svar submittet for session ${sessionId}, spørsmål ${questionId}`);
    res.status(201).json({
      success: true,
      data: answer
    });
  } catch (error) {
    logger.error('Feil ved submitting av svar:', error);
    res.status(400).json({
      success: false,
      message: 'Feil ved submitting av svar',
      error: error.message
    });
  }
});

// Complete quiz session
app.post('/api/quiz/sessions/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Calculate results
    const answers = await prisma.quizSessionAnswer.findMany({
      where: { sessionId }
    });

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalAnswers = answers.length;
    const score = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const totalTimeSpent = answers.reduce((sum, a) => sum + a.timeSpent, 0);

    const session = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        endTime: new Date(),
        score,
        questionsAnswered: totalAnswers,
        questionsCorrect: correctAnswers,
        timeSpent: totalTimeSpent,
        percentage: score
      },
      include: {
        answers: {
          include: {
            question: true
          }
        },
        kategori: true
      }
    });

    // Award XP
    const xpGained = Math.floor(score);
    await prisma.quizXP.create({
      data: {
        userId: session.userId,
        sessionId: session.id,
        xpGained,
        xpType: 'quiz_completion',
        source: sessionId
      }
    });

    logger.info(`Quiz session fullført: ${sessionId}, score: ${score}%`);
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Feil ved fullføring av quiz session:', error);
    res.status(400).json({
      success: false,
      message: 'Feil ved fullføring av quiz session',
      error: error.message
    });
  }
});

// Get user analytics
app.get('/api/quiz/analytics/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const sessions = await prisma.quizSession.findMany({
      where: { 
        userId,
        completed: true 
      },
      include: {
        kategori: true,
        answers: true
      },
      orderBy: { startTime: 'desc' }
    });

    const totalSessions = sessions.length;
    const averageScore = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / sessions.length 
      : 0;

    const totalXP = await prisma.quizXP.aggregate({
      where: { userId },
      _sum: { xpGained: true }
    });

    const achievements = await prisma.userAchievement.findMany({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        totalSessions,
        averageScore,
        totalXP: totalXP._sum.xpGained || 0,
        achievements: achievements.length,
        recentSessions: sessions.slice(0, 10)
      }
    });
  } catch (error) {
    logger.error('Feil ved henting av analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Feil ved henting av analytics',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Quiz API Test Server running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🧩 Quiz kategorier: http://localhost:${PORT}/api/quiz/kategorier`);
  console.log(`❓ Quiz spørsmål: http://localhost:${PORT}/api/quiz/sporsmal`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Quiz API Test Server...');
  await prisma.$disconnect();
  process.exit(0);
});