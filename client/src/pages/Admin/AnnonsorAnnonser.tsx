import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Annonse {
  id: number;
  tittel: string;
  innledning: string;
  fullInnhold: string;
  bildeUrl: string | null;
  videoUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  ctaTelefon: string | null;
  ctaEpost: string | null;
  ctaVeibeskrivelse: string | null;
  aktiv: boolean;
  prioritet: number;
  maxVisninger: number | null;
  maxKlikk: number | null;
  startDato: string;
  sluttDato: string | null;
  opprettet: string;
  annonsor: {
    id: number;
    navn: string;
    type: 'ANNONSOR' | 'SPONSOR';
    bedrift: {
      navn: string;
    };
  };
  targeting: Array<{
    id: number;
    geografisk: {
      navn: string;
      type: string;
    } | null;
    skole: {
      navn: string;
    } | null;
  }>;
  statistikk: Array<{
    antallVisninger: number;
    antallKlikk: number;
    antallTelefonKlikk: number;
    antallEpostKlikk: number;
    antallVeiKlikk: number;
  }>;
}

export default function AnnonsorAnnonser() {
  const [annonser, setAnnonser] = useState<Annonse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALLE' | 'AKTIVE' | 'INAKTIVE'>('ALLE');
  const [typeFilter, setTypeFilter] = useState<'ALLE' | 'ANNONSOR' | 'SPONSOR'>('ALLE');

  useEffect(() => {
    fetchAnnonser();
  }, []);

  const fetchAnnonser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/annonsor/annonser', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente data');
      }

      const data = await response.json();
      setAnnonser(data);
    } catch (error) {
      console.error('Feil ved henting av annonser:', error);
      toast.error('Kunne ikke hente annonser');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, aktiv: boolean) => {
    try {
      const response = await fetch(`/api/annonsor/annonser/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aktiv: !aktiv })
      });

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere status');
      }

      toast.success(`Annonse ${aktiv ? 'deaktivert' : 'aktivert'}`);
      fetchAnnonser();
    } catch (error) {
      console.error('Feil ved statusoppdatering:', error);
      toast.error('Kunne ikke oppdatere status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Er du sikker på at du vil slette denne annonsen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/annonsor/annonser/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke slette');
      }

      toast.success('Annonse slettet');
      fetchAnnonser();
    } catch (error) {
      console.error('Feil ved sletting:', error);
      toast.error('Kunne ikke slette annonse');
    }
  };

  const calculateTotalStats = (statistikk: any[]) => {
    let totalVisninger = 0;
    let totalKlikk = 0;
    let totalTelefonKlikk = 0;
    let totalEpostKlikk = 0;
    let totalVeiKlikk = 0;

    statistikk.forEach((stat: any) => {
      totalVisninger += stat.antallVisninger;
      totalKlikk += stat.antallKlikk;
      totalTelefonKlikk += stat.antallTelefonKlikk;
      totalEpostKlikk += stat.antallEpostKlikk;
      totalVeiKlikk += stat.antallVeiKlikk;
    });

    return { 
      totalVisninger, 
      totalKlikk, 
      totalTelefonKlikk, 
      totalEpostKlikk, 
      totalVeiKlikk 
    };
  };

  const getTypeColor = (type: string) => {
    return type === 'SPONSOR' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPriorityColor = (prioritet: number) => {
    if (prioritet >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (prioritet >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const filteredAnnonser = annonser.filter(annonse => {
    const aktivMatch = filter === 'ALLE' || 
      (filter === 'AKTIVE' && annonse.aktiv) || 
      (filter === 'INAKTIVE' && !annonse.aktiv);
    const typeMatch = typeFilter === 'ALLE' || annonse.annonsor.type === typeFilter;
    return aktivMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laster annonser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Annonse Administrasjon</h1>
              <p className="text-lg text-gray-600">Administrer annonser og deres innhold</p>
            </div>
            <Link
              to="/admin/annonsor/annonser/ny"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ny Annonse
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Annonser</p>
                <p className="text-2xl font-bold text-gray-900">{annonser.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Annonser</p>
                <p className="text-2xl font-bold text-gray-900">
                  {annonser.filter(a => a.aktiv).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MegaphoneIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sponsor Annonser</p>
                <p className="text-2xl font-bold text-gray-900">
                  {annonser.filter(a => a.annonsor.type === 'SPONSOR').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Visninger</p>
                <p className="text-2xl font-bold text-gray-900">
                  {annonser.reduce((acc, a) => acc + a.statistikk.reduce((sum, s) => sum + s.antallVisninger, 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">Filtrer Annonser</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALLE">Alle annonser</option>
                  <option value="AKTIVE">Aktive</option>
                  <option value="INAKTIVE">Inaktive</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALLE">Alle typer</option>
                  <option value="SPONSOR">Sponsorer</option>
                  <option value="ANNONSOR">Annonsører</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {filteredAnnonser.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen annonser funnet</h3>
              <p className="text-gray-500">Prøv å endre filtrene eller opprett en ny annonse.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annonse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annonsør/Sponsor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Prioritet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Targeting
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statistikk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periode
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAnnonser.map((annonse) => {
                    const stats = calculateTotalStats(annonse.statistikk);
                    return (
                      <tr key={annonse.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{annonse.tittel}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{annonse.innledning}</div>
                            {annonse.bildeUrl && (
                              <div className="text-xs text-gray-400 mt-1">📷 Har bilde</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{annonse.annonsor.navn}</div>
                            <div className="text-sm text-gray-500">{annonse.annonsor.bedrift.navn}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(annonse.annonsor.type)}`}>
                              {annonse.annonsor.type === 'SPONSOR' ? 'Sponsor' : 'Annonsør'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              {annonse.aktiv ? (
                                <PlayIcon className="h-4 w-4 text-green-600 mr-1" />
                              ) : (
                                <PauseIcon className="h-4 w-4 text-gray-400 mr-1" />
                              )}
                              <span className={`text-sm ${annonse.aktiv ? 'text-green-600' : 'text-gray-500'}`}>
                                {annonse.aktiv ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(annonse.prioritet)}`}>
                              Prioritet: {annonse.prioritet}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            {annonse.targeting.length > 0 ? (
                              annonse.targeting.map((target, index) => (
                                <div key={target.id} className="text-xs">
                                  {target.geografisk && (
                                    <span className="text-gray-600">{target.geografisk.navn}</span>
                                  )}
                                  {target.skole && (
                                    <span className="text-gray-600">{target.skole.navn}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400">Hele landet</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>
                              <span className="text-gray-600">Visninger:</span>
                              <span className="font-medium">{stats.totalVisninger}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Klikk:</span>
                              <span className="font-medium">{stats.totalKlikk}</span>
                            </div>
                            {stats.totalKlikk > 0 && (
                              <div className="text-xs text-gray-500">
                                CTR: {((stats.totalKlikk / stats.totalVisninger) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>
                              <span className="text-gray-600">Fra:</span>
                              <span className="font-medium">{new Date(annonse.startDato).toLocaleDateString('nb-NO')}</span>
                            </div>
                            {annonse.sluttDato && (
                              <div>
                                <span className="text-gray-600">Til:</span>
                                <span className="font-medium">{new Date(annonse.sluttDato).toLocaleDateString('nb-NO')}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/admin/annonsor/annonser/${annonse.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            
                            <Link
                              to={`/admin/annonsor/annonser/${annonse.id}/rediger`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>

                            <button
                              onClick={() => handleToggleStatus(annonse.id, annonse.aktiv)}
                              className={annonse.aktiv ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                              title={annonse.aktiv ? "Deaktiver" : "Aktiver"}
                            >
                              {annonse.aktiv ? (
                                <PauseIcon className="h-4 w-4" />
                              ) : (
                                <PlayIcon className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(annonse.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Slett"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}