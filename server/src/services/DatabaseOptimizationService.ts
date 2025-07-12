import { PrismaClient } from '@prisma/client';
import { cacheService } from './CacheService';

export class DatabaseOptimizationService {
  constructor(private prisma: PrismaClient) {}

  // Optimized user queries with caching
  async getActiveUserByEmail(email: string) {
    const cacheKey = `user:email:${email}`;
    
    return cacheService.cacheQueryResult(
      cacheKey,
      () => this.prisma.user.findFirst({
        where: {
          epost: email,
          isDeleted: false,
        },
        select: {
          id: true,
          epost: true,
          navn: true,
          rolle: true,
          globalRole: true,
          skoleId: true,
        },
      }),
      3600, // 1 hour cache
      ['users', `user:${email}`]
    );
  }

  // Optimized user progress queries
  async getUserProgressSummary(elevId: number) {
    const cacheKey = `user:progress:summary:${elevId}`;
    
    return cacheService.cacheQueryResult(
      cacheKey,
      async () => {
        const [totalQuestions, correctAnswers, recentProgress] = await Promise.all([
          this.prisma.sikkerhetskontrollElevProgresjon.count({
            where: { elevId },
          }),
                     this.prisma.sikkerhetskontrollElevProgresjon.count({
             where: { 
               elevId,
               antallRiktigeForsok: {
                 gt: 0
               }
             },
           }),
          this.prisma.sikkerhetskontrollElevProgresjon.findMany({
            where: { elevId },
            orderBy: { opprettet: 'desc' },
            take: 10,
                         select: {
               id: true,
               sporsmalId: true,
               antallRiktigeForsok: true,
               opprettet: true,
               status: true,
             },
          }),
        ]);

        return {
          totalQuestions,
          correctAnswers,
          accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
          recentProgress,
        };
      },
      1800, // 30 minutes cache
      ['user_progress', `user:${elevId}:progress`]
    );
  }

  // Optimized quiz questions with intelligent pagination
  async getQuizQuestions(
    kategoriId: number,
    difficulty?: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const cacheKey = `quiz:questions:${kategoriId}:${difficulty || 'all'}:${limit}:${offset}`;
    
    return cacheService.cacheQueryResult(
      cacheKey,
      () => this.prisma.sikkerhetskontrollSporsmal.findMany({
        where: {
          kategoriId,
          aktiv: true,
          ...(difficulty && { vanskelighetsgrad: difficulty as any }),
        },
        orderBy: [
          { vanskelighetsgrad: 'asc' },
          { opprettet: 'desc' },
        ],
        take: limit,
        skip: offset,
        select: {
          id: true,
          sporsmal: true,
          svarAlternativer: true,
          riktigSvar: true,
          forklaring: true,
          vanskelighetsgrad: true,
          kategori: {
            select: {
              id: true,
              navn: true,
            },
          },
          media: {
            select: {
              id: true,
              url: true,
              type: true,
            },
          },
        },
      }),
      7200, // 2 hours cache (questions don't change often)
      ['quiz_questions', `category:${kategoriId}`]
    );
  }

  // Optimized company employees with role filtering
  async getCompanyEmployees(bedriftId: number, rolle?: string) {
    const cacheKey = `company:employees:${bedriftId}:${rolle || 'all'}`;
    
    return cacheService.cacheQueryResult(
      cacheKey,
      () => this.prisma.ansatt.findMany({
        where: {
          bedriftId,
          isDeleted: false,
          ...(rolle && { rolle: rolle as any }),
        },
        orderBy: [
          { rolle: 'asc' },
          { navn: 'asc' },
        ],
        select: {
          id: true,
          navn: true,
          epost: true,
          rolle: true,
          status: true,
          opprettet: true,
          telefon: true,
          bedrift: {
            select: {
              id: true,
              navn: true,
            },
          },
        },
      }),
      1800, // 30 minutes cache
      ['company_employees', `company:${bedriftId}`]
    );
  }

  // Optimized security control history
  async getSecurityControlHistory(
    bedriftId?: number,
    limit: number = 50,
    status?: string
  ) {
    const cacheKey = `security:controls:${bedriftId || 'all'}:${status || 'all'}:${limit}`;
    
    return cacheService.cacheQueryResult(
      cacheKey,
      () => this.prisma.sikkerhetskontroll.findMany({
        where: {
          ...(bedriftId && { bedriftId }),
          ...(status && { status: status as any }),
        },
        orderBy: { opprettet: 'desc' },
        take: limit,
        select: {
          id: true,
          status: true,
          opprettet: true,
          utfort: true,
          bedrift: {
            select: {
              id: true,
              navn: true,
            },
          },
          punkter: {
            select: {
              id: true,
              godkjent: true,
              sjekkpunkt: {
                select: {
                  tittel: true,
                  typeKontroll: true,
                },
              },
            },
          },
        },
      }),
      900, // 15 minutes cache
      ['security_controls', bedriftId ? `company:${bedriftId}` : 'all_companies']
    );
  }

  // Optimized dashboard data aggregation
  async getDashboardData(userId: number) {
    const cacheKey = `dashboard:data:${userId}`;
    
    return cacheService.cacheQueryResult(
      cacheKey,
      async () => {
        // Get user details first to determine data scope
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            rolle: true,
            globalRole: true,
            skoleId: true,
          },
        });

        if (!user) return null;

        // Get basic data for all users
        const notifications = await this.getUnreadNotifications(userId);
        const activities = await this.getRecentActivities(userId);

        let systemStats = null;
        let securityControls = null;
        let userProgress = null;

        // Get role-specific data
        if (user.rolle === 'ADMIN' || user.globalRole === 'SUPER_ADMIN') {
          systemStats = await this.getSystemStats();
          if (user.skoleId) {
            securityControls = await this.getRecentSecurityControls(user.skoleId);
          }
        }

        if (user.rolle === 'ELEV') {
          userProgress = await this.getUserProgressSummary(userId);
        }
        
        return {
          user,
          notifications,
          activities,
          systemStats,
          securityControls,
          userProgress,
        };
      },
      600, // 10 minutes cache
      ['dashboard', `user:${userId}`]
    );
  }

  // Helper methods for dashboard
  private async getUnreadNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: {
        mottakerId: userId,
        lest: false,
      },
      orderBy: { opprettet: 'desc' },
      take: 10,
      select: {
        id: true,
        tittel: true,
        melding: true,
        type: true,
        opprettet: true,
      },
    });
  }

  private async getRecentActivities(userId: number) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 15,
      select: {
        id: true,
        action: true,
        tableName: true,
        timestamp: true,
        metadata: true,
      },
    });
  }

  private async getSystemStats() {
    const [userCount, companyCount, activeQuizzes] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.bedrift.count({ where: { isDeleted: false } }),
      this.prisma.sikkerhetskontrollElevProgresjon.count({
        where: {
          opprettet: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      userCount,
      companyCount,
      activeQuizzes,
    };
  }

  private async getRecentSecurityControls(skoleId?: number) {
    return this.prisma.sikkerhetskontroll.findMany({
      where: {},
      orderBy: { opprettet: 'desc' },
      take: 10,
      select: {
        id: true,
        opprettet: true,
        bedrift: {
          select: {
            navn: true,
          },
        },
      },
    });
  }

  // Bulk operations with batching
  async bulkUpdateUserProgress(
    updates: Array<{
      elevId: number;
      sporsmalId: number;
      riktigSvar: boolean;
      status: string;
    }>
  ) {
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const batchResult = await this.prisma.$transaction(
        batch.map(update =>
          this.prisma.sikkerhetskontrollElevProgresjon.create({
            data: {
              elevId: update.elevId,
              sporsmalId: update.sporsmalId,
              antallRiktigeForsok: update.riktigSvar ? 1 : 0,
              antallGaleForsok: update.riktigSvar ? 0 : 1,
              status: update.status as any,
              opprettet: new Date(),
            },
          })
        )
      );

      results.push(...batchResult);

      // Invalidate affected user caches
      const affectedUsers = [...new Set(batch.map(u => u.elevId))];
      await Promise.all(
        affectedUsers.map(userId =>
          cacheService.invalidateByTags([`user:${userId}:progress`])
        )
      );
    }

    return results;
  }

  // Performance monitoring
  async getSlowQueries(thresholdMs: number = 1000) {
    // This would integrate with PostgreSQL's slow query log
    // For now, return a placeholder structure
    return {
      threshold: thresholdMs,
      queries: [],
      suggestions: [
        'Consider adding indexes for frequently queried columns',
        'Review WHERE clauses for optimal filtering',
        'Use LIMIT clauses to restrict result sets',
      ],
    };
  }

  // Index usage analysis
  async analyzeIndexUsage() {
    // PostgreSQL specific query to check index usage
    const indexStats = await this.prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      ORDER BY schemaname, tablename;
    `;

    return {
      unusedIndexes: indexStats,
      recommendations: [
        'Consider dropping unused indexes to improve write performance',
        'Monitor index usage over time before making decisions',
      ],
    };
  }

  // Cache invalidation on data changes
  async invalidateRelatedCaches(resourceType: string, resourceId: number) {
    const invalidationMap: Record<string, string[]> = {
      user: [`user:${resourceId}`, `user:email:*`, 'dashboard', 'users'],
      bedrift: [`company:${resourceId}`, 'company_employees', 'dashboard'],
      quiz: [`quiz:questions:*`, `category:*`],
      security_control: ['security_controls', 'dashboard'],
    };

    const tags = invalidationMap[resourceType] || [];
    if (tags.length > 0) {
      await cacheService.invalidateByTags(tags);
    }
  }

  // Connection pool monitoring
  async getConnectionPoolStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT
          state,
          count(*) as connection_count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state;
      `;

      return {
        connections: stats,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to get connection pool stats:', error);
      return null;
    }
  }
}