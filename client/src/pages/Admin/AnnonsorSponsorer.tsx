import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  GiftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Sponsor {
  id: number;
  navn: string;
  bedriftId: number;
  bedrift: {
    navn: string;
  };
  type: 'SPONSOR';
  kontaktperson: string | null;
  telefon: string | null;
  epost: string | null;
  nettside: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  aktiv: boolean;
  startDato: string;
  sluttDato: string | null;
  budsjett: number | null;
  kostnadPerVisning: number | null;
  kostnadPerKlikk: number | null;
  opprettet: string;
  annonser: Array<{
    id: number;
    tittel: string;
    aktiv: boolean;
    statistikk: Array<{
      antallVisninger: number;
      antallKlikk: number;
    }>;
  }>;
}

export default function AnnonsorSponsorer() {
  const [sponsorer, setSponsorer] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALLE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('ALLE');

  useEffect(() => {
    fetchSponsorer();
  }, []);

  const fetchSponsorer = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/annonsor/sponsorer?type=SPONSOR', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente data');
      }

      const data = await response.json();
      setSponsorer(data);
    } catch (error) {
      console.error('Feil ved henting av sponsorer:', error);
      toast.error('Kunne ikke hente sponsorer');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, action: 'godkjenn' | 'avvis') => {
    try {
      const endpoint = action === 'godkjenn' ? 'godkjenn' : 'avvis';
      const response = await fetch(`/api/annonsor/sponsorer/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere status');
      }

      toast.success(`Sponsor ${action === 'godkjenn' ? 'godkjent' : 'avvist'}`);
      fetchSponsorer();
    } catch (error) {
      console.error('Feil ved statusoppdatering:', error);
      toast.error('Kunne ikke oppdatere status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Er du sikker på at du vil slette denne sponsoren?')) {
      return;
    }

    try {
      const response = await fetch(`/api/annonsor/sponsorer/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke slette');
      }

      toast.success('Sponsor slettet');
      fetchSponsorer();
    } catch (error) {
      console.error('Feil ved sletting:', error);
      toast.error('Kunne ikke slette sponsor');
    }
  };

  const calculateTotalStats = (annonser: any[]) => {
    let totalVisninger = 0;
    let totalKlikk = 0;

    annonser.forEach(annonse => {
      annonse.statistikk.forEach((stat: any) => {
        totalVisninger += stat.antallVisninger;
        totalKlikk += stat.antallKlikk;
      });
    });

    return { totalVisninger, totalKlikk };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'SUSPENDED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSponsorer = sponsorer.filter(sponsor => {
    return statusFilter === 'ALLE' || sponsor.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laster sponsorer...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sponsor Administrasjon</h1>
              <p className="text-lg text-gray-600">Administrer sponsorer og deres tilbud til elever</p>
            </div>
            <Link
              to="/admin/annonsor/sponsorer/ny"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ny Sponsor
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GiftIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Sponsorer</p>
                <p className="text-2xl font-bold text-gray-900">{sponsorer.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Sponsorer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sponsorer.filter(s => s.status === 'APPROVED' && s.aktiv).length}
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
                <p className="text-sm font-medium text-gray-600">Venter Godkjenning</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sponsorer.filter(s => s.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Annonser</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sponsorer.reduce((acc, s) => acc + s.annonser.filter(a => a.aktiv).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">Filtrer Sponsorer</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="ALLE">Alle statuser</option>
                  <option value="PENDING">Venter</option>
                  <option value="APPROVED">Godkjent</option>
                  <option value="REJECTED">Avvist</option>
                  <option value="SUSPENDED">Suspenderte</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {filteredSponsorer.length === 0 ? (
            <div className="text-center py-12">
              <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen sponsorer funnet</h3>
              <p className="text-gray-500">Prøv å endre filtrene eller opprett en ny sponsor.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annonser
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
                  {filteredSponsorer.map((sponsor) => {
                    const stats = calculateTotalStats(sponsor.annonser);
                    return (
                      <tr key={sponsor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sponsor.navn}</div>
                            <div className="text-sm text-gray-500">{sponsor.bedrift.navn}</div>
                            {sponsor.kontaktperson && (
                              <div className="text-sm text-gray-500">{sponsor.kontaktperson}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(sponsor.status)}`}>
                            {sponsor.status === 'PENDING' && 'Venter'}
                            {sponsor.status === 'APPROVED' && 'Godkjent'}
                            {sponsor.status === 'REJECTED' && 'Avvist'}
                            {sponsor.status === 'SUSPENDED' && 'Suspenderte'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <span className="text-gray-600">Annonser:</span>
                            <span className="font-medium">{sponsor.annonser.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Aktive:</span>
                            <span className="font-medium">{sponsor.annonser.filter(a => a.aktiv).length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <span className="text-gray-600">Visninger:</span>
                            <span className="font-medium">{stats.totalVisninger}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Klikk:</span>
                            <span className="font-medium">{stats.totalKlikk}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <span className="text-gray-600">Fra:</span>
                            <span className="font-medium">{new Date(sponsor.startDato).toLocaleDateString('nb-NO')}</span>
                          </div>
                          {sponsor.sluttDato && (
                            <div>
                              <span className="text-gray-600">Til:</span>
                              <span className="font-medium">{new Date(sponsor.sluttDato).toLocaleDateString('nb-NO')}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/admin/annonsor/sponsorer/${sponsor.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            
                            <Link
                              to={`/admin/annonsor/sponsorer/${sponsor.id}/rediger`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>

                            {sponsor.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(sponsor.id, 'godkjenn')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Godkjenn"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleStatusChange(sponsor.id, 'avvis')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Avvis"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDelete(sponsor.id)}
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