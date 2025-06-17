#!/usr/bin/env ts-node

import axios from 'axios';
import chalk from 'chalk';
import serverConfigManager from '../shared/config/server-config';

interface HealthCheckResult {
  service: string;
  url: string;
  status: 'ok' | 'error' | 'timeout';
  responseTime?: number;
  error?: string;
}

async function checkEndpoint(service: string, url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      service,
      url,
      status: 'ok',
      responseTime
    };
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return {
        service,
        url,
        status: 'timeout',
        error: 'Request timeout'
      };
    }
    
    return {
      service,
      url,
      status: 'error',
      error: error.message || 'Unknown error'
    };
  }
}

async function checkAllServices() {
  console.log(chalk.bold.blue('\n🔍 TMS Server Connection Check\n'));
  console.log(chalk.gray(`Environment: ${serverConfigManager.getEnvironment()}\n`));

  // Check main app services
  console.log(chalk.bold.yellow('📱 Main Application Services:'));
  const mainAppConfig = serverConfigManager.getMainAppConfig();
  
  const mainAppChecks: Promise<HealthCheckResult>[] = [
    checkEndpoint('Frontend', mainAppConfig.frontend.url),
    checkEndpoint('Admin Portal', mainAppConfig.admin.url),
    checkEndpoint('Backend API', `${serverConfigManager.getBackendApiUrl()}/health`)
  ];
  
  // Check database connections (using backend endpoints)
  if (mainAppConfig.database) {
    mainAppChecks.push(
      checkEndpoint('Main Database', `${serverConfigManager.getBackendApiUrl()}/health/database`)
    );
  }
  
  if (mainAppConfig.cache) {
    mainAppChecks.push(
      checkEndpoint('Main Redis', `${serverConfigManager.getBackendApiUrl()}/health/redis`)
    );
  }

  const mainResults = await Promise.all(mainAppChecks);
  displayResults(mainResults);

  // Check microservices
  const microservicesConfig = serverConfigManager.getMicroservicesConfig();
  if (microservicesConfig) {
    console.log(chalk.bold.yellow('\n🔬 Microservices:'));
    
    const microserviceChecks: Promise<HealthCheckResult>[] = [];
    
    // Check infrastructure
    microserviceChecks.push(
      checkEndpoint(
        'Microservices Database',
        `${serverConfigManager.getServiceUrl('observability')}/health/database`
      ),
      checkEndpoint(
        'Microservices Redis',
        `${serverConfigManager.getServiceUrl('observability')}/health/redis`
      )
    );
    
    // Check all services
    const services = serverConfigManager.getAllServices();
    for (const service of services) {
      if (service.healthEndpoint) {
        microserviceChecks.push(
          checkEndpoint(service.name, `${service.url}${service.healthEndpoint}`)
        );
      }
    }
    
    const microResults = await Promise.all(microserviceChecks);
    displayResults(microResults);
  }

  // Summary
  console.log(chalk.bold.blue('\n📊 Summary:'));
  const allResults = [...mainResults, ...(await Promise.all(mainAppChecks))];
  const okCount = allResults.filter(r => r.status === 'ok').length;
  const errorCount = allResults.filter(r => r.status === 'error').length;
  const timeoutCount = allResults.filter(r => r.status === 'timeout').length;
  
  console.log(chalk.green(`✅ OK: ${okCount}`));
  if (errorCount > 0) console.log(chalk.red(`❌ Error: ${errorCount}`));
  if (timeoutCount > 0) console.log(chalk.yellow(`⏱️  Timeout: ${timeoutCount}`));
  
  // Test specific endpoints
  console.log(chalk.bold.yellow('\n🧪 Testing Specific Endpoints:'));
  await testSpecificEndpoints();
}

function displayResults(results: HealthCheckResult[]) {
  results.forEach(result => {
    const statusIcon = result.status === 'ok' ? '✅' : result.status === 'timeout' ? '⏱️' : '❌';
    const statusColor = result.status === 'ok' ? chalk.green : result.status === 'timeout' ? chalk.yellow : chalk.red;
    
    console.log(
      `${statusIcon} ${chalk.cyan(result.service.padEnd(30))} ${statusColor(result.status.toUpperCase().padEnd(8))}`,
      result.responseTime ? chalk.gray(`(${result.responseTime}ms)`) : '',
      result.error ? chalk.red(`- ${result.error}`) : ''
    );
  });
}

async function testSpecificEndpoints() {
  // Test auth service login endpoint
  try {
    const authLoginUrl = serverConfigManager.getServiceEndpoint('auth', 'login');
    if (authLoginUrl) {
      console.log(chalk.cyan('Testing Auth Login:'), authLoginUrl);
      // Don't actually login, just check if endpoint exists
      await axios.options(authLoginUrl);
      console.log(chalk.green('✅ Auth login endpoint accessible'));
    }
  } catch (error: any) {
    console.log(chalk.red('❌ Auth login endpoint error:'), error.message);
  }

  // Test quiz service endpoints
  try {
    const quizUrl = serverConfigManager.getServiceEndpoint('quiz', 'quizzes');
    if (quizUrl) {
      console.log(chalk.cyan('Testing Quiz Service:'), quizUrl);
      const response = await axios.get(quizUrl);
      console.log(chalk.green('✅ Quiz service responding'));
    }
  } catch (error: any) {
    console.log(chalk.red('❌ Quiz service error:'), error.message);
  }

  // Test GraphQL endpoint
  try {
    const graphqlUrl = serverConfigManager.getServiceConfig('graphql')?.url;
    if (graphqlUrl) {
      const playgroundUrl = `${graphqlUrl}/playground`;
      console.log(chalk.cyan('Testing GraphQL Playground:'), playgroundUrl);
      await axios.get(playgroundUrl);
      console.log(chalk.green('✅ GraphQL playground accessible'));
    }
  } catch (error: any) {
    console.log(chalk.red('❌ GraphQL playground error:'), error.message);
  }
}

// Run the checks
checkAllServices().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
}); 