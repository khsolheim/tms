/**
 * Routes Configuration
 * 
 * Hovedruting for TMS applikasjonen med optimalisert lazy loading og preloading
 */

import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import App from '../App';

// Lazy load components med chunk names for bedre debugging
const AssetOptimizationDemo = lazy(() => 
  import(/* webpackChunkName: "demo" */ '../components/optimization/AssetOptimizationDemo')
);

// Main pages - load on demand
const Oversikt = lazy(() => 
  import(/* webpackChunkName: "oversikt" */ '../pages/Oversikt/Index')
);

const LoggInn = lazy(() => 
  import(/* webpackChunkName: "auth" */ '../pages/LoggInn')
);

// Business modules - separate chunks
const Bedrifter = lazy(() => 
  import(/* webpackChunkName: "bedrifter" */ '../pages/Bedrifter')
);

const Kontrakter = lazy(() => 
  import(/* webpackChunkName: "kontrakter" */ '../pages/Kontrakter')
);

const Elever = lazy(() => 
  import(/* webpackChunkName: "elever" */ '../pages/Elever')
);

// Quiz module - separate chunk since it's feature-heavy
const Quiz = lazy(() => 
  import(/* webpackChunkName: "quiz" */ '../pages/Quiz/Index')
);

// Settings - admin features in separate chunk
const Innstillinger = lazy(() => 
  import(/* webpackChunkName: "settings" */ '../pages/Innstillinger')
);

// Security module - separate chunk
const SikkerhetsModule = lazy(() => 
  import(/* webpackChunkName: "security" */ '../pages/Sikkerhetskontroll/Admin/AdminOversikt')
);

// Business Intelligence - analytics module
const BusinessIntelligence = lazy(() => 
  import(/* webpackChunkName: "analytics" */ '../pages/Rapportering/BusinessIntelligence')
);

// Preload critical routes for better UX
export const preloadRoutes = {
  // Preload when user is likely to navigate to these routes
  oversikt: () => import('../pages/Oversikt/Index'),
  bedrifter: () => import('../pages/Bedrifter'),
  kontrakter: () => import('../pages/Kontrakter'),
};

// Preload routes on user interaction
export function preloadRoute(routeName: keyof typeof preloadRoutes) {
  if (preloadRoutes[routeName]) {
    preloadRoutes[routeName]();
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Demo routes
      {
        path: '/demo/asset-optimization',
        element: <AssetOptimizationDemo />,
      },
      {
        path: '/business-intelligence',
        element: <BusinessIntelligence />,
      },
      // Main application routes will be handled by App.tsx for now
      // This router is primarily for demo purposes
    ],
  },
]);

export default router; 