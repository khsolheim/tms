import api from '../lib/api';
import type { Rolle } from '../types/roller';

export interface SettingsCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  roles?: Rolle[];
  color: string;
}

export interface InnstillingerDashboardData {
  categories: SettingsCard[];
}

class InnstillingerService {
  async hentDashboardData(): Promise<InnstillingerDashboardData> {
    try {
      const response = await api.get('/innstillinger/dashboard');
      return response.data;
    } catch (error) {
      // Returner standarddata hvis API ikke er tilgjengelig
      return this.getStandardDashboardData();
    }
  }

  async hentSystemkonfigurasjon(): Promise<any> {
    const response = await api.get('/innstillinger/system');
    return response.data;
  }

  async oppdaterSystemkonfigurasjon(config: any): Promise<any> {
    const response = await api.put('/innstillinger/system', config);
    return response.data;
  }

  async hentBedriftsinnstillinger(bedriftId?: number): Promise<any> {
    const url = bedriftId ? `/innstillinger/bedrift/${bedriftId}` : '/innstillinger/bedrift';
    const response = await api.get(url);
    return response.data;
  }

  async oppdaterBedriftsinnstillinger(bedriftId: number, innstillinger: any): Promise<any> {
    const response = await api.put(`/innstillinger/bedrift/${bedriftId}`, innstillinger);
    return response.data;
  }

  async hentIntegrasjoninnstillinger(): Promise<any> {
    const response = await api.get('/innstillinger/integrasjoner');
    return response.data;
  }

  async oppdaterIntegrasjoninnstillinger(innstillinger: any): Promise<any> {
    const response = await api.put('/innstillinger/integrasjoner', innstillinger);
    return response.data;
  }

  async hentSikkerhetsinnstillinger(): Promise<any> {
    const response = await api.get('/innstillinger/sikkerhet');
    return response.data;
  }

  async oppdaterSikkerhetsinnstillinger(innstillinger: any): Promise<any> {
    const response = await api.put('/innstillinger/sikkerhet', innstillinger);
    return response.data;
  }

  async hentEpostinnstillinger(): Promise<any> {
    const response = await api.get('/innstillinger/epost');
    return response.data;
  }

  async oppdaterEpostinnstillinger(innstillinger: any): Promise<any> {
    const response = await api.put('/innstillinger/epost', innstillinger);
    return response.data;
  }

  async testEpostinnstillinger(innstillinger: any): Promise<boolean> {
    const response = await api.post('/innstillinger/epost/test', innstillinger);
    return response.data.success;
  }

  async hentRapporteringsinnstillinger(): Promise<any> {
    const response = await api.get('/innstillinger/rapportering');
    return response.data;
  }

  async oppdaterRapporteringsinnstillinger(innstillinger: any): Promise<any> {
    const response = await api.put('/innstillinger/rapportering', innstillinger);
    return response.data;
  }

  async eksporterInnstillinger(): Promise<Blob> {
    const response = await api.get('/innstillinger/eksport', {
      responseType: 'blob'
    });
    return response.data;
  }

  async importerInnstillinger(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/innstillinger/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  private getStandardDashboardData(): InnstillingerDashboardData {
    return {
      categories: [
        {
          title: 'Rolletilganger',
          description: 'Administrer brukerroller og tilganger i systemet',
          icon: 'FiUsers',
          route: '/innstillinger/admin/rolletilganger',
          roles: ['ADMIN'],
          color: 'bg-blue-50 text-blue-600 border-blue-200'
        },
        {
          title: 'Systemkonfigurasjon',
          description: 'Generelle systeminnstillinger og konfigurasjoner',
          icon: 'FiSettings',
          route: '/innstillinger/system',
          roles: ['ADMIN'],
          color: 'bg-green-50 text-green-600 border-green-200'
        },
        {
          title: 'Sidebar Administrasjon',
          description: 'Konfigurer hvilke sider som vises i sidebaren for forskjellige roller',
          icon: 'FiSidebar',
          route: '/innstillinger/system/sidebar',
          roles: ['ADMIN'],
          color: 'bg-blue-50 text-blue-600 border-blue-200'
        },
        {
          title: 'Bedriftsinnstillinger',
          description: 'Administrer bedrifter og deres spesifikke innstillinger',
          icon: 'FiGlobe',
          route: '/innstillinger/bedrifter',
          roles: ['HOVEDBRUKER', 'ADMIN'],
          color: 'bg-purple-50 text-purple-600 border-purple-200'
        },
        {
          title: 'Sikkerhetskontroll',
          description: 'Konfigurer sjekkpunkter, kjøretøy og kontrollparametere',
          icon: 'FiShield',
          route: '/innstillinger/sikkerhetskontroll',
          roles: ['ADMIN'],
          color: 'bg-red-50 text-red-600 border-red-200'
        },
        {
          title: 'Rapporteringsinnstillinger',
          description: 'Konfigurer rapportmaler og eksportformater',
          icon: 'FiBarChart2',
          route: '/innstillinger/rapportering',
          roles: ['HOVEDBRUKER', 'ADMIN'],
          color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
        },
        {
          title: 'Integrasjonsinnstillinger',
          description: 'API-nøkler og innstillinger for eksterne tjenester',
          icon: 'FiKey',
          route: '/innstillinger/integrasjoner',
          roles: ['ADMIN'],
          color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
        },
        {
          title: 'Referanse-data',
          description: 'Administrer sjekkpunkt-systemer og førerkortklasser',
          icon: 'FiDatabase',
          route: '/innstillinger/admin/referanse-data',
          roles: ['ADMIN'],
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
        },
        {
          title: 'Datavedlikehold',
          description: 'Backup, arkivering og rensing av systemdata',
          icon: 'FiDatabase',
          route: '/innstillinger/datavedlikehold',
          roles: ['ADMIN'],
          color: 'bg-gray-50 text-gray-600 border-gray-200'
        },
        {
          title: 'E-postinnstillinger',
          description: 'Konfigurer e-postmaler og varslingssystem',
          icon: 'FiMail',
          route: '/innstillinger/epost',
          roles: ['ADMIN'],
          color: 'bg-teal-50 text-teal-600 border-teal-200'
        },
        {
          title: 'Automatisering',
          description: 'Planlagte oppgaver og automatiske prosesser',
          icon: 'FiClock',
          route: '/innstillinger/automatisering',
          roles: ['ADMIN'],
          color: 'bg-orange-50 text-orange-600 border-orange-200'
        },
        {
          title: 'Sikkerhet & Logger',
          description: 'Overvåk sikkerhetshendelser, logger og systemaktivitet',
          icon: 'FiAlertTriangle',
          route: '/innstillinger/sikkerhet/logger',
          roles: ['ADMIN'],
          color: 'bg-red-50 text-red-600 border-red-200'
        },
        {
          title: 'API & Integrasjoner',
          description: 'Administrer API-nøkler og eksterne integrasjoner',
          icon: 'FiGlobe',
          route: '/innstillinger/integrasjoner/api',
          roles: ['ADMIN'],
          color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
        },
        {
          title: 'Vedlikeholdsmodus',
          description: 'Systemvedlikehold og avanserte utviklerverktøy',
          icon: 'FiTool',
          route: '/innstillinger/vedlikehold',
          roles: ['ADMIN'],
          color: 'bg-pink-50 text-pink-600 border-pink-200'
        }
      ]
    };
  }
}

export default new InnstillingerService(); 