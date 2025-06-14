/**
 * Database Migration Tools
 * 
 * Verktøy for sikre og automatiserte database migrations
 * med versioning, rollback-planer og testing
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import logger from '../../src/utils/logger';

interface MigrationInfo {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  version: string;
  rollbackScript?: string;
  testScript?: string;
  dependencies?: string[];
}

export class MigrationManager {
  private prisma: PrismaClient;
  private migrationsPath: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.migrationsPath = path.join(__dirname, '../../prisma/migrations');
  }

  /**
   * Get all migration files from prisma/migrations directory
   */
  async getMigrations(): Promise<MigrationInfo[]> {
    try {
      const migrationDirs = await fs.readdir(this.migrationsPath);
      const migrations: MigrationInfo[] = [];

      for (const dir of migrationDirs) {
        if (dir === 'migration_lock.toml') continue;

        const dirPath = path.join(this.migrationsPath, dir);
        const stat = await fs.stat(dirPath);
        
        if (stat.isDirectory()) {
          const migrationInfo = await this.parseMigrationDir(dir, dirPath);
          if (migrationInfo) {
            migrations.push(migrationInfo);
          }
        }
      }

      return migrations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    } catch (error) {
      logger.error('Error reading migrations directory', { error });
      return [];
    }
  }

  /**
   * Parse migration directory to extract information
   */
  private async parseMigrationDir(dirName: string, dirPath: string): Promise<MigrationInfo | null> {
    try {
      // Parse timestamp and name from directory name (format: YYYYMMDDHHMMSS_name)
      const match = dirName.match(/^(\d{14})_(.+)$/);
      if (!match) {
        logger.warn('Invalid migration directory format', { dirName });
        return null;
      }

      const [, timestamp, name] = match;
      
      // Check for migration.sql file
      const migrationSqlPath = path.join(dirPath, 'migration.sql');
      const migrationExists = await fs.access(migrationSqlPath).then(() => true).catch(() => false);
      
      if (!migrationExists) {
        logger.warn('Migration.sql not found', { dirName });
        return null;
      }

      // Look for additional metadata files
      const rollbackPath = path.join(dirPath, 'rollback.sql');
      const testPath = path.join(dirPath, 'test.sql');
      const metadataPath = path.join(dirPath, 'metadata.json');

      const rollbackExists = await fs.access(rollbackPath).then(() => true).catch(() => false);
      const testExists = await fs.access(testPath).then(() => true).catch(() => false);
      const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);

      let metadata: any = {};
      if (metadataExists) {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      }

      return {
        id: dirName,
        name: name.replace(/_/g, ' '),
        timestamp,
        description: metadata.description || name.replace(/_/g, ' '),
        version: metadata.version || '1.0.0',
        rollbackScript: rollbackExists ? rollbackPath : undefined,
        testScript: testExists ? testPath : undefined,
        dependencies: metadata.dependencies || []
      };
    } catch (error) {
      logger.error('Error parsing migration directory', { dirName, error });
      return null;
    }
  }

  /**
   * Generate rollback script for a migration
   */
  async generateRollbackScript(migrationId: string): Promise<string | null> {
    try {
      const migrations = await this.getMigrations();
      const migration = migrations.find(m => m.id === migrationId);
      
      if (!migration) {
        logger.error('Migration not found', { migrationId });
        return null;
      }

      if (migration.rollbackScript) {
        const rollbackContent = await fs.readFile(migration.rollbackScript, 'utf-8');
        return rollbackContent;
      }

      // Generate basic rollback script based on migration.sql
      const migrationPath = path.join(this.migrationsPath, migrationId, 'migration.sql');
      const migrationContent = await fs.readFile(migrationPath, 'utf-8');
      
      const rollbackScript = this.generateBasicRollback(migrationContent);
      
      // Save generated rollback script
      const rollbackPath = path.join(this.migrationsPath, migrationId, 'rollback.sql');
      await fs.writeFile(rollbackPath, rollbackScript);
      
      logger.info('Generated rollback script', { migrationId, rollbackPath });
      return rollbackScript;
    } catch (error) {
      logger.error('Error generating rollback script', { migrationId, error });
      return null;
    }
  }

  /**
   * Generate basic rollback script from migration SQL
   */
  private generateBasicRollback(migrationSql: string): string {
    const lines = migrationSql.split('\n');
    const rollbackCommands: string[] = [];

    rollbackCommands.push('-- Auto-generated rollback script');
    rollbackCommands.push('-- CAUTION: Review before executing!');
    rollbackCommands.push('');

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('CREATE TABLE')) {
        const tableName = this.extractTableName(trimmedLine);
        if (tableName) {
          rollbackCommands.push(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        }
      } else if (trimmedLine.startsWith('ALTER TABLE') && trimmedLine.includes('ADD COLUMN')) {
        const { tableName, columnName } = this.extractAlterTableInfo(trimmedLine);
        if (tableName && columnName) {
          rollbackCommands.push(`ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}";`);
        }
      } else if (trimmedLine.startsWith('CREATE INDEX')) {
        const indexName = this.extractIndexName(trimmedLine);
        if (indexName) {
          rollbackCommands.push(`DROP INDEX IF EXISTS "${indexName}";`);
        }
      } else if (trimmedLine.startsWith('CREATE UNIQUE INDEX')) {
        const indexName = this.extractIndexName(trimmedLine);
        if (indexName) {
          rollbackCommands.push(`DROP INDEX IF EXISTS "${indexName}";`);
        }
      }
    }

    return rollbackCommands.join('\n');
  }

  /**
   * Extract table name from CREATE TABLE statement
   */
  private extractTableName(line: string): string | null {
    const match = line.match(/CREATE TABLE\s+"?([^"\s]+)"?\s*\(/i);
    return match ? match[1] : null;
  }

  /**
   * Extract table and column name from ALTER TABLE ADD COLUMN statement
   */
  private extractAlterTableInfo(line: string): { tableName: string | null; columnName: string | null } {
    const match = line.match(/ALTER TABLE\s+"?([^"\s]+)"?\s+ADD COLUMN\s+"?([^"\s]+)"?/i);
    return {
      tableName: match ? match[1] : null,
      columnName: match ? match[2] : null
    };
  }

  /**
   * Extract index name from CREATE INDEX statement
   */
  private extractIndexName(line: string): string | null {
    const match = line.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+"?([^"\s]+)"?/i);
    return match ? match[1] : null;
  }

  /**
   * Test a migration on a test database
   */
  async testMigration(migrationId: string): Promise<boolean> {
    try {
      logger.info('Testing migration', { migrationId });

      // Create test database connection string
      const testDbUrl = process.env.TEST_DATABASE_URL || 
        process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/test_migrations');

      if (!testDbUrl) {
        logger.error('Test database URL not configured');
        return false;
      }

      // Create test Prisma client
      const testPrisma = new PrismaClient({
        datasources: {
          db: {
            url: testDbUrl
          }
        }
      });

      try {
        // Apply migration
        execSync(`DATABASE_URL="${testDbUrl}" npx prisma migrate deploy`, {
          cwd: path.join(__dirname, '../..'),
          stdio: 'pipe'
        });

        // Run migration-specific tests if they exist
        const migration = (await this.getMigrations()).find(m => m.id === migrationId);
        if (migration?.testScript) {
          const testSql = await fs.readFile(migration.testScript, 'utf-8');
          await testPrisma.$executeRawUnsafe(testSql);
        }

        logger.info('Migration test successful', { migrationId });
        return true;
      } finally {
        await testPrisma.$disconnect();
      }
    } catch (error) {
      logger.error('Migration test failed', { migrationId, error });
      return false;
    }
  }

  /**
   * Create migration test template
   */
  async createMigrationTest(migrationId: string): Promise<string> {
    const testSql = `-- Migration test for ${migrationId}
-- Add specific tests for this migration here

-- Example: Test that table was created
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name = 'your_table_name'
-- );

-- Example: Test that column was added
-- SELECT EXISTS (
--   SELECT FROM information_schema.columns 
--   WHERE table_schema = 'public' 
--   AND table_name = 'your_table_name'
--   AND column_name = 'your_column_name'
-- );

-- Example: Test that index was created
-- SELECT EXISTS (
--   SELECT FROM pg_indexes 
--   WHERE schemaname = 'public' 
--   AND tablename = 'your_table_name'
--   AND indexname = 'your_index_name'
-- );

-- Add your specific tests here...
SELECT 'Migration test template created' as test_result;
`;

    const testPath = path.join(this.migrationsPath, migrationId, 'test.sql');
    await fs.writeFile(testPath, testSql);
    
    logger.info('Created migration test template', { migrationId, testPath });
    return testPath;
  }

  /**
   * Create migration metadata file
   */
  async createMigrationMetadata(migrationId: string, metadata: Partial<MigrationInfo>): Promise<void> {
    const metadataPath = path.join(this.migrationsPath, migrationId, 'metadata.json');
    
    const metadataContent = {
      description: metadata.description || migrationId,
      version: metadata.version || '1.0.0',
      dependencies: metadata.dependencies || [],
      createdAt: new Date().toISOString(),
      author: process.env.USER || 'system',
      ...metadata
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
    logger.info('Created migration metadata', { migrationId, metadataPath });
  }

  /**
   * Validate migration dependencies
   */
  async validateDependencies(): Promise<{ valid: boolean; errors: string[] }> {
    const migrations = await this.getMigrations();
    const errors: string[] = [];
    const migrationIds = new Set(migrations.map(m => m.id));

    for (const migration of migrations) {
      if (migration.dependencies && migration.dependencies.length > 0) {
        for (const dep of migration.dependencies) {
          if (!migrationIds.has(dep)) {
            errors.push(`Migration ${migration.id} depends on non-existent migration ${dep}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * CLI functions for migration management
 */

// Generate rollback for all migrations without one
export async function generateMissingRollbacks(): Promise<void> {
  const manager = new MigrationManager();
  
  try {
    const migrations = await manager.getMigrations();
    
    for (const migration of migrations) {
      if (!migration.rollbackScript) {
        logger.info('Generating rollback for migration', { migrationId: migration.id });
        await manager.generateRollbackScript(migration.id);
      }
    }
  } finally {
    await manager.cleanup();
  }
}

// Test all migrations
export async function testAllMigrations(): Promise<void> {
  const manager = new MigrationManager();
  
  try {
    const migrations = await manager.getMigrations();
    let passed = 0;
    let failed = 0;
    
    for (const migration of migrations) {
      const success = await manager.testMigration(migration.id);
      if (success) {
        passed++;
      } else {
        failed++;
      }
    }
    
    logger.info('Migration testing completed', { passed, failed, total: migrations.length });
  } finally {
    await manager.cleanup();
  }
}

// Validate all migration dependencies
export async function validateMigrationDependencies(): Promise<void> {
  const manager = new MigrationManager();
  
  try {
    const result = await manager.validateDependencies();
    
    if (result.valid) {
      logger.info('All migration dependencies are valid');
    } else {
      logger.error('Migration dependency validation failed', { errors: result.errors });
      result.errors.forEach(error => console.error(`❌ ${error}`));
    }
  } finally {
    await manager.cleanup();
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate-rollbacks':
      generateMissingRollbacks().catch(console.error);
      break;
    case 'test-migrations':
      testAllMigrations().catch(console.error);
      break;
    case 'validate-dependencies':
      validateMigrationDependencies().catch(console.error);
      break;
    default:
      console.log('Available commands:');
      console.log('  generate-rollbacks  - Generate rollback scripts for migrations');
      console.log('  test-migrations     - Test all migrations');
      console.log('  validate-dependencies - Validate migration dependencies');
  }
} 