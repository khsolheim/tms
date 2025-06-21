import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kjøretøyService, type Kjøretøy } from '../../services/kjøretøy.service';
import {
  TruckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  TruckIcon as TruckSolidIcon
} from '@heroicons/react/24/solid';



export default function BedriftKjøretøy() {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const [activeTab, setActiveTab] = useState<'oversikt' | 'planlegging' | 'historie'>('oversikt');
  const [søk, setSøk] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [kjøretøy, setKjøretøy] = useState<Kjøretøy[]>([]);
  const [loading, setLoading] = useState(true);

  // Hent kjøretøy data
  useEffect(() => {
    const hentData = async () => {
      if (!bedriftId) return;
      
      try {
        setLoading(true);
        const data = await kjøretøyService.hentKjøretøy(bedriftId);
        setKjøretøy(data);
      } catch (error) {
        console.error('Feil ved henting av kjøretøy:', error);
      } finally {
        setLoading(false);
      }
    };

    hentData();
  }, [bedriftId]);

  // Fjernet hardkodet data - bruker service i stedet

  const filteredKjøretøy = kjøretøy.filter(k => {
    const matcherSøk = !søk || 
      k.registreringsnummer.toLowerCase().includes(søk.toLowerCase()) ||
      k.merke.toLowerCase().includes(søk.toLowerCase()) ||
      k.modell.toLowerCase().includes(søk.toLowerCase());
    
    const matcherStatus = !filterStatus || k.status === filterStatus;
    
    return matcherSøk && matcherStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktiv':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Aktiv</span>;
      case 'vedlikehold':
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Vedlikehold</span>;
      case 'inaktiv':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Inaktiv</span>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aktiv':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'vedlikehold':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-500" />;
      case 'inaktiv':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TruckSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kjøretøy</h1>
                <p className="text-sm text-gray-600">
                  Administrer bedriftens kjøretøypark
                </p>
              </div>
            </div>
            <Link
              to={`/bedrifter/${bedriftId}/kjøretøy/ny`}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nytt kjøretøy
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-2">
            {[
              { id: 'oversikt', name: 'Oversikt', icon: TruckIcon },
              { id: 'planlegging', name: 'Planlegging', icon: ClockIcon },
              { id: 'historie', name: 'Historie', icon: WrenchScrewdriverIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1">
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Søk</label>
              <input
                type="text"
                value={søk}
                onChange={(e) => setSøk(e.target.value)}
                placeholder="Søk etter registreringsnummer, merke eller modell..."
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Alle statuser</option>
                <option value="aktiv">Aktiv</option>
                <option value="vedlikehold">Vedlikehold</option>
                <option value="inaktiv">Inaktiv</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSøk('');
                  setFilterStatus('');
                }}
                className="px-2 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Nullstill filtre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'oversikt' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-2 py-1 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Kjøretøyoversikt ({filteredKjøretøy.length})
            </h3>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kjøretøy
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kilometerstand
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Neste service
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKjøretøy.map((kjøretøy) => (
                  <tr key={kjøretøy.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(kjøretøy.status)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {kjøretøy.registreringsnummer}
                          </div>
                          <div className="text-sm text-gray-500">
                            {kjøretøy.merke} {kjøretøy.modell} ({kjøretøy.årsmodell})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {getStatusBadge(kjøretøy.status)}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {kjøretøy.kilometer.toLocaleString()} km
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {new Date(kjøretøy.vedlikehold.nesteService).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => console.log('Button clicked')} className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="text-gray-600 hover:text-gray-900">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'planlegging' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="text-center">
              <ClockIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Vedlikeholdsplanlegging
              </h3>
              <p className="text-gray-600">
                Planlegging av service og vedlikehold kommer snart
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historie' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-2 py-1">
            <div className="text-center">
              <WrenchScrewdriverIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Vedlikeholdshistorie
              </h3>
              <p className="text-gray-600">
                Komplett vedlikeholdslogg kommer snart
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 