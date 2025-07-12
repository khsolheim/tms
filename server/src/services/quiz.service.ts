import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple logger
const logger = {
  info: (message: string, ...args: any[]) => console.log('[INFO]', message, ...args),
  error: (message: string, ...args: any[]) => console.error('[ERROR]', message, ...args),
  warn: (message: string, ...args: any[]) => console.warn('[WARN]', message, ...args)
};

// Simple error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export interface CreateQuizKategoriData {
  navn: string;
  klasse: string;
  beskrivelse?: string;
  farge?: string;
  ikon?: string;
  hovedkategoriId?: number;
  moduleType?: string;
  estimatedDuration?: number;
}

export interface CreateQuizSporsmalData {
  tekst: string;
  svaralternativer: string[];
  riktigSvar: number;
  bildeUrl?: string;
  forklaring?: string;
  klasser: string[];
  kategoriId?: number;
  vanskelighetsgrad?: string;
  mediaType?: string;
  mediaUrl?: string;
  mediaMetadata?: any;
  estimertTid?: number;
}

export interface QuizSessionData {
  userId: number;
  kategoriId?: number;
  quizType: string;
  questionsTotal: number;
  difficulty: string;
}

export interface AnswerSubmission {
  sessionId: string;
  questionId: number;
  userAnswer: number;
  timeSpent: number;
  confidence?: number;
}

export interface QuizAnalyticsData {
  userId: number;
  sessionId?: string;
  timeSpent: number;
  score: number;
  questionsCorrect: number;
  questionsTotal: number;
  category?: string;
}

export class QuizService {
  
  // =======================
  // QUIZ KATEGORI MANAGEMENT
  // =======================
  
  async hentKategorier(): Promise<any[]> {
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

      return kategorier.map(kategori => ({
        ...kategori,
        // Parse JSON strings back to arrays for frontend compatibility
        sporsmalCount: kategori._count.sporsmal
      }));
    } catch (error) {
      logger.error('Feil ved henting av quiz kategorier:', error);
      throw new Error('Kunne ikke hente quiz kategorier');
    }
  }

  async opprettKategori(data: CreateQuizKategoriData): Promise<any> {
    try {
      const kategori = await prisma.quizKategori.create({
        data: {
          navn: data.navn,
          klasse: data.klasse,
          beskrivelse: data.beskrivelse,
          farge: data.farge || '#3B82F6',
          ikon: data.ikon,
          hovedkategoriId: data.hovedkategoriId,
          moduleType: data.moduleType || 'standard',
          estimatedDuration: data.estimatedDuration,
          aktiv: true
        },
        include: {
          hovedkategori: true,
          _count: {
            select: { sporsmal: true }
          }
        }
      });

      logger.info(`Quiz kategori opprettet: ${kategori.navn}`);
      return kategori;
    } catch (error) {
      logger.error('Feil ved opprettelse av quiz kategori:', error);
      throw new ValidationError('Kunne ikke opprette quiz kategori');
    }
  }

  // =======================
  // QUIZ SPØRSMÅL MANAGEMENT
  // =======================
  
  async hentSporsmal(kategoriId?: number, vanskelighetsgrad?: string): Promise<any[]> {
    try {
      const where: any = { isDeleted: false };
      if (kategoriId) where.kategoriId = kategoriId;
      if (vanskelighetsgrad) where.vanskelighetsgrad = vanskelighetsgrad;

      const sporsmal = await prisma.quizSporsmal.findMany({
        where,
        include: {
          kategori: true
        },
        orderBy: { opprettet: 'desc' }
      });

      return sporsmal.map(s => ({
        ...s,
        // Parse JSON strings back to arrays
        svaralternativer: JSON.parse(s.svaralternativer || '[]'),
        klasser: JSON.parse(s.klasser || '[]'),
        mediaMetadata: s.mediaMetadata ? JSON.parse(s.mediaMetadata as string) : null
      }));
    } catch (error) {
      logger.error('Feil ved henting av quiz spørsmål:', error);
      throw new Error('Kunne ikke hente quiz spørsmål');
    }
  }

  async opprettSporsmal(data: CreateQuizSporsmalData): Promise<any> {
    try {
      const sporsmal = await prisma.quizSporsmal.create({
        data: {
          tekst: data.tekst,
          svaralternativer: JSON.stringify(data.svaralternativer),
          riktigSvar: data.riktigSvar,
          bildeUrl: data.bildeUrl,
          forklaring: data.forklaring,
          klasser: JSON.stringify(data.klasser),
          kategoriId: data.kategoriId,
          vanskelighetsgrad: data.vanskelighetsgrad || 'Middels',
          mediaType: data.mediaType,
          mediaUrl: data.mediaUrl,
          mediaMetadata: data.mediaMetadata ? JSON.stringify(data.mediaMetadata) : undefined,
          estimertTid: data.estimertTid,
          aiGenerated: false
        },
        include: {
          kategori: true
        }
      });

      logger.info(`Quiz spørsmål opprettet: ${sporsmal.id}`);
      return {
        ...sporsmal,
        svaralternativer: JSON.parse(sporsmal.svaralternativer),
        klasser: JSON.parse(sporsmal.klasser)
      };
    } catch (error) {
      logger.error('Feil ved opprettelse av quiz spørsmål:', error);
      throw new ValidationError('Kunne ikke opprette quiz spørsmål');
    }
  }

  // =======================
  // QUIZ SESSION MANAGEMENT
  // =======================

  async startQuizSession(data: QuizSessionData): Promise<any> {
    try {
      // Generate session integrity hash
      const integrityData = {
        userId: data.userId,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
      };
      const sessionIntegrity = crypto
        .createHash('sha256')
        .update(JSON.stringify(integrityData))
        .digest('hex');

      const session = await prisma.quizSession.create({
        data: {
          userId: data.userId,
          kategoriId: data.kategoriId,
          quizType: data.quizType,
          questionsTotal: data.questionsTotal,
          difficulty: data.difficulty,
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

      logger.info(`Quiz session startet: ${session.id} for bruker ${data.userId}`);
      return session;
    } catch (error) {
      logger.error('Feil ved start av quiz session:', error);
      throw new Error('Kunne ikke starte quiz session');
    }
  }

  async submitAnswer(data: AnswerSubmission): Promise<any> {
    try {
      // Verify session integrity
      const session = await prisma.quizSession.findUnique({
        where: { id: data.sessionId }
      });

      if (!session) {
        throw new NotFoundError('Quiz session ikke funnet');
      }

      // Get the question to validate answer
      const question = await prisma.quizSporsmal.findUnique({
        where: { id: data.questionId }
      });

      if (!question) {
        throw new NotFoundError('Spørsmål ikke funnet');
      }

      const isCorrect = data.userAnswer === question.riktigSvar;

      const answer = await prisma.quizSessionAnswer.create({
        data: {
          sessionId: data.sessionId,
          questionId: data.questionId,
          userAnswer: data.userAnswer,
          correctAnswer: question.riktigSvar,
          isCorrect,
          timeSpent: data.timeSpent,
          confidence: data.confidence
        }
      });

      // Check for suspicious timing
      if (data.timeSpent < 2) {
        await this.logSecurityEvent({
          sessionId: data.sessionId,
          userId: session.userId,
          eventType: 'SUSPICIOUS_TIMING',
          severity: 'MEDIUM',
          description: `Veldig rask svar: ${data.timeSpent}s`,
          metadata: { questionId: data.questionId, timeSpent: data.timeSpent }
        });
      }

      logger.info(`Svar submittet for session ${data.sessionId}, spørsmål ${data.questionId}`);
      return answer;
    } catch (error) {
      logger.error('Feil ved submitting av svar:', error);
      throw error;
    }
  }

  async completeQuizSession(sessionId: string): Promise<any> {
    try {
      // Calculate session results
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
      await this.awardXP({
        userId: session.userId,
        sessionId: session.id,
        xpGained: this.calculateXP(score, session.quizType),
        xpType: 'quiz_completion',
        source: sessionId
      });

      logger.info(`Quiz session fullført: ${sessionId}, score: ${score}%`);
      return session;
    } catch (error) {
      logger.error('Feil ved fullføring av quiz session:', error);
      throw error;
    }
  }

  // =======================
  // GAMIFICATION SYSTEM
  // =======================

  async awardXP(data: {
    userId: number;
    sessionId?: string;
    xpGained: number;
    xpType: string;
    source?: string;
  }): Promise<any> {
    try {
      const xp = await prisma.quizXP.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          xpGained: data.xpGained,
          xpType: data.xpType,
          source: data.source
        }
      });

      // Check for achievements
      await this.checkAchievements(data.userId);

      logger.info(`XP tildelt: ${data.xpGained} til bruker ${data.userId}`);
      return xp;
    } catch (error) {
      logger.error('Feil ved tildeling av XP:', error);
      throw error;
    }
  }

  async checkAchievements(userId: number): Promise<void> {
    try {
      // Get user's total XP
      const totalXP = await prisma.quizXP.aggregate({
        where: { userId },
        _sum: { xpGained: true }
      });

      const userXP = totalXP._sum.xpGained || 0;

      // Check for XP milestones
      const xpMilestones = [
        { threshold: 100, achievementId: 'first_steps', name: 'Første skritt' },
        { threshold: 500, achievementId: 'getting_started', name: 'Kom i gang' },
        { threshold: 1000, achievementId: 'quiz_enthusiast', name: 'Quiz-entusiast' },
        { threshold: 5000, achievementId: 'quiz_master', name: 'Quiz-mester' }
      ];

      for (const milestone of xpMilestones) {
        if (userXP >= milestone.threshold) {
          await this.unlockAchievement(userId, milestone.achievementId, milestone.name);
        }
      }

      // Check for perfect scores
      const perfectSessions = await prisma.quizSession.count({
        where: {
          userId,
          percentage: 100,
          completed: true
        }
      });

      if (perfectSessions >= 5) {
        await this.unlockAchievement(userId, 'perfectionist', 'Perfeksjonist');
      }

    } catch (error) {
      logger.error('Feil ved sjekking av achievements:', error);
    }
  }

  async unlockAchievement(userId: number, achievementId: string, name: string): Promise<void> {
    try {
      // Check if already unlocked
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        }
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId,
            progress: 100,
            metadata: { name }
          }
        });

        // Award bonus XP for achievement
        await this.awardXP({
          userId,
          xpGained: 50,
          xpType: 'achievement',
          source: achievementId
        });

        logger.info(`Achievement ulåst: ${achievementId} for bruker ${userId}`);
      }
    } catch (error) {
      logger.error('Feil ved ulåsing av achievement:', error);
    }
  }

  // =======================
  // ADAPTIVE LEARNING
  // =======================

  async adjustDifficulty(userId: number, kategoriId: number, performance: number): Promise<void> {
    try {
      // Get current difficulty preference
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      const currentDifficulty = preferences?.preferredDifficulty || 'Middels';
      let newDifficulty = currentDifficulty;

      // Adjust based on performance
      if (performance >= 90 && currentDifficulty !== 'Vanskelig') {
        newDifficulty = currentDifficulty === 'Lett' ? 'Middels' : 'Vanskelig';
      } else if (performance <= 60 && currentDifficulty !== 'Lett') {
        newDifficulty = currentDifficulty === 'Vanskelig' ? 'Middels' : 'Lett';
      }

      if (newDifficulty !== currentDifficulty) {
        // Update user preferences
        await prisma.userPreferences.upsert({
          where: { userId },
          create: { 
            userId, 
            preferredDifficulty: newDifficulty,
            learningStyle: 'MIXED'
          },
          update: { preferredDifficulty: newDifficulty }
        });

        // Log the adjustment
        await prisma.difficultyAdjustment.create({
          data: {
            userId,
            kategoriId,
            fromDifficulty: currentDifficulty,
            toDifficulty: newDifficulty,
            reason: 'performance_based',
            confidence: this.calculateConfidence(performance),
            performanceData: { performance, sessions: 1 }
          }
        });

        logger.info(`Vanskelighetsgrad justert for bruker ${userId}: ${currentDifficulty} -> ${newDifficulty}`);
      }
    } catch (error) {
      logger.error('Feil ved justering av vanskelighetsgrad:', error);
    }
  }

  // =======================
  // SECURITY & ANTI-CHEAT
  // =======================

  async logSecurityEvent(data: {
    sessionId?: string;
    userId: number;
    eventType: string;
    severity: string;
    description: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
          eventType: data.eventType,
          severity: data.severity,
          description: data.description,
          metadata: data.metadata || {},
          reviewStatus: 'pending'
        }
      });

      // Auto-action for high severity events
      if (data.severity === 'HIGH' || data.severity === 'CRITICAL') {
        logger.warn(`Høy alvorlighetsgrad security event: ${data.description} for bruker ${data.userId}`);
      }
    } catch (error) {
      logger.error('Feil ved logging av security event:', error);
    }
  }

  async validateSessionIntegrity(sessionId: string): Promise<boolean> {
    try {
      const integrity = await prisma.sessionIntegrity.findUnique({
        where: { sessionId }
      });

      if (!integrity) {
        await this.logSecurityEvent({
          sessionId,
          userId: 0, // Unknown user for missing sessions
          eventType: 'MISSING_INTEGRITY',
          severity: 'HIGH',
          description: 'Session integrity record mangler'
        });
        return false;
      }

      return integrity.validationPassed;
    } catch (error) {
      logger.error('Feil ved validering av session integrity:', error);
      return false;
    }
  }

  // =======================
  // ANALYTICS & RECOMMENDATIONS
  // =======================

  async getUserAnalytics(userId: number): Promise<any> {
    try {
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

      const categoryPerformance = sessions.reduce((acc, session) => {
        if (session.kategori) {
          const categoryName = session.kategori.navn;
          if (!acc[categoryName]) {
            acc[categoryName] = { sessions: 0, totalScore: 0 };
          }
          acc[categoryName].sessions++;
          acc[categoryName].totalScore += session.percentage || 0;
        }
        return acc;
      }, {} as any);

      Object.keys(categoryPerformance).forEach(category => {
        const data = categoryPerformance[category];
        data.averageScore = data.totalScore / data.sessions;
      });

      const totalXP = await prisma.quizXP.aggregate({
        where: { userId },
        _sum: { xpGained: true }
      });

      const achievements = await prisma.userAchievement.findMany({
        where: { userId }
      });

      return {
        totalSessions,
        averageScore,
        totalXP: totalXP._sum.xpGained || 0,
        achievements: achievements.length,
        categoryPerformance,
        recentSessions: sessions.slice(0, 10),
        improvementTrend: this.calculateImprovementTrend(sessions)
      };
    } catch (error) {
      logger.error('Feil ved henting av bruker analytics:', error);
      throw error;
    }
  }

  async generateRecommendations(userId: number): Promise<any[]> {
    try {
      // Get user's performance data
      const analytics = await this.getUserAnalytics(userId);
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      const recommendations = [];

      // Recommend based on weak categories
      if (analytics.categoryPerformance) {
        const weakCategories = Object.entries(analytics.categoryPerformance)
          .filter(([_, data]: [string, any]) => data.averageScore < 70)
          .map(([category]) => category);

        for (const category of weakCategories.slice(0, 3)) {
          const categoryData = await prisma.quizKategori.findFirst({
            where: { navn: category }
          });

          if (categoryData) {
            const questions = await prisma.quizSporsmal.findMany({
              where: {
                kategoriId: categoryData.id,
                vanskelighetsgrad: preferences?.preferredDifficulty || 'Middels'
              },
              take: 10
            });

            if (questions.length > 0) {
              const recommendation = await prisma.quizRecommendation.create({
                data: {
                  userId,
                  kategoriId: categoryData.id,
                  questionIds: JSON.stringify(questions.map(q => q.id)),
                  reason: `Forbedring i ${category} (gjennomsnitt: ${analytics.categoryPerformance[category].averageScore.toFixed(1)}%)`,
                  priority: 5,
                  confidence: 0.8,
                  metadata: { 
                    weakCategory: true, 
                    currentScore: analytics.categoryPerformance[category].averageScore 
                  }
                }
              });

              recommendations.push({
                ...recommendation,
                questionIds: JSON.parse(recommendation.questionIds),
                category: categoryData
              });
            }
          }
        }
      }

      logger.info(`Generert ${recommendations.length} anbefalinger for bruker ${userId}`);
      return recommendations;
    } catch (error) {
      logger.error('Feil ved generering av anbefalinger:', error);
      return [];
    }
  }

  // =======================
  // HELPER METHODS
  // =======================

  private calculateXP(score: number, quizType: string): number {
    let baseXP = Math.floor(score);
    
    // Bonus for quiz type
    switch (quizType) {
      case 'adaptive': baseXP *= 1.2; break;
      case 'collaborative': baseXP *= 1.1; break;
      default: break;
    }

    // Bonus for perfect score
    if (score === 100) baseXP += 50;

    return Math.floor(baseXP);
  }

  private calculateConfidence(performance: number): number {
    // Higher performance = higher confidence in adjustment
    return Math.min(0.9, performance / 100 + 0.1);
  }

  private calculateImprovementTrend(sessions: any[]): number {
    if (sessions.length < 2) return 0;

    const recent = sessions.slice(0, 5);
    const older = sessions.slice(5, 10);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, s) => sum + (s.percentage || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.percentage || 0), 0) / older.length;

    return recentAvg - olderAvg;
  }
}

export default new QuizService();