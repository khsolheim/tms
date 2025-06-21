import api from '../lib/api';

export interface SjekkpunktSystem {
  id: number;
  navn: string;
  beskrivelse: string;
  ikon: string;
  aktiv: boolean;
  rekkefølge: number;
  opprettet: string;
  oppdatert: string;
}

export interface FørerkortKlasse {
  id: number;
  kode: string;
  navn: string;
  beskrivelse: string;
  kategori: string;
  minimumsalder: number;
  krav: string[];
  aktiv: boolean;
  opprettet: string;
  oppdatert: string;
}

export interface QuizKategori {
  id: number;
  navn: string;
  beskrivelse?: string;
  _count: {
    sporsmal: number;
  };
}

export interface SikkerhetskontrollKategori {
  id: number;
  navn: string;
  beskrivelse?: string;
  klasseId: number;
  rekkefølge: number;
  aktiv: boolean;
  klasse: {
    kode: string;
    navn: string;
  };
  _count: {
    sporsmal: number;
  };
}

export interface ReferenceApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class ReferenceService {
  private baseUrl = '/api/reference';

  async getSjekkpunktSystemer(): Promise<SjekkpunktSystem[]> {
    try {
      const response = await api.get<ReferenceApiResponse<SjekkpunktSystem[]>>(
        `${this.baseUrl}/sjekkpunkt-systemer`
      );
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av sjekkpunkt-systemer:', error);
      throw error;
    }
  }

  async getFørerkortKlasser(kategori?: string): Promise<FørerkortKlasse[] | Record<string, FørerkortKlasse[]>> {
    try {
      const url = kategori 
        ? `${this.baseUrl}/foererkort-klasser?kategori=${kategori}`
        : `${this.baseUrl}/foererkort-klasser`;
      
      const response = await api.get<ReferenceApiResponse<FørerkortKlasse[] | Record<string, FørerkortKlasse[]>>>(url);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av førerkortklass-data:', error);
      throw error;
    }
  }

  async getQuizKategorier(): Promise<QuizKategori[]> {
    try {
      const response = await api.get<ReferenceApiResponse<QuizKategori[]>>(
        `${this.baseUrl}/quiz-kategorier`
      );
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av quiz-kategorier:', error);
      throw error;
    }
  }

  async getSikkerhetskontrollKategorier(klasseId?: number): Promise<SikkerhetskontrollKategori[]> {
    try {
      const url = klasseId 
        ? `${this.baseUrl}/sikkerhetskontroll-kategorier?klasseId=${klasseId}`
        : `${this.baseUrl}/sikkerhetskontroll-kategorier`;
      
      const response = await api.get<ReferenceApiResponse<SikkerhetskontrollKategori[]>>(url);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av sikkerhetskontroll-kategorier:', error);
      throw error;
    }
  }

  async getFørerkortKategorier(): Promise<string[]> {
    try {
      const response = await api.get<ReferenceApiResponse<string[]>>(
        `${this.baseUrl}/foererkort-kategorier`
      );
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av førerkort-kategorier:', error);
      throw error;
    }
  }

  async getAnsattRoller(): Promise<string[]> {
    try {
      const response = await api.get<ReferenceApiResponse<string[]>>(
        `${this.baseUrl}/ansatt-roller`
      );
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av ansatt-roller:', error);
      throw error;
    }
  }

  async getSystemRoller(): Promise<string[]> {
    try {
      const response = await api.get<ReferenceApiResponse<string[]>>(
        `${this.baseUrl}/system-roller`
      );
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av system-roller:', error);
      throw error;
    }
  }

  async getFilstorrelser(format: 'lang' | 'kort' = 'lang'): Promise<string[]> {
    try {
      const url = format === 'kort' 
        ? `${this.baseUrl}/filstorrelser?format=kort`
        : `${this.baseUrl}/filstorrelser`;
      
      const response = await api.get<ReferenceApiResponse<string[]>>(url);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av filstørrelse-enheter:', error);
      throw error;
    }
  }

  async getUkedager(format: 'kort' | 'lang' = 'kort'): Promise<string[]> {
    try {
      const url = format === 'lang' 
        ? `${this.baseUrl}/ukedager?format=lang`
        : `${this.baseUrl}/ukedager`;
      
      const response = await api.get<ReferenceApiResponse<string[]>>(url);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av ukedager:', error);
      throw error;
    }
  }

  async getMaaneder(format: 'kort' | 'lang' = 'lang'): Promise<string[]> {
    try {
      const url = format === 'kort' 
        ? `${this.baseUrl}/maaneder?format=kort`
        : `${this.baseUrl}/maaneder`;
      
      const response = await api.get<ReferenceApiResponse<string[]>>(url);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av måneder:', error);
      throw error;
    }
  }

  async getNyhetPrioriteringer(): Promise<any[]> {
    try {
      const response = await api.get<ReferenceApiResponse<any[]>>(`${this.baseUrl}/nyhet-prioriteter`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av nyhetsprioriteringer:', error);
      throw error;
    }
  }

  async getNyhetKategorier(): Promise<any[]> {
    try {
      const response = await api.get<ReferenceApiResponse<any[]>>(`${this.baseUrl}/nyhet-kategorier`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av nyhetskategorier:', error);
      throw error;
    }
  }

  async getKontraktStatuser(): Promise<any[]> {
    try {
      const response = await api.get<ReferenceApiResponse<any[]>>(`${this.baseUrl}/kontrakt-statuser`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av kontrakt-statuser:', error);
      throw error;
    }
  }

  async getApiStatuser(): Promise<any[]> {
    try {
      const response = await api.get<ReferenceApiResponse<any[]>>(`${this.baseUrl}/api-statuser`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av API-statuser:', error);
      throw error;
    }
  }

  async getApiTyper(): Promise<any[]> {
    try {
      const response = await api.get<ReferenceApiResponse<any[]>>(`${this.baseUrl}/api-typer`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av API-typer:', error);
      throw error;
    }
  }

  async getRolleKonfigurasjoner(): Promise<any[]> {
    try {
      const response = await api.get<ReferenceApiResponse<any[]>>(`${this.baseUrl}/rolle-konfigurasjoner`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av rolle-konfigurasjoner:', error);
      throw error;
    }
  }

  // Hjelpemetoder for å konvertere til gamle formater for bakoverkompatibilitet
  async getSjekkpunktSystemNavnListe(): Promise<string[]> {
    const systemer = await this.getSjekkpunktSystemer();
    return systemer.map(s => s.navn);
  }

  async getFørerkortKlasseKoder(): Promise<string[]> {
    const klasser = await this.getFørerkortKlasser() as Record<string, FørerkortKlasse[]>;
    const alleKlasser: FørerkortKlasse[] = [];
    
    Object.values(klasser).forEach(kategoriKlasser => {
      alleKlasser.push(...kategoriKlasser);
    });
    
    return alleKlasser
      .sort((a, b) => a.kode.localeCompare(b.kode))
      .map(k => k.kode);
  }

  // Admin CRUD operasjoner for sjekkpunkt-systemer
  async opprettSjekkpunktSystem(data: Omit<SjekkpunktSystem, 'id' | 'opprettet' | 'oppdatert'>): Promise<SjekkpunktSystem> {
    const response = await api.post('/api/reference/admin/sjekkpunkt-systemer', data);
    return response.data;
  }

  async oppdaterSjekkpunktSystem(id: number, data: Partial<Omit<SjekkpunktSystem, 'id' | 'opprettet' | 'oppdatert'>>): Promise<SjekkpunktSystem> {
    const response = await api.put(`/api/reference/admin/sjekkpunkt-systemer/${id}`, data);
    return response.data;
  }

  async slettSjekkpunktSystem(id: number): Promise<void> {
    await api.delete(`/api/reference/admin/sjekkpunkt-systemer/${id}`);
  }

  // Admin CRUD operasjoner for førerkortklasser
  async opprettFørerkortKlasse(data: Omit<FørerkortKlasse, 'id' | 'opprettet' | 'oppdatert'>): Promise<FørerkortKlasse> {
    const response = await api.post('/api/reference/admin/foererkort-klasser', data);
    return response.data;
  }

  async oppdaterFørerkortKlasse(id: number, data: Partial<Omit<FørerkortKlasse, 'id' | 'opprettet' | 'oppdatert'>>): Promise<FørerkortKlasse> {
    const response = await api.put(`/api/reference/admin/foererkort-klasser/${id}`, data);
    return response.data;
  }

  async slettFørerkortKlasse(id: number): Promise<void> {
    await api.delete(`/api/reference/admin/foererkort-klasser/${id}`);
  }
}

export const referenceService = new ReferenceService();
export default referenceService; 