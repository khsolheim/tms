import api from '../lib/api';

export interface Melding {
  id: string;
  elevId: string;
  elevNavn: string;
  emne: string;
  innhold: string;
  dato: string;
  status: 'ulest' | 'lest' | 'besvart';
  type: 'melding' | 'spørsmål' | 'klage' | 'forespørsel';
  prioritet: 'lav' | 'normal' | 'høy';
  vedlegg?: string[];
  svar?: {
    innhold: string;
    dato: string;
    ansatt: string;
  };
}

export interface KommunikasjonsStatistikk {
  totaltMeldinger: number;
  uleste: number;
  besvarte: number;
  gjennomsnittligSvartid: string;
  aktivitetsNivå: 'lav' | 'normal' | 'høy';
}

export interface KommunikasjonsFilter {
  status?: string;
  type?: string;
  prioritet?: string;
  datoFra?: string;
  datoTil?: string;
  elevId?: string;
}

class ElevKommunikasjonsService {
  async hentMeldinger(filter?: KommunikasjonsFilter): Promise<Melding[]> {
    try {
      const response = await api.get('/elever/kommunikasjon/meldinger', { params: filter });
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av meldinger:', error);
      return this.hentMockMeldinger();
    }
  }

  async hentMelding(meldingId: string): Promise<Melding | null> {
    try {
      const response = await api.get(`/elever/kommunikasjon/meldinger/${meldingId}`);
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av melding:', error);
      return this.hentMockMeldinger().find(m => m.id === meldingId) || null;
    }
  }

  async sendSvar(meldingId: string, svar: string): Promise<void> {
    try {
      await api.post(`/elever/kommunikasjon/meldinger/${meldingId}/svar`, { svar });
    } catch (error) {
      console.error('Feil ved sending av svar:', error);
      throw error;
    }
  }

  async markerSomLest(meldingId: string): Promise<void> {
    try {
      await api.patch(`/elever/kommunikasjon/meldinger/${meldingId}/lest`);
    } catch (error) {
      console.error('Feil ved markering som lest:', error);
      throw error;
    }
  }

  async hentKommunikasjonsStatistikk(): Promise<KommunikasjonsStatistikk> {
    try {
      const response = await api.get('/elever/kommunikasjon/statistikk');
      return response.data;
    } catch (error) {
      console.error('Feil ved henting av kommunikasjonsstatistikk:', error);
      return this.hentMockKommunikasjonsStatistikk();
    }
  }

  async opprettMelding(melding: Omit<Melding, 'id' | 'dato' | 'status'>): Promise<Melding> {
    try {
      const response = await api.post('/elever/kommunikasjon/meldinger', melding);
      return response.data;
    } catch (error) {
      console.error('Feil ved opprettelse av melding:', error);
      throw error;
    }
  }

  private hentMockMeldinger(): Melding[] {
    return [
      {
        id: 'msg-1',
        elevId: 'elev-1',
        elevNavn: 'Ola Nordmann',
        emne: 'Spørsmål om teoriprøve',
        innhold: 'Hei! Jeg lurer på når jeg kan ta teoriprøven. Har fullført alle teorileksjonene og føler meg klar.',
        dato: '2024-06-15T10:30:00Z',
        status: 'ulest',
        type: 'spørsmål',
        prioritet: 'normal'
      },
      {
        id: 'msg-2',
        elevId: 'elev-2',
        elevNavn: 'Kari Hansen',
        emne: 'Endring av kjøretime',
        innhold: 'Kan jeg flytte kjøretimen fra fredag til mandag? Har fått jobb som kolliderer med tiden.',
        dato: '2024-06-14T14:15:00Z',
        status: 'besvart',
        type: 'forespørsel',
        prioritet: 'normal',
        svar: {
          innhold: 'Hei Kari! Ja, det går bra. Har flyttet deg til mandag kl 14:00. Mvh instruktør.',
          dato: '2024-06-14T15:30:00Z',
          ansatt: 'Lars Andersen'
        }
      },
      {
        id: 'msg-3',
        elevId: 'elev-3',
        elevNavn: 'Erik Johansen',
        emne: 'Klage på instruktør',
        innhold: 'Jeg er ikke fornøyd med måten instruktøren snakket til meg på under siste kjøretime. Dette var uprofesjonelt.',
        dato: '2024-06-13T16:45:00Z',
        status: 'lest',
        type: 'klage',
        prioritet: 'høy'
      },
      {
        id: 'msg-4',
        elevId: 'elev-4',
        elevNavn: 'Maria Olsen',
        emne: 'Takk for god opplæring',
        innhold: 'Vil bare takke for fantastisk opplæring! Besto førerprøven på første forsøk takket være dere.',
        dato: '2024-06-12T09:20:00Z',
        status: 'besvart',
        type: 'melding',
        prioritet: 'lav',
        svar: {
          innhold: 'Tusen takk for tilbakemeldingen, Maria! Gratulerer med bestått førerprøve!',
          dato: '2024-06-12T10:15:00Z',
          ansatt: 'Nina Pettersen'
        }
      },
      {
        id: 'msg-5',
        elevId: 'elev-5',
        elevNavn: 'Thomas Berg',
        emne: 'Problemer med online teori',
        innhold: 'Får ikke tilgang til teorikursene online. Har prøvd å logge inn flere ganger uten hell.',
        dato: '2024-06-11T13:10:00Z',
        status: 'ulest',
        type: 'spørsmål',
        prioritet: 'høy'
      }
    ];
  }

  private hentMockKommunikasjonsStatistikk(): KommunikasjonsStatistikk {
    return {
      totaltMeldinger: 127,
      uleste: 8,
      besvarte: 95,
      gjennomsnittligSvartid: '2.5 timer',
      aktivitetsNivå: 'normal'
    };
  }
}

export const elevKommunikasjonsService = new ElevKommunikasjonsService(); 