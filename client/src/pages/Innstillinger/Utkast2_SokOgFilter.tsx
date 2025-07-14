import React, { useState, useEffect, useMemo } from 'react';
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
  FiSearch,
  FiFilter,
  FiStar,
  FiCpu,
  FiX
} from 'react-icons/fi';
import RoleBased from '../../components/auth/RoleBased';
import innstillingerService, { InnstillingerDashboardData } from '../../services/innstillinger.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<any>> = {
  FiSettings, FiUsers, FiShield, FiBarChart2, FiKey, FiDatabase,
  FiGlobe, FiTool, FiMail, FiClock, FiSidebar, FiAlertTriangle,
  FiSearch, FiFilter, FiStar, FiCpu
};

const rolleFiltre = [
  { label: 'Alle', value: 'alle' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Hovedbruker', value: 'HOVEDBRUKER' },
  { label: 'Bruker', value: 'BRUKER' }
];

const hurtigTilgang = [
  { navn: 'Brukerroller', route: '/innstillinger/admin/rolletilganger', ikon: FiUsers },
  { navn: 'System', route: '/innstillinger/system', ikon: FiSettings },
  { navn: 'Sikkerhet', route: '/innstillinger/sikkerhet', ikon: FiShield },
  { navn: 'API-nøkler', route: '/innstillinger/integrasjoner', ikon: FiKey }
];

export default function Utkast2_SokOgFilter() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<InnstillingerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sokeTerm, setSokeTerm] = useState('');
  const [aktivRolleFilter, setAktivRolleFilter] = useState('alle');
  const [viserFilter, setViserFilter] = useState(false);

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

  const filtrertKort = useMemo(() => {
    if (!dashboardData) return [];

    let resultat = dashboardData.categories;

    // Søkefilter
    if (sokeTerm) {
      resultat = resultat.filter(kort =>
        kort.title.toLowerCase().includes(sokeTerm.toLowerCase()) ||
        kort.description.toLowerCase().includes(sokeTerm.toLowerCase())
      );
    }

    // Rollefilter
    if (aktivRolleFilter !== 'alle') {
      resultat = resultat.filter(kort =>
        kort.roles && kort.roles.includes(aktivRolleFilter as any)
      );
    }

    return resultat;
  }, [dashboardData, sokeTerm, aktivRolleFilter]);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const nullstillFiltre = () => {
    setSokeTerm('');
    setAktivRolleFilter('alle');
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
    <div className="px-2 py-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Innstillinger</h1>
        <p className="text-gray-600">
          Søk og filtrer blant systemets innstillinger for å finne det du trenger raskt
        </p>
      </div>

      {/* Hurtigtilgang */}
      <div className="mb-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <FiStar className="w-5 h-5 mr-2" />
          Hurtigtilgang
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hurtigTilgang.map((item) => (
            <button
              key={item.route}
              onClick={() => handleCardClick(item.route)}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <item.ikon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{item.navn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Søk og Filter */}
      <div className="mb-6 space-y-4">
        {/* Søkefelt */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Søk etter innstillinger..."
            value={sokeTerm}
            onChange={(e) => setSokeTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {sokeTerm && (
            <button
              onClick={() => setSokeTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle og Filtre */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViserFilter(!viserFilter)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filtre</span>
            {(sokeTerm || aktivRolleFilter !== 'alle') && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                Aktiv
              </span>
            )}
          </button>

          <div className="text-sm text-gray-500">
            Viser {filtrertKort.length} av {dashboardData.categories.length} innstillinger
          </div>
        </div>

        {/* Filter Panel */}
        {viserFilter && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filtre</h3>
              <button
                onClick={nullstillFiltre}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Nullstill alle
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brukerrolle
                </label>
                <div className="flex flex-wrap gap-2">
                  {rolleFiltre.map((rolle) => (
                    <button
                      key={rolle.value}
                      onClick={() => setAktivRolleFilter(rolle.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        aktivRolleFilter === rolle.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {rolle.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultater */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrertKort.map((category) => {
          const IconComponent = ikonMap[category.icon];
          
          return (
            <RoleBased key={category.title} roles={category.roles || ['ADMIN']}>
              <div
                onClick={() => handleCardClick(category.route)}
                className={`
                  bg-white rounded-lg border-2 p-6 cursor-pointer transition-all duration-200
                  hover:shadow-lg hover:scale-105 hover:border-blue-300
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
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.title}
                      </h3>
                      {category.roles && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {category.roles.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            </RoleBased>
          );
        })}
      </div>

      {/* Ingen resultater */}
      {filtrertKort.length === 0 && (
        <div className="text-center py-12">
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen innstillinger funnet</h3>
          <p className="text-gray-500 mb-4">
            Prøv å justere søkekriteriene eller filtrene for å finne det du leter etter.
          </p>
          <button
            onClick={nullstillFiltre}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Nullstill søk og filtre
          </button>
        </div>
      )}

      {/* Hjelpeseksjon */}
      <div className="mt-12 bg-blue-50 rounded-lg px-6 py-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <FiSettings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Tips for effektiv søking
            </h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Bruk nøkkelord som "bruker", "sikkerhet", "rapport" for å finne relaterte innstillinger</li>
              <li>• Filtrer på rolle for å se kun innstillinger som er relevante for deg</li>
              <li>• Bruk hurtigtilgang for de mest brukte innstillingene</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 