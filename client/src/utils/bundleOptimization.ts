/**
 * Bundle Optimization Utilities
 * 
 * Verktøy for å optimalisere bundle størrelse og performance
 */

import { performanceUtils } from './performance';

// Dynamisk import utility med error handling
export const dynamicImport = async <T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T,
  retries: number = 3
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const module = await importFn();
      return module.default;
    } catch (error) {
      lastError = error as Error;
      
      // Venting mellom forsøk
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  console.error('[Bundle] Dynamic import failed after', retries, 'attempts:', lastError);
  
  if (fallback) {
    return fallback;
  }
  
  throw lastError;
};

// Preload utility med intelligent timing
export const preloadModule = (importFn: () => Promise<any>) => {
  // Preload kun hvis nettverkstilkobling er god
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return; // Skip preloading på sakte forbindelser
    }
  }
  
  // Preload when browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(() => {
        // Silent fail for preloading
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importFn().catch(() => {
        // Silent fail for preloading
      });
    }, 100);
  }
};

// Bundle analyzer utility
export const bundleAnalyzer = {
  // Measure bundle loading time
  measureChunkLoad: (chunkName: string) => {
    return performanceUtils.measureTime(`Chunk Load: ${chunkName}`, () => {
      // This will be called when chunk loads
    });
  },

  // Log chunk information
  logChunkInfo: (chunkName: string, size?: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle] Loaded chunk: ${chunkName}${size ? ` (${size}kb)` : ''}`);
    }
  },

  // Check for unused dependencies
  checkUnusedDependencies: () => {
    if (process.env.NODE_ENV === 'development') {
      // Dette kan utvides til å sjekke for ubrukte imports
      console.log('[Bundle] Checking for unused dependencies...');
    }
  }
};

// Tree shaking helpers
export const treeShakingUtils = {
  // Import kun det som trengs fra utility biblioteker (eksempler)
  importOptimized: {
    // Eksempel: kun import av spesifikke funksjoner hvis lodash er installert
    lodash: {
      debounce: async () => {
        // Simple debounce implementation without external dependencies
        return { default: (fn: Function, delay: number) => {
          let timeoutId: NodeJS.Timeout;
          return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(null, args), delay);
          };
        }};
      },
      throttle: async () => {
        // Simple throttle implementation without external dependencies
        return { default: (fn: Function, delay: number) => {
          let lastCall = 0;
          return (...args: any[]) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
              lastCall = now;
              return fn.apply(null, args);
            }
          };
        }};
      }
    },
    
    // Datum bibliotek optimalisering
    date: {
      format: () => {
        // Use native Intl API as fallback if date-fns not available
        return Promise.resolve({ 
          default: (date: Date, formatStr: string) => {
            return new Intl.DateTimeFormat('nb-NO').format(date);
          }
        });
      }
    }
  }
};

// Chunk loading prioritization
export const chunkPriority = {
  critical: ['auth', 'oversikt'], // Må lastes raskt
  high: ['bedrifter', 'kontrakter'], // Viktige business funksjoner
  medium: ['elever', 'quiz'], // Standard prioritet
  low: ['settings', 'security', 'demo'], // Kan lastes senere
  
  // Get priority for a chunk
  getPriority: (chunkName: string): 'critical' | 'high' | 'medium' | 'low' => {
    if (chunkPriority.critical.includes(chunkName)) return 'critical';
    if (chunkPriority.high.includes(chunkName)) return 'high';
    if (chunkPriority.medium.includes(chunkName)) return 'medium';
    return 'low';
  }
};

// Bundle size monitoring
export const bundleSizeMonitor = {
  // Target sizes for different chunk types (in KB)
  targets: {
    critical: 100,
    high: 150,
    medium: 200,
    low: 300
  },

  // Check if chunk exceeds target size
  checkSize: (chunkName: string, actualSize: number) => {
    const priority = chunkPriority.getPriority(chunkName);
    const target = bundleSizeMonitor.targets[priority];
    
    if (actualSize > target) {
      console.warn(`[Bundle] Chunk '${chunkName}' (${actualSize}kb) exceeds target size (${target}kb)`);
      return false;
    }
    
    return true;
  },

  // Generate bundle report
  generateReport: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Bundle] Bundle size analysis available at: npm run analyze');
    }
  }
};

// Export all utilities
export default {
  dynamicImport,
  preloadModule,
  bundleAnalyzer,
  treeShakingUtils,
  chunkPriority,
  bundleSizeMonitor
}; 