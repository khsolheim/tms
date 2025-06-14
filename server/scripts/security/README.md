# TMS Security Operations Suite

Comprehensive security infrastructure for TMS applikasjonen inkludert testing, audit, HTTPS setup og vulnerability scanning.

## 🛡️ Oversikt

Security suite består av fire hovedkomponenter:

1. **Security Testing** - Penetration testing og security validation
2. **Security Audit** - Comprehensive audit av dependencies, konfiguration og kode
3. **HTTPS Setup** - SSL/TLS certificate management og HTTPS enforcement
4. **Security Runner** - Unified interface for alle security operasjoner

## 🚀 Rask Start

### Development Environment
```bash
# Quick security check (audit + testing)
npm run security:check

# Complete development setup (inkludert self-signed SSL)
npm run security:dev
```

### Production Environment
```bash
# Set required environment variables
export SSL_DOMAIN=yourdomain.com
export SSL_EMAIL=admin@yourdomain.com

# Complete production security setup
npm run security:production
```

### Individual Operations
```bash
# Security audit only
npm run security:audit

# Security testing only  
npm run security:test

# HTTPS setup only
npm run security:https dev    # Self-signed certificate
npm run security:https prod   # Let's Encrypt certificate
```

## 📋 Security Testing

### Hva testes:
- **Security Headers**: CSP, HSTS, X-Frame-Options, osv.
- **Rate Limiting**: General API og authentication rate limits
- **Authentication Security**: SQL injection, XSS, brute force protection
- **Input Validation**: Null byte injection, oversized requests, Norwegian validators

### Kjør testing:
```bash
# All security tests
npm run security:test

# Spesifikke tester
node scripts/security/security-test.ts headers
node scripts/security/security-test.ts ratelimit  
node scripts/security/security-test.ts auth
node scripts/security/security-test.ts validation
```

### Environment Variables:
```bash
TEST_BASE_URL=http://localhost:3001    # Base URL for testing
TEST_USER_EMAIL=test@example.com       # Test user email
TEST_USER_PASSWORD=TestPassword123!    # Test user password
```

## 🔍 Security Audit

### Hva auditeres:
- **Dependencies**: NPM audit for vulnerabilities og outdated packages
- **Configuration**: Environment files, debug settings, cookie security
- **File Permissions**: Overly permissive files og sensitive file exposure
- **Source Code**: SQL injection, hardcoded secrets, eval() usage

### Kjør audit:
```bash
# Complete security audit
npm run security:audit

# Spesifikke audits
node scripts/security/security-audit.ts deps
node scripts/security/security-audit.ts config
node scripts/security/security-audit.ts permissions
node scripts/security/security-audit.ts code
```

### Scoring System:
- **90-100%**: Excellent security posture
- **80-89%**: Good security, minor improvements needed
- **70-79%**: Fair security, significant improvements recommended  
- **<70%**: Poor security, major overhaul required

## 🔐 HTTPS Setup

### Development (Self-signed certificates):
```bash
# Generate self-signed certificate
npm run security:https dev

# Or via runner
npm run security:dev
```

### Production (Let's Encrypt):
```bash
# Set environment variables
export SSL_DOMAIN=yourdomain.com
export SSL_EMAIL=admin@yourdomain.com

# Obtain Let's Encrypt certificate
npm run security:https prod

# Or via runner  
npm run security:production
```

### Certificate Management:
```bash
# Check certificate status
node scripts/security/https-setup.ts status

# Renew certificate
node scripts/security/https-setup.ts renew

# Validate certificate
node scripts/security/https-setup.ts validate
```

### Generated Files:
- `src/https-server.ts` - Node.js HTTPS server konfiguration
- `nginx-ssl.conf` - Nginx SSL konfiguration
- Certificate files i specified paths

## 🎯 Security Runner

Unified interface for alle security operasjoner.

### Commands:
```bash
# Environment presets
npm run security:dev         # Development setup
npm run security:staging     # Staging setup  
npm run security:production  # Production setup
npm run security:check       # Quick check (no SSL setup)

# Custom setup
node scripts/security/run-security.ts custom --env=staging --setup-ssl --production-ssl
```

### Configuration Options:
- `--env=<environment>` - Set environment (development/staging/production)
- `--skip-tests` - Skip security testing
- `--skip-audit` - Skip security audit
- `--setup-ssl` - Setup SSL certificates
- `--production-ssl` - Use Let's Encrypt for SSL

## 📊 Security Reports

### Test Report Format:
```
=== SECURITY TEST REPORT ===

📋 SECURITY HEADERS
Status: ✅ PASSED

  ✅ Content-Security-Policy
     CSP header present
  
  ✅ X-Frame-Options  
     X-Frame-Options: DENY

📋 RATE LIMITING
Status: ✅ PASSED

  ✅ General API Rate Limiting
     General rate limit not triggered as expected
  
  ✅ Authentication Rate Limiting
     Auth rate limit triggered after 5 attempts

=== SUMMARY ===
Total Tests: 25
Passed: 24 (96%)
Failed: 1
Critical Failures: 0

✅ EXCELLENT: Application has strong security posture
🚀 Recommendation: Safe for production deployment
```

### Audit Report Format:
```
=== SECURITY AUDIT REPORT ===

📋 DEPENDENCIES
Score: 95/100 (95%)
Status: ✅ PASSED

📋 CONFIGURATION  
Score: 85/100 (85%)
Status: ✅ PASSED

Issues:
  🟠 MEDIUM: Debug Mode Enabled in src/config/auth.ts
     Debug mode may expose sensitive information in production
     💡 Ensure debug mode is disabled in production builds

=== OVERALL SECURITY ASSESSMENT ===
Overall Score: 365/400 (91%)
Critical Issues: 0
High Severity Issues: 0

✅ EXCELLENT: Application has strong security posture
🚀 Recommendation: Safe for production deployment
```

## 🔧 Troubleshooting

### Common Issues:

**Certificate Generation Fails:**
```bash
# Ensure OpenSSL is installed
which openssl

# Check permissions
sudo chmod +x scripts/security/https-setup.ts

# Verify domain DNS for Let's Encrypt
nslookup yourdomain.com
```

**Security Tests Fail:**
```bash
# Ensure server is running
curl http://localhost:3001/api/health

# Check environment variables
echo $TEST_BASE_URL

# Verify security middleware is active
grep -r "securityHeaders" src/
```

**Security Audit Issues:**
```bash
# Update outdated dependencies
npm update

# Fix npm audit issues
npm audit fix

# Check file permissions
ls -la .env*
```

## 🔒 Best Practices

### Development:
1. Run `npm run security:check` før hver commit
2. Fiks alle critical og high severity issues
3. Bruk self-signed certificates for lokal utvikling
4. Aktiver security middleware lokalt

### Staging:
1. Run full security suite: `npm run security:staging`  
2. Test med real Let's Encrypt certificates
3. Validate security headers med external tools
4. Performance test security middleware

### Production:
1. Run `npm run security:production` før deployment
2. Ensure 90%+ security audit score
3. Zero critical eller high severity issues
4. Automated certificate renewal configured
5. Monitor security logs kontinuerlig

### CI/CD Integration:
```yaml
# .github/workflows/security.yml
- name: Security Check
  run: |
    cd server
    npm run security:check
    
- name: Security Audit
  run: |
    cd server  
    npm run security:audit
```

## 📚 Referanser

### Security Standards:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Mozilla SSL Configuration](https://ssl-config.mozilla.org/)

### Tools og Resources:
- [Let's Encrypt](https://letsencrypt.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [SecurityHeaders.com](https://securityheaders.com/)
- [NPM Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

### Norwegian Security Guidelines:
- [NSM Grunnprinsipper](https://nsm.no/regelverk-og-hjelp/veiledere-og-handboker/nsm-grunnprinsipper/)
- [Datatilsynet Sikkerhet](https://www.datatilsynet.no/rettigheter-og-plikter/behandlingsgrunnlag/samtykke/sikkerhet/)

---

## 🏆 Security Achievement Badges

Når du har implementert all security functionality:

🛡️ **Security Champion** - All security tests passed  
🔐 **HTTPS Hero** - SSL/TLS properly configured  
🔍 **Audit Ace** - 90%+ security audit score  
🚀 **Production Ready** - Ready for secure deployment

**Your current status:** Working towards Security Champion! 💪 