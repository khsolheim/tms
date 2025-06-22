import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DevicePhoneMobileIcon,
  WifiIcon,
  CloudIcon,
  BoltIcon,
  PlayIcon,
  PauseIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  WifiIcon as WifiSolid,
  CloudIcon as CloudSolid
} from '@heroicons/react/24/solid';

interface QuickQuiz {
  id: string;
  tittel: string;
  antallSporsmal: number;
  estimertTid: string;
  kategori: string;
  offline: boolean;
}

export default function BrukerForslag4_Mobile() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedQuizzes, setDownloadedQuizzes] = useState(12);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [quickQuizzes] = useState<QuickQuiz[]>([
    { id: '1', tittel: 'Lyskryss & Skilt', antallSporsmal: 10, estimertTid: '3 min', kategori: 'Trafikk', offline: true },
    { id: '2', tittel: 'Parkering Basics', antallSporsmal: 8, estimertTid: '2 min', kategori: 'Parkering', offline: true },
    { id: '3', tittel: 'Motorvei Regler', antallSporsmal: 15, estimertTid: '5 min', kategori: 'Motorvei', offline: false },
    { id: '4', tittel: 'Førstehjelp Quiz', antallSporsmal: 12, estimertTid: '4 min', kategori: 'Sikkerhet', offline: true }
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleQuickStart = (quiz: QuickQuiz) => {
    setCurrentQuiz(quiz);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto p-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mobile Quiz
            </h1>
            <p className="text-sm text-gray-600">Lær på farten</p>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isOnline ? <WifiSolid className="w-3 h-3" /> : <SignalIcon className="w-3 h-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isOnline ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {isOnline ? (
                  <CloudSolid className="w-5 h-5 text-green-600" />
                ) : (
                  <DevicePhoneMobileIcon className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {isOnline ? 'Tilkoblet' : 'Offline Modus'}
                </div>
                <div className="text-sm text-gray-600">
                  {downloadedQuizzes} quizer nedlastet
                </div>
              </div>
            </div>
            {!isOnline && (
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Kun offline innhold
              </div>
            )}
          </div>
        </div>

        {/* Current Quiz Player */}
        {currentQuiz && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{currentQuiz.tittel}</h2>
              <button 
                onClick={() => setCurrentQuiz(null)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white/20 rounded-xl p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold mb-2">Spørsmål 3 av 10</div>
                <div className="text-sm opacity-80">Hva betyr dette skiltet?</div>
              </div>
              <div className="bg-white/30 rounded-lg p-4 mb-4 text-center">
                <div className="text-4xl mb-2">🚫</div>
                <div className="text-sm">Forbudsskilt</div>
              </div>
            </div>
            <div className="space-y-3">
              {['Kjøring forbudt', 'Parkering forbudt', 'Stopp forbudt', 'Svinging forbudt'].map((option, index) => (
                <button 
                  key={index}
                  className="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2 text-sm">
                <ClockIcon className="w-4 h-4" />
                <span>2:34 igjen</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Quizzes */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <BoltIcon className="w-5 h-5 text-yellow-500 mr-2" />
            Hurtigstart
          </h2>
          
          {quickQuizzes.map((quiz) => (
            <div 
              key={quiz.id}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20 ${
                !isOnline && !quiz.offline ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{quiz.tittel}</h3>
                    {quiz.offline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span>{quiz.antallSporsmal} spørsmål</span>
                    <span>•</span>
                    <span>{quiz.estimertTid}</span>
                    <span>•</span>
                    <span className="text-blue-600">{quiz.kategori}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickStart(quiz)}
                  disabled={!isOnline && !quiz.offline}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    !isOnline && !quiz.offline
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <CloudIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">Sync Data</div>
            <div className="text-xs opacity-80">Last opp fremgang</div>
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <DevicePhoneMobileIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">Offline Modus</div>
            <div className="text-xs opacity-80">Last ned mer</div>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Dagens fremgang</span>
            <span className="text-sm text-gray-600">7/10 quizer</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">3 quizer til dagens mål</div>
        </div>

        {/* Mobile Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 text-center">
            <div className="text-lg font-bold text-indigo-600">127</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 text-center">
            <div className="text-lg font-bold text-green-600">94%</div>
            <div className="text-xs text-gray-600">Nøyaktighet</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 text-center">
            <div className="text-lg font-bold text-purple-600">2.1k</div>
            <div className="text-xs text-gray-600">XP</div>
          </div>
        </div>
      </div>
    </div>
  );
} 