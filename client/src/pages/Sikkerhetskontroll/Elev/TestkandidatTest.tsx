import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaBolt, FaClock, FaCheckCircle, FaPlay, FaPause, FaFlag } from 'react-icons/fa';

interface TestSporsmal {
  id: number;
  sporsmalTekst: string;
  type: 'FLERVALG' | 'SKRIFTLIG';
  svarKort: string;
  svarDetaljert: string;
  svaralternativer?: string[];
  riktigSvarIndeks?: number;
}

interface Kategori {
  id: number;
  navn: string;
  klasse: {
    id: number;
    navn: string;
  };
}

const TestkandidatTest: React.FC = () => {
  const { kategoriId } = useParams<{ kategoriId: string }>();
  
  const [kategori, setKategori] = useState<Kategori | null>(null);
  const [testSporsmal, setTestSporsmal] = useState<TestSporsmal[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string | number>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kategoriId) {
      fetchKategoriData();
      fetchTestSporsmal();
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

  const fetchTestSporsmal = async () => {
    try {
      const response = await fetch(`/api/sikkerhetskontroll-laering/kategorier/${kategoriId}/testkandidat-sporsmal`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente test-spørsmål');
      }

      const data = await response.json();
      
      // Ta maks 10 spørsmål for testing
      const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
      setTestSporsmal(shuffled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < testSporsmal.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
          <span>Tilbake til læring</span>
        </Link>

        <div className="text-center cards-spacing-vertical">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900">Nivå 3: Testkandidat</h1>
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-600">{kategori.navn} - {kategori.klasse.navn}</p>
          <p className="text-sm text-purple-600">🎯 Realistisk eksamen-simulering</p>
          
          {/* Progresjonsbalk */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-300"
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
        <div className="bg-white border border-purple-200 rounded-xl px-2 py-1 cards-spacing-vertical">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-medium text-gray-900 flex-1">
              {currentQuestion.sporsmalTekst}
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentQuestion.type === 'FLERVALG' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {currentQuestion.type === 'FLERVALG' ? 'Flervalg' : 'Skriftlig'}
            </div>
          </div>

          <div className="cards-spacing-vertical">
            {/* Svaralternativer basert på type */}
            {currentQuestion.type === 'FLERVALG' ? (
              <div className="space-y-8">
                {currentQuestion.svaralternativer?.map((alternativ, index) => (
                  <label key={index} className="flex items-center space-x-3 px-2 py-1 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                    <input
                      type="radio"
                      name="svar"
                      value={index}
                      checked={currentAnswer === index}
                      onChange={(e) => setCurrentAnswer(parseInt(e.target.value))}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-900">{alternativ}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={String(currentAnswer)}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Skriv ditt svar her..."
                className="w-full px-2 py-1 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            )}
            
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                {currentQuestion.type === 'FLERVALG' ? 'Velg ett alternativ' : 'Skriv et detaljert svar'}
              </div>
              
              <button
                onClick={nextQuestion}
                disabled={!currentAnswer}
                className="bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex < testSporsmal.length - 1 ? 'Neste spørsmål' : 'Fullfør test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo melding */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1 text-center">
        <p className="text-purple-800">
          🚧 <strong>Demo-versjon:</strong> Testkandidat-funksjonen er under utvikling. 
          Flervalgs og skriftlige spørsmål genereres automatisk fra eksisterende data.
        </p>
      </div>
    </div>
  );
};

export default TestkandidatTest; 