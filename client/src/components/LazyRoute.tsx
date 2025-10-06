import React, { Suspense, ComponentType } from 'react';
import { PageSkeleton } from './ui/LoadingStates';
import ErrorBoundary from './ErrorBoundary';

interface LazyRouteProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  errorFallback?: (error: Error, errorInfo: any, retry: () => void) => React.ReactNode;
}

/**
 * LazyRoute component for code splitting
 * Automatically wraps lazy-loaded components with Suspense and Error Boundary
 */
export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  component: Component, 
  fallback,
  errorFallback,
  ...props 
}) => {
  const defaultFallback = fallback || <PageSkeleton />;
  
  return (
    <ErrorBoundary fallback={errorFallback || ((error, errorInfo, retry) => (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-600 mb-4">Noe gikk galt</h2>
        <p className="text-gray-600">Det oppstod en feil ved lasting av denne komponenten.</p>
        <button 
          onClick={retry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Prøv igjen
        </button>
      </div>
    ))}>
      <Suspense fallback={defaultFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Helper function to create lazy routes with consistent loading behavior
 */
export const createLazyRoute = (
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  fallbackType: 'dashboard' | 'table' | 'form' | 'cards' = 'dashboard'
) => {
  const LazyComponent = React.lazy(importFunction);
  
  return (props: any) => (
    <LazyRoute 
      component={LazyComponent} 
      fallback={<PageSkeleton />}
      {...props}
    />
  );
};

/**
 * Preload function for route components
 * Call this to preload routes before navigation
 */
export const preloadRoute = (importFunction: () => Promise<{ default: ComponentType<any> }>) => {
  // Start loading the component
  importFunction().catch(() => {
    // Ignore preload errors - component will load normally when needed
  });
};

export default LazyRoute; 