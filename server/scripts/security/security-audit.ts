#!/usr/bin/env node

/**
 * Security Audit Script
 * 
 * Comprehensive security audit av TMS applikasjonen
 * inkludert dependencies, konfiguration, og sikkerhetsrutiner
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../../src/utils/logger';

const execAsync = promisify(exec);

// ============================================================================
// AUDIT CONFIGURATION
// ============================================================================

interface SecurityAuditResult {
  category: string;
  passed: boolean;
  score: number;
  maxScore: number;
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
  }>;
}

interface AuditConfig {
  projectRoot: string;
  serverRoot: string;
  clientRoot: string;
  excludePaths: string[];
}

const auditConfig: AuditConfig = {
  projectRoot: path.resolve(__dirname, '../../../'),
  serverRoot: path.resolve(__dirname, '../../'),
  clientRoot: path.resolve(__dirname, '../../../client'),
  excludePaths: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    'logs'
  ]
};

// ============================================================================
// DEPENDENCY SECURITY AUDIT
// ============================================================================

/**
 * Audit npm dependencies for security vulnerabilities
 */
async function auditDependencies(): Promise<SecurityAuditResult> {
  const issues: SecurityAuditResult['issues'] = [];
  let score = 100;
  const maxScore = 100;

  try {
    logger.info('Auditing dependencies for security vulnerabilities...');

    // Server dependencies
    try {
      const { stdout: serverAudit } = await execAsync('npm audit --json', {
        cwd: auditConfig.serverRoot
      });
      
      const serverAuditData = JSON.parse(serverAudit);
      
      if (serverAuditData.vulnerabilities) {
        Object.entries(serverAuditData.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
          const severity = vuln.severity as 'low' | 'medium' | 'high' | 'critical';
          
          issues.push({
            severity,
            title: `Server Dependency Vulnerability: ${pkg}`,
            description: `${vuln.title || 'Security vulnerability'} in ${pkg}`,
            recommendation: `Run 'npm audit fix' or update ${pkg} to a secure version`
          });

          // Deduct score based on severity
          switch (severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 10; break;
            case 'low': score -= 5; break;
          }
        });
      }
    } catch (serverError) {
      const errorOutput = (serverError as any).stdout || (serverError as any).stderr;
      if (errorOutput?.includes('vulnerabilities')) {
        issues.push({
          severity: 'medium',
          title: 'Server Dependencies Audit Failed',
          description: 'Could not complete server dependencies audit',
          recommendation: 'Run npm audit manually to check for vulnerabilities'
        });
        score -= 10;
      }
    }

    // Client dependencies
    try {
      const { stdout: clientAudit } = await execAsync('npm audit --json', {
        cwd: auditConfig.clientRoot
      });
      
      const clientAuditData = JSON.parse(clientAudit);
      
      if (clientAuditData.vulnerabilities) {
        Object.entries(clientAuditData.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
          const severity = vuln.severity as 'low' | 'medium' | 'high' | 'critical';
          
          issues.push({
            severity,
            title: `Client Dependency Vulnerability: ${pkg}`,
            description: `${vuln.title || 'Security vulnerability'} in ${pkg}`,
            recommendation: `Run 'npm audit fix' in client directory or update ${pkg}`
          });

          switch (severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 10; break;
            case 'low': score -= 5; break;
          }
        });
      }
    } catch (clientError) {
      const errorOutput = (clientError as any).stdout || (clientError as any).stderr;
      if (errorOutput?.includes('vulnerabilities')) {
        issues.push({
          severity: 'medium',
          title: 'Client Dependencies Audit Failed',
          description: 'Could not complete client dependencies audit',
          recommendation: 'Run npm audit manually in client directory'
        });
        score -= 10;
      }
    }

    // Check for outdated dependencies
    try {
      const { stdout: outdatedServer } = await execAsync('npm outdated --json', {
        cwd: auditConfig.serverRoot
      });
      
      if (outdatedServer.trim()) {
        const outdatedData = JSON.parse(outdatedServer);
        const outdatedCount = Object.keys(outdatedData).length;
        
        if (outdatedCount > 5) {
          issues.push({
            severity: 'low',
            title: `${outdatedCount} Outdated Server Dependencies`,
            description: 'Multiple dependencies are outdated and may contain security fixes',
            recommendation: 'Review and update outdated dependencies regularly'
          });
          score -= 5;
        }
      }
    } catch {
      // npm outdated returns non-zero exit code when packages are outdated
      // This is expected behavior
    }

  } catch (error) {
    logger.error('Dependency audit failed', error);
    issues.push({
      severity: 'high',
      title: 'Dependency Audit Failed',
      description: 'Could not complete dependency security audit',
      recommendation: 'Check npm configuration and network connectivity'
    });
    score -= 20;
  }

  return {
    category: 'Dependencies',
    passed: score >= 80,
    score: Math.max(0, score),
    maxScore,
    issues
  };
}

// ============================================================================
// CONFIGURATION SECURITY AUDIT
// ============================================================================

/**
 * Audit application configuration for security issues
 */
async function auditConfiguration(): Promise<SecurityAuditResult> {
  const issues: SecurityAuditResult['issues'] = [];
  let score = 100;
  const maxScore = 100;

  try {
    logger.info('Auditing application configuration...');

    // Check for .env files in production
    const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
    
    for (const envFile of envFiles) {
      try {
        const envPath = path.join(auditConfig.projectRoot, envFile);
        await fs.access(envPath);
        
        const envContent = await fs.readFile(envPath, 'utf-8');
        
        // Check for hardcoded secrets
        const secretPatterns = [
          /password\s*=\s*['"]\w+['"]/i,
          /secret\s*=\s*['"]\w+['"]/i,
          /api_key\s*=\s*['"]\w+['"]/i,
          /private_key\s*=\s*['"]\w+['"]/i
        ];

        secretPatterns.forEach(pattern => {
          if (pattern.test(envContent)) {
            issues.push({
              severity: 'high',
              title: `Hardcoded Secret in ${envFile}`,
              description: 'Environment file contains hardcoded secrets',
              recommendation: 'Use environment variables or secure secret management'
            });
            score -= 15;
          }
        });

        // Check for weak default passwords
        if (envContent.includes('password=password') || envContent.includes('password=123456')) {
          issues.push({
            severity: 'critical',
            title: `Weak Default Password in ${envFile}`,
            description: 'Environment file contains weak default passwords',
            recommendation: 'Change all default passwords to strong, unique values'
          });
          score -= 25;
        }

      } catch {
        // File doesn't exist, which is fine
      }
    }

    // Check server configuration files
    const configFiles = [
      'src/config/database.ts',
      'src/config/auth.ts',
      'src/config/index.ts'
    ];

    for (const configFile of configFiles) {
      try {
        const configPath = path.join(auditConfig.serverRoot, configFile);
        const configContent = await fs.readFile(configPath, 'utf-8');

        // Check for debug mode in production
        if (configContent.includes('debug: true') || configContent.includes('NODE_ENV: "development"')) {
          issues.push({
            severity: 'medium',
            title: `Debug Mode Enabled in ${configFile}`,
            description: 'Debug mode may expose sensitive information in production',
            recommendation: 'Ensure debug mode is disabled in production builds'
          });
          score -= 10;
        }

        // Check for insecure cookie settings
        if (configContent.includes('secure: false') || configContent.includes('httpOnly: false')) {
          issues.push({
            severity: 'high',
            title: `Insecure Cookie Settings in ${configFile}`,
            description: 'Cookies are not configured securely',
            recommendation: 'Set secure: true and httpOnly: true for all cookies'
          });
          score -= 15;
        }

      } catch {
        // File doesn't exist, continue
      }
    }

    // Check package.json for security configurations
    try {
      const packagePath = path.join(auditConfig.serverRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageData = JSON.parse(packageContent);

      // Check for security-related scripts
      if (!packageData.scripts?.['security:audit']) {
        issues.push({
          severity: 'low',
          title: 'Missing Security Audit Script',
          description: 'No security audit script defined in package.json',
          recommendation: 'Add security audit scripts for regular security checks'
        });
        score -= 5;
      }

      // Check for overly permissive engines
      if (!packageData.engines?.node) {
        issues.push({
          severity: 'low',
          title: 'Node.js Version Not Specified',
          description: 'Node.js version not specified in package.json',
          recommendation: 'Specify supported Node.js versions for security consistency'
        });
        score -= 5;
      }

    } catch (error) {
      issues.push({
        severity: 'medium',
        title: 'Package.json Audit Failed',
        description: 'Could not audit package.json configuration',
        recommendation: 'Ensure package.json is valid and accessible'
      });
      score -= 10;
    }

  } catch (error) {
    logger.error('Configuration audit failed', error);
    score -= 20;
  }

  return {
    category: 'Configuration',
    passed: score >= 80,
    score: Math.max(0, score),
    maxScore,
    issues
  };
}

// ============================================================================
// FILE PERMISSIONS AUDIT
// ============================================================================

/**
 * Audit file permissions for security issues
 */
async function auditFilePermissions(): Promise<SecurityAuditResult> {
  const issues: SecurityAuditResult['issues'] = [];
  let score = 100;
  const maxScore = 100;

  try {
    logger.info('Auditing file permissions...');

    const criticalFiles = [
      'package.json',
      'package-lock.json',
      '.env',
      '.env.production',
      'src/config',
      'scripts'
    ];

    for (const file of criticalFiles) {
      try {
        const filePath = path.join(auditConfig.serverRoot, file);
        const stats = await fs.stat(filePath);
        const mode = stats.mode.toString(8);

        // Check for overly permissive permissions (world-writable)
        if (mode.endsWith('6') || mode.endsWith('7')) {
          issues.push({
            severity: 'high',
            title: `Overly Permissive Permissions: ${file}`,
            description: `File ${file} is world-writable (${mode})`,
            recommendation: `Change permissions to 644 or 640 for ${file}`
          });
          score -= 15;
        }

        // Check for executable permissions on non-script files
        if (!file.includes('script') && !file.startsWith('.') && 
            (mode.endsWith('1') || mode.endsWith('3') || mode.endsWith('5') || mode.endsWith('7'))) {
          
          const fileContent = await fs.readFile(filePath, 'utf-8').catch(() => '');
          if (!fileContent.startsWith('#!')) {
            issues.push({
              severity: 'medium',
              title: `Unnecessary Execute Permission: ${file}`,
              description: `Non-script file ${file} has execute permissions`,
              recommendation: `Remove execute permissions from ${file}`
            });
            score -= 10;
          }
        }

      } catch {
        // File doesn't exist, continue
      }
    }

    // Check for sensitive files that shouldn't exist
    const sensitiveFiles = [
      '.git/config',
      'id_rsa',
      'id_dsa',
      '.ssh/id_rsa',
      'private.key',
      'server.key'
    ];

    for (const sensitiveFile of sensitiveFiles) {
      try {
        const filePath = path.join(auditConfig.projectRoot, sensitiveFile);
        await fs.access(filePath);
        
        issues.push({
          severity: 'critical',
          title: `Sensitive File Exposed: ${sensitiveFile}`,
          description: `Sensitive file ${sensitiveFile} is present in project directory`,
          recommendation: `Remove ${sensitiveFile} and add to .gitignore`
        });
        score -= 25;

      } catch {
        // File doesn't exist, which is good
      }
    }

  } catch (error) {
    logger.error('File permissions audit failed', error);
    score -= 20;
  }

  return {
    category: 'File Permissions',
    passed: score >= 80,
    score: Math.max(0, score),
    maxScore,
    issues
  };
}

// ============================================================================
// CODE SECURITY AUDIT
// ============================================================================

/**
 * Audit source code for security issues
 */
async function auditSourceCode(): Promise<SecurityAuditResult> {
  const issues: SecurityAuditResult['issues'] = [];
  let score = 100;
  const maxScore = 100;

  try {
    logger.info('Auditing source code for security issues...');

    // Get all TypeScript and JavaScript files
    const { stdout: fileList } = await execAsync(
      `find ${auditConfig.serverRoot} -name "*.ts" -o -name "*.js" | grep -v node_modules | head -100`
    );

    const files = fileList.trim().split('\n').filter(f => f.length > 0);

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const relativePath = path.relative(auditConfig.serverRoot, file);

        // Check for SQL injection vulnerabilities
        const sqlPatterns = [
          /\$\{[^}]*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/gi,
          /`[^`]*\$\{[^}]*\}[^`]*`.*(?:SELECT|INSERT|UPDATE|DELETE)/gi,
          /"[^"]*\$\{[^}]*\}[^"]*".*(?:SELECT|INSERT|UPDATE|DELETE)/gi
        ];

        sqlPatterns.forEach((pattern, index) => {
          if (pattern.test(content)) {
            issues.push({
              severity: 'critical',
              title: `Potential SQL Injection: ${relativePath}`,
              description: 'Template literal used in SQL query may be vulnerable to injection',
              recommendation: 'Use parameterized queries or prepared statements'
            });
            score -= 25;
          }
        });

        // Check for hardcoded secrets
        const secretPatterns = [
          /(?:password|secret|token|key)\s*[:=]\s*['"]\w{8,}['"]/gi,
          /(?:api_key|apikey|access_token)\s*[:=]\s*['"]\w+['"]/gi
        ];

        secretPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              if (!match.includes('process.env') && !match.includes('config.')) {
                issues.push({
                  severity: 'high',
                  title: `Hardcoded Secret: ${relativePath}`,
                  description: `Potential hardcoded secret found: ${match.substring(0, 50)}...`,
                  recommendation: 'Move secrets to environment variables or config files'
                });
                score -= 15;
              }
            });
          }
        });

        // Check for eval() usage
        if (content.includes('eval(')) {
          issues.push({
            severity: 'critical',
            title: `Eval Usage: ${relativePath}`,
            description: 'Use of eval() function poses security risk',
            recommendation: 'Remove eval() usage and use safer alternatives'
          });
          score -= 25;
        }

        // Check for console.log in production code
        const consoleMatches = content.match(/console\.(log|debug|info)/g);
        if (consoleMatches && consoleMatches.length > 5) {
          issues.push({
            severity: 'low',
            title: `Excessive Console Logging: ${relativePath}`,
            description: `Found ${consoleMatches.length} console.log statements`,
            recommendation: 'Replace console logging with proper logging framework'
          });
          score -= 5;
        }

        // Check for TODO/FIXME comments related to security
        const securityTodos = content.match(/(?:TODO|FIXME|HACK).*(?:security|auth|password|token)/gi);
        if (securityTodos) {
          securityTodos.forEach(todo => {
            issues.push({
              severity: 'medium',
              title: `Security TODO: ${relativePath}`,
              description: `Unresolved security TODO: ${todo}`,
              recommendation: 'Address security-related TODO items before production'
            });
            score -= 10;
          });
        }

      } catch (error) {
        // Continue with next file
      }
    }

  } catch (error) {
    logger.error('Source code audit failed', error);
    score -= 20;
  }

  return {
    category: 'Source Code',
    passed: score >= 80,
    score: Math.max(0, score),
    maxScore,
    issues
  };
}

// ============================================================================
// MAIN AUDIT RUNNER
// ============================================================================

/**
 * Run comprehensive security audit
 */
async function runSecurityAudit(): Promise<void> {
  try {
    logger.info('Starting comprehensive security audit...');

    const auditResults = await Promise.all([
      auditDependencies(),
      auditConfiguration(),
      auditFilePermissions(),
      auditSourceCode()
    ]);

    // Generate report
    console.log('\n=== SECURITY AUDIT REPORT ===\n');

    let totalScore = 0;
    let maxTotalScore = 0;
    let criticalIssues = 0;
    let highIssues = 0;

    auditResults.forEach(result => {
      totalScore += result.score;
      maxTotalScore += result.maxScore;
      
      console.log(`📋 ${result.category.toUpperCase()}`);
      console.log(`Score: ${result.score}/${result.maxScore} (${Math.round((result.score / result.maxScore) * 100)}%)`);
      console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('');

      if (result.issues.length > 0) {
        console.log('Issues:');
        result.issues.forEach(issue => {
          const severityIcon = {
            low: '🟡',
            medium: '🟠', 
            high: '🔴',
            critical: '🚨'
          }[issue.severity];

          console.log(`  ${severityIcon} ${issue.severity.toUpperCase()}: ${issue.title}`);
          console.log(`     ${issue.description}`);
          console.log(`     💡 ${issue.recommendation}`);
          console.log('');

          if (issue.severity === 'critical') criticalIssues++;
          if (issue.severity === 'high') highIssues++;
        });
      } else {
        console.log('✅ No issues found');
        console.log('');
      }
      
      console.log('');
    });

    // Overall assessment
    const overallScore = Math.round((totalScore / maxTotalScore) * 100);
    
    console.log('=== OVERALL SECURITY ASSESSMENT ===');
    console.log(`Overall Score: ${totalScore}/${maxTotalScore} (${overallScore}%)`);
    console.log(`Critical Issues: ${criticalIssues}`);
    console.log(`High Severity Issues: ${highIssues}`);
    console.log('');

    if (criticalIssues > 0) {
      console.log('🚨 CRITICAL: Application has critical security vulnerabilities!');
      console.log('🔧 IMMEDIATE ACTION REQUIRED: Fix critical issues before deployment');
      process.exit(1);
    } else if (overallScore >= 90) {
      console.log('✅ EXCELLENT: Application has strong security posture');
      console.log('🚀 Recommendation: Safe for production deployment');
    } else if (overallScore >= 80) {
      console.log('⚠️  GOOD: Application has good security, but improvements recommended');
      console.log('🔧 Recommendation: Address remaining issues for optimal security');
    } else if (overallScore >= 70) {
      console.log('🟡 FAIR: Application has moderate security concerns');
      console.log('🔧 Recommendation: Significant improvements needed before production');
    } else {
      console.log('❌ POOR: Application has serious security deficiencies');
      console.log('🔧 CRITICAL: Major security overhaul required');
      process.exit(1);
    }

    // Generate remediation report
    const allIssues = auditResults.flatMap(r => r.issues);
    const criticalAndHigh = allIssues.filter(i => i.severity === 'critical' || i.severity === 'high');
    
    if (criticalAndHigh.length > 0) {
      console.log('\n=== PRIORITY REMEDIATION ITEMS ===');
      criticalAndHigh.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.title}`);
        console.log(`   Severity: ${issue.severity.toUpperCase()}`);
        console.log(`   Action: ${issue.recommendation}`);
        console.log('');
      });
    }

    logger.info('Security audit completed', {
      overallScore,
      totalIssues: allIssues.length,
      criticalIssues,
      highIssues
    });

  } catch (error) {
    logger.error('Security audit failed', error);
    console.log('\n❌ SECURITY AUDIT FAILED');
    console.log(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'run':
      case undefined:
        await runSecurityAudit();
        break;
        
      case 'deps':
        const depsResult = await auditDependencies();
        console.log('Dependencies Audit:', depsResult.passed ? 'PASSED' : 'FAILED');
        console.log(`Score: ${depsResult.score}/${depsResult.maxScore}`);
        depsResult.issues.forEach(i => console.log(`  ${i.severity}: ${i.title}`));
        break;
        
      case 'config':
        const configResult = await auditConfiguration();
        console.log('Configuration Audit:', configResult.passed ? 'PASSED' : 'FAILED');
        console.log(`Score: ${configResult.score}/${configResult.maxScore}`);
        configResult.issues.forEach(i => console.log(`  ${i.severity}: ${i.title}`));
        break;
        
      case 'permissions':
        const permResult = await auditFilePermissions();
        console.log('File Permissions Audit:', permResult.passed ? 'PASSED' : 'FAILED');
        console.log(`Score: ${permResult.score}/${permResult.maxScore}`);
        permResult.issues.forEach(i => console.log(`  ${i.severity}: ${i.title}`));
        break;
        
      case 'code':
        const codeResult = await auditSourceCode();
        console.log('Source Code Audit:', codeResult.passed ? 'PASSED' : 'FAILED');
        console.log(`Score: ${codeResult.score}/${codeResult.maxScore}`);
        codeResult.issues.forEach(i => console.log(`  ${i.severity}: ${i.title}`));
        break;
        
      default:
        console.log(`
Security Audit Tool

Usage:
  node security-audit.ts [command]

Commands:
  run           Run comprehensive security audit (default)
  deps          Audit dependencies only
  config        Audit configuration only
  permissions   Audit file permissions only
  code          Audit source code only

Examples:
  node security-audit.ts run
  node security-audit.ts deps
        `);
        break;
    }

  } catch (error) {
    logger.error('Security audit command failed', { command, error });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  auditDependencies,
  auditConfiguration,
  auditFilePermissions,
  auditSourceCode,
  runSecurityAudit
}; 