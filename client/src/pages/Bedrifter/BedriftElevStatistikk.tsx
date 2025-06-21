import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  UserGroupIcon as UserGroupSolidIcon,
  AcademicCapIcon as AcademicCapSolidIcon,
  ClockIcon as ClockSolidIcon,
  TrophyIcon as TrophySolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from '@heroicons/react/24/solid';
import { 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { elevService, type BedriftElevData as ImportedBedriftElevData, type ElevStatistikk } from '../../services/elev.service';

const statusConfig: Record<string, { color: string; label: string }> = {
  AKTIV: { color: 'bg-green-100 text-green-800', label: 'Aktiv' },
  FULLFØRT: { color: 'bg-blue-100 text-blue-800', label: 'Fullført' },
  AVBRUTT: { color: 'bg-red-100 text-red-800', label: 'Avbrutt' },
  PAUSERT: { color: 'bg-yellow-100 text-yellow-800', label: 'Pausert' },
  PAUSE: { color: 'bg-yellow-100 text-yellow-800', label: 'Pause' }
};

const karakterFarge: Record<string, string> = {
  A: 'text-green-600',
  B: 'text-blue-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  E: 'text-red-600',
  F: 'text-red-800'
};

export default function BedriftElevStatistikk() {
  const { bedriftId } = useParams<{ bedriftId: string }>();
  const navigate = useNavigate();
  const [bedriftData, setBedriftData] = useState<ImportedBedriftElevData | null>(null);
  const [elevData, setElevData] = useState<ElevStatistikk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedElev, setSelectedElev] = useState<ElevStatistikk | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('alle');
  const [sortBy, setSortBy] = useState<'navn' | 'fremgang' | 'karakter' | 'sistAktiv'>('navn');
  const [filteredElever, setFilteredElever] = useState<ElevStatistikk[]>([]);
  const [aktivTab, setAktivTab] = useState('oversikt');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (bedriftId) {
      hentData();
    }
  }, [bedriftId]);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [bedriftInfo, elevStatistikk] = await Promise.all([
        elevService.hentMockBedriftElevData(),
        elevService.hentMockElevStatistikk()
      ]);
      
      setBedriftData(bedriftInfo);
      setElevData(elevStatistikk);
      setFilteredElever(elevStatistikk);
    } catch (error) {
      console.error('Feil ved henting av elev-data:', error);
      setError('Kunne ikke laste elev-data. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  // Filter og søk
  useEffect(() => {
    let filtered = elevData;

    if (filterStatus !== 'alle') {
      filtered = filtered.filter(elev => elev.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(elev => 
        elev.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elev.instruktør.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sortering
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'navn':
          return a.navn.localeCompare(b.navn);
        case 'fremgang':
          return b.fremgang.prosent - a.fremgang.prosent;
        case 'karakter':
          if (!a.karakter && !b.karakter) return 0;
          if (!a.karakter) return 1;
          if (!b.karakter) return -1;
          return a.karakter.localeCompare(b.karakter);
        case 'sistAktiv':
          return new Date(b.sistAktiv).getTime() - new Date(a.sistAktiv).getTime();
        default:
          return 0;
      }
    });

    setFilteredElever(filtered);
  }, [elevData, filterStatus, searchTerm, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: ElevStatistikk['status']) => {
    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getProgressColor = (prosent: number) => {
    if (prosent >= 80) return 'bg-green-500';
    if (prosent >= 60) return 'bg-yellow-500';
    if (prosent >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const exportData = () => {
    const csvContent = [
      'Navn,Personnummer,Status,Fremgang %,Timer,Prøver bestått,Karakter,Sist aktiv,Instruktør,Kostnad totalt,Utestående',
      ...filteredElever.map(elev => 
        `${elev.navn},${elev.personnummer},${elev.status},${elev.fremgang.prosent}%,${elev.fremgang.gjennomførteTimer}/${elev.fremgang.totalTimer},${elev.prøver.bestått},${elev.karakter || '-'},${elev.sistAktiv},${elev.instruktør},${elev.kostnader.totalt},${elev.kostnader.utestående}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elev-statistikk-${bedriftData?.bedriftNavn}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center cards-spacing-grid">
              <button
                onClick={() => navigate(`/bedrifter/${bedriftId}`)}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Tilbake til bedrift
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Elevstatistikk - {bedriftData?.bedriftNavn}
            </h1>
            <div className="flex items-center cards-spacing-grid mt-2">
              <span className="text-gray-600">Org.nr: {bedriftData?.organisasjonsnummer}</span>
              <span className="text-gray-600">Totalt {bedriftData?.antallElever} elever</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportData}
              className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Eksporter statistikk
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-blue-100 rounded-lg">
              <UserGroupSolidIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Elever</p>
              <p className="text-2xl font-bold text-blue-600">{bedriftData?.aktiveElever}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-green-100 rounded-lg">
              <AcademicCapSolidIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fullførte</p>
              <p className="text-2xl font-bold text-green-600">{bedriftData?.fullførte}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-yellow-100 rounded-lg">
              <ClockSolidIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Snitt Varighet</p>
              <p className="text-2xl font-bold text-yellow-600">{bedriftData?.gjennomsnittligVarighet} mnd</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-purple-100 rounded-lg">
              <TrophySolidIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suksessrate</p>
              <p className="text-2xl font-bold text-purple-600">{bedriftData?.suksessrate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
          <div className="flex items-center">
            <div className="px-2 py-1 bg-indigo-100 rounded-lg">
              <ChartBarSolidIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kostnad</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(bedriftData?.totalKostnader || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-2" aria-label="Tabs">
            {[
              { id: 'oversikt', navn: 'Oversikt', ikon: ChartBarIcon, activeIcon: ChartBarSolidIcon },
              { id: 'aktive', navn: 'Aktive Elever', ikon: UserGroupIcon, activeIcon: UserGroupSolidIcon },
              { id: 'fullfort', navn: 'Fullførte', ikon: AcademicCapIcon, activeIcon: AcademicCapSolidIcon },
              { id: 'analyse', navn: 'Analyse', ikon: TrophyIcon, activeIcon: TrophySolidIcon }
            ].map((tab) => {
              const Icon = aktivTab === tab.id && tab.activeIcon ? tab.activeIcon : tab.ikon;
              const count = tab.id === 'oversikt' ? filteredElever.length :
                           tab.id === 'aktive' ? filteredElever.filter(e => e.status === 'AKTIV').length :
                           tab.id === 'fullfort' ? filteredElever.filter(e => e.status === 'FULLFØRT').length :
                           filteredElever.filter(e => e.karakter && ['A', 'B'].includes(e.karakter)).length;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setAktivTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    aktivTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.navn}
                  {tab.id !== 'analyse' && (
                    <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2 py-1">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søk elever..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="alle">Alle statuser</option>
              <option value="AKTIV">Aktive</option>
              <option value="FULLFØRT">Fullførte</option>
              <option value="PAUSERT">Pauserte</option>
              <option value="AVBRUTT">Avbrutte</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="navn">Sorter etter navn</option>
              <option value="fremgang">Sorter etter fremgang</option>
              <option value="karakter">Sorter etter karakter</option>
              <option value="sistAktiv">Sorter etter sist aktiv</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              <FunnelIcon className="w-4 h-4 mr-1" />
              {filteredElever.length} elever
            </div>
          </div>

          {/* Content */}
          {aktivTab === 'oversikt' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Elev
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fremgang
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prøver
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Karakter
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instruktør
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sist aktiv
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredElever.map((elev) => (
                    <tr key={elev.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{elev.navn}</div>
                          <div className="text-sm text-gray-500">{elev.personnummer}</div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {getStatusBadge(elev.status)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>{elev.fremgang.gjennomførteTimer}/{elev.fremgang.totalTimer} timer</span>
                              <span>{elev.fremgang.prosent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(elev.fremgang.prosent)}`}
                                style={{ width: `${elev.fremgang.prosent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span>{elev.prøver.bestått}</span>
                            {elev.prøver.stryk > 0 && (
                              <>
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                <span>{elev.prøver.stryk}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Snitt: {elev.prøver.gjennomsnitt}</div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {elev.karakter ? (
                          <span className={`text-lg font-bold ${karakterFarge[elev.karakter]}`}>
                            {elev.karakter}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {elev.instruktør}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(elev.sistAktiv)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedElev(elev)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {aktivTab === 'aktive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
              {filteredElever.filter(e => e.status === 'AKTIV').map((elev) => (
                <div key={elev.id} className="bg-white border border-gray-200 rounded-lg px-2 py-1 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{elev.navn}</h3>
                      <p className="text-sm text-gray-500">{elev.personnummer}</p>
                    </div>
                    {getStatusBadge(elev.status)}
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fremgang</span>
                        <span>{elev.fremgang.prosent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(elev.fremgang.prosent)}`}
                          style={{ width: `${elev.fremgang.prosent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 cards-spacing-grid text-sm">
                      <div>
                        <div className="text-gray-500">Timer</div>
                        <div className="font-medium">{elev.fremgang.gjennomførteTimer}/{elev.fremgang.totalTimer}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Prøver</div>
                        <div className="font-medium">{elev.prøver.bestått} bestått</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <button 
                        onClick={() => setSelectedElev(elev)}
                        className="w-full inline-flex items-center justify-center gap-2 px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Se detaljer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {aktivTab === 'fullfort' && (
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900">Fullførte Elever</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Elev
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fullført dato
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Varighet
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sluttkarakter
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total kostnad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredElever.filter(e => e.status === 'FULLFØRT').map((elev) => {
                      // Beregn varighet fra startDato til nå (siden sluttDato ikke finnes i interface)
                      const varighet = Math.round((new Date().getTime() - new Date(elev.startDato).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                      
                      return (
                        <tr key={elev.id} className="hover:bg-gray-50">
                          <td className="px-2 py-1 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{elev.navn}</div>
                              <div className="text-sm text-gray-500">{elev.instruktør}</div>
                            </div>
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(elev.sistAktiv)}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                            {varighet} måneder
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {elev.karakter ? (
                              <span className={`text-xl font-bold ${karakterFarge[elev.karakter] || 'text-gray-600'}`}>
                                {elev.karakter}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(elev.kostnader.totalt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {aktivTab === 'analyse' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
              <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                <h4 className="text-base font-medium text-gray-900 mb-4">Karakterfordeling</h4>
                <div className="space-y-8">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(karakter => {
                    const antall = filteredElever.filter(e => e.karakter === karakter).length;
                    const prosent = filteredElever.length > 0 ? (antall / filteredElever.length) * 100 : 0;
                    return (
                      <div key={karakter} className="flex items-center justify-between">
                        <span className={`font-bold ${karakterFarge[karakter as keyof typeof karakterFarge]}`}>
                          Karakter {karakter}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{antall} elever</span>
                          <span className="text-sm text-gray-500">({prosent.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                <h4 className="text-base font-medium text-gray-900 mb-4">Økonomi Oversikt</h4>
                <div className="cards-spacing-vertical">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total kostnad</span>
                    <span className="font-medium">{formatCurrency(bedriftData?.totalKostnader || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Betalt</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(filteredElever.reduce((sum, e) => sum + e.kostnader.betalt, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utestående</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(filteredElever.reduce((sum, e) => sum + e.kostnader.utestående, 0))}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Snitt kostnad per elev</span>
                      <span className="font-medium">
                        {formatCurrency(bedriftData?.totalKostnader ? bedriftData.totalKostnader / bedriftData.antallElever : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredElever.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen elever funnet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prøv å justere filtrene for å se flere resultater.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedElev && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Detaljer om {selectedElev.navn}</h2>
          {/* Add your detailed view content here */}
        </div>
      )}
    </div>
  );
}