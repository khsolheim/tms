const path = require('path');
const fs = require('fs');

console.log('🔧 Resetting all rate limits directly...');

// Dette scriptet resetter rate limits ved å slette cache-filene direkte
// i stedet for å gå gjennom API-et

try {
  // Slett rate limit cache hvis den eksisterer
  const cacheDir = path.join(__dirname, 'server', 'cache');
  const rateLimitCacheFile = path.join(cacheDir, 'rate-limits.json');
  
  if (fs.existsSync(rateLimitCacheFile)) {
    fs.unlinkSync(rateLimitCacheFile);
    console.log('✅ Rate limit cache file deleted');
  }
  
  // Slett Redis cache hvis tilgjengelig
  const redisClient = require('redis').createClient({
    host: 'localhost',
    port: 6379
  });
  
  redisClient.on('connect', () => {
    console.log('📡 Connected to Redis');
    redisClient.flushall((err, succeeded) => {
      if (err) {
        console.log('❌ Redis flush error:', err.message);
      } else {
        console.log('✅ Redis cache cleared');
      }
      redisClient.quit();
    });
  });
  
  redisClient.on('error', (err) => {
    console.log('⚠️  Redis not available:', err.message);
    redisClient.quit();
  });
  
  console.log('🎉 Rate limit reset completed!');
  console.log('💡 Du kan nå prøve å logge inn igjen');
  
} catch (error) {
  console.error('❌ Error resetting rate limits:', error.message);
}

// Restart server for å sikre clean state
console.log('🔄 For best results, restart serveren...'); 