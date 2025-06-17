const crypto = require('crypto');

// Custom functions for Artillery load testing
module.exports = {
  // Generate random string
  randomString: function(context, events, done) {
    context.vars.randomString = crypto.randomBytes(8).toString('hex');
    return done();
  },

  // Generate random integer
  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate random email
  randomEmail: function(context, events, done) {
    const domains = ['example.com', 'test.no', 'demo.org'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const username = crypto.randomBytes(6).toString('hex');
    context.vars.randomEmail = `${username}@${domain}`;
    return done();
  },

  // Generate Norwegian organization number
  randomOrgNumber: function(context, events, done) {
    // Generate 9-digit Norwegian organization number
    const base = Math.floor(Math.random() * 900000000) + 100000000;
    context.vars.randomOrgNumber = base.toString();
    return done();
  },

  // Log response times for analysis
  logResponseTime: function(requestParams, response, context, ee, next) {
    if (response.timings) {
      const totalTime = response.timings.phases.total;
      console.log(`Request to ${requestParams.url} took ${totalTime}ms`);
      
      // Log slow requests
      if (totalTime > 1000) {
        console.warn(`SLOW REQUEST: ${requestParams.url} - ${totalTime}ms`);
      }
    }
    return next();
  },

  // Custom authentication handler
  authenticate: function(context, events, done) {
    const users = [
      { email: 'admin@example.com', password: 'adminpass123' },
      { email: 'user@example.com', password: 'userpass123' },
      { email: 'inspector@example.com', password: 'inspectorpass123' }
    ];
    
    const user = users[Math.floor(Math.random() * users.length)];
    context.vars.testUser = user;
    return done();
  },

  // Validate response data
  validateResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.error(`Error response: ${response.statusCode} for ${requestParams.url}`);
      console.error('Response body:', response.body);
    }
    
    // Check for specific error patterns
    if (response.body && typeof response.body === 'string') {
      if (response.body.includes('error') || response.body.includes('Error')) {
        console.warn(`Potential error in response: ${requestParams.url}`);
      }
    }
    
    return next();
  },

  // Generate realistic test data
  generateTestData: function(context, events, done) {
    const bedriftNavn = [
      'Transport AS', 'Logistikk Norge', 'Frakt Express', 
      'Kjøretøy Service', 'Trafikk Solutions', 'Sikkerhet First'
    ];
    
    const kontrollTitler = [
      'Periodisk sikkerhetskontroll', 'Årlig inspeksjon', 
      'Kvartalsvis gjennomgang', 'Månedlig kontroll',
      'Ukesinspeksjon', 'Daglig sjekk'
    ];
    
    context.vars.testBedriftNavn = bedriftNavn[Math.floor(Math.random() * bedriftNavn.length)];
    context.vars.testKontrollTittel = kontrollTitler[Math.floor(Math.random() * kontrollTitler.length)];
    
    return done();
  },

  // Performance monitoring
  monitorPerformance: function(requestParams, response, context, ee, next) {
    const metrics = {
      url: requestParams.url,
      method: requestParams.method,
      statusCode: response.statusCode,
      responseTime: response.timings ? response.timings.phases.total : 0,
      timestamp: new Date().toISOString()
    };
    
    // Emit custom metrics
    ee.emit('customMetric', 'response_time', metrics.responseTime);
    ee.emit('customMetric', 'status_code', metrics.statusCode);
    
    // Track error rates
    if (metrics.statusCode >= 400) {
      ee.emit('customMetric', 'error_count', 1);
    }
    
    return next();
  },

  // Setup phase - runs before test starts
  setupTest: function(context, events, done) {
    console.log('🚀 Starting TMS Load Test...');
    console.log(`Target: ${context.vars.target || 'http://localhost:4000'}`);
    console.log(`Test started at: ${new Date().toISOString()}`);
    return done();
  },

  // Cleanup phase - runs after test completes
  cleanupTest: function(context, events, done) {
    console.log('🏁 TMS Load Test completed');
    console.log(`Test ended at: ${new Date().toISOString()}`);
    return done();
  }
};

// Helper functions available in scenarios
module.exports.$randomString = function() {
  return crypto.randomBytes(8).toString('hex');
};

module.exports.$randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.$randomEmail = function() {
  const domains = ['example.com', 'test.no', 'demo.org'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = crypto.randomBytes(6).toString('hex');
  return `${username}@${domain}`;
};

module.exports.$randomOrgNumber = function() {
  return (Math.floor(Math.random() * 900000000) + 100000000).toString();
}; 