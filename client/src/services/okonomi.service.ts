import api from '../lib/api';

// Interfaces
export interface Faktura {
  id: string;
  fakturaNumber: string;
  kunde: {
    id: string;
    navn: string;
    epost: string;
    adresse: {
      gate: string;
      postnummer: string;
      poststed: string;
    };
  };
  linjer: {
    id: string;
    beskrivelse: string;
    antall: number;
    enhetspris: number;
    mva: number;
    totalPris: number;
  }[];
  subtotal: number;
  mvaBeløp: number;
  totalBeløp: number;
  status: 'UTKAST' | 'SENDT' | 'BETALT' | 'FORSINKET' | 'KREDITERT';
  forfallsdato: string;
  betalingsdato?: string;
  opprettet: string;
  oppdatert: string;
  betalingsmetode?: 'KORT' | 'VIPPS' | 'FAKTURA' | 'KONTANT';
  referanse?: string;
  kommentarer?: string;
}

export interface Betaling {
  id: string;
  fakturaId: string;
  beløp: number;
  betalingsdato: string;
  betalingsmetode: 'KORT' | 'VIPPS' | 'FAKTURA' | 'KONTANT';
  referanse: string;
  status: 'VELLYKKET' | 'FEILET' | 'VENTER';
  transaksjonId?: string;
}

export interface ØkonomiStatistikk {
  totalOmsetning: number;
  månedsOmsetning: number;
  utestående: number;
  forsinkedeFakturaer: number;
  betalteFacturaer: number;
  antallKunder: number;
  gjennomsnittFaktura: number;
  omsetningTrend: {
    måned: string;
    beløp: number;
  }[];
  betalingsmetoder: {
    metode: string;
    antall: number;
    beløp: number;
  }[];
}

export interface Kunde {
  id: string;
  navn: string;
  epost: string;
  telefon?: string;
  adresse: {
    gate: string;
    postnummer: string;
    poststed: string;
  };
  organisasjonsnummer?: string;
  totalKjøp: number;
  antallFakturaer: number;
  sisteBetaling?: string;
  status: 'AKTIV' | 'INAKTIV' | 'SPERRET';
  opprettet: string;
  oppdatert: string;
}

export interface ØkonomiFilters {
  status?: string;
  kunde?: string;
  dateFrom?: string;
  dateTo?: string;
  betalingsmetode?: string;
  search?: string;
}

export interface KPICard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

export interface FinanceCard {
  title: string;
  description: string;
  icon: string;
  solidIcon: string;
  href: string;
  color: string;
  stats?: {
    total: string;
    change: string;
    changeType: 'increase' | 'decrease' | 'neutral';
  };
}

export interface QuickAction {
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface OkonomiDashboardData {
  kpiData: KPICard[];
  financeModules: FinanceCard[];
  quickActions: QuickAction[];
}

class ØkonomiService {
  // Hent dashboard data
  async hentDashboardData(): Promise<OkonomiDashboardData> {
    try {
      const response = await api.get('/okonomi/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  // Hent fakturaer
  async hentFakturaer(filters?: ØkonomiFilters): Promise<Faktura[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.kunde) params.append('kunde', filters.kunde);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.betalingsmetode) params.append('betalingsmetode', filters.betalingsmetode);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/okonomi/fakturaer?${params.toString()}`);
    return response.data;
  }

  // Hent økonomi-statistikk
  async hentStatistikk(): Promise<ØkonomiStatistikk> {
    const response = await api.get('/okonomi/statistikk');
    return response.data;
  }

  // Opprett faktura
  async opprettFaktura(fakturaData: Partial<Faktura>): Promise<Faktura> {
    const response = await api.post('/okonomi/fakturaer', fakturaData);
    return response.data;
  }

  // Oppdater faktura
  async oppdaterFaktura(fakturaId: string, fakturaData: Partial<Faktura>): Promise<Faktura> {
    const response = await api.put(`/okonomi/fakturaer/${fakturaId}`, fakturaData);
    return response.data;
  }

  // Send faktura
  async sendFaktura(fakturaId: string): Promise<void> {
    await api.post(`/okonomi/fakturaer/${fakturaId}/send`);
  }

  // Registrer betaling
  async registrerBetaling(fakturaId: string, betalingData: Partial<Betaling>): Promise<Betaling> {
    const response = await api.post(`/okonomi/fakturaer/${fakturaId}/betaling`, betalingData);
    return response.data;
  }

  // Hent kunder
  async hentKunder(): Promise<Kunde[]> {
    const response = await api.get('/okonomi/kunder');
    return response.data;
  }

  // Opprett kunde
  async opprettKunde(kundeData: Partial<Kunde>): Promise<Kunde> {
    const response = await api.post('/okonomi/kunder', kundeData);
    return response.data;
  }

  private getStandardDashboardData(): OkonomiDashboardData {
    return {
      kpiData: [
        {
          title: 'Total Omsetning',
          value: 'NOK 2,450,000',
          change: '+12.3%',
          changeType: 'increase',
          icon: 'BanknotesIcon',
          color: 'green'
        },
        {
          title: 'Måneds Omsetning',
          value: 'NOK 285,000',
          change: '+8.5%',
          changeType: 'increase',
          icon: 'ReceiptPercentIcon',
          color: 'blue'
        },
        {
          title: 'Utestående',
          value: 'NOK 125,000',
          change: '-5.2%',
          changeType: 'decrease',
          icon: 'ClockIcon',
          color: 'red'
        },
        {
          title: 'Antall Kunder',
          value: '342',
          change: '+3',
          changeType: 'increase',
          icon: 'BuildingLibraryIcon',
          color: 'indigo'
        }
      ],
      financeModules: [
        {
          title: 'Fakturering',
          description: 'Opprett, send og håndter fakturaer. Automatisk fakturering basert på kontrakter og tjenester.',
          icon: 'DocumentTextIcon',
          solidIcon: 'DocumentTextSolidIcon',
          href: '/okonomi/fakturering',
          color: 'blue',
          stats: {
            total: '156 fakturaer',
            change: '+23',
            changeType: 'increase'
          }
        },
        {
          title: 'Betalinger',
          description: 'Overvåk innkommende betalinger, håndter purringer og administrer kundefordringer.',
          icon: 'CreditCardIcon',
          solidIcon: 'CreditCardSolidIcon',
          href: '/okonomi/betalinger',
          color: 'green',
          stats: {
            total: 'NOK 2.3M betalt',
            change: '+15.2%',
            changeType: 'increase'
          }
        },
        {
          title: 'Budsjett',
          description: 'Opprett og administrer budsjetter, sammenlign faktiske tall med prognoser og planlegg fremtiden.',
          icon: 'CalculatorIcon',
          solidIcon: 'CalculatorSolidIcon',
          href: '/okonomi/budsjett',
          color: 'purple',
          stats: {
            total: '94% av budsjett',
            change: '+2.1%',
            changeType: 'increase'
          }
        },
        {
          title: 'Utgifter',
          description: 'Registrer og kategoriser utgifter, administrer kvitteringer og hold oversikt over kostnadene.',
          icon: 'ReceiptPercentIcon',
          solidIcon: 'ReceiptPercentIcon',
          href: '/okonomi/utgifter',
          color: 'red',
          stats: {
            total: 'NOK 387K utgifter',
            change: '-5.2%',
            changeType: 'decrease'
          }
        },
        {
          title: 'Rapporter',
          description: 'Generer detaljerte økonomiske rapporter, analyser og sammenlign perioder for bedre beslutninger.',
          icon: 'ChartBarIcon',
          solidIcon: 'ChartBarSolidIcon',
          href: '/okonomi/rapporter',
          color: 'indigo',
          stats: {
            total: '12 rapporter',
            change: '+4',
            changeType: 'increase'
          }
        }
      ],
      quickActions: [
        {
          name: 'Ny faktura',
          description: 'Opprett faktura',
          icon: 'PlusIcon',
          href: '/okonomi/fakturering/ny',
          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        },
        {
          name: 'Registrer betaling',
          description: 'Manuell betalingsregistrering',
          icon: 'CreditCardIcon',
          href: '/okonomi/betalinger/registrer',
          color: 'bg-green-50 text-green-700 hover:bg-green-100'
        },
        {
          name: 'Legg til utgift',
          description: 'Ny utgiftspost',
          icon: 'ReceiptPercentIcon',
          href: '/okonomi/utgifter/ny',
          color: 'bg-red-50 text-red-700 hover:bg-red-100'
        },
        {
          name: 'Generer rapport',
          description: 'Økonomirapport',
          icon: 'DocumentArrowDownIcon',
          href: '/okonomi/rapporter/generer',
          color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        }
      ]
    };
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    fakturaer: Faktura[];
    statistikk: ØkonomiStatistikk;
    kunder: Kunde[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const kunder: Kunde[] = [
      {
        id: '1',
        navn: 'Ola Nordmann',
        epost: 'ola@example.com',
        telefon: '+47 123 45 678',
        adresse: {
          gate: 'Storgata 1',
          postnummer: '0123',
          poststed: 'Oslo'
        },
        totalKjøp: 25000,
        antallFakturaer: 3,
        sisteBetaling: '2025-06-10',
        status: 'AKTIV',
        opprettet: '2025-01-15T10:00:00Z',
        oppdatert: '2025-06-10T14:30:00Z'
      },
      {
        id: '2',
        navn: 'Kari Hansen',
        epost: 'kari@example.com',
        telefon: '+47 987 65 432',
        adresse: {
          gate: 'Lillegata 5',
          postnummer: '0456',
          poststed: 'Bergen'
        },
        totalKjøp: 18500,
        antallFakturaer: 2,
        sisteBetaling: '2025-06-05',
        status: 'AKTIV',
        opprettet: '2025-02-20T09:00:00Z',
        oppdatert: '2025-06-05T11:15:00Z'
      }
    ];

    const fakturaer: Faktura[] = [
      {
        id: '1',
        fakturaNumber: 'F-2025-001',
        kunde: kunder[0],
        linjer: [
          {
            id: '1',
            beskrivelse: 'Kjøretimer - 10 timer',
            antall: 10,
            enhetspris: 800,
            mva: 25,
            totalPris: 10000
          },
          {
            id: '2',
            beskrivelse: 'Teoriundervisning',
            antall: 1,
            enhetspris: 2000,
            mva: 25,
            totalPris: 2500
          }
        ],
        subtotal: 10000,
        mvaBeløp: 2500,
        totalBeløp: 12500,
        status: 'BETALT',
        forfallsdato: '2025-06-25',
        betalingsdato: '2025-06-10',
        opprettet: '2025-06-01T10:00:00Z',
        oppdatert: '2025-06-10T14:30:00Z',
        betalingsmetode: 'VIPPS',
        referanse: 'VIP-123456'
      },
      {
        id: '2',
        fakturaNumber: 'F-2025-002',
        kunde: kunder[1],
        linjer: [
          {
            id: '3',
            beskrivelse: 'Kjøretimer - 15 timer',
            antall: 15,
            enhetspris: 800,
            mva: 25,
            totalPris: 15000
          }
        ],
        subtotal: 12000,
        mvaBeløp: 3000,
        totalBeløp: 15000,
        status: 'SENDT',
        forfallsdato: '2025-06-30',
        opprettet: '2025-06-05T09:00:00Z',
        oppdatert: '2025-06-05T09:00:00Z',
        kommentarer: 'Betaling innen 14 dager'
      },
      {
        id: '3',
        fakturaNumber: 'F-2025-003',
        kunde: kunder[0],
        linjer: [
          {
            id: '4',
            beskrivelse: 'Oppkjøringsavgift',
            antall: 1,
            enhetspris: 1200,
            mva: 25,
            totalPris: 1500
          }
        ],
        subtotal: 1200,
        mvaBeløp: 300,
        totalBeløp: 1500,
        status: 'FORSINKET',
        forfallsdato: '2025-05-15',
        opprettet: '2025-05-01T12:00:00Z',
        oppdatert: '2025-05-01T12:00:00Z'
      }
    ];

    const statistikk: ØkonomiStatistikk = {
      totalOmsetning: 125000,
      månedsOmsetning: 29000,
      utestående: 16500,
      forsinkedeFakturaer: 1,
      betalteFacturaer: 8,
      antallKunder: 15,
      gjennomsnittFaktura: 8333,
      omsetningTrend: [
        { måned: 'Jan', beløp: 18000 },
        { måned: 'Feb', beløp: 22000 },
        { måned: 'Mar', beløp: 25000 },
        { måned: 'Apr', beløp: 31000 },
        { måned: 'Mai', beløp: 29000 },
        { måned: 'Jun', beløp: 29000 }
      ],
      betalingsmetoder: [
        { metode: 'VIPPS', antall: 5, beløp: 45000 },
        { metode: 'KORT', antall: 3, beløp: 28000 },
        { metode: 'FAKTURA', antall: 2, beløp: 23000 },
        { metode: 'KONTANT', antall: 1, beløp: 5000 }
      ]
    };

    return { fakturaer, statistikk, kunder };
  }
}

export const økonomiService = new ØkonomiService();
export default økonomiService; 