import React, { useState, useEffect } from 'react';
import { 
  elevKommunikasjonsService, 
  type Melding as ServiceMelding,
  type KommunikasjonsStatistikk as ServiceStatistikk
} from '../../services/elev-kommunikasjon.service';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  VideoCameraIcon,
  DocumentArrowDownIcon,
  EllipsisVerticalIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  CheckCircleIcon as CheckSolidIcon
} from '@heroicons/react/24/solid';

interface Melding {
  id: string;
  elevId?: string;
  elevNavn?: string;
  emne?: string;
  innhold: string;
  type: 'melding' | 'spørsmål' | 'klage' | 'forespørsel' | 'oppgave' | 'vedlegg' | 'varsel' | 'tekst';
  prioritet: 'lav' | 'normal' | 'høy' | 'kritisk';
  status: 'ulest' | 'lest' | 'besvart';
  dato: string;
  vedlegg?: Array<{navn: string; type: string; størrelse: string}> | string[];
  avsender?: {id: string; navn: string; rolle: string};
  mottaker?: {id: string; navn: string; rolle: string};
  emoji?: string;
  tråd?: string;
  svar?: {
    innhold: string;
    dato: string;
    ansatt: string;
  };
}

interface KommunikasjonsStatistikk {
  totaltMeldinger: number;
  uleste: number;
  besvarte: number;
  gjennomsnittligSvartid: string;
  aktivitetsNivå?: 'lav' | 'normal' | 'høy';
}

interface ElevKommunikasjonsProps {
  elevId: string;
}

export default function ElevKommunikasjon({ elevId }: ElevKommunikasjonsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'alle' | 'uleste' | 'viktige' | 'oppgaver'>('alle');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('alle');
  const [selectedStatus, setSelectedStatus] = useState<string>('alle');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'lav' | 'normal' | 'høy' | 'kritisk'>('normal');
  const [meldinger, setMeldinger] = useState<Melding[]>([]);
  const [statistikk, setStatistikk] = useState<KommunikasjonsStatistikk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lastData();
  }, [elevId]);

  const lastData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [meldingerData, statistikkData] = await Promise.all([
        elevKommunikasjonsService.hentMeldinger({ elevId }),
        elevKommunikasjonsService.hentKommunikasjonsStatistikk()
      ]);
      
      setMeldinger(meldingerData as unknown as Melding[]);
      setStatistikk(statistikkData);
    } catch (err) {
      setError('Kunne ikke laste kommunikasjonsdata');
      console.error('Feil ved lasting av data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for utvikling
  const fallbackMeldinger: Melding[] = [
    {
      id: '1',
      elevId: elevId,
      elevNavn: 'Ola Nordmann',
      innhold: 'Hei Ola! Bra jobbet på dagens kjøretime. Du gjør store fremskritt, spesielt med rygging og parkering. For neste time kan vi fokusere på motorveikjøring. Husk å ta med deg ID og førerkorttillatelse!',
      type: 'melding',
      prioritet: 'normal',
      status: 'lest',
      dato: '2024-06-15T14:30:00Z'
    },
    {
      id: '2',
      elevId: elevId,
      elevNavn: 'Ola Nordmann',
      innhold: 'Tusen takk for tilbakemeldingen! Gleder meg til neste time. Er det mulig å øke på noen ekstra timer før prøven? Føler meg tryggere for hver gang.',
      type: 'spørsmål',
      prioritet: 'normal',
      status: 'lest',
      dato: '2024-06-15T15:45:00Z'
    },
    {
      id: '3',
      avsender: { id: '1', navn: 'Kari Hansen', rolle: 'instruktør' },
      mottaker: { id: elevId, navn: 'Ola Nordmann', rolle: 'elev' },
      innhold: 'Absolutt! Jeg har ledig tid tirsdag 18. juni kl. 16:00. Skal jeg booke det?',
      type: 'oppgave',
      prioritet: 'høy',
      status: 'ulest',
      dato: '2024-06-15T16:12:00Z',
      tråd: '1'
    },
    {
      id: '4',
      avsender: { id: 'admin', navn: 'TMS System', rolle: 'admin' },
      mottaker: { id: elevId, navn: 'Ola Nordmann', rolle: 'elev' },
      innhold: 'Din månedlige fremgangsrapport er klar for gjennomgang. Du kan laste den ned her.',
      type: 'vedlegg',
      prioritet: 'normal',
      status: 'ulest',
      dato: '2024-06-14T09:00:00Z',
      vedlegg: [
        { navn: 'fremgangsrapport_juni_2024.pdf', type: 'PDF', størrelse: '2.3 MB' }
      ]
    },
    {
      id: '5',
      avsender: { id: '1', navn: 'Kari Hansen', rolle: 'instruktør' },
      mottaker: { id: elevId, navn: 'Ola Nordmann', rolle: 'elev' },
      innhold: 'VIKTIG: Prøvetidspunkt er bekreftet for fredag 21. juni kl. 10:00. Møt opp 15 min før ved trafikklærerens kontor. Ring meg hvis du har spørsmål!',
      type: 'varsel',
      prioritet: 'kritisk',
      status: 'ulest',
      dato: '2024-06-13T12:30:00Z',
      emoji: '⚠️'
    },
    {
      id: '6',
      avsender: { id: elevId, navn: 'Ola Nordmann', rolle: 'elev' },
      mottaker: { id: '1', navn: 'Kari Hansen', rolle: 'instruktør' },
      innhold: 'Hei! Har problemer med å forstå forskjellen på vikeplikt ved rundkjøring vs T-kryss. Kan vi gå gjennom dette på neste time?',
      type: 'tekst',
      prioritet: 'normal',
      status: 'besvart',
      dato: '2024-06-12T19:20:00Z'
    },
    {
      id: '7',
      avsender: { id: '1', navn: 'Kari Hansen', rolle: 'instruktør' },
      mottaker: { id: elevId, navn: 'Ola Nordmann', rolle: 'elev' },
      innhold: 'Selvsagt! Vikeplikt kan være forvirrende. Rundkjøring: du skal vike for de som allerede er inne. T-kryss: vike for hovedvei. Vi tar grundig gjennomgang neste gang.',
      type: 'tekst',
      prioritet: 'normal',
      status: 'lest',
      dato: '2024-06-12T20:15:00Z',
      tråd: '6',
      emoji: '📚'
    }
  ];

  const filteredMeldinger = meldinger.filter(melding => {
    const matchesSearch = melding.innhold.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         melding.avsender?.navn.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'uleste':
        matchesFilter = melding.status === 'ulest';
        break;
      case 'viktige':
        matchesFilter = melding.prioritet === 'høy' || melding.prioritet === 'kritisk';
        break;
      case 'oppgaver':
        matchesFilter = melding.type === 'oppgave';
        break;
    }

    let matchesType = selectedType === 'alle' || melding.type === selectedType;
    let matchesStatus = selectedStatus === 'alle' || melding.status === selectedStatus;

    return matchesSearch && matchesFilter && matchesType && matchesStatus;
  });

  const getMessageIcon = (type: string, prioritet: string) => {
    if (prioritet === 'kritisk') return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    
    switch (type) {
      case 'oppgave':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'vedlegg':
        return <DocumentArrowDownIcon className="h-5 w-5 text-green-500" />;
      case 'varsel':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ulest':
        return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Ulest</span>;
      case 'lest':
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Lest</span>;
      case 'besvart':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Besvart</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Sendt</span>;
    }
  };

  const getPriorityColor = (prioritet: string) => {
    switch (prioritet) {
      case 'kritisk':
        return 'border-l-red-500';
      case 'høy':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 dager
      return date.toLocaleDateString('nb-NO', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Her ville vi normalt sende meldingen til API
      console.log('Sender melding:', {
        innhold: newMessage,
        prioritet: selectedPriority,
        mottaker: 'instruktør'
      });
      setNewMessage('');
      setShowNewMessage(false);
    }
  };

  return (
    <div className="cards-spacing-vertical">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
        <div className="bg-white px-2 py-1 rounded-lg shadow border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <ChatSolidIcon className="h-12 w-12 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{statistikk?.totaltMeldinger || 0}</p>
              <p className="text-gray-600 text-sm">Totalt meldinger</p>
            </div>
          </div>
        </div>

        <div className="bg-white px-2 py-1 rounded-lg shadow border-l-4 border-l-orange-500">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-12 w-12 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{statistikk?.uleste || 0}</p>
              <p className="text-gray-600 text-sm">Uleste meldinger</p>
            </div>
          </div>
        </div>

        <div className="bg-white px-2 py-1 rounded-lg shadow border-l-4 border-l-green-500">
          <div className="flex items-center">
            <CheckSolidIcon className="h-12 w-12 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{statistikk?.besvarte || 0}</p>
              <p className="text-gray-600 text-sm">Besvarte meldinger</p>
            </div>
          </div>
        </div>

        <div className="bg-white px-2 py-1 rounded-lg shadow border-l-4 border-l-purple-500">
          <div className="flex items-center">
            <ClockIcon className="h-12 w-12 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{statistikk?.gjennomsnittligSvartid}t</p>
              <p className="text-gray-600 text-sm">Snitt svartid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white px-2 py-1 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row cards-spacing-grid justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row cards-spacing-grid flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Søk i meldinger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-4">
              {[
                { id: 'alle', name: 'Alle', count: meldinger.length },
                { id: 'uleste', name: 'Uleste', count: meldinger.filter(m => m.status === 'ulest').length },
                { id: 'viktige', name: 'Viktige', count: meldinger.filter(m => m.prioritet === 'høy' || m.prioritet === 'kritisk').length },
                { id: 'oppgaver', name: 'Oppgaver', count: meldinger.filter(m => m.type === 'oppgave').length }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {filter.name} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filtrer
            </button>
            <button
              onClick={() => setShowNewMessage(true)}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Ny melding
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="alle">Alle typer</option>
                  <option value="tekst">Tekstmeldinger</option>
                  <option value="oppgave">Oppgaver</option>
                  <option value="vedlegg">Vedlegg</option>
                  <option value="varsel">Varsler</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="alle">Alle statuser</option>
                  <option value="ulest">Uleste</option>
                  <option value="lest">Leste</option>
                  <option value="besvart">Besvarte</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 py-1 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Meldingshistorikk ({filteredMeldinger.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredMeldinger.length === 0 ? (
            <div className="p-12 text-center">
              <ChatBubbleLeftRightIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen meldinger funnet</h3>
              <p className="text-gray-600">Prøv å justere søket eller filtrene dine.</p>
            </div>
          ) : (
            filteredMeldinger.map((melding) => (
              <div key={melding.id} className={`p-6 border-l-4 ${getPriorityColor(melding.prioritet)} hover:bg-gray-50 transition-colors`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getMessageIcon(melding.type, melding.prioritet)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {melding.avsender?.navn}
                          </span>
                          <span className="text-sm text-gray-500">→</span>
                          <span className="text-sm text-gray-600">
                            {melding.mottaker?.navn}
                          </span>
                          {melding.emoji && (
                            <span className="text-lg">{melding.emoji}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(melding.status)}
                          <span className="text-sm text-gray-500">
                            {formatDate(melding.dato)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-900 mb-3">{melding.innhold}</p>
                      
                      {melding.vedlegg && melding.vedlegg.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {melding.vedlegg.map((vedlegg, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                              <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">
                                {typeof vedlegg === 'string' ? vedlegg : vedlegg.navn}
                              </span>
                              {typeof vedlegg !== 'string' && (
                                <span className="text-xs text-gray-500">({vedlegg.størrelse})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Type: {melding.type}</span>
                          <span>Prioritet: {melding.prioritet}</span>
                          {melding.tråd && (
                            <span>Del av tråd</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button onClick={() => console.log('Button clicked')} className="p-1 text-gray-400 hover:text-gray-600">
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto px-2 py-1 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ny melding til instruktør</h3>
              <button
                onClick={() => setShowNewMessage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Lukk</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioritet</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lav">Lav prioritet</option>
                <option value="normal">Normal prioritet</option>
                <option value="høy">Høy prioritet</option>
                <option value="kritisk">Kritisk prioritet</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Melding</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={6}
                placeholder="Skriv din melding her..."
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewMessage(false)}
                className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Avbryt
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                Send melding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white px-2 py-1 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hurtighandlinger</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
          <button onClick={() => console.log('Button clicked')} className="flex items-center justify-center px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <PhoneIcon className="h-8 w-8 text-gray-400 mr-3" />
            <span className="text-gray-600">Ring instruktør</span>
          </button>
          <button onClick={() => console.log('Button clicked')} className="flex items-center justify-center px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <VideoCameraIcon className="h-8 w-8 text-gray-400 mr-3" />
            <span className="text-gray-600">Videomøte</span>
          </button>
          <button onClick={() => console.log('Button clicked')} className="flex items-center justify-center px-2 py-1 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <CalendarDaysIcon className="h-8 w-8 text-gray-400 mr-3" />
            <span className="text-gray-600">Book time</span>
          </button>
        </div>
      </div>
    </div>
  );
} 