import api from '../lib/api';

interface Nyhet {
  id: string;
  tittel: string;
  innhold: string;
  sammendrag?: string;
  bildeUrl?: string;
  kategori: string;
  tags: string[];
  prioritet: number;
  visning: 'ALLE' | 'BEDRIFT' | 'ADMIN';
  publisert: boolean;
  publiseringsdato?: string;
  forfatter: string;
  opprettet: string;
  oppdatert: string;
  opprettetDato: string;
  opprettetAv: string;
  lest?: boolean;
  viktig?: boolean;
  bedrift?: {
    id: number;
    navn: string;
  };
}

interface NyhetRequest {
  tittel: string;
  innhold: string;
  sammendrag?: string;
  bildeUrl?: string;
  kategori?: string;
  tags?: string[];
  prioritet?: number;
  visning?: 'ALLE' | 'BEDRIFT' | 'ADMIN';
  publisert?: boolean;
  publiseringsdato?: string;
}

interface NyheterQueryParams {
  page?: number;
  limit?: number;
  kategori?: string;
  search?: string;
  publisert?: boolean;
  sortBy?: 'opprettet' | 'oppdatert' | 'publiseringsdato' | 'tittel';
  sortOrder?: 'asc' | 'desc';
}

interface NyheterResponse {
  success: boolean;
  data: Nyhet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface NyhetResponse {
  success: boolean;
  data: Nyhet;
  message?: string;
}

interface KategoriStats {
  kategori: string;
  antall: number;
}

class NyheterService {
  // Hent alle nyheter med paginering og filtrering
  async hentNyheter(params: NyheterQueryParams = {}): Promise<NyheterResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.kategori) searchParams.append('kategori', params.kategori);
    if (params.search) searchParams.append('search', params.search);
    if (params.publisert !== undefined) searchParams.append('publisert', params.publisert.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    const queryString = searchParams.toString();
    const url = `/nyheter${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    
    // Transform data for frontend compatibility
    const transformedData = response.data.data.map((nyhet: any) => ({
      ...nyhet,
      id: nyhet.id.toString(), // Convert number to string
      opprettetDato: nyhet.opprettet,
      opprettetAv: nyhet.forfatter,
      lest: false, // Default to false, kan utvides til å hente fra bruker-status senere
      viktig: nyhet.prioritet > 3 // Høy prioritet = viktig
    }));
    
    return {
      ...response.data,
      data: transformedData
    };
  }

  // Hent spesifikk nyhet
  async hentNyhet(id: string): Promise<NyhetResponse> {
    const response = await api.get(`/nyheter/${id}`);
    
    // Transform data for frontend compatibility
    const transformedData = {
      ...response.data.data,
      id: response.data.data.id.toString(),
      opprettetDato: response.data.data.opprettet,
      opprettetAv: response.data.data.forfatter,
      lest: false,
      viktig: response.data.data.prioritet > 3
    };
    
    return {
      ...response.data,
      data: transformedData
    };
  }

  // Opprett ny nyhet
  async opprettNyhet(data: NyhetRequest): Promise<NyhetResponse> {
    const response = await api.post('/nyheter', data);
    return response.data;
  }

  // Oppdater nyhet
  async oppdaterNyhet(id: number, data: Partial<NyhetRequest>): Promise<NyhetResponse> {
    const response = await api.put(`/nyheter/${id}`, data);
    return response.data;
  }

  // Slett nyhet
  async slettNyhet(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/nyheter/${id}`);
    return response.data;
  }

  // Hent kategori-statistikk
  async hentKategoriStats(): Promise<{ success: boolean; data: KategoriStats[] }> {
    const response = await api.get('/nyheter/kategorier/stats');
    return response.data;
  }

  // Hent kun publiserte nyheter (for offentlig visning)
  async hentPubliserteNyheter(params: Omit<NyheterQueryParams, 'publisert'> = {}): Promise<NyheterResponse> {
    return this.hentNyheter({ ...params, publisert: true });
  }

  // Hent uleste nyheter for bruker
  async hentUlesteNyheter(): Promise<NyheterResponse> {
    // Denne vil kreve en utvidelse av API for å holde styr på leste/uleste per bruker
    return this.hentPubliserteNyheter({ sortBy: 'publiseringsdato', sortOrder: 'desc' });
  }

  // Søk i nyheter
  async søkNyheter(søketerm: string, kategori?: string): Promise<NyheterResponse> {
    return this.hentNyheter({
      search: søketerm,
      kategori,
      publisert: true
    });
  }
}

export const nyheterService = new NyheterService();
export type { Nyhet, NyhetRequest, NyheterQueryParams, NyheterResponse, NyhetResponse, KategoriStats }; 