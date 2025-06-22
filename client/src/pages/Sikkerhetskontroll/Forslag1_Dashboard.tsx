import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  BellIcon,
  Cog6ToothIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface SikkerhetskontrollData {
  id: number;
  tittel: string;
  status: 'BESTÅTT' | 'IKKE_BESTÅTT' | 'VENTER' | 'I_PROGRESJON';
  dato: string;
  elev: string;
  instruktør: string;
  poeng: number;
  kategori: string;
}

interface StatistikkWidget {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const Forslag1Dashboard: React.FC = () => {
  const [kontroller, setKontroller] = useState<SikkerhetskontrollData[]>([]);
  const [widgets, setWidgets] = useState<StatistikkWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock data
  useEffect(() => {
    const mockKontroller: SikkerhetskontrollData[] = [
      {
        id: 1,
        tittel: 'Daglig sikkerhetskontroll',
        status: 'BESTÅTT',
        dato: '2025-01-15T10:30:00Z',
        elev: 'Emma Andersen',
        instruktør: 'Lars Hansen',
        poeng: 95,
        kategori: 'Bil'
      },
      {
        id: 2,
        tittel: 'Ukentlig utstyrskontroll',
        status: 'I_PROGRESJON',
        dato: '2025-01-15T14:15:00Z',
        elev: 'Noah Johansen',
        instruktør: 'Maria Olsen',
        poeng: 0,
        kategori: 'Utstyr'
      },
      {
        id: 3,
        tittel: 'Førstehjelpsutstyr',
        status: 'IKKE_BESTÅTT',
        dato: '2025-01-14T09:00:00Z',
        elev: 'Olivia Berg',
        instruktør: 'Erik Lie',
        poeng: 45,
        kategori: 'Medisinsk'
      },
      {
        id: 4,
        tittel: 'Teknisk kontroll',
        status: 'BESTÅTT',
        dato: '2025-01-14T16:45:00Z',
        elev: 'William Svendsen',
        instruktør: 'Anne Knutsen',
        poeng: 88,
        kategori: 'Teknisk'
      },
      {
        id: 5,
        tittel: 'Miljøkontroll',
        status: 'VENTER',
        dato: '2025-01-13T11:20:00Z',
        elev: 'Sofie Dahl',
        instruktør: 'Tom Eriksen',
        poeng: 0,
        kategori: 'Miljø'
      }
    ];

    const mockWidgets: StatistikkWidget[] = [
      {
        id: 'total-kontroller',
        title: 'Totale kontroller',
        value: 247,
        change: 12,
        changeType: 'increase',
        icon: ChartBarIcon,
        color: 'bg-blue-500'
      },
      {
        id: 'bestatt-rate',
        title: 'Bestått rate',
        value: '87.5%',
        change: 2.3,
        changeType: 'increase',
        icon: CheckCircleIcon,
        color: 'bg-green-500'
      },
      {
        id: 'aktive-elever',
        title: 'Aktive elever',
        value: 156,
        change: -3,
        changeType: 'decrease',
        icon: UserGroupIcon,
        color: 'bg-purple-500'
      },
      {
        id: 'gjennomsnitt-poeng',
        title: 'Gj.snitt poeng',
        value: 78.2,
        change: 4.1,
        changeType: 'increase',
        icon: TrophyIcon,
        color: 'bg-yellow-500'
      },
      {
        id: 'ventende',
        title: 'Ventende kontroller',
        value: 23,
        change: 0,
        changeType: 'neutral',
        icon: ClockIcon,
        color: 'bg-orange-500'
      },
      {
        id: 'kritiske',
        title: 'Kritiske feil',
        value: 7,
        change: -2,
        changeType: 'decrease',
        icon: ExclamationTriangleIcon,
        color: 'bg-red-500'
      }
    ];

    setKontroller(mockKontroller);
    setWidgets(mockWidgets);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BESTÅTT': return 'bg-green-100 text-green-800';
      case 'IKKE_BESTÅTT': return 'bg-red-100 text-red-800';
      case 'I_PROGRESJON': return 'bg-blue-100 text-blue-800';
      case 'VENTER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'BESTÅTT': return 'Bestått';
      case 'IKKE_BESTÅTT': return 'Ikke bestått';
      case 'I_PROGRESJON': return 'Pågår';
      case 'VENTER': return 'Venter';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/sikkerhetskontroll"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Tilbake til forslag
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              Moderne Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Siste 24 timer</option>
              <option value="7d">Siste 7 dager</option>
              <option value="30d">Siste 30 dager</option>
              <option value="90d">Siste 90 dager</option>
            </select>
            
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Ny kontroll
            </button>
          </div>
        </div>

        {/* Statistikk Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {widgets.map((widget) => {
            const IconComponent = widget.icon;
            return (
              <div key={widget.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${widget.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {widget.changeType === 'increase' && (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    )}
                    {widget.changeType === 'decrease' && (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      widget.changeType === 'increase' ? 'text-green-600' : 
                      widget.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {widget.change > 0 ? '+' : ''}{widget.change}{widget.changeType !== 'neutral' ? '%' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {widget.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {widget.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hurtighandlinger */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hurtighandlinger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Ny kontroll</div>
                <div className="text-sm text-gray-500">Start ny sikkerhetskontroll</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Se rapporter</div>
                <div className="text-sm text-gray-500">Vis detaljerte rapporter</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Varsler</div>
                <div className="text-sm text-gray-500">Håndter ventende varsler</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Innstillinger</div>
                <div className="text-sm text-gray-500">Konfigurer system</div>
              </div>
            </button>
          </div>
        </div>

        {/* Siste kontroller */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Siste kontroller</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Se alle
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontroll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Elev
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instruktør
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poeng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kontroller.map((kontroll) => (
                  <tr key={kontroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {kontroll.tittel}
                        </div>
                        <div className="text-sm text-gray-500">
                          {kontroll.kategori}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kontroll.elev}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kontroll.instruktør}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(kontroll.status)}`}>
                        {getStatusText(kontroll.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {kontroll.poeng > 0 ? `${kontroll.poeng}%` : '-'}
                        </div>
                        {kontroll.poeng > 0 && (
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                kontroll.poeng >= 80 ? 'bg-green-500' : 
                                kontroll.poeng >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${kontroll.poeng}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(kontroll.dato).toLocaleDateString('no-NO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forslag1Dashboard; 