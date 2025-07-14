import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PencilIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import {
  PhotoIcon as PhotoSolid,
  VideoCameraIcon as VideoSolid
} from '@heroicons/react/24/solid';

interface MediaFil {
  id: string;
  navn: string;
  type: 'bilde' | 'video' | 'lyd' | 'dokument';
  url: string;
  storrelse: string;
  opprettetDato: string;
  kategori: string;
  bruktISporsmal: number;
  beskrivelse?: string;
  tags: string[];
  alt_tekst?: string;
}

interface MediaMappe {
  id: string;
  navn: string;
  antallFiler: number;
  sistOppdatert: string;
  farge: string;
}

export default function AdminQuizForslag2_MediaStyring() {
  const [mediaFiler, setMediaFiler] = useState<MediaFil[]>([
    {
      id: '1',
      navn: 'trafikklys_rodt.jpg',
      type: 'bilde',
      url: '/images/trafikklys_rodt.jpg',
      storrelse: '245 KB',
      opprettetDato: '2024-01-15',
      kategori: 'Trafikklys',
      bruktISporsmal: 12,
      beskrivelse: 'Rødt trafikklys i lyskryss',
      tags: ['trafikklys', 'rødt', 'stopp'],
      alt_tekst: 'Rødt trafikklys som viser stopp-signal'
    },
    {
      id: '2',
      navn: 'stoppskilt.png',
      type: 'bilde',
      url: '/images/stoppskilt.png',
      storrelse: '156 KB',
      opprettetDato: '2024-01-12',
      kategori: 'Skilt',
      bruktISporsmal: 8,
      beskrivelse: 'Standard norsk stoppskilt',
      tags: ['skilt', 'stopp', 'åttekant'],
      alt_tekst: 'Rødt åttekantskap stoppskilt med STOPP tekst'
    },
    {
      id: '3',
      navn: 'motorvei_kjoring.mp4',
      type: 'video',
      url: '/videos/motorvei_kjoring.mp4',
      storrelse: '15.2 MB',
      opprettetDato: '2024-01-10',
      kategori: 'Kjøreteknikk',
      bruktISporsmal: 3,
      beskrivelse: 'Demonstrasjon av trygg motorveikjøring',
      tags: ['motorvei', 'kjøring', 'sikkerhet'],
      alt_tekst: 'Video som viser riktig kjøreteknikk på motorvei'
    },
    {
      id: '4',
      navn: 'bilbelte_lyd.mp3',
      type: 'lyd',
      url: '/audio/bilbelte_lyd.mp3',
      storrelse: '2.1 MB',
      opprettetDato: '2024-01-08',
      kategori: 'Sikkerhet',
      bruktISporsmal: 5,
      beskrivelse: 'Lydklipp av bilbelte som klikkes fast',
      tags: ['bilbelte', 'sikkerhet', 'lyd'],
      alt_tekst: 'Lyd av bilbelte som festes'
    }
  ]);

  const [mediaMapper, setMediaMapper] = useState<MediaMappe[]>([
    {
      id: '1',
      navn: 'Trafikklys',
      antallFiler: 15,
      sistOppdatert: '2024-01-15',
      farge: 'red'
    },
    {
      id: '2',
      navn: 'Skilt',
      antallFiler: 32,
      sistOppdatert: '2024-01-12',
      farge: 'blue'
    },
    {
      id: '3',
      navn: 'Kjøreteknikk',
      antallFiler: 8,
      sistOppdatert: '2024-01-10',
      farge: 'green'
    },
    {
      id: '4',
      navn: 'Sikkerhet',
      antallFiler: 24,
      sistOppdatert: '2024-01-08',
      farge: 'yellow'
    }
  ]);

  const [visOpplastModal, setVisOpplastModal] = useState(false);
  const [visDetaljerModal, setVisDetaljerModal] = useState(false);
  const [valgtFil, setValgtFil] = useState<MediaFil | null>(null);
  const [sokeTerm, setSokeTerm] = useState('');
  const [filtrerType, setFiltrerType] = useState('alle');
  const [filtrerKategori, setFiltrerKategori] = useState('alle');
  const [aktivVisning, setAktivVisning] = useState<'rutenett' | 'liste'>('rutenett');

  const [nyFil, setNyFil] = useState({
    navn: '',
    beskrivelse: '',
    kategori: '',
    tags: '',
    alt_tekst: ''
  });

  const filtrerteFiler = mediaFiler.filter(fil => {
    const matcherSok = fil.navn.toLowerCase().includes(sokeTerm.toLowerCase()) ||
                      fil.beskrivelse?.toLowerCase().includes(sokeTerm.toLowerCase()) ||
                      fil.tags.some(tag => tag.toLowerCase().includes(sokeTerm.toLowerCase()));
    const matcherType = filtrerType === 'alle' || fil.type === filtrerType;
    const matcherKategori = filtrerKategori === 'alle' || fil.kategori === filtrerKategori;
    return matcherSok && matcherType && matcherKategori;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bilde': return PhotoIcon;
      case 'video': return VideoCameraIcon;
      case 'lyd': return MusicalNoteIcon;
      case 'dokument': return DocumentIcon;
      default: return DocumentIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bilde': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-purple-600 bg-purple-100';
      case 'lyd': return 'text-green-600 bg-green-100';
      case 'dokument': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKategoriFarge = (farge: string) => {
    switch (farge) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      case 'pink': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const slettFil = (filId: string) => {
    setMediaFiler(mediaFiler.filter(fil => fil.id !== filId));
  };

  const visFilDetaljer = (fil: MediaFil) => {
    setValgtFil(fil);
    setVisDetaljerModal(true);
  };

  const lastOppFil = () => {
    // Simuler filopplasting
    const fil: MediaFil = {
      id: Date.now().toString(),
      navn: nyFil.navn || 'ny_fil.jpg',
      type: 'bilde',
      url: '/images/ny_fil.jpg',
      storrelse: '156 KB',
      opprettetDato: new Date().toISOString().split('T')[0],
      kategori: nyFil.kategori || 'Diverse',
      bruktISporsmal: 0,
      beskrivelse: nyFil.beskrivelse,
      tags: nyFil.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      alt_tekst: nyFil.alt_tekst
    };
    
    setMediaFiler([...mediaFiler, fil]);
    setVisOpplastModal(false);
    setNyFil({
      navn: '',
      beskrivelse: '',
      kategori: '',
      tags: '',
      alt_tekst: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz/admin/sporsmal" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Media & Bilder
              </h1>
              <p className="text-gray-600 mt-1">Administrer bilder, videoer og lyd for quiz-spørsmål</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-white/50 rounded-lg p-1">
              <button
                onClick={() => setAktivVisning('rutenett')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  aktivVisning === 'rutenett' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Rutenett
              </button>
              <button
                onClick={() => setAktivVisning('liste')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  aktivVisning === 'liste' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                Liste
              </button>
            </div>
            <button
              onClick={() => setVisOpplastModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Last opp</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totalt filer</p>
                <p className="text-2xl font-bold text-blue-600">{mediaFiler.length}</p>
              </div>
              <PhotoSolid className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bilder</p>
                <p className="text-2xl font-bold text-green-600">{mediaFiler.filter(f => f.type === 'bilde').length}</p>
              </div>
              <PhotoIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Videoer</p>
                <p className="text-2xl font-bold text-purple-600">{mediaFiler.filter(f => f.type === 'video').length}</p>
              </div>
              <VideoSolid className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lyd</p>
                <p className="text-2xl font-bold text-orange-600">{mediaFiler.filter(f => f.type === 'lyd').length}</p>
              </div>
              <MusicalNoteIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mapper</p>
                <p className="text-2xl font-bold text-indigo-600">{mediaMapper.length}</p>
              </div>
              <FolderIcon className="w-8 h-8 text-indigo-500" />
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
                placeholder="Søk etter filer, beskrivelse eller tags..."
                value={sokeTerm}
                onChange={(e) => setSokeTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filtrerType}
                onChange={(e) => setFiltrerType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle typer</option>
                <option value="bilde">Bilder</option>
                <option value="video">Videoer</option>
                <option value="lyd">Lyd</option>
                <option value="dokument">Dokumenter</option>
              </select>
              <select
                value={filtrerKategori}
                onChange={(e) => setFiltrerKategori(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alle">Alle kategorier</option>
                {mediaMapper.map(mappe => (
                  <option key={mappe.id} value={mappe.navn}>{mappe.navn}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Media Visning */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Media filer ({filtrerteFiler.length})
            </h2>

            {aktivVisning === 'rutenett' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtrerteFiler.map((fil) => {
                  const TypeIcon = getTypeIcon(fil.type);
                  return (
                    <div key={fil.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {fil.type === 'bilde' ? (
                          <img 
                            src={fil.url} 
                            alt={fil.alt_tekst || fil.navn}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling!.setAttribute('style', 'display: flex');
                            }}
                          />
                        ) : null}
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center" style={{display: fil.type === 'bilde' ? 'none' : 'flex'}}>
                          <TypeIcon className={`w-8 h-8 ${getTypeColor(fil.type).split(' ')[0]}`} />
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 truncate mb-1">{fil.navn}</h3>
                      <p className="text-sm text-gray-600 mb-2">{fil.kategori}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{fil.storrelse}</span>
                        <span className={`px-2 py-1 rounded-full ${getTypeColor(fil.type)}`}>
                          {fil.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Brukt: {fil.bruktISporsmal}x</span>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => visFilDetaljer(fil)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 text-blue-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <PencilIcon className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => slettFil(fil.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filtrerteFiler.map((fil) => {
                  const TypeIcon = getTypeIcon(fil.type);
                  return (
                    <div key={fil.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(fil.type).split(' ')[1]}`}>
                          <TypeIcon className={`w-6 h-6 ${getTypeColor(fil.type).split(' ')[0]}`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{fil.navn}</h3>
                          <p className="text-sm text-gray-600">{fil.beskrivelse}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Kategori: {fil.kategori}</span>
                            <span>Størrelse: {fil.storrelse}</span>
                            <span>Opprettet: {new Date(fil.opprettetDato).toLocaleDateString('no-NO')}</span>
                            <span>Brukt: {fil.bruktISporsmal}x</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => visFilDetaljer(fil)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-5 h-5 text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <PencilIcon className="w-5 h-5 text-green-600" />
                          </button>
                          <button 
                            onClick={() => slettFil(fil.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Opplast Modal */}
        {visOpplastModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Last opp ny fil</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filnavn</label>
                  <input
                    type="text"
                    value={nyFil.navn}
                    onChange={(e) => setNyFil({...nyFil, navn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Skriv filnavn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <textarea
                    value={nyFil.beskrivelse}
                    onChange={(e) => setNyFil({...nyFil, beskrivelse: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Beskriv filen..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={nyFil.kategori}
                    onChange={(e) => setNyFil({...nyFil, kategori: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Velg kategori</option>
                    {mediaMapper.map(mappe => (
                      <option key={mappe.id} value={mappe.navn}>{mappe.navn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (kommaseparert)</label>
                  <input
                    type="text"
                    value={nyFil.tags}
                    onChange={(e) => setNyFil({...nyFil, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt-tekst (for bilder)</label>
                  <input
                    type="text"
                    value={nyFil.alt_tekst}
                    onChange={(e) => setNyFil({...nyFil, alt_tekst: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Beskrivelse for skjermlesere..."
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Dra og slipp filer her, eller klikk for å velge</p>
                  <input type="file" className="hidden" accept="image/*,video/*,audio/*" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setVisOpplastModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={lastOppFil}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Last opp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fil Detaljer Modal */}
        {visDetaljerModal && valgtFil && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{valgtFil.navn}</h2>
              
              <div className="space-y-4">
                {valgtFil.type === 'bilde' && (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <img 
                      src={valgtFil.url} 
                      alt={valgtFil.alt_tekst || valgtFil.navn}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-gray-900">{valgtFil.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Størrelse</label>
                    <p className="text-gray-900">{valgtFil.storrelse}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <p className="text-gray-900">{valgtFil.kategori}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brukt i spørsmål</label>
                    <p className="text-gray-900">{valgtFil.bruktISporsmal} ganger</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Beskrivelse</label>
                  <p className="text-gray-900">{valgtFil.beskrivelse}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {valgtFil.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {valgtFil.alt_tekst && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alt-tekst</label>
                    <p className="text-gray-900">{valgtFil.alt_tekst}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setVisDetaljerModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Lukk
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Rediger
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 