import api from '../lib/api';

// Interfaces
export interface QuizStatistikk {
  totaleQuizer: number;
  totaleDeltagere: number;
  gjennomsnittScore: number;
  beståttProsent: number;
  aktivitetstrender: {
    dato: string;
    antallQuizer: number;
    antallDeltagere: number;
    gjennomsnittScore: number;
  }[];
}

export interface KategoriStatistikk {
  kategori: string;
  antallQuizer: number;
  gjennomsnittScore: number;
  beståttProsent: number;
  popularitet: number;
}

export interface ElevYtelse {
  elevId: string;
  elevNavn: string;
  bedrift: string;
  totaleQuizer: number;
  gjennomsnittScore: number;
  beståttQuizer: number;
  sisteAktivitet: string;
  forbedring: number;
}

export interface QuizYtelse {
  quizId: string;
  quizTittel: string;
  kategori: string;
  antallForsøk: number;
  gjennomsnittScore: number;
  beståttProsent: number;
  gjennomsnittTid: number;
  sisteOppdatering: string;
}

// Nye interfaces for kategori-administrasjon
export interface QuizKategori {
  id: string;
  navn: string;
  beskrivelse?: string;
  farge: string;
  ikon?: string;
  aktiv: boolean;
  opprettDato: string;
  sistOppdatert: string;
  antallQuizer: number;
  antallSpørsmål: number;
}

export interface KategoriOpprettData {
  navn: string;
  beskrivelse?: string;
  farge: string;
  ikon?: string;
  aktiv?: boolean;
}

// Interfaces for elevresultater
export interface ElevResultat {
  id: string;
  elev: {
    id: string;
    navn: string;
    epost: string;
    bedrift: string;
    klasse: string;
  };
  quiz: {
    id: string;
    tittel: string;
    kategori: string;
    vanskelighetsgrad: string;
    maksPoeng: number;
  };
  forsøk: {
    forsøkNummer: number;
    dato: string;
    starttid: string;
    sluttid: string;
    varighet: number; // sekunder
    poengsum: number;
    prosent: number;
    bestått: boolean;
    antallRiktige: number;
    antallSpørsmål: number;
  };
  detaljer: {
    spørsmålsresultater: {
      spørsmålId: string;
      spørsmål: string;
      elevSvar: string;
      riktigSvar: string;
      erRiktig: boolean;
      tidsbrukt: number; // sekunder
    }[];
    svakePunkter: string[];
    sterkePunkter: string[];
  };
  sammenligning: {
    gjennomsnitt: number;
    percentil: number;
    rangering: number;
    totalDeltagere: number;
  };
}

export interface ElevResultatStatistikk {
  totaleResultater: number;
  beståttRate: number;
  gjennomsnittScore: number;
  gjennomsnittTid: number;
  besteScore: number;
  svakestePunkter: { område: string; feilprosent: number }[];
  aktiveBedrifter: number;
}

export interface ElevResultatFilter {
  søk?: string;
  bedrift?: string;
  klasse?: string;
  kategori?: string;
  status?: 'alle' | 'bestått' | 'strøket';
  tidsperiode?: '7d' | '30d' | '90d' | 'custom';
  fradato?: string;
  tildato?: string;
}

interface QuizStatistikkResponse {
  success: boolean;
  data: QuizStatistikk;
  message?: string;
}

interface KategoriStatistikkResponse {
  success: boolean;
  data: KategoriStatistikk[];
  message?: string;
}

interface ElevYtelseResponse {
  success: boolean;
  data: ElevYtelse[];
  message?: string;
}

interface QuizYtelseResponse {
  success: boolean;
  data: QuizYtelse[];
  message?: string;
}

class QuizService {
  // Hent quiz-statistikk
  async hentQuizStatistikk(tidsfilter?: string): Promise<QuizStatistikkResponse> {
    const params = new URLSearchParams();
    if (tidsfilter) params.append('tidsfilter', tidsfilter);
    
    const response = await api.get(`/quiz/statistikk?${params.toString()}`);
    return response.data;
  }

  // Hent kategori-statistikk
  async hentKategoriStatistikk(tidsfilter?: string): Promise<KategoriStatistikkResponse> {
    const params = new URLSearchParams();
    if (tidsfilter) params.append('tidsfilter', tidsfilter);
    
    const response = await api.get(`/quiz/kategorier/statistikk?${params.toString()}`);
    return response.data;
  }

  // Hent elevytelse
  async hentElevYtelse(tidsfilter?: string): Promise<ElevYtelseResponse> {
    const params = new URLSearchParams();
    if (tidsfilter) params.append('tidsfilter', tidsfilter);
    
    const response = await api.get(`/quiz/elever/ytelse?${params.toString()}`);
    return response.data;
  }

  // Hent quiz-ytelse
  async hentQuizYtelse(tidsfilter?: string): Promise<QuizYtelseResponse> {
    const params = new URLSearchParams();
    if (tidsfilter) params.append('tidsfilter', tidsfilter);
    
    const response = await api.get(`/quiz/ytelse?${params.toString()}`);
    return response.data;
  }

  // Elevresultater metoder
  async hentElevResultater(filter?: ElevResultatFilter): Promise<ElevResultat[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.søk) params.append('søk', filter.søk);
      if (filter?.bedrift) params.append('bedrift', filter.bedrift);
      if (filter?.klasse) params.append('klasse', filter.klasse);
      if (filter?.kategori) params.append('kategori', filter.kategori);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.tidsperiode) params.append('tidsperiode', filter.tidsperiode);
      if (filter?.fradato) params.append('fradato', filter.fradato);
      if (filter?.tildato) params.append('tildato', filter.tildato);
      
      const response = await api.get(`/quiz/elevresultater?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getFallbackElevResultater();
    }
  }

  async hentElevResultatStatistikk(filter?: ElevResultatFilter): Promise<ElevResultatStatistikk> {
    try {
      const params = new URLSearchParams();
      if (filter?.tidsperiode) params.append('tidsperiode', filter.tidsperiode);
      if (filter?.fradato) params.append('fradato', filter.fradato);
      if (filter?.tildato) params.append('tildato', filter.tildato);
      
      const response = await api.get(`/quiz/elevresultater/statistikk?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getFallbackElevResultatStatistikk();
    }
  }

  // Kategori-administrasjon
  async hentKategorier(): Promise<QuizKategori[]> {
    try {
      const response = await api.get('/quiz/kategorier');
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getStandardKategorier();
    }
  }

  async hentKategori(id: string): Promise<QuizKategori> {
    try {
      const response = await api.get(`/quiz/kategorier/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, bruker fallback data');
      return this.getStandardKategori(id);
    }
  }

  async opprettKategori(data: KategoriOpprettData): Promise<QuizKategori> {
    try {
      const response = await api.post('/quiz/kategorier', data);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, simulerer opprettelse');
      return this.simulerOpprettKategori(data);
    }
  }

  async oppdaterKategori(id: string, data: Partial<KategoriOpprettData>): Promise<QuizKategori> {
    try {
      const response = await api.put(`/quiz/kategorier/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('API ikke tilgjengelig, simulerer oppdatering');
      return this.simulerOppdaterKategori(id, data);
    }
  }

  async slettKategori(id: string): Promise<void> {
    try {
      await api.delete(`/quiz/kategorier/${id}`);
    } catch (error) {
      console.warn('API ikke tilgjengelig, simulerer sletting');
    }
  }

  // Eksporter quiz-rapport
  async eksporterRapport(format: 'xlsx' | 'pdf', tidsfilter?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (tidsfilter) params.append('tidsfilter', tidsfilter);
    params.append('format', format);
    
    const response = await api.get(`/quiz/rapport/eksporter?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Private fallback metoder for elevresultater
  private getFallbackElevResultater(): ElevResultat[] {
    return [
      {
        id: '1',
        elev: {
          id: 'e1',
          navn: 'Ola Nordmann',
          epost: 'ola@example.com',
          bedrift: 'Transport AS',
          klasse: 'B'
        },
        quiz: {
          id: 'q1',
          tittel: 'Grunnleggende Trafikkregler',
          kategori: 'Trafikkregler',
          vanskelighetsgrad: 'Lett',
          maksPoeng: 100
        },
        forsøk: {
          forsøkNummer: 2,
          dato: '2025-06-14',
          starttid: '10:00',
          sluttid: '10:23',
          varighet: 1380,
          poengsum: 87,
          prosent: 87,
          bestått: true,
          antallRiktige: 17,
          antallSpørsmål: 20
        },
        detaljer: {
          spørsmålsresultater: [],
          svakePunkter: ['Vikeplikt', 'Rundkjøringer'],
          sterkePunkter: ['Fartsgrenser', 'Skiltlære']
        },
        sammenligning: {
          gjennomsnitt: 78.5,
          percentil: 78,
          rangering: 12,
          totalDeltagere: 54
        }
      },
      {
        id: '2',
        elev: {
          id: 'e2',
          navn: 'Kari Hansen',
          epost: 'kari@example.com',
          bedrift: 'Frakt Norge',
          klasse: 'C'
        },
        quiz: {
          id: 'q2',
          tittel: 'Sikkerhetsutstyr Lastebil',
          kategori: 'Sikkerhet',
          vanskelighetsgrad: 'Middels',
          maksPoeng: 100
        },
        forsøk: {
          forsøkNummer: 1,
          dato: '2025-06-14',
          starttid: '14:30',
          sluttid: '14:55',
          varighet: 1500,
          poengsum: 93,
          prosent: 93,
          bestått: true,
          antallRiktige: 28,
          antallSpørsmål: 30
        },
        detaljer: {
          spørsmålsresultater: [],
          svakePunkter: ['ADR-reglement'],
          sterkePunkter: ['Sikkerhetsutstyr', 'Førerkort', 'Vedlikehold']
        },
        sammenligning: {
          gjennomsnitt: 82.1,
          percentil: 92,
          rangering: 3,
          totalDeltagere: 38
        }
      },
      {
        id: '3',
        elev: {
          id: 'e3',
          navn: 'Lars Olsen',
          epost: 'lars@example.com',
          bedrift: 'Grønn Logistikk',
          klasse: 'B'
        },
        quiz: {
          id: 'q1',
          tittel: 'Grunnleggende Trafikkregler',
          kategori: 'Trafikkregler',
          vanskelighetsgrad: 'Lett',
          maksPoeng: 100
        },
        forsøk: {
          forsøkNummer: 3,
          dato: '2025-06-13',
          starttid: '16:15',
          sluttid: '16:42',
          varighet: 1620,
          poengsum: 64,
          prosent: 64,
          bestått: false,
          antallRiktige: 13,
          antallSpørsmål: 20
        },
        detaljer: {
          spørsmålsresultater: [],
          svakePunkter: ['Vikeplikt', 'Parkering', 'Miljøkjøring'],
          sterkePunkter: ['Fartsgrenser']
        },
        sammenligning: {
          gjennomsnitt: 78.5,
          percentil: 25,
          rangering: 41,
          totalDeltagere: 54
        }
      }
    ];
  }

  private getFallbackElevResultatStatistikk(): ElevResultatStatistikk {
    return {
      totaleResultater: 156,
      beståttRate: 78.2,
      gjennomsnittScore: 79.4,
      gjennomsnittTid: 1440, // 24 minutter
      besteScore: 98,
      svakestePunkter: [
        { område: 'Vikeplikt', feilprosent: 34.2 },
        { område: 'Rundkjøringer', feilprosent: 28.7 },
        { område: 'Miljøkjøring', feilprosent: 23.1 }
      ],
      aktiveBedrifter: 12
    };
  }

  // Private fallback metoder
  private getStandardKategorier(): QuizKategori[] {
    return [
      {
        id: '1',
        navn: 'Trafikkregler',
        beskrivelse: 'Grunnleggende trafikkregler og forskrifter',
        farge: '#3B82F6',
        ikon: 'FaRoad',
        aktiv: true,
        opprettDato: '2025-01-01',
        sistOppdatert: '2025-06-14',
        antallQuizer: 15,
        antallSpørsmål: 450
      },
      {
        id: '2',
        navn: 'Sikkerhet',
        beskrivelse: 'Sikkerhetsprosedyrer og utstyr',
        farge: '#EF4444',
        ikon: 'FaShieldAlt',
        aktiv: true,
        opprettDato: '2025-01-01',
        sistOppdatert: '2025-06-14',
        antallQuizer: 12,
        antallSpørsmål: 360
      },
      {
        id: '3',
        navn: 'Teknisk',
        beskrivelse: 'Tekniske aspekter ved kjøretøy',
        farge: '#10B981',
        ikon: 'FaCog',
        aktiv: true,
        opprettDato: '2025-01-01',
        sistOppdatert: '2025-06-14',
        antallQuizer: 8,
        antallSpørsmål: 240
      },
      {
        id: '4',
        navn: 'Miljø og drivstoff',
        beskrivelse: 'Miljøvennlig kjøring og drivstoffeffektivitet',
        farge: '#059669',
        ikon: 'FaLeaf',
        aktiv: true,
        opprettDato: '2025-01-01',
        sistOppdatert: '2025-06-14',
        antallQuizer: 6,
        antallSpørsmål: 180
      },
      {
        id: '5',
        navn: 'Førstehjelp',
        beskrivelse: 'Grunnleggende førstehjelp og nødsituasjoner',
        farge: '#DC2626',
        ikon: 'FaFirstAid',
        aktiv: true,
        opprettDato: '2025-01-01',
        sistOppdatert: '2025-06-14',
        antallQuizer: 4,
        antallSpørsmål: 120
      }
    ];
  }

  private getStandardKategori(id: string): QuizKategori {
    const kategorier = this.getStandardKategorier();
    return kategorier.find(k => k.id === id) || kategorier[0];
  }

  private simulerOpprettKategori(data: KategoriOpprettData): QuizKategori {
    return {
      id: Date.now().toString(),
      navn: data.navn,
      beskrivelse: data.beskrivelse,
      farge: data.farge,
      ikon: data.ikon,
      aktiv: data.aktiv ?? true,
      opprettDato: new Date().toISOString(),
      sistOppdatert: new Date().toISOString(),
      antallQuizer: 0,
      antallSpørsmål: 0
    };
  }

  private simulerOppdaterKategori(id: string, data: Partial<KategoriOpprettData>): QuizKategori {
    const eksisterende = this.getStandardKategori(id);
    return {
      ...eksisterende,
      ...data,
      sistOppdatert: new Date().toISOString()
    };
  }

  async hentMockData(): Promise<{
    statistikk: QuizStatistikk;
    kategorier: KategoriStatistikk[];
    elevYtelse: ElevYtelse[];
    quizYtelse: QuizYtelse[];
    elevResultater?: ElevResultat[];
    elevResultatStatistikk?: ElevResultatStatistikk;
  }> {
    // Simuler API-kall med forsinkelse
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      statistikk: {
        totaleQuizer: 45,
        totaleDeltagere: 234,
        gjennomsnittScore: 82.4,
        beståttProsent: 78.2,
        aktivitetstrender: [
          { dato: '2025-06-08', antallQuizer: 8, antallDeltagere: 45, gjennomsnittScore: 79.2 },
          { dato: '2025-06-09', antallQuizer: 12, antallDeltagere: 67, gjennomsnittScore: 81.5 },
          { dato: '2025-06-10', antallQuizer: 15, antallDeltagere: 89, gjennomsnittScore: 83.1 },
          { dato: '2025-06-11', antallQuizer: 18, antallDeltagere: 102, gjennomsnittScore: 82.8 },
          { dato: '2025-06-12', antallQuizer: 22, antallDeltagere: 125, gjennomsnittScore: 84.2 },
          { dato: '2025-06-13', antallQuizer: 28, antallDeltagere: 156, gjennomsnittScore: 83.7 },
          { dato: '2025-06-14', antallQuizer: 32, antallDeltagere: 178, gjennomsnittScore: 85.1 }
        ]
      },
      kategorier: [
        { kategori: 'Trafikkregler', antallQuizer: 15, gjennomsnittScore: 84.2, beståttProsent: 82.1, popularitet: 89 },
        { kategori: 'Sikkerhet', antallQuizer: 12, gjennomsnittScore: 79.8, beståttProsent: 75.3, popularitet: 76 },
        { kategori: 'Teknisk', antallQuizer: 8, gjennomsnittScore: 81.5, beståttProsent: 78.9, popularitet: 65 },
        { kategori: 'Miljø og drivstoff', antallQuizer: 6, gjennomsnittScore: 86.1, beståttProsent: 85.2, popularitet: 58 },
        { kategori: 'Førstehjelp', antallQuizer: 4, gjennomsnittScore: 77.3, beståttProsent: 71.8, popularitet: 42 }
      ],
      elevYtelse: [
        { elevId: 'e1', elevNavn: 'Ola Nordmann', bedrift: 'Transport AS', totaleQuizer: 8, gjennomsnittScore: 87.2, beståttQuizer: 7, sisteAktivitet: '2025-06-14', forbedring: 12.5 },
        { elevId: 'e2', elevNavn: 'Kari Hansen', bedrift: 'Frakt Norge', totaleQuizer: 12, gjennomsnittScore: 91.8, beståttQuizer: 11, sisteAktivitet: '2025-06-14', forbedring: 8.3 },
        { elevId: 'e3', elevNavn: 'Lars Olsen', bedrift: 'Grønn Logistikk', totaleQuizer: 6, gjennomsnittScore: 73.4, beståttQuizer: 4, sisteAktivitet: '2025-06-13', forbedring: -2.1 }
      ],
      quizYtelse: [
        { quizId: 'q1', quizTittel: 'Grunnleggende Trafikkregler', kategori: 'Trafikkregler', antallForsøk: 89, gjennomsnittScore: 84.2, beståttProsent: 82.1, gjennomsnittTid: 1380, sisteOppdatering: '2025-06-14' },
        { quizId: 'q2', quizTittel: 'Sikkerhetsutstyr Lastebil', kategori: 'Sikkerhet', antallForsøk: 67, gjennomsnittScore: 79.8, beståttProsent: 75.3, gjennomsnittTid: 1620, sisteOppdatering: '2025-06-14' }
      ],
      elevResultater: this.getFallbackElevResultater(),
      elevResultatStatistikk: this.getFallbackElevResultatStatistikk()
    };
  }
}

export const quizService = new QuizService();
export default quizService; 