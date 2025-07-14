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
  FiArrowRight,
  FiStar,
  FiGrid,
  FiList,
  FiInfo
} from 'react-icons/fi';
import RoleBased from '../../components/auth/RoleBased';
import innstillingerService, { InnstillingerDashboardData } from '../../services/innstillinger.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<any>> = {
  FiSettings, FiUsers, FiShield, FiBarChart2, FiKey, FiDatabase,
  FiGlobe, FiTool, FiMail, FiClock, FiSidebar, FiAlertTriangle
};

// Kategorier med utvidet informasjon
const kategorierInfo = {
  organisasjon: {
    farge: 'bg-blue-500',
    beskrivelse: 'Administrer brukere, roller og organisatoriske innstillinger'
  },
  system: {
    farge: 'bg-green-500',
    beskrivelse: 'Konfigurasjon av systemet og tekniske innstillinger'
  },
  integrasjoner: {
    farge: 'bg-purple-500',
    beskrivelse: 'API-er, e-post og eksterne tjeneste-integrasjoner'
  },
  rapporter: {
    farge: 'bg-orange-500',
    beskrivelse: 'Rapportering, analysering og referansedata'
  },
  sikkerhet: {
    farge: 'bg-red-500',
    beskrivelse: 'Sikkerhet, logger og tilgangskontroll'
  },
  annet: {
    farge: 'bg-gray-500',
    beskrivelse: 'Øvrige systeminnstillinger og konfigurasjon'
  }
};

export default function Utkast4_KortBeskrivelse() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<InnstillingerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visningsType, setVisningsType] = useState<'grid' | 'liste'>('grid');

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

  const kategoriserKort = (kort: any) => {
    const kategorier: Record<string, string[]> = {
      organisasjon: ['Rolletilganger', 'Bedriftsinnstillinger', 'Sidebar Administrasjon'],
      system: ['Systemkonfigurasjon', 'Datavedlikehold', 'Vedlikeholdsmodus'],
      integrasjoner: ['API & Integrasjoner', 'E-postinnstillinger', 'Automatisering', 'Integrasjonsinnstillinger'],
      rapporter: ['Rapporteringsinnstillinger', 'Referanse-data'],
      sikkerhet: ['Sikkerhetskontroll', 'Sikkerhet & Logger']
    };

    for (const [kategori, titler] of Object.entries(kategorier)) {
      if (titler.includes(kort.title)) {
        return kategori;
      }
    }
    return 'annet';
  };

  const grupperKortEtterKategori = (kort: any[]) => {
    const gruppert: Record<string, any[]> = {};
    
    kort.forEach(k => {
      const kategori = kategoriserKort(k);
      if (!gruppert[kategori]) {
        gruppert[kategori] = [];
      }
      gruppert[kategori].push(k);
    });

    return gruppert;
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

  const { categories: settingsCategories } = dashboardData;
  const gruppertKort = grupperKortEtterKategori(settingsCategories);

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Systeminnstillinger</h1>
            <p className="text-gray-600">
              Administrer og konfigurer alle aspekter av systemet
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVisningsType('grid')}
              className={`p-2 rounded-lg ${visningsType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVisningsType('liste')}
              className={`p-2 rounded-lg ${visningsType === 'liste' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistikk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{settingsCategories.length}</div>
            <div className="text-sm text-gray-600">Totale Innstillinger</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{Object.keys(gruppertKort).length}</div>
            <div className="text-sm text-gray-600">Kategorier</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {settingsCategories.filter(k => k.roles?.includes('ADMIN')).length}
            </div>
            <div className="text-sm text-gray-600">Admin-innstillinger</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {settingsCategories.filter(k => k.roles?.includes('HOVEDBRUKER')).length}
            </div>
            <div className="text-sm text-gray-600">Bruker-innstillinger</div>
          </div>
        </div>
      </div>

      {/* Kategoriserte Innstillinger */}
      <div className="space-y-8">
        {Object.entries(gruppertKort).map(([kategori, kort]) => {
          const kategoriInfo = kategorierInfo[kategori as keyof typeof kategorierInfo];
          
          return (
            <div key={kategori} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Kategori Header */}
              <div className={`${kategoriInfo.farge} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold capitalize mb-1">{kategori}</h2>
                    <p className="text-white/80 text-sm">{kategoriInfo.beskrivelse}</p>
                  </div>
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                    {kort.length} innstillinger
                  </div>
                </div>
              </div>

              {/* Innstillinger Grid/Liste */}
              {visningsType === 'grid' ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kort.map((category) => {
                    const IconComponent = ikonMap[category.icon];
                    
                    return (
                      <RoleBased key={category.title} roles={category.roles || ['ADMIN']}>
                        <div
                          onClick={() => handleCardClick(category.route)}
                          className="group p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${kategoriInfo.farge} bg-opacity-10`}>
                              {IconComponent && <IconComponent className={`w-6 h-6 text-gray-700`} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {category.title}
                                </h3>
                                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                {category.description}
                              </p>
                              {category.roles && (
                                <div className="flex flex-wrap gap-1">
                                  {category.roles.map((rolle: string) => (
                                    <span key={rolle} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      {rolle}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </RoleBased>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {kort.map((category) => {
                    const IconComponent = ikonMap[category.icon];
                    
                    return (
                      <RoleBased key={category.title} roles={category.roles || ['ADMIN']}>
                        <div
                          onClick={() => handleCardClick(category.route)}
                          className="group p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${kategoriInfo.farge} bg-opacity-10`}>
                              {IconComponent && <IconComponent className={`w-6 h-6 text-gray-700`} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                    {category.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {category.description}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {category.roles && (
                                    <div className="flex space-x-1">
                                      {category.roles.map((rolle: string) => (
                                        <span key={rolle} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                          {rolle}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </RoleBased>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hjelpeseksjon */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <FiInfo className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Om Systeminnstillinger
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
              <div>
                <h4 className="font-medium mb-2">Navigering</h4>
                <ul className="space-y-1">
                  <li>• Innstillinger er organisert i kategorier for enkel navigering</li>
                  <li>• Bytt mellom grid- og listevisning med knappene øverst</li>
                  <li>• Klikk på en innstilling for å åpne konfigurasjonssiden</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tilgangskontroll</h4>
                <ul className="space-y-1">
                  <li>• Kun relevante innstillinger vises basert på din rolle</li>
                  <li>• Admin-brukere ser alle tilgjengelige innstillinger</li>
                  <li>• Rollekrav vises på hver innstilling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 