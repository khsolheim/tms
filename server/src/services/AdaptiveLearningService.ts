import { PrismaClient } from '@prisma/client';
import { cacheService } from './CacheService';

// Types for adaptive learning
export interface UserPerformance {
  userId: number;
  contentId: string;
  result: boolean;
  timeSpent: number;
  difficulty: number;
  sessionId: string;
}

export interface KnowledgeUpdate {
  topicId: number;
  masteryLevel: number;
  confidence: number;
}

export interface RiskAssessment {
  userId: number;
  dropoutProbability: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  recommendedInterventions: Intervention[];
  confidenceScore: number;
}

export interface Intervention {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  message: string;
}

export interface ContentRecommendation {
  contentId: string;
  difficulty: number;
  reason: string;
  confidence: number;
}

export class AdaptiveLearningService {
  constructor(private prisma: PrismaClient) {}

  // Bayesian Knowledge Tracing implementation
  async updateKnowledgeState(
    userId: number,
    topicId: number,
    performance: UserPerformance
  ): Promise<KnowledgeUpdate> {
    try {
      // Get current knowledge state
      let knowledgeState = await this.prisma.userKnowledgeState.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId
          }
        }
      });

      // Initialize if doesn't exist
      if (!knowledgeState) {
        knowledgeState = await this.prisma.userKnowledgeState.create({
          data: {
            userId,
            topicId,
            masteryLevel: 0.1, // Start with low mastery
            confidence: 0.1,
            attempts: 0,
            correctAttempts: 0
          }
        });
      }

      // Bayesian Knowledge Tracing parameters
      const pInit = 0.1;      // Initial probability of knowing the skill
      const pTransit = 0.1;   // Probability of learning (transitioning from not knowing to knowing)
      const pSlip = 0.1;      // Probability of slipping (knowing but getting wrong)
      const pGuess = 0.25;    // Probability of guessing correctly

      // Current probability of knowing the skill
      let pKnow = knowledgeState.masteryLevel;

      // Update based on performance
      if (performance.result) {
        // Correct answer - increase probability
        pKnow = (pKnow * (1 - pSlip)) / (pKnow * (1 - pSlip) + (1 - pKnow) * pGuess);
      } else {
        // Incorrect answer - decrease probability  
        pKnow = (pKnow * pSlip) / (pKnow * pSlip + (1 - pKnow) * (1 - pGuess));
      }

      // Apply learning transition
      pKnow = pKnow + (1 - pKnow) * pTransit;

      // Update confidence based on number of attempts and consistency
      const newAttempts = knowledgeState.attempts + 1;
      const newCorrectAttempts = knowledgeState.correctAttempts + (performance.result ? 1 : 0);
      const accuracy = newCorrectAttempts / newAttempts;
      
      // Confidence increases with consistent performance
      const consistencyFactor = Math.min(newAttempts / 10, 1); // Max confidence after 10 attempts
      const confidenceFromAccuracy = Math.abs(accuracy - 0.5) * 2; // Higher confidence when far from 50%
      const newConfidence = Math.min(consistencyFactor * confidenceFromAccuracy, 1);

      // Update knowledge state
      const updatedState = await this.prisma.userKnowledgeState.update({
        where: { id: knowledgeState.id },
        data: {
          masteryLevel: Math.max(0, Math.min(1, pKnow)),
          confidence: Math.max(0, Math.min(1, newConfidence)),
          attempts: newAttempts,
          correctAttempts: newCorrectAttempts,
          lastUpdated: new Date()
        }
      });

      // Log learning event
      await this.logLearningEvent({
        userId,
        eventType: 'knowledge_update',
        contentId: performance.contentId,
        performanceData: {
          previousMastery: knowledgeState.masteryLevel,
          newMastery: updatedState.masteryLevel,
          result: performance.result,
          timeSpent: performance.timeSpent
        },
        sessionId: performance.sessionId,
        difficulty: performance.difficulty,
        timeSpent: performance.timeSpent,
        result: performance.result
      });

      // Invalidate related caches
      await cacheService.invalidateByTags([`user:${userId}:knowledge`, `topic:${topicId}`]);

      return {
        topicId,
        masteryLevel: updatedState.masteryLevel,
        confidence: updatedState.confidence
      };

    } catch (error) {
      console.error('Error updating knowledge state:', error);
      throw new Error('Failed to update knowledge state');
    }
  }

  // Content recommendation based on knowledge state
  async recommendContent(
    userId: number,
    currentTopic?: number,
    numRecommendations: number = 5
  ): Promise<ContentRecommendation[]> {
    try {
      const cacheKey = `recommendations:${userId}:${currentTopic || 'all'}:${numRecommendations}`;
      
      return cacheService.cacheQueryResult(
        cacheKey,
        async () => {
          // Get user's knowledge states
          const knowledgeStates = await this.prisma.userKnowledgeState.findMany({
            where: { userId },
            orderBy: { lastUpdated: 'desc' }
          });

          const recommendations: ContentRecommendation[] = [];

          // If no knowledge state exists, recommend beginner content
          if (knowledgeStates.length === 0) {
            return [
              {
                contentId: 'basic_introduction',
                difficulty: 0.1,
                reason: 'Starting with fundamentals for new learner',
                confidence: 0.9
              }
            ];
          }

          // Find topics that need reinforcement (low mastery but some attempts)
          const reinforcementTopics = knowledgeStates.filter(
            state => state.masteryLevel < 0.7 && state.attempts > 2
          );

          for (const topic of reinforcementTopics.slice(0, 2)) {
            // Recommend slightly easier content for reinforcement
            const difficulty = Math.max(0.1, topic.masteryLevel - 0.2);
            recommendations.push({
              contentId: `topic_${topic.topicId}_reinforcement`,
              difficulty,
              reason: `Reinforcing knowledge in topic ${topic.topicId}`,
              confidence: topic.confidence
            });
          }

          // Find next logical progression (topics with good mastery)
          const masteredTopics = knowledgeStates.filter(
            state => state.masteryLevel > 0.8
          );

          if (masteredTopics.length > 0) {
            // Recommend slightly more challenging content
            const bestMastery = Math.max(...masteredTopics.map(t => t.masteryLevel));
            const difficulty = Math.min(0.9, bestMastery + 0.2);
            
            recommendations.push({
              contentId: 'advanced_topic',
              difficulty,
              reason: 'Ready for more challenging content',
              confidence: 0.8
            });
          }

          // Fill remaining slots with adaptive difficulty content
          while (recommendations.length < numRecommendations) {
            const avgMastery = knowledgeStates.reduce((sum, state) => 
              sum + state.masteryLevel, 0) / knowledgeStates.length;
            
            recommendations.push({
              contentId: `adaptive_content_${recommendations.length}`,
              difficulty: Math.max(0.1, Math.min(0.9, avgMastery)),
              reason: 'Adaptive difficulty based on overall performance',
              confidence: 0.6
            });
          }

          return recommendations;
        },
        600, // 10 minute cache
        [`user:${userId}:recommendations`]
      );

    } catch (error) {
      console.error('Error generating content recommendations:', error);
      return [];
    }
  }

  // Risk assessment for dropout prediction
  async assessUserRisk(userId: number): Promise<RiskAssessment> {
    try {
      const cacheKey = `risk:assessment:${userId}`;
      
      return cacheService.cacheQueryResult(
        cacheKey,
        async () => {
          // Get recent learning events (last 30 days)
          const recentEvents = await this.prisma.learningEvent.findMany({
            where: {
              userId,
              timestamp: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            },
            orderBy: { timestamp: 'desc' },
            take: 100
          });

          // Get knowledge states
          const knowledgeStates = await this.prisma.userKnowledgeState.findMany({
            where: { userId }
          });

          // Calculate risk factors
          const riskFactors = this.calculateRiskFactors(recentEvents, knowledgeStates);
          
          // Simple dropout probability calculation (in production, use ML model)
          const dropoutProbability = this.calculateDropoutProbability(riskFactors);
          
          // Determine performance trend
          const performanceTrend = this.analyzePerformanceTrend(recentEvents);
          
          // Generate interventions based on risk level
          const interventions = this.generateInterventions(dropoutProbability, riskFactors);
          
          // Calculate confidence in assessment
          const confidenceScore = Math.min(recentEvents.length / 20, 1); // More confidence with more data

          const assessment: RiskAssessment = {
            userId,
            dropoutProbability,
            performanceTrend,
            recommendedInterventions: interventions,
            confidenceScore
          };

          // Store assessment in database
          await this.prisma.userRiskAssessment.create({
            data: {
              userId,
              dropoutProbability,
              performanceTrend,
              confidenceScore,
              riskFactors: riskFactors as any,
              interventionsRecommended: interventions as any,
              modelVersion: '1.0'
            }
          });

          return assessment;
        },
        1800, // 30 minute cache
        [`user:${userId}:risk`]
      );

    } catch (error) {
      console.error('Error assessing user risk:', error);
      throw new Error('Failed to assess user risk');
    }
  }

  // Generate personalized learning pathway
  async generateLearningPathway(
    userId: number,
    goalId: string
  ): Promise<string[]> {
    try {
      // Get user's current knowledge state
      const knowledgeStates = await this.prisma.userKnowledgeState.findMany({
        where: { userId }
      });

      // Simple pathway generation (in production, use more sophisticated algorithm)
      const pathway: string[] = [];
      
      // Start with topics where mastery is low
      const weakTopics = knowledgeStates
        .filter(state => state.masteryLevel < 0.6)
        .sort((a, b) => a.masteryLevel - b.masteryLevel)
        .slice(0, 5)
        .map(state => `topic_${state.topicId}`);
      
      pathway.push(...weakTopics);

      // Add progression topics
      const strongTopics = knowledgeStates
        .filter(state => state.masteryLevel > 0.8)
        .map(state => `advanced_topic_${state.topicId}`);
      
      pathway.push(...strongTopics);

      // Store pathway
      const existingPathway = await this.prisma.learningPathway.findFirst({
        where: { userId, goalId }
      });

      if (existingPathway) {
        await this.prisma.learningPathway.update({
          where: { id: existingPathway.id },
          data: {
            moduleSequence: pathway as any,
            updatedAt: new Date()
          }
        });
      } else {
        await this.prisma.learningPathway.create({
          data: {
            userId,
            goalId,
            moduleSequence: pathway as any,
            currentPosition: 0
          }
        });
      }

      return pathway;

    } catch (error) {
      console.error('Error generating learning pathway:', error);
      return [];
    }
  }

  // Helper methods
  private async logLearningEvent(event: {
    userId: number;
    eventType: string;
    contentId: string;
    performanceData: any;
    sessionId: string;
    difficulty: number;
    timeSpent: number;
    result: boolean;
  }): Promise<void> {
    try {
      await this.prisma.learningEvent.create({
        data: {
          userId: event.userId,
          eventType: event.eventType,
          contentId: event.contentId,
          performanceData: event.performanceData as any,
          sessionId: event.sessionId,
          difficulty: event.difficulty,
          timeSpent: event.timeSpent,
          result: event.result,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging learning event:', error);
    }
  }

  private calculateRiskFactors(events: any[], knowledgeStates: any[]): any {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Days since last activity
    const lastActivity = events.length > 0 ? new Date(events[0].timestamp).getTime() : 0;
    const daysSinceLastActivity = (now - lastActivity) / dayMs;

    // Average session length
    const sessionLengths = events.map(e => e.timeSpent || 0).filter(t => t > 0);
    const avgSessionLength = sessionLengths.length > 0 
      ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length 
      : 0;

    // Success rate
    const attempts = events.filter(e => e.result !== null);
    const successRate = attempts.length > 0 
      ? attempts.filter(e => e.result).length / attempts.length 
      : 0;

    // Average mastery level
    const avgMastery = knowledgeStates.length > 0
      ? knowledgeStates.reduce((sum, state) => sum + state.masteryLevel, 0) / knowledgeStates.length
      : 0;

    return {
      daysSinceLastActivity,
      avgSessionLength,
      successRate,
      avgMastery,
      totalEvents: events.length,
      knowledgeStateCount: knowledgeStates.length
    };
  }

  private calculateDropoutProbability(riskFactors: any): number {
    let risk = 0;

    // Inactivity risk
    if (riskFactors.daysSinceLastActivity > 7) risk += 0.3;
    else if (riskFactors.daysSinceLastActivity > 3) risk += 0.1;

    // Performance risk
    if (riskFactors.successRate < 0.3) risk += 0.4;
    else if (riskFactors.successRate < 0.5) risk += 0.2;

    // Engagement risk
    if (riskFactors.avgSessionLength < 300) risk += 0.2; // Less than 5 minutes
    if (riskFactors.totalEvents < 5) risk += 0.1;

    // Mastery risk
    if (riskFactors.avgMastery < 0.3) risk += 0.2;

    return Math.min(1, risk);
  }

  private analyzePerformanceTrend(events: any[]): 'improving' | 'stable' | 'declining' {
    if (events.length < 5) return 'stable';

    const recentEvents = events.slice(0, 10);
    const olderEvents = events.slice(10, 20);

    const recentSuccess = recentEvents.filter(e => e.result).length / recentEvents.length;
    const olderSuccess = olderEvents.length > 0 
      ? olderEvents.filter(e => e.result).length / olderEvents.length 
      : recentSuccess;

    const improvement = recentSuccess - olderSuccess;

    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
  }

  private generateInterventions(
    dropoutProbability: number, 
    riskFactors: any
  ): Intervention[] {
    const interventions: Intervention[] = [];

    if (dropoutProbability > 0.7) {
      interventions.push({
        type: 'immediate_support',
        priority: 'urgent',
        action: 'personal_mentor_assignment',
        message: 'User shows high dropout risk - assign personal mentor immediately'
      });
    }

    if (riskFactors.daysSinceLastActivity > 7) {
      interventions.push({
        type: 'engagement',
        priority: 'high',
        action: 'send_motivation_email',
        message: 'User has been inactive - send motivational email with progress summary'
      });
    }

    if (riskFactors.successRate < 0.3) {
      interventions.push({
        type: 'learning_adjustment',
        priority: 'medium',
        action: 'reduce_difficulty',
        message: 'Reduce content difficulty to build confidence'
      });
    }

    if (riskFactors.avgSessionLength < 300) {
      interventions.push({
        type: 'engagement',
        priority: 'medium',
        action: 'gamification_boost',
        message: 'Add gamification elements to increase engagement'
      });
    }

    return interventions;
  }

  // Public method to execute an intervention
  async executeIntervention(
    interventionId: string,
    executedBy: number
  ): Promise<boolean> {
    try {
      await this.prisma.intervention.update({
        where: { id: interventionId },
        data: {
          status: 'executed',
          executedAt: new Date(),
          executedBy
        }
      });

      return true;
    } catch (error) {
      console.error('Error executing intervention:', error);
      return false;
    }
  }
}

// Export service instance
export const adaptiveLearningService = new AdaptiveLearningService(
  new PrismaClient()
);