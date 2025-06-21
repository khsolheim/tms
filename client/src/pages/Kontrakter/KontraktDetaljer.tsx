import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  FolderIcon,
  ClockIcon,
  PencilIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  DocumentTextIcon as DocumentTextSolidIcon,
  CurrencyDollarIcon as CurrencyDollarSolidIcon,
  FolderIcon as FolderSolidIcon,
  ClockIcon as ClockSolidIcon
} from '@heroicons/react/24/solid';

// Typer
interface Kontrakt {
  id: string;
  kontraktNummer: string;
  bedriftNavn: string;
  elevNavn: string;
  status: 'AKTIV' | 'PAUSET' | 'AVSLUTTET' | 'MISLIGHOLDT';
  startDato: string;
  sluttDato: string;
  totalBeløp: number;
  månedsbeløp: number;
  restgjeld: number;
  rente: number;
  etableringsgebyr: number;
  termingebyr: number;
  opprettet: string;
  sistOppdatert: string;
}

interface Betaling {
  id: string;
  dato: string;
  beløp: number;
  type: 'ORDINÆR' | 'EKSTRABETALING' | 'PURREGEBYR' | 'RENTER';
  status: 'BETALT' | 'FORSINKET' | 'VENTER';
  forfallsdato: string;
  betalingsmetode: string;
  referanse: string;
}

interface Dokument {
  id: string;
  navn: string;
  type: 'KONTRAKT' | 'FAKTURA' | 'KVITTERING' | 'KORRESPONDANSE';
  størrelse: string;
  opprettet: string;
  nedlastinger: number;
}

interface Historikk {
  id: string;
  dato: string;
  handling: string;
  utførtAv: string;
  beskrivelse: string;
  type: 'INFO' | 'ADVARSEL' | 'KRITISK';
}

const statusConfig = {
  AKTIV: { label: 'Aktiv', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  PAUSET: { label: 'Pauset', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
  AVSLUTTET: { label: 'Avsluttet', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon },
  MISLIGHOLDT: { label: 'Misligholdt', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
};

export default function KontraktDetaljer() {
  const { kontraktId } = useParams<{ kontraktId: string }>();
  const navigate = useNavigate();
  const [aktivTab, setAktivTab] = useState('detaljer');
  const [kontrakt, setKontrakt] = useState<Kontrakt | null>(null);
  const [betalinger, setBetalinger] = useState<Betaling[]>([]);
  const [dokumenter, setDokumenter] = useState<Dokument[]>([]);
  const [historikk, setHistorikk] = useState<Historikk[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulert data - i produksjon vil dette komme fra API
  useEffect(() => {
    setTimeout(() => {
      setKontrakt({
        id: kontraktId || '1',
        kontraktNummer: 'KTR-2025-001',
        bedriftNavn: 'Grønn Transport AS',
        elevNavn: 'Ola Nordmann',
        status: 'AKTIV',
        startDato: '2025-01-15',
        sluttDato: '2026-01-15',
        totalBeløp: 125000,
        månedsbeløp: 10416,
        restgjeld: 89583,
        rente: 8.5,
        etableringsgebyr: 2500,
        termingebyr: 150,
        opprettet: '2025-01-10T10:00:00Z',
        sistOppdatert: '2025-06-10T14:30:00Z'
      });

      setBetalinger([
        {
          id: '1',
          dato: '2025-06-01',
          beløp: 10416,
          type: 'ORDINÆR',
          status: 'BETALT',
          forfallsdato: '2025-06-01',
          betalingsmetode: 'Autogiro',
          referanse: 'AG-2025-06-001'
        },
        {
          id: '2',
          dato: '2025-07-01',
          beløp: 10416,
          type: 'ORDINÆR',
          status: 'VENTER',
          forfallsdato: '2025-07-01',
          betalingsmetode: 'Faktura',
          referanse: 'INV-2025-07-001'
        },
        {
          id: '3',
          dato: '2025-05-01',
          beløp: 10416,
          type: 'ORDINÆR',
          status: 'BETALT',
          forfallsdato: '2025-05-01',
          betalingsmetode: 'Autogiro',
          referanse: 'AG-2025-05-001'
        }
      ]);

      setDokumenter([
        {
          id: '1',
          navn: 'Opplæringskontrakt_KTR-2025-001.pdf',
          type: 'KONTRAKT',
          størrelse: '2.3 MB',
          opprettet: '2025-01-10T10:00:00Z',
          nedlastinger: 5
        },
        {
          id: '2',
          navn: 'Faktura_Juni_2025.pdf',
          type: 'FAKTURA',
          størrelse: '145 KB',
          opprettet: '2025-06-01T08:00:00Z',
          nedlastinger: 2
        },
        {
          id: '3',
          navn: 'Betalingskvittering_Mai_2025.pdf',
          type: 'KVITTERING',
          størrelse: '89 KB',
          opprettet: '2025-05-02T12:30:00Z',
          nedlastinger: 1
        }
      ]);

      setHistorikk([
        {
          id: '1',
          dato: '2025-06-10T14:30:00Z',
          handling: 'Kontrakt oppdatert',
          utførtAv: 'Admin Bruker',
          beskrivelse: 'Endret betalingsmetode til autogiro',
          type: 'INFO'
        },
        {
          id: '2',
          dato: '2025-06-01T08:00:00Z',
          handling: 'Betaling mottatt',
          utførtAv: 'System',
          beskrivelse: 'Autogiro-betaling på kr 10 416 mottatt',
          type: 'INFO'
        },
        {
          id: '3',
          dato: '2025-01-15T10:00:00Z',
          handling: 'Kontrakt aktivert',
          utførtAv: 'Saksbehandler',
          beskrivelse: 'Opplæringskontrakt signert og aktivert',
          type: 'INFO'
        }
      ]);

      setLoading(false);
    }, 500);
  }, [kontraktId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: Kontrakt['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getBetalingStatusBadge = (status: Betaling['status']) => {
    const configs = {
      BETALT: 'bg-green-100 text-green-800',
      FORSINKET: 'bg-red-100 text-red-800',
      VENTER: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${configs[status]}`}>
        {status === 'BETALT' ? 'Betalt' : status === 'FORSINKET' ? 'Forsinket' : 'Venter'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!kontrakt) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Kontrakt ikke funnet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Kontrakten du leter etter eksisterer ikke eller er slettet.
        </p>
      </div>
    );
  }

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center cards-spacing-grid">
              <button
                onClick={() => navigate('/kontrakter')}
                className="text-gray-400 hover:text-gray-600"
              >
                ← Tilbake til kontrakter
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Kontrakt {kontrakt.kontraktNummer}
            </h1>
            <div className="flex items-center cards-spacing-grid mt-2">
              <span className="text-gray-600">{kontrakt.bedriftNavn} → {kontrakt.elevNavn}</span>
              {getStatusBadge(kontrakt.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <PrinterIcon className="w-4 h-4" />
              Skriv ut
            </button>
            <button onClick={() => console.log('Eksporter data')} className="inline-flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Eksporter
            </button>
            <button onClick={() => console.log('Rediger')} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              <PencilIcon className="w-4 h-4" />
              Rediger
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-2" aria-label="Tabs">
            {[
              { id: 'detaljer', navn: 'Detaljer', ikon: DocumentTextIcon, activeIcon: DocumentTextSolidIcon },
              { id: 'betalinger', navn: 'Betalinger', ikon: CurrencyDollarIcon, activeIcon: CurrencyDollarSolidIcon },
              { id: 'dokumenter', navn: 'Dokumenter', ikon: FolderIcon, activeIcon: FolderSolidIcon },
              { id: 'historikk', navn: 'Historikk', ikon: ClockIcon, activeIcon: ClockSolidIcon }
            ].map((tab) => {
              const Icon = aktivTab === tab.id ? tab.activeIcon : tab.ikon;
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
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-2 py-1">
          {aktivTab === 'detaljer' && (
            <div className="cards-spacing-vertical">
              {/* Kontraktinformasjon */}
              <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
                <div className="cards-spacing-vertical">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontraktinformasjon</h3>
                    <div className="space-y-8">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kontraktnummer:</span>
                        <span className="font-medium">{kontrakt.kontraktNummer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(kontrakt.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Startdato:</span>
                        <span className="font-medium">{formatDate(kontrakt.startDato)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sluttdato:</span>
                        <span className="font-medium">{formatDate(kontrakt.sluttDato)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Opprettet:</span>
                        <span className="font-medium">{formatDate(kontrakt.opprettet)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Parter</h3>
                    <div className="space-y-8">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bedrift:</span>
                        <span className="font-medium">{kontrakt.bedriftNavn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Elev:</span>
                        <span className="font-medium">{kontrakt.elevNavn}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cards-spacing-vertical">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Økonomi</h3>
                    <div className="space-y-8">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Totalbeløp:</span>
                        <span className="font-medium text-lg">{formatCurrency(kontrakt.totalBeløp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Månedsbeløp:</span>
                        <span className="font-medium">{formatCurrency(kontrakt.månedsbeløp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Restgjeld:</span>
                        <span className="font-medium text-orange-600">{formatCurrency(kontrakt.restgjeld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rente:</span>
                        <span className="font-medium">{kontrakt.rente}% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Etableringsgebyr:</span>
                        <span className="font-medium">{formatCurrency(kontrakt.etableringsgebyr)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Termingebyr:</span>
                        <span className="font-medium">{formatCurrency(kontrakt.termingebyr)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fremdrift</h3>
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Betalt av totalbeløp</span>
                          <span>{Math.round(((kontrakt.totalBeløp - kontrakt.restgjeld) / kontrakt.totalBeløp) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((kontrakt.totalBeløp - kontrakt.restgjeld) / kontrakt.totalBeløp) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(kontrakt.totalBeløp - kontrakt.restgjeld)} av {formatCurrency(kontrakt.totalBeløp)} betalt
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aktivTab === 'betalinger' && (
            <div className="cards-spacing-vertical">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Betalingsoversikt</h3>
                <button onClick={() => console.log('Button clicked')} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4" />
                  Registrer betaling
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dato
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beløp
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forfall
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referanse
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {betalinger.map((betaling) => (
                      <tr key={betaling.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(betaling.dato)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(betaling.beløp)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                          {betaling.type}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {getBetalingStatusBadge(betaling.status)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(betaling.forfallsdato)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                          {betaling.referanse}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => console.log('Button clicked')} className="text-blue-600 hover:text-blue-900 mr-2">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => console.log('Button clicked')} className="text-gray-400 hover:text-gray-600">
                            <PrinterIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {aktivTab === 'dokumenter' && (
            <div className="cards-spacing-vertical">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Dokumenter</h3>
                <button onClick={() => console.log('Last opp fil')} className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4" />
                  Last opp dokument
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                {dokumenter.map((dokument) => (
                  <div key={dokument.id} className="border border-gray-200 rounded-lg px-2 py-1 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {dokument.navn}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {dokument.type} • {dokument.størrelse}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Opprettet {formatDate(dokument.opprettet)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {dokument.nedlastinger} nedlastinger
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => console.log('Vis dokument')} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="w-3 h-3" />
                        Vis
                      </button>
                      <button onClick={() => console.log('Last ned dokument')} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <ArrowDownTrayIcon className="w-3 h-3" />
                        Last ned
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aktivTab === 'historikk' && (
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900">Kontrakthistorikk</h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {historikk.map((hendelse, hendelsesIndex) => (
                    <li key={hendelse.id}>
                      <div className="relative pb-8">
                        {hendelsesIndex !== historikk.length - 1 ? (
                          <span className="absolute topx-2 py-1 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              hendelse.type === 'KRITISK' ? 'bg-red-500' : 
                              hendelse.type === 'ADVARSEL' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>
                              <ClockIcon className="h-4 w-4 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{hendelse.handling}</span> av {hendelse.utførtAv}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{hendelse.beskrivelse}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(hendelse.dato)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}