import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

// Simplified interface without complex Grid components
interface UserGameState {
  level: number;
  totalXP: number;
  achievements: Array<{ id: string; title: string; description: string; icon: string }>;
  analytics: {
    totalSessions: number;
    averageScore: number;
    improvementTrend: number;
  };
}

interface QuizState {
  currentQuestionIndex: number;
  questions: Array<{
    id: string;
    tekst: string;
    alternativer: Array<{ id: string; tekst: string; riktig: boolean }>;
    vanskelighetsgrad: string;
  }>;
  timeSpent: number;
  answers: Array<{ questionId: string; selectedAnswer: string; isCorrect: boolean; timeSpent: number }>;
}

interface Kategori {
  id: string;
  navn: string;
  beskrivelse: string;
  ikon: string;
  antallSporsmal: number;
  vanskelighetsgrad: string;
}

const mockUserGameState: UserGameState = {
  level: 5,
  totalXP: 2450,
  achievements: [
    { id: '1', title: 'Quiz Master', description: 'Fullført 10 quiz', icon: '🏆' },
    { id: '2', title: 'Perfect Score', description: 'Oppnådd 100% score', icon: '⭐' },
  ],
  analytics: {
    totalSessions: 25,
    averageScore: 87.5,
    improvementTrend: 15
  }
};

const mockKategorier: Kategori[] = [
  { id: '1', navn: 'Sikkerhet', beskrivelse: 'Grunnleggende sikkerhet', ikon: '🛡️', antallSporsmal: 15, vanskelighetsgrad: 'Lett' },
  { id: '2', navn: 'Trafikkregler', beskrivelse: 'Viktige trafikkregler', ikon: '🚦', antallSporsmal: 20, vanskelighetsgrad: 'Middels' },
  { id: '3', navn: 'Kjøretøy', beskrivelse: 'Kjøretøykunnskap', ikon: '🚗', antallSporsmal: 18, vanskelighetsgrad: 'Vanskelig' },
];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function EnhancedQuizInterface() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'categories' | 'quiz' | 'results'>('dashboard');
  const [userGameState, setUserGameState] = useState<UserGameState>(mockUserGameState);
  const [kategorier] = useState<Kategori[]>(mockKategorier);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);

  const startQuiz = (kategori: Kategori, mode: 'practice' | 'timed') => {
    // Mock quiz questions
    const mockQuestions = [
      {
        id: '1',
        tekst: 'Hva er fartsgrensen i tettbebygd strøk?',
        alternativer: [
          { id: 'a', tekst: '30 km/h', riktig: false },
          { id: 'b', tekst: '50 km/h', riktig: true },
          { id: 'c', tekst: '80 km/h', riktig: false },
          { id: 'd', tekst: '90 km/h', riktig: false },
        ],
        vanskelighetsgrad: 'Lett'
      },
      {
        id: '2',
        tekst: 'Når må du bruke blinklys?',
        alternativer: [
          { id: 'a', tekst: 'Kun ved svinging', riktig: false },
          { id: 'b', tekst: 'Ved retningsendring og filskifte', riktig: true },
          { id: 'c', tekst: 'Kun på motorvei', riktig: false },
          { id: 'd', tekst: 'Aldri', riktig: false },
        ],
        vanskelighetsgrad: 'Lett'
      }
    ];

    setQuizState({
      currentQuestionIndex: 0,
      questions: mockQuestions,
      timeSpent: 0,
      answers: []
    });
    setSelectedKategori(kategori);
    setCurrentView('quiz');
  };

  const handleAnswerSelect = (answerId: string) => {
    if (!quizState) return;
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const selectedAnswer = currentQuestion.alternativer.find(alt => alt.id === answerId);
    const isCorrect = selectedAnswer?.riktig || false;
    
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerId,
      isCorrect,
      timeSpent: Math.floor(Math.random() * 30) + 10 // Mock time
    };

    setQuizState(prev => ({
      ...prev!,
      answers: [...prev!.answers, newAnswer]
    }));

    // Move to next question or finish quiz
    setTimeout(() => {
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        setQuizState(prev => ({
          ...prev!,
          currentQuestionIndex: prev!.currentQuestionIndex + 1
        }));
      } else {
        setCurrentView('results');
      }
    }, 1000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Dashboard</h1>
        <p className="text-gray-600">Velkommen til det avanserte quiz-systemet</p>
      </div>

      {/* User Level Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-15 h-15 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{userGameState.level}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-white text-lg font-semibold">Level {userGameState.level}</div>
              <div className="text-white text-sm opacity-90">
                {userGameState.totalXP} XP • {userGameState.achievements.length} Achievements
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full" 
                  style={{ width: `75%` }}
                ></div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <span className="text-yellow-400 text-3xl">🏆</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {userGameState.achievements.length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      {userGameState.analytics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>📊 Din Prestasjon</Typography>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{userGameState.analytics.totalSessions}</div>
                <div className="text-sm text-gray-500">Totale Quiz</div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {userGameState.analytics.averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Gjennomsnittlig Score</div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{userGameState.totalXP}</div>
                <div className="text-sm text-gray-500">Total XP</div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <div className="flex items-center justify-center">
                  {userGameState.analytics.improvementTrend > 0 ? (
                    <span className="text-green-600 text-3xl">↗️</span>
                  ) : (
                    <span className="text-red-600 text-3xl">↘️</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">Trend</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button 
          variant="contained" 
          size="large"
          onClick={() => setCurrentView('categories')}
          sx={{ px: 4, py: 2 }}
        >
          Start Ny Quiz
        </Button>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Velg Kategori</h2>
        <p className="text-gray-600">Velg en kategori for å starte quiz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kategorier.map((kategori) => (
          <Card 
            key={kategori.id}
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { 
                transform: 'scale(1.02)',
                boxShadow: 3
              }
            }}
          >
            <CardContent className="text-center p-6">
              <div className="text-4xl mb-3">{kategori.ikon}</div>
              <Typography variant="h5" component="h3" gutterBottom>
                {kategori.navn}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {kategori.beskrivelse}
              </Typography>
              <div className="flex justify-between items-center mb-4">
                <Chip 
                  label={`${kategori.antallSporsmal} spørsmål`}
                  size="small"
                  color="primary"
                />
                <Chip 
                  label={kategori.vanskelighetsgrad}
                  size="small"
                  color={
                    kategori.vanskelighetsgrad === 'Lett' ? 'success' :
                    kategori.vanskelighetsgrad === 'Middels' ? 'warning' : 'error'
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outlined"
                  size="small"
                  onClick={() => startQuiz(kategori, 'practice')}
                >
                  🎯 Øving
                </Button>
                <Button 
                  variant="contained"
                  size="small"
                  onClick={() => startQuiz(kategori, 'timed')}
                >
                  ⏱️ Tidskamp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={() => setCurrentView('dashboard')}>
          ← Tilbake til Dashboard
        </Button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!quizState || !selectedKategori) return null;
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;

    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <Typography variant="h6">
                  Spørsmål {quizState.currentQuestionIndex + 1} av {quizState.questions.length}
                </Typography>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Chip 
                  icon={<span>⏱️</span>}
                  label={formatTime(quizState.timeSpent)}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={currentQuestion.vanskelighetsgrad}
                  color={
                    currentQuestion.vanskelighetsgrad === 'Lett' ? 'success' :
                    currentQuestion.vanskelighetsgrad === 'Middels' ? 'warning' : 'error'
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              {currentQuestion.tekst}
            </Typography>
            
            <div className="grid grid-cols-1 gap-3 mt-6">
              {currentQuestion.alternativer.map((alternativ) => (
                <Button
                  key={alternativ.id}
                  variant="outlined"
                  size="large"
                  onClick={() => handleAnswerSelect(alternativ.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    p: 2,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                >
                  {alternativ.tekst}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => {
    if (!quizState || !selectedKategori) return null;
    
    const correctAnswers = quizState.answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = quizState.questions.length;
    const score = (correctAnswers / totalQuestions) * 100;

    return (
      <div className="space-y-6">
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-center">
                <Typography variant="h2" color="white" fontWeight="bold">
                  {score.toFixed(1)}%
                </Typography>
                <Typography variant="h6" color="white">
                  Quiz Fullført!
                </Typography>
              </div>
              
              <div className="text-center text-white">
                <Typography variant="h4">
                  {correctAnswers}/{totalQuestions}
                </Typography>
                <Typography variant="body1">
                  Riktige svar
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>🌟 Belønninger</Typography>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <span className="text-4xl">⭐</span>
                <div className="text-xl font-bold">+{Math.floor(score)} XP</div>
                <div className="text-sm text-gray-500">Erfaringspoeng</div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-4 text-center">
                <span className="text-4xl">🏆</span>
                <div className="text-xl font-bold">Nivå {userGameState.level}</div>
                <div className="text-sm text-gray-500">Ditt nivå</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-x-4">
          <Button 
            variant="outlined"
            onClick={() => setCurrentView('categories')}
          >
            Ny Quiz
          </Button>
          <Button 
            variant="contained"
            onClick={() => setCurrentView('dashboard')}
          >
            Tilbake til Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'categories' && renderCategories()}
      {currentView === 'quiz' && renderQuiz()}
      {currentView === 'results' && renderResults()}
    </div>
  );
}