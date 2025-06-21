import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaBolt, FaTrophy, FaRedo, FaHome, FaClock, FaCheckCircle } from 'react-icons/fa';

interface TestSporsmal {
  id: number;
  sporsmalTekst: string;
  svarKort: string;
  svarDetaljert: string;
  hvorforderVikreligTekst: string;
  vanskelighetsgrad: 'LETT' | 'MIDDELS' | 'VANSKELIG';
  media: any[];
}

interface TestSvar {
  sporsmalId: number;
  svar: string;
  riktig: boolean;
  bruktTid: number;
}

interface Kategori {
  id: number;
  navn: string;
  farge?: string;
  klasse: {
    id: number;
    navn: string;
  };
}

const KategoriTest: React.FC = () => {
  const { kategoriId } = useParams<{ kategoriId: string }>();
  const navigate = useNavigate();
  
  const [kategori, setKategori] = useState<Kategori | null>(null);
  const [testSporsmal, setTestSporsmal] = useState<TestSporsmal[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testSvar, setTestSvar] = useState<TestSvar[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kategoriId) {
      fetchKategoriData();
      startTest();
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

  const startTest = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/kategorier/${kategoriId}/sporsmal?medSvar=true&antall=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente test-spørsmål');
      }

      const data = await response.json();
      
      // Randomiser spørsmål og ta kun 5
      const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 5);
      setTestSporsmal(shuffled);
      setTestStartTime(new Date());
      setQuestionStartTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim() || !questionStartTime) return;

    const currentQuestion = testSporsmal[currentQuestionIndex];
    const timeUsed = Date.now() - questionStartTime.getTime();
    
    // Enkel sjekk om svaret er riktig (contains key terms from correct answer)
    const correctAnswer = currentQuestion.svarKort.toLowerCase();
    const userAnswer = currentAnswer.toLowerCase();
    const isCorrect = correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer) || 
                     userAnswer.length > 5 && correctAnswer.split(' ').some(word => userAnswer.includes(word));

    const svar: TestSvar = {
      sporsmalId: currentQuestion.id,
      svar: currentAnswer,
      riktig: isCorrect,
      bruktTid: timeUsed
    };

    setTestSvar([...testSvar, svar]);
    setShowFeedback(true);

    // Send progresjon til backend
    saveProgresjon(currentQuestion.id, isCorrect);
  };

  const saveProgresjon = async (sporsmalId: number, riktigSvar: boolean) => {
    try {
      await fetch(`/api/sikkerhetskontroll-laering/progresjon/sporsmal/${sporsmalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: riktigSvar ? 'MESTRET' : 'VANSKELIG',
          riktigSvar
        })
      });
    } catch (err) {
      console.error('Feil ved lagring av progresjon:', err);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < testSporsmal.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setShowFeedback(false);
      setQuestionStartTime(new Date());
    } else {
      // Test ferdig
      setTestCompleted(true);
      checkForAchievements();
    }
  };

  const checkForAchievements = async () => {
    const correctAnswers = testSvar.filter(s => s.riktig).length;
    const score = (correctAnswers / testSporsmal.length) * 100;

    // Oppdater kategori-mestring status
    try {
      await fetch(`/api/sikkerhetskontroll-laering/kategorier/${kategoriId}/mestring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          score,
          testType: 'kategori_test'
        })
      });
    } catch (err) {
      console.error('Feil ved oppdatering av kategori-mestring:', err);
    }

    // Sjekk for "Test Kunnskapen" achievement
    if (score >= 80) {
      try {
        await fetch('/api/sikkerhetskontroll-laering/achievements/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: 'kategori_test',
            kategoriId: kategori?.id,
            score
          })
        });
      } catch (err) {
        console.error('Feil ved sjekk av achievements:', err);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return { message: 'Flott jobba! Du har mestret denne kategorien! 🎉', badge: 'Mestret' };
    if (score >= 60) return { message: 'Bra jobba! Du er på god vei. Øv litt mer for å mestre kategorien.', badge: 'God fremgang' };
    return { message: 'Ikke gi opp! Gå tilbake og øv mer på spørsmålene du feilet på.', badge: 'Trenger mer øving' };
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
        <p className="text-red-800">Feil: {error || 'Kunne ikke laste test'}</p>
      </div>
    );
  }

  if (testCompleted) {
    const totalTime = testStartTime ? Date.now() - testStartTime.getTime() : 0;
    const correctAnswers = testSvar.filter(s => s.riktig).length;
    const score = Math.round((correctAnswers / testSporsmal.length) * 100);
    const scoreInfo = getScoreMessage(score);

    return (
      <div className="max-w-4xl mx-auto px-2 py-1 cards-spacing-vertical">
        <div className="text-center cards-spacing-vertical">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-4">
            <FaCheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Test Fullført!</h1>
          <p className="text-lg text-gray-600">{kategori.navn} - {kategori.klasse.navn}</p>
        </div>

        {/* Resultat */}
        <div className="bg-white border border-gray-200 rounded-xl px-2 py-1 text-center cards-spacing-vertical">
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">{scoreInfo.message}</h2>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              score >= 80 ? 'bg-green-100 text-green-800' :
              score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {scoreInfo.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid mt-6">
            <div className="bg-blue-50 px-2 py-1 rounded-lg">
              <FaCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 font-medium">Riktige svar</p>
              <p className="text-xl font-bold text-blue-900">{correctAnswers} / {testSporsmal.length}</p>
            </div>
            
            <div className="bg-green-50 px-2 py-1 rounded-lg">
              <FaClock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">Total tid</p>
              <p className="text-xl font-bold text-green-900">{Math.round(totalTime / 1000)}s</p>
            </div>

            <div className="bg-yellow-50 px-2 py-1 rounded-lg">
              <FaBolt className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 font-medium">XP opptjent</p>
              <p className="text-xl font-bold text-yellow-900">{score >= 80 ? 25 : 10}</p>
            </div>
          </div>
        </div>

        {/* Handlinger */}
        <div className="flex flex-col sm:flex-row cards-spacing-grid justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaRedo className="w-4 h-4" />
            <span>Ta test på nytt</span>
          </button>

          <Link
            to={`/sikkerhetskontroll-laering/kategori/${kategoriId}`}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Tilbake til læring</span>
          </Link>

          <Link
            to="/sikkerhetskontroll-laering"
            className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 transition-colors"
          >
            <FaHome className="w-4 h-4" />
            <span>Hjem</span>
          </Link>
        </div>

        {/* Detaljert gjennomgang */}
        <div className="cards-spacing-vertical">
          <h3 className="text-xl font-bold text-gray-900">Gjennomgang</h3>
          {testSporsmal.map((sporsmal, index) => {
            const svar = testSvar[index];
            return (
              <div key={sporsmal.id} className="bg-white border border-gray-200 rounded-lg px-2 py-1">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex-1">{sporsmal.sporsmalTekst}</h4>
                  <div className={`ml-4 p-2 rounded-full ${
                    svar.riktig ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {svar.riktig ? (
                      <FaCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <FaTimes className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-6 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Ditt svar:</span>
                    <p className={svar.riktig ? 'text-green-800' : 'text-red-800'}>{svar.svar}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Riktig svar:</span>
                    <p className="text-blue-800">{sporsmal.svarKort}</p>
                  </div>
                  {sporsmal.svarDetaljert && (
                    <div>
                      <span className="font-medium text-gray-700">Forklaring:</span>
                      <p className="text-gray-600">{sporsmal.svarDetaljert}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = testSporsmal[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testSporsmal.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div className="cards-spacing-vertical">
        <Link 
          to={`/sikkerhetskontroll-laering/kategori/${kategoriId}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Avbryt test</span>
        </Link>

        <div className="text-center cards-spacing-vertical">
          <h1 className="text-2xl font-bold text-gray-900">Test Kunnskapen</h1>
          <p className="text-lg text-gray-600">{kategori.navn} - {kategori.klasse.navn}</p>
          
          {/* Progresjonsbalk */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Spørsmål {currentQuestionIndex + 1} av {testSporsmal.length}
          </p>
        </div>
      </div>

      {/* Spørsmål */}
      {currentQuestion && (
        <div className="bg-white border border-gray-200 rounded-xl px-2 py-1 cards-spacing-vertical">
          <h2 className="text-xl font-medium text-gray-900">
            {currentQuestion.sporsmalTekst}
          </h2>

          {!showFeedback ? (
            <div className="cards-spacing-vertical">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Skriv ditt svar her..."
                className="w-full px-2 py-1 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim()}
                className="w-full bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send svar
              </button>
            </div>
          ) : (
            <div className="cards-spacing-vertical">
              {/* Feedback */}
              <div className={`p-4 rounded-lg border ${
                testSvar[testSvar.length - 1]?.riktig 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  {testSvar[testSvar.length - 1]?.riktig ? (
                    <FaCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <FaTimes className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    testSvar[testSvar.length - 1]?.riktig ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testSvar[testSvar.length - 1]?.riktig ? 'Riktig!' : 'Ikke helt riktig'}
                  </span>
                </div>
                
                <div className="space-y-8 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Riktig svar:</span>
                    <p className="text-blue-800 mt-1">{currentQuestion.svarKort}</p>
                  </div>
                  
                  {currentQuestion.svarDetaljert && (
                    <div>
                      <span className="font-medium text-gray-700">Forklaring:</span>
                      <p className="text-gray-600 mt-1">{currentQuestion.svarDetaljert}</p>
                    </div>
                  )}

                  {currentQuestion.hvorforderVikreligTekst && (
                    <div>
                      <span className="font-medium text-gray-700">Hvorfor er dette viktig?</span>
                      <p className="text-gray-600 mt-1">{currentQuestion.hvorforderVikreligTekst}</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={nextQuestion}
                className="w-full bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex < testSporsmal.length - 1 ? 'Neste spørsmål' : 'Vis resultater'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KategoriTest; 