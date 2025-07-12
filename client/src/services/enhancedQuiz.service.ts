import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// =======================
// INTERFACES
// =======================

export interface QuizKategori {
  id: number;
  navn: string;
  klasse: string;
  beskrivelse?: string;
  farge?: string;
  ikon?: string;
  moduleType?: string;
  estimatedDuration?: number;
  aktiv: boolean;
  underkategorier?: QuizKategori[];
  hovedkategori?: QuizKategori;
  sporsmalCount?: number;
}

export interface QuizSporsmal {
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
  mediaMetadata?: any;
  estimertTid?: number;
  aiGenerated: boolean;
  kategori?: QuizKategori;
}

export interface QuizSession {
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
  sessionIntegrity?: string;
  startTime: Date;
  endTime?: Date;
  answers?: QuizSessionAnswer[];
  kategori?: QuizKategori;
}

export interface QuizSessionAnswer {
  id: string;
  sessionId: string;
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  confidence?: number;
  answeredAt: Date;
  question?: QuizSporsmal;
}

export interface UserAnalytics {
  totalSessions: number;
  averageScore: number;
  totalXP: number;
  achievements: number;
  categoryPerformance: Record<string, {
    sessions: number;
    averageScore: number;
  }>;
  recentSessions: QuizSession[];
  improvementTrend: number;
}

export interface UserAchievement {
  id: string;
  userId: number;
  achievementId: string;
  progress: number;
  unlockedAt?: Date;
  metadata: any;
}

export interface QuizXP {
  id: string;
  userId: number;
  sessionId?: string;
  xpGained: number;
  xpType: string;
  source?: string;
  earnedAt: Date;
}

export interface QuizRecommendation {
  id: string;
  userId: number;
  kategoriId?: number;
  questionIds: number[];
  reason: string;
  priority: number;
  confidence: number;
  metadata: any;
  createdAt: Date;
  category?: QuizKategori;
}

export interface UserPreferences {
  userId: number;
  preferredDifficulty: string;
  learningStyle: string;
  sessionDuration: number;
  notifications: any;
  accessibility: any;
  themes: any;
}

export interface SecurityEvent {
  id: string;
  sessionId?: string;
  userId: number;
  eventType: string;
  severity: string;
  description: string;
  metadata: any;
  detectedAt: Date;
  reviewStatus: string;
}

// =======================
// ENHANCED QUIZ SERVICE
// =======================

export class EnhancedQuizService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/quiz`;
  }

  // =======================
  // QUIZ KATEGORI METHODS
  // =======================

  async getKategorier(): Promise<QuizKategori[]> {
    try {
      const response = await axios.get(`${this.baseURL}/kategorier`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av kategorier:', error);
      throw new Error('Kunne ikke hente quiz kategorier');
    }
  }

  async opprettKategori(kategori: Partial<QuizKategori>): Promise<QuizKategori> {
    try {
      const response = await axios.post(`${this.baseURL}/kategorier`, kategori);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved opprettelse av kategori:', error);
      throw new Error('Kunne ikke opprette quiz kategori');
    }
  }

  // =======================
  // QUIZ SPØRSMÅL METHODS
  // =======================

  async getSporsmal(kategoriId?: number, vanskelighetsgrad?: string): Promise<QuizSporsmal[]> {
    try {
      const params = new URLSearchParams();
      if (kategoriId) params.append('kategoriId', kategoriId.toString());
      if (vanskelighetsgrad) params.append('vanskelighetsgrad', vanskelighetsgrad);

      const response = await axios.get(`${this.baseURL}/sporsmal?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av spørsmål:', error);
      throw new Error('Kunne ikke hente quiz spørsmål');
    }
  }

  async opprettSporsmal(sporsmal: Partial<QuizSporsmal>): Promise<QuizSporsmal> {
    try {
      const response = await axios.post(`${this.baseURL}/sporsmal`, sporsmal);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved opprettelse av spørsmål:', error);
      throw new Error('Kunne ikke opprette quiz spørsmål');
    }
  }

  // =======================
  // QUIZ SESSION METHODS
  // =======================

  async startQuizSession(data: {
    userId: number;
    kategoriId?: number;
    quizType: string;
    questionsTotal: number;
    difficulty: string;
  }): Promise<QuizSession> {
    try {
      const response = await axios.post(`${this.baseURL}/sessions/start`, data);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved start av quiz session:', error);
      throw new Error('Kunne ikke starte quiz session');
    }
  }

  async submitAnswer(data: {
    sessionId: string;
    questionId: number;
    userAnswer: number;
    timeSpent: number;
    confidence?: number;
  }): Promise<QuizSessionAnswer> {
    try {
      const response = await axios.post(`${this.baseURL}/sessions/${data.sessionId}/answer`, {
        questionId: data.questionId,
        userAnswer: data.userAnswer,
        timeSpent: data.timeSpent,
        confidence: data.confidence
      });
      return response.data.data;
    } catch (error) {
      console.error('Feil ved submitting av svar:', error);
      throw new Error('Kunne ikke submitte svar');
    }
  }

  async completeQuizSession(sessionId: string): Promise<QuizSession> {
    try {
      const response = await axios.post(`${this.baseURL}/sessions/${sessionId}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved fullføring av quiz session:', error);
      throw new Error('Kunne ikke fullføre quiz session');
    }
  }

  // =======================
  // ANALYTICS METHODS
  // =======================

  async getUserAnalytics(userId: number): Promise<UserAnalytics> {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av bruker analytics:', error);
      throw new Error('Kunne ikke hente bruker analytics');
    }
  }

  async getRecommendations(userId: number): Promise<QuizRecommendation[]> {
    try {
      const response = await axios.get(`${this.baseURL}/recommendations/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av anbefalinger:', error);
      throw new Error('Kunne ikke hente quiz anbefalinger');
    }
  }

  // =======================
  // GAMIFICATION METHODS
  // =======================

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      const response = await axios.get(`${this.baseURL}/achievements/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av achievements:', error);
      throw new Error('Kunne ikke hente bruker achievements');
    }
  }

  async getUserXP(userId: number): Promise<{ totalXP: number; xpHistory: QuizXP[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/xp/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av XP data:', error);
      throw new Error('Kunne ikke hente bruker XP');
    }
  }

  async getLeaderboard(type: string = 'weekly', category?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('type', type);
      if (category) params.append('category', category);

      const response = await axios.get(`${this.baseURL}/leaderboard?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av leaderboard:', error);
      throw new Error('Kunne ikke hente leaderboard');
    }
  }

  // =======================
  // SECURITY METHODS
  // =======================

  async getSecurityEvents(severity?: string, userId?: number): Promise<SecurityEvent[]> {
    try {
      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      if (userId) params.append('userId', userId.toString());

      const response = await axios.get(`${this.baseURL}/security/events?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Feil ved henting av security events:', error);
      throw new Error('Kunne ikke hente security events');
    }
  }

  // =======================
  // UTILITY METHODS
  // =======================

  generateAdaptiveQuestions(
    userPerformance: UserAnalytics,
    kategoriId: number,
    targetDifficulty?: string
  ): Promise<QuizSporsmal[]> {
    // Implement adaptive question selection logic
    const difficulty = targetDifficulty || this.calculateOptimalDifficulty(userPerformance);
    return this.getSporsmal(kategoriId, difficulty);
  }

  calculateOptimalDifficulty(analytics: UserAnalytics): string {
    if (analytics.averageScore >= 90) return 'Vanskelig';
    if (analytics.averageScore >= 70) return 'Middels';
    return 'Lett';
  }

  formatTimeSpent(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  calculateScoreColor(score: number): string {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 70) return '#F59E0B'; // Yellow
    if (score >= 50) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  }

  calculateXPLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
    // XP levels: 0-100 (Level 1), 101-300 (Level 2), 301-600 (Level 3), etc.
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const currentLevelXP = totalXP - (Math.pow(level - 1, 2) * 100);
    const nextLevelXP = Math.pow(level, 2) * 100;
    
    return { level, currentLevelXP, nextLevelXP };
  }

  // =======================
  // LOCAL STORAGE METHODS
  // =======================

  saveQuizProgress(sessionId: string, progress: any): void {
    try {
      localStorage.setItem(`quiz_progress_${sessionId}`, JSON.stringify(progress));
    } catch (error) {
      console.warn('Could not save quiz progress to localStorage:', error);
    }
  }

  loadQuizProgress(sessionId: string): any | null {
    try {
      const saved = localStorage.getItem(`quiz_progress_${sessionId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Could not load quiz progress from localStorage:', error);
      return null;
    }
  }

  clearQuizProgress(sessionId: string): void {
    try {
      localStorage.removeItem(`quiz_progress_${sessionId}`);
    } catch (error) {
      console.warn('Could not clear quiz progress from localStorage:', error);
    }
  }

  saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      localStorage.setItem('quiz_user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Could not save user preferences to localStorage:', error);
    }
  }

  loadUserPreferences(): Partial<UserPreferences> | null {
    try {
      const saved = localStorage.getItem('quiz_user_preferences');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Could not load user preferences from localStorage:', error);
      return null;
    }
  }
}

export default new EnhancedQuizService();