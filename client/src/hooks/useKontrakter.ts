/**
 * useKontrakter Hook
 * 
 * React Query hook for kontrakt data management
 * med optimistic updates og intelligent caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================

interface Kontrakt {
  id: number;
  bedriftId: number;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
  status: 'KLADD' | 'AKTIV' | 'AVSLUTTET';
  totalPris: number;
  elevNavn?: string;
  bedriftNavn?: string;
}

export interface KontraktFilters {
  status?: string;
  bedriftId?: number;
  search?: string;
  elevNavn?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreateKontraktData {
  bedriftId: number;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
  totalPris: number;
}

interface KontraktStats {
  totalKontrakter: number;
  aktiveKontrakter: number;
  utkastKontrakter: number;
  avsluttedeKontrakter: number;
  totalVerdi: number;
  gjennomsnittligVerdi: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const kontraktApi = {
  // Hent alle kontrakter
  getKontrakter: async (filters?: KontraktFilters): Promise<Kontrakt[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.bedriftId) params.append('bedriftId', filters.bedriftId.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`/api/kontrakter?${params}`);
    if (!response.ok) throw new Error('Kunne ikke hente kontrakter');
    return response.json();
  },

  // Hent enkelt kontrakt
  getKontrakt: async (id: number): Promise<Kontrakt> => {
    const response = await fetch(`/api/kontrakter/${id}`);
    if (!response.ok) throw new Error('Kunne ikke hente kontrakt');
    return response.json();
  },

  // Opprett ny kontrakt
  createKontrakt: async (data: CreateKontraktData): Promise<Kontrakt> => {
    const response = await fetch('/api/kontrakter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Kunne ikke opprette kontrakt');
    return response.json();
  },

  // Oppdater kontrakt
  updateKontrakt: async (id: number, data: Partial<Kontrakt>): Promise<Kontrakt> => {
    const response = await fetch(`/api/kontrakter/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Kunne ikke oppdatere kontrakt');
    return response.json();
  },

  // Slett kontrakt
  deleteKontrakt: async (id: number): Promise<void> => {
    const response = await fetch(`/api/kontrakter/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Kunne ikke slette kontrakt');
  },

  // Hent kontrakt-statistikk
  getKontraktStats: async (filters?: KontraktFilters): Promise<KontraktStats> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.bedriftId) params.append('bedriftId', filters.bedriftId.toString());

    const response = await fetch(`/api/kontrakter/stats?${params}`);
    if (!response.ok) throw new Error('Kunne ikke hente statistikk');
    return response.json();
  },
};

// ============================================================================
// QUERY KEYS
// ============================================================================

export const kontraktKeys = {
  all: ['kontrakter'] as const,
  lists: () => [...kontraktKeys.all, 'list'] as const,
  list: (filters?: KontraktFilters) => [...kontraktKeys.lists(), filters] as const,
  details: () => [...kontraktKeys.all, 'detail'] as const,
  detail: (id: number) => [...kontraktKeys.details(), id] as const,
  stats: () => [...kontraktKeys.all, 'stats'] as const,
  stat: (filters?: KontraktFilters) => [...kontraktKeys.stats(), filters] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hent liste av kontrakter
 */
export const useKontrakter = (filters?: KontraktFilters) => {
  return useQuery({
    queryKey: kontraktKeys.list(filters),
    queryFn: () => kontraktApi.getKontrakter(filters),
    staleTime: 5 * 60 * 1000, // 5 minutter
    retry: 3,
  });
};

/**
 * Hent enkelt kontrakt
 */
export const useKontrakt = (id: number) => {
  return useQuery({
    queryKey: kontraktKeys.detail(id),
    queryFn: () => kontraktApi.getKontrakt(id),
    staleTime: 10 * 60 * 1000, // 10 minutter for detaljer
    retry: 3,
    enabled: !!id, // Kun kjør hvis id finnes
  });
};

/**
 * Opprett ny kontrakt
 */
export const useCreateKontrakt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kontraktApi.createKontrakt,
    onMutate: async (newKontrakt) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: kontraktKeys.lists() });

      // Snapshot current value
      const previousKontrakter = queryClient.getQueryData(kontraktKeys.lists());

      // Optimistically update
      queryClient.setQueryData(kontraktKeys.lists(), (old: Kontrakt[] | undefined) => {
        if (!old) return [{ ...newKontrakt, id: Date.now(), status: 'KLADD' as const }];
        return [...old, { ...newKontrakt, id: Date.now(), status: 'KLADD' as const }];
      });

      return { previousKontrakter };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousKontrakter) {
        queryClient.setQueryData(kontraktKeys.lists(), context.previousKontrakter);
      }
      toast.error('Kunne ikke opprette kontrakt');
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: kontraktKeys.lists() });
      toast.success('Kontrakt opprettet!');
    },
  });
};

/**
 * Oppdater kontrakt
 */
export const useUpdateKontrakt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Kontrakt> }) =>
      kontraktApi.updateKontrakt(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: kontraktKeys.detail(id) });

      // Snapshot current value
      const previousKontrakt = queryClient.getQueryData(kontraktKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(kontraktKeys.detail(id), (old: Kontrakt | undefined) => {
        if (!old) return undefined;
        return { ...old, ...data };
      });

      return { previousKontrakt };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousKontrakt) {
        queryClient.setQueryData(kontraktKeys.detail(variables.id), context.previousKontrakt);
      }
      toast.error('Kunne ikke oppdatere kontrakt');
    },
    onSuccess: (data, variables) => {
      // Update cache og invalidate lists
      queryClient.setQueryData(kontraktKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: kontraktKeys.lists() });
      toast.success('Kontrakt oppdatert!');
    },
  });
};

/**
 * Slett kontrakt
 */
export const useDeleteKontrakt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kontraktApi.deleteKontrakt,
    onMutate: async (id) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: kontraktKeys.lists() });

      // Snapshot current value
      const previousKontrakter = queryClient.getQueryData(kontraktKeys.lists());

      // Optimistically update
      queryClient.setQueryData(kontraktKeys.lists(), (old: Kontrakt[] | undefined) => {
        if (!old) return [];
        return old.filter(kontrakt => kontrakt.id !== id);
      });

      return { previousKontrakter };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousKontrakter) {
        queryClient.setQueryData(kontraktKeys.lists(), context.previousKontrakter);
      }
      toast.error('Kunne ikke slette kontrakt');
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: kontraktKeys.lists() });
      toast.success('Kontrakt slettet!');
    },
  });
};

/**
 * Prefetch kontrakt data for bedre performance
 */
export const usePrefetchKontrakt = () => {
  const queryClient = useQueryClient();

  return {
    prefetchKontrakt: (id: number) => {
      queryClient.prefetchQuery({
        queryKey: kontraktKeys.detail(id),
        queryFn: () => kontraktApi.getKontrakt(id),
        staleTime: 10 * 60 * 1000,
      });
    },
    prefetchKontrakter: (filters?: KontraktFilters) => {
      queryClient.prefetchQuery({
        queryKey: kontraktKeys.list(filters),
        queryFn: () => kontraktApi.getKontrakter(filters),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};

/**
 * Hent kontrakt-statistikk
 */
export const useKontraktStats = (filters?: KontraktFilters) => {
  return useQuery({
    queryKey: kontraktKeys.stat(filters),
    queryFn: () => kontraktApi.getKontraktStats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutter for stats
    retry: 3,
  });
}; 