import React, { useState, useEffect } from 'react';
import {
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  AdjustmentsHorizontalIcon as AdjustmentsHorizontalSolidIcon
} from '@heroicons/react/24/solid';
import { referenceService } from '../../../services/reference.service';

// Typer
interface SidebarItem {
  id: string;
  navn: string;
  sti: string;
  ikon: string;
  gruppe: string;
  beskrivelse: string;
  aktivt: boolean;
  sortering: number;
}

interface RolleTilgang {
  rolle: string;
  sidebarelementer: string[];
}

interface SidebarKonfigurasjon {
  id: string;
  navn: string;
  beskrivelse: string;
  rolleTilganger: RolleTilgang[];
  aktivt: boolean;
  opprettet: string;
  sistOppdatert: string;
}

const sidebarElementer: SidebarItem[] = [
  // Dashboard & Oversikt
  { id: 'oversikt', navn: 'Oversikt', sti: '/oversikt', ikon: 'HomeIcon', gruppe: 'Dashboard & Oversikt', beskrivelse: 'Hovedoversikt og dashboard', aktivt: true, sortering: 1 },
  { id: 'oppgaver', navn: 'Oppgaver', sti: '/oppgaver', ikon: 'ClipboardDocumentListIcon', gruppe: 'Dashboard & Oversikt', beskrivelse: 'Oppgavestyring og tildeling', aktivt: true, sortering: 2 },
  { id: 'kalender', navn: 'Kalender', sti: '/kalender', ikon: 'CalendarDaysIcon', gruppe: 'Dashboard & Oversikt', beskrivelse: 'Kalendersystem og timeplanlegging', aktivt: true, sortering: 3 },
  
  // Business Moduler
  { id: 'bedrifter', navn: 'Bedriftshåndtering', sti: '/bedrifter', ikon: 'BuildingOfficeIcon', gruppe: 'Business Moduler', beskrivelse: 'Administrasjon av bedrifter og kunder', aktivt: true, sortering: 4 },
  { id: 'hr', navn: 'HR', sti: '/hr', ikon: 'UserGroupIcon', gruppe: 'Business Moduler', beskrivelse: 'Human Resources og personaladministrasjon', aktivt: true, sortering: 5 },
  { id: 'okonomi', navn: 'Økonomi', sti: '/okonomi', ikon: 'CurrencyDollarIcon', gruppe: 'Business Moduler', beskrivelse: 'Økonomistyring og fakturering', aktivt: true, sortering: 6 },
  { id: 'kontrakter', navn: 'Kontrakter', sti: '/kontrakter', ikon: 'DocumentTextIcon', gruppe: 'Business Moduler', beskrivelse: 'Kontrakthåndtering og avtaler', aktivt: true, sortering: 7 },
  
  // Operasjoner
  { id: 'ressursplanlegging', navn: 'Ressursplanlegging', sti: '/ressursplanlegging', ikon: 'TruckIcon', gruppe: 'Operasjoner', beskrivelse: 'Kjøretøy og ressursplanlegging', aktivt: true, sortering: 8 },
  { id: 'prosjekt', navn: 'Prosjekt', sti: '/prosjekt', ikon: 'ClipboardDocumentListIcon', gruppe: 'Operasjoner', beskrivelse: 'Prosjektstyring og oppfølging', aktivt: true, sortering: 9 },
  { id: 'sikkerhetskontroll', navn: 'Sikkerhetskontroll', sti: '/sikkerhetskontroll', ikon: 'ShieldCheckIcon', gruppe: 'Operasjoner', beskrivelse: 'Sikkerhetskontroller og dokumentasjon', aktivt: true, sortering: 10 },
  
  // Utdanning
  { id: 'quiz', navn: 'Quiz', sti: '/quiz', ikon: 'BookOpenIcon', gruppe: 'Utdanning', beskrivelse: 'Quiz og kunnskapstester', aktivt: true, sortering: 11 },
  { id: 'sikkerhetskontroll-laering', navn: 'Sikkerhetskontroll Læring', sti: '/sikkerhetskontroll-laering', ikon: 'AcademicCapIcon', gruppe: 'Utdanning', beskrivelse: 'Interaktiv sikkerhetskontroll læring for elever', aktivt: true, sortering: 12 },
  { id: 'elever', navn: 'Elever', sti: '/elever', ikon: 'AcademicCapIcon', gruppe: 'Utdanning', beskrivelse: 'Elevadministrasjon og oppfølging', aktivt: true, sortering: 13 },
  
  // Rapporter & Analyse
  { id: 'rapportering', navn: 'Rapportering', sti: '/rapportering', ikon: 'ChartBarIcon', gruppe: 'Rapporter & Analyse', beskrivelse: 'Rapporter og business intelligence', aktivt: true, sortering: 14 },
  
  // Kommunikasjon
  { id: 'nyheter', navn: 'Nyheter', sti: '/nyheter', ikon: 'SpeakerWaveIcon', gruppe: 'Kommunikasjon', beskrivelse: 'Nyhetssystem og kommunikasjon', aktivt: true, sortering: 15 },
  
  // System
  { id: 'innstillinger', navn: 'Innstillinger', sti: '/innstillinger', ikon: 'Cog6ToothIcon', gruppe: 'System', beskrivelse: 'Systeminnstillinger og konfigurasjon', aktivt: true, sortering: 16 },
  { id: 'brukere', navn: 'Brukere', sti: '/brukere', ikon: 'UsersIcon', gruppe: 'System', beskrivelse: 'Brukeradministrasjon (kun admin)', aktivt: true, sortering: 17 },
  { id: 'hjelp', navn: 'Hjelp', sti: '/hjelp', ikon: 'QuestionMarkCircleIcon', gruppe: 'System', beskrivelse: 'Hjelpesystem og dokumentasjon', aktivt: true, sortering: 18 }
];

// Flyttet til state for å hente fra API

export default function SidebarAdmin() {
  const [konfigurasjoner, setKonfigurasjoner] = useState<SidebarKonfigurasjon[]>([]);
  const [valgtKonfigurasjon, setValgtKonfigurasjon] = useState<string | null>(null);
  const [visOpprettModal, setVisOpprettModal] = useState(false);
  const [redigerKonfigurasjon, setRedigerKonfigurasjon] = useState<Partial<SidebarKonfigurasjon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [aktivTab, setAktivTab] = useState('oversikt');
  const [standardRoller, setStandardRoller] = useState<string[]>(['ADMIN', 'HOVEDBRUKER', 'TRAFIKKLARER', 'ELEV', 'BEDRIFT']); // Fallback

  // Hent data fra API
  useEffect(() => {
    const hentData = async () => {
      try {
        // Hent roller fra API
        const roller = await referenceService.getSystemRoller();
        setStandardRoller(roller);

        // Simulert data - i produksjon vil dette komme fra API
        setTimeout(() => {
          setKonfigurasjoner([
            {
              id: 'standard',
              navn: 'Standard Konfigurasjon',
              beskrivelse: 'Standard sidebar-konfigurasjon for alle roller',
              aktivt: true,
              opprettet: '2025-06-15T10:00:00Z',
              sistOppdatert: '2025-06-15T10:00:00Z',
              rolleTilganger: [
                {
                  rolle: 'ADMIN',
                  sidebarelementer: sidebarElementer.map(e => e.id)
                },
                {
                  rolle: 'HOVEDBRUKER',
                  sidebarelementer: ['oversikt', 'oppgaver', 'kalender', 'bedrifter', 'hr', 'okonomi', 'kontrakter', 'ressursplanlegging', 'prosjekt', 'sikkerhetskontroll', 'quiz', 'sikkerhetskontroll-laering', 'elever', 'rapportering', 'nyheter', 'innstillinger', 'hjelp']
                },
                {
                  rolle: 'TRAFIKKLARER',
                  sidebarelementer: ['oversikt', 'oppgaver', 'kalender', 'kontrakter', 'prosjekt', 'sikkerhetskontroll', 'quiz', 'sikkerhetskontroll-laering', 'nyheter', 'hjelp']
                },
                {
                  rolle: 'ELEV',
                  sidebarelementer: ['oversikt', 'quiz', 'sikkerhetskontroll-laering', 'hjelp']
                },
                {
                  rolle: 'BEDRIFT',
                  sidebarelementer: ['oversikt', 'kontrakter', 'hjelp']
                }
              ]
            }
          ]);
          setValgtKonfigurasjon('standard');
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Feil ved henting av roller:', error);
        // Beholder fallback-verdier ved feil
        setLoading(false);
      }
    };

    hentData();
  }, []);

  const handleLagreKonfigurasjon = () => {
    // Her vil vi implementere API-kall for å lagre konfigurasjonen
    console.log('Lagrer konfigurasjon:', redigerKonfigurasjon);
    setRedigerKonfigurasjon(null);
    setVisOpprettModal(false);
  };

  const toggleElementForRolle = (konfigId: string, rolle: string, elementId: string) => {
    setKonfigurasjoner(prev => 
      prev.map(config => {
        if (config.id === konfigId) {
          return {
            ...config,
            rolleTilganger: config.rolleTilganger.map(rt => {
              if (rt.rolle === rolle) {
                const harTilgang = rt.sidebarelementer.includes(elementId);
                return {
                  ...rt,
                  sidebarelementer: harTilgang
                    ? rt.sidebarelementer.filter(id => id !== elementId)
                    : [...rt.sidebarelementer, elementId]
                };
              }
              return rt;
            })
          };
        }
        return config;
      })
    );
  };

  const getRolleElementer = (konfigId: string, rolle: string): string[] => {
    const config = konfigurasjoner.find(k => k.id === konfigId);
    const rolleTilgang = config?.rolleTilganger.find(rt => rt.rolle === rolle);
    return rolleTilgang?.sidebarelementer || [];
  };

  const grupperteElementer = sidebarElementer.reduce((grupper, element) => {
    if (!grupper[element.gruppe]) {
      grupper[element.gruppe] = [];
    }
    grupper[element.gruppe].push(element);
    return grupper;
  }, {} as Record<string, SidebarItem[]>);

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1">
        <div className="flex items-center cards-spacing-grid">
          <div className="px-2 py-1 bg-blue-100 rounded-xl">
            <AdjustmentsHorizontalSolidIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sidebar Administrasjon</h1>
            <p className="text-gray-600 mt-1">
              Konfigurer hvilke sider som vises i sidebaren for forskjellige roller
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-2" aria-label="Tabs">
            {[
              { id: 'oversikt', navn: 'Oversikt', ikon: AdjustmentsHorizontalIcon },
              { id: 'konfigurer', navn: 'Konfigurer Roller', ikon: UserGroupIcon },
              { id: 'forhåndsvisning', navn: 'Forhåndsvisning', ikon: EyeIcon }
            ].map((tab) => {
              const Icon = tab.ikon;
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
          {aktivTab === 'oversikt' && (
            <div className="cards-spacing-vertical">
              {/* Statistikk Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
                <div className="bg-blue-50 rounded-lg px-2 py-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Konfigurasjoner</p>
                      <p className="text-2xl font-bold text-gray-900">{konfigurasjoner.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg px-2 py-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktive Elementer</p>
                      <p className="text-2xl font-bold text-gray-900">{sidebarElementer.filter(e => e.aktivt).length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg px-2 py-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserGroupIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Roller</p>
                      <p className="text-2xl font-bold text-gray-900">{standardRoller.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg px-2 py-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AdjustmentsHorizontalIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Grupper</p>
                      <p className="text-2xl font-bold text-gray-900">{Object.keys(grupperteElementer).length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Elementer Oversikt */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sidebar Elementer</h3>
                <div className="cards-spacing-vertical">
                  {Object.entries(grupperteElementer).map(([gruppe, elementer]) => (
                    <div key={gruppe} className="border border-gray-200 rounded-lg px-2 py-1">
                      <h4 className="font-medium text-gray-900 mb-3">{gruppe}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                        {elementer.map((element) => (
                          <div
                            key={element.id}
                            className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center cards-spacing-grid">
                              <div className="text-sm font-medium text-gray-900">
                                {element.navn}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {element.aktivt ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-red-500" />
                              )}
                              <span className="text-xs text-gray-500">{element.sti}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {aktivTab === 'konfigurer' && valgtKonfigurasjon && (
            <div className="cards-spacing-vertical">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rollekonfigurasjon
                </h3>
                <button
                  onClick={() => setVisOpprettModal(true)}
                  className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Ny Konfigurasjon
                </button>
              </div>

              {/* Rolle Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Rolle tabs">
                  {standardRoller.map((rolle) => (
                    <button onClick={() => console.log('Button clicked')}
                      key={rolle}
                      className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    >
                      {rolle}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Konfigurasjonstabell */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sidebar Element
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gruppe
                      </th>
                      {standardRoller.map(rolle => (
                        <th key={rolle} className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {rolle}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sidebarElementer.map((element) => (
                      <tr key={element.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {element.navn}
                              </div>
                              <div className="text-sm text-gray-500">
                                {element.beskrivelse}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                          {element.gruppe}
                        </td>
                        {standardRoller.map(rolle => {
                          const harTilgang = getRolleElementer(valgtKonfigurasjon, rolle).includes(element.id);
                          return (
                            <td key={rolle} className="px-2 py-1 whitespace-nowrap text-center">
                              <button
                                onClick={() => toggleElementForRolle(valgtKonfigurasjon, rolle, element.id)}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                  harTilgang
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {harTilgang ? (
                                  <CheckCircleIcon className="w-5 h-5" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lagre knapp */}
              <div className="flex justify-end">
                <button
                  onClick={handleLagreKonfigurasjon}
                  className="px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Lagre Endringer
                </button>
              </div>
            </div>
          )}

          {aktivTab === 'forhåndsvisning' && (
            <div className="cards-spacing-vertical">
              <h3 className="text-lg font-semibold text-gray-900">
                Forhåndsvisning av Sidebar
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
                {standardRoller.slice(0, 4).map(rolle => {
                  const rolleElementer = getRolleElementer(valgtKonfigurasjon || 'standard', rolle);
                  return (
                    <div key={rolle} className="border border-gray-200 rounded-lg px-2 py-1">
                      <h4 className="font-medium text-gray-900 mb-3">{rolle}</h4>
                      <div className="bg-gray-50 rounded-lg px-2 py-1 max-h-96 overflow-y-auto">
                        <div className="space-y-6">
                          {Object.entries(grupperteElementer).map(([gruppe, elementer]) => {
                            const gruppeElementer = elementer.filter(e => rolleElementer.includes(e.id));
                            if (gruppeElementer.length === 0) return null;
                            
                            return (
                              <div key={gruppe}>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  {gruppe}
                                </div>
                                <div className="ml-2 space-y-1">
                                  {gruppeElementer.map(element => (
                                    <div key={element.id} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 bg-white rounded">
                                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                      {element.navn}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}