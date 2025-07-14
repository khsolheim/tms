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
  FiChevronRight,
  FiHome,
  FiChevronLeft
} from 'react-icons/fi';
import RoleBased from '../../components/auth/RoleBased';
import innstillingerService, { InnstillingerDashboardData } from '../../services/innstillinger.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<any>> = {
  FiSettings, FiUsers, FiShield, FiBarChart2, FiKey, FiDatabase,
  FiGlobe, FiTool, FiMail, FiClock, FiSidebar, FiAlertTriangle,
  FiHome
};

interface NavigasjonsGruppe {
  id: string;
  navn: string;
  ikon: React.ComponentType<any>;
  undergrupper: string[];
}

const navigasjonsGrupper: NavigasjonsGruppe[] = [
  {
    id: 'oversikt',
    navn: 'Oversikt',
    ikon: FiHome,
    undergrupper: []
  },
  {
    id: 'organisasjon',
    navn: 'Organisasjon',
    ikon: FiUsers,
    undergrupper: ['Rolletilganger', 'Bedriftsinnstillinger', 'Sidebar Administrasjon']
  },
  {
    id: 'system',
    navn: 'System',
    ikon: FiSettings,
    undergrupper: ['Systemkonfigurasjon', 'Datavedlikehold', 'Vedlikeholdsmodus']
  },
  {
    id: 'integrasjoner',
    navn: 'Integrasjoner',
    ikon: FiKey,
    undergrupper: ['API & Integrasjoner', 'E-postinnstillinger', 'Automatisering', 'Integrasjonsinnstillinger']
  },
  {
    id: 'rapporter',
    navn: 'Rapporter',
    ikon: FiBarChart2,
    undergrupper: ['Rapporteringsinnstillinger', 'Referanse-data']
  },
  {
    id: 'sikkerhet',
    navn: 'Sikkerhet',
    ikon: FiShield,
    undergrupper: ['Sikkerhetskontroll', 'Sikkerhet & Logger']
  }
];

export default function Utkast3_SidebarNavigasjon() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<InnstillingerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aktivGruppe, setAktivGruppe] = useState('oversikt');
  const [sidebarApen, setSidebarApen] = useState(true);
  const [undergruppeTilstand, setUndergruppeTilstand] = useState<Record<string, boolean>>({});

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

  // Tastatursnarveier for meny-kollapsing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B for å toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarApen(prev => !prev);
      }
      // Escape for å lukke sidebar
      if (event.key === 'Escape' && sidebarApen) {
        setSidebarApen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarApen]);

  // Responsive behandling for små skjermer
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarApen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Kjør ved første lasting
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
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
    return 'system';
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
  const filtrertKort = aktivGruppe === 'oversikt' 
    ? settingsCategories 
    : settingsCategories.filter(kort => kategoriserKort(kort) === aktivGruppe);

      const toggleUndergruppe = (gruppeId: string) => {
      setUndergruppeTilstand(prev => ({
        ...prev,
        [gruppeId]: !prev[gruppeId]
      }));
    };

    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile overlay */}
        {sidebarApen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarApen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${sidebarApen ? 'w-64' : 'w-16'} 
          bg-white border-r border-gray-200 transition-all duration-300 shadow-sm
          ${sidebarApen ? 'fixed md:relative z-50 md:z-auto' : 'relative'}
          h-screen
        `}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarApen && (
              <div className="flex items-center space-x-2">
                <FiSidebar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Innstillinger</h2>
              </div>
            )}
            <button
              onClick={() => setSidebarApen(!sidebarApen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 relative group transform hover:scale-105 active:scale-95"
              title={sidebarApen ? "Skjul meny (Ctrl+B eller ←)" : "Vis meny (Ctrl+B eller →)"}
            >
              {sidebarApen ? (
                <FiChevronLeft className="w-5 h-5 transition-transform duration-200" />
              ) : (
                <FiChevronRight className="w-5 h-5 transition-transform duration-200" />
              )}
              
              {/* Hover indikator med pulserende effekt */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:animate-pulse"></div>
              
              {/* Tastatursnarveismerknad */}
              {!sidebarApen && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Ctrl+B for hurtigtilgang
                </div>
              )}
            </button>
          </div>

                  <nav className="p-4 space-y-1">
            {navigasjonsGrupper.map((gruppe) => {
              const erAktiv = aktivGruppe === gruppe.id;
              const harUndergrupper = gruppe.undergrupper.length > 0;
              const undergrupperVises = undergruppeTilstand[gruppe.id] || erAktiv;
              
              return (
                <div key={gruppe.id}>
                  <div className="flex">
                    <button
                      onClick={() => setAktivGruppe(gruppe.id)}
                      className={`
                        flex-1 flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200
                        ${erAktiv 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${!sidebarApen ? 'justify-center' : ''}
                      `}
                      title={!sidebarApen ? gruppe.navn : undefined}
                    >
                      <gruppe.ikon className="w-5 h-5 flex-shrink-0" />
                      {sidebarApen && (
                        <span className="ml-3 flex-1">{gruppe.navn}</span>
                      )}
                    </button>
                    
                    {/* Toggle knapp for undergrupper */}
                    {sidebarApen && harUndergrupper && (
                      <button
                        onClick={() => toggleUndergruppe(gruppe.id)}
                        className={`
                          ml-1 px-2 py-2 rounded-lg transition-all duration-200
                          ${erAktiv 
                            ? 'text-blue-700 hover:bg-blue-100' 
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }
                        `}
                        title={undergrupperVises ? "Skjul undergrupper" : "Vis undergrupper"}
                      >
                        <FiChevronRight 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            undergrupperVises ? 'rotate-90' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>

                                  {/* Undergrupper med animasjon */}
                  {sidebarApen && harUndergrupper && (
                    <div 
                      className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${undergrupperVises ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                      `}
                    >
                      <div className="ml-8 mt-2 pb-2 space-y-1">
                        {gruppe.undergrupper.map((undergruppe) => {
                          const kort = settingsCategories.find(k => k.title === undergruppe);
                          if (!kort) return null;
                          
                          return (
                            <button
                              key={undergruppe}
                              onClick={() => handleCardClick(kort.route)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-150 flex items-center group"
                            >
                              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3 group-hover:bg-gray-400 transition-colors duration-150"></div>
                              {undergruppe}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Hovedinnhold */}
      <div className={`
        flex-1 p-6 transition-all duration-300
        ${sidebarApen ? 'md:ml-0 ml-0' : 'ml-0'}
      `}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Innstillinger</span>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {navigasjonsGrupper.find(g => g.id === aktivGruppe)?.navn}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {aktivGruppe === 'oversikt' ? 'Alle Innstillinger' : navigasjonsGrupper.find(g => g.id === aktivGruppe)?.navn}
          </h1>
          <p className="text-gray-600">
            {aktivGruppe === 'oversikt' 
              ? 'En oversikt over alle tilgjengelige systeminnstillinger'
              : `Administrer ${navigasjonsGrupper.find(g => g.id === aktivGruppe)?.navn.toLowerCase()}-relaterte innstillinger`
            }
          </p>
        </div>

        {/* Innstillinger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrertKort.map((category) => {
            const IconComponent = ikonMap[category.icon];
            
            return (
              <RoleBased key={category.title} roles={category.roles || ['ADMIN']}>
                <div
                  onClick={() => handleCardClick(category.route)}
                  className={`
                    bg-white rounded-lg border p-6 cursor-pointer transition-all duration-200
                    hover:shadow-md hover:border-blue-300
                    ${category.color}
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`
                      p-3 rounded-lg 
                      ${category.color.replace('text-', 'bg-').replace('border-', '').replace('bg-', 'bg-')}
                    `}>
                      {IconComponent && <IconComponent className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {category.description}
                      </p>
                      {category.roles && (
                        <div className="mt-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {category.roles.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </RoleBased>
            );
          })}
        </div>

        {/* Ingen innstillinger for kategori */}
        {filtrertKort.length === 0 && aktivGruppe !== 'oversikt' && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {React.createElement(navigasjonsGrupper.find(g => g.id === aktivGruppe)?.ikon || FiSettings, { className: "w-12 h-12 mx-auto" })}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen innstillinger i denne kategorien</h3>
            <p className="text-gray-500">
              Det er for øyeblikket ingen innstillinger tilgjengelig i denne kategorien.
            </p>
          </div>
        )}

        {/* Hjelpeseksjon */}
        <div className="mt-12 bg-white rounded-lg border p-6">
          <div className="flex items-start space-x-3">
            <FiSettings className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Navigasjonstips
              </h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Bruk sidebar-menyen til venstre for å navigere mellom kategorier</li>
                <li>• Klikk på kategorier med undergrupper for å se hurtiglenker</li>
                <li>• <strong>Sidebaren kan skjules/vises</strong> ved å klikke på meny-ikonet øverst til høyre</li>
                <li>• <strong>Tastatursnarveier:</strong> Ctrl+B (eller Cmd+B på Mac) for å toggle meny, Escape for å lukke</li>
                <li>• Hold musepekeren over ikoner når menyen er skjult for å se tooltips</li>
                <li>• Menyen kollapseres automatisk på små skjermer for optimal mobilopplevelse</li>
                <li>• Oversikt viser alle tilgjengelige innstillinger på én gang</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 