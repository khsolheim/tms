import api from '../lib/api';

export interface SystemConfig {
  id?: number;
  bedriftId?: number;
  
  // Fakturainnstillinger
  dagerForfallFaktura: number;
  purregebyr: number;
  forsinkelsesrente: number;
  kontonummer: string;
  
  // Kontraktinnstillinger
  standardRente: number;
  standardEtableringsgebyr: number;
  standardTermingebyr: number;
  standardLopetid: number;
  
  // E-postinnstillinger
  sendKvitteringTilElev: boolean;
  sendKopiTilBedrift: boolean;
  standardAvsenderEpost: string;
  standardAvsenderNavn: string;
  
  // Varslingsinnstillinger
  varsleNyKontrakt: boolean;
  varsleStatusendring: boolean;
  varsleForfall: boolean;
  dagerForVarslingForfall: number;
  
  // Øvrige innstillinger
  visPersonnummerILister: boolean;
  tillateElevregistrering: boolean;
  kreverGodkjenningElevSoknad: boolean;
}

export interface ConfigField {
  key: keyof SystemConfig;
  label: string;
  type: 'text' | 'email' | 'number' | 'boolean' | 'select';
  description?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
    pattern?: string;
  };
}

export interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: ConfigField[];
}

class SystemkonfigurasjonService {
  async hentKonfigurasjon(): Promise<SystemConfig> {
    try {
      const response = await api.get('/system-config');
      return response.data;
    } catch (error) {
      // Returner standardkonfigurasjon hvis ingen finnes
      return this.getStandardKonfigurasjon();
    }
  }

  async lagreKonfigurasjon(config: SystemConfig): Promise<void> {
    const response = await api.put('/system-config', config);
    return response.data;
  }

  async hentKonfigSeksjoner(): Promise<ConfigSection[]> {
    try {
      const response = await api.get('/system-config/sections');
      return response.data;
    } catch (error) {
      // Returner standardseksjoner hvis API ikke er tilgjengelig
      return this.getStandardSeksjoner();
    }
  }

  private getStandardKonfigurasjon(): SystemConfig {
    return {
      dagerForfallFaktura: 14,
      purregebyr: 100,
      forsinkelsesrente: 8.5,
      kontonummer: '',
      standardRente: 5.0,
      standardEtableringsgebyr: 1900,
      standardTermingebyr: 50,
      standardLopetid: 24,
      sendKvitteringTilElev: true,
      sendKopiTilBedrift: true,
      standardAvsenderEpost: '',
      standardAvsenderNavn: '',
      varsleNyKontrakt: true,
      varsleStatusendring: true,
      varsleForfall: true,
      dagerForVarslingForfall: 7,
      visPersonnummerILister: false,
      tillateElevregistrering: true,
      kreverGodkjenningElevSoknad: true
    };
  }

  private getStandardSeksjoner(): ConfigSection[] {
    return [
      {
        id: 'faktura',
        title: 'Fakturainnstillinger',
        description: 'Konfigurer standardinnstillinger for fakturering',
        icon: 'FiCreditCard',
        fields: [
          {
            key: 'dagerForfallFaktura',
            label: 'Forfall (dager)',
            type: 'number',
            description: 'Antall dager til forfall fra fakturadato',
            validation: { min: 1, max: 90 }
          },
          {
            key: 'purregebyr',
            label: 'Purregebyr (kr)',
            type: 'number',
            description: 'Gebyr ved purring',
            validation: { min: 0, max: 1000 }
          },
          {
            key: 'forsinkelsesrente',
            label: 'Forsinkelsesrente (%)',
            type: 'number',
            description: 'Årlig rente ved forsinket betaling',
            validation: { min: 0, max: 30 }
          },
          {
            key: 'kontonummer',
            label: 'Kontonummer',
            type: 'text',
            description: 'Kontonummer for innbetalinger'
          }
        ]
      },
      {
        id: 'kontrakt',
        title: 'Kontraktinnstillinger',
        description: 'Standardverdier for nye kontrakter',
        icon: 'FiFileText',
        fields: [
          {
            key: 'standardRente',
            label: 'Standard rente (%)',
            type: 'number',
            description: 'Standard årlig rente for nye kontrakter',
            validation: { min: 0, max: 30 }
          },
          {
            key: 'standardEtableringsgebyr',
            label: 'Etableringsgebyr (kr)',
            type: 'number',
            description: 'Standard etableringsgebyr',
            validation: { min: 0, max: 10000 }
          },
          {
            key: 'standardTermingebyr',
            label: 'Termingebyr (kr)',
            type: 'number',
            description: 'Standard gebyr per termin',
            validation: { min: 0, max: 500 }
          },
          {
            key: 'standardLopetid',
            label: 'Standard løpetid (måneder)',
            type: 'number',
            description: 'Standard løpetid for nye kontrakter',
            validation: { min: 1, max: 60 }
          }
        ]
      },
      {
        id: 'epost',
        title: 'E-postinnstillinger',
        description: 'Konfigurer e-postvarsling og avsenderinformasjon',
        icon: 'FiMail',
        fields: [
          {
            key: 'sendKvitteringTilElev',
            label: 'Send kvittering til elev',
            type: 'boolean',
            description: 'Send automatisk kvittering til elev ved opprettelse'
          },
          {
            key: 'sendKopiTilBedrift',
            label: 'Send kopi til bedrift',
            type: 'boolean',
            description: 'Send kopi av all kommunikasjon til bedrift'
          },
          {
            key: 'standardAvsenderEpost',
            label: 'Avsender e-post',
            type: 'email',
            description: 'E-postadresse som brukes som avsender'
          },
          {
            key: 'standardAvsenderNavn',
            label: 'Avsender navn',
            type: 'text',
            description: 'Navnet som vises som avsender'
          }
        ]
      },
      {
        id: 'varsling',
        title: 'Varslingsinnstillinger',
        description: 'Konfigurer automatiske varsler og påminnelser',
        icon: 'FiBell',
        fields: [
          {
            key: 'varsleNyKontrakt',
            label: 'Varsle ved ny kontrakt',
            type: 'boolean',
            description: 'Send varsel når ny kontrakt opprettes'
          },
          {
            key: 'varsleStatusendring',
            label: 'Varsle ved statusendring',
            type: 'boolean',
            description: 'Send varsel når kontraktstatus endres'
          },
          {
            key: 'varsleForfall',
            label: 'Varsle før forfall',
            type: 'boolean',
            description: 'Send påminnelse før forfall'
          },
          {
            key: 'dagerForVarslingForfall',
            label: 'Dager før forfall',
            type: 'number',
            description: 'Antall dager før forfall det skal varsles',
            validation: { min: 1, max: 30 }
          }
        ]
      },
      {
        id: 'ovrige',
        title: 'Øvrige innstillinger',
        description: 'Andre systeminnstillinger',
        icon: 'FiSettings',
        fields: [
          {
            key: 'visPersonnummerILister',
            label: 'Vis personnummer i lister',
            type: 'boolean',
            description: 'Vis personnummer i oversiktslister'
          },
          {
            key: 'tillateElevregistrering',
            label: 'Tillat elevregistrering',
            type: 'boolean',
            description: 'La elever registrere seg selv'
          },
          {
            key: 'kreverGodkjenningElevSoknad',
            label: 'Krev godkjenning av elevsøknad',
            type: 'boolean',
            description: 'Elevsøknader må godkjennes før tilgang gis'
          }
        ]
      }
    ];
  }

  async validerKonfigurasjon(config: SystemConfig): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (config.dagerForfallFaktura < 1 || config.dagerForfallFaktura > 90) {
      errors.push('Forfall må være mellom 1 og 90 dager');
    }

    if (config.purregebyr < 0 || config.purregebyr > 1000) {
      errors.push('Purregebyr må være mellom 0 og 1000 kr');
    }

    if (config.forsinkelsesrente < 0 || config.forsinkelsesrente > 30) {
      errors.push('Forsinkelsesrente må være mellom 0 og 30%');
    }

    if (config.standardRente < 0 || config.standardRente > 30) {
      errors.push('Standard rente må være mellom 0 og 30%');
    }

    if (config.standardAvsenderEpost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.standardAvsenderEpost)) {
      errors.push('Ugyldig e-postadresse for avsender');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async eksporterKonfigurasjon(): Promise<Blob> {
    const config = await this.hentKonfigurasjon();
    const data = JSON.stringify(config, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  async importerKonfigurasjon(file: File): Promise<SystemConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          resolve(config);
        } catch (error) {
          reject(new Error('Ugyldig konfigurasjonsfil'));
        }
      };
      reader.onerror = () => reject(new Error('Kunne ikke lese fil'));
      reader.readAsText(file);
    });
  }
}

export default new SystemkonfigurasjonService(); 