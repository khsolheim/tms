import React, { useState, useEffect } from 'react';

interface QuizKategori {
  id: number;
  navn: string;
  klasse: string;
  beskrivelse?: string;
  farge?: string;
  ikon?: string;
  moduleType?: string;
  estimatedDuration?: number;
  aktiv: boolean;
  sporsmalCount?: number;
}

interface QuizSporsmal {
  id: number;
  tekst: string;
  svaralternativer: string[];
  riktigSvar: number;
  bildeUrl?: string;
  forklaring?: string;
  klasser: string[];
  kategoriId?: number;
  vanskelighetsgrad?: string;
  mediaType?: string;
  mediaUrl?: string;
  estimertTid?: number;
  aiGenerated: boolean;
}

interface QuizSession {
  id: string;
  userId: number;
  kategoriId?: number;
  quizType: string;
  questionsTotal?: number;
  questionsAnswered?: number;
  questionsCorrect?: number;
  difficulty?: string;
  completed: boolean;
  score?: number;
  percentage?: number;
  timeSpent?: number;
  startTime: Date;
  endTime?: Date;
}

interface UserGameState {
  totalXP: number;
  level: number;
  achievements: number;
  currentStreak: number;
}

const EnhancedQuiz: React.FC = () => {
  const [kategorier, setKategorier] = useState<QuizKategori[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<QuizKategori | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizSporsmal | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizSporsmal[]>([]);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [score, setScore] = useState(0);
  const [confidence, setConfidence] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userGameState, setUserGameState] = useState<UserGameState>({
    totalXP: 1250,
    level: 3,
    achievements: 8,
    currentStreak: 5
  });

  // Mock data for demonstration
  const mockKategorier: QuizKategori[] = [
    {
      id: 1,
      navn: 'Trafikkregler',
      klasse: 'B',
      beskrivelse: 'Grunnleggende trafikkregler for bil',
      farge: '#3B82F6',
      ikon: '🚦',
      moduleType: 'standard',
      estimatedDuration: 15,
      aktiv: true,
      sporsmalCount: 25
    },
    {
      id: 2,
      navn: 'Sikkerhet',
      klasse: 'B',
      beskrivelse: 'Sikkerhet i trafikken',
      farge: '#EF4444',
      ikon: '🛡️',
      moduleType: 'micro',
      estimatedDuration: 10,
      aktiv: true,
      sporsmalCount: 18
    },
    {
      id: 3,
      navn: 'Miljø og Økonomi',
      klasse: 'B',
      beskrivelse: 'Miljøvennlig og økonomisk kjøring',
      farge: '#10B981',
      ikon: '🌱',
      moduleType: 'adaptive',
      estimatedDuration: 20,
      aktiv: true,
      sporsmalCount: 30
    }
  ];

  const mockQuestions: QuizSporsmal[] = [
    {
      id: 1,
      tekst: 'Hva er fartsgrensen i tettbebygd strøk?',
      svaralternativer: ['30 km/h', '50 km/h', '60 km/h', '80 km/h'],
      riktigSvar: 1,
      forklaring: 'Fartsgrensen i tettbebygd strøk er 50 km/h dersom ikke annet er skiltet.',
      klasser: ['B'],
      kategoriId: 1,
      vanskelighetsgrad: 'Lett',
      estimertTid: 30,
      aiGenerated: false
    },
    {
      id: 2,
      tekst: 'Hvor lang er stopplengden ved 50 km/h på tørr asfalt?',
      svaralternativer: ['15 meter', '25 meter', '35 meter', '50 meter'],
      riktigSvar: 1,
      forklaring: 'Stopplengden ved 50 km/h på tørr asfalt er cirka 25 meter.',
      klasser: ['B'],
      kategoriId: 1,
      vanskelighetsgrad: 'Middels',
      estimertTid: 45,
      aiGenerated: false
    },
    {
      id: 3,
      tekst: 'Når er det påbudt å bruke nærlys på bil?',
      svaralternativer: ['Bare når det er mørkt', 'Bare i tunnel', 'Alltid når du kjører', 'Bare ved dårlig sikt'],
      riktigSvar: 2,
      forklaring: 'Du skal alltid kjøre med nærlys på bil, hele døgnet.',
      klasser: ['B'],
      kategoriId: 1,
      vanskelighetsgrad: 'Lett',
      estimertTid: 25,
      aiGenerated: false
    }
  ];

  useEffect(() => {
    setKategorier(mockKategorier);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  const startQuiz = (kategori: QuizKategori, quizType: string = 'standard') => {
    setSelectedKategori(kategori);
    setQuestions(mockQuestions);
    setCurrentQuestion(mockQuestions[0]);
    setCurrentQuestionIndex(0);
    setIsActive(true);
    setIsCompleted(false);
    setShowResults(false);
    setTimeSpent(0);
    setScore(0);
    setUserAnswer(null);
  };

  const submitAnswer = () => {
    if (userAnswer === null || !currentQuestion) return;

    const isCorrect = userAnswer === currentQuestion.riktigSvar;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Move to next question or complete quiz
    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestion(questions[currentQuestionIndex + 1]);
        setUserAnswer(null);
      } else {
        completeQuiz();
      }
    }, 1500);
  };

  const completeQuiz = () => {
    setIsActive(false);
    setIsCompleted(true);
    setShowResults(true);
    
    // Update user game state (mock)
    const xpGained = Math.floor((score / questions.length) * 100);
    setUserGameState(prev => ({
      ...prev,
      totalXP: prev.totalXP + xpGained,
      currentStreak: prev.currentStreak + 1
    }));
  };

  const resetQuiz = () => {
    setSelectedKategori(null);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setUserAnswer(null);
    setIsActive(false);
    setIsCompleted(false);
    setShowResults(false);
    setTimeSpent(0);
    setScore(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = (): number => {
    if (!questions.length) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎉 Quiz Fullført!</h1>
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-5xl font-bold">{percentage.toFixed(1)}%</div>
              <div className="text-xl">Din Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{score}/{questions.length}</div>
              <div className="text-lg">Riktige Svar</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{formatTime(timeSpent)}</div>
              <div className="text-lg">Tid Brukt</div>
            </div>
          </div>
        </div>

        {/* XP and Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-yellow-100 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-700">+{Math.floor(percentage)} XP</div>
            <div className="text-yellow-600">Experience Points</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-purple-700">Level {userGameState.level}</div>
            <div className="text-purple-600">Ditt Nivå</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={resetQuiz}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Ta Ny Quiz
          </button>
          <button
            onClick={() => alert('Analytics funksjon kommer snart!')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            📊 Se Analytikk
          </button>
        </div>
      </div>
    );
  }

  if (isActive && currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Spørsmål {currentQuestionIndex + 1} av {questions.length}
            </h2>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                ⏱️ {formatTime(timeSpent)}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                currentQuestion.vanskelighetsgrad === 'Lett' ? 'bg-green-100 text-green-800' :
                currentQuestion.vanskelighetsgrad === 'Middels' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.vanskelighetsgrad}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercent()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            {currentQuestion.tekst}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.svaralternativer.map((alternativ, index) => (
              <button
                key={index}
                onClick={() => setUserAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  userAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {alternativ}
              </button>
            ))}
          </div>

          {/* Confidence Slider */}
          {userAnswer !== null && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hvor sikker er du på svaret? {confidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Gjettet</span>
                <span>Usikker</span>
                <span>Sikker</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={resetQuiz}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Avslutt Quiz
            </button>
            
            <button
              onClick={submitAnswer}
              disabled={userAnswer === null}
              className={`font-bold py-2 px-6 rounded ${
                userAnswer === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-700 text-white'
              }`}
            >
              Submit Svar
            </button>
          </div>
        </div>

        {/* Explanation (if answered incorrectly) */}
        {userAnswer !== null && userAnswer !== currentQuestion.riktigSvar && currentQuestion.forklaring && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-700">
              <strong>Forklaring:</strong> {currentQuestion.forklaring}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🎯 Forbedret Quiz System</h1>
        <p className="text-xl text-gray-600">Utforsk vårt nye adaptive læringssystem</p>
      </div>

      {/* User Progress Display */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{userGameState.level}</div>
            <div className="text-sm opacity-90">Level</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{userGameState.totalXP}</div>
            <div className="text-sm opacity-90">Total XP</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{userGameState.achievements}</div>
            <div className="text-sm opacity-90">Achievements</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{userGameState.currentStreak}</div>
            <div className="text-sm opacity-90">Streak</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Velg Quiz Kategori:</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kategorier.map((kategori) => (
          <div
            key={kategori.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            onClick={() => setSelectedKategori(kategori)}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                  style={{ backgroundColor: kategori.farge || '#3B82F6' }}
                >
                  {kategori.ikon || kategori.navn.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{kategori.navn}</h3>
                  <p className="text-gray-600">Klasse {kategori.klasse}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{kategori.beskrivelse}</p>
              
              <div className="flex justify-between items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {kategori.sporsmalCount} spørsmål
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ~{kategori.estimatedDuration} min
                </span>
              </div>

              {kategori.moduleType && (
                <div className="mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    kategori.moduleType === 'adaptive' ? 'bg-purple-100 text-purple-800' :
                    kategori.moduleType === 'micro' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {kategori.moduleType}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Type Selection Dialog */}
      {selectedKategori && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Start Quiz: {selectedKategori.navn}</h3>
            <p className="text-gray-600 mb-6">{selectedKategori.beskrivelse}</p>
            
            <h4 className="text-lg font-semibold mb-4">Velg Quiz Type:</h4>
            
            <div className="space-y-3">
              <button
                onClick={() => startQuiz(selectedKategori, 'standard')}
                className="w-full p-4 text-left border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-blue-600">📝 Standard Quiz</div>
                <div className="text-sm text-gray-600">Tradisjonell quiz med fast vanskelighetsgrad</div>
              </button>
              
              <button
                onClick={() => startQuiz(selectedKategori, 'adaptive')}
                className="w-full p-4 text-left border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="font-semibold text-green-600">🧠 Adaptiv Quiz</div>
                <div className="text-sm text-gray-600">AI tilpasser vanskelighetsgrad basert på din prestasjon</div>
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedKategori(null)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuiz;