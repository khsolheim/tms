import api from '../lib/api';

// Interfaces
export interface FAQItem {
  id: string;
  spørsmål: string;
  svar: string;
  kategori: 'GENERELT' | 'KJØRETIMER' | 'TEORI' | 'PRØVER' | 'BETALING' | 'TEKNISK';
  popularitet: number;
  opprettet: string;
  oppdatert: string;
  tags: string[];
  hjelpsom: number;
  ikkeHjelpsom: number;
}

export interface HjelpKategori {
  id: string;
  navn: string;
  beskrivelse: string;
  ikon: string;
  antallSpørsmål: number;
  populære: FAQItem[];
}

export interface KontaktInfo {
  telefon: string;
  epost: string;
  åpningstider: {
    mandag: string;
    tirsdag: string;
    onsdag: string;
    torsdag: string;
    fredag: string;
    lørdag: string;
    søndag: string;
  };
  adresse: {
    gate: string;
    postnummer: string;
    poststed: string;
  };
  sosialeMedier: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface SupportTicket {
  id: string;
  tittel: string;
  beskrivelse: string;
  kategori: string;
  prioritet: 'LAV' | 'NORMAL' | 'HØY' | 'KRITISK';
  status: 'ÅPEN' | 'UNDER_BEHANDLING' | 'VENTER_SVAR' | 'LØST' | 'LUKKET';
  opprettet: string;
  oppdatert: string;
  svar?: {
    melding: string;
    dato: string;
    ansatt: string;
  }[];
}

export interface HjelpFilters {
  kategori?: string;
  search?: string;
  sortBy?: 'popularitet' | 'dato' | 'alfabetisk';
}

class HjelpService {
  // Hent FAQ items
  async hentFAQ(filters?: HjelpFilters): Promise<FAQItem[]> {
    const params = new URLSearchParams();
    if (filters?.kategori) params.append('kategori', filters.kategori);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/hjelp/faq?${params.toString()}`);
    return response.data;
  }

  // Hent hjelp-kategorier
  async hentKategorier(): Promise<HjelpKategori[]> {
    const response = await api.get('/hjelp/kategorier');
    return response.data;
  }

  // Hent kontaktinformasjon
  async hentKontaktInfo(): Promise<KontaktInfo> {
    const response = await api.get('/hjelp/kontakt');
    return response.data;
  }

  // Søk i hjelp
  async søkHjelp(query: string): Promise<FAQItem[]> {
    const response = await api.get(`/hjelp/sok?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Opprett support ticket
  async opprettTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const response = await api.post('/hjelp/tickets', ticketData);
    return response.data;
  }

  // Hent mine tickets
  async hentMineTickets(): Promise<SupportTicket[]> {
    const response = await api.get('/hjelp/tickets/mine');
    return response.data;
  }

  // Marker FAQ som hjelpsom
  async markerHjelpsom(faqId: string, hjelpsom: boolean): Promise<void> {
    await api.post(`/hjelp/faq/${faqId}/feedback`, { hjelpsom });
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    faq: FAQItem[];
    kategorier: HjelpKategori[];
    kontakt: KontaktInfo;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const faq: FAQItem[] = [
      {
        id: '1',
        spørsmål: 'Hvor mange kjøretimer trenger jeg før oppkjøring?',
        svar: 'Det er ingen lovpålagt minimum antall kjøretimer, men de fleste trenger mellom 20-40 timer avhengig av erfaring og læringshastighet. Din instruktør vil vurdere når du er klar for oppkjøring.',
        kategori: 'KJØRETIMER',
        popularitet: 95,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['kjøretimer', 'oppkjøring', 'minimum'],
        hjelpsom: 45,
        ikkeHjelpsom: 3
      },
      {
        id: '2',
        spørsmål: 'Hvor mye koster det å ta førerkort?',
        svar: 'Totalkostnaden varierer, men regn med 15.000-25.000 kr for førerkort klasse B. Dette inkluderer teoriundervisning, kjøretimer, prøveavgifter og administrative kostnader.',
        kategori: 'BETALING',
        popularitet: 88,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['kostnad', 'pris', 'førerkort'],
        hjelpsom: 42,
        ikkeHjelpsom: 5
      },
      {
        id: '3',
        spørsmål: 'Kan jeg avbestille en kjøretime?',
        svar: 'Ja, du kan avbestille kjøretimer frem til 24 timer før avtalt tid uten kostnad. Ved avbestilling med mindre enn 24 timers varsel belastes du for timen.',
        kategori: 'KJØRETIMER',
        popularitet: 76,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['avbestilling', 'kjøretimer', 'regler'],
        hjelpsom: 38,
        ikkeHjelpsom: 2
      },
      {
        id: '4',
        spørsmål: 'Hvor lenge er teoriprøven gyldig?',
        svar: 'Teoriprøven er gyldig i 2 år fra bestått dato. Du må ta praktisk prøve innen denne perioden, ellers må du ta teoriprøven på nytt.',
        kategori: 'TEORI',
        popularitet: 82,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['teoriprøve', 'gyldighet', 'varighet'],
        hjelpsom: 40,
        ikkeHjelpsom: 1
      },
      {
        id: '5',
        spørsmål: 'Hva skjer hvis jeg stryker på oppkjøringen?',
        svar: 'Hvis du ikke består oppkjøringen, får du en rapport med områder som må forbedres. Du kan ta ny oppkjøring etter minimum 2 uker, men det anbefales å ta flere kjøretimer først.',
        kategori: 'PRØVER',
        popularitet: 71,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['oppkjøring', 'stryk', 'ny prøve'],
        hjelpsom: 35,
        ikkeHjelpsom: 4
      },
      {
        id: '6',
        spørsmål: 'Kan jeg bytte instruktør?',
        svar: 'Ja, du kan bytte instruktør hvis du ikke er fornøyd. Kontakt oss så finner vi en instruktør som passer bedre for deg. Det er viktig at du føler deg trygg og komfortabel.',
        kategori: 'GENERELT',
        popularitet: 65,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['instruktør', 'bytte', 'tilfredshet'],
        hjelpsom: 32,
        ikkeHjelpsom: 2
      },
      {
        id: '7',
        spørsmål: 'Hvordan logger jeg inn på nettsiden?',
        svar: 'Du logger inn med e-postadressen du oppga ved registrering og passordet du valgte. Hvis du har glemt passordet, klikk på "Glemt passord" på innloggingssiden.',
        kategori: 'TEKNISK',
        popularitet: 58,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['innlogging', 'passord', 'teknisk'],
        hjelpsom: 28,
        ikkeHjelpsom: 3
      },
      {
        id: '8',
        spørsmål: 'Kan jeg få refundert penger for ubrukte timer?',
        svar: 'Ja, ubrukte kjøretimer kan refunderes inntil 6 måneder etter kjøp. Kontakt oss for å få behandlet refusjonen. Merk at det kan være et behandlingsgebyr.',
        kategori: 'BETALING',
        popularitet: 54,
        opprettet: '2025-01-01T10:00:00Z',
        oppdatert: '2025-06-01T10:00:00Z',
        tags: ['refusjon', 'penger tilbake', 'ubrukte timer'],
        hjelpsom: 25,
        ikkeHjelpsom: 6
      }
    ];

    const kategorier: HjelpKategori[] = [
      {
        id: '1',
        navn: 'Kjøretimer',
        beskrivelse: 'Spørsmål om booking, avbestilling og gjennomføring av kjøretimer',
        ikon: '🚗',
        antallSpørsmål: 12,
        populære: faq.filter(f => f.kategori === 'KJØRETIMER').slice(0, 3)
      },
      {
        id: '2',
        navn: 'Teori og prøver',
        beskrivelse: 'Alt om teoriprøve, oppkjøring og andre prøver',
        ikon: '📚',
        antallSpørsmål: 8,
        populære: faq.filter(f => f.kategori === 'TEORI' || f.kategori === 'PRØVER').slice(0, 3)
      },
      {
        id: '3',
        navn: 'Betaling og priser',
        beskrivelse: 'Informasjon om priser, betaling og refusjon',
        ikon: '💳',
        antallSpørsmål: 6,
        populære: faq.filter(f => f.kategori === 'BETALING').slice(0, 3)
      },
      {
        id: '4',
        navn: 'Teknisk støtte',
        beskrivelse: 'Hjelp med nettsiden, appen og tekniske problemer',
        ikon: '🔧',
        antallSpørsmål: 5,
        populære: faq.filter(f => f.kategori === 'TEKNISK').slice(0, 3)
      },
      {
        id: '5',
        navn: 'Generelt',
        beskrivelse: 'Andre spørsmål og generell informasjon',
        ikon: '❓',
        antallSpørsmål: 10,
        populære: faq.filter(f => f.kategori === 'GENERELT').slice(0, 3)
      }
    ];

    const kontakt: KontaktInfo = {
      telefon: '+47 123 45 678',
      epost: 'hjelp@kjoreskole.no',
      åpningstider: {
        mandag: '08:00 - 17:00',
        tirsdag: '08:00 - 17:00',
        onsdag: '08:00 - 17:00',
        torsdag: '08:00 - 17:00',
        fredag: '08:00 - 16:00',
        lørdag: '10:00 - 14:00',
        søndag: 'Stengt'
      },
      adresse: {
        gate: 'Kjøreskoleveien 123',
        postnummer: '0123',
        poststed: 'Oslo'
      },
      sosialeMedier: {
        facebook: 'https://facebook.com/kjoreskole',
        instagram: 'https://instagram.com/kjoreskole',
        linkedin: 'https://linkedin.com/company/kjoreskole'
      }
    };

    return { faq, kategorier, kontakt };
  }
}

export const hjelpService = new HjelpService();
export default hjelpService; 