/**
 * Lazy Routes Configuration
 * 
 * Implementerer code splitting med React.lazy() for bedre performance
 * og redusert initial bundle size
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-2 py-1">
      <div className="bg-white rounded-lg shadow px-2 py-1 mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white px-2 py-1 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 py-1">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <PageLoadingSkeleton />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// ============================================================================
// LAZY ROUTES COMPONENT
// ============================================================================

/**
 * Hovedkomponent med alle lazy-loaded routes
 */
export const LazyRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Dashboard/Oversikt */}
      <Route 
        path="/oversikt" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Dashboard')))}
          </LazyWrapper>
        } 
      />
      
      {/* Bedrifter */}
      <Route 
        path="/bedrifter" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Bedrifter')))}
          </LazyWrapper>
        } 
      />
      <Route 
        path="/bedrifter/:id" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/BedriftDetaljer')))}
          </LazyWrapper>
        } 
      />
      
      {/* Kontrakter */}
      <Route 
        path="/kontrakter" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Kontrakter/KontraktOversikt')))}
          </LazyWrapper>
        } 
      />
      
      {/* Elever */}
      <Route 
        path="/elever" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Elever')))}
          </LazyWrapper>
        } 
      />
      
      {/* Ansatte */}
      <Route 
        path="/ansatte" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Ansatte')))}
          </LazyWrapper>
        } 
      />
      
      {/* Bruker routes */}
      <Route 
        path="/brukere" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Brukere')))}
          </LazyWrapper>
        } 
      />
      
      {/* Registrer routes */}
      <Route 
        path="/elev-registrer" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/ElevRegistrer')))}
          </LazyWrapper>
        } 
      />
      
      <Route 
        path="/ansatt-registrer" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/AnsattRegistrer')))}
          </LazyWrapper>
        } 
      />
      
      {/* Auth route */}
      <Route 
        path="/logg-inn" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/LoggInn')))}
          </LazyWrapper>
        } 
      />
      
      {/* Dashboard som fallback for root */}
      <Route 
        path="/" 
        element={
          <LazyWrapper>
            {React.createElement(React.lazy(() => import('../pages/Dashboard')))}
          </LazyWrapper>
        } 
      />
    </Routes>
  );
};

export default LazyRoutes;
export { LazyWrapper, PageLoadingSkeleton }; 