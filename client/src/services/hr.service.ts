import api from '../lib/api';

export interface HRMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  subtitle: string;
}

export interface HRModule {
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

export interface HRDashboardData {
  metrics: HRMetric[];
  modules: HRModule[];
  quickActions: QuickAction[];
}

export interface Ansatt {
  id: number;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  stilling: string;
  avdeling: string;
  startdato: string;
  lonn: number;
  status: 'aktiv' | 'inaktiv' | 'permisjon';
  kompetanser: string[];
  sertifiseringer: string[];
}

export interface LonnData {
  ansattId: number;
  periode: string;
  grunnlonn: number;
  overtid: number;
  tillegg: number;
  fradrag: number;
  nettolonn: number;
  feriepenger: number;
  arbeidsgiveravgift: number;
}

export interface Kompetanse {
  id: number;
  navn: string;
  kategori: string;
  beskrivelse: string;
  nivaa: 'begynner' | 'middels' | 'avansert' | 'ekspert';
  sertifiseringKrevd: boolean;
  gyldighetsPeriode?: number; // måneder
}

export interface Sykefravær {
  id: number;
  ansattId: number;
  fravarType: 'sykmelding' | 'egenmelding' | 'karantene';
  fraDato: string;
  tilDato?: string;
  årsak?: string;
  legeerklaering?: boolean;
  status: 'aktiv' | 'avsluttet';
}

class HRService {
  async hentDashboardData(): Promise<HRDashboardData> {
    try {
      const response = await api.get('/hr/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  async hentAnsatte(): Promise<Ansatt[]> {
    const response = await api.get('/hr/ansatte');
    return response.data;
  }

  async hentAnsatt(id: number): Promise<Ansatt> {
    const response = await api.get(`/hr/ansatte/${id}`);
    return response.data;
  }

  async opprettAnsatt(ansatt: Omit<Ansatt, 'id'>): Promise<Ansatt> {
    const response = await api.post('/hr/ansatte', ansatt);
    return response.data;
  }

  async oppdaterAnsatt(id: number, ansatt: Partial<Ansatt>): Promise<Ansatt> {
    const response = await api.put(`/hr/ansatte/${id}`, ansatt);
    return response.data;
  }

  async slettAnsatt(id: number): Promise<void> {
    await api.delete(`/hr/ansatte/${id}`);
  }

  async hentLonnData(ansattId?: number, periode?: string): Promise<LonnData[]> {
    const params = new URLSearchParams();
    if (ansattId) params.append('ansattId', ansattId.toString());
    if (periode) params.append('periode', periode);
    
    const response = await api.get(`/hr/lonn?${params.toString()}`);
    return response.data;
  }

  async opprettLonnData(lonnData: Omit<LonnData, 'id'>): Promise<LonnData> {
    const response = await api.post('/hr/lonn', lonnData);
    return response.data;
  }

  async hentKompetanser(): Promise<Kompetanse[]> {
    const response = await api.get('/hr/kompetanser');
    return response.data;
  }

  async opprettKompetanse(kompetanse: Omit<Kompetanse, 'id'>): Promise<Kompetanse> {
    const response = await api.post('/hr/kompetanser', kompetanse);
    return response.data;
  }

  async hentAnsattKompetanser(ansattId: number): Promise<Kompetanse[]> {
    const response = await api.get(`/hr/ansatte/${ansattId}/kompetanser`);
    return response.data;
  }

  async leggTilAnsattKompetanse(ansattId: number, kompetanseId: number): Promise<void> {
    await api.post(`/hr/ansatte/${ansattId}/kompetanser`, { kompetanseId });
  }

  async hentSykefravær(ansattId?: number): Promise<Sykefravær[]> {
    const params = ansattId ? `?ansattId=${ansattId}` : '';
    const response = await api.get(`/hr/sykefravær${params}`);
    return response.data;
  }

  async registrerSykefravær(sykefravær: Omit<Sykefravær, 'id'>): Promise<Sykefravær> {
    const response = await api.post('/hr/sykefravær', sykefravær);
    return response.data;
  }

  async avsluttSykefravær(id: number, tilDato: string): Promise<void> {
    await api.put(`/hr/sykefravær/${id}/avslutt`, { tilDato });
  }

  async genererLonnsliste(periode: string): Promise<Blob> {
    const response = await api.get(`/hr/lonn/liste/${periode}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async genererFraværsrapport(fraDato: string, tilDato: string): Promise<Blob> {
    const response = await api.get(`/hr/sykefravær/rapport`, {
      params: { fraDato, tilDato },
      responseType: 'blob'
    });
    return response.data;
  }

  async hentHRAnalytics(): Promise<any> {
    const response = await api.get('/hr/analytics');
    return response.data;
  }

  private getStandardDashboardData(): HRDashboardData {
    return {
      metrics: [
        {
          title: 'Totalt Ansatte',
          value: '127',
          change: '+8',
          changeType: 'increase',
          icon: 'UsersIcon',
          color: 'blue',
          subtitle: 'Aktive ansatte'
        },
        {
          title: 'Gjennomsnittlig Lønn',
          value: 'NOK 485K',
          change: '+3.2%',
          changeType: 'increase',
          icon: 'CurrencyDollarIcon',
          color: 'green',
          subtitle: 'Årlig lønn'
        },
        {
          title: 'Kompetansenivå',
          value: '87%',
          change: '+5.1%',
          changeType: 'increase',
          icon: 'AcademicCapIcon',
          color: 'purple',
          subtitle: 'Gjennomsnitt'
        },
        {
          title: 'Sykefravær',
          value: '3.2%',
          change: '-0.8%',
          changeType: 'decrease',
          icon: 'HeartIcon',
          color: 'red',
          subtitle: 'Siste 12 måneder'
        }
      ],
      modules: [
        {
          title: 'Personalregister',
          description: 'Komplett oversikt over alle ansatte med personalia, kontraktsinformasjon og historikk.',
          icon: 'UsersIcon',
          solidIcon: 'UsersSolidIcon',
          href: '/hr/personalregister',
          color: 'blue',
          stats: {
            total: '127 ansatte',
            change: '+8',
            changeType: 'increase'
          }
        },
        {
          title: 'Lønnsadministrasjon',
          description: 'Håndter lønn, feriepenger, overtid og andre økonomiske ytelser for ansatte.',
          icon: 'CurrencyDollarIcon',
          solidIcon: 'CurrencyDollarSolidIcon',
          href: '/hr/lonn',
          color: 'green',
          stats: {
            total: 'NOK 4.2M',
            change: '+12.3%',
            changeType: 'increase'
          }
        },
        {
          title: 'Kompetansematrise',
          description: 'Kartlegg og utvikle ansattes kompetanse, sertifiseringer og opplæringsbehov.',
          icon: 'AcademicCapIcon',
          solidIcon: 'AcademicCapSolidIcon',
          href: '/hr/kompetanse',
          color: 'purple',
          stats: {
            total: '87% kompetansenivå',
            change: '+5.1%',
            changeType: 'increase'
          }
        },
        {
          title: 'Sykefravær',
          description: 'Overvåk og administrer sykefravær, egenmelding og sykmeldinger systematisk.',
          icon: 'HeartIcon',
          solidIcon: 'HeartSolidIcon',
          href: '/hr/sykefravær',
          color: 'red',
          stats: {
            total: '3.2% fravær',
            change: '-0.8%',
            changeType: 'decrease'
          }
        },
        {
          title: 'Prestasjonsevaluering',
          description: 'Gjennomfør strukturerte evalueringer, sett mål og følg opp ansattes utvikling.',
          icon: 'TrophyIcon',
          solidIcon: 'TrophySolidIcon',
          href: '/hr/performance',
          color: 'yellow',
          stats: {
            total: '94% deltakelse',
            change: '+7.2%',
            changeType: 'increase'
          }
        },
        {
          title: 'HR Analytics',
          description: 'Dybdegående analyser og rapporter for strategisk HR-arbeid og beslutningsstøtte.',
          icon: 'ChartBarIcon',
          solidIcon: 'ChartBarSolidIcon',
          href: '/hr/analytics',
          color: 'indigo',
          stats: {
            total: '24 nøkkeltall',
            change: '+6',
            changeType: 'increase'
          }
        }
      ],
      quickActions: [
        {
          name: 'Registrer ny ansatt',
          description: 'Legg til ny medarbeider',
          icon: 'UserPlusIcon',
          href: '/hr/personalregister/ny',
          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        },
        {
          name: 'Lønnsliste',
          description: 'Generer lønnsliste',
          icon: 'CurrencyDollarIcon',
          href: '/hr/lonn/liste',
          color: 'bg-green-50 text-green-700 hover:bg-green-100'
        },
        {
          name: 'Fraværsrapport',
          description: 'Se fraværsstatistikk',
          icon: 'ClockIcon',
          href: '/hr/sykefravær/rapport',
          color: 'bg-red-50 text-red-700 hover:bg-red-100'
        },
        {
          name: 'Kompetanseoversikt',
          description: 'Se kompetansegap',
          icon: 'AcademicCapIcon',
          href: '/hr/kompetanse/oversikt',
          color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        }
      ]
    };
  }
}

export default new HRService(); 