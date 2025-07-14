import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  SwatchIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  TagIcon as TagSolid,
  SwatchIcon as SwatchSolid
} from '@heroicons/react/24/solid';

interface Kategori {
  id: string;
  navn: string;
  beskrivelse: string;
  farge: string;
  ikon: string;
  antallSporsmal: number;
  vanskelighetsgrad: 'blandet' | 'lett' | 'medium' | 'vanskelig';
  sistOppdatert: string;
  aktiv: boolean;
  sortering: number;
  parent?: string;
  underkategorier?: string[];
}

interface KategoriStatistikk {
  totalKategorier: number;
  aktivKategorier: number;
  totalSporsmal: number;
  gjennomsnittVanskelighet: number;
  mestPopulareKategori: string;
}

export default function AdminQuizForslag3_KategoriStyring() {
  const [kategorier, setKategorier] = useState<Kategori[]>([
    {
      id: '1',
      navn: 'Trafikklys og skilt',
      beskrivelse: 'Spørsmål om trafikklys, veiskilt og deres betydning',
      farge: 'red',
      ikon: 'ExclamationTriangleIcon',
      antallSporsmal: 45,
      vanskelighetsgrad: 'blandet',
      sistOppdatert: '2024-01-15',
      aktiv: true,
      sortering: 1,
      underkategorier: ['2', '3']
    },
    {
      id: '2',
      navn: 'Trafikklys',
      beskrivelse: 'Spørsmål spesifikt om trafikklys og deres funksjon',
      farge: 'yellow',
      ikon: 'ClockIcon',
      antallSporsmal: 25,
      vanskelighetsgrad: 'lett',
      sistOppdatert: '2024-01-14',
      aktiv: true,
      sortering: 1,
      parent: '1'
    },
    {
      id: '3',
      navn: 'Veiskilt',
      beskrivelse: 'Spørsmål om forskjellige typer veiskilt',
      farge: 'blue',
      ikon: 'TagIcon',
      antallSporsmal: 20,
      vanskelighetsgrad: 'medium',
      sistOppdatert: '2024-01-13',
      aktiv: true,
      sortering: 2,
      parent: '1'
    },
    {
      id: '4',
      navn: 'Kjøreteknikk',
      beskrivelse: 'Spørsmål om grunnleggende kjøreteknikker og ferdigheter',
      farge: 'green',
      ikon: 'AcademicCapIcon',
      antallSporsmal: 38,
      vanskelighetsgrad: 'medium',
      sistOppdatert: '2024-01-12',
      aktiv: true,
      sortering: 2
    },
    {
      id: '5',
      navn: 'Trafikkregler',
      beskrivelse: 'Spørsmål om norske trafikkregler og forskrifter',
      farge: 'purple',
      ikon: 'BookOpenIcon',
      antallSporsmal: 52,
      vanskelighetsgrad: 'vanskelig',
      sistOppdatert: '2024-01-11',
      aktiv: true,
      sortering: 3
    },
    {
      id: '6',
      navn: 'Sikkerhet',
      beskrivelse: 'Spørsmål om trafikksikkerhet og risikovurdering',
      farge: 'orange',
      ikon: 'ExclamationTriangleIcon',
      antallSporsmal: 31,
      vanskelighetsgrad: 'medium',
      sistOppdatert: '2024-01-10',
      aktiv: false,
      sortering: 4
    }
  ]);

  const [visOpprettModal, setVisOpprettModal] = useState(false);
  const [visRedigerModal, setVisRedigerModal] = useState(false);
  const [valgtKategori, setValgtKategori] = useState<Kategori | null>(null);
  const [sokeTerm, setSokeTerm] = useState('');
  const [filtrerStatus, setFiltrerStatus] = useState('alle');
  const [filtrerVanskelighet, setFiltrerVanskelighet] = useState('alle');
  const [visningsModus, setVisningsModus] = useState<'hierarkisk' | 'flat'>('hierarkisk');

  const [nyKategori, setNyKategori] = useState({
    navn: '',
    beskrivelse: '',
    farge: 'blue',
    ikon: 'TagIcon',
    vanskelighetsgrad: 'medium',
    parent: ''
  });

  const statistikk: KategoriStatistikk = {
    totalKategorier: kategorier.length,
    aktivKategorier: kategorier.filter(k => k.aktiv).length,
    totalSporsmal: kategorier.reduce((sum, k) => sum + k.antallSporsmal, 0),
    gjennomsnittVanskelighet: 2.3,
    mestPopulareKategori: 'Trafikkregler'
  };

  const filtrertKategorier = kategorier.filter(kategori => {
    const matcherSok = kategori.navn.toLowerCase().includes(sokeTerm.toLowerCase()) ||
                      kategori.beskrivelse.toLowerCase().includes(sokeTerm.toLowerCase());
    const matcherStatus = filtrerStatus === 'alle' || 
                         (filtrerStatus === 'aktiv' && kategori.aktiv) ||
                         (filtrerStatus === 'inaktiv' && !kategori.aktiv);
    const matcherVanskelighet = filtrerVanskelighet === 'alle' || kategori.vanskelighetsgrad === filtrerVanskelighet;
    return matcherSok && matcherStatus && matcherVanskelighet;
  });

  const hovedkategorier = filtrertKategorier.filter(k => !k.parent);
  const underkategorier = filtrertKategorier.filter(k => k.parent);

  const farger = [
    { navn: 'Rød', verdi: 'red', klasse: 'bg-red-500' },
    { navn: 'Blå', verdi: 'blue', klasse: 'bg-blue-500' },
    { navn: 'Grønn', verdi: 'green', klasse: 'bg-green-500' },
    { navn: 'Gul', verdi: 'yellow', klasse: 'bg-yellow-500' },
    { navn: 'Lilla', verdi: 'purple', klasse: 'bg-purple-500' },
    { navn: 'Oransje', verdi: 'orange', klasse: 'bg-orange-500' },
    { navn: 'Rosa', verdi: 'pink', klasse: 'bg-pink-500' },
    { navn: 'Indigo', verdi: 'indigo', klasse: 'bg-indigo-500' }
  ];

  const ikoner = [
    'TagIcon', 'BookOpenIcon', 'AcademicCapIcon', 'ExclamationTriangleIcon',
    'ClockIcon', 'TrophyIcon', 'ChartBarIcon', 'SwatchIcon'
  ];

  const getFargeKlasse = (farge: string) => {
    const fargeObj = farger.find(f => f.verdi === farge);
    return fargeObj ? fargeObj.klasse : 'bg-gray-500';
  };

  const getVanskelighetsGradFarge = (grad: string) => {
    switch (grad) {
      case 'lett': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'vanskelig': return 'text-red-600 bg-red-100';
      case 'blandet': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const opprettKategori = () => {
    const kategori: Kategori = {
      id: Date.now().toString(),
      navn: nyKategori.navn,
      beskrivelse: nyKategori.beskrivelse,
      farge: nyKategori.farge,
      ikon: nyKategori.ikon,
      antallSporsmal: 0,
      vanskelighetsgrad: nyKategori.vanskelighetsgrad as any,
      sistOppdatert: new Date().toISOString().split('T')[0],
      aktiv: true,
      sortering: kategorier.length + 1,
      parent: nyKategori.parent || undefined
    };

    setKategorier([...kategorier, kategori]);
    setVisOpprettModal(false);
    setNyKategori({
      navn: '',
      beskrivelse: '',
      farge: 'blue',
      ikon: 'TagIcon',
      vanskelighetsgrad: 'medium',
      parent: ''
    });
  };

  const slettKategori = (kategoriId: string) => {
    setKategorier(kategorier.filter(k => k.id !== kategoriId));
  };

  const toggleKategoriStatus = (kategoriId: string) => {
    setKategorier(kategorier.map(k => 
      k.id === kategoriId ? { ...k, aktiv: !k.aktiv } : k
    ));
  };

  const redigerKategori = (kategori: Kategori) => {
    setValgtKategori(kategori);
    setVisRedigerModal(true);
  };

  const lagre = () => {
    if (valgtKategori) {
      setKategorier(kategorier.map(k => 
        k.id === valgtKategori.id ? valgtKategori : k
      ));
      setVisRedigerModal(false);
      setValgtKategori(null);
    }
  };

  const renderKategoriKort = (kategori: Kategori, erUnderkategori = false) => (
    <div 
      key={kategori.id} 
      className={`bg-white rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all ${
        erUnderkategori ? 'ml-8 border-l-4' : ''
      }`}
      style={erUnderkategori ? { borderLeftColor: `var(--color-${kategori.farge}-500)` } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${getFargeKlasse(kategori.farge)} flex items-center justify-center`}>
            <TagIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{kategori.navn}</h3>
            <p className="text-sm text-gray-600">{kategori.beskrivelse}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            kategori.aktiv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {kategori.aktiv ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{kategori.antallSporsmal}</p>
          <p className="text-xs text-gray-600">Spørsmål</p>
        </div>
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-xs ${getVanskelighetsGradFarge(kategori.vanskelighetsgrad)}`}>
            {kategori.vanskelighetsgrad}
          </span>
          <p className="text-xs text-gray-600 mt-1">Vanskelighet</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">
            {new Date(kategori.sistOppdatert).toLocaleDateString('no-NO')}
          </p>
          <p className="text-xs text-gray-600">Sist oppdatert</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">#{kategori.sortering}</p>
          <p className="text-xs text-gray-600">Sortering</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {kategori.underkategorier && kategori.underkategorier.length > 0 && (
            <span className="text-sm text-gray-600">
              {kategori.underkategorier.length} underkategorier
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleKategoriStatus(kategori.id)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              kategori.aktiv 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {kategori.aktiv ? 'Deaktiver' : 'Aktiver'}
          </button>
          <button
            onClick={() => redigerKategori(kategori)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => slettKategori(kategori.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz/admin/media" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Kategoristyring
              </h1>
              <p className="text-gray-600 mt-1">Organiser og administrer quiz-kategorier</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-white/50 rounded-lg p-1">
              <button
                onClick={() => setVisningsModus('hierarkisk')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  visningsModus === 'hierarkisk' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Hierarkisk
              </button>
              <button
                onClick={() => setVisningsModus('flat')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  visningsModus === 'flat' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Flat
              </button>
            </div>
            <button
              onClick={() => setVisOpprettModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Ny kategori</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totalt kategorier</p>
                <p className="text-2xl font-bold text-blue-600">{statistikk.totalKategorier}</p>
              </div>
              <TagSolid className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive</p>
                <p className="text-2xl font-bold text-green-600">{statistikk.aktivKategorier}</p>
              </div>
              <SwatchSolid className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totalt spørsmål</p>
                <p className="text-2xl font-bold text-purple-600">{statistikk.totalSporsmal}</p>
              </div>
              <BookOpenIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gj.snitt vanskelighet</p>
                <p className="text-2xl font-bold text-orange-600">{statistikk.gjennomsnittVanskelighet}/5</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mest populær</p>
                <p className="text-sm font-bold text-indigo-600">{statistikk.mestPopulareKategori}</p>
              </div>
              <TrophyIcon className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Søk og Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Søk etter kategorier eller beskrivelser..."
                value={sokeTerm}
                onChange={(e) => setSokeTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filtrerStatus}
                onChange={(e) => setFiltrerStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle statuser</option>
                <option value="aktiv">Aktive</option>
                <option value="inaktiv">Inaktive</option>
              </select>
              <select
                value={filtrerVanskelighet}
                onChange={(e) => setFiltrerVanskelighet(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle vanskelighetsgrader</option>
                <option value="lett">Lett</option>
                <option value="medium">Medium</option>
                <option value="vanskelig">Vanskelig</option>
                <option value="blandet">Blandet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kategorier */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Kategorier ({filtrertKategorier.length})
            </h2>

            <div className="space-y-4">
              {visningsModus === 'hierarkisk' ? (
                <>
                  {hovedkategorier.map(kategori => (
                    <div key={kategori.id}>
                      {renderKategoriKort(kategori)}
                      {kategori.underkategorier?.map(underkategoriId => {
                        const underkategori = underkategorier.find(u => u.id === underkategoriId);
                        return underkategori ? renderKategoriKort(underkategori, true) : null;
                      })}
                    </div>
                  ))}
                </>
              ) : (
                filtrertKategorier.map(kategori => renderKategoriKort(kategori))
              )}
            </div>
          </div>
        </div>

        {/* Opprett Modal */}
        {visOpprettModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Opprett ny kategori</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                  <input
                    type="text"
                    value={nyKategori.navn}
                    onChange={(e) => setNyKategori({...nyKategori, navn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Skriv kategorinavn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <textarea
                    value={nyKategori.beskrivelse}
                    onChange={(e) => setNyKategori({...nyKategori, beskrivelse: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Beskriv kategorien..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farge</label>
                  <div className="grid grid-cols-4 gap-2">
                    {farger.map(farge => (
                      <button
                        key={farge.verdi}
                        onClick={() => setNyKategori({...nyKategori, farge: farge.verdi})}
                        className={`w-full h-8 rounded-lg ${farge.klasse} ${
                          nyKategori.farge === farge.verdi ? 'ring-2 ring-gray-800' : ''
                        }`}
                        title={farge.navn}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vanskelighetsgrad</label>
                  <select
                    value={nyKategori.vanskelighetsgrad}
                    onChange={(e) => setNyKategori({...nyKategori, vanskelighetsgrad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lett">Lett</option>
                    <option value="medium">Medium</option>
                    <option value="vanskelig">Vanskelig</option>
                    <option value="blandet">Blandet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hovedkategori (valgfritt)</label>
                  <select
                    value={nyKategori.parent}
                    onChange={(e) => setNyKategori({...nyKategori, parent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Ingen (hovedkategori)</option>
                    {hovedkategorier.map(kategori => (
                      <option key={kategori.id} value={kategori.id}>{kategori.navn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setVisOpprettModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={opprettKategori}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Opprett
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rediger Modal */}
        {visRedigerModal && valgtKategori && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Rediger kategori</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                  <input
                    type="text"
                    value={valgtKategori.navn}
                    onChange={(e) => setValgtKategori({...valgtKategori, navn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <textarea
                    value={valgtKategori.beskrivelse}
                    onChange={(e) => setValgtKategori({...valgtKategori, beskrivelse: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farge</label>
                  <div className="grid grid-cols-4 gap-2">
                    {farger.map(farge => (
                      <button
                        key={farge.verdi}
                        onClick={() => setValgtKategori({...valgtKategori, farge: farge.verdi})}
                        className={`w-full h-8 rounded-lg ${farge.klasse} ${
                          valgtKategori.farge === farge.verdi ? 'ring-2 ring-gray-800' : ''
                        }`}
                        title={farge.navn}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vanskelighetsgrad</label>
                  <select
                    value={valgtKategori.vanskelighetsgrad}
                    onChange={(e) => setValgtKategori({...valgtKategori, vanskelighetsgrad: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lett">Lett</option>
                    <option value="medium">Medium</option>
                    <option value="vanskelig">Vanskelig</option>
                    <option value="blandet">Blandet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sortering</label>
                  <input
                    type="number"
                    value={valgtKategori.sortering}
                    onChange={(e) => setValgtKategori({...valgtKategori, sortering: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setVisRedigerModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={lagre}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Lagre
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 