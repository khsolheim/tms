/**
 * React Query Client Configuration
 * 
 * Optimalisert for performance med intelligent caching,
 * background refetching og error handling
 */

import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache Settings - Optimalisert for TMS bruksområde
      staleTime: 5 * 60 * 1000, // 5 minutter - data er "fresh" i 5 min
      gcTime: 10 * 60 * 1000, // 10 minutter - garbage collection time (tidligere cacheTime)
      
      // Network Settings
      refetchOnWindowFocus: false, // Ikke refetch når window får fokus
      refetchOnReconnect: true, // Refetch når tilkobling gjenopprettes
      refetchOnMount: true, // Refetch når komponent mounter
      
      // Retry Settings
      retry: (failureCount, error: any) => {
        // Ikke retry på 404, 401, 403 errors
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        
        // Retry maksimalt 3 ganger for andre errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance Settings
      // suspense og useErrorBoundary er fjernet i v5
    },
    mutations: {
      // Retry settings for mutations
      retry: 1, // Kun retry en gang for mutations
      
      // Optimistic Updates Settings
      onMutate: async () => {
        // Cancel ongoing queries to prevent race conditions
        // Dette vil bli overskrevet i spesifikke mutations
      },
      
      onError: (error, variables, context) => {
        // Global error handling for mutations
        console.error('Mutation error:', error);
      },
    },
  },
});

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

/**
 * Centralisert query keys factory for konsistent caching
 * Følger best practices for React Query key structure
 */
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  currentUser: () => [...queryKeys.auth, 'currentUser'] as const,
  
  // Bedrifter
  bedrifter: ['bedrifter'] as const,
  bedriftList: (filters?: any) => [...queryKeys.bedrifter, 'list', filters] as const,
  bedrift: (id: number) => [...queryKeys.bedrifter, 'detail', id] as const,
  bedriftAnsatte: (bedriftId: number) => [...queryKeys.bedrifter, bedriftId, 'ansatte'] as const,
  
  // Kontrakter
  kontrakter: ['kontrakter'] as const,
  kontraktList: (filters?: any) => [...queryKeys.kontrakter, 'list', filters] as const,
  kontrakt: (id: number) => [...queryKeys.kontrakter, 'detail', id] as const,
  kontraktPdf: (id: number) => [...queryKeys.kontrakter, id, 'pdf'] as const,
  
  // Elever
  elever: ['elever'] as const,
  elevList: (filters?: any) => [...queryKeys.elever, 'list', filters] as const,
  elev: (id: number) => [...queryKeys.elever, 'detail', id] as const,
  elevKontrakter: (elevId: number) => [...queryKeys.elever, elevId, 'kontrakter'] as const,
  
  // Sikkerhetskontroll
  sikkerhetskontroll: ['sikkerhetskontroll'] as const,
  sikkerhetskontrollList: (filters?: any) => [...queryKeys.sikkerhetskontroll, 'list', filters] as const,
  sikkerhetskontroll_detail: (id: number) => [...queryKeys.sikkerhetskontroll, 'detail', id] as const,
  
  // Quiz
  quiz: ['quiz'] as const,
  quizList: () => [...queryKeys.quiz, 'list'] as const,
  quizDetail: (id: number) => [...queryKeys.quiz, 'detail', id] as const,
  quizResults: (userId: number) => [...queryKeys.quiz, 'results', userId] as const,
  
  // Oppgaver
  oppgaver: ['oppgaver'] as const,
  oppgaveList: (filters?: any) => [...queryKeys.oppgaver, 'list', filters] as const,
  oppgave: (id: number) => [...queryKeys.oppgaver, 'detail', id] as const,
  
  // Innstillinger
  innstillinger: ['innstillinger'] as const,
  systemConfig: () => [...queryKeys.innstillinger, 'system'] as const,
  notificationSettings: () => [...queryKeys.innstillinger, 'notifications'] as const,
} as const;

// ============================================================================
// PREFETCH STRATEGIES
// ============================================================================

/**
 * Prefetch kritiske data for bedre performance
 */
export const prefetchStrategies = {
  /**
   * Prefetch data for dashboard
   */
  prefetchDashboard: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.kontraktList(),
        queryFn: () => fetch('/api/kontrakter').then(res => res.json()),
        staleTime: 2 * 60 * 1000, // 2 minutter for dashboard data
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.bedriftList(),
        queryFn: () => fetch('/api/bedrifter').then(res => res.json()),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },
  
  /**
   * Prefetch brukerrelaterte data
   */
  prefetchUserData: async (userId: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.currentUser(),
      queryFn: () => fetch('/api/auth/me').then(res => res.json()),
      staleTime: 10 * 60 * 1000, // Brukerdata endres sjelden
    });
  },
  
  /**
   * Prefetch på route navigation
   */
  prefetchRouteData: {
    kontrakter: () => queryClient.prefetchQuery({
      queryKey: queryKeys.kontraktList(),
      queryFn: () => fetch('/api/kontrakter').then(res => res.json()),
    }),
    
    bedrifter: () => queryClient.prefetchQuery({
      queryKey: queryKeys.bedriftList(),
      queryFn: () => fetch('/api/bedrifter').then(res => res.json()),
    }),
    
    elever: () => queryClient.prefetchQuery({
      queryKey: queryKeys.elevList(),
      queryFn: () => fetch('/api/elever').then(res => res.json()),
    }),
  },
};

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Utilities for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate all queries for a specific entity
   */
  invalidateEntity: (entityType: keyof typeof queryKeys) => {
    const key = queryKeys[entityType] as any;
    // Handle både arrays og funksjoner
    const queryKey = typeof key === 'function' ? key() : key;
    return queryClient.invalidateQueries({ queryKey });
  },
  
  /**
   * Remove specific query from cache
   */
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  /**
   * Clear all cache
   */
  clearAll: () => {
    queryClient.clear();
  },
  
  /**
   * Get cache stats for debugging
   */
  getCacheStats: () => {
    const queries = queryClient.getQueryCache().getAll();
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      invalidQueries: queries.filter(q => q.state.isInvalidated).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    };
  },
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Performance monitoring for React Query
 */
export const performanceMonitoring = {
  /**
   * Log slow queries for optimization
   */
  logSlowQueries: () => {
    const queries = queryClient.getQueryCache().getAll();
    const slowQueries = queries.filter(query => {
      const state = query.state;
      return state.fetchStatus === 'fetching' && 
             state.dataUpdatedAt && 
             Date.now() - state.dataUpdatedAt > 3000; // > 3 sekunder
    });
    
    if (slowQueries.length > 0) {
      console.warn('Slow queries detected:', slowQueries.map(q => q.queryKey));
    }
  },
  
  /**
   * Monitor cache hit ratio
   */
  getCacheHitRatio: () => {
    const queries = queryClient.getQueryCache().getAll();
    const cacheHits = queries.filter(q => !q.state.isInvalidated).length;
    return queries.length > 0 ? (cacheHits / queries.length) * 100 : 0;
  },
};

export default queryClient; 