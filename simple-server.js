#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starter TMS Server...\n');

try {
  // Bygg serveren først
  console.log('📦 Bygger serveren...');
  execSync('npm run build', { 
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit' 
  });

  console.log('✅ Server bygget!\n');

  // Start serveren
  console.log('🌟 Starter server på port 4000...');
  execSync('npm start', {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit'
  });

} catch (error) {
  console.error('❌ Feil ved oppstart av server:', error.message);
  console.log('\n💡 For development, bruk: npm run server');
  console.log('💡 For full dev-oppsett, bruk: npm run dev');
  process.exit(1);
} 