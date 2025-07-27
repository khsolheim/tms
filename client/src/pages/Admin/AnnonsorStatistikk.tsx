import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DocumentTextIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

interface StatistikkData {
  totalAnnonser: number;
  totalSponsorer: number;
  totalAnnonsorer: number;
  totalVisninger: number;
  totalKlikk: number;
  totalTelefonKlikk: number;
  totalEpostKlikk: number;
  totalVeiKlikk: number;
  gjennomsnittligCTR: number;
  toppAnnonser: Array<{
    id: number;
    tittel: string;
    annonsor: {
      navn: string;
      type: 'ANNONSOR' | 'SPONSOR';
    };
    visninger: number;
    klikk: number;
    ctr: number;
  }>;
  toppSponsorer: Array<{
    id: number;
    navn: string;
    type: 'ANNONSOR' | 'SPONSOR';
    totalVisninger: number;
    totalKlikk: number;
    gjennomsnittligCTR: number;
    antallAnnonser: number;
  }>;
  dagligStatistikk: Array<{
    dato: string;
    visninger: number;
    klikk: number;
    telefonKlikk: number;
    epostKlikk: number;
    veiKlikk: number;
  }>;
  geografiskStatistikk: Array<{
    region: string;
    visninger: number;
    klikk: number;
    ctr: number;
  }>;
}

export default function AnnonsorStatistikk() {
  const [statistikk, setStatistikk] = useState<StatistikkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<'7_DAGER' | '30_DAGER' | '90_DAGER'>('30_DAGER');

  useEffect(() => {
    fetchStatistikk();
  }, [periode]);

  const fetchStatistikk = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annonsor/statistikk?periode=${periode}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente statistikk');
      }

      const data = await response.json();
      setStatistikk(data);
    } catch (error) {
      console.error('Feil ved henting av statistikk:', error);
      toast.error('Kunne ikke hente statistikk');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nb-NO').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laster statistikk...</p>
        </div>
      </div>
    );
  }

  if (!statistikk) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen statistikk tilgjengelig</h3>
          <p className="text-gray-500">Det er ingen data å vise for den valgte perioden.</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Annonsør & Sponsor Statistikk</h1>
              <p className="text-lg text-gray-600">Oversikt over ytelse og engasjement</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value as any)}
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7_DAGER">Siste 7 dager</option>
                <option value="30_DAGER">Siste 30 dager</option>
                <option value="90_DAGER">Siste 90 dager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Annonser</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalAnnonser)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GiftIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sponsorer</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalSponsorer)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Visninger</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalVisninger)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CursorArrowRaysIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totalt Klikk</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalKlikk)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gjennomsnittlig CTR</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(statistikk.gjennomsnittligCTR)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Telefon Klikk</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalTelefonKlikk)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <PhoneIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">E-post Klikk</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalEpostKlikk)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <EnvelopeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vei Klikk</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(statistikk.totalVeiKlikk)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Annonser */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Topp Annonser</h3>
            </div>
            <div className="p-6">
              {statistikk.toppAnnonser.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Ingen data tilgjengelig</p>
              ) : (
                <div className="space-y-4">
                  {statistikk.toppAnnonser.map((annonse, index) => (
                    <div key={annonse.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{annonse.tittel}</p>
                          <p className="text-xs text-gray-500">{annonse.annonsor.navn}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatNumber(annonse.visninger)} visninger</p>
                        <p className="text-xs text-gray-500">{formatPercentage(annonse.ctr)} CTR</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Sponsorer */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Topp Sponsorer</h3>
            </div>
            <div className="p-6">
              {statistikk.toppSponsorer.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Ingen data tilgjengelig</p>
              ) : (
                <div className="space-y-4">
                  {statistikk.toppSponsorer.map((sponsor, index) => (
                    <div key={sponsor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sponsor.navn}</p>
                          <p className="text-xs text-gray-500">{sponsor.antallAnnonser} annonser</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatNumber(sponsor.totalVisninger)} visninger</p>
                        <p className="text-xs text-gray-500">{formatPercentage(sponsor.gjennomsnittligCTR)} CTR</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geografisk Statistikk */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Geografisk Ytelse</h3>
          </div>
          <div className="p-6">
            {statistikk.geografiskStatistikk.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Ingen geografisk data tilgjengelig</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visninger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klikk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistikk.geografiskStatistikk.map((region, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {region.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(region.visninger)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(region.klikk)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPercentage(region.ctr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Daglig Trend */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daglig Trend</h3>
          </div>
          <div className="p-6">
            {statistikk.dagligStatistikk.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Ingen trenddata tilgjengelig</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visninger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klikk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vei
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statistikk.dagligStatistikk.map((dag, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(dag.dato).toLocaleDateString('nb-NO')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(dag.visninger)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(dag.klikk)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(dag.telefonKlikk)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(dag.epostKlikk)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(dag.veiKlikk)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}