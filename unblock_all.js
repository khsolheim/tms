const http = require('http');

async function clearAllSecurity() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const requests = [
    '/api/security/rate-limit/reset-all',
    '/api/security/ip/unblock-all'
  ];

  for (const path of requests) {
    try {
      options.path = path;
      
      await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            console.log(`${path}: ${res.statusCode} - ${data}`);
            resolve();
          });
        });
        
        req.on('error', (err) => {
          console.error(`Error for ${path}:`, err.message);
          resolve(); // Continue with other requests
        });
        
        req.end();
      });
    } catch (error) {
      console.error(`Error for ${path}:`, error.message);
    }
  }
}

// Direct blacklist/blocked IP clearing by calling the rateLimitManager directly
console.log('🔧 Clearing all security restrictions...');
clearAllSecurity().then(() => {
  console.log('✅ Security clear attempt completed');
}).catch(err => {
  console.error('❌ Failed to clear security:', err);
}); 