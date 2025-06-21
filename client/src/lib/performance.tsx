/**
 * Performance Utilities
 * 
 * Code splitting, lazy loading og performance optimalisering
 */

import React, { Suspense, ComponentType } from 'react';
import { Spinner } from '../components/ui/LoadingStates';

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

/**
 * Enhanced lazy loading med custom loading state
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-[200px]">
            <Spinner size="lg" />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy load med custom loading text
 */
export function lazyLoadWithMessage<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingMessage: string = 'Laster komponenten...'
): React.ComponentType<React.ComponentProps<T>> {
  return lazyLoad(importFunc, (
    <div className="flex flex-col items-center justify-center min-h-[200px] cards-spacing-vertical">
      <Spinner size="lg" />
      <p className="text-gray-600">{loadingMessage}</p>
    </div>
  ));
}

// ============================================================================
// PRELOADING UTILITIES
// ============================================================================

/**
 * Preload komponenter for bedre performance
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  // Start loading component
  importFunc();
};

/**
 * Preload på hover/focus for interaktive elementer
 */
export const usePreloadOnHover = (importFunc: () => Promise<any>) => {
  return {
    onMouseEnter: () => preloadComponent(importFunc),
    onFocus: () => preloadComponent(importFunc),
  };
};

// ============================================================================
// ROUTE-BASED CODE SPLITTING
// ============================================================================

/**
 * Lazy loaded pages med riktig loading states
 */
export const LazyPages = {
  // Bedrifter pages
  Bedrifter: lazyLoadWithMessage(
    () => import('../pages/Bedrifter/Bedrifter'),
    'Laster bedriftsoversikt...'
  ),
  BedriftOversikt: lazyLoadWithMessage(
    () => import('../pages/Bedrifter/BedriftOversikt'),
    'Laster bedrifter...'
  ),
  NyBedrift: lazyLoadWithMessage(
    () => import('../pages/Bedrifter/NyBedrift'),
    'Forbereder bedriftsregistrering...'
  ),

  // Kontrakter pages
  Kontrakter: lazyLoadWithMessage(
    () => import('../pages/Kontrakter/Kontrakter'),
    'Laster kontraktsoversikt...'
  ),
  KontraktOversikt: lazyLoadWithMessage(
    () => import('../pages/Kontrakter/KontraktOversikt'),
    'Laster kontrakter...'
  ),
  NyKontrakt: lazyLoadWithMessage(
    () => import('../pages/Kontrakter/NyKontrakt'),
    'Forbereder kontraktoppretting...'
  ),

  // Elever pages
  Elever: lazyLoadWithMessage(
    () => import('../pages/Elever/Elever'),
    'Laster elevdata...'
  ),
  ElevOversikt: lazyLoadWithMessage(
    () => import('../pages/Elever/ElevOversikt'),
    'Laster elever...'
  ),
  NyElev: lazyLoadWithMessage(
    () => import('../pages/Elever/NyElev'),
    'Forbereder elevregistrering...'
  ),

  // Sikkerhetskontroll pages
  Sikkerhetskontroll: lazyLoadWithMessage(
    () => import('../pages/Sikkerhetskontroll/Sikkerhetskontroll'),
    'Laster sikkerhetskontroll...'
  ),
  
  // Quiz pages
  TaQuiz: lazyLoadWithMessage(
    () => import('../pages/Quiz/TaQuiz'),
    'Forbereder quiz...'
  ),

  // Innstillinger pages
  Innstillinger: lazyLoadWithMessage(
    () => import('../pages/Innstillinger/Innstillinger'),
    'Laster innstillinger...'
  ),
  InnstillingerAdmin: lazyLoadWithMessage(
    () => import('../pages/Innstillinger/Admin/Admin'),
    'Laster admin innstillinger...'
  ),
};

// ============================================================================
// COMPONENT-LEVEL CODE SPLITTING
// ============================================================================

/**
 * Heavy komponenter som kan lazy loades
 */
export const LazyComponents = {
  // Charts og visualiseringer
  Dashboard: lazyLoad(() => import('../components/Dashboard')),
  PerformanceChart: lazyLoad(() => import('../components/charts/PerformanceChart')),
  
  // Modals og dialogs
  KontraktModal: lazyLoad(() => import('../components/modals/KontraktModal')),
  BedriftModal: lazyLoad(() => import('../components/modals/BedriftModal')),
  
  // Forms med heavy validering
  AdvancedKontraktForm: lazyLoad(() => import('../components/forms/AdvancedKontraktForm')),
  
  // PDF og rapporter
  PDFViewer: lazyLoad(() => import('../components/pdf/PDFViewer')),
  ReportGenerator: lazyLoad(() => import('../components/reports/ReportGenerator')),
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Monitor loading times for optimization
 */
export const performanceMonitor = {
  /**
   * Measure component loading time
   */
  measureLoadTime: (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log slow loading components
      if (loadTime > 1000) { // > 1 sekund
        console.warn(`Slow component load: ${componentName} took ${loadTime.toFixed(2)}ms`);
      }
      
      // Send to analytics hvis tilgjengelig
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'component_load_time', {
          component_name: componentName,
          load_time: Math.round(loadTime),
        });
      }
    };
  },

  /**
   * Monitor bundle sizes
   */
  logBundleInfo: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Bundle analysis:', {
        chunks: performance.getEntriesByType('navigation'),
        resources: performance.getEntriesByType('resource').length,
      });
    }
  },
};

// ============================================================================
// PREFETCH STRATEGIES
// ============================================================================

/**
 * Intelligent prefetching basert på brukeratferd
 */
export const prefetchStrategies = {
  /**
   * Prefetch neste sannsynlige side
   */
  prefetchLikelyRoutes: (currentRoute: string) => {
    const routeMap: Record<string, string[]> = {
      '/oversikt': ['/bedrifter', '/kontrakter'],
      '/bedrifter': ['/bedrifter/ny', '/kontrakter'],
      '/kontrakter': ['/kontrakter/ny', '/bedrifter'],
      '/elever': ['/elever/ny', '/sikkerhetskontroll'],
    };

    const likelyRoutes = routeMap[currentRoute] || [];
    likelyRoutes.forEach(route => {
      // Prefetch route component
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  },

  /**
   * Prefetch basert på viewport intersection
   */
  prefetchOnVisible: (element: HTMLElement, importFunc: () => Promise<any>) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          preloadComponent(importFunc);
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(element);
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

const PerformanceOptimization = {
  lazyLoad,
  lazyLoadWithMessage,
  preloadComponent,
  usePreloadOnHover,
  LazyPages,
  LazyComponents,
  performanceMonitor,
  prefetchStrategies,
};

export default PerformanceOptimization; 