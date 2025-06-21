/**
 * React Query Configuration
 * 
 * Optimalisert konfigurasjon for data fetching og caching
 * med performance i fokus
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { log } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ApiError {
  response?: {
    status: number;
    data: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const queryConfig: DefaultOptions = {
  queries: {
    // Cache konfigurering
    staleTime: 5 * 60 * 1000,        // 5 minutter - data er "fresh"
    gcTime: 10 * 60 * 1000,          // 10 minutter - cache lifetime (tidligere cacheTime)
    
    // Refetch strategi
    refetchOnWindowFocus: false,      // Ikke refetch på focus (kan være irriterende)
    refetchOnReconnect: true,         // Refetch når tilkobling gjenopprettes
    refetchOnMount: true,             // Refetch når komponent mounter
    
    // Retry konfigurasjon
    retry: (failureCount, error: ApiError) => {
      // Ikke retry for 404, 401, 403
      const statusCode = error?.response?.status;
      if (statusCode === 404 || 
          statusCode === 401 || 
          statusCode === 403) {
        return false;
      }
      
      // Maksimalt 3 forsøk for andre feil
      return failureCount < 3;
    },
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Error handling
    throwOnError: false,              // Ikke kast errors automatisk
    
    // Network mode
    networkMode: 'online',            // Kun kjør queries når online
  },
  
  mutations: {
    // Retry konfigurasjon for mutations
    retry: (failureCount, error: ApiError) => {
      // Ikke retry for client errors (4xx)
      const statusCode = error?.response?.status;
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return false;
      }
      
      // Maksimalt 2 forsøk for server errors
      return failureCount < 2;
    },
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    
    // Network mode
    networkMode: 'online',
    
    // Global error handler med bedre logging og user feedback
    onError: (error: ApiError) => {
      // Log error for debugging med structured data
      log.apiError('mutation', error);
      
      // Show user-friendly error message basert på error type
      let message = 'Det oppstod en feil. Prøv igjen senere.';
      
             const statusCode = error?.response?.status;
       
       if (statusCode === 401) {
         message = 'Du er ikke logget inn. Vennligst logg inn på nytt.';
       } else if (statusCode === 403) {
         message = 'Du har ikke tilgang til denne handlingen.';
       } else if (statusCode === 404) {
         message = 'Den forespurte ressursen ble ikke funnet.';
       } else if (statusCode && statusCode >= 500) {
         message = 'Serverfeil. Vennligst prøv igjen senere.';
       } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.response?.data?.error) {
        message = error.response.data.error;
      } else if (error?.message) {
        message = error.message;
      }
      
      toast.error(message);
    },
  },
};

// ============================================================================
// QUERY CLIENT INSTANCE
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Sentrale query keys for bedre organisering og invalidering
 */
export const queryKeys = {
  // Bedrift relaterte queries
  bedrifter: ['bedrifter'] as const,
  bedrift: (id: string) => ['bedrift', id] as const,
  bedriftKontrakter: (bedriftId: string) => ['bedrift', bedriftId, 'kontrakter'] as const,
  
  // Kontrakt relaterte queries
  kontrakter: ['kontrakter'] as const,
  kontrakt: (id: string) => ['kontrakt', id] as const,
  kontraktStatistikk: () => ['kontrakter', 'statistikk'] as const,
  
  // Elev relaterte queries
  elever: ['elever'] as const,
  elev: (id: string) => ['elev', id] as const,
  elevKontrakter: (elevId: string) => ['elev', elevId, 'kontrakter'] as const,
  
  // Sikkerhetskontroll relaterte queries
  sikkerhetskontroller: ['sikkerhetskontroller'] as const,
  sikkerhetskontroll: (id: string) => ['sikkerhetskontroll', id] as const,
  sikkerhetskontrollMaler: () => ['sikkerhetskontroll-maler'] as const,
  
  // Quiz relaterte queries
  quizzer: ['quizzer'] as const,
  quiz: (id: string) => ['quiz', id] as const,
  quizKategorier: () => ['quiz-kategorier'] as const,
  
  // Ansatt relaterte queries
  ansatte: ['ansatte'] as const,
  ansatt: (id: string) => ['ansatt', id] as const,
  
  // System relaterte queries
  systemKonfig: () => ['system-konfig'] as const,
  notifikasjoner: () => ['notifikasjoner'] as const,
  
  // Dashboard og statistikk
  dashboard: () => ['dashboard'] as const,
  statistikk: () => ['statistikk'] as const,
  rapporter: () => ['rapporter'] as const,
  
  // Søk og filtrering
  søk: (query: string) => ['søk', query] as const,
  filter: (type: string, filters: Record<string, any>) => [type, 'filter', filters] as const,
} as const;

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

/**
 * Prefetch kritiske data for bedre UX
 */
export const prefetchHelpers = {
  /**
   * Prefetch bedriftdata når bruker hovrer over bedrift-link
   */
  async prefetchBedrift(bedriftId: string) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.bedrift(bedriftId),
      queryFn: () => fetch(`/api/v1/bedrifter/${bedriftId}`).then(res => res.json()),
      staleTime: 2 * 60 * 1000, // 2 minutter for prefetched data
    });
  },

  /**
   * Prefetch kontrakt-data
   */
  async prefetchKontrakt(kontraktId: string) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.kontrakt(kontraktId),
      queryFn: () => fetch(`/api/v1/kontrakter/${kontraktId}`).then(res => res.json()),
      staleTime: 2 * 60 * 1000,
    });
  },

  /**
   * Prefetch dashboard data for rask navigasjon
   */
  async prefetchDashboard() {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard(),
        queryFn: () => fetch('/api/v1/dashboard').then(res => res.json()),
        staleTime: 1 * 60 * 1000, // 1 minutt for dashboard
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.statistikk(),
        queryFn: () => fetch('/api/v1/statistikk').then(res => res.json()),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },
};

// ============================================================================
// INVALIDATION HELPERS
// ============================================================================

/**
 * Hjelpefunksjoner for å invalidere relaterte queries
 */
export const invalidationHelpers = {
  /**
   * Invalider alle bedrift-relaterte queries
   */
  invalidateBedriftData(bedriftId?: string) {
    if (bedriftId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.bedrift(bedriftId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bedriftKontrakter(bedriftId) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.bedrifter });
    }
  },

  /**
   * Invalider alle kontrakt-relaterte queries
   */
  invalidateKontraktData(kontraktId?: string) {
    if (kontraktId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.kontrakt(kontraktId) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.kontrakter });
      queryClient.invalidateQueries({ queryKey: queryKeys.kontraktStatistikk() });
    }
  },

  /**
   * Invalider alle elev-relaterte queries
   */
  invalidateElevData(elevId?: string) {
    if (elevId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.elev(elevId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.elevKontrakter(elevId) });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.elever });
    }
  },

  /**
   * Invalider dashboard og statistikk
   */
  invalidateDashboardData() {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.statistikk() });
  },
};

// ============================================================================
// OPTIMISTIC UPDATE HELPERS
// ============================================================================

/**
 * Hjelpefunksjoner for optimistic updates
 */
export const optimisticHelpers = {
  /**
   * Optimistic update for kontrakt status
   */
  async updateKontraktStatusOptimistically(
    kontraktId: string, 
    newStatus: string,
    mutationFn: () => Promise<any>
  ) {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.kontrakt(kontraktId) });

    // Snapshot the previous value
    const previousKontrakt = queryClient.getQueryData(queryKeys.kontrakt(kontraktId));

    // Optimistically update to the new value
    if (previousKontrakt) {
      queryClient.setQueryData(queryKeys.kontrakt(kontraktId), (old: any) => ({
        ...old,
        status: newStatus,
        oppdatert: new Date().toISOString(),
      }));
    }

    try {
      // Perform the mutation
      const result = await mutationFn();
      return result;
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKeys.kontrakt(kontraktId), previousKontrakt);
      throw error;
    }
  },
};

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

/**
 * Background sync for å holde data oppdatert
 */
class BackgroundSync {
  private intervals: NodeJS.Timeout[] = [];

  /**
   * Start bakgrunns-synkronisering for kritiske data
   */
  startBackgroundSync() {
    // Synkroniser dashboard data hvert 5. minutt
    const dashboardInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        log.debug('Background sync: Invalidating dashboard data');
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      }
    }, 5 * 60 * 1000);

    // Synkroniser notifikasjoner hvert minutt
    const notificationInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        log.debug('Background sync: Invalidating notifications');
        queryClient.invalidateQueries({ queryKey: queryKeys.notifikasjoner() });
      }
    }, 60 * 1000);

    // Lagre interval IDs for cleanup
    this.intervals.push(dashboardInterval);
    this.intervals.push(notificationInterval);

    log.info('Background sync started');
  }

  /**
   * Stopp bakgrunns-synkronisering
   */
  stopBackgroundSync() {
    // Clear alle intervals
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    
    // Reset intervals array
    this.intervals = [];
    
    log.info('Background sync stopped');
  }
}

export const backgroundSync = new BackgroundSync();

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default queryClient; 