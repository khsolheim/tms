import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  BookOpenIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  PlusIcon as PlusSolid,
  BookOpenIcon as BookSolid
} from '@heroicons/react/24/solid';

interface Sporsmal {
  id: string;
  tekst: string;
  kategori: string;
  vanskelighetsgrad: 'lett' | 'medium' | 'vanskelig';
  type: 'multiple_choice' | 'sant_usant' | 'fyllfinn';
  alternativer: string[];
  riktigSvar: string | number;
  forklaring: string;
  bilde?: string;
  opprettetAv: string;
  opprettetDato: string;
  sistEndret: string;
  status: 'aktiv' | 'utkast' | 'arkivert';
  antallBruk: number;
  gjennomsnittScore: number;
}

interface Kategori {
  id: string;
  navn: string;
  beskrivelse: string;
  farge: string;
  antallSporsmal: number;
  sistOppdatert: string;
}

export default function AdminQuizForslag1_SporsmalStyring() {
  const [sporsmal, setSporsmal] = useState<Sporsmal[]>([
    {
      id: '1',
      tekst: 'Hva betyr et rødt trafikkly?',
      kategori: 'Trafikkregler',
      vanskelighetsgrad: 'lett',
      type: 'multiple_choice',
      alternativer: ['Stopp', 'Vent', 'Kjør forsiktig', 'Blås i hornet'],
      riktigSvar: 0,
      forklaring: 'Rødt lys betyr at all trafikk må stoppe før krysset.',
      opprettetAv: 'Admin',
      opprettetDato: '2024-01-15',
      sistEndret: '2024-01-15',
      status: 'aktiv',
      antallBruk: 245,
      gjennomsnittScore: 95
    },
    {
      id: '2',
      tekst: 'Hva er fartsgrensen i tettbebygd strøk?',
      kategori: 'Fartsgrenser',
      vanskelighetsgrad: 'medium',
      type: 'multiple_choice',
      alternativer: ['30 km/t', '50 km/t', '60 km/t', '80 km/t'],
      riktigSvar: 1,
      forklaring: 'Fartsgrensen i tettbebygd strøk er 50 km/t med mindre annet er skiltert.',
      opprettetAv: 'Lærer Hansen',
      opprettetDato: '2024-01-10',
      sistEndret: '2024-01-12',
      status: 'aktiv',
      antallBruk: 189,
      gjennomsnittScore: 78
    },
    {
      id: '3',
      tekst: 'Det er lov å kjøre med mobiltelefon i hånden under kjøring.',
      kategori: 'Sikkerhet',
      vanskelighetsgrad: 'lett',
      type: 'sant_usant',
      alternativer: ['Sant', 'Usant'],
      riktigSvar: 1,
      forklaring: 'Det er forbudt å bruke mobiltelefon i hånden under kjøring.',
      opprettetAv: 'Admin',
      opprettetDato: '2024-01-08',
      sistEndret: '2024-01-08',
      status: 'aktiv',
      antallBruk: 167,
      gjennomsnittScore: 92
    }
  ]);

  const [kategorier, setKategorier] = useState<Kategori[]>([
    {
      id: '1',
      navn: 'Trafikkregler',
      beskrivelse: 'Grunnleggende trafikkregler og signaler',
      farge: 'blue',
      antallSporsmal: 45,
      sistOppdatert: '2024-01-15'
    },
    {
      id: '2',
      navn: 'Fartsgrenser',
      beskrivelse: 'Fartsgrenser i ulike områder',
      farge: 'red',
      antallSporsmal: 23,
      sistOppdatert: '2024-01-12'
    },
    {
      id: '3',
      navn: 'Sikkerhet',
      beskrivelse: 'Sikkerhet og forsiktighetsregler',
      farge: 'green',
      antallSporsmal: 38,
      sistOppdatert: '2024-01-10'
    },
    {
      id: '4',
      navn: 'Skilting',
      beskrivelse: 'Vegskilt og markeringer',
      farge: 'yellow',
      antallSporsmal: 29,
      sistOppdatert: '2024-01-08'
    }
  ]);

  const [visNyttSporsmalModal, setVisNyttSporsmalModal] = useState(false);
  const [visKategoriModal, setVisKategoriModal] = useState(false);
  const [sokeTerm, setSokeTerm] = useState('');
  const [filtrerKategori, setFiltrerKategori] = useState('alle');
  const [aktivTab, setAktivTab] = useState<'sporsmal' | 'kategorier' | 'statistikk'>('sporsmal');

  const [nyttSporsmal, setNyttSporsmal] = useState({
    tekst: '',
    kategori: '',
    vanskelighetsgrad: 'medium' as 'lett' | 'medium' | 'vanskelig',
    type: 'multiple_choice' as 'multiple_choice' | 'sant_usant' | 'fyllfinn',
    alternativer: ['', '', '', ''],
    riktigSvar: 0,
    forklaring: ''
  });

  const filtrertSporsmal = sporsmal.filter(s => {
    const matcherSok = s.tekst.toLowerCase().includes(sokeTerm.toLowerCase()) ||
                      s.kategori.toLowerCase().includes(sokeTerm.toLowerCase());
    const matcherKategori = filtrerKategori === 'alle' || s.kategori === filtrerKategori;
    return matcherSok && matcherKategori;
  });

  const getVanskelighetsColor = (vanskelighet: string) => {
    switch (vanskelighet) {
      case 'lett': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'vanskelig': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'bg-green-100 text-green-800';
      case 'utkast': return 'bg-yellow-100 text-yellow-800';
      case 'arkivert': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKategoriFarge = (farge: string) => {
    switch (farge) {
      case 'blue': return 'bg-blue-500';
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      case 'pink': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const lagreNyttSporsmal = () => {
    const sporsmalData: Sporsmal = {
      id: Date.now().toString(),
      tekst: nyttSporsmal.tekst,
      kategori: nyttSporsmal.kategori,
      vanskelighetsgrad: nyttSporsmal.vanskelighetsgrad,
      type: nyttSporsmal.type,
      alternativer: nyttSporsmal.alternativer.filter(alt => alt.trim() !== ''),
      riktigSvar: nyttSporsmal.riktigSvar,
      forklaring: nyttSporsmal.forklaring,
      opprettetAv: 'Admin',
      opprettetDato: new Date().toISOString().split('T')[0],
      sistEndret: new Date().toISOString().split('T')[0],
      status: 'utkast',
      antallBruk: 0,
      gjennomsnittScore: 0
    };
    
    setSporsmal([...sporsmal, sporsmalData]);
    setVisNyttSporsmalModal(false);
    setNyttSporsmal({
      tekst: '',
      kategori: '',
      vanskelighetsgrad: 'medium',
      type: 'multiple_choice',
      alternativer: ['', '', '', ''],
      riktigSvar: 0,
      forklaring: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Admin - Spørsmålstyring
              </h1>
              <p className="text-gray-600 mt-1">Opprett, rediger og administrer quiz-spørsmål</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVisKategoriModal(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center space-x-2"
            >
              <TagIcon className="w-5 h-5" />
              <span>Ny Kategori</span>
            </button>
            <button
              onClick={() => setVisNyttSporsmalModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
            >
              <PlusSolid className="w-5 h-5" />
              <span>Nytt Spørsmål</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totalt Spørsmål</p>
                <p className="text-2xl font-bold text-blue-600">{sporsmal.length}</p>
              </div>
              <BookSolid className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive</p>
                <p className="text-2xl font-bold text-green-600">{sporsmal.filter(s => s.status === 'aktiv').length}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kategorier</p>
                <p className="text-2xl font-bold text-purple-600">{kategorier.length}</p>
              </div>
              <TagIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utkast</p>
                <p className="text-2xl font-bold text-yellow-600">{sporsmal.filter(s => s.status === 'utkast').length}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-6 border border-white/20">
          <div className="flex space-x-0">
            {[
              { id: 'sporsmal', navn: 'Spørsmål', ikon: BookOpenIcon },
              { id: 'kategorier', navn: 'Kategorier', ikon: TagIcon },
              { id: 'statistikk', navn: 'Statistikk', ikon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAktivTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all ${
                  aktivTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.ikon className="w-5 h-5" />
                <span className="font-medium">{tab.navn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spørsmål Tab */}
        {aktivTab === 'sporsmal' && (
          <div className="space-y-6">
            {/* Søk og Filter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Søk etter spørsmål..."
                    value={sokeTerm}
                    onChange={(e) => setSokeTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={filtrerKategori}
                    onChange={(e) => setFiltrerKategori(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="alle">Alle kategorier</option>
                    {kategorier.map(kat => (
                      <option key={kat.id} value={kat.navn}>{kat.navn}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Spørsmål Liste */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Spørsmål ({filtrertSporsmal.length})</h2>
                <div className="space-y-4">
                  {filtrertSporsmal.map((sp) => (
                    <div key={sp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{sp.tekst}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVanskelighetsColor(sp.vanskelighetsgrad)}`}>
                              {sp.vanskelighetsgrad}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sp.status)}`}>
                              {sp.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Kategori:</strong> {sp.kategori} • <strong>Type:</strong> {sp.type}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Opprettet av:</strong> {sp.opprettetAv} • {new Date(sp.opprettetDato).toLocaleDateString('no-NO')}
                          </p>
                          {sp.type === 'multiple_choice' && (
                            <div className="text-sm text-gray-600">
                              <strong>Alternativer:</strong> {sp.alternativer.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 ml-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Brukt</p>
                            <p className="font-semibold">{sp.antallBruk}x</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Gj.snitt</p>
                            <p className="font-semibold">{sp.gjennomsnittScore}%</p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <PencilIcon className="w-5 h-5 text-blue-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <TrashIcon className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kategorier Tab */}
        {aktivTab === 'kategorier' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Kategorier ({kategorier.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kategorier.map((kat) => (
                  <div key={kat.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-4 h-4 rounded-full ${getKategoriFarge(kat.farge)}`}></div>
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <PencilIcon className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{kat.navn}</h3>
                    <p className="text-sm text-gray-600 mb-3">{kat.beskrivelse}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{kat.antallSporsmal} spørsmål</span>
                      <span>Oppdatert {new Date(kat.sistOppdatert).toLocaleDateString('no-NO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nytt Spørsmål Modal */}
        {visNyttSporsmalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Opprett Nytt Spørsmål</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spørsmålstekst</label>
                  <textarea
                    value={nyttSporsmal.tekst}
                    onChange={(e) => setNyttSporsmal({...nyttSporsmal, tekst: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Skriv spørsmålet her..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      value={nyttSporsmal.kategori}
                      onChange={(e) => setNyttSporsmal({...nyttSporsmal, kategori: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Velg kategori</option>
                      {kategorier.map(kat => (
                        <option key={kat.id} value={kat.navn}>{kat.navn}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vanskelighetsgrad</label>
                    <select
                      value={nyttSporsmal.vanskelighetsgrad}
                      onChange={(e) => setNyttSporsmal({...nyttSporsmal, vanskelighetsgrad: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="lett">Lett</option>
                      <option value="medium">Medium</option>
                      <option value="vanskelig">Vanskelig</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={nyttSporsmal.type}
                    onChange={(e) => setNyttSporsmal({...nyttSporsmal, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Flervalg</option>
                    <option value="sant_usant">Sant/Usant</option>
                    <option value="fyllfinn">Fyllfinn</option>
                  </select>
                </div>

                {nyttSporsmal.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternativer</label>
                    {nyttSporsmal.alternativer.map((alt, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="radio"
                          name="riktig-svar"
                          checked={nyttSporsmal.riktigSvar === index}
                          onChange={() => setNyttSporsmal({...nyttSporsmal, riktigSvar: index})}
                          className="w-4 h-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={alt}
                          onChange={(e) => {
                            const nyeAlternativer = [...nyttSporsmal.alternativer];
                            nyeAlternativer[index] = e.target.value;
                            setNyttSporsmal({...nyttSporsmal, alternativer: nyeAlternativer});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Alternativ ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forklaring</label>
                  <textarea
                    value={nyttSporsmal.forklaring}
                    onChange={(e) => setNyttSporsmal({...nyttSporsmal, forklaring: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Forklaring til det riktige svaret..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setVisNyttSporsmalModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={lagreNyttSporsmal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Lagre Spørsmål
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 