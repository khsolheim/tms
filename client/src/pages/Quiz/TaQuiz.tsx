import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaClock, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaBolt, FaGraduationCap, FaExclamationTriangle, FaRandom, FaTachometerAlt, FaBook, FaStar } from 'react-icons/fa';
import { useAuth } from '../../contexts';
import { log } from '../../utils/logger';
import referenceService from '../../services/reference.service';

import { PageSkeleton } from '../../components/ui/LoadingStates';

interface Sporsmal {
  id: number;
  tekst: string;
  svaralternativer: string[];
  riktigSvar: number;
  klasser: string[];
  bildeUrl?: string;
  forklaring?: string;
  kategori?: {
    id: number;
    navn: string;
    klasse: string;
  };
}

interface QuizType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sporsmalCount: number;
  timeLimit?: number;
  features: string[];
  difficulty: 'Lett' | 'Middels' | 'Vanskelig';
}

export default function TaQuiz() {
  const navigate = useNavigate();
  const { bruker } = useAuth();
  const [trinn, setTrinn] = useState<'setup' | 'quiz' | 'resultat'>('setup');
  const [alleSporsmal, setAlleSporsmal] = useState<Sporsmal[]>([]);
  const [kategorier, setKategorier] = useState<any[]>([]);
  const [valgtQuizType, setValgtQuizType] = useState<QuizType | null>(null);
  const [quizSporsmal, setQuizSporsmal] = useState<Sporsmal[]>([]);
  const [gjeldendeSporsmalsNr, setGjeldendeSporsmalsNr] = useState(0);
  const [svar, setSvar] = useState<number[]>([]);
  const [valgtKlasse, setValgtKlasse] = useState('');
  const [valgtKategori, setValgtKategori] = useState('');
  const [tidBrukt, setTidBrukt] = useState(0);
  const [startTid, setStartTid] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [klasseAlternativer, setKlasseAlternativer] = useState<string[]>([]);

  // Quiz-typer basert på rolle
  const getQuizTypes = (): QuizType[] => {
    const erLærer = bruker?.rolle === 'ADMIN' || bruker?.rolle === 'TRAFIKKLARER';
    
    const baseQuizTypes: QuizType[] = [
      {
        id: 'hurtig',
        title: 'Hurtig Test',
        description: 'Rask gjennomgang med 10 spørsmål',
        icon: <FaBolt />,
        color: 'yellow',
        sporsmalCount: 10,
        timeLimit: 10, // 10 minutter
        features: ['10 spørsmål', '10 min tidsbegrensning', 'Perfekt for pause'],
        difficulty: 'Lett'
      },
      {
        id: 'tema',
        title: 'Tema Test',
        description: 'Fokuser på spesifikke kategorier',
        icon: <FaBook />,
        color: 'blue',
        sporsmalCount: 15,
        features: ['Velg kategori', '15 spørsmål', 'Målrettet læring'],
        difficulty: 'Middels'
      },
      {
        id: '45spm',
        title: '45 Spørsmål Test',
        description: 'Full teoriprøve-simulering',
        icon: <FaGraduationCap />,
        color: 'green',
        sporsmalCount: 45,
        timeLimit: 45, // 45 minutter
        features: ['45 spørsmål', '45 min tidsbegrensning', 'Lik ekte teoriprøve'],
        difficulty: 'Vanskelig'
      },
      {
        id: 'feil',
        title: 'Feil Test',
        description: 'Øv på spørsmål du har svart feil på',
        icon: <FaExclamationTriangle />,
        color: 'red',
        sporsmalCount: 0, // Variabel
        features: ['Kun feilsvar', 'Personlig tilpasset', 'Forbedre svakheter'],
        difficulty: 'Middels'
      }
    ];

    if (erLærer) {
      // Lærere får flere avanserte alternativer
      baseQuizTypes.push(
        {
          id: 'tilfeldig',
          title: 'Tilfeldig Mix',
          description: 'Blandet quiz fra alle kategorier',
          icon: <FaRandom />,
          color: 'purple',
          sporsmalCount: 20,
          features: ['20 tilfeldige spørsmål', 'Alle kategorier', 'Overraskende mix'],
          difficulty: 'Middels'
        },
        {
          id: 'intensiv',
          title: 'Intensiv Test',
          description: 'Høy vanskelighetsgrad med tidsbegrensning',
          icon: <FaTachometerAlt />,
          color: 'orange',
          sporsmalCount: 30,
          timeLimit: 20, // 20 minutter for 30 spørsmål
          features: ['30 spørsmål', '20 min', 'Høy vanskelighetsgrad'],
          difficulty: 'Vanskelig'
        },
        {
          id: 'ekspert',
          title: 'Ekspert Test',
          description: 'For erfarne instruktører',
          icon: <FaStar />,
          color: 'indigo',
          sporsmalCount: 50,
          features: ['50 spørsmål', 'Alle kategorier', 'Ekspert-nivå'],
          difficulty: 'Vanskelig'
        }
      );
    }

    return baseQuizTypes;
  };

  useEffect(() => {
    lastSporsmal();
    lastKategorier();
    hentKlasseAlternativer();
  }, []);

  const hentKlasseAlternativer = async () => {
    try {
      const klasser = await referenceService.getFørerkortKlasseKoder();
      setKlasseAlternativer(klasser);
    } catch (error) {
      console.error('Feil ved henting av førerkortklass-data:', error);
      // Fallback til hardkodet data
      setKlasseAlternativer(['A1', 'A2', 'A', 'B', 'BE', 'C1', 'C1E', 'C', 'CE', 'D1', 'D1E', 'D', 'DE', 'T', 'S', 'AM146', 'AM147']);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (trinn === 'quiz' && startTid) {
      timer = setInterval(() => {
        const tid = Math.floor((Date.now() - startTid.getTime()) / 1000);
        setTidBrukt(tid);
        
        // Håndter tidsbegrensning
        if (valgtQuizType?.timeLimit) {
          const timeLeftSeconds = (valgtQuizType.timeLimit * 60) - tid;
          setTimeLeft(timeLeftSeconds);
          
          if (timeLeftSeconds <= 0) {
            // Tiden er ute, avslutt quiz
            setTrinn('resultat');
          }
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [trinn, startTid, valgtQuizType]);

  const lastSporsmal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quiz/sporsmal', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlleSporsmal(data);
      } else {
        log.error('Feil ved lasting av spørsmål');
      }
    } catch (error) {
      log.apiError('sporsmal', error);
      log.error('Feil ved lasting av spørsmål');
    }
    setLoading(false);
  };

  const lastKategorier = async () => {
    try {
      const response = await fetch('/api/quiz/kategorier', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKategorier(data);
      } else {
        log.error('Feil ved lasting av kategorier');
      }
    } catch (error) {
      log.apiError('kategorier', error);
      log.error('Feil ved lasting av kategorier');
    }
  };

  const startQuiz = () => {
    if (!valgtQuizType) return;

    let filtrerteSporsmal = [...alleSporsmal];

    // Filtrer basert på rolle og klasse
    const erElev = bruker?.rolle === 'ELEV';
    const brukerBedrift = bruker?.bedrift as any; // Type assertion for å unngå TypeScript-feil
    
    if (erElev && brukerBedrift?.klasser && Array.isArray(brukerBedrift.klasser)) {
      // Elever ser kun spørsmål for sin bedrifts klasser
      const bedriftKlasser = brukerBedrift.klasser.map((k: any) => k.klassekode || k.kode || k);
      filtrerteSporsmal = filtrerteSporsmal.filter(s => 
        s.klasser.some(klasse => bedriftKlasser.includes(klasse))
      );
    } else if (valgtKlasse) {
      // Manuelt valgt klasse
      filtrerteSporsmal = filtrerteSporsmal.filter(s => s.klasser.includes(valgtKlasse));
    }

    // Filtrer basert på kategori for tema test
    if (valgtQuizType.id === 'tema' && valgtKategori) {
      filtrerteSporsmal = filtrerteSporsmal.filter(s => 
        s.kategori?.id === parseInt(valgtKategori)
      );
    }

    // Filtrer spørsmål basert på nivå og tidligere feilsvar
    let filteredSporsmal = filtrerteSporsmal;
    
    // For feil test, filtrer basert på tidligere feilsvar fra localStorage
    if (valgtQuizType?.id === 'feil') {
      const feilsvarData = localStorage.getItem('quiz_feilsvar');
      if (feilsvarData) {
        try {
          const feilsvar = JSON.parse(feilsvarData);
          const feilsvarIds = feilsvar.map((f: any) => f.sporsmalId);
          filteredSporsmal = filteredSporsmal.filter(s => feilsvarIds.includes(s.id));
        } catch (error) {
          log.warn('Kunne ikke parse feilsvar data fra localStorage', { error });
        }
      }
    }

    if (filteredSporsmal.length === 0) {
      alert('Ingen spørsmål funnet for valgte kriterier!');
      return;
    }

    // Bland og velg antall spørsmål
    const blandede = [...filteredSporsmal].sort(() => Math.random() - 0.5);
    const antall = Math.min(valgtQuizType.sporsmalCount, blandede.length);
    const valgte = blandede.slice(0, antall);
    
    setQuizSporsmal(valgte);
    setSvar(new Array(valgte.length).fill(-1));
    setGjeldendeSporsmalsNr(0);
    setStartTid(new Date());
    setTidBrukt(0);
    
    if (valgtQuizType.timeLimit) {
      setTimeLeft(valgtQuizType.timeLimit * 60);
    } else {
      setTimeLeft(null);
    }
    
    setTrinn('quiz');
  };

  const velgSvar = (svarIndex: number) => {
    const nySvar = [...svar];
    nySvar[gjeldendeSporsmalsNr] = svarIndex;
    setSvar(nySvar);
  };

  const nesteSporsmal = () => {
    if (gjeldendeSporsmalsNr < quizSporsmal.length - 1) {
      setGjeldendeSporsmalsNr(gjeldendeSporsmalsNr + 1);
    } else {
      setTrinn('resultat');
    }
  };

  const forrigeSporsmal = () => {
    if (gjeldendeSporsmalsNr > 0) {
      setGjeldendeSporsmalsNr(gjeldendeSporsmalsNr - 1);
    }
  };

  const avsluttQuiz = () => {
    setTrinn('resultat');
  };

  const beregnResultat = () => {
    const riktigeSvar = svar.reduce((sum, svar, index) => {
      return sum + (svar === quizSporsmal[index].riktigSvar ? 1 : 0);
    }, 0);
    
    const prosent = Math.round((riktigeSvar / quizSporsmal.length) * 100);
    
    return {
      riktige: riktigeSvar,
      totalt: quizSporsmal.length,
      prosent,
      bestatt: prosent >= 75
    };
  };

  const formatTid = (sekunder: number) => {
    const minutter = Math.floor(sekunder / 60);
    const sek = sekunder % 60;
    return `${minutter}:${sek.toString().padStart(2, '0')}`;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string; hover: string } } = {
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200', hover: 'hover:bg-green-100' },
      red: { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200', hover: 'hover:bg-red-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (trinn === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center cards-spacing-grid mb-8">
            <button 
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaArrowLeft /> Tilbake til Quiz-dashbord
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center cards-spacing-grid">
              <FaPlay className="text-green-600" />
              Ta Quiz
            </h1>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Velg quiztype:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
                {getQuizTypes().map(quizType => {
                  const colors = getColorClasses(quizType.color);
                  return (
                    <div
                      key={quizType.id}
                      onClick={() => setValgtQuizType(quizType)}
                      className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                        valgtQuizType?.id === quizType.id
                          ? `${colors.border} ${colors.bg} shadow-lg scale-105`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center cards-spacing-grid mb-4">
                        <div className={`text-2xl ${quizType.color === 'yellow' ? 'text-yellow-600' : 
                                                   quizType.color === 'blue' ? 'text-blue-600' :
                                                   quizType.color === 'green' ? 'text-green-600' :
                                                   quizType.color === 'red' ? 'text-red-600' :
                                                   quizType.color === 'purple' ? 'text-purple-600' :
                                                   quizType.color === 'orange' ? 'text-orange-600' :
                                                   'text-indigo-600'}`}>
                          {quizType.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{quizType.title}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            quizType.difficulty === 'Lett' ? 'bg-green-100 text-green-800' :
                            quizType.difficulty === 'Middels' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quizType.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{quizType.description}</p>
                      
                      <div className="space-y-6">
                        {quizType.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <FaCheckCircle className="text-green-500 text-xs" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {valgtQuizType && (
              <div className="cards-spacing-vertical">
                {/* Klassevalg for ikke-elever */}
                {bruker?.rolle !== 'ELEV' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Velg førerkortklasse (valgfritt)
                    </label>
                    <select
                      value={valgtKlasse}
                      onChange={(e) => setValgtKlasse(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Alle klasser</option>
                      {klasseAlternativer.map((klasse: string) => (
                        <option key={klasse} value={klasse}>{klasse}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Kategorivalg for tema test */}
                {valgtQuizType.id === 'tema' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Velg kategori
                    </label>
                    <select
                      value={valgtKategori}
                      onChange={(e) => setValgtKategori(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Velg kategori</option>
                      {kategorier.map(kategori => (
                        <option key={kategori.id} value={kategori.id}>{kategori.navn}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={`rounded-lg p-4 ${getColorClasses(valgtQuizType.color).bg} border ${getColorClasses(valgtQuizType.color).border}`}>
                  <h3 className={`font-semibold mb-2 ${getColorClasses(valgtQuizType.color).text}`}>Quiz-informasjon:</h3>
                  <ul className={`text-sm space-y-1 ${getColorClasses(valgtQuizType.color).text}`}>
                    <li>• Totalt {alleSporsmal.length} spørsmål tilgjengelig</li>
                    {bruker?.rolle === 'ELEV' ? (
                      <li>• Spørsmål tilpasset din bedrifts klasser</li>
                    ) : (
                      <li>• {valgtKlasse ? `Spørsmål for klasse ${valgtKlasse}` : 'Spørsmål fra alle klasser'}</li>
                    )}
                    <li>• Du kan gå tilbake til tidligere spørsmål</li>
                    <li>• {valgtQuizType.timeLimit ? `Tidsbegrensning: ${valgtQuizType.timeLimit} minutter` : 'Ingen tidsbegrensning'}</li>
                    <li>• 75% riktig kreves for å bestå</li>
                  </ul>
                </div>

                <button
                  onClick={startQuiz}
                  disabled={alleSporsmal.length === 0 || (valgtQuizType.id === 'tema' && !valgtKategori)}
                  className="w-full bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center cards-spacing-grid"
                >
                  <FaPlay />
                  Start {valgtQuizType.title}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (trinn === 'quiz') {
    const gjeldendeSpormsmal = quizSporsmal[gjeldendeSporsmalsNr];
    
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {valgtQuizType?.title} - Spørsmål {gjeldendeSporsmalsNr + 1} av {quizSporsmal.length}
                </h1>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((gjeldendeSporsmalsNr + 1) / quizSporsmal.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center cards-spacing-grid">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaClock />
                    <span className="font-semibold">{formatTid(tidBrukt)}</span>
                  </div>
                  {valgtQuizType?.timeLimit && timeLeft !== null && (
                    <div className={`flex items-center gap-2 ${timeLeft < 300 ? 'text-red-600' : 'text-orange-600'}`}>
                      <FaClock />
                      <span className="font-semibold">
                        Tid igjen: {formatTid(Math.max(0, timeLeft))}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={avsluttQuiz}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Avslutt quiz
                </button>
              </div>
            </div>
          </div>

          {/* Spørsmål */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 mb-6">
            {gjeldendeSpormsmal.bildeUrl && (
              <div className="mb-6">
                <img 
                  src={gjeldendeSpormsmal.bildeUrl} 
                  alt="Spørsmålsbilde"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            )}
            
            <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
              {gjeldendeSpormsmal.tekst}
            </h2>

            <div className="space-y-8">
              {gjeldendeSpormsmal.svaralternativer.map((alternativ, index) => (
                <button
                  key={index}
                  onClick={() => velgSvar(index)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                    svar[gjeldendeSporsmalsNr] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center cards-spacing-grid">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      svar[gjeldendeSporsmalsNr] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {svar[gjeldendeSporsmalsNr] === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span>{alternativ}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigasjon */}
          <div className="flex justify-between">
            <button
              onClick={forrigeSporsmal}
              disabled={gjeldendeSporsmalsNr === 0}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Forrige
            </button>
            
            <button
              onClick={nesteSporsmal}
              disabled={svar[gjeldendeSporsmalsNr] === -1}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {gjeldendeSporsmalsNr === quizSporsmal.length - 1 ? 'Fullfør quiz' : 'Neste'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (trinn === 'resultat') {
    const resultat = beregnResultat();
    const timeLeftSeconds = valgtQuizType?.timeLimit ? (valgtQuizType.timeLimit * 60) - tidBrukt : null;
    const tidenGikkUt = timeLeftSeconds !== null && timeLeftSeconds <= 0;
    
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-1">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1 mb-6">
            <div className="text-center mb-8">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                resultat.bestatt ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {resultat.bestatt ? (
                  <FaCheckCircle className="text-4xl text-green-600" />
                ) : (
                  <FaTimesCircle className="text-4xl text-red-600" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {valgtQuizType?.title} fullført!
              </h1>
              
              <p className={`text-xl font-semibold ${
                resultat.bestatt ? 'text-green-600' : 'text-red-600'
              }`}>
                {resultat.bestatt ? 'Bestått!' : 'Ikke bestått'}
              </p>

              {tidenGikkUt && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg px-2 py-1 mt-4">
                  <p className="text-orange-800 font-medium">
                    ⏰ Tiden gikk ut - Quiz ble automatisk avsluttet
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid mb-8">
              <div className="text-center px-2 py-1 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {resultat.prosent}%
                </div>
                <div className="text-sm text-blue-800">Resultat</div>
              </div>
              
              <div className="text-center px-2 py-1 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {resultat.riktige}/{resultat.totalt}
                </div>
                <div className="text-sm text-green-800">Riktige svar</div>
              </div>
              
              <div className="text-center px-2 py-1 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {formatTid(tidBrukt)}
                </div>
                <div className="text-sm text-yellow-800">Tid brukt</div>
              </div>

              <div className="text-center px-2 py-1 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {valgtQuizType?.difficulty}
                </div>
                <div className="text-sm text-purple-800">Vanskelighetsgrad</div>
              </div>
            </div>

            {/* Ytelse-feedback basert på quiz-type */}
            <div className="bg-gray-50 rounded-lg px-2 py-1 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vurdering av prestasjonen:</h3>
              {valgtQuizType?.id === 'hurtig' && (
                <div className="space-y-6">
                  <p className="text-gray-700">• Hurtig test fullført på {formatTid(tidBrukt)}</p>
                  <p className="text-gray-700">• {resultat.prosent >= 85 ? 'Utmerket! Du behersker grunnleggende emner godt.' : 
                                                  resultat.prosent >= 75 ? 'Bra! Du kan fortsette med mer avanserte emner.' :
                                                  'Øv mer på grunnleggende emner før du går videre.'}</p>
                </div>
              )}
              {valgtQuizType?.id === '45spm' && (
                <div className="space-y-6">
                  <p className="text-gray-700">• Teoriprøve-simulering fullført</p>
                  <p className="text-gray-700">• {resultat.prosent >= 90 ? 'Fantastisk! Du er klar for ekte teoriprøve.' : 
                                                  resultat.prosent >= 75 ? 'Godt jobbet! Du har god forståelse av temaene.' :
                                                  'Du bør øve mer før du tar ekte teoriprøve.'}</p>
                </div>
              )}
              {valgtQuizType?.id === 'tema' && (
                <div className="space-y-6">
                  <p className="text-gray-700">• Tema-spesifikk test fullført</p>
                  <p className="text-gray-700">• {resultat.prosent >= 80 ? 'Utmerket forståelse av dette temaet!' : 
                                                  'Fortsett å øve på dette temaet for bedre forståelse.'}</p>
                </div>
              )}
              {valgtQuizType?.id === 'feil' && (
                <div className="space-y-6">
                  <p className="text-gray-700">• Feil-test fullført - fokus på tidligere feilsvar</p>
                  <p className="text-gray-700">• {resultat.prosent >= 80 ? 'Flott fremgang! Du har lært av tidligere feil.' : 
                                                  'Fortsett å øve på disse spørsmålene.'}</p>
                </div>
              )}
            </div>

            {/* Detaljert gjennomgang */}
            <div className="cards-spacing-vertical mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gjennomgang av svar:</h3>
              
              {quizSporsmal.map((sporsmal, index) => {
                const mittSvar = svar[index];
                const riktig = mittSvar === sporsmal.riktigSvar;
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${
                    riktig ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start cards-spacing-grid mb-2">
                      {riktig ? (
                        <FaCheckCircle className="text-green-600 mt-1" />
                      ) : (
                        <FaTimesCircle className="text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Spørsmål {index + 1}: {sporsmal.tekst}
                        </h4>
                        
                        <div className="mt-2 space-y-1">
                          <div className={`text-sm ${riktig ? 'text-green-800' : 'text-red-800'}`}>
                            <strong>Ditt svar:</strong> {mittSvar !== -1 ? `${String.fromCharCode(65 + mittSvar)}. ${sporsmal.svaralternativer[mittSvar]}` : 'Ikke besvart'}
                          </div>
                          
                          {!riktig && (
                            <div className="text-sm text-green-800">
                              <strong>Riktig svar:</strong> {String.fromCharCode(65 + sporsmal.riktigSvar)}. {sporsmal.svaralternativer[sporsmal.riktigSvar]}
                            </div>
                          )}
                          
                          {sporsmal.forklaring && (
                            <div className="text-sm text-gray-600 mt-2 px-2 py-1 bg-gray-100 rounded">
                              <strong>Forklaring:</strong> {sporsmal.forklaring}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex cards-spacing-grid justify-center">
              <button
                onClick={() => {
                  setTrinn('setup');
                  setSvar([]);
                  setGjeldendeSporsmalsNr(0);
                  setTidBrukt(0);
                  setStartTid(null);
                  setValgtQuizType(null);
                  setTimeLeft(null);
                }}
                className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ta ny quiz
              </button>
              
              <button
                onClick={() => navigate('/quiz')}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tilbake til dashbord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 