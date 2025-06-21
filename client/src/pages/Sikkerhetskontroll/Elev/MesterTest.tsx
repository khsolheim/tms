import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaBolt, FaClock, FaCheckCircle, FaTrophy, FaFire, FaStar, FaAward } from 'react-icons/fa';

interface MesterScenario {
  id: string;
  tittel: string;
  beskrivelse: string;
  kategorier: string[];
  vanskelighetsgrad: 'EKSTREM' | 'MESTER';
  sporsmal: MesterSporsmal[];
  tidsbegrensning: number; // sekunder
  passScore: number; // prosent
}

interface MesterSporsmal {
  id: number;
  sporsmalTekst: string;
  scenarioKontekst: string;
  type: 'ANALYSE' | 'PROBLEMLØSNING' | 'PRIORITERING' | 'RISIKOVURDERING';
  svarKort: string;
  svarDetaljert: string;
  ekspertKommentar: string;
  poeng: number;
  kritiske_punkter: string[];
}

interface Kategori {
  id: number;
  navn: string;
  klasse: {
    id: number;
    navn: string;
  };
}

const MesterTest: React.FC = () => {
  const { kategoriId } = useParams<{ kategoriId: string }>();
  
  const [kategori, setKategori] = useState<Kategori | null>(null);
  const [scenario, setScenario] = useState<MesterScenario | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [svar, setSvar] = useState<Array<{sporsmalId: number, svar: string, poeng: number}>>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpertFeedback, setShowExpertFeedback] = useState(false);

  useEffect(() => {
    if (kategoriId) {
      fetchKategoriData();
      generateMesterScenario();
    }
  }, [kategoriId]);

  useEffect(() => {
    if (scenario && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [scenario, timeRemaining]);

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

  const generateMesterScenario = async () => {
    try {
      // Simuler et mester-scenario (i produksjon ville dette komme fra API)
      const mesterScenario: MesterScenario = {
        id: `mester-${kategoriId}-${Date.now()}`,
        tittel: "Den Ultimate Mester-utfordringen",
        beskrivelse: "Et kritisk scenario som tester din ekspertise på tvers av alle sikkerhetskontroll-områder. Du har 30 minutter på deg.",
        kategorier: ["Bremser", "Motor", "Lys", "Hjul", "Speil"],
        vanskelighetsgrad: "MESTER",
        tidsbegrensning: 30 * 60, // 30 minutter
        passScore: 85,
        sporsmal: [
          {
            id: 1,
            sporsmalTekst: "Et kjøretøy kommer til kontroll med dårlige bremser og defekte lys. Hvilken prioritering vil du gjøre, og hvorfor?",
            scenarioKontekst: "Bilen har nylig vært i en ulykke. Eieren trenger å bruke bilen til jobb i morgen og presser på for rask godkjenning.",
            type: "PRIORITERING",
            svarKort: "Bremser først (sikkerhetskritisk), deretter lys (lovpålagt), og grundig inspeksjon av alle systemer",
            svarDetaljert: "Bremser er livskritiske og må prioriteres høyest. Lys er også lovpålagt og sikkerhetskritisk, spesielt om natten. Begge må være i orden før godkjenning.",
            ekspertKommentar: "Som mester må du kunne prioritere basert på risikovurdering og aldri gi etter for press om å godkjenne usikre kjøretøy.",
            poeng: 25,
            kritiske_punkter: ["Bremsesystem", "Lyssystem", "Risikoanalyse", "Lovpålagte krav"]
          },
          {
            id: 2,
            sporsmalTekst: "Analyse dette komplekse tilfellet: Bilen har intermitterende ABS-feil, ujevn hjulslitasje, og vibrering i rattet. Hva er din systematiske tilnærming?",
            scenarioKontekst: "Kunden har hatt problemet i 3 måneder men først nå søkt hjelp. Bilen brukes daglig til lang-transport.",
            type: "PROBLEMLØSNING", 
            svarKort: "Systematisk inspeksjon: ABS-sensorer, hjulbalansering, hjuloppheng, bremsekomponenter",
            svarDetaljert: "Starter med ABS-diagnostikk, sjekker hjulsensorer, inspekterer hjuloppheng for slitasje, vurderer sammenheng mellom symptomene",
            ekspertKommentar: "Mester-nivå krever å se sammenhenger mellom symptomer og finne rot-årsaken, ikke bare reparere delproblemer.",
            poeng: 30,
            kritiske_punkter: ["ABS-system", "Hjulbalanse", "Hjuloppheng", "Diagnostikk"]
          },
          {
            id: 3,
            sporsmalTekst: "Risikovurdering: En taxi med høy kilometerstand har marginale, men lovlige bremseverdier. Hva er din vurdering?",
            scenarioKontekst: "Taxien har full ruteplan neste uke, inkludert transport av skolebarn. Eieren spør om han kan vente med utskifting i 2 uker.",
            type: "RISIKOVURDERING",
            svarKort: "Ikke godkjenn - kommersiell bruk krever høyere sikkerhetsmargin, spesielt med skolebarn ombord",
            svarDetaljert: "Kommersiell bruk, høy belastning og transport av barn krever ekstra sikkerhetsmargin. Selv lovlige verdier kan være utilstrekkelige.",
            ekspertKommentar: "Som mester må du vurdere brukskontekst, ikke bare minimumskrav. Ansvar for andres sikkerhet er paramount.",
            poeng: 25,
            kritiske_punkter: ["Kommersiell bruk", "Sikkerhetsmargin", "Ansvar", "Risikoanalyse"]
          },
          {
            id: 4,
            sporsmalTekst: "En veteranbil fra 1970 skal moderniseres med LED-lys. Hvilke hensyn må du ta, og hva kreves for godkjenning?",
            scenarioKontekst: "Eieren vil oppgradere alt til moderne LED, men bilen skal beholde vintage-utseende og originale kabler.",
            type: "ANALYSE",
            svarKort: "EMC-godkjenning, strømforbruk, retrofitting-regler, og kompatibilitet med originale systemer",
            svarDetaljert: "LED-er krever EMC-godkjenning, har annet strømforbruk enn originale pærer, og må følge retrofitting-forskrifter for historiske kjøretøy.",
            ekspertKommentar: "Modernisering av klassiske biler krever dyp forståelse av både gamle og nye systemer, samt spesialregler.",
            poeng: 20,
            kritiske_punkter: ["EMC-godkjenning", "LED-teknologi", "Retrofitting", "Historiske kjøretøy"]
          }
        ]
      };

      setScenario(mesterScenario);
      setTimeRemaining(mesterScenario.tidsbegrensning);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke generere mester-scenario');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer || !scenario) return;

    const currentQuestion = scenario.sporsmal[currentQuestionIndex];
    
    // Enkel scoring basert på nøkkelord (skulle vært mer sofistikert i produksjon)
    let poeng = 0;
    const answer = currentAnswer.toLowerCase();
    const criticalPoints = currentQuestion.kritiske_punkter;
    
    criticalPoints.forEach(point => {
      if (answer.includes(point.toLowerCase())) {
        poeng += Math.floor(currentQuestion.poeng / criticalPoints.length);
      }
    });

    const newSvar = [...svar, {
      sporsmalId: currentQuestion.id,
      svar: currentAnswer,
      poeng: poeng
    }];
    
    setSvar(newSvar);
    setShowExpertFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < scenario!.sporsmal.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setShowExpertFeedback(false);
    } else {
      setTestCompleted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return 'text-red-600'; // Under 5 min
    if (timeRemaining < 900) return 'text-orange-600'; // Under 15 min
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (error || !kategori || !scenario) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        <p className="text-red-800">Feil: {error || 'Kunne ikke laste mester-test'}</p>
      </div>
    );
  }

  if (testCompleted) {
    const totalPoeng = svar.reduce((sum, s) => sum + s.poeng, 0);
    const maxPoeng = scenario.sporsmal.reduce((sum, s) => sum + s.poeng, 0);
    const score = Math.round((totalPoeng / maxPoeng) * 100);
    const isMaster = score >= scenario.passScore;

    return (
      <div className="max-w-6xl mx-auto px-2 py-1 cards-spacing-vertical">
        <div className="text-center cards-spacing-vertical">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
            isMaster ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'
          }`}>
            {isMaster ? (
              <FaTrophy className="w-12 h-12 text-white" />
            ) : (
              <FaFire className="w-12 h-12 text-white" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900">
            {isMaster ? 'Gratulerer, Mester!' : 'Nesten der!'}
          </h1>
          <p className="text-xl text-gray-600">{kategori.navn} - {kategori.klasse.navn}</p>
          <p className="text-lg text-yellow-600 font-medium">Nivå 4: Mester - Ultimate Challenge</p>
        </div>

        {/* Hovedresultat */}
        <div className="bg-white border-2 border-gray-200 rounded-xl px-2 py-1 text-center cards-spacing-vertical">
          <div className={`text-7xl font-bold ${isMaster ? 'text-yellow-600' : 'text-gray-600'}`}>
            {score}%
          </div>
          
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isMaster 
                ? 'Du har oppnådd Mester-status! 🏆' 
                : `Du trenger ${scenario.passScore}% for Mester-status. Fortsett å øve! 💪`
              }
            </h2>
            
            <div className="flex items-center justify-center space-x-4">
              <span className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${
                isMaster 
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isMaster ? '🏆 MESTER' : 'Ikke bestått'}
              </span>
            </div>
          </div>

          {/* Detaljert statistikk */}
          <div className="grid grid-cols-2 md:grid-cols-4 cards-spacing-grid mt-8">
            <div className="bg-yellow-50 px-2 py-1 rounded-lg">
              <FaAward className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 font-medium">Poeng oppnådd</p>
              <p className="text-xl font-bold text-yellow-900">{totalPoeng} / {maxPoeng}</p>
            </div>
            
            <div className="bg-orange-50 px-2 py-1 rounded-lg">
              <FaClock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-700 font-medium">Tid brukt</p>
              <p className="text-xl font-bold text-orange-900">{formatTime(scenario.tidsbegrensning - timeRemaining)}</p>
            </div>

            <div className="bg-purple-50 px-2 py-1 rounded-lg">
              <FaBolt className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 font-medium">XP opptjent</p>
              <p className="text-xl font-bold text-purple-900">{isMaster ? 200 : Math.floor(score * 1.5)}</p>
            </div>

            <div className="bg-green-50 px-2 py-1 rounded-lg">
              <FaStar className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">Vanskelighetsgrad</p>
              <p className="text-xl font-bold text-green-900">{scenario.vanskelighetsgrad}</p>
            </div>
          </div>

          {isMaster && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg px-2 py-1 mt-6">
              <h3 className="text-xl font-bold text-yellow-800 mb-3">🏆 Mester-sertifikat opptjent!</h3>
              <p className="text-yellow-700">
                Du har demonstrert mester-kompetanse innen sikkerhetskontroll. 
                Dette kvalifiserer deg til å veilede andre og ta på deg de mest utfordrende oppgavene.
              </p>
            </div>
          )}
        </div>

        {/* Ekspert-tilbakemelding */}
        <div className="cards-spacing-vertical">
          <h3 className="text-2xl font-bold text-gray-900">Ekspert-tilbakemelding</h3>
          <div className="grid cards-spacing-grid">
            {scenario.sporsmal.map((sporsmal, index) => {
              const mySvar = svar[index];
              
              return (
                <div key={sporsmal.id} className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        sporsmal.type === 'ANALYSE' ? 'bg-blue-100 text-blue-800' :
                        sporsmal.type === 'PROBLEMLØSNING' ? 'bg-green-100 text-green-800' :
                        sporsmal.type === 'PRIORITERING' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sporsmal.type}
                      </div>
                      <h4 className="font-medium text-gray-900 flex-1">{sporsmal.sporsmalTekst}</h4>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-lg font-bold text-yellow-600">{mySvar?.poeng || 0}/{sporsmal.poeng}</p>
                    </div>
                  </div>
                  
                  <div className="cards-spacing-vertical text-sm">
                    <div className="bg-gray-50 px-2 py-1 rounded">
                      <span className="font-medium text-gray-700">Scenario:</span>
                      <p className="text-gray-600 mt-1">{sporsmal.scenarioKontekst}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Ditt svar:</span>
                      <p className="text-gray-800 mt-1">{mySvar?.svar || 'Ikke besvart'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Mester-svar:</span>
                      <p className="text-blue-800 mt-1">{sporsmal.svarDetaljert}</p>
                    </div>
                    
                    <div className="bg-yellow-50 px-2 py-1 rounded border-l-4 border-yellow-400">
                      <span className="font-medium text-yellow-800">💡 Ekspert-kommentar:</span>
                      <p className="text-yellow-700 mt-1">{sporsmal.ekspertKommentar}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Handlinger */}
        <div className="flex flex-wrap cards-spacing-grid justify-center">
          {!isMaster && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center space-x-2 bg-yellow-600 text-white px-2 py-1 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <FaTrophy className="w-4 h-4" />
              <span>Prøv Mester igjen</span>
            </button>
          )}

          <Link
            to={`/sikkerhetskontroll-laering/kategori/${kategoriId}/testkandidat`}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Tilbake til Testkandidat</span>
          </Link>

          <Link
            to={`/sikkerhetskontroll-laering/kategori/${kategoriId}`}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Tilbake til læring</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = scenario.sporsmal[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / scenario.sporsmal.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-2 py-1 cards-spacing-vertical">
      <div className="text-center cards-spacing-vertical">
        <div className="flex items-center justify-center space-x-3">
          <FaTrophy className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Nivå 4: Mester</h1>
          <FaTrophy className="w-8 h-8 text-yellow-600" />
        </div>
        <p className="text-lg text-gray-600">Ultimate Challenge - Mester-nivå implementeres</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
          <h3 className="text-xl font-bold text-yellow-800 mb-3">🏆 Mester-utfordringen</h3>
          <p className="text-yellow-700">
            Dette er det ultimate nivået som tester ekspertise på tvers av alle kategorier.
            Tverrfaglige scenarioer, risikovurdering og mester-kompetanse kreves.
          </p>
        </div>
        
        <Link 
          to={`/sikkerhetskontroll-laering/kategori/${kategoriId}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Tilbake til læring</span>
        </Link>
      </div>
    </div>
  );
};

export default MesterTest; 