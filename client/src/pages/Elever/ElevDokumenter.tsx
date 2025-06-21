import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  CreditCardIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import {
  DocumentTextIcon as DocumentSolidIcon,
  FolderIcon as FolderSolidIcon
} from '@heroicons/react/24/solid';
import { referenceService } from '../../services/reference.service';
import { dokumenterService, type DokumentKategori, type Dokument } from '../../services/dokumenter.service';

// Lokale typer

interface ElevStatistikk {
  totaleDokumenter: number;
  aktiveDokumenter: number;
  utløpteDokumenter: number;
  ventendeDokumenter: number;
  sertifikater: number;
  kontrakter: number;
  rapporter: number;
  totalStørrelse: number;
}

interface FilterState {
  søk: string;
  kategori: string;
  status: string;
  type: string;
  tidsperiode: string;
}

export default function ElevDokumenter() {
  const { elevId } = useParams<{ elevId: string }>();
  const [dokumenter, setDokumenter] = useState<Dokument[]>([]);
  const [statistikk, setStatistikk] = useState<ElevStatistikk | null>(null);
  const [kategorier, setKategorier] = useState<DokumentKategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [visningsModus, setVisningsModus] = useState<'liste' | 'kort'>('liste');
  const [filters, setFilters] = useState<FilterState>({
    søk: '',
    kategori: '',
    status: '',
    type: '',
    tidsperiode: '30d'
  });
  const [visDokumentModal, setVisDokumentModal] = useState<string | null>(null);
  const [visLastOppModal, setVisLastOppModal] = useState(false);
  const [filstorrelser, setFilstorrelser] = useState<string[]>(['B', 'KB', 'MB', 'GB']); // Fallback
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (elevId) {
      hentData();
    }
  }, [elevId]);

  const hentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dokumenterService.hentMockData();
      setKategorier(data.kategorier);
      setDokumenter(data.dokumenter);
    } catch (error) {
      console.error('Feil ved henting av dokumenter:', error);
      setError('Kunne ikke laste dokumenter. Prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const hentFilstorrelser = async () => {
    try {
      const enheter = await referenceService.getFilstorrelser('kort');
      setFilstorrelser(enheter);
    } catch (error) {
      console.error('Feil ved henting av filstørrelse-enheter:', error);
      // Beholder fallback-verdier ved feil
    }
  };

  const getStatusColor = (status: Dokument['status']) => {
    switch (status) {
      case 'GODKJENT':
        return 'bg-green-100 text-green-800';
      case 'UTLØPT':
        return 'bg-red-100 text-red-800';
      case 'VENTER':
        return 'bg-yellow-100 text-yellow-800';
      case 'AVVIST':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Dokument['status']) => {
    switch (status) {
      case 'GODKJENT':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'UTLØPT':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'VENTER':
        return <ClockIcon className="w-4 h-4" />;
      case 'AVVIST':
        return <FolderIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <DocumentTextIcon className="w-5 h-5 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">IMG</div>;
      case 'xlsx':
      case 'xls':
        return <div className="w-5 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center">XL</div>;
      case 'docx':
      case 'doc':
        return <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">DOC</div>;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatStørrelse = (størrelse: string | number) => {
    if (typeof størrelse === 'string') return størrelse;
    const bytes = størrelse;
    if (bytes === 0) return `0 ${filstorrelser[0] || 'B'}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const enhetsIndex = Math.min(i, filstorrelser.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + filstorrelser[enhetsIndex];
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getFargeBadge = (farge: string) => {
    const farger = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return farger[farge as keyof typeof farger] || farger.gray;
  };

  const filteredDokumenter = dokumenter.filter(doc => {
    const matchesSearch = !filters.søk || 
      doc.navn.toLowerCase().includes(filters.søk.toLowerCase());
    
    const matchesKategori = !filters.kategori || doc.kategoriId === filters.kategori;
    const matchesStatus = !filters.status || doc.status === filters.status;
    const matchesType = !filters.type || doc.type.toLowerCase() === filters.type.toLowerCase();
    
    return matchesSearch && matchesKategori && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <DocumentSolidIcon className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Laster dokumenter...</p>
        </div>
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
              <Link to={`/elever/${elevId}`} className="mr-4 text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div className="flex items-center">
                <DocumentSolidIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dokumenter</h1>
                  <p className="text-gray-600">Oversikt over alle elevdokumenter og sertifikater</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVisLastOppModal(true)}
                className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Last opp
              </button>
              <button onClick={() => console.log('Eksporter data')} className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                Eksporter alle
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center justify-between cards-spacing-grid">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Søk etter dokumenter..."
                value={filters.søk}
                onChange={(e) => setFilters({...filters, søk: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select 
                value={filters.kategori}
                onChange={(e) => setFilters({...filters, kategori: e.target.value})}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Alle kategorier</option>
                {kategorier.map(kat => (
                  <option key={kat.id} value={kat.id}>{kat.navn}</option>
                ))}
              </select>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Alle statuser</option>
                <option value="aktiv">Aktiv</option>
                <option value="utløpt">Utløpt</option>
                <option value="ventende">Ventende</option>
                <option value="arkivert">Arkivert</option>
              </select>
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Alle typer</option>
                <option value="PDF">PDF</option>
                <option value="JPEG">Bilder</option>
                <option value="XLSX">Excel</option>
                <option value="DOCX">Word</option>
              </select>
              <div className="flex border border-gray-300 rounded">
                <button
                  onClick={() => setVisningsModus('liste')}
                  className={`px-3 py-2 text-sm ${visningsModus === 'liste' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Liste
                </button>
                <button
                  onClick={() => setVisningsModus('kort')}
                  className={`px-3 py-2 text-sm ${visningsModus === 'kort' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Kort
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {statistikk && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totale dokumenter</p>
                <p className="text-2xl font-bold text-gray-900">{statistikk.totaleDokumenter}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive dokumenter</p>
                <p className="text-2xl font-bold text-green-600">{statistikk.aktiveDokumenter}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Krever oppmerksomhet</p>
                <p className="text-2xl font-bold text-yellow-600">{statistikk.utløpteDokumenter + statistikk.ventendeDokumenter}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
            <div className="flex items-center">
              <div className="px-2 py-1 bg-purple-100 rounded-lg">
                <FolderSolidIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total størrelse</p>
                <p className="text-2xl font-bold text-purple-600">{formatStørrelse(statistikk.totalStørrelse)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dokumentliste */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {visningsModus === 'liste' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dokument
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Størrelse
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opprettet
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDokumenter.map((dokument) => (
                  <tr key={dokument.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(dokument.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {dokument.navn}
                          </div>
                          <div className="text-sm text-gray-500">{dokument.kategori}</div>
                          <div className="text-xs text-gray-400">{dokument.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFargeBadge('blue')}`}>
                        {dokument.kategori}
                      </span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dokument.status)}`}>
                        {getStatusIcon(dokument.status)}
                        {dokument.status}
                      </span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                      {formatStørrelse(dokument.størrelse)}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(dokument.lastetOpp)}</div>
                      <div className="text-xs text-gray-500">av {dokument.lastetOppAv}</div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setVisDokumentModal(dokument.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Vis dokument"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} 
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Last ned"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Del"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} 
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Slett"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Kort visning
          <div className="px-2 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
              {filteredDokumenter.map((dokument) => (
                <div key={dokument.id} className="border border-gray-200 rounded-lg px-2 py-1 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center cards-spacing-grid">
                      {getTypeIcon(dokument.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{dokument.navn}</h4>
                        <p className="text-xs text-gray-500 mt-1">Dokument</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dokument.status)}`}>
                      {getStatusIcon(dokument.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatStørrelse(dokument.størrelse)}</span>
                      <span>{formatDate(dokument.lastetOpp)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFargeBadge('blue')}`}>
                        {dokument.kategori}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setVisDokumentModal(dokument.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Vis"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => console.log('Button clicked')} 
                          className="p-1 text-green-600 hover:text-green-700"
                          title="Last ned"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredDokumenter.length === 0 && (
          <div className="p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingen dokumenter funnet</h3>
            <p className="text-gray-600 mb-4">
              {filters.søk || filters.kategori || filters.status ? 
                'Ingen dokumenter matcher dine søkekriterier.' : 
                'Eleven har ikke lastet opp noen dokumenter ennå.'
              }
            </p>
            <button 
              onClick={() => setVisLastOppModal(true)}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Last opp første dokument
            </button>
          </div>
        )}
      </div>

      {/* Last opp modal placeholder */}
      {visLastOppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
          <div className="bg-white rounded-lg max-w-md w-full px-2 py-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Last opp dokument</h3>
              <button 
                onClick={() => setVisLastOppModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="text-center py-1">
              <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Opplastingsfunksjonalitet kommer snart</p>
            </div>
          </div>
        </div>
      )}

      {/* Dokument modal placeholder */}
      {visDokumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-2 py-1 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-2 py-1 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Dokumentvisning</h3>
              <button 
                onClick={() => setVisDokumentModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="px-2 py-1 text-center">
              <DocumentArrowDownIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Dokumentvisning kommer snart</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 