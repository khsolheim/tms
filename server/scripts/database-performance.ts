#!/usr/bin/env ts-node

import { runDatabasePerformanceTest } from '../src/utils/database-performance';
import logger from '../src/utils/logger';

/**
 * Kjør database performance analyse som standalone script
 * 
 * Bruk: npm run db:analyze
 * eller: npx ts-node scripts/database-performance.ts
 */
async function main() {
  try {
    logger.info('🔍 Starter database performance analyse...');
    
    await runDatabasePerformanceTest();
    
    logger.info('✅ Database performance analyse fullført!');
    logger.info('💡 Se logs over for detaljert rapport og anbefalinger');
    logger.info('🌐 Du kan også kjøre analyse via API: GET /api/misc/database-performance (admin only)');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Feil ved kjøring av database performance analyse', { 
      error: error instanceof Error ? error.message : error 
    });
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 