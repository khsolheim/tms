#!/usr/bin/env node

/**
 * Bundle Size Checker
 * 
 * Sjekker at bundle size er innenfor akseptable grenser
 */

const fs = require('fs');
const path = require('path');

// Bundle size limits (in KB)
const SIZE_LIMITS = {
  main: 500, // Main bundle should be under 500KB
  vendor: 800, // Vendor bundle can be larger
  chunk: 200, // Individual chunks should be under 200KB
  total: 1200, // Total size should be under 1.2MB
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function formatSize(bytes) {
  return Math.round(bytes / 1024) + 'KB';
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function checkBundleSize() {
  const buildDir = path.join(__dirname, '../build/static/js');
  
  if (!fs.existsSync(buildDir)) {
    console.log(`${colors.red}❌ Build directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  const jsFiles = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.js') && !file.endsWith('.map'))
    .map(file => ({
      name: file,
      path: path.join(buildDir, file),
      size: getFileSize(path.join(buildDir, file)),
    }))
    .sort((a, b) => b.size - a.size);

  console.log(`${colors.bold}\n🔍 Bundle Size Analysis${colors.reset}`);
  console.log('='.repeat(50));

  let totalSize = 0;
  let hasErrors = false;
  let hasWarnings = false;

  jsFiles.forEach(file => {
    totalSize += file.size;
    const sizeKB = Math.round(file.size / 1024);
    
    let status = colors.green + '✅';
    let limit = SIZE_LIMITS.chunk;
    
    // Determine file type and appropriate limit
    if (file.name.includes('main')) {
      limit = SIZE_LIMITS.main;
    } else if (file.name.includes('vendor') || file.name.includes('node_modules')) {
      limit = SIZE_LIMITS.vendor;
    }

    // Check if file exceeds limits
    if (sizeKB > limit) {
      status = colors.red + '❌';
      hasErrors = true;
    } else if (sizeKB > limit * 0.8) {
      status = colors.yellow + '⚠️';
      hasWarnings = true;
    }

    console.log(`${status} ${file.name}: ${formatSize(file.size)} (limit: ${limit}KB)${colors.reset}`);
  });

  console.log('='.repeat(50));
  
  const totalSizeKB = Math.round(totalSize / 1024);
  let totalStatus = colors.green + '✅';
  
  if (totalSizeKB > SIZE_LIMITS.total) {
    totalStatus = colors.red + '❌';
    hasErrors = true;
  } else if (totalSizeKB > SIZE_LIMITS.total * 0.8) {
    totalStatus = colors.yellow + '⚠️';
    hasWarnings = true;
  }

  console.log(`${totalStatus} Total bundle size: ${formatSize(totalSize)} (limit: ${SIZE_LIMITS.total}KB)${colors.reset}`);

  // Recommendations
  if (hasErrors || hasWarnings) {
    console.log(`\n${colors.bold}📋 Optimization Recommendations:${colors.reset}`);
    
    if (hasErrors) {
      console.log(`${colors.red}Critical issues found:${colors.reset}`);
      console.log('• Bundle size exceeds limits - implement code splitting');
      console.log('• Consider lazy loading for large components');
      console.log('• Analyze bundle with: npm run bundle:analyze');
    }
    
    if (hasWarnings) {
      console.log(`${colors.yellow}Performance warnings:${colors.reset}`);
      console.log('• Bundle approaching size limits');
      console.log('• Run dependency audit: npm run optimize:unused');
      console.log('• Check for tree shaking opportunities');
    }
    
    console.log('\n💡 Quick fixes:');
    console.log('• Remove unused dependencies');
    console.log('• Use dynamic imports: React.lazy()');
    console.log('• Optimize webpack config');
    console.log('• Enable gzip/brotli compression');
  } else {
    console.log(`\n${colors.green}${colors.bold}🎉 Bundle size is optimal!${colors.reset}`);
  }

  // Calculate savings potential
  const potentialSavings = calculatePotentialSavings(totalSizeKB);
  if (potentialSavings > 0) {
    console.log(`\n💰 Potential savings: ~${potentialSavings}KB with optimizations`);
  }

  // Performance impact
  console.log(`\n📊 Performance Impact:`);
  console.log(`• Load time on 3G: ~${Math.round(totalSizeKB / 50)}s`);
  console.log(`• Load time on 4G: ~${Math.round(totalSizeKB / 200)}s`);
  console.log(`• Gzipped estimate: ~${Math.round(totalSizeKB * 0.3)}KB`);

  // Exit with appropriate code
  if (hasErrors) {
    console.log(`\n${colors.red}❌ Bundle size check failed!${colors.reset}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`\n${colors.yellow}⚠️ Bundle size check passed with warnings${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ Bundle size check passed!${colors.reset}`);
    process.exit(0);
  }
}

function calculatePotentialSavings(currentSizeKB) {
  // Estimate potential savings based on common optimizations
  let savings = 0;
  
  if (currentSizeKB > 800) {
    savings += Math.round(currentSizeKB * 0.15); // 15% from tree shaking
  }
  
  if (currentSizeKB > 1000) {
    savings += Math.round(currentSizeKB * 0.1); // 10% from code splitting
  }
  
  return savings;
}

// Run the check
checkBundleSize(); 