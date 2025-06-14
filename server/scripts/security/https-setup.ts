#!/usr/bin/env node

/**
 * HTTPS Setup and Certificate Management
 * 
 * Automatisk oppsett av SSL/TLS certificates og HTTPS enforcement
 * med Let's Encrypt integrasjon og certificate renewal
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../../src/utils/logger';

const execAsync = promisify(exec);

// ============================================================================
// CONFIGURATION
// ============================================================================

interface SSLConfig {
  domain: string;
  email: string;
  certificatePath: string;
  keyPath: string;
  fullchainPath: string;
  certbotPath: string;
  webroot: string;
  port: number;
  httpsPort: number;
}

const sslConfig: SSLConfig = {
  domain: process.env.SSL_DOMAIN || 'localhost',
  email: process.env.SSL_EMAIL || 'admin@example.com',
  certificatePath: process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt',
  keyPath: process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key',
  fullchainPath: process.env.SSL_FULLCHAIN_PATH || '/etc/ssl/certs/fullchain.pem',
  certbotPath: process.env.CERTBOT_PATH || '/usr/bin/certbot',
  webroot: process.env.SSL_WEBROOT || '/var/www/html',
  port: parseInt(process.env.PORT || '3001'),
  httpsPort: parseInt(process.env.HTTPS_PORT || '3443')
};

// ============================================================================
// CERTIFICATE GENERATION
// ============================================================================

/**
 * Generate self-signed certificate for development
 */
async function generateSelfSignedCert(): Promise<void> {
  try {
    logger.info('Generating self-signed certificate for development...');

    // Create directories if they don't exist
    await fs.mkdir(path.dirname(sslConfig.certificatePath), { recursive: true });
    await fs.mkdir(path.dirname(sslConfig.keyPath), { recursive: true });

    // Generate private key
    const keyCommand = `openssl genrsa -out "${sslConfig.keyPath}" 2048`;
    await execAsync(keyCommand);

    // Generate certificate
    const certCommand = `openssl req -new -x509 -sha256 -key "${sslConfig.keyPath}" -out "${sslConfig.certificatePath}" -days 365 -subj "/C=NO/ST=Oslo/L=Oslo/O=TMS/OU=IT/CN=${sslConfig.domain}"`;
    await execAsync(certCommand);

    logger.info('Self-signed certificate generated successfully', {
      certificate: sslConfig.certificatePath,
      key: sslConfig.keyPath,
      domain: sslConfig.domain
    });

  } catch (error) {
    logger.error('Failed to generate self-signed certificate', error);
    throw error;
  }
}

/**
 * Obtain Let's Encrypt certificate
 */
async function obtainLetsEncryptCert(): Promise<void> {
  try {
    logger.info('Obtaining Let\'s Encrypt certificate...');

    // Check if certbot is installed
    try {
      await execAsync(`${sslConfig.certbotPath} --version`);
    } catch {
      throw new Error('Certbot is not installed. Please install certbot first.');
    }

    // Stop any running web server temporarily
    try {
      await execAsync('sudo systemctl stop nginx apache2', { timeout: 5000 });
    } catch {
      // Ignore errors if services are not running
    }

    // Obtain certificate using standalone mode
    const certbotCommand = `sudo ${sslConfig.certbotPath} certonly --standalone --non-interactive --agree-tos --email ${sslConfig.email} -d ${sslConfig.domain}`;
    
    const { stdout, stderr } = await execAsync(certbotCommand);
    
    if (stderr && !stderr.includes('Congratulations')) {
      throw new Error(`Certbot error: ${stderr}`);
    }

    // Copy certificates to application directory
    const letsEncryptPath = `/etc/letsencrypt/live/${sslConfig.domain}`;
    
    await execAsync(`sudo cp ${letsEncryptPath}/fullchain.pem "${sslConfig.fullchainPath}"`);
    await execAsync(`sudo cp ${letsEncryptPath}/privkey.pem "${sslConfig.keyPath}"`);
    
    // Set proper permissions
    await execAsync(`sudo chmod 644 "${sslConfig.fullchainPath}"`);
    await execAsync(`sudo chmod 600 "${sslConfig.keyPath}"`);
    await execAsync(`sudo chown $(whoami):$(whoami) "${sslConfig.fullchainPath}" "${sslConfig.keyPath}"`);

    logger.info('Let\'s Encrypt certificate obtained successfully', {
      domain: sslConfig.domain,
      certificate: sslConfig.fullchainPath,
      key: sslConfig.keyPath
    });

  } catch (error) {
    logger.error('Failed to obtain Let\'s Encrypt certificate', error);
    throw error;
  }
}

/**
 * Renew Let's Encrypt certificate
 */
async function renewCertificate(): Promise<void> {
  try {
    logger.info('Renewing Let\'s Encrypt certificate...');

    const renewCommand = `sudo ${sslConfig.certbotPath} renew --quiet`;
    const { stdout, stderr } = await execAsync(renewCommand);

    if (stderr && !stderr.includes('No renewals were attempted')) {
      logger.warn('Certificate renewal warning', { stderr });
    }

    // Copy renewed certificates
    const letsEncryptPath = `/etc/letsencrypt/live/${sslConfig.domain}`;
    
    try {
      await execAsync(`sudo cp ${letsEncryptPath}/fullchain.pem "${sslConfig.fullchainPath}"`);
      await execAsync(`sudo cp ${letsEncryptPath}/privkey.pem "${sslConfig.keyPath}"`);
      
      logger.info('Certificate renewed and copied successfully');
    } catch (copyError) {
      logger.warn('Certificate renewal completed but copy failed', copyError);
    }

  } catch (error) {
    logger.error('Failed to renew certificate', error);
    throw error;
  }
}

// ============================================================================
// CERTIFICATE VALIDATION
// ============================================================================

/**
 * Validate SSL certificate
 */
async function validateCertificate(): Promise<{
  valid: boolean;
  expiryDate?: Date;
  daysUntilExpiry?: number;
  issuer?: string;
  subject?: string;
}> {
  try {
    logger.info('Validating SSL certificate...');

    // Check if certificate file exists
    try {
      await fs.access(sslConfig.certificatePath);
    } catch {
      return { valid: false };
    }

    // Get certificate information
    const certInfoCommand = `openssl x509 -in "${sslConfig.certificatePath}" -text -noout`;
    const { stdout } = await execAsync(certInfoCommand);

    // Extract expiry date
    const expiryMatch = stdout.match(/Not After : (.+)/);
    const expiryDate = expiryMatch ? new Date(expiryMatch[1]) : undefined;
    
    // Calculate days until expiry
    const daysUntilExpiry = expiryDate ? 
      Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
      undefined;

    // Extract issuer
    const issuerMatch = stdout.match(/Issuer: (.+)/);
    const issuer = issuerMatch ? issuerMatch[1] : undefined;

    // Extract subject
    const subjectMatch = stdout.match(/Subject: (.+)/);
    const subject = subjectMatch ? subjectMatch[1] : undefined;

    const isValid = daysUntilExpiry ? daysUntilExpiry > 0 : false;

    logger.info('Certificate validation completed', {
      valid: isValid,
      expiryDate,
      daysUntilExpiry,
      issuer,
      subject
    });

    return {
      valid: isValid,
      expiryDate,
      daysUntilExpiry,
      issuer,
      subject
    };

  } catch (error) {
    logger.error('Certificate validation failed', error);
    return { valid: false };
  }
}

// ============================================================================
// HTTPS SERVER CONFIGURATION
// ============================================================================

/**
 * Generate HTTPS server configuration
 */
async function generateHTTPSConfig(): Promise<string> {
  const httpsConfig = `
/**
 * HTTPS Server Configuration
 * Auto-generated by HTTPS setup script
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { app } from './app'; // Your Express app
import logger from './utils/logger';

// SSL Configuration
const sslOptions = {
  key: fs.readFileSync('${sslConfig.keyPath}'),
  cert: fs.readFileSync('${sslConfig.certificatePath}'),
  // Uncomment for fullchain certificate
  // cert: fs.readFileSync('${sslConfig.fullchainPath}')
};

// HTTPS Server
const httpsServer = https.createServer(sslOptions, app);

// HTTP Redirect Server (redirects all HTTP to HTTPS)
const httpServer = http.createServer((req, res) => {
  const host = req.headers.host?.split(':')[0] || 'localhost';
  const redirectUrl = \`https://\${host}:\${${sslConfig.httpsPort}}\${req.url}\`;
  
  logger.info('HTTP to HTTPS redirect', { 
    from: \`http://\${req.headers.host}\${req.url}\`,
    to: redirectUrl 
  });
  
  res.writeHead(301, { 
    'Location': redirectUrl,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  });
  res.end();
});

// Start servers
httpsServer.listen(${sslConfig.httpsPort}, () => {
  logger.info('HTTPS Server running', { 
    port: ${sslConfig.httpsPort},
    domain: '${sslConfig.domain}',
    certificate: '${sslConfig.certificatePath}'
  });
});

httpServer.listen(${sslConfig.port}, () => {
  logger.info('HTTP Redirect Server running', { 
    port: ${sslConfig.port},
    redirectsTo: \`https://${sslConfig.domain}:${sslConfig.httpsPort}\`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Shutting down servers gracefully...');
  
  httpsServer.close(() => {
    logger.info('HTTPS server closed');
  });
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { httpsServer, httpServer, sslOptions };
`;

  return httpsConfig;
}

/**
 * Generate nginx SSL configuration
 */
async function generateNginxConfig(): Promise<string> {
  const nginxConfig = `
# SSL Configuration for ${sslConfig.domain}
# Auto-generated by HTTPS setup script

server {
    listen 80;
    server_name ${sslConfig.domain};
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${sslConfig.domain};

    # SSL Certificate Configuration
    ssl_certificate ${sslConfig.fullchainPath};
    ssl_certificate_key ${sslConfig.keyPath};
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    # SSL Session Configuration
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:${sslConfig.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security configuration
    location ~ /\\. {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
`;

  return nginxConfig;
}

// ============================================================================
// CRON JOB SETUP
// ============================================================================

/**
 * Setup automatic certificate renewal cron job
 */
async function setupCertificateRenewal(): Promise<void> {
  try {
    logger.info('Setting up automatic certificate renewal...');

    const renewalScript = `#!/bin/bash
# Automatic SSL certificate renewal script
# Generated by TMS HTTPS setup

${sslConfig.certbotPath} renew --quiet --deploy-hook "systemctl reload nginx"
`;

    const scriptPath = '/usr/local/bin/tms-cert-renewal.sh';
    
    // Write renewal script
    await fs.writeFile(scriptPath, renewalScript);
    await execAsync(`sudo chmod +x ${scriptPath}`);

    // Add to crontab (runs twice daily)
    const cronJob = `0 */12 * * * ${scriptPath} >> /var/log/tms-cert-renewal.log 2>&1`;
    
    try {
      const { stdout: currentCrontab } = await execAsync('crontab -l 2>/dev/null || true');
      
      if (!currentCrontab.includes('tms-cert-renewal')) {
        const newCrontab = currentCrontab + '\n' + cronJob + '\n';
        await execAsync(`echo "${newCrontab}" | crontab -`);
        logger.info('Certificate renewal cron job added');
      } else {
        logger.info('Certificate renewal cron job already exists');
      }
    } catch (error) {
      logger.warn('Could not setup cron job automatically', error);
      console.log('\nManual cron setup required:');
      console.log(`Add this line to your crontab (crontab -e):`);
      console.log(cronJob);
    }

  } catch (error) {
    logger.error('Failed to setup certificate renewal', error);
    throw error;
  }
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Complete HTTPS setup
 */
async function setupHTTPS(useProduction: boolean = false): Promise<void> {
  try {
    logger.info('Starting HTTPS setup...', { 
      domain: sslConfig.domain,
      production: useProduction 
    });

    if (useProduction && sslConfig.domain !== 'localhost') {
      // Production setup with Let's Encrypt
      await obtainLetsEncryptCert();
      await setupCertificateRenewal();
    } else {
      // Development setup with self-signed certificate
      await generateSelfSignedCert();
    }

    // Validate certificate
    const validation = await validateCertificate();
    if (!validation.valid) {
      throw new Error('Generated certificate is not valid');
    }

    // Generate configuration files
    const httpsConfig = await generateHTTPSConfig();
    const nginxConfig = await generateNginxConfig();

    // Write configuration files
    await fs.writeFile('src/https-server.ts', httpsConfig);
    await fs.writeFile('nginx-ssl.conf', nginxConfig);

    logger.info('HTTPS setup completed successfully', {
      domain: sslConfig.domain,
      production: useProduction,
      certificate: sslConfig.certificatePath,
      expiryDate: validation.expiryDate,
      daysUntilExpiry: validation.daysUntilExpiry
    });

    console.log('\n✅ HTTPS Setup Complete!');
    console.log(`Domain: ${sslConfig.domain}`);
    console.log(`HTTPS Port: ${sslConfig.httpsPort}`);
    console.log(`Certificate: ${sslConfig.certificatePath}`);
    
    if (validation.daysUntilExpiry) {
      console.log(`Certificate expires in ${validation.daysUntilExpiry} days`);
    }
    
    console.log('\nGenerated files:');
    console.log('- src/https-server.ts (Node.js HTTPS server)');
    console.log('- nginx-ssl.conf (Nginx SSL configuration)');
    
    if (useProduction) {
      console.log('\nAutomatic renewal has been configured.');
    }

  } catch (error) {
    logger.error('HTTPS setup failed', error);
    throw error;
  }
}

/**
 * Check certificate status
 */
async function checkCertificateStatus(): Promise<void> {
  try {
    const validation = await validateCertificate();
    
    console.log('\n=== SSL CERTIFICATE STATUS ===');
    
    if (validation.valid) {
      console.log('✅ Certificate is valid');
      if (validation.expiryDate) {
        console.log(`📅 Expires: ${validation.expiryDate.toISOString()}`);
      }
      if (validation.daysUntilExpiry) {
        console.log(`⏰ Days until expiry: ${validation.daysUntilExpiry}`);
        
        if (validation.daysUntilExpiry < 30) {
          console.log('⚠️  WARNING: Certificate expires soon!');
        }
      }
      if (validation.issuer) {
        console.log(`🏢 Issuer: ${validation.issuer}`);
      }
      if (validation.subject) {
        console.log(`📋 Subject: ${validation.subject}`);
      }
    } else {
      console.log('❌ Certificate is invalid or not found');
    }
    
    console.log('');

  } catch (error) {
    logger.error('Certificate status check failed', error);
    console.log('❌ Could not check certificate status');
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'setup':
        const production = args.includes('--production');
        await setupHTTPS(production);
        break;
        
      case 'dev':
        await generateSelfSignedCert();
        console.log('✅ Development certificate generated');
        break;
        
      case 'prod':
        if (sslConfig.domain === 'localhost') {
          throw new Error('Please set SSL_DOMAIN environment variable for production setup');
        }
        await obtainLetsEncryptCert();
        await setupCertificateRenewal();
        console.log('✅ Production certificate obtained and renewal configured');
        break;
        
      case 'renew':
        await renewCertificate();
        console.log('✅ Certificate renewed');
        break;
        
      case 'status':
        await checkCertificateStatus();
        break;
        
      case 'validate':
        const validation = await validateCertificate();
        console.log('Certificate validation:', validation.valid ? 'VALID' : 'INVALID');
        if (validation.daysUntilExpiry) {
          console.log(`Days until expiry: ${validation.daysUntilExpiry}`);
        }
        break;
        
      default:
        console.log(`
HTTPS Setup and Certificate Management

Usage:
  node https-setup.ts <command> [options]

Commands:
  setup [--production]    Complete HTTPS setup (dev cert by default)
  dev                     Generate self-signed certificate for development
  prod                    Obtain Let's Encrypt certificate for production
  renew                   Renew existing certificate
  status                  Check certificate status and expiry
  validate                Validate certificate

Environment Variables:
  SSL_DOMAIN              Domain name (required for production)
  SSL_EMAIL               Email for Let's Encrypt registration
  SSL_CERT_PATH           Path to certificate file
  SSL_KEY_PATH            Path to private key file
  HTTPS_PORT              HTTPS port (default: 3443)

Examples:
  SSL_DOMAIN=example.com SSL_EMAIL=admin@example.com node https-setup.ts prod
  node https-setup.ts dev
  node https-setup.ts status
        `);
        break;
    }

  } catch (error) {
    logger.error('HTTPS setup command failed', { command, error });
    console.log(`\n❌ Command failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  generateSelfSignedCert,
  obtainLetsEncryptCert,
  renewCertificate,
  validateCertificate,
  setupHTTPS,
  checkCertificateStatus,
  generateHTTPSConfig,
  generateNginxConfig
}; 