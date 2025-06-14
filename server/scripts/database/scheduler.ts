#!/usr/bin/env node

/**
 * Backup Scheduler
 * 
 * Automatisert scheduling av database backups med cron jobs
 */

import cron from 'node-cron';
import { 
  runFullBackup, 
  runIncrementalBackup, 
  runCleanup, 
  runIntegrityTest,
  showBackupStatus 
} from './run-backup';
import logger from '../../src/utils/logger';

// ============================================================================
// SCHEDULER CONFIGURATION
// ============================================================================

interface SchedulerConfig {
  enabled: boolean;
  schedules: {
    fullBackup: string;
    incrementalBackup: string;
    cleanup: string;
    integrityTest: string;
    statusReport: string;
  };
  timezone: string;
}

const config: SchedulerConfig = {
  enabled: process.env.BACKUP_SCHEDULER_ENABLED === 'true',
  schedules: {
    // Full backup every day at 2:00 AM
    fullBackup: process.env.BACKUP_SCHEDULE_FULL || '0 2 * * *',
    
    // Incremental backup every 6 hours
    incrementalBackup: process.env.BACKUP_SCHEDULE_INCREMENTAL || '0 */6 * * *',
    
    // Cleanup every Sunday at 4:00 AM
    cleanup: process.env.BACKUP_SCHEDULE_CLEANUP || '0 4 * * 0',
    
    // Integrity test every day at 5:00 AM
    integrityTest: process.env.BACKUP_SCHEDULE_INTEGRITY || '0 5 * * *',
    
    // Status report every day at 8:00 AM
    statusReport: process.env.BACKUP_SCHEDULE_STATUS || '0 8 * * *'
  },
  timezone: process.env.BACKUP_TIMEZONE || 'Europe/Oslo'
};

// ============================================================================
// TASK WRAPPERS
// ============================================================================

/**
 * Wrapper for backup tasks med error handling og monitoring
 */
async function executeTask(taskName: string, taskFn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting scheduled task: ${taskName}`);
    
    await taskFn();
    
    const duration = Date.now() - startTime;
    logger.info(`Scheduled task completed successfully`, { 
      task: taskName, 
      duration: Math.round(duration / 1000) 
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Scheduled task failed`, { 
      task: taskName, 
      duration: Math.round(duration / 1000),
      error 
    });

    // Send alert (kunne integreres med Slack, email, etc.)
    await sendTaskFailureAlert(taskName, error as Error);
  }
}

/**
 * Send failure alert (mock implementation)
 */
async function sendTaskFailureAlert(taskName: string, error: Error): Promise<void> {
  // I en ekte implementering kunne dette sende e-post, Slack melding, etc.
  logger.error(`ALERT: Backup task failure notification`, {
    task: taskName,
    error: error.message,
    timestamp: new Date().toISOString(),
    severity: 'high'
  });
}

/**
 * Wrapper for status rapport (ikke-kritisk)
 */
async function executeStatusReport(): Promise<void> {
  try {
    logger.info('Generating daily backup status report');
    await showBackupStatus();
  } catch (error) {
    logger.warn('Status report failed (non-critical)', error);
  }
}

// ============================================================================
// SCHEDULER SETUP
// ============================================================================

/**
 * Initialize backup scheduler
 */
export function initializeBackupScheduler(): void {
  if (!config.enabled) {
    logger.info('Backup scheduler is disabled');
    return;
  }

  logger.info('Initializing backup scheduler', {
    timezone: config.timezone,
    schedules: config.schedules
  });

  // Full backup schedule
  if (config.schedules.fullBackup) {
    cron.schedule(config.schedules.fullBackup, async () => {
      await executeTask('full-backup', runFullBackup);
    }, {
      scheduled: true,
      timezone: config.timezone,
      name: 'full-backup'
    });

    logger.info('Full backup scheduled', { 
      schedule: config.schedules.fullBackup,
      timezone: config.timezone 
    });
  }

  // Incremental backup schedule
  if (config.schedules.incrementalBackup) {
    cron.schedule(config.schedules.incrementalBackup, async () => {
      await executeTask('incremental-backup', runIncrementalBackup);
    }, {
      scheduled: true,
      timezone: config.timezone,
      name: 'incremental-backup'
    });

    logger.info('Incremental backup scheduled', { 
      schedule: config.schedules.incrementalBackup,
      timezone: config.timezone 
    });
  }

  // Cleanup schedule
  if (config.schedules.cleanup) {
    cron.schedule(config.schedules.cleanup, async () => {
      await executeTask('cleanup', runCleanup);
    }, {
      scheduled: true,
      timezone: config.timezone,
      name: 'cleanup'
    });

    logger.info('Backup cleanup scheduled', { 
      schedule: config.schedules.cleanup,
      timezone: config.timezone 
    });
  }

  // Integrity test schedule
  if (config.schedules.integrityTest) {
    cron.schedule(config.schedules.integrityTest, async () => {
      await executeTask('integrity-test', runIntegrityTest);
    }, {
      scheduled: true,
      timezone: config.timezone,
      name: 'integrity-test'
    });

    logger.info('Integrity test scheduled', { 
      schedule: config.schedules.integrityTest,
      timezone: config.timezone 
    });
  }

  // Status report schedule
  if (config.schedules.statusReport) {
    cron.schedule(config.schedules.statusReport, async () => {
      await executeStatusReport();
    }, {
      scheduled: true,
      timezone: config.timezone,
      name: 'status-report'
    });

    logger.info('Status report scheduled', { 
      schedule: config.schedules.statusReport,
      timezone: config.timezone 
    });
  }

  logger.info('Backup scheduler initialized successfully');
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  enabled: boolean;
  runningTasks: string[];
  nextRuns: Record<string, string>;
} {
  const tasks = cron.getTasks();
  const runningTasks: string[] = [];
  const nextRuns: Record<string, string> = {};

  tasks.forEach((task, name) => {
    if (task.getStatus() === 'scheduled') {
      runningTasks.push(name);
    }
    
    try {
      // Note: node-cron doesn't have getNext() method, så vi bruker en mock
      nextRuns[name] = 'Next run calculation not available';
    } catch {
      nextRuns[name] = 'Unknown';
    }
  });

  return {
    enabled: config.enabled,
    runningTasks,
    nextRuns
  };
}

/**
 * Stop scheduler
 */
export function stopScheduler(): void {
  const tasks = cron.getTasks();
  
  tasks.forEach((task, name) => {
    if (task.getStatus() === 'scheduled') {
      task.stop();
      logger.info(`Stopped scheduled task: ${name}`);
    }
  });

  logger.info('Backup scheduler stopped');
}

/**
 * Start scheduler
 */
export function startScheduler(): void {
  const tasks = cron.getTasks();
  
  tasks.forEach((task, name) => {
    if (task.getStatus() === 'stopped') {
      task.start();
      logger.info(`Started scheduled task: ${name}`);
    }
  });

  logger.info('Backup scheduler started');
}

// ============================================================================
// MAIN FUNCTION FOR STANDALONE EXECUTION
// ============================================================================

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'start':
        initializeBackupScheduler();
        
        // Keep process running
        process.on('SIGINT', () => {
          logger.info('Received SIGINT, stopping scheduler gracefully...');
          stopScheduler();
          process.exit(0);
        });

        process.on('SIGTERM', () => {
          logger.info('Received SIGTERM, stopping scheduler gracefully...');
          stopScheduler();
          process.exit(0);
        });

        logger.info('Backup scheduler is running. Press Ctrl+C to stop.');
        
        // Keep alive
        setInterval(() => {
          // Heartbeat log every hour
          logger.debug('Backup scheduler heartbeat');
        }, 60 * 60 * 1000);
        
        break;
        
      case 'status':
        const status = getSchedulerStatus();
        console.log('\n=== BACKUP SCHEDULER STATUS ===');
        console.log(`Enabled: ${status.enabled}`);
        console.log(`Running Tasks: ${status.runningTasks.join(', ') || 'None'}`);
        console.log('\nNext Runs:');
        Object.entries(status.nextRuns).forEach(([task, next]) => {
          console.log(`  ${task}: ${next}`);
        });
        console.log('');
        break;
        
      case 'stop':
        stopScheduler();
        break;
        
      case 'config':
        console.log('\n=== BACKUP SCHEDULER CONFIG ===');
        console.log(JSON.stringify(config, null, 2));
        console.log('');
        break;
        
      default:
        console.log(`
Backup Scheduler

Usage:
  node scheduler.ts <command>

Commands:
  start     Start the backup scheduler (runs continuously)
  status    Show scheduler status and next run times
  stop      Stop all scheduled tasks
  config    Show current configuration

Environment Variables:
  BACKUP_SCHEDULER_ENABLED      Enable/disable scheduler (true/false)
  BACKUP_SCHEDULE_FULL          Cron expression for full backups
  BACKUP_SCHEDULE_INCREMENTAL   Cron expression for incremental backups
  BACKUP_SCHEDULE_CLEANUP       Cron expression for cleanup
  BACKUP_SCHEDULE_INTEGRITY     Cron expression for integrity tests
  BACKUP_SCHEDULE_STATUS        Cron expression for status reports
  BACKUP_TIMEZONE               Timezone for scheduling (default: Europe/Oslo)

Default Schedules:
  Full Backup:      Daily at 02:00    (0 2 * * *)
  Incremental:      Every 6 hours     (0 */6 * * *)
  Cleanup:          Sunday at 04:00   (0 4 * * 0)
  Integrity Test:   Daily at 05:00    (0 5 * * *)
  Status Report:    Daily at 08:00    (0 8 * * *)
        `);
        process.exit(1);
    }

  } catch (error) {
    logger.error('Scheduler command failed', { command, error });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default {
  initializeBackupScheduler,
  getSchedulerStatus,
  stopScheduler,
  startScheduler
}; 