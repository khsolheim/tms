import api from '../lib/api';

export interface DatabaseInfo {
  id: string;
  navn: string;
  type: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis';
  versjon: string;
  størrelse: string;
  status: 'aktiv' | 'vedlikehold' | 'feil';
  tilkoblinger: number;
  maksimaleTilkoblinger: number;
  lastBackup: string;
  nesteBackup: string;
  ytelse: {
    cpu: number;
    minne: number;
    diskbruk: number;
  };
}

export interface FirewallRegel {
  id: string;
  navn: string;
  type: 'innkommende' | 'utgående';
  protokoll: 'TCP' | 'UDP' | 'ICMP' | 'Alle';
  port: string;
  kildeIP: string;
  destinasjonIP: string;
  handling: 'tillat' | 'blokker';
  status: 'aktiv' | 'inaktiv';
  opprettet: string;
  sistEndret: string;
  beskrivelse: string;
}

export interface VpnTilkobling {
  id: string;
  brukernavn: string;
  ipAdresse: string;
  tilkobletSiden: string;
  dataOverført: string;
  status: 'tilkoblet' | 'frakoblet';
  lokasjon: string;
  enhet: string;
  protokoll: 'OpenVPN' | 'IKEv2' | 'WireGuard';
}

export interface SystemStatistikk {
  database: {
    totaleTabeller: number;
    totalePoster: number;
    gjennomsnittligResponstid: string;
    diskbruk: string;
  };
  firewall: {
    aktiveRegler: number;
    blokkerteForsøk: number;
    tillattTrafikk: number;
    sistOppdatert: string;
  };
  vpn: {
    aktiveTilkoblinger: number;
    totalBrukerkontoer: number;
    dataOverførtIdag: string;
    gjennomsnittligOppetid: string;
  };
}

class SystemAdminService {
  // Database metoder
  async hentDatabaseInfo(): Promise<DatabaseInfo[]> {
    try {
      const response = await api.get('/system/database/info');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av databaseinfo:', error);
      return this.hentMockDatabaseInfo();
    }
  }

  async utførDatabaseBackup(databaseId: string): Promise<void> {
    try {
      await api.post(`/system/database/${databaseId}/backup`);
    } catch (error) {
      console.error('Feil ved database backup:', error);
      throw error;
    }
  }

  async optimaliserDatabase(databaseId: string): Promise<void> {
    try {
      await api.post(`/system/database/${databaseId}/optimize`);
    } catch (error) {
      console.error('Feil ved database optimalisering:', error);
      throw error;
    }
  }

  // Firewall metoder
  async hentFirewallRegler(): Promise<FirewallRegel[]> {
    try {
      const response = await api.get('/system/firewall/rules');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av firewall-regler:', error);
      return this.hentMockFirewallRegler();
    }
  }

  async opprettFirewallRegel(regel: Omit<FirewallRegel, 'id' | 'opprettet' | 'sistEndret'>): Promise<FirewallRegel> {
    try {
      const response = await api.post('/system/firewall/rules', regel);
      return response.data;
    } catch (error) {
      console.error('Feil ved opprettelse av firewall-regel:', error);
      throw error;
    }
  }

  async oppdaterFirewallRegel(regelId: string, regel: Partial<FirewallRegel>): Promise<FirewallRegel> {
    try {
      const response = await api.put(`/system/firewall/rules/${regelId}`, regel);
      return response.data;
    } catch (error) {
      console.error('Feil ved oppdatering av firewall-regel:', error);
      throw error;
    }
  }

  async slettFirewallRegel(regelId: string): Promise<void> {
    try {
      await api.delete(`/system/firewall/rules/${regelId}`);
    } catch (error) {
      console.error('Feil ved sletting av firewall-regel:', error);
      throw error;
    }
  }

  // VPN metoder
  async hentVpnTilkoblinger(): Promise<VpnTilkobling[]> {
    try {
      const response = await api.get('/system/vpn/connections');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av VPN-tilkoblinger:', error);
      return this.hentMockVpnTilkoblinger();
    }
  }

  async frakobleVpnBruker(tilkoblingId: string): Promise<void> {
    try {
      await api.post(`/system/vpn/connections/${tilkoblingId}/disconnect`);
    } catch (error) {
      console.error('Feil ved frakobling av VPN-bruker:', error);
      throw error;
    }
  }

  async hentSystemStatistikk(): Promise<SystemStatistikk> {
    try {
      const response = await api.get('/system/statistics');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av systemstatistikk:', error);
      return this.hentMockSystemStatistikk();
    }
  }

  // Mock data metoder
  private hentMockDatabaseInfo(): DatabaseInfo[] {
    return [
      {
        id: 'db-1',
        navn: 'tms_production',
        type: 'PostgreSQL',
        versjon: '15.3',
        størrelse: '2.8 GB',
        status: 'aktiv',
        tilkoblinger: 12,
        maksimaleTilkoblinger: 100,
        lastBackup: '2024-06-15T02:00:00Z',
        nesteBackup: '2024-06-16T02:00:00Z',
        ytelse: {
          cpu: 15,
          minne: 45,
          diskbruk: 68
        }
      },
      {
        id: 'db-2',
        navn: 'tms_cache',
        type: 'Redis',
        versjon: '7.0.11',
        størrelse: '512 MB',
        status: 'aktiv',
        tilkoblinger: 8,
        maksimaleTilkoblinger: 50,
        lastBackup: '2024-06-15T01:00:00Z',
        nesteBackup: '2024-06-16T01:00:00Z',
        ytelse: {
          cpu: 8,
          minne: 25,
          diskbruk: 12
        }
      }
    ];
  }

  private hentMockFirewallRegler(): FirewallRegel[] {
    return [
      {
        id: 'fw-1',
        navn: 'Tillat HTTPS',
        type: 'innkommende',
        protokoll: 'TCP',
        port: '443',
        kildeIP: '0.0.0.0/0',
        destinasjonIP: '10.0.1.100',
        handling: 'tillat',
        status: 'aktiv',
        opprettet: '2024-01-15T10:00:00Z',
        sistEndret: '2024-01-15T10:00:00Z',
        beskrivelse: 'Tillater HTTPS-trafikk til webserver'
      },
      {
        id: 'fw-2',
        navn: 'Blokker SSH fra internett',
        type: 'innkommende',
        protokoll: 'TCP',
        port: '22',
        kildeIP: '0.0.0.0/0',
        destinasjonIP: '10.0.1.0/24',
        handling: 'blokker',
        status: 'aktiv',
        opprettet: '2024-01-15T10:05:00Z',
        sistEndret: '2024-03-20T14:30:00Z',
        beskrivelse: 'Blokkerer SSH-tilgang fra eksterne IP-adresser'
      },
      {
        id: 'fw-3',
        navn: 'Tillat database-tilgang',
        type: 'innkommende',
        protokoll: 'TCP',
        port: '5432',
        kildeIP: '10.0.1.0/24',
        destinasjonIP: '10.0.2.50',
        handling: 'tillat',
        status: 'aktiv',
        opprettet: '2024-02-01T09:15:00Z',
        sistEndret: '2024-02-01T09:15:00Z',
        beskrivelse: 'Tillater database-tilgang fra applikasjonsservere'
      }
    ];
  }

  private hentMockVpnTilkoblinger(): VpnTilkobling[] {
    return [
      {
        id: 'vpn-1',
        brukernavn: 'lars.hansen',
        ipAdresse: '10.8.0.2',
        tilkobletSiden: '2024-06-15T08:30:00Z',
        dataOverført: '245 MB',
        status: 'tilkoblet',
        lokasjon: 'Oslo, Norge',
        enhet: 'Windows 11',
        protokoll: 'OpenVPN'
      },
      {
        id: 'vpn-2',
        brukernavn: 'nina.olsen',
        ipAdresse: '10.8.0.3',
        tilkobletSiden: '2024-06-15T09:15:00Z',
        dataOverført: '89 MB',
        status: 'tilkoblet',
        lokasjon: 'Bergen, Norge',
        enhet: 'MacBook Pro',
        protokoll: 'IKEv2'
      },
      {
        id: 'vpn-3',
        brukernavn: 'erik.johansen',
        ipAdresse: '10.8.0.4',
        tilkobletSiden: '2024-06-15T07:45:00Z',
        dataOverført: '1.2 GB',
        status: 'tilkoblet',
        lokasjon: 'Trondheim, Norge',
        enhet: 'Ubuntu 22.04',
        protokoll: 'WireGuard'
      }
    ];
  }

  private hentMockSystemStatistikk(): SystemStatistikk {
    return {
      database: {
        totaleTabeller: 47,
        totalePoster: 125847,
        gjennomsnittligResponstid: '12ms',
        diskbruk: '2.8 GB'
      },
      firewall: {
        aktiveRegler: 23,
        blokkerteForsøk: 1247,
        tillattTrafikk: 98567,
        sistOppdatert: '2024-06-15T10:30:00Z'
      },
      vpn: {
        aktiveTilkoblinger: 8,
        totalBrukerkontoer: 25,
        dataOverførtIdag: '4.2 GB',
        gjennomsnittligOppetid: '99.8%'
      }
    };
  }
}

export const systemAdminService = new SystemAdminService(); 