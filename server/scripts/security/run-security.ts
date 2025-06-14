#!/usr/bin/env node

/**
 * Security Operations Runner
 * 
 * Unified interface for alle sikkerhetsfunksjoner:
 * - Security testing
 * - Security audit
 * - HTTPS setup
 * - Vulnerability scanning
 */

import logger from '../../src/utils/logger';
import { runSecurityTests } from './security-test';
import { runSecurityAudit } from './security-audit';
import { setupHTTPS, checkCertificateStatus } from './https-setup';

// ============================================================================
// MAIN SECURITY RUNNER
// ============================================================================

interface SecurityRunnerConfig {
  environment: 'development' | 'staging' | 'production';
  skipTests: boolean;
  skipAudit: boolean;
  setupSSL: boolean;
  productionSSL: boolean;
}

/**
 * Run comprehensive security operations
 */
async function runComprehensiveSecurity(config: SecurityRunnerConfig): Promise<void> {
  try {
    logger.info('Starting comprehensive security operations...', config);

    console.log('\n🔒 TMS SECURITY OPERATIONS SUITE');
    console.log('=================================\n');

    let allPassed = true;
    const results: Array<{ operation: string; passed: boolean; message: string }> = [];

    // 1. Security Audit
    if (!config.skipAudit) {
      console.log('📋 Running Security Audit...\n');
      try {
        await runSecurityAudit();
        results.push({
          operation: 'Security Audit',
          passed: true,
          message: 'All security audits passed'
        });
      } catch (error) {
        allPassed = false;
        results.push({
          operation: 'Security Audit',
          passed: false,
          message: `Security audit failed: ${(error as Error).message}`
        });
      }
    }

    // 2. Security Testing
    if (!config.skipTests) {
      console.log('\n🧪 Running Security Tests...\n');
      try {
        await runSecurityTests();
        results.push({
          operation: 'Security Testing',
          passed: true,
          message: 'All security tests passed'
        });
      } catch (error) {
        allPassed = false;
        results.push({
          operation: 'Security Testing',
          passed: false,
          message: `Security testing failed: ${(error as Error).message}`
        });
      }
    }

    // 3. SSL/HTTPS Setup
    if (config.setupSSL) {
      console.log('\n🔐 Setting up HTTPS...\n');
      try {
        await setupHTTPS(config.productionSSL);
        results.push({
          operation: 'HTTPS Setup',
          passed: true,
          message: 'HTTPS configured successfully'
        });
      } catch (error) {
        allPassed = false;
        results.push({
          operation: 'HTTPS Setup',
          passed: false,
          message: `HTTPS setup failed: ${(error as Error).message}`
        });
      }
    } else {
      // Just check certificate status
      console.log('\n🔍 Checking SSL Certificate Status...\n');
      try {
        await checkCertificateStatus();
        results.push({
          operation: 'SSL Certificate Check',
          passed: true,
          message: 'Certificate status checked'
        });
      } catch (error) {
        results.push({
          operation: 'SSL Certificate Check',
          passed: false,
          message: `Certificate check failed: ${(error as Error).message}`
        });
      }
    }

    // 4. Generate Security Report
    console.log('\n📊 SECURITY OPERATIONS SUMMARY');
    console.log('==============================\n');

    results.forEach(result => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} ${result.operation}`);
      console.log(`   ${result.message}\n`);
    });

    // Overall assessment
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const passRate = Math.round((passedCount / totalCount) * 100);

    console.log('=== OVERALL SECURITY STATUS ===');
    console.log(`Operations: ${passedCount}/${totalCount} passed (${passRate}%)`);
    
    if (allPassed) {
      console.log('🎉 EXCELLENT: All security operations completed successfully!');
      console.log('🚀 Application is ready for secure deployment');
      
      if (config.environment === 'production') {
        console.log('\n📋 PRODUCTION DEPLOYMENT CHECKLIST:');
        console.log('✅ Security audit passed');
        console.log('✅ Security tests passed');
        console.log('✅ HTTPS configured');
        console.log('✅ All security measures in place');
      }
    } else {
      console.log('⚠️  WARNING: Some security operations failed');
      console.log('🔧 Review failed operations before deployment');
      
      const failedOps = results.filter(r => !r.passed);
      if (failedOps.some(op => op.operation.includes('Audit') || op.operation.includes('Testing'))) {
        console.log('🚨 CRITICAL: Security audit or testing failed - address immediately!');
        process.exit(1);
      }
    }

    logger.info('Security operations completed', {
      environment: config.environment,
      passedOperations: passedCount,
      totalOperations: totalCount,
      allPassed
    });

  } catch (error) {
    logger.error('Security operations failed', error);
    console.log('\n❌ SECURITY OPERATIONS FAILED');
    console.log(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// ============================================================================
// ENVIRONMENT-SPECIFIC PRESETS
// ============================================================================

/**
 * Development environment security setup
 */
async function setupDevelopment(): Promise<void> {
  console.log('🔧 Setting up DEVELOPMENT security...\n');
  
  const config: SecurityRunnerConfig = {
    environment: 'development',
    skipTests: false,
    skipAudit: false,
    setupSSL: true,
    productionSSL: false
  };

  await runComprehensiveSecurity(config);
}

/**
 * Staging environment security setup
 */
async function setupStaging(): Promise<void> {
  console.log('🚧 Setting up STAGING security...\n');
  
  const config: SecurityRunnerConfig = {
    environment: 'staging',
    skipTests: false,
    skipAudit: false,
    setupSSL: true,
    productionSSL: true
  };

  await runComprehensiveSecurity(config);
}

/**
 * Production environment security setup
 */
async function setupProduction(): Promise<void> {
  console.log('🚀 Setting up PRODUCTION security...\n');
  
  // Validate required environment variables
  const requiredVars = ['SSL_DOMAIN', 'SSL_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables for production:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nSet these environment variables before running production setup.');
    process.exit(1);
  }
  
  const config: SecurityRunnerConfig = {
    environment: 'production',
    skipTests: false,
    skipAudit: false,
    setupSSL: true,
    productionSSL: true
  };

  await runComprehensiveSecurity(config);
}

/**
 * Quick security check (audit and testing only)
 */
async function quickSecurityCheck(): Promise<void> {
  console.log('⚡ Running QUICK security check...\n');
  
  const config: SecurityRunnerConfig = {
    environment: 'development',
    skipTests: false,
    skipAudit: false,
    setupSSL: false,
    productionSSL: false
  };

  await runComprehensiveSecurity(config);
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'dev':
      case 'development':
        await setupDevelopment();
        break;
        
      case 'staging':
        await setupStaging();
        break;
        
      case 'prod':
      case 'production':
        await setupProduction();
        break;
        
      case 'check':
      case 'quick':
        await quickSecurityCheck();
        break;
        
      case 'custom':
        const config: SecurityRunnerConfig = {
          environment: (args.find(a => a.startsWith('--env='))?.split('=')[1] as any) || 'development',
          skipTests: args.includes('--skip-tests'),
          skipAudit: args.includes('--skip-audit'),
          setupSSL: args.includes('--setup-ssl'),
          productionSSL: args.includes('--production-ssl')
        };
        
        await runComprehensiveSecurity(config);
        break;
        
      default:
        console.log(`
🔒 TMS Security Operations Suite

Usage:
  node run-security.ts <command> [options]

Commands:
  dev                    Setup development security (self-signed SSL)
  staging                Setup staging security (Let's Encrypt SSL)
  production             Setup production security (full validation)
  check                  Quick security check (audit + tests only)
  custom [options]       Custom security setup with options

Custom Options:
  --env=<environment>    Set environment (development/staging/production)
  --skip-tests          Skip security testing
  --skip-audit          Skip security audit
  --setup-ssl           Setup SSL certificates
  --production-ssl      Use Let's Encrypt for SSL

Environment Variables (for production):
  SSL_DOMAIN            Domain name for SSL certificate
  SSL_EMAIL             Email for Let's Encrypt registration
  TEST_BASE_URL         Base URL for security testing

Examples:
  node run-security.ts dev
  node run-security.ts production
  node run-security.ts check
  node run-security.ts custom --env=staging --setup-ssl --production-ssl
  SSL_DOMAIN=example.com SSL_EMAIL=admin@example.com node run-security.ts production

Security Operations Included:
  📋 Security Audit      - Dependencies, configuration, permissions, code
  🧪 Security Testing    - Headers, rate limiting, authentication, validation
  🔐 HTTPS Setup         - SSL certificates, HTTPS enforcement
  📊 Security Report     - Comprehensive security status and recommendations
        `);
        break;
    }

  } catch (error) {
    logger.error('Security runner command failed', { command, error });
    console.log(`\n❌ Command failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  runComprehensiveSecurity,
  setupDevelopment,
  setupStaging,
  setupProduction,
  quickSecurityCheck
}; 