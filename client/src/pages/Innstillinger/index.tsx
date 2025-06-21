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
  FiAlertTriangle
} from 'react-icons/fi';
import RoleBased from '../../components/auth/RoleBased';
import innstillingerService, { InnstillingerDashboardData } from '../../services/innstillinger.service';

// Icon mapping for string-based icons
const ikonMap: Record<string, React.ComponentType<any>> = {
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
  FiAlertTriangle
};

export default function Innstillinger() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<InnstillingerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="px-2 py-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Innstillinger</h1>
        <p className="text-gray-600">
          Administrer og konfigurer systemets ulike funksjoner og innstillinger
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {settingsCategories.map((category) => {
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

      <div className="mt-12 bg-blue-50 rounded-lg px-2 py-1 border border-blue-200">
        <div className="flex items-start space-x-3">
          <FiSettings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Trenger du hjelp?
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Hvis du ikke finner det du leter etter, eller trenger assistanse med innstillinger, 
              kan du kontakte systemadministrator eller se dokumentasjonen.
            </p>
            <button onClick={() => console.log('Button clicked')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Se dokumentasjon →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 