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
  FiBriefcase,
  FiLock,
  FiActivity
} from 'react-icons/fi';
import RoleBased from '../../components/auth/RoleBased';
import innstillingerService, { InnstillingerDashboardData } from '../../services/innstillinger.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<any>> = {
  FiSettings, FiUsers, FiShield, FiBarChart2, FiKey, FiDatabase,
  FiGlobe, FiTool, FiMail, FiClock, FiSidebar, FiAlertTriangle,
  FiBriefcase, FiLock, FiActivity
};

interface Kategori {
  id: string;
  navn: string;
  ikon: React.ComponentType<any>;
  farge: string;
  beskrivelse: string;
}

const kategorier: Kategori[] = [
  {
    id: 'organisasjon',
    navn: 'Organisasjon',
    ikon: FiBriefcase,
    farge: 'blue',
    beskrivelse: 'Brukerroller, bedriftsinnstillinger og organisasjonsoppsett'
  },
  {
    id: 'system',
    navn: 'System',
    ikon: FiSettings,
    farge: 'green',
    beskrivelse: 'Grunnleggende systemkonfigurasjon og vedlikehold'
  },
  {
    id: 'integrasjoner',
    navn: 'Integrasjoner',
    ikon: FiKey,
    farge: 'purple',
    beskrivelse: 'API-er, e-post og eksterne tjenester'
  },
  {
    id: 'rapporter',
    navn: 'Rapporter',
    ikon: FiBarChart2,
    farge: 'yellow',
    beskrivelse: 'Rapportmaler og dataanalyse'
  },
  {
    id: 'sikkerhet',
    navn: 'Sikkerhet',
    ikon: FiShield,
    farge: 'red',
    beskrivelse: 'Sikkerhetskontroller og systemlogger'
  }
];

export default function Utkast1_KategorisertLayout() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<InnstillingerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aktiveKategori, setAktiveKategori] = useState('organisasjon');

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
  const filtrertKort = settingsCategories.filter(kort => kategoriserKort(kort) === aktiveKategori);
  const aktivKategoriData = kategorier.find(k => k.id === aktiveKategori);

  return (
    <div className="px-2 py-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Innstillinger</h1>
        <p className="text-gray-600">
          Administrer og konfigurer systemets ulike funksjoner organisert i kategorier
        </p>
      </div>

      {/* Kategori Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {kategorier.map((kategori) => (
              <button
                key={kategori.id}
                onClick={() => setAktiveKategori(kategori.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${aktiveKategori === kategori.id
                    ? `border-${kategori.farge}-500 text-${kategori.farge}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <kategori.ikon className="w-5 h-5" />
                <span>{kategori.navn}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Aktiv Kategori Header */}
      {aktivKategoriData && (
        <div className={`mb-6 bg-${aktivKategoriData.farge}-50 rounded-lg p-4 border border-${aktivKategoriData.farge}-200`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${aktivKategoriData.farge}-100 rounded-lg`}>
              <aktivKategoriData.ikon className={`w-6 h-6 text-${aktivKategoriData.farge}-600`} />
            </div>
            <div>
              <h2 className={`text-xl font-semibold text-${aktivKategoriData.farge}-900`}>
                {aktivKategoriData.navn}
              </h2>
              <p className={`text-${aktivKategoriData.farge}-700`}>
                {aktivKategoriData.beskrivelse}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Innstillinger Kort */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrertKort.map((category) => {
          const IconComponent = ikonMap[category.icon];
          
          return (
            <RoleBased key={category.title} roles={category.roles || ['ADMIN']}>
              <div
                onClick={() => handleCardClick(category.route)}
                className={`
                  bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-300
                  hover:shadow-xl hover:scale-105 hover:border-${aktivKategoriData?.farge}-300
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
                  </div>
                </div>
              </div>
            </RoleBased>
          );
        })}
      </div>

      {/* Hjelpeseksjon */}
      <div className={`mt-12 bg-${aktivKategoriData?.farge}-50 rounded-lg px-6 py-4 border border-${aktivKategoriData?.farge}-200`}>
        <div className="flex items-start space-x-3">
          <FiSettings className={`w-5 h-5 text-${aktivKategoriData?.farge}-600 mt-0.5`} />
          <div>
            <h3 className={`text-lg font-medium text-${aktivKategoriData?.farge}-900 mb-2`}>
              Trenger du hjelp med {aktivKategoriData?.navn.toLowerCase()}?
            </h3>
            <p className={`text-${aktivKategoriData?.farge}-700 text-sm mb-3`}>
              Hvis du ikke finner det du leter etter, eller trenger assistanse med {aktivKategoriData?.navn.toLowerCase()}-innstillinger, 
              kan du kontakte systemadministrator eller se dokumentasjonen.
            </p>
            <button className={`text-${aktivKategoriData?.farge}-600 hover:text-${aktivKategoriData?.farge}-800 text-sm font-medium`}>
              Se dokumentasjon for {aktivKategoriData?.navn} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 