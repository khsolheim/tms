import api from '../lib/api';

// Interfaces
export interface Timer {
  id: string;
  dato: string;
  starttid: string;
  sluttid: string;
  varighet: number; // minutter
  type: 'TEORI' | 'PRAKSIS' | 'SIMULATOR' | 'OPPKJØRING';
  status: 'PLANLAGT' | 'GJENNOMFØRT' | 'AVLYST' | 'IKKE_MØTT';
  instruktør: {
    id: string;
    navn: string;
  };
  kjøretøy?: {
    id: string;
    registreringsnummer: string;
    merke: string;
    modell: string;
  };
  tema?: string;
  beskrivelse?: string;
  kommentarer?: string;
  vurdering?: {
    score: number;
    kommentar: string;
    områder: string[];
  };
  kostnad: number;
  betalt: boolean;
  lokasjon?: string;
  værforhold?: string;
  trafikktetthet?: 'LAV' | 'MODERAT' | 'HØY';
}

export interface TimerStatistikk {
  totaleTimer: number;
  gjennomførteTimer: number;
  planlagteTimer: number;
  avlysteTimer: number;
  teoriTimer: number;
  praksisTimer: number;
  simulatorTimer: number;
  totalKostnad: number;
  betaltKostnad: number;
  gjennomsnittVurdering: number;
  fremgang: {
    uke: number;
    måned: number;
    total: number;
  };
}

export interface TimerFilters {
  type?: string;
  status?: string;
  instruktør?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class TimerService {
  // Hent timer for en elev
  async hentElevTimer(elevId: string, filters?: TimerFilters): Promise<Timer[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.instruktør) params.append('instruktør', filters.instruktør);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/elever/${elevId}/timer?${params.toString()}`);
    return response.data;
  }

  // Hent timer-statistikk for en elev
  async hentTimerStatistikk(elevId: string): Promise<TimerStatistikk> {
    const response = await api.get(`/elever/${elevId}/timer/statistikk`);
    return response.data;
  }

  // Book ny time
  async bookTime(elevId: string, timerData: Partial<Timer>): Promise<Timer> {
    const response = await api.post(`/elever/${elevId}/timer`, timerData);
    return response.data;
  }

  // Oppdater time
  async oppdaterTime(timerId: string, timerData: Partial<Timer>): Promise<Timer> {
    const response = await api.put(`/timer/${timerId}`, timerData);
    return response.data;
  }

  // Avlys time
  async avlysTime(timerId: string, årsak: string): Promise<void> {
    await api.put(`/timer/${timerId}/avlys`, { årsak });
  }

  // Marker time som gjennomført
  async markerGjennomført(timerId: string, vurdering?: Timer['vurdering']): Promise<void> {
    await api.put(`/timer/${timerId}/gjennomført`, { vurdering });
  }

  // Mock data for utvikling
  async hentMockData(): Promise<{
    timer: Timer[];
    statistikk: TimerStatistikk;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const timer: Timer[] = [
      {
        id: '1',
        dato: '2025-06-15',
        starttid: '09:00',
        sluttid: '10:30',
        varighet: 90,
        type: 'PRAKSIS',
        status: 'GJENNOMFØRT',
        instruktør: {
          id: '1',
          navn: 'Ole Hansen'
        },
        kjøretøy: {
          id: '1',
          registreringsnummer: 'AB12345',
          merke: 'Toyota',
          modell: 'Corolla'
        },
        tema: 'Grunnleggende kjøring',
        beskrivelse: 'Første praktiske kjøretime - grunnleggende kontroller og kjøring',
        vurdering: {
          score: 7,
          kommentar: 'God fremgang for første time. Trenger å jobbe med speilbruk.',
          områder: ['Speilbruk', 'Signalgiving', 'Hastighetsregulering']
        },
        kostnad: 650,
        betalt: true,
        lokasjon: 'Kjøreskole Nord - Øvingsplass',
        værforhold: 'Overskyet, tørr vei',
        trafikktetthet: 'LAV'
      },
      {
        id: '2',
        dato: '2025-06-17',
        starttid: '14:00',
        sluttid: '15:30',
        varighet: 90,
        type: 'PRAKSIS',
        status: 'GJENNOMFØRT',
        instruktør: {
          id: '1',
          navn: 'Ole Hansen'
        },
        kjøretøy: {
          id: '1',
          registreringsnummer: 'AB12345',
          merke: 'Toyota',
          modell: 'Corolla'
        },
        tema: 'Trafikk og svinging',
        beskrivelse: 'Kjøring i trafikk, høyre- og venstresving',
        vurdering: {
          score: 8,
          kommentar: 'Bra fremgang! Bedre kontroll på svingene.',
          områder: ['Svinging', 'Trafikktilpasning', 'Observasjon']
        },
        kostnad: 650,
        betalt: true,
        lokasjon: 'Sentrum - Øvingsrute 1',
        værforhold: 'Solfylt, tørr vei',
        trafikktetthet: 'MODERAT'
      },
      {
        id: '3',
        dato: '2025-06-20',
        starttid: '10:00',
        sluttid: '11:00',
        varighet: 60,
        type: 'TEORI',
        status: 'GJENNOMFØRT',
        instruktør: {
          id: '2',
          navn: 'Anne Olsen'
        },
        tema: 'Trafikkregler og skiltlære',
        beskrivelse: 'Gjennomgang av viktige trafikkregler og skilt',
        vurdering: {
          score: 9,
          kommentar: 'Utmerket forståelse av teorien!',
          områder: ['Trafikkregler', 'Skiltlære', 'Forkjørsrett']
        },
        kostnad: 450,
        betalt: true,
        lokasjon: 'Kjøreskole Nord - Teorirom'
      },
      {
        id: '4',
        dato: '2025-06-22',
        starttid: '13:00',
        sluttid: '14:30',
        varighet: 90,
        type: 'PRAKSIS',
        status: 'PLANLAGT',
        instruktør: {
          id: '1',
          navn: 'Ole Hansen'
        },
        kjøretøy: {
          id: '1',
          registreringsnummer: 'AB12345',
          merke: 'Toyota',
          modell: 'Corolla'
        },
        tema: 'Parkering og rygging',
        beskrivelse: 'Øving på ulike parkeringsmanøvre',
        kostnad: 650,
        betalt: false,
        lokasjon: 'Kjøreskole Nord - Øvingsplass'
      },
      {
        id: '5',
        dato: '2025-06-25',
        starttid: '15:00',
        sluttid: '16:30',
        varighet: 90,
        type: 'SIMULATOR',
        status: 'PLANLAGT',
        instruktør: {
          id: '3',
          navn: 'Lars Eriksen'
        },
        tema: 'Vanskelige kjøreforhold',
        beskrivelse: 'Simulering av kjøring i regn og glatte forhold',
        kostnad: 550,
        betalt: false,
        lokasjon: 'Kjøreskole Nord - Simulator'
      },
      {
        id: '6',
        dato: '2025-06-18',
        starttid: '11:00',
        sluttid: '12:30',
        varighet: 90,
        type: 'PRAKSIS',
        status: 'AVLYST',
        instruktør: {
          id: '1',
          navn: 'Ole Hansen'
        },
        tema: 'Motorveikjøring',
        beskrivelse: 'Kjøring på motorvei og høyere hastigheter',
        kommentarer: 'Avlyst pga. sykdom hos elev',
        kostnad: 650,
        betalt: false,
        lokasjon: 'E6 - Motorveistrekning'
      }
    ];

    const statistikk: TimerStatistikk = {
      totaleTimer: 6,
      gjennomførteTimer: 3,
      planlagteTimer: 2,
      avlysteTimer: 1,
      teoriTimer: 1,
      praksisTimer: 4,
      simulatorTimer: 1,
      totalKostnad: 3600,
      betaltKostnad: 2400,
      gjennomsnittVurdering: 8.0,
      fremgang: {
        uke: 2,
        måned: 6,
        total: 3
      }
    };

    return { timer, statistikk };
  }
}

export const timerService = new TimerService();
export default timerService; 