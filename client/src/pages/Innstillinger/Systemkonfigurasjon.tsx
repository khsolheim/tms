import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  FiSave, 
  FiSettings, 
  FiMail, 
  FiCreditCard,
  FiBell,
  FiFileText,
  FiRotateCcw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { log } from '../../utils/logger';
import RoleBased from '../../components/auth/RoleBased';
import { FormSkeleton, LoadingButton } from '../../components/ui/LoadingStates';
import systemkonfigurasjonService, { SystemConfig, ConfigSection, ConfigField } from '../../services/systemkonfigurasjon.service';

// Ikon-mapping for å konvertere string til React-komponenter
const ikonMap: { [key: string]: React.ComponentType<any> } = {
  FiCreditCard,
  FiFileText,
  FiMail,
  FiBell,
  FiSettings
};



const configSections: ConfigSection[] = [
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

const defaultConfig: SystemConfig = {
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

export default function Systemkonfigurasjon() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    hentKonfigurasjon();
  }, []);

  const hentKonfigurasjon = async () => {
    setLoading(true);
    try {
      const response = await api.get('/systemconfig');
      setConfig(response.data ?? defaultConfig);
    } catch (error: any) {
      log.apiError('/systemconfig GET', error);
      toast.error(error.response?.data?.error || 'Kunne ikke hente konfigurasjon');
    } finally {
      setLoading(false);
    }
  };

  const lagreKonfigurasjon = async () => {
    setSaving(true);

    try {
      const response = await api.put('/systemconfig', config);
      setConfig(response.data);
      setChangedFields(new Set());
      toast.success('Konfigurasjon lagret!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Kunne ikke lagre konfigurasjon');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setChangedFields(prev => new Set(prev).add(key));
  };

  const renderField = (field: ConfigField) => {
    const value = config[field.key];
    const hasChanged = changedFields.has(field.key);

    switch (field.type) {
      case 'boolean':
        return (
          <button
            onClick={() => handleFieldChange(field.key, !value)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              value ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => {
              const val = field.validation?.min !== undefined && field.validation?.min === 0 
                ? parseFloat(e.target.value) 
                : parseInt(e.target.value);
              handleFieldChange(field.key, val);
            }}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.key === 'forsinkelsesrente' || field.key === 'standardRente' ? '0.1' : '1'}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              hasChanged ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
            }`}
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={value as string}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              hasChanged ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="px-2 py-1 max-w-6xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-80 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-96"></div>
        </div>
        <FormSkeleton />
      </div>
    );
  }

  return (
    <RoleBased roles={['ADMIN', 'HOVEDBRUKER']}>
      <div className="px-2 py-1 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Systemkonfigurasjon</h1>
          <p className="text-gray-600">
            Administrer systemets grunnleggende innstillinger og standardverdier
          </p>
        </div>

        <div className="cards-spacing-vertical">
          {configSections.map(section => (
            <div key={section.id} className="bg-white rounded-lg shadow">
              <div className="px-2 py-1 border-b border-gray-200">
                <div className="flex items-center">
                  {ikonMap[section.icon] && React.createElement(ikonMap[section.icon], { className: "w-5 h-5 text-gray-600 mr-3" })}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="px-2 py-1 cards-spacing-vertical">
                {section.fields.map(field => (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      {changedFields.has(field.key) && (
                        <span className="text-xs text-orange-600">Endret</span>
                      )}
                    </div>
                    
                    {renderField(field)}
                    
                    {field.description && (
                      <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end space-x-4">
          <button
            onClick={() => {
              setConfig(defaultConfig);
              setChangedFields(new Set());
            }}
            className="flex items-center px-2 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <FiRotateCcw className="w-4 h-4 mr-2" />
            Tilbakestill til standard
          </button>

          <LoadingButton
            loading={saving}
            onClick={lagreKonfigurasjon}
            disabled={changedFields.size === 0}
            className={`flex items-center px-6 py-2 rounded-md transition-colors ${
              changedFields.size === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FiSave className="w-4 h-4 mr-2" />
            {saving ? 'Lagrer...' : 'Lagre konfigurasjon'}
          </LoadingButton>
        </div>
      </div>
    </RoleBased>
  );
} 