/**
 * Database Backup System
 * 
 * Automatiserte backups med point-in-time recovery og disaster recovery support
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import logger from '../../src/utils/logger';
import cacheService from '../../src/services/cache.service';

const execAsync = promisify(exec);

interface BackupConfig {
  databaseUrl: string;
  backupDir: string;
  retentionDays: number;
  compressionLevel: number;
  encryptionKey?: string;
  s3Bucket?: string;
  schedule: {
    daily: string;
    weekly: string;
    monthly: string;
  };
}

interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  timestamp: Date;
  size: number;
  duration: number;
  checksum: string;
  path: string;
  encrypted: boolean;
  compressed: boolean;
  success: boolean;
  error?: string;
}

class DatabaseBackupService {
  private config: BackupConfig;
  private backupDir: string;

  constructor(config: BackupConfig) {
    this.config = config;
    this.backupDir = path.resolve(config.backupDir);
  }

  /**
   * Initialize backup system
   */
  async initialize(): Promise<void> {
    try {
      // Create backup directory if it doesn't exist
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Create subdirectories
      await Promise.all([
        fs.mkdir(path.join(this.backupDir, 'full'), { recursive: true }),
        fs.mkdir(path.join(this.backupDir, 'incremental'), { recursive: true }),
        fs.mkdir(path.join(this.backupDir, 'logs'), { recursive: true }),
        fs.mkdir(path.join(this.backupDir, 'temp'), { recursive: true })
      ]);

      logger.info('Database backup system initialized', {
        backupDir: this.backupDir,
        config: this.config
      });
    } catch (error) {
      logger.error('Failed to initialize backup system', error);
      throw error;
    }
  }

  /**
   * Create full database backup
   */
  async createFullBackup(): Promise<BackupMetadata> {
    const startTime = Date.now();
    const backupId = `full_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    const backupPath = path.join(this.backupDir, 'full', `${backupId}.sql`);

    try {
      logger.info('Starting full database backup', { backupId });

      // Create pg_dump command
      const dumpCommand = this.buildPgDumpCommand(backupPath, 'full');
      
      // Execute backup
      const { stdout, stderr } = await execAsync(dumpCommand);
      
      if (stderr && !stderr.includes('NOTICE')) {
        throw new Error(`pg_dump stderr: ${stderr}`);
      }

      // Get file stats
      const stats = await fs.stat(backupPath);
      const duration = Date.now() - startTime;

      // Compress backup if configured
      let finalPath = backupPath;
      let compressed = false;
      if (this.config.compressionLevel > 0) {
        finalPath = await this.compressBackup(backupPath);
        compressed = true;
        await fs.unlink(backupPath); // Remove uncompressed version
      }

      // Encrypt backup if configured
      let encrypted = false;
      if (this.config.encryptionKey) {
        finalPath = await this.encryptBackup(finalPath);
        encrypted = true;
        await fs.unlink(compressed ? backupPath.replace('.sql', '.gz') : backupPath);
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(finalPath);

      const metadata: BackupMetadata = {
        id: backupId,
        type: 'full',
        timestamp: new Date(),
        size: stats.size,
        duration,
        checksum,
        path: finalPath,
        encrypted,
        compressed,
        success: true
      };

      // Save metadata
      await this.saveBackupMetadata(metadata);

      // Upload to cloud storage if configured
      if (this.config.s3Bucket) {
        await this.uploadToS3(finalPath, metadata);
      }

      logger.info('Full database backup completed successfully', {
        backupId,
        duration,
        size: stats.size,
        path: finalPath
      });

      return metadata;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      const metadata: BackupMetadata = {
        id: backupId,
        type: 'full',
        timestamp: new Date(),
        size: 0,
        duration,
        checksum: '',
        path: backupPath,
        encrypted: false,
        compressed: false,
        success: false,
        error: (error as Error).message
      };

      await this.saveBackupMetadata(metadata);
      logger.error('Full database backup failed', { backupId, error });
      throw error;
    }
  }

  /**
   * Create incremental backup (WAL archives)
   */
  async createIncrementalBackup(): Promise<BackupMetadata> {
    const startTime = Date.now();
    const backupId = `incremental_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    
    try {
      logger.info('Starting incremental backup', { backupId });

      // Use pg_receivewal for WAL streaming
      const walCommand = this.buildWalBackupCommand(backupId);
      const { stdout, stderr } = await execAsync(walCommand);

      const duration = Date.now() - startTime;
      const walDir = path.join(this.backupDir, 'incremental', backupId);
      
      // Get directory size
      const size = await this.getDirectorySize(walDir);
      const checksum = await this.calculateDirectoryChecksum(walDir);

      const metadata: BackupMetadata = {
        id: backupId,
        type: 'incremental',
        timestamp: new Date(),
        size,
        duration,
        checksum,
        path: walDir,
        encrypted: false,
        compressed: false,
        success: true
      };

      await this.saveBackupMetadata(metadata);
      logger.info('Incremental backup completed', { backupId, duration, size });
      
      return metadata;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      const metadata: BackupMetadata = {
        id: backupId,
        type: 'incremental',
        timestamp: new Date(),
        size: 0,
        duration,
        checksum: '',
        path: '',
        encrypted: false,
        compressed: false,
        success: false,
        error: (error as Error).message
      };

      await this.saveBackupMetadata(metadata);
      logger.error('Incremental backup failed', { backupId, error });
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupId: string, targetDatabase?: string): Promise<void> {
    try {
      logger.info('Starting database restore', { backupId, targetDatabase });

      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      if (!metadata.success) {
        throw new Error(`Cannot restore from failed backup: ${backupId}`);
      }

      let backupPath = metadata.path;

      // Decrypt if needed
      if (metadata.encrypted) {
        backupPath = await this.decryptBackup(backupPath);
      }

      // Decompress if needed
      if (metadata.compressed) {
        backupPath = await this.decompressBackup(backupPath);
      }

      // Verify backup integrity
      await this.verifyBackupIntegrity(backupPath, metadata);

      // Drop target database if it exists
      if (targetDatabase) {
        await this.dropDatabase(targetDatabase);
      }

      // Restore database
      const restoreCommand = this.buildRestoreCommand(backupPath, targetDatabase);
      const { stdout, stderr } = await execAsync(restoreCommand);

      if (stderr && !stderr.includes('NOTICE')) {
        throw new Error(`Restore stderr: ${stderr}`);
      }

      // Validate restored data
      if (targetDatabase) {
        await this.validateRestoredData(targetDatabase);
      }

      logger.info('Database restore completed successfully', { 
        backupId, 
        targetDatabase,
        originalSize: metadata.size 
      });

    } catch (error) {
      logger.error('Database restore failed', { backupId, targetDatabase, error });
      throw error;
    }
  }

  /**
   * Point-in-time recovery
   */
  async pointInTimeRestore(targetTime: Date, targetDatabase?: string): Promise<void> {
    try {
      logger.info('Starting point-in-time recovery', { 
        targetTime: targetTime.toISOString(), 
        targetDatabase 
      });

      // Find base backup before target time
      const baseBackup = await this.findBaseBackupForPITR(targetTime);
      if (!baseBackup) {
        throw new Error('No suitable base backup found for point-in-time recovery');
      }

      // Restore from base backup first
      await this.restoreFromBackup(baseBackup.id, targetDatabase);

      // Find and apply WAL files
      const walFiles = await this.findWalFilesForPITR(baseBackup.timestamp, targetTime);
      
      logger.info('Applying WAL files for point-in-time recovery', { 
        baseBackup: baseBackup.id,
        walFilesCount: walFiles.length 
      });

      for (const walFile of walFiles) {
        await this.applyWalFile(walFile, targetDatabase);
      }

      // Validate final state
      if (targetDatabase) {
        await this.validateRestoredData(targetDatabase);
      }

      logger.info('Point-in-time recovery completed successfully', {
        targetTime: targetTime.toISOString(),
        targetDatabase,
        baseBackup: baseBackup.id,
        appliedWalFiles: walFiles.length
      });

    } catch (error) {
      logger.error('Point-in-time recovery failed', { targetTime, targetDatabase, error });
      throw error;
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      logger.info('Starting backup cleanup', { retentionDays: this.config.retentionDays });

      const allBackups = await this.listAllBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const backupsToDelete = allBackups.filter(backup => 
        backup.timestamp < cutoffDate && backup.type !== 'full' // Keep monthly full backups longer
      );

      let deletedCount = 0;
      let freedSpace = 0;

      for (const backup of backupsToDelete) {
        try {
          // Remove backup file/directory
          const stats = await fs.stat(backup.path);
          if (stats.isDirectory()) {
            await fs.rm(backup.path, { recursive: true, force: true });
          } else {
            await fs.unlink(backup.path);
          }

          // Remove metadata
          await this.deleteBackupMetadata(backup.id);

          deletedCount++;
          freedSpace += backup.size;

          logger.debug('Deleted backup', { id: backup.id, size: backup.size });

        } catch (error) {
          logger.warn('Failed to delete backup', { id: backup.id, error });
        }
      }

      logger.info('Backup cleanup completed', { 
        deletedCount, 
        freedSpace,
        remainingBackups: allBackups.length - deletedCount
      });

    } catch (error) {
      logger.error('Backup cleanup failed', error);
      throw error;
    }
  }

  /**
   * Test backup integrity
   */
  async testBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      logger.info('Testing backup integrity', { backupId });

      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // Check if backup file exists
      try {
        await fs.access(metadata.path);
      } catch {
        logger.error('Backup file not found', { backupId, path: metadata.path });
        return false;
      }

      // Verify checksum
      const currentChecksum = metadata.path.includes('.') 
        ? await this.calculateChecksum(metadata.path)
        : await this.calculateDirectoryChecksum(metadata.path);

      if (currentChecksum !== metadata.checksum) {
        logger.error('Backup checksum mismatch', { 
          backupId, 
          expected: metadata.checksum, 
          actual: currentChecksum 
        });
        return false;
      }

      // For full backups, try to create a test restore
      if (metadata.type === 'full') {
        const testDbName = `test_restore_${backupId.replace(/[^a-z0-9]/gi, '_')}`;
        
        try {
          await this.restoreFromBackup(backupId, testDbName);
          await this.validateRestoredData(testDbName);
          await this.dropDatabase(testDbName);

          logger.info('Backup integrity test passed', { backupId });
          return true;

        } catch (error) {
          logger.error('Backup integrity test failed during restore', { backupId, error });
          
          // Cleanup test database if it exists
          try {
            await this.dropDatabase(testDbName);
          } catch {
            // Ignore cleanup errors
          }
          
          return false;
        }
      }

      logger.info('Backup integrity test passed', { backupId });
      return true;

    } catch (error) {
      logger.error('Backup integrity test failed', { backupId, error });
      return false;
    }
  }

  /**
   * Get backup status and statistics
   */
  async getBackupStatus(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackup?: BackupMetadata;
    healthStatus: 'healthy' | 'warning' | 'critical';
    issues: string[];
  }> {
    try {
      const allBackups = await this.listAllBackups();
      const totalSize = allBackups.reduce((sum, backup) => sum + backup.size, 0);
      const lastBackup = allBackups
        .filter(b => b.success)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      const issues: string[] = [];
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

      // Check if last backup is too old
      if (!lastBackup) {
        issues.push('Ingen vellykkede backups funnet');
        healthStatus = 'critical';
      } else {
        const hoursSinceLastBackup = (Date.now() - lastBackup.timestamp.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastBackup > 48) {
          issues.push(`Siste backup er ${Math.round(hoursSinceLastBackup)} timer gammel`);
          healthStatus = 'critical';
        } else if (hoursSinceLastBackup > 24) {
          issues.push(`Siste backup er ${Math.round(hoursSinceLastBackup)} timer gammel`);
          healthStatus = 'warning';
        }
      }

      // Check for failed backups in last 7 days
      const recentFailures = allBackups.filter(backup => 
        !backup.success && 
        backup.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (recentFailures.length > 0) {
        issues.push(`${recentFailures.length} feilede backups siste 7 dager`);
        if (healthStatus === 'healthy') healthStatus = 'warning';
      }

      return {
        totalBackups: allBackups.length,
        totalSize,
        lastBackup,
        healthStatus,
        issues
      };

    } catch (error) {
      logger.error('Failed to get backup status', error);
      return {
        totalBackups: 0,
        totalSize: 0,
        healthStatus: 'critical',
        issues: ['Kunne ikke hente backup status']
      };
    }
  }

  // Helper methods...

  private buildPgDumpCommand(outputPath: string, type: 'full' | 'schema-only'): string {
    const url = new URL(this.config.databaseUrl);
    const options = [
      '--verbose',
      '--clean',
      '--if-exists',
      '--create',
      type === 'schema-only' ? '--schema-only' : '--data-only'
    ];

    return `PGPASSWORD="${url.password}" pg_dump ${options.join(' ')} -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -d "${url.pathname.slice(1)}" -f "${outputPath}"`;
  }

  private buildWalBackupCommand(backupId: string): string {
    const url = new URL(this.config.databaseUrl);
    const walDir = path.join(this.backupDir, 'incremental', backupId);
    
    return `PGPASSWORD="${url.password}" pg_receivewal -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -D "${walDir}" -v`;
  }

  private buildRestoreCommand(backupPath: string, targetDb?: string): string {
    const url = new URL(this.config.databaseUrl);
    const dbName = targetDb || url.pathname.slice(1);
    
    return `PGPASSWORD="${url.password}" psql -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -d "${dbName}" -f "${backupPath}"`;
  }

  private async compressBackup(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`;
    await execAsync(`gzip -${this.config.compressionLevel} "${filePath}"`);
    return compressedPath;
  }

  private async encryptBackup(filePath: string): Promise<string> {
    const encryptedPath = `${filePath}.enc`;
    await execAsync(`openssl enc -aes-256-cbc -salt -in "${filePath}" -out "${encryptedPath}" -k "${this.config.encryptionKey}"`);
    return encryptedPath;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const { stdout } = await execAsync(`sha256sum "${filePath}"`);
    return stdout.split(' ')[0];
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.backupDir, 'logs', `${metadata.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Cache metadata for quick access
    await cacheService.set(`backup:metadata:${metadata.id}`, metadata, 86400); // 24 hours
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      // Try cache first
      const cached = await cacheService.get(`backup:metadata:${backupId}`);
      if (cached) {
        return cached as BackupMetadata;
      }

      // Read from file
      const metadataPath = path.join(this.backupDir, 'logs', `${backupId}.json`);
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content) as BackupMetadata;
      
      // Update cache
      await cacheService.set(`backup:metadata:${backupId}`, metadata, 86400);
      
      return metadata;
    } catch {
      return null;
    }
  }

  private async listAllBackups(): Promise<BackupMetadata[]> {
    try {
      const logsDir = path.join(this.backupDir, 'logs');
      const files = await fs.readdir(logsDir);
      const metadataFiles = files.filter(file => file.endsWith('.json'));

      const backups: BackupMetadata[] = [];
      
      for (const file of metadataFiles) {
        try {
          const content = await fs.readFile(path.join(logsDir, file), 'utf-8');
          const metadata = JSON.parse(content) as BackupMetadata;
          metadata.timestamp = new Date(metadata.timestamp); // Ensure Date object
          backups.push(metadata);
        } catch (error) {
          logger.warn('Failed to parse backup metadata', { file, error });
        }
      }

      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch {
      return [];
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`du -sb "${dirPath}"`);
      return parseInt(stdout.split('\t')[0]);
    } catch {
      return 0;
    }
  }

  private async calculateDirectoryChecksum(dirPath: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`find "${dirPath}" -type f -exec sha256sum {} \\; | sort -k 2 | sha256sum`);
      return stdout.split(' ')[0];
    } catch {
      return '';
    }
  }

  private async verifyBackupIntegrity(path: string, metadata: BackupMetadata): Promise<void> {
    const currentChecksum = metadata.path.includes('.') 
      ? await this.calculateChecksum(path)
      : await this.calculateDirectoryChecksum(path);

    if (currentChecksum !== metadata.checksum) {
      throw new Error(`Backup integrity check failed: checksum mismatch`);
    }
  }

  private async findBaseBackupForPITR(targetTime: Date): Promise<BackupMetadata | null> {
    const allBackups = await this.listAllBackups();
    const fullBackups = allBackups
      .filter(backup => backup.type === 'full' && backup.success && backup.timestamp < targetTime)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return fullBackups[0] || null;
  }

  private async findWalFilesForPITR(start: Date, end: Date): Promise<string[]> {
    const incrementalDir = path.join(this.backupDir, 'incremental');
    
    try {
      const dirs = await fs.readdir(incrementalDir);
      const walFiles: string[] = [];

      for (const dir of dirs) {
        const dirPath = path.join(incrementalDir, dir);
        const metadata = await this.getBackupMetadata(dir);
        
        if (metadata && metadata.type === 'incremental' && 
            metadata.timestamp >= start && metadata.timestamp <= end) {
          
          const files = await fs.readdir(dirPath);
          walFiles.push(...files.map(file => path.join(dirPath, file)));
        }
      }

      return walFiles.sort();
    } catch {
      return [];
    }
  }

  private async applyWalFile(walFile: string, targetDb?: string): Promise<void> {
    const url = new URL(this.config.databaseUrl);
    const dbName = targetDb || url.pathname.slice(1);
    
    const command = `PGPASSWORD="${url.password}" pg_waldump "${walFile}" | psql -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -d "${dbName}"`;
    await execAsync(command);
  }

  private async validateRestoredData(dbName: string): Promise<void> {
    const url = new URL(this.config.databaseUrl);
    
    // Basic validation queries
    const validationQueries = [
      'SELECT COUNT(*) FROM information_schema.tables;',
      'SELECT COUNT(*) FROM "Bedrift";',
      'SELECT COUNT(*) FROM "Ansatt";'
    ];

    for (const query of validationQueries) {
      const command = `PGPASSWORD="${url.password}" psql -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -d "${dbName}" -c "${query}"`;
      await execAsync(command);
    }
  }

  private async dropDatabase(dbName: string): Promise<void> {
    const url = new URL(this.config.databaseUrl);
    
    // Terminate connections first
    const terminateCommand = `PGPASSWORD="${url.password}" psql -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -d "postgres" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}';"`;
    
    try {
      await execAsync(terminateCommand);
    } catch {
      // Ignore errors if database doesn't exist
    }

    // Drop database
    const dropCommand = `PGPASSWORD="${url.password}" psql -h "${url.hostname}" -p "${url.port}" -U "${url.username}" -d "postgres" -c "DROP DATABASE IF EXISTS \\"${dbName}\\""`;
    await execAsync(dropCommand);
  }

  private async deleteBackupMetadata(backupId: string): Promise<void> {
    try {
      const metadataPath = path.join(this.backupDir, 'logs', `${backupId}.json`);
      await fs.unlink(metadataPath);
      await cacheService.del(`backup:metadata:${backupId}`);
    } catch {
      // Ignore errors if file doesn't exist
    }
  }

  private async decryptBackup(filePath: string): Promise<string> {
    const decryptedPath = filePath.replace('.enc', '');
    await execAsync(`openssl enc -aes-256-cbc -d -in "${filePath}" -out "${decryptedPath}" -k "${this.config.encryptionKey}"`);
    return decryptedPath;
  }

  private async decompressBackup(filePath: string): Promise<string> {
    const decompressedPath = filePath.replace('.gz', '');
    await execAsync(`gunzip -c "${filePath}" > "${decompressedPath}"`);
    return decompressedPath;
  }

  private async uploadToS3(filePath: string, metadata: BackupMetadata): Promise<void> {
    // Implementer S3 upload hvis AWS SDK er tilgjengelig
    // For nå logg bare at feature er tilgjengelig
    logger.info('S3 upload feature available but not implemented', { 
      filePath, 
      bucket: this.config.s3Bucket,
      backupId: metadata.id
    });
  }
}

// Configuration
const backupConfig: BackupConfig = {
  databaseUrl: process.env.DATABASE_URL || '',
  backupDir: process.env.BACKUP_DIR || './backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  compressionLevel: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  s3Bucket: process.env.BACKUP_S3_BUCKET,
  schedule: {
    daily: '0 2 * * *',   // 02:00 daily
    weekly: '0 3 * * 0',  // 03:00 on Sundays
    monthly: '0 4 1 * *'  // 04:00 on 1st of month
  }
};

export const backupService = new DatabaseBackupService(backupConfig);
export { DatabaseBackupService, BackupConfig, BackupMetadata }; 