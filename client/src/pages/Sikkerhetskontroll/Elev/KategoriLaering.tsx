import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaStar, FaExclamationTriangle, FaFireAlt, FaCheck, FaImage, FaVideo, FaPlay, FaClock, FaTrophy } from 'react-icons/fa';
import MediaViewer from '../../../components/sikkerhetskontroll/MediaViewer';

interface SporsmalMedia {
  id: number;
  mediaType: 'BILDE' | 'VIDEO' | 'INTERAKTIVT_DIAGRAM' | 'LYDFIL';
  url: string;
  altTekst: string;
  tittel?: string;
  rekkefølge: number;
}

interface Sporsmal {
  id: number;
  sporsmalTekst: string;
  svarKort?: string;
  svarDetaljert?: string;
  hvorforderVikreligTekst?: string;
  vanskelighetsgrad: 'LETT' | 'MIDDELS' | 'VANSKELIG';
  rekkefølge: number;
  media: SporsmalMedia[];
}

interface Kategori {
  id: number;
  navn: string;
  beskrivelse?: string;
  farge?: string;
  klasse: {
    id: number;
    navn: string;
  };
}

const KategoriLaering: React.FC = () => {
  const { kategoriId } = useParams<{ kategoriId: string }>();
  const [kategori, setKategori] = useState<Kategori | null>(null);
  const [sporsmal, setSporsmal] = useState<Sporsmal[]>([]);
  const [visningModus, setVisningModus] = useState<'kort' | 'detaljert'>('kort');
  const [visSvar, setVisSvar] = useState<boolean>(false);
  const [expandedSporsmal, setExpandedSporsmal] = useState<Set<number>>(new Set());
  const [markerteSporsmal, setMarkerteSporsmal] = useState<{ [key: number]: 'LETT' | 'MIDDELS' | 'VANSKELIG' }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kategoriId) {
      fetchKategoriData();
      fetchSporsmal();
    }
  }, [kategoriId]);

  const fetchKategoriData = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/kategorier/${kategoriId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente kategoridata');
      }

      const data = await response.json();
      setKategori(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    }
  };

  const fetchSporsmal = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/kategorier/${kategoriId}/sporsmal?medSvar=${visSvar}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente spørsmål');
      }

      const data = await response.json();
      setSporsmal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const toggleSporsmalExpansion = (sporsmalId: number) => {
    const newExpanded = new Set(expandedSporsmal);
    if (newExpanded.has(sporsmalId)) {
      newExpanded.delete(sporsmalId);
    } else {
      newExpanded.add(sporsmalId);
      // Marker som sett når det åpnes
      markerSporsmalProgresjon(sporsmalId, 'SETT');
    }
    setExpandedSporsmal(newExpanded);
  };

  const markerSporsmal = (sporsmalId: number, vanskelighetsgrad: 'LETT' | 'MIDDELS' | 'VANSKELIG') => {
    setMarkerteSporsmal(prev => ({
      ...prev,
      [sporsmalId]: vanskelighetsgrad
    }));
    // API-kall for å lagre marking
    markerSporsmalProgresjon(sporsmalId, 'SETT', vanskelighetsgrad);
  };

  const markerSporsmalProgresjon = async (sporsmalId: number, status: string, vanskelighetsmarkering?: string) => {
    try {
      await fetch(`/api/sikkerhetskontroll-laering/progresjon/sporsmal/${sporsmalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          vanskelighetsmarkering
        })
      });
    } catch (err) {
      console.error('Feil ved markering av progresjon:', err);
    }
  };

  const handleMediaInteraction = (pointId: string, mediaId: number) => {
    console.log('Media interaction:', { pointId, mediaId });
    // I produksjon kunne dette logge interaksjoner for læring analytics
  };

  const getVanskelighetsgrad = (grad: string) => {
    const grader = {
      'LETT': { icon: FaStar, color: 'text-green-600', bg: 'bg-green-100', text: 'Lett' },
      'MIDDELS': { icon: FaExclamationTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Middels' },
      'VANSKELIG': { icon: FaFireAlt, color: 'text-red-600', bg: 'bg-red-100', text: 'Vanskelig' }
    };
    return grader[grad as keyof typeof grader] || grader.MIDDELS;
  };

  const getMediaIcon = (type: string) => {
    const iconMap = {
      'BILDE': FaImage,
      'VIDEO': FaVideo,
      'INTERAKTIVT_DIAGRAM': FaImage,
      'LYDFIL': FaPlay
    };
    return iconMap[type as keyof typeof iconMap] || FaImage;
  };

  const getKategoriFarge = (farge?: string) => {
    const fargeMap: { [key: string]: string } = {
      '#ef4444': 'from-red-400 to-red-600',
      '#f59e0b': 'from-yellow-400 to-yellow-600',
      '#10b981': 'from-green-400 to-green-600',
      '#3b82f6': 'from-blue-400 to-blue-600',
      '#8b5cf6': 'from-purple-400 to-purple-600'
    };
    return fargeMap[farge || ''] || 'from-gray-400 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !kategori) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        <p className="text-red-800">Feil: {error || 'Kategori ikke funnet'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div className="cards-spacing-vertical">
        <Link 
          to={`/sikkerhetskontroll-laering/klasse/${kategori.klasse.id}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Tilbake til {kategori.klasse.navn}</span>
        </Link>

        <div className="text-center cards-spacing-vertical">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getKategoriFarge(kategori.farge)} rounded-full mb-4`}>
            <span className="text-2xl text-white font-bold">{kategori.navn.charAt(0)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{kategori.navn}</h1>
          <p className="text-lg text-gray-600">{kategori.beskrivelse}</p>
        </div>
      </div>

      {/* Kontroller */}
      <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 cards-spacing-vertical">
        <h3 className="text-lg font-semibold text-gray-900">Utforsk i ditt tempo</h3>
        
        <div className="flex flex-wrap cards-spacing-grid">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Visning:</span>
            <select 
              value={visningModus} 
              onChange={(e) => setVisningModus(e.target.value as 'kort' | 'detaljert')}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="kort">Kort oversikt</option>
              <option value="detaljert">Detaljert liste</option>
            </select>
          </div>

          <button
            onClick={() => setVisSvar(!visSvar)}
            className={`flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors ${
              visSvar 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {visSvar ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
            <span>{visSvar ? 'Skjul svar' : 'Vis svar'}</span>
          </button>

          <div className="text-sm text-gray-600">
            {sporsmal.length} spørsmål totalt
          </div>
        </div>
      </div>

      {/* Spørsmål Liste */}
      <div className="cards-spacing-vertical">
        {sporsmal.map((sp, index) => {
          const isExpanded = expandedSporsmal.has(sp.id);
          const vanskelighetsInfo = getVanskelighetsgrad(sp.vanskelighetsgrad);
          const elevMarkering = markerteSporsmal[sp.id];
          
          return (
            <div key={sp.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Spørsmål Header */}
              <div 
                className="px-2 py-1 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSporsmalExpansion(sp.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <vanskelighetsInfo.icon className={`w-4 h-4 ${vanskelighetsInfo.color}`} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vanskelighetsInfo.bg} ${vanskelighetsInfo.color}`}>
                          {vanskelighetsInfo.text}
                        </span>
                      </div>

                      {sp.media.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {sp.media.slice(0, 2).map((media, idx) => {
                            const MediaIcon = getMediaIcon(media.mediaType);
                            return <MediaIcon key={idx} className="w-3 h-3 text-gray-500" />;
                          })}
                          {sp.media.length > 2 && (
                            <span className="text-xs text-gray-500">+{sp.media.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 pr-4">
                      {sp.sporsmalTekst}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {elevMarkering && (
                      <div className={`p-1 rounded ${getVanskelighetsgrad(elevMarkering).bg}`}>
                        {React.createElement(getVanskelighetsgrad(elevMarkering).icon, {
                          className: `w-3 h-3 ${getVanskelighetsgrad(elevMarkering).color}`
                        })}
                      </div>
                    )}
                    <FaArrowLeft className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
                  </div>
                </div>
              </div>

              {/* Utvidet Innhold */}
              {isExpanded && (
                <div className="border-t border-gray-200 px-2 py-1 cards-spacing-vertical">
                  {/* Media med MediaViewer */}
                  {sp.media.length > 0 && (
                    <div className="cards-spacing-vertical">
                      <h4 className="font-medium text-gray-900">Media og Interaktivt Innhold</h4>
                      <MediaViewer 
                        media={sp.media.map(m => ({
                          id: m.id,
                          type: m.mediaType === 'BILDE' ? 'IMAGE' : 
                                m.mediaType === 'VIDEO' ? 'VIDEO' :
                                m.mediaType === 'LYDFIL' ? 'AUDIO' :
                                'INTERACTIVE',
                          url: m.url,
                          tittel: m.tittel || m.altTekst,
                          beskrivelse: m.altTekst,
                          rekkefølge: m.rekkefølge,
                          // Simuler interaktive punkter for BILDE
                          interactivePoints: m.mediaType === 'BILDE' ? [
                            {
                              id: `point-${m.id}-1`,
                              x: 25,
                              y: 30,
                              tittel: 'Viktig inspeksjonspunkt',
                              beskrivelse: 'Dette området krever spesiell oppmerksomhet under kontroll.',
                              type: 'INFO'
                            },
                            {
                              id: `point-${m.id}-2`, 
                              x: 75,
                              y: 60,
                              tittel: 'Mulig problemområde',
                              beskrivelse: 'Her kan det oppstå slitasje eller skader som må sjekkes.',
                              type: 'PROBLEM'
                            }
                          ] : undefined
                        }))}
                        onInteraction={handleMediaInteraction}
                      />
                    </div>
                  )}

                  {/* Svar (hvis aktivert) */}
                  {visSvar && (
                    <div className="cards-spacing-vertical">
                      {sp.svarKort && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
                          <h4 className="font-medium text-blue-900 mb-2">Kort Svar</h4>
                          <p className="text-blue-800">{sp.svarKort}</p>
                        </div>
                      )}
                      
                      {sp.svarDetaljert && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                          <h4 className="font-medium text-green-900 mb-2">Detaljert Forklaring</h4>
                          <p className="text-green-800">{sp.svarDetaljert}</p>
                        </div>
                      )}

                      {sp.hvorforderVikreligTekst && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                          <h4 className="font-medium text-red-900 mb-2">Hvorfor er dette viktig?</h4>
                          <p className="text-red-800">{sp.hvorforderVikreligTekst}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Elev-markering */}
                  <div className="space-y-8">
                    <h4 className="font-medium text-gray-900">Hvor vanskelig var dette for deg?</h4>
                    <div className="flex space-x-3">
                      {(['LETT', 'MIDDELS', 'VANSKELIG'] as const).map((grad) => {
                        const info = getVanskelighetsgrad(grad);
                        const isSelected = markerteSporsmal[sp.id] === grad;
                        
                        return (
                          <button
                            key={grad}
                            onClick={() => markerSporsmal(sp.id, grad)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                              isSelected 
                                ? `${info.bg} ${info.color} border-current` 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <info.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{info.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nederst: Test-knapper */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl px-2 py-1 border border-indigo-200 cards-spacing-vertical">
        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Klar for å teste kunnskapen?</h3>
        
        {/* Nivå 2: Lærlingen */}
        <div className="bg-white rounded-lg px-2 py-1 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Nivå 2: Lærlingen</h4>
          <p className="text-gray-600 text-sm mb-3">
            5 spørsmål for å teste grunnleggende forståelse
          </p>
          <Link 
            to={`/sikkerhetskontroll-laering/kategori/${kategoriId}/test`}
            className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FaCheck className="w-4 h-4" />
            <span>Start Lærling-test</span>
          </Link>
        </div>

        {/* Nivå 3: Testkandidat */}
        <div className="bg-white rounded-lg px-2 py-1 border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">Nivå 3: Testkandidat</h4>
          <p className="text-gray-600 text-sm mb-3">
            20 spørsmål, tidsbegrensning, realistisk eksamen-simulering
          </p>
          <Link 
            to={`/sikkerhetskontroll-laering/kategori/${kategoriId}/testkandidat`}
            className="inline-flex items-center justify-center space-x-2 bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <FaClock className="w-4 h-4" />
            <span>Start Testkandidat</span>
          </Link>
        </div>

        {/* Nivå 4: Mester */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg px-2 py-1 border-2 border-yellow-300">
          <h4 className="font-medium text-yellow-900 mb-2">Nivå 4: Mester 🏆</h4>
          <p className="text-gray-700 text-sm mb-3">
            Ultimate challenge - Tverrfaglige scenarioer og mester-kompetanse
          </p>
          <Link 
            to={`/sikkerhetskontroll-laering/kategori/${kategoriId}/mester`}
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors text-sm font-bold"
          >
            <FaTrophy className="w-4 h-4" />
            <span>Start Mester-test</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KategoriLaering; 