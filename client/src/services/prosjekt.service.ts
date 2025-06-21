import api from '../lib/api';

export interface ProjectMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  subtitle: string;
}

export interface ProjectModule {
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

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'overdue';
  progress: number;
  budget: string;
  team: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface QuickAction {
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface ProsjektDashboardData {
  metrics: ProjectMetric[];
  modules: ProjectModule[];
  recentProjects: Project[];
  quickActions: QuickAction[];
}

export interface Oppgave {
  id: string;
  prosjektId: string;
  tittel: string;
  beskrivelse: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  prioritet: 'low' | 'medium' | 'high' | 'critical';
  ansvarlig: string;
  startDato: string;
  sluttDato: string;
  estimertTimer: number;
  faktiskeTimer: number;
  avhengigheter: string[];
}

export interface Milepæl {
  id: string;
  prosjektId: string;
  navn: string;
  beskrivelse: string;
  dato: string;
  status: 'pending' | 'completed' | 'overdue';
  kritisk: boolean;
  leveranser: string[];
}

export interface Ressurs {
  id: string;
  navn: string;
  type: 'person' | 'utstyr' | 'budsjett';
  kapasitet: number;
  allokert: number;
  kostnad: number;
  tilgjengelig: boolean;
}

class ProsjektService {
  async hentDashboardData(): Promise<ProsjektDashboardData> {
    try {
      const response = await api.get('/prosjekt/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  async hentProsjekter(): Promise<Project[]> {
    const response = await api.get('/prosjekt');
    return response.data;
  }

  async hentProsjekt(id: string): Promise<Project> {
    const response = await api.get(`/prosjekt/${id}`);
    return response.data;
  }

  async opprettProsjekt(prosjekt: Omit<Project, 'id'>): Promise<Project> {
    const response = await api.post('/prosjekt', prosjekt);
    return response.data;
  }

  async oppdaterProsjekt(id: string, prosjekt: Partial<Project>): Promise<Project> {
    const response = await api.put(`/prosjekt/${id}`, prosjekt);
    return response.data;
  }

  async slettProsjekt(id: string): Promise<void> {
    await api.delete(`/prosjekt/${id}`);
  }

  async hentOppgaver(prosjektId?: string): Promise<Oppgave[]> {
    const params = prosjektId ? `?prosjektId=${prosjektId}` : '';
    const response = await api.get(`/prosjekt/oppgaver${params}`);
    return response.data;
  }

  async opprettOppgave(oppgave: Omit<Oppgave, 'id'>): Promise<Oppgave> {
    const response = await api.post('/prosjekt/oppgaver', oppgave);
    return response.data;
  }

  async oppdaterOppgave(id: string, oppgave: Partial<Oppgave>): Promise<Oppgave> {
    const response = await api.put(`/prosjekt/oppgaver/${id}`, oppgave);
    return response.data;
  }

  async hentMilepæler(prosjektId?: string): Promise<Milepæl[]> {
    const params = prosjektId ? `?prosjektId=${prosjektId}` : '';
    const response = await api.get(`/prosjekt/milepæler${params}`);
    return response.data;
  }

  async opprettMilepæl(milepæl: Omit<Milepæl, 'id'>): Promise<Milepæl> {
    const response = await api.post('/prosjekt/milepæler', milepæl);
    return response.data;
  }

  async hentRessurser(): Promise<Ressurs[]> {
    const response = await api.get('/prosjekt/ressurser');
    return response.data;
  }

  async allokerRessurs(prosjektId: string, ressursId: string, allokering: number): Promise<void> {
    await api.post(`/prosjekt/${prosjektId}/ressurser`, { ressursId, allokering });
  }

  async registrerTid(oppgaveId: string, timer: number, dato: string, beskrivelse?: string): Promise<void> {
    await api.post('/prosjekt/tidssporing', { oppgaveId, timer, dato, beskrivelse });
  }

  async hentTidssporing(prosjektId?: string, fraDato?: string, tilDato?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (prosjektId) params.append('prosjektId', prosjektId);
    if (fraDato) params.append('fraDato', fraDato);
    if (tilDato) params.append('tilDato', tilDato);
    
    const response = await api.get(`/prosjekt/tidssporing?${params.toString()}`);
    return response.data;
  }

  async genererGanttData(prosjektId: string): Promise<any> {
    const response = await api.get(`/prosjekt/${prosjektId}/gantt`);
    return response.data;
  }

  async genererProsjektrapport(prosjektId: string, type: string): Promise<Blob> {
    const response = await api.get(`/prosjekt/${prosjektId}/rapport/${type}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async hentProsjektAnalytics(prosjektId?: string): Promise<any> {
    const params = prosjektId ? `/${prosjektId}` : '';
    const response = await api.get(`/prosjekt/analytics${params}`);
    return response.data;
  }

  private getStandardDashboardData(): ProsjektDashboardData {
    return {
      metrics: [
        {
          title: 'Aktive Prosjekter',
          value: '23',
          change: '+5',
          changeType: 'increase',
          icon: 'BriefcaseIcon',
          color: 'blue',
          subtitle: 'Pågående prosjekter'
        },
        {
          title: 'Gjennomsnittlig Fremdrift',
          value: '67%',
          change: '+12%',
          changeType: 'increase',
          icon: 'ChartBarIcon',
          color: 'green',
          subtitle: 'Alle prosjekter'
        },
        {
          title: 'Total Budsjett',
          value: 'NOK 8.4M',
          change: '+1.2M',
          changeType: 'increase',
          icon: 'CurrencyDollarIcon',
          color: 'purple',
          subtitle: 'Aktive prosjekter'
        },
        {
          title: 'Team Kapasitet',
          value: '82%',
          change: '-3%',
          changeType: 'decrease',
          icon: 'UsersIcon',
          color: 'indigo',
          subtitle: 'Ressursbruk'
        }
      ],
      modules: [
        {
          title: 'Prosjektoversikt',
          description: 'Administrer alle prosjekter, se status og fremdrift på ett sted.',
          icon: 'BriefcaseIcon',
          solidIcon: 'BriefcaseSolidIcon',
          href: '/prosjekt/oversikt',
          color: 'blue',
          stats: {
            total: '23 aktive',
            change: '+5',
            changeType: 'increase'
          }
        },
        {
          title: 'Tidsplanlegging',
          description: 'Gantt-diagrammer, milepæler og tidslinjer for optimal planlegging.',
          icon: 'CalendarDaysIcon',
          solidIcon: 'CalendarDaysSolidIcon',
          href: '/prosjekt/gantt',
          color: 'green',
          stats: {
            total: '156 oppgaver',
            change: '+24',
            changeType: 'increase'
          }
        },
        {
          title: 'Ressursallokering',
          description: 'Administrer team, budsjett og utstyr på tvers av prosjekter.',
          icon: 'UsersIcon',
          solidIcon: 'UsersSolidIcon',
          href: '/prosjekt/ressurser',
          color: 'purple',
          stats: {
            total: '82% kapasitet',
            change: '-3%',
            changeType: 'decrease'
          }
        },
        {
          title: 'Milepæler',
          description: 'Definer og følg opp kritiske milepæler og leveranser.',
          icon: 'FlagIcon',
          solidIcon: 'FlagIcon',
          href: '/prosjekt/milepæler',
          color: 'yellow',
          stats: {
            total: '18 milepæler',
            change: '+6',
            changeType: 'increase'
          }
        },
        {
          title: 'Tidssporing',
          description: 'Registrer og analyser tid brukt på oppgaver og aktiviteter.',
          icon: 'ClockIcon',
          solidIcon: 'ClockSolidIcon',
          href: '/prosjekt/tidssporing',
          color: 'red',
          stats: {
            total: '1,247 timer',
            change: '+156',
            changeType: 'increase'
          }
        },
        {
          title: 'Rapporter',
          description: 'Generer detaljerte prosjektrapporter og analyser.',
          icon: 'DocumentTextIcon',
          solidIcon: 'DocumentTextSolidIcon',
          href: '/prosjekt/rapporter',
          color: 'indigo',
          stats: {
            total: '15 rapporter',
            change: '+3',
            changeType: 'increase'
          }
        }
      ],
      recentProjects: [
        {
          id: '1',
          title: 'Ny Trafikksikkerhetsplatform',
          description: 'Utvikling av digital læringsplatform',
          status: 'active',
          progress: 78,
          budget: 'NOK 2.4M',
          team: 8,
          deadline: '15. april',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Kjøretøy Modernisering',
          description: 'Oppgradering av kjøretøypark',
          status: 'active',
          progress: 45,
          budget: 'NOK 1.8M',
          team: 5,
          deadline: '30. mai',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Sertifiseringssystem V2',
          description: 'Ny versjon av sertifiseringssystem',
          status: 'paused',
          progress: 32,
          budget: 'NOK 950K',
          team: 4,
          deadline: '20. juni',
          priority: 'low'
        }
      ],
      quickActions: [
        {
          name: 'Nytt prosjekt',
          description: 'Start nytt prosjekt',
          icon: 'PlusIcon',
          href: '/prosjekt/ny',
          color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        },
        {
          name: 'Gantt-oversikt',
          description: 'Se tidsplan',
          icon: 'CalendarDaysIcon',
          href: '/prosjekt/gantt',
          color: 'bg-green-50 text-green-700 hover:bg-green-100'
        },
        {
          name: 'Ressursrapport',
          description: 'Se kapasitet',
          icon: 'ChartBarIcon',
          href: '/prosjekt/ressurser/rapport',
          color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        },
        {
          name: 'Tidsskjema',
          description: 'Registrer tid',
          icon: 'ClockIcon',
          href: '/prosjekt/tidssporing/ny',
          color: 'bg-red-50 text-red-700 hover:bg-red-100'
        }
      ]
    };
  }
}

export default new ProsjektService(); 