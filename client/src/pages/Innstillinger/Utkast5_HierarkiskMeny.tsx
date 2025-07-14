import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSettings,
  FiUsers,
  FiShield,
  FiBarChart2,
  FiKey,
  FiDatabase,
  FiGlobe,
  FiTool,
  FiMail,
  FiClock,
  FiSidebar,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiActivity,
  FiZap,
  FiLayers
} from 'react-icons/fi';
import RoleBased from '../../components/auth/RoleBased';
import innstillingerService, { InnstillingerDashboardData } from '../../services/innstillinger.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<any>> = {
  FiSettings, FiUsers, FiShield, FiBarChart2, FiKey, FiDatabase,
  FiGlobe, FiTool, FiMail, FiClock, FiSidebar, FiAlertTriangle
};

interface HierarkiskKategori {
  id: string;
  navn: string;
  ikon: React.ComponentType<any>;
  farge: string;
  beskrivelse: string;
  underkategorier: {
    navn: string;
    innstillinger: string[];
  }[];
}

const hierarkiskeKategorier: HierarkiskKategori[] = [
  {
    id: 'organisasjon',
    navn: 'Organisasjon & Brukere',
    ikon: FiUsers,
    farge: 'blue',
    beskrivelse: 'Administrer organisatoriske strukturer og brukerrettigheter',
    underkategorier: [
      {
        navn: 'Brukeradministrasjon',
        innstillinger: ['Rolletilganger']
      },
      {
        navn: 'Organisasjonsinnstillinger',
        innstillinger: ['Bedriftsinnstillinger', 'Sidebar Administrasjon']
      }
    ]
  },
  {
    id: 'system',
    navn: 'Systemkonfigurasjon',
    ikon: FiSettings,
    farge: 'green',
    beskrivelse: 'Konfigurasjon av kjernesystemet og tekniske innstillinger',
    underkategorier: [
      {
        navn: 'Grunnleggende konfigurasjon',
        innstillinger: ['Systemkonfigurasjon']
      },
      {
        navn: 'Vedlikehold & Drift',
        innstillinger: ['Datavedlikehold', 'Vedlikeholdsmodus']
      }
    ]
  },
  {
    id: 'integrasjoner',
    navn: 'Integrasjoner & API',
    ikon: FiKey,
    farge: 'purple',
    beskrivelse: 'Eksterne tjenester, API-er og automatiseringsløsninger',
    underkategorier: [
      {
        navn: 'API & Eksterne tjenester',
        innstillinger: ['API & Integrasjoner', 'Integrasjonsinnstillinger']
      },
      {
        navn: 'Kommunikasjon',
        innstillinger: ['E-postinnstillinger']
      },
      {
        navn: 'Arbeidsflyt',
        innstillinger: ['Automatisering']
      }
    ]
  },
  {
    id: 'rapporter',
    navn: 'Rapporter & Analyse',
    ikon: FiBarChart2,
    farge: 'orange',
    beskrivelse: 'Rapportering, dataanalyse og referanseinformasjon',
    underkategorier: [
      {
        navn: 'Rapportgenerering',
        innstillinger: ['Rapporteringsinnstillinger']
      },
      {
        navn: 'Referansedata',
        innstillinger: ['Referanse-data']
      }
    ]
  },
  {
    id: 'sikkerhet',
    navn: 'Sikkerhet & Overvåking',
    ikon: FiShield,
    farge: 'red',
    beskrivelse: 'Sikkerhetskontroll, logging og tilgangsstyring',
    underkategorier: [
      {
        navn: 'Sikkerhetskontroll',
        innstillinger: ['Sikkerhetskontroll']
      },
      {
        navn: 'Logger & Overvåking',
        innstillinger: ['Sikkerhet & Logger']
      }
    ]
  }
];

const fargeMap = {
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-500',
    light: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-500',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  red: {
    bg: 'bg-red-500',
    light: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200'
  }
};

export default function Utkast5_HierarkiskMeny() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<InnstillingerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [utvidetKategorier, setUtvidetKategorier] = useState<string[]>(['organisasjon']);

  useEffect(() => {
    const hentDashboardData = async () => {
      try {
        const data = await innstillingerService.hentDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Feil ved henting av innstillinger dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    hentDashboardData();
  }, []);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const toggleKategori = (kategoriId: string) => {
    setUtvidetKategorier(prev => 
      prev.includes(kategoriId) 
        ? prev.filter(id => id !== kategoriId)
        : [...prev, kategoriId]
    );
  };

  const finnInnstilling = (innstillingNavn: string) => {
    if (!dashboardData) return null;
    return dashboardData.categories.find(category => category.title === innstillingNavn);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Kunne ikke laste innstillinger dashboard data</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FiLayers className="w-8 h-8 mr-3 text-blue-600" />
          Hierarkiske Systeminnstillinger
        </h1>
        <p className="text-gray-600">
          Navigér gjennom strukturerte kategorier og underkategorier av systeminnstillinger
        </p>
      </div>

      {/* Hurtig-statistikk */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {hierarkiskeKategorier.map((kategori) => {
          const antallInnstillinger = kategori.underkategorier.reduce(
            (sum, under) => sum + under.innstillinger.length, 0
          );
          const farge = fargeMap[kategori.farge as keyof typeof fargeMap];
          
          return (
            <div key={kategori.id} className={`${farge.light} ${farge.border} border rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <kategori.ikon className={`w-6 h-6 ${farge.text}`} />
                <div>
                  <div className={`text-2xl font-bold ${farge.text}`}>{antallInnstillinger}</div>
                  <div className="text-sm text-gray-600 capitalize">{kategori.navn}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hierarkisk Meny */}
      <div className="space-y-6">
        {hierarkiskeKategorier.map((kategori) => {
          const erUtvidet = utvidetKategorier.includes(kategori.id);
          const farge = fargeMap[kategori.farge as keyof typeof fargeMap];
          
          return (
            <div key={kategori.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Kategori Header */}
              <div 
                onClick={() => toggleKategori(kategori.id)}
                className={`${farge.bg} p-6 text-white cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <kategori.ikon className="w-7 h-7" />
                    <div>
                      <h2 className="text-xl font-bold">{kategori.navn}</h2>
                      <p className="text-white/80 text-sm mt-1">{kategori.beskrivelse}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                      {kategori.underkategorier.reduce((sum, under) => sum + under.innstillinger.length, 0)} innstillinger
                    </span>
                    {erUtvidet ? 
                      <FiChevronDown className="w-6 h-6" /> : 
                      <FiChevronRight className="w-6 h-6" />
                    }
                  </div>
                </div>
              </div>

              {/* Utvidet Innhold */}
              {erUtvidet && (
                <div className="p-6">
                  <div className="space-y-6">
                    {kategori.underkategorier.map((underkategori, index) => (
                      <div key={index} className="border-l-4 border-gray-200 pl-6">
                                                 {/* Underkategori Header */}
                         <div className="flex items-center space-x-3 mb-4">
                           <FiFolder className="w-5 h-5 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {underkategori.navn}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({underkategori.innstillinger.length})
                          </span>
                        </div>

                        {/* Innstillinger i underkategori */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {underkategori.innstillinger.map((innstillingNavn) => {
                            const innstilling = finnInnstilling(innstillingNavn);
                            if (!innstilling) return null;

                            const IconComponent = ikonMap[innstilling.icon];

                            return (
                              <RoleBased key={innstilling.title} roles={innstilling.roles || ['ADMIN']}>
                                <div
                                  onClick={() => handleCardClick(innstilling.route)}
                                  className="group border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${farge.light}`}>
                                      {IconComponent && <IconComponent className={`w-5 h-5 ${farge.text}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {innstilling.title}
                                      </h4>
                                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                        {innstilling.description}
                                      </p>
                                      {innstilling.roles && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {innstilling.roles.map((rolle: string) => (
                                            <span key={rolle} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                              {rolle}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                  </div>
                                </div>
                              </RoleBased>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Aktivitets-indikator */}
      <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start space-x-3">
          <FiActivity className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Hierarkisk Navigering
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🏗️ Struktur</h4>
                <ul className="space-y-1">
                  <li>• Hovedkategorier → Underkategorier → Innstillinger</li>
                  <li>• Logisk gruppering av relaterte funksjoner</li>
                  <li>• Visuell hierarki med farger og ikoner</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">⚡ Interaksjon</h4>
                <ul className="space-y-1">
                  <li>• Klikk på hovedkategorier for å utvide/skjule</li>
                  <li>• Direkte navigasjon til spesifikke innstillinger</li>
                  <li>• Hurtigstatistikk øverst for oversikt</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔐 Tilgang</h4>
                <ul className="space-y-1">
                  <li>• Rollbasert visning av tilgjengelige innstillinger</li>
                  <li>• Tydelig markering av adgangskrav</li>
                  <li>• Automatisk filtrering basert på brukerrettigheter</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 