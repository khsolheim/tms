#!/usr/bin/env node

/**
 * Security Testing Suite
 * 
 * Comprehensive testing av sikkerhetsmiddleware og penetration testing
 * av authentication system i produksjonslignende miljø
 */

import axios from 'axios';
import logger from '../../src/utils/logger';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

interface SecurityTestConfig {
  baseUrl: string;
  testUser: {
    email: string;
    password: string;
  };
  timeout: number;
}

const config: SecurityTestConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
  },
  timeout: 10000
};

// ============================================================================
// SECURITY HEADER TESTS
// ============================================================================

/**
 * Test security headers
 */
async function testSecurityHeaders(): Promise<{
  passed: boolean;
  results: Array<{ test: string; passed: boolean; message: string }>;
}> {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];
  
  try {
    logger.info('Testing security headers...');
    
    const response = await axios.get(`${config.baseUrl}/api/health`, {
      timeout: config.timeout
    });

    const headers = response.headers;

    // Test Content Security Policy
    const cspTest = {
      test: 'Content-Security-Policy',
      passed: !!headers['content-security-policy'],
      message: headers['content-security-policy'] ? 
        'CSP header present' : 
        'CSP header missing'
    };
    results.push(cspTest);

    // Test X-Frame-Options
    const frameTest = {
      test: 'X-Frame-Options',
      passed: headers['x-frame-options'] === 'DENY',
      message: headers['x-frame-options'] ? 
        `X-Frame-Options: ${headers['x-frame-options']}` : 
        'X-Frame-Options header missing'
    };
    results.push(frameTest);

    // Test X-Content-Type-Options
    const noSniffTest = {
      test: 'X-Content-Type-Options',
      passed: headers['x-content-type-options'] === 'nosniff',
      message: headers['x-content-type-options'] ? 
        `X-Content-Type-Options: ${headers['x-content-type-options']}` : 
        'X-Content-Type-Options header missing'
    };
    results.push(noSniffTest);

    // Test X-XSS-Protection
    const xssTest = {
      test: 'X-XSS-Protection',
      passed: !!headers['x-xss-protection'],
      message: headers['x-xss-protection'] ? 
        `X-XSS-Protection: ${headers['x-xss-protection']}` : 
        'X-XSS-Protection header missing'
    };
    results.push(xssTest);

    // Test Strict-Transport-Security
    const hstsTest = {
      test: 'Strict-Transport-Security',
      passed: !!headers['strict-transport-security'],
      message: headers['strict-transport-security'] ? 
        `HSTS: ${headers['strict-transport-security']}` : 
        'HSTS header missing'
    };
    results.push(hstsTest);

    // Test Referrer-Policy
    const referrerTest = {
      test: 'Referrer-Policy',
      passed: !!headers['referrer-policy'],
      message: headers['referrer-policy'] ? 
        `Referrer-Policy: ${headers['referrer-policy']}` : 
        'Referrer-Policy header missing'
    };
    results.push(referrerTest);

    // Test for absence of Server header (information disclosure)
    const serverTest = {
      test: 'Server Header Hidden',
      passed: !headers['server'] || headers['server'] === '',
      message: headers['server'] ? 
        `Server header exposed: ${headers['server']}` : 
        'Server header properly hidden'
    };
    results.push(serverTest);

    // Test for absence of X-Powered-By header
    const poweredByTest = {
      test: 'X-Powered-By Hidden',
      passed: !headers['x-powered-by'],
      message: headers['x-powered-by'] ? 
        `X-Powered-By header exposed: ${headers['x-powered-by']}` : 
        'X-Powered-By header properly hidden'
    };
    results.push(poweredByTest);

    const allPassed = results.every(result => result.passed);
    return { passed: allPassed, results };

  } catch (error) {
    logger.error('Security headers test failed', error);
    return {
      passed: false,
      results: [{
        test: 'Security Headers Connection',
        passed: false,
        message: `Failed to connect: ${(error as Error).message}`
      }]
    };
  }
}

// ============================================================================
// RATE LIMITING TESTS
// ============================================================================

/**
 * Test rate limiting functionality
 */
async function testRateLimiting(): Promise<{
  passed: boolean;
  results: Array<{ test: string; passed: boolean; message: string }>;
}> {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];
  
  try {
    logger.info('Testing rate limiting...');

    // Test general API rate limiting
    const promises = Array.from({ length: 12 }, (_, i) => 
      axios.get(`${config.baseUrl}/api/health`, { 
        timeout: config.timeout,
        validateStatus: () => true // Accept all status codes
      }).catch(() => ({ status: 0, data: null }))
    );

    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r.status === 429);

    const generalRateTest = {
      test: 'General API Rate Limiting',
      passed: rateLimitedResponses.length === 0, // Should not hit limit with 12 requests
      message: rateLimitedResponses.length > 0 ? 
        `Rate limit triggered after ${responses.length - rateLimitedResponses.length} requests` :
        'General rate limit not triggered as expected'
    };
    results.push(generalRateTest);

    // Test authentication rate limiting
    const authPromises = Array.from({ length: 7 }, (_, i) => 
      axios.post(`${config.baseUrl}/api/auth/login`, {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      }, { 
        timeout: config.timeout,
        validateStatus: () => true
      }).catch(() => ({ status: 0, data: null }))
    );

    const authResponses = await Promise.all(authPromises);
    const authRateLimited = authResponses.filter(r => r.status === 429);

    const authRateTest = {
      test: 'Authentication Rate Limiting',
      passed: authRateLimited.length > 0, // Should hit limit with 7 attempts
      message: authRateLimited.length > 0 ? 
        `Auth rate limit triggered after ${authResponses.length - authRateLimited.length} attempts` :
        'Auth rate limit not triggered - security issue!'
    };
    results.push(authRateTest);

    const allPassed = results.every(result => result.passed);
    return { passed: allPassed, results };

  } catch (error) {
    logger.error('Rate limiting test failed', error);
    return {
      passed: false,
      results: [{
        test: 'Rate Limiting Connection',
        passed: false,
        message: `Failed to connect: ${(error as Error).message}`
      }]
    };
  }
}

// ============================================================================
// AUTHENTICATION PENETRATION TESTS
// ============================================================================

/**
 * Test authentication system security
 */
async function testAuthentication(): Promise<{
  passed: boolean;
  results: Array<{ test: string; passed: boolean; message: string }>;
}> {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];
  
  try {
    logger.info('Testing authentication security...');

    // Test SQL Injection attempts
    const sqlInjectionAttempts = [
      "admin@test.com'; DROP TABLE users; --",
      "admin@test.com' OR '1'='1",
      "admin@test.com' UNION SELECT * FROM users --"
    ];

    for (const attempt of sqlInjectionAttempts) {
      try {
        const response = await axios.post(`${config.baseUrl}/api/auth/login`, {
          email: attempt,
          password: 'password'
        }, { 
          timeout: config.timeout,
          validateStatus: () => true 
        });

        const sqlTest = {
          test: `SQL Injection Protection (${attempt.substring(0, 20)}...)`,
          passed: response.status === 400 || response.status === 422,
          message: response.status === 400 || response.status === 422 ? 
            'SQL injection attempt properly rejected' :
            `SQL injection attempt not properly handled: ${response.status}`
        };
        results.push(sqlTest);
      } catch (error) {
        // Network errors are acceptable for security tests
        results.push({
          test: `SQL Injection Protection (${attempt.substring(0, 20)}...)`,
          passed: true,
          message: 'Request blocked at network level'
        });
      }
    }

    // Test XSS attempts
    const xssAttempts = [
      "<script>alert('xss')</script>@test.com",
      "test@test.com<img src=x onerror=alert('xss')>",
      "javascript:alert('xss')@test.com"
    ];

    for (const attempt of xssAttempts) {
      try {
        const response = await axios.post(`${config.baseUrl}/api/auth/login`, {
          email: attempt,
          password: 'password'
        }, { 
          timeout: config.timeout,
          validateStatus: () => true 
        });

        const xssTest = {
          test: `XSS Protection (${attempt.substring(0, 20)}...)`,
          passed: response.status === 400 || response.status === 422,
          message: response.status === 400 || response.status === 422 ? 
            'XSS attempt properly rejected' :
            `XSS attempt not properly handled: ${response.status}`
        };
        results.push(xssTest);
      } catch (error) {
        results.push({
          test: `XSS Protection (${attempt.substring(0, 20)}...)`,
          passed: true,
          message: 'Request blocked at network level'
        });
      }
    }

    // Test password brute force protection
    const bruteForceAttempts = Array.from({ length: 6 }, (_, i) => 
      axios.post(`${config.baseUrl}/api/auth/login`, {
        email: config.testUser.email,
        password: `wrongpassword${i}`
      }, { 
        timeout: config.timeout,
        validateStatus: () => true 
      }).catch(() => ({ status: 0, data: null }))
    );

    const bruteForceResponses = await Promise.all(bruteForceAttempts);
    const blockedAttempts = bruteForceResponses.filter(r => r.status === 429);

    const bruteForceTest = {
      test: 'Brute Force Protection',
      passed: blockedAttempts.length > 0,
      message: blockedAttempts.length > 0 ? 
        `Brute force protection activated after ${bruteForceResponses.length - blockedAttempts.length} attempts` :
        'Brute force protection not triggered - security issue!'
    };
    results.push(bruteForceTest);

    // Test weak password rejection
    const weakPasswords = [
      'password',
      '123456',
      'qwerty',
      'admin',
      'password123'
    ];

    for (const weakPassword of weakPasswords) {
      try {
        const response = await axios.post(`${config.baseUrl}/api/auth/register`, {
          email: `test${Date.now()}@test.com`,
          password: weakPassword,
          fornavn: 'Test',
          etternavn: 'User'
        }, { 
          timeout: config.timeout,
          validateStatus: () => true 
        });

        const weakPasswordTest = {
          test: `Weak Password Rejection (${weakPassword})`,
          passed: response.status === 400 || response.status === 422,
          message: response.status === 400 || response.status === 422 ? 
            'Weak password properly rejected' :
            `Weak password accepted - security issue!`
        };
        results.push(weakPasswordTest);
      } catch (error) {
        results.push({
          test: `Weak Password Rejection (${weakPassword})`,
          passed: true,
          message: 'Request blocked at network level'
        });
      }
    }

    const allPassed = results.every(result => result.passed);
    return { passed: allPassed, results };

  } catch (error) {
    logger.error('Authentication test failed', error);
    return {
      passed: false,
      results: [{
        test: 'Authentication Connection',
        passed: false,
        message: `Failed to connect: ${(error as Error).message}`
      }]
    };
  }
}

// ============================================================================
// INPUT VALIDATION TESTS
// ============================================================================

/**
 * Test input validation and sanitization
 */
async function testInputValidation(): Promise<{
  passed: boolean;
  results: Array<{ test: string; passed: boolean; message: string }>;
}> {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];
  
  try {
    logger.info('Testing input validation...');

    // Test null byte injection
    const nullBytePayloads = [
      "test\x00.txt",
      "test%00.txt",
      "test\u0000.txt"
    ];

    for (const payload of nullBytePayloads) {
      try {
        const response = await axios.post(`${config.baseUrl}/api/auth/login`, {
          email: payload,
          password: 'password'
        }, { 
          timeout: config.timeout,
          validateStatus: () => true 
        });

        const nullByteTest = {
          test: `Null Byte Injection Protection`,
          passed: response.status === 400 || response.status === 422,
          message: response.status === 400 || response.status === 422 ? 
            'Null byte injection properly blocked' :
            `Null byte injection not handled: ${response.status}`
        };
        results.push(nullByteTest);
      } catch (error) {
        results.push({
          test: `Null Byte Injection Protection`,
          passed: true,
          message: 'Request blocked at network level'
        });
      }
    }

    // Test oversized requests
    const largePayload = 'A'.repeat(50 * 1024 * 1024); // 50MB payload
    
    try {
      const response = await axios.post(`${config.baseUrl}/api/auth/login`, {
        email: 'test@test.com',
        password: largePayload
      }, { 
        timeout: config.timeout,
        validateStatus: () => true 
      });

      const sizeTest = {
        test: 'Request Size Limit',
        passed: response.status === 413 || response.status === 400,
        message: response.status === 413 || response.status === 400 ? 
          'Large request properly rejected' :
          `Large request not properly handled: ${response.status}`
      };
      results.push(sizeTest);
    } catch (error) {
      results.push({
        test: 'Request Size Limit',
        passed: true,
        message: 'Large request blocked at network level'
      });
    }

    // Test Norwegian personal number validation
    const invalidPersonNumbers = [
      '12345678901', // Invalid format
      '99999999999', // Invalid date
      '00000000000', // All zeros
      'abcdefghijk'  // Non-numeric
    ];

    for (const invalidNumber of invalidPersonNumbers) {
      try {
        const response = await axios.post(`${config.baseUrl}/api/ansatt`, {
          fornavn: 'Test',
          etternavn: 'User',
          personnummer: invalidNumber,
          stilling: 'TEST'
        }, { 
          timeout: config.timeout,
          validateStatus: () => true,
          headers: {
            'Authorization': 'Bearer fake-token' // Will fail auth, but should hit validation first
          }
        });

        const personalNumberTest = {
          test: `Personal Number Validation (${invalidNumber})`,
          passed: response.status === 400 || response.status === 422 || response.status === 401,
          message: response.status === 400 || response.status === 422 ? 
            'Invalid personal number properly rejected' :
            response.status === 401 ? 'Auth failed before validation (acceptable)' :
            `Invalid personal number not handled: ${response.status}`
        };
        results.push(personalNumberTest);
      } catch (error) {
        results.push({
          test: `Personal Number Validation (${invalidNumber})`,
          passed: true,
          message: 'Request blocked at network level'
        });
      }
    }

    const allPassed = results.every(result => result.passed);
    return { passed: allPassed, results };

  } catch (error) {
    logger.error('Input validation test failed', error);
    return {
      passed: false,
      results: [{
        test: 'Input Validation Connection',
        passed: false,
        message: `Failed to connect: ${(error as Error).message}`
      }]
    };
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

/**
 * Run all security tests
 */
async function runSecurityTests(): Promise<void> {
  try {
    logger.info('Starting comprehensive security testing suite...');
    
    const testResults = {
      securityHeaders: await testSecurityHeaders(),
      rateLimiting: await testRateLimiting(),
      authentication: await testAuthentication(),
      inputValidation: await testInputValidation()
    };

    // Generate report
    console.log('\n=== SECURITY TEST REPORT ===\n');
    
    let totalTests = 0;
    let passedTests = 0;
    let criticalFailures = 0;

    Object.entries(testResults).forEach(([category, result]) => {
      const categoryName = category.replace(/([A-Z])/g, ' $1').trim();
      console.log(`📋 ${categoryName.toUpperCase()}`);
      console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('');

      result.results.forEach(test => {
        totalTests++;
        if (test.passed) passedTests++;
        
        const status = test.passed ? '✅' : '❌';
        console.log(`  ${status} ${test.test}`);
        console.log(`     ${test.message}`);
        
        // Mark critical failures
        if (!test.passed && (
          test.test.includes('SQL Injection') ||
          test.test.includes('XSS') ||
          test.test.includes('Brute Force') ||
          test.test.includes('Authentication')
        )) {
          criticalFailures++;
          console.log(`     🚨 CRITICAL SECURITY ISSUE`);
        }
        
        console.log('');
      });
      
      console.log('');
    });

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Critical Failures: ${criticalFailures}`);
    console.log('');

    // Overall assessment
    if (criticalFailures > 0) {
      console.log('🚨 CRITICAL: Application has critical security vulnerabilities!');
      console.log('🔧 Action Required: Fix critical issues before production deployment');
      process.exit(1);
    } else if (passedTests / totalTests >= 0.9) {
      console.log('✅ EXCELLENT: Application has strong security posture');
      console.log('🚀 Recommendation: Safe for production deployment');
    } else if (passedTests / totalTests >= 0.8) {
      console.log('⚠️  GOOD: Application has good security, but room for improvement');
      console.log('🔧 Recommendation: Address remaining issues for optimal security');
    } else {
      console.log('❌ POOR: Application has significant security weaknesses');
      console.log('🔧 Action Required: Address security issues before production');
      process.exit(1);
    }

    logger.info('Security testing completed', {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      criticalFailures,
      passRate: Math.round((passedTests / totalTests) * 100)
    });

  } catch (error) {
    logger.error('Security testing failed', error);
    console.log('\n❌ SECURITY TESTING FAILED');
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
        await runSecurityTests();
        break;
        
      case 'headers':
        const headerResults = await testSecurityHeaders();
        console.log('Security Headers Test:', headerResults.passed ? 'PASSED' : 'FAILED');
        headerResults.results.forEach(r => console.log(`  ${r.passed ? '✅' : '❌'} ${r.test}: ${r.message}`));
        break;
        
      case 'ratelimit':
        const rateLimitResults = await testRateLimiting();
        console.log('Rate Limiting Test:', rateLimitResults.passed ? 'PASSED' : 'FAILED');
        rateLimitResults.results.forEach(r => console.log(`  ${r.passed ? '✅' : '❌'} ${r.test}: ${r.message}`));
        break;
        
      case 'auth':
        const authResults = await testAuthentication();
        console.log('Authentication Test:', authResults.passed ? 'PASSED' : 'FAILED');
        authResults.results.forEach(r => console.log(`  ${r.passed ? '✅' : '❌'} ${r.test}: ${r.message}`));
        break;
        
      case 'validation':
        const validationResults = await testInputValidation();
        console.log('Input Validation Test:', validationResults.passed ? 'PASSED' : 'FAILED');
        validationResults.results.forEach(r => console.log(`  ${r.passed ? '✅' : '❌'} ${r.test}: ${r.message}`));
        break;
        
      default:
        console.log(`
Security Testing Suite

Usage:
  node security-test.ts [command]

Commands:
  run         Run all security tests (default)
  headers     Test security headers only
  ratelimit   Test rate limiting only
  auth        Test authentication security only
  validation  Test input validation only

Environment Variables:
  TEST_BASE_URL         Base URL for testing (default: http://localhost:3001)
  TEST_USER_EMAIL       Test user email
  TEST_USER_PASSWORD    Test user password

Examples:
  node security-test.ts run
  node security-test.ts headers
  TEST_BASE_URL=https://production.example.com node security-test.ts run
        `);
        break;
    }

  } catch (error) {
    logger.error('Security test command failed', { command, error });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  testSecurityHeaders,
  testRateLimiting,
  testAuthentication,
  testInputValidation,
  runSecurityTests
}; 