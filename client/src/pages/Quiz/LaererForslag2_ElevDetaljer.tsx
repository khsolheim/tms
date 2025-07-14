import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CalendarIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  HandRaisedIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  ChatBubbleLeftRightIcon as ChatSolid
} from '@heroicons/react/24/solid';

interface QuizResult {
  id: string;
  kategori: string;
  tittel: string;
  score: number;
  tidBrukt: string;
  dato: string;
  antallSporsmal: number;
  riktigeSvar: number;
  status: 'fullført' | 'pågående' | 'ikke_startet';
  vanskelighetsgrad: 'lett' | 'medium' | 'vanskelig';
}

interface Melding {
  id: string;
  fraBruker: boolean;
  melding: string;
  tidspunkt: string;
  type: 'hjelp' | 'tilbakemelding' | 'oppgave';
}

interface ElevProfil {
  id: string;
  navn: string;
  email: string;
  klasse: string;
  level: number;
  xp: number;
  totalScore: number;
  streak: number;
  badges: string[];
  sisteAktivitet: string;
  registrert: string;
}

export default function LaererForslag2_ElevDetaljer() {
  const [elevProfil] = useState<ElevProfil>({
    id: '1',
    navn: 'Emma Andersen',
    email: 'emma.andersen@skole.no',
    klasse: '3A',
    level: 8,
    xp: 2340,
    totalScore: 87,
    streak: 7,
    badges: ['Første Quiz', 'Perfekt Score', '7-dagers Streak', 'Trafikk Expert'],
    sisteAktivitet: '2 timer siden',
    registrert: '15. august 2024'
  });

  const [quizResultater, setQuizResultater] = useState<QuizResult[]>([
    {
      id: '1',
      kategori: 'Trafikkregler',
      tittel: 'Grunnleggende Trafikkregler',
      score: 95,
      tidBrukt: '8 min',
      dato: '2024-01-15',
      antallSporsmal: 20,
      riktigeSvar: 19,
      status: 'fullført',
      vanskelighetsgrad: 'medium'
    },
    {
      id: '2',
      kategori: 'Sikkerhet',
      tittel: 'Bilsikkerhet og Utstyr',
      score: 80,
      tidBrukt: '12 min',
      dato: '2024-01-14',
      antallSporsmal: 15,
      riktigeSvar: 12,
      status: 'fullført',
      vanskelighetsgrad: 'lett'
    },
    {
      id: '3',
      kategori: 'Skilting',
      tittel: 'Vegskilt og Markering',
      score: 65,
      tidBrukt: '15 min',
      dato: '2024-01-13',
      antallSporsmal: 25,
      riktigeSvar: 16,
      status: 'fullført',
      vanskelighetsgrad: 'vanskelig'
    }
  ]);

  const [meldinger, setMeldinger] = useState<Melding[]>([
    {
      id: '1',
      fraBruker: true,
      melding: 'Hei! Jeg forstår ikke forskjellen mellom rødt lys og rødt blinkende lys. Kan du hjelpe meg?',
      tidspunkt: '10:30',
      type: 'hjelp'
    },
    {
      id: '2',
      fraBruker: false,
      melding: 'Hei Emma! Rødt lys betyr at du må stoppe helt. Rødt blinkende lys betyr at du må stoppe, men kan kjøre når det er trygt - som et stoppskilt.',
      tidspunkt: '10:35',
      type: 'tilbakemelding'
    },
    {
      id: '3',
      fraBruker: true,
      melding: 'Tusen takk! Det var mye klarere. Skal jeg ta quiz om trafikklys igjen?',
      tidspunkt: '10:37',
      type: 'hjelp'
    }
  ]);

  const [nyMelding, setNyMelding] = useState('');
  const [aktivTab, setAktivTab] = useState<'oversikt' | 'progresjon' | 'chat'>('oversikt');

  const sendMelding = () => {
    if (nyMelding.trim()) {
      const melding: Melding = {
        id: Date.now().toString(),
        fraBruker: false,
        melding: nyMelding,
        tidspunkt: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
        type: 'tilbakemelding'
      };
      setMeldinger([...meldinger, melding]);
      setNyMelding('');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVanskelighetsColor = (vanskelighet: string) => {
    switch (vanskelighet) {
      case 'lett': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'vanskelig': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz/laerer/oversikt" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {elevProfil.navn}
              </h1>
              <p className="text-gray-600 mt-1">{elevProfil.klasse} • {elevProfil.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full">
              <span className="font-semibold">Level {elevProfil.level}</span>
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Send Melding</span>
            </button>
          </div>
        </div>

        {/* Elev Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gjennomsnitt</p>
                <p className="text-2xl font-bold text-blue-600">{elevProfil.totalScore}%</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-purple-600">{elevProfil.level}</p>
              </div>
              <TrophySolid className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">XP</p>
                <p className="text-2xl font-bold text-indigo-600">{elevProfil.xp}</p>
              </div>
              <AcademicCapIcon className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-orange-600">{elevProfil.streak}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-green-600">{elevProfil.badges.length}</p>
              </div>
              <TrophyIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sist aktiv</p>
                <p className="text-sm font-bold text-gray-600">{elevProfil.sisteAktivitet}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-6 border border-white/20">
          <div className="flex space-x-0">
            {[
              { id: 'oversikt', navn: 'Oversikt', ikon: AcademicCapIcon },
              { id: 'progresjon', navn: 'Quiz Progresjon', ikon: ChartBarIcon },
              { id: 'chat', navn: 'Chat & Hjelp', ikon: ChatBubbleLeftRightIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAktivTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all ${
                  aktivTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.ikon className="w-5 h-5" />
                <span className="font-medium">{tab.navn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {aktivTab === 'oversikt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <TrophyIcon className="w-6 h-6 text-yellow-500" />
                <span>Badges & Utmerkelser</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {elevProfil.badges.map((badge, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg text-center">
                    <p className="font-semibold text-sm">{badge}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Profil Informasjon</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registrert:</span>
                  <span className="font-semibold">{elevProfil.registrert}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Klasse:</span>
                  <span className="font-semibold">{elevProfil.klasse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-post:</span>
                  <span className="font-semibold">{elevProfil.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Aktiv</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {aktivTab === 'progresjon' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Resultater</h2>
              <div className="space-y-4">
                {quizResultater.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-800">{quiz.tittel}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVanskelighetsColor(quiz.vanskelighetsgrad)}`}>
                            {quiz.vanskelighetsgrad}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Kategori:</strong> {quiz.kategori}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Dato:</strong> {new Date(quiz.dato).toLocaleDateString('no-NO')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>{quiz.score}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Riktige</p>
                          <p className="font-semibold">{quiz.riktigeSvar}/{quiz.antallSporsmal}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Tid</p>
                          <p className="font-semibold">{quiz.tidBrukt}</p>
                        </div>
                        <div className="flex items-center">
                          {quiz.status === 'fullført' ? (
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                          ) : (
                            <ExclamationCircleIcon className="w-8 h-8 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aktivTab === 'chat' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <ChatSolid className="w-6 h-6 text-blue-500" />
                <span>Chat med {elevProfil.navn}</span>
              </h2>
              
              {/* Meldingshistorikk */}
              <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                {meldinger.map((melding) => (
                  <div key={melding.id} className={`flex ${melding.fraBruker ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      melding.fraBruker 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      <p className="text-sm">{melding.melding}</p>
                      <p className={`text-xs mt-1 ${melding.fraBruker ? 'text-blue-100' : 'text-green-100'}`}>
                        {melding.tidspunkt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Ny melding */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={nyMelding}
                  onChange={(e) => setNyMelding(e.target.value)}
                  placeholder="Skriv din melding..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMelding()}
                />
                <button 
                  onClick={sendMelding}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 