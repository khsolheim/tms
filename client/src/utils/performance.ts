/**
 * Performance Utilities
 * 
 * Web Vitals tracking og performance monitoring for TMS
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';
import { sentryService } from '../services/SentryService';

// Type definitions for Web Vitals metrics
interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};

// Determine performance rating based on thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// Handle Web Vitals metric reporting
function handleMetric(metric: Metric) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    rating: getRating(metric.name, metric.value)
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: performanceMetric.rating,
      delta: metric.delta
    });
  }

  // Send to Sentry for monitoring
  if (performanceMetric.rating === 'poor') {
    sentryService.trackPerformanceWarning(
      `Web Vitals: ${performanceMetric.name}`,
      performanceMetric.value,
      performanceMetric.name === 'CLS' ? 0.25 : 
      performanceMetric.name === 'FID' ? 300 :
      performanceMetric.name === 'LCP' ? 4000 :
      performanceMetric.name === 'FCP' ? 3000 : 1800
    );
  }

  // Send to analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      custom_map: {
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: performanceMetric.rating
      }
    });
  }
}

// Main function to start Web Vitals tracking
export function reportWebVitals() {
  try {
    // Core Web Vitals
    getCLS(handleMetric);    // Cumulative Layout Shift
    getFID(handleMetric);    // First Input Delay
    getLCP(handleMetric);    // Largest Contentful Paint
    
    // Additional metrics
    getFCP(handleMetric);    // First Contentful Paint
    getTTFB(handleMetric);   // Time to First Byte
    
    console.log('[Performance] Web Vitals tracking initialized');
  } catch (error) {
    console.error('[Performance] Failed to initialize Web Vitals tracking:', error);
  }
}

// Custom performance measurement utilities
export const performanceUtils = {
  // Measure custom timing
  measureTime: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },

  // Mark performance events
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  // Measure between two marks
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        }
        
        return measure.duration;
      } catch (error) {
        console.warn(`[Performance] Could not measure ${name}:`, error);
      }
    }
    return 0;
  }
};

// Export types for use in other files
export type { PerformanceMetric }; 