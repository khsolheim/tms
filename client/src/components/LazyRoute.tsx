import React, { Suspense, ComponentType } from 'react';
import { PageSkeleton } from './ui/LoadingStates';
import ErrorBoundary from './ErrorBoundary';

interface LazyRouteProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
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
    <ErrorBoundary fallback={errorFallback}>
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