import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Tooltip,
  Badge,
  IconButton,
  Slider,
  Zoom,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Timer,
  Star,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Security,
  Lightbulb,
  Psychology,
  Speed,
  CheckCircle,
  Cancel,
  Info,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Settings,
  Help
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import enhancedQuizService, {
  QuizKategori,
  QuizSporsmal,
  QuizSession,
  UserAnalytics,
  UserAchievement,
  QuizSessionAnswer
} from '../../services/enhancedQuiz.service';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

// =======================
// INTERFACES
// =======================

interface QuizState {
  currentSession: QuizSession | null;
  currentQuestion: QuizSporsmal | null;
  currentQuestionIndex: number;
  questions: QuizSporsmal[];
  answers: QuizSessionAnswer[];
  timeSpent: number;
  isActive: boolean;
  isCompleted: boolean;
  userAnswer: number | null;
  confidence: number;
  showResults: boolean;
  adaptiveMode: boolean;
  currentDifficulty: string;
}

interface UserGameState {
  totalXP: number;
  level: number;
  achievements: UserAchievement[];
  currentStreak: number;
  analytics: UserAnalytics | null;
}

// =======================
// ENHANCED QUIZ COMPONENT
// =======================

const EnhancedQuizInterface: React.FC = () => {
  // =======================
  // STATE MANAGEMENT
  // =======================
  
  const [kategorier, setKategorier] = useState<QuizKategori[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<QuizKategori | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentSession: null,
    currentQuestion: null,
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    timeSpent: 0,
    isActive: false,
    isCompleted: false,
    userAnswer: null,
    confidence: 50,
    showResults: false,
    adaptiveMode: false,
    currentDifficulty: 'Middels'
  });
  
  const [userGameState, setUserGameState] = useState<UserGameState>({
    totalXP: 0,
    level: 1,
    achievements: [],
    currentStreak: 0,
    analytics: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // =======================
  // LIFECYCLE HOOKS
  // =======================

  useEffect(() => {
    loadKategorier();
    loadUserGameState();
    loadUserPreferences();
    
    // Setup keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (quizState.isActive && quizState.currentQuestion) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= quizState.currentQuestion.svaralternativer.length) {
          setQuizState(prev => ({ ...prev, userAnswer: num - 1 }));
        }
        if (e.key === 'Enter' && quizState.userAnswer !== null) {
          handleAnswerSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (quizState.isActive && !quizState.isCompleted) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState.isActive, quizState.isCompleted]);

  // =======================
  // DATA LOADING FUNCTIONS
  // =======================

  const loadKategorier = async () => {
    try {
      setLoading(true);
      const data = await enhancedQuizService.getKategorier();
      setKategorier(data);
    } catch (err) {
      setError('Kunne ikke laste kategorier');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserGameState = async () => {
    try {
      // Mock user ID - in real app this would come from authentication
      const userId = 1;
      
      const [analytics, achievements, xpData] = await Promise.all([
        enhancedQuizService.getUserAnalytics(userId),
        enhancedQuizService.getUserAchievements(userId),
        enhancedQuizService.getUserXP(userId)
      ]);

      const xpLevel = enhancedQuizService.calculateXPLevel(xpData.totalXP);

      setUserGameState({
        totalXP: xpData.totalXP,
        level: xpLevel.level,
        achievements,
        currentStreak: 0, // Calculate from analytics
        analytics
      });
    } catch (err) {
      console.error('Could not load user game state:', err);
    }
  };

  const loadUserPreferences = () => {
    const preferences = enhancedQuizService.loadUserPreferences();
    if (preferences) {
      setSoundEnabled(preferences.notifications?.sound ?? true);
      setAnimationsEnabled(preferences.accessibility?.animations ?? true);
    }
  };

  // =======================
  // QUIZ CONTROL FUNCTIONS
  // =======================

  const startQuiz = async (kategori: QuizKategori, quizType: string = 'standard') => {
    try {
      setLoading(true);
      setError(null);

      // Load questions for category
      const questions = await enhancedQuizService.getSporsmal(kategori.id);
      if (questions.length === 0) {
        throw new Error('Ingen spørsmål funnet for denne kategorien');
      }

      // Adaptive mode: adjust questions based on user performance
      let filteredQuestions = questions;
      if (quizType === 'adaptive' && userGameState.analytics) {
        const optimalDifficulty = enhancedQuizService.calculateOptimalDifficulty(userGameState.analytics);
        filteredQuestions = await enhancedQuizService.generateAdaptiveQuestions(
          userGameState.analytics,
          kategori.id,
          optimalDifficulty
        );
      }

      // Shuffle questions for variability
      const shuffledQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
      const questionsToUse = shuffledQuestions.slice(0, Math.min(10, shuffledQuestions.length));

      // Start quiz session
      const session = await enhancedQuizService.startQuizSession({
        userId: 1, // Mock user ID
        kategoriId: kategori.id,
        quizType,
        questionsTotal: questionsToUse.length,
        difficulty: quizState.currentDifficulty
      });

      setSelectedKategori(kategori);
      setQuizState({
        currentSession: session,
        currentQuestion: questionsToUse[0],
        currentQuestionIndex: 0,
        questions: questionsToUse,
        answers: [],
        timeSpent: 0,
        isActive: true,
        isCompleted: false,
        userAnswer: null,
        confidence: 50,
        showResults: false,
        adaptiveMode: quizType === 'adaptive',
        currentDifficulty: quizState.currentDifficulty
      });

      questionStartRef.current = Date.now();
      playSound('start');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke starte quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!quizState.currentSession || !quizState.currentQuestion || quizState.userAnswer === null) {
      return;
    }

    try {
      const questionTime = Math.floor((Date.now() - questionStartRef.current) / 1000);
      
      const answer = await enhancedQuizService.submitAnswer({
        sessionId: quizState.currentSession.id,
        questionId: quizState.currentQuestion.id,
        userAnswer: quizState.userAnswer,
        timeSpent: questionTime,
        confidence: quizState.confidence
      });

      setQuizState(prev => ({
        ...prev,
        answers: [...prev.answers, answer]
      }));

      // Play sound feedback
      playSound(answer.isCorrect ? 'correct' : 'incorrect');

      // Show explanation briefly if incorrect
      if (!answer.isCorrect) {
        // Could show explanation modal here
      }

      // Move to next question or complete quiz
      setTimeout(() => {
        if (quizState.currentQuestionIndex + 1 < quizState.questions.length) {
          moveToNextQuestion();
        } else {
          completeQuiz();
        }
      }, 1500);

    } catch (err) {
      setError('Kunne ikke submitte svar');
      console.error(err);
    }
  };

  const moveToNextQuestion = () => {
    const nextIndex = quizState.currentQuestionIndex + 1;
    setQuizState(prev => ({
      ...prev,
      currentQuestion: prev.questions[nextIndex],
      currentQuestionIndex: nextIndex,
      userAnswer: null,
      confidence: 50
    }));
    questionStartRef.current = Date.now();
  };

  const completeQuiz = async () => {
    if (!quizState.currentSession) return;

    try {
      setLoading(true);
      const completedSession = await enhancedQuizService.completeQuizSession(quizState.currentSession.id);
      
      setQuizState(prev => ({
        ...prev,
        currentSession: completedSession,
        isActive: false,
        isCompleted: true,
        showResults: true
      }));

      // Reload user game state to show new XP and achievements
      await loadUserGameState();
      playSound('complete');

    } catch (err) {
      setError('Kunne ikke fullføre quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizState({
      currentSession: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      timeSpent: 0,
      isActive: false,
      isCompleted: false,
      userAnswer: null,
      confidence: 50,
      showResults: false,
      adaptiveMode: false,
      currentDifficulty: 'Middels'
    });
    setSelectedKategori(null);
    setError(null);
  };

  // =======================
  // UTILITY FUNCTIONS
  // =======================

  const playSound = (type: 'start' | 'correct' | 'incorrect' | 'complete') => {
    if (!soundEnabled) return;
    
    // In a real app, you would have actual sound files
    const audio = new Audio();
    switch (type) {
      case 'start':
        // audio.src = '/sounds/quiz-start.mp3';
        break;
      case 'correct':
        // audio.src = '/sounds/correct.mp3';
        break;
      case 'incorrect':
        // audio.src = '/sounds/incorrect.mp3';
        break;
      case 'complete':
        // audio.src = '/sounds/quiz-complete.mp3';
        break;
    }
    // audio.play().catch(e => console.log('Could not play sound:', e));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = (): number => {
    if (!quizState.questions.length) return 0;
    return ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
  };

  // =======================
  // RENDER FUNCTIONS
  // =======================

  const renderKategoriSelection = () => (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        🎯 Forbedret Quiz System
      </Typography>
      
      {/* User Progress Display */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                <Typography variant="h6">{userGameState.level}</Typography>
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" color="white">Level {userGameState.level}</Typography>
              <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                {userGameState.totalXP} XP • {userGameState.achievements.length} Achievements
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={75} // This would be calculated from current level progress
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)' }}
              />
            </Grid>
            <Grid item>
              <Badge badgeContent={userGameState.achievements.length} color="secondary">
                <EmojiEvents sx={{ color: 'gold', fontSize: 32 }} />
              </Badge>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Analytics Preview */}
      {userGameState.analytics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>📊 Din Prestasjon</Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{userGameState.analytics.totalSessions}</Typography>
                  <Typography variant="caption">Totale Quiz</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {userGameState.analytics.averageScore.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">Gjennomsnittlig Score</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">{userGameState.totalXP}</Typography>
                  <Typography variant="caption">Total XP</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    {userGameState.analytics.improvementTrend > 0 ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                  </Box>
                  <Typography variant="caption">Trend</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" gutterBottom>Velg Quiz Kategori:</Typography>
      
      <Grid container spacing={2}>
        {kategorier.map((kategori) => (
          <Grid item xs={12} sm={6} md={4} key={kategori.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => setSelectedKategori(kategori)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: kategori.farge || '#3B82F6',
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    {kategori.navn.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{kategori.navn}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Klasse {kategori.klasse}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {kategori.beskrivelse}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip 
                    label={`${kategori.sporsmalCount} spørsmål`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`~${kategori.estimatedDuration} min`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>

                {kategori.moduleType && (
                  <Chip 
                    label={kategori.moduleType}
                    size="small"
                    sx={{ mt: 1 }}
                    color={kategori.moduleType === 'adaptive' ? 'success' : 'default'}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quiz Type Selection Dialog */}
      <Dialog open={!!selectedKategori} onClose={() => setSelectedKategori(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Quiz: {selectedKategori?.navn}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {selectedKategori?.beskrivelse}
          </Typography>
          
          <Typography variant="h6" gutterBottom>Velg Quiz Type:</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', border: '2px solid transparent', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => {
                  if (selectedKategori) startQuiz(selectedKategori, 'standard');
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="primary">📝 Standard Quiz</Typography>
                  <Typography variant="body2">
                    Tradisjonell quiz med fast vanskelighetsgrad
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', border: '2px solid transparent', '&:hover': { borderColor: 'success.main' } }}
                onClick={() => {
                  if (selectedKategori) startQuiz(selectedKategori, 'adaptive');
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="success.main">🧠 Adaptiv Quiz</Typography>
                  <Typography variant="body2">
                    AI tilpasser vanskelighetsgrad basert på din prestasjon
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedKategori(null)}>Avbryt</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderQuestion = () => {
    if (!quizState.currentQuestion) return null;

    const question = quizState.currentQuestion;
    const isAnswered = quizState.userAnswer !== null;
    const lastAnswer = quizState.answers[quizState.answers.length - 1];

    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* Quiz Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography variant="h6">
                  Spørsmål {quizState.currentQuestionIndex + 1} av {quizState.questions.length}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressPercent()} 
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item>
                <Chip 
                  icon={<Timer />}
                  label={formatTime(quizState.timeSpent)}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip 
                  label={question.vanskelighetsgrad}
                  color={
                    question.vanskelighetsgrad === 'Lett' ? 'success' :
                    question.vanskelighetsgrad === 'Middels' ? 'warning' : 'error'
                  }
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Fade in={true} timeout={500}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3 }}>
                {question.tekst}
              </Typography>

              {/* Media Content */}
              {question.mediaUrl && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  {question.mediaType === 'image' && (
                    <img 
                      src={question.mediaUrl} 
                      alt={question.mediaMetadata?.alt || 'Quiz billede'}
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    />
                  )}
                  {question.mediaType === 'video' && (
                    <video 
                      controls 
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    >
                      <source src={question.mediaUrl} type="video/mp4" />
                    </video>
                  )}
                </Box>
              )}

              {/* Answer Options */}
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={quizState.userAnswer?.toString() || ''}
                  onChange={(e) => setQuizState(prev => ({ 
                    ...prev, 
                    userAnswer: parseInt(e.target.value) 
                  }))}
                >
                  {question.svaralternativer.map((alternativ, index) => (
                    <FormControlLabel
                      key={index}
                      value={index.toString()}
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" width="100%">
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {alternativ}
                          </Typography>
                          {lastAnswer && (
                            <>
                              {index === question.riktigSvar && (
                                <CheckCircle color="success" sx={{ ml: 1 }} />
                              )}
                              {index === lastAnswer.userAnswer && index !== question.riktigSvar && (
                                <Cancel color="error" sx={{ ml: 1 }} />
                              )}
                            </>
                          )}
                        </Box>
                      }
                      disabled={isAnswered}
                      sx={{
                        mb: 1,
                        p: 2,
                        border: '2px solid transparent',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: 'primary.main'
                        },
                        ...(lastAnswer && index === question.riktigSvar && {
                          bgcolor: 'success.light',
                          borderColor: 'success.main'
                        }),
                        ...(lastAnswer && index === lastAnswer.userAnswer && index !== question.riktigSvar && {
                          bgcolor: 'error.light',
                          borderColor: 'error.main'
                        })
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Confidence Slider */}
              {!isAnswered && quizState.userAnswer !== null && (
                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    Hvor sikker er du på svaret? {quizState.confidence}%
                  </Typography>
                  <Slider
                    value={quizState.confidence}
                    onChange={(_, value) => setQuizState(prev => ({ 
                      ...prev, 
                      confidence: value as number 
                    }))}
                    min={0}
                    max={100}
                    marks={[
                      { value: 0, label: 'Gjettet' },
                      { value: 50, label: 'Usikker' },
                      { value: 100, label: 'Sikker' }
                    ]}
                  />
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={resetQuiz} color="error" variant="outlined">
                  Avslutt Quiz
                </Button>
                
                {!isAnswered ? (
                  <Button 
                    onClick={handleAnswerSubmit}
                    variant="contained"
                    disabled={quizState.userAnswer === null}
                    size="large"
                  >
                    Submit Svar
                  </Button>
                ) : (
                  <Button 
                    onClick={quizState.currentQuestionIndex + 1 < quizState.questions.length ? moveToNextQuestion : completeQuiz}
                    variant="contained"
                    size="large"
                  >
                    {quizState.currentQuestionIndex + 1 < quizState.questions.length ? 'Neste Spørsmål' : 'Fullfør Quiz'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Explanation */}
        {lastAnswer && !lastAnswer.isCorrect && question.forklaring && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Forklaring:</strong> {question.forklaring}
            </Typography>
          </Alert>
        )}
      </Box>
    );
  };

  const renderResults = () => {
    if (!quizState.currentSession || !quizState.isCompleted) return null;

    const session = quizState.currentSession;
    const score = session.percentage || 0;
    const correctAnswers = session.questionsCorrect || 0;
    const totalQuestions = session.questionsTotal || 0;

    const chartData = {
      labels: ['Riktig', 'Feil'],
      datasets: [
        {
          data: [correctAnswers, totalQuestions - correctAnswers],
          backgroundColor: ['#10B981', '#EF4444'],
          borderWidth: 0
        }
      ]
    };

    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🎉 Quiz Fullført!
        </Typography>

        {/* Score Display */}
        <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${enhancedQuizService.calculateScoreColor(score)} 0%, ${enhancedQuizService.calculateScoreColor(score)}88 100%)` }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} textAlign="center">
                <Typography variant="h2" color="white" fontWeight="bold">
                  {score.toFixed(1)}%
                </Typography>
                <Typography variant="h6" color="white">
                  Din Score
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box height={200}>
                  <Doughnut 
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="white">
                    {correctAnswers}/{totalQuestions}
                  </Typography>
                  <Typography variant="body1" color="white">
                    Riktige Svar
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ mt: 2 }}>
                    Tid brukt: {enhancedQuizService.formatTimeSpent(session.timeSpent || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* XP and Achievements */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>🌟 Belønninger</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Star sx={{ fontSize: 32, color: 'gold', mb: 1 }} />
                  <Typography variant="h5">+{Math.floor(score)} XP</Typography>
                  <Typography variant="caption">Experience Points</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 32, color: 'orange', mb: 1 }} />
                  <Typography variant="h5">Nivå {userGameState.level}</Typography>
                  <Typography variant="caption">Ditt Level</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Detailed Answer Review */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>📋 Gjennomgang av Svar</Typography>
            {quizState.answers.map((answer, index) => {
              const question = quizState.questions.find(q => q.id === answer.questionId);
              if (!question) return null;

              return (
                <Paper key={answer.id} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      {answer.isCorrect ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                    </Grid>
                    <Grid item xs>
                      <Typography variant="body1" fontWeight="bold">
                        Spørsmål {index + 1}: {question.tekst}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dit svar: {question.svaralternativer[answer.userAnswer]}
                        {!answer.isCorrect && (
                          <span> | Riktig: {question.svaralternativer[answer.correctAnswer]}</span>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={`${answer.timeSpent}s`}
                        size="small"
                        color={answer.timeSpent < 5 ? 'error' : answer.timeSpent < 15 ? 'warning' : 'success'}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" gap={2}>
          <Button 
            onClick={resetQuiz}
            variant="contained"
            size="large"
            startIcon={<Refresh />}
          >
            Ta Ny Quiz
          </Button>
          <Button 
            onClick={() => setShowAnalytics(true)}
            variant="outlined"
            size="large"
            startIcon={<TrendingUp />}
          >
            Se Analytikk
          </Button>
        </Box>
      </Box>
    );
  };

  // =======================
  // MAIN RENDER
  // =======================

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
        <Button onClick={() => setError(null)} sx={{ ml: 2 }}>
          Prøv igjen
        </Button>
      </Alert>
    );
  }

  if (quizState.showResults) {
    return renderResults();
  }

  if (quizState.isActive && quizState.currentQuestion) {
    return renderQuestion();
  }

  return renderKategoriSelection();
};

export default EnhancedQuizInterface;