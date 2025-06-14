#!/usr/bin/env node

/**
 * Database Backup Runner
 * 
 * Kjører automatiserte backups og vedlikehold av backup-systemet
 */

import { DatabaseBackupService } from './backup';
import logger from '../../src/utils/logger';
import path from 'path';

// ============================================================================
// BACKUP CONFIGURATION
// ============================================================================

const backupConfig = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/tms',
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../../../backups'),
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  compressionLevel: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  s3Bucket: process.env.BACKUP_S3_BUCKET,
  schedule: {
    daily: process.env.BACKUP_DAILY_SCHEDULE || '0 2 * * *',     // 02:00 daily
    weekly: process.env.BACKUP_WEEKLY_SCHEDULE || '0 3 * * 0',   // 03:00 on Sundays
    monthly: process.env.BACKUP_MONTHLY_SCHEDULE || '0 4 1 * *'  // 04:00 on 1st of month
  }
};

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Utfør full backup
 */
async function runFullBackup(): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    await backupService.initialize();
    logger.info('Starting scheduled full backup');
    
    const metadata = await backupService.createFullBackup();
    
    logger.info('Full backup completed successfully', {
      backupId: metadata.id,
      size: metadata.size,
      duration: metadata.duration,
      path: metadata.path
    });

    // Test backup integrity
    const isValid = await backupService.testBackupIntegrity(metadata.id);
    if (!isValid) {
      logger.error('Backup integrity test failed', { backupId: metadata.id });
      return;
    }

    logger.info('Backup integrity verified', { backupId: metadata.id });

  } catch (error) {
    logger.error('Full backup failed', error);
    throw error;
  }
}

/**
 * Utfør incremental backup
 */
async function runIncrementalBackup(): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    await backupService.initialize();
    logger.info('Starting incremental backup');
    
    const metadata = await backupService.createIncrementalBackup();
    
    logger.info('Incremental backup completed successfully', {
      backupId: metadata.id,
      size: metadata.size,
      duration: metadata.duration
    });

  } catch (error) {
    logger.error('Incremental backup failed', error);
    throw error;
  }
}

/**
 * Kjør cleanup av gamle backups
 */
async function runCleanup(): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    await backupService.initialize();
    logger.info('Starting backup cleanup');
    
    await backupService.cleanupOldBackups();
    
    logger.info('Backup cleanup completed successfully');

  } catch (error) {
    logger.error('Backup cleanup failed', error);
    throw error;
  }
}

/**
 * Test alle backups for integritet
 */
async function runIntegrityTest(): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    await backupService.initialize();
    logger.info('Starting backup integrity tests');
    
    const allBackups = await (backupService as any).listAllBackups();
    const recentBackups = allBackups
      .filter((backup: any) => backup.success)
      .slice(0, 5); // Test only 5 most recent successful backups

    let passedTests = 0;
    let failedTests = 0;

    for (const backup of recentBackups) {
      try {
        const isValid = await backupService.testBackupIntegrity(backup.id);
        if (isValid) {
          passedTests++;
          logger.info('Backup integrity test passed', { backupId: backup.id });
        } else {
          failedTests++;
          logger.error('Backup integrity test failed', { backupId: backup.id });
        }
      } catch (error) {
        failedTests++;
        logger.error('Backup integrity test error', { backupId: backup.id, error });
      }
    }

    logger.info('Backup integrity tests completed', {
      totalTested: recentBackups.length,
      passed: passedTests,
      failed: failedTests
    });

    if (failedTests > 0) {
      throw new Error(`${failedTests} backup integrity tests failed`);
    }

  } catch (error) {
    logger.error('Backup integrity testing failed', error);
    throw error;
  }
}

/**
 * Vis backup status og statistikk
 */
async function showBackupStatus(): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    await backupService.initialize();
    
    const status = await backupService.getBackupStatus();
    
    console.log('\n=== BACKUP STATUS ===');
    console.log(`Health Status: ${status.healthStatus.toUpperCase()}`);
    console.log(`Total Backups: ${status.totalBackups}`);
    console.log(`Total Size: ${(status.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
    
    if (status.lastBackup) {
      console.log(`Last Backup: ${status.lastBackup.timestamp.toISOString()}`);
      console.log(`Last Backup Size: ${(status.lastBackup.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Last Backup Duration: ${Math.round(status.lastBackup.duration / 1000)}s`);
    }
    
    if (status.issues.length > 0) {
      console.log('\n=== ISSUES ===');
      status.issues.forEach(issue => console.log(`⚠️  ${issue}`));
    }
    
    console.log('');

  } catch (error) {
    logger.error('Failed to get backup status', error);
    throw error;
  }
}

/**
 * Restore fra backup
 */
async function restoreBackup(backupId: string, targetDatabase?: string): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    await backupService.initialize();
    logger.info('Starting database restore', { backupId, targetDatabase });
    
    await backupService.restoreFromBackup(backupId, targetDatabase);
    
    logger.info('Database restore completed successfully', { backupId, targetDatabase });

  } catch (error) {
    logger.error('Database restore failed', { backupId, targetDatabase, error });
    throw error;
  }
}

/**
 * Point-in-time recovery
 */
async function pointInTimeRestore(targetTime: string, targetDatabase?: string): Promise<void> {
  const backupService = new DatabaseBackupService(backupConfig);
  
  try {
    const targetDate = new Date(targetTime);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid target time format. Use ISO format: 2025-01-01T12:00:00Z');
    }

    await backupService.initialize();
    logger.info('Starting point-in-time recovery', { 
      targetTime: targetDate.toISOString(), 
      targetDatabase 
    });
    
    await backupService.pointInTimeRestore(targetDate, targetDatabase);
    
    logger.info('Point-in-time recovery completed successfully', { 
      targetTime: targetDate.toISOString(), 
      targetDatabase 
    });

  } catch (error) {
    logger.error('Point-in-time recovery failed', { targetTime, targetDatabase, error });
    throw error;
  }
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'full':
        await runFullBackup();
        break;
        
      case 'incremental':
        await runIncrementalBackup();
        break;
        
      case 'cleanup':
        await runCleanup();
        break;
        
      case 'test':
        await runIntegrityTest();
        break;
        
      case 'status':
        await showBackupStatus();
        break;
        
      case 'restore':
        if (!args[0]) {
          throw new Error('Backup ID is required for restore');
        }
        await restoreBackup(args[0], args[1]);
        break;
        
      case 'pitr':
        if (!args[0]) {
          throw new Error('Target time is required for point-in-time recovery');
        }
        await pointInTimeRestore(args[0], args[1]);
        break;
        
      default:
        console.log(`
Database Backup System

Usage:
  node run-backup.ts <command> [options]

Commands:
  full                          Utfør full database backup
  incremental                   Utfør incremental backup (WAL)
  cleanup                       Slett gamle backups basert på retention policy
  test                          Test integritet på eksisterende backups
  status                        Vis backup status og statistikk
  restore <backupId> [dbName]   Restore database fra backup
  pitr <time> [dbName]          Point-in-time recovery til spesifikt tidspunkt

Examples:
  node run-backup.ts full
  node run-backup.ts status
  node run-backup.ts restore full_2025-01-01T10-00-00-000Z
  node run-backup.ts pitr "2025-01-01T12:00:00Z" test_db
  
Environment Variables:
  DATABASE_URL                  PostgreSQL connection string
  BACKUP_DIR                    Backup directory path
  BACKUP_RETENTION_DAYS         Days to keep backups (default: 30)
  BACKUP_COMPRESSION_LEVEL      Gzip compression level 1-9 (default: 6)
  BACKUP_ENCRYPTION_KEY         Encryption key for backups
  BACKUP_S3_BUCKET              S3 bucket for cloud storage
        `);
        process.exit(1);
    }

    logger.info('Backup operation completed successfully', { command });
    process.exit(0);

  } catch (error) {
    logger.error('Backup operation failed', { command, error });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  runFullBackup,
  runIncrementalBackup,
  runCleanup,
  runIntegrityTest,
  showBackupStatus,
  restoreBackup,
  pointInTimeRestore
}; 