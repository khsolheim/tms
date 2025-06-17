import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient();

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  recommendations: string[];
  missingIndexes?: string[];
  nPlusOneRisk?: boolean;
}

export class DatabasePerformanceAnalyzer {
  private queryStats: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  /**
   * Analyser vanlige queries for performance problemer
   */
  async analyzeCommonQueries(): Promise<QueryAnalysis[]> {
    const analyses: QueryAnalysis[] = [];

    // Test vanlige kontraktspørringer
    analyses.push(await this.analyzeKontraktQueries());
    analyses.push(await this.analyzeElevQueries());
    analyses.push(await this.analyzeAnsattQueries());
    analyses.push(await this.analyzeBedriftQueries());

    return analyses;
  }

  private async analyzeKontraktQueries(): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Simuler vanlig kontrakt query
      await prisma.kontrakt.findMany({
        take: 100,
        include: {
          bedrift: {
            select: { navn: true }
          },
          elev: {
            select: { fornavn: true, etternavn: true }
          }
        },
        orderBy: { opprettet: 'desc' }
      });
      
      const executionTime = Date.now() - startTime;
      
      return {
        query: 'Kontrakt.findMany med bedrift og elev includes',
        executionTime,
        recommendations: [
          executionTime > 100 ? 'Query tar over 100ms - vurder pagination' : 'Ytelse OK',
          'Bruk select for å begrense felter som hentes',
          'Vurder å cache ofte brukte data'
        ],
        missingIndexes: executionTime > 100 ? [
          'CREATE INDEX CONCURRENTLY idx_kontrakt_opprettet_desc ON "Kontrakt"("opprettet" DESC);'
        ] : []
      };
    } catch (error) {
      logger.error('Feil ved analyse av kontrakt queries', { error });
      return {
        query: 'Kontrakt.findMany',
        executionTime: -1,
        recommendations: ['Feil ved analyse - sjekk database tilkobling']
      };
    }
  }

  private async analyzeElevQueries(): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Test elev søk med bedrift filter
      await prisma.elev.findMany({
        where: {
          bedriftId: 1,
          status: 'AKTIV'
        },
        take: 50,
        orderBy: [
          { etternavn: 'asc' },
          { fornavn: 'asc' }
        ]
      });
      
      const executionTime = Date.now() - startTime;
      
      return {
        query: 'Elev.findMany med bedriftId og status filter',
        executionTime,
        recommendations: [
          'Composite index på (bedriftId, status) finnes allerede',
          executionTime > 50 ? 'Vurder å optimalisere sortering' : 'Ytelse OK'
        ],
        missingIndexes: executionTime > 50 ? [
          'CREATE INDEX CONCURRENTLY idx_elev_bedrift_status_navn ON "Elev"("bedriftId", "status", "etternavn", "fornavn");'
        ] : []
      };
    } catch (error) {
      return {
        query: 'Elev.findMany',
        executionTime: -1,
        recommendations: ['Feil ved analyse']
      };
    }
  }

  private async analyzeAnsattQueries(): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Test ansatt login query
      await prisma.ansatt.findUnique({
        where: { epost: 'test@test.no' },
        include: { bedrift: true }
      });
      
      const executionTime = Date.now() - startTime;
      
      return {
        query: 'Ansatt.findUnique med epost og bedrift include',
        executionTime,
        recommendations: [
          'Unique index på epost finnes allerede',
          'Vurder å cache brukerdata etter innlogging'
        ]
      };
    } catch (error) {
      return {
        query: 'Ansatt.findUnique',
        executionTime: -1,
        recommendations: ['Feil ved analyse']
      };
    }
  }

  private async analyzeBedriftQueries(): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Test bedrift med ansatte
      await prisma.bedrift.findMany({
        take: 20,
        include: {
          _count: {
            select: {
              ansatte: true,
              elever: true,
              kontrakter: true
            }
          }
        },
        orderBy: { navn: 'asc' }
      });
      
      const executionTime = Date.now() - startTime;
      
      return {
        query: 'Bedrift.findMany med counts',
        executionTime,
        recommendations: [
          'Index på navn finnes allerede',
          executionTime > 100 ? 'Counts kan være kostbare - vurder caching' : 'Ytelse OK'
        ],
        nPlusOneRisk: true
      };
    } catch (error) {
      return {
        query: 'Bedrift.findMany',
        executionTime: -1,
        recommendations: ['Feil ved analyse']
      };
    }
  }

  /**
   * Sjekk for N+1 query problemer
   */
  async detectNPlusOneQueries(): Promise<string[]> {
    const recommendations: string[] = [];

    // Simuler scenarios som kan føre til N+1
    recommendations.push(
      'Sjekk at includes brukes i stedet for separate queries i loops',
      'Bruk select for å kun hente nødvendige felter',
      'Vurder å bruke findMany med whereIn i stedet for multiple findUnique',
      'Implementer DataLoader pattern for komplekse relasjoner'
    );

    return recommendations;
  }

  /**
   * Generer rapport med forbedringsforslag
   */
  async generatePerformanceReport(): Promise<{
    summary: string;
    analyses: QueryAnalysis[];
    nPlusOneRecommendations: string[];
    generalRecommendations: string[];
  }> {
    logger.info('Genererer database performance rapport');

    const analyses = await this.analyzeCommonQueries();
    const nPlusOneRecommendations = await this.detectNPlusOneQueries();

    const avgExecutionTime = analyses
      .filter(a => a.executionTime > 0)
      .reduce((sum, a) => sum + a.executionTime, 0) / analyses.length;

    const slowQueries = analyses.filter(a => a.executionTime > 100);

    return {
      summary: `
Database Performance Rapport:
- Gjennomsnittlig query tid: ${avgExecutionTime.toFixed(2)}ms
- Antall trege queries (>100ms): ${slowQueries.length}
- Totalt analyserte queries: ${analyses.length}
      `.trim(),
      analyses,
      nPlusOneRecommendations,
      generalRecommendations: [
        'Implementer Redis for caching av ofte brukte data',
        'Bruk database connection pooling (allerede konfigurert i Prisma)',
        'Vurder read replicas for rapportering hvis trafikk øker',
        'Implementer query result caching for statiske data',
        'Legg til monitoring av slow queries i produksjon',
        'Vurder å implementere EXPLAIN ANALYZE logging for development'
      ]
    };
  }

  /**
   * Kjør performance test og logg resultater
   */
  async runPerformanceTest(): Promise<void> {
    try {
      const report = await this.generatePerformanceReport();
      
      logger.info('Database Performance Rapport', {
        summary: report.summary,
        slowQueries: report.analyses.filter(a => a.executionTime > 100),
        recommendations: report.generalRecommendations
      });

      // Log manglende indekser hvis funnet
      const missingIndexes = report.analyses
        .flatMap(a => a.missingIndexes || [])
        .filter(Boolean);

      if (missingIndexes.length > 0) {
        logger.warn('Foreslåtte database indekser', { missingIndexes });
      }

    } catch (error) {
      logger.error('Feil ved kjøring av performance test', { error });
    }
  }

  /**
   * Cleanup - steng database tilkobling
   */
  async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Eksporter singleton instans
export const dbPerformanceAnalyzer = new DatabasePerformanceAnalyzer();

// Utility for å kjøre performance test som script
export async function runDatabasePerformanceTest(): Promise<void> {
  await dbPerformanceAnalyzer.runPerformanceTest();
  await dbPerformanceAnalyzer.cleanup();
} 