import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  FlagIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ArrowLeftIcon,
  PlayIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LearningPath {
  id: string;
  navn: string;
  beskrivelse: string;
  progresjon: number;
  estimertTid: string;
  vanskelighetsgrad: 'Lett' | 'Medium' | 'Vanskelig';
  anbefalt: boolean;
}

interface WeakArea {
  kategori: string;
  styrke: number;
  anbefalteOvelser: number;
  forbedringPotensial: number;
}

export default function BrukerForslag2_Adaptive() {
  const [aiInsights, setAiInsights] = useState({
    laeringsstil: 'Visuell',
    optimaltTidspunkt: '14:00-16:00',
    anbefaltSesjonslengde: '15 minutter',
    naavarende_niveau: 'Middels',
    progresjonRate: '+12%'
  });

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      navn: 'Trafikkregler Mastery',
      beskrivelse: 'Personalisert læringsbane basert på dine svakheter',
      progresjon: 68,
      estimertTid: '2 uker',
      vanskelighetsgrad: 'Medium',
      anbefalt: true
    },
    {
      id: '2',
      navn: 'Kjøretøykunnskap Boost',
      beskrivelse: 'Forbedre din forståelse av tekniske aspekter',
      progresjon: 34,
      estimertTid: '1 uke',
      vanskelighetsgrad: 'Lett',
      anbefalt: false
    },
    {
      id: '3',
      navn: 'Førstehjelpskurs',
      beskrivelse: 'Avansert kurs tilpasset ditt tempo',
      progresjon: 0,
      estimertTid: '3 uker',
      vanskelighetsgrad: 'Vanskelig',
      anbefalt: false
    }
  ]);

  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([
    { kategori: 'Trafikklys og skilt', styrke: 65, anbefalteOvelser: 8, forbedringPotensial: 25 },
    { kategori: 'Parkering', styrke: 72, anbefalteOvelser: 5, forbedringPotensial: 18 },
    { kategori: 'Motorvei', styrke: 58, anbefalteOvelser: 12, forbedringPotensial: 32 },
    { kategori: 'Miljøkjøring', styrke: 81, anbefalteOvelser: 3, forbedringPotensial: 12 }
  ]);

  const [dailyRecommendations, setDailyRecommendations] = useState([
    { type: 'quiz', title: 'Morgendagens fokus: Trafikklys', estimertTid: '5 min', xp: 50 },
    { type: 'review', title: 'Gjennomgå feil fra i går', estimertTid: '3 min', xp: 25 },
    { type: 'challenge', title: 'Utfordring: Parkering', estimertTid: '10 min', xp: 100 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Adaptive Learning Dashboard
              </h1>
              <p className="text-gray-600 mt-1">AI-drevet personalisert læring tilpasset ditt behov</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full">
            <CpuChipIcon className="w-5 h-5" />
            <span className="font-semibold">AI Aktiv</span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <SparklesIcon className="w-6 h-6 text-purple-500 mr-2" />
            AI Insights om din læring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl">
              <div className="text-sm text-purple-600 font-medium">Læringsstil</div>
              <div className="text-lg font-bold text-purple-800">{aiInsights.laeringsstil}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl">
              <div className="text-sm text-blue-600 font-medium">Optimalt tidspunkt</div>
              <div className="text-lg font-bold text-blue-800">{aiInsights.optimaltTidspunkt}</div>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-xl">
              <div className="text-sm text-green-600 font-medium">Sesjonslengde</div>
              <div className="text-lg font-bold text-green-800">{aiInsights.anbefaltSesjonslengde}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl">
              <div className="text-sm text-orange-600 font-medium">Nåværende nivå</div>
              <div className="text-lg font-bold text-orange-800">{aiInsights.naavarende_niveau}</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-xl">
              <div className="text-sm text-indigo-600 font-medium">Progresjon</div>
              <div className="text-lg font-bold text-indigo-800">{aiInsights.progresjonRate}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Paths */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FlagIcon className="w-6 h-6 text-blue-500 mr-2" />
                Personaliserte Læringsbaner
              </h2>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div 
                    key={path.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      path.anbefalt 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-semibold ${path.anbefalt ? 'text-blue-800' : 'text-gray-700'}`}>
                            {path.navn}
                          </h3>
                          {path.anbefalt && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              AI Anbefalt
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{path.beskrivelse}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {path.estimertTid}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            path.vanskelighetsgrad === 'Lett' ? 'bg-green-100 text-green-700' :
                            path.vanskelighetsgrad === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {path.vanskelighetsgrad}
                          </span>
                        </div>
                      </div>
                      <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        path.anbefalt 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}>
                        {path.progresjon > 0 ? 'Fortsett' : 'Start'}
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progresjon</span>
                        <span>{path.progresjon}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            path.anbefalt ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gray-400'
                          }`}
                          style={{ width: `${path.progresjon}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 text-orange-500 mr-2" />
                Styrke-analyse
              </h2>
              <div className="space-y-4">
                {weakAreas.map((area, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-700">{area.kategori}</h3>
                      <span className={`text-sm font-medium ${
                        area.styrke >= 80 ? 'text-green-600' :
                        area.styrke >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {area.styrke}% styrke
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          area.styrke >= 80 ? 'bg-green-500' :
                          area.styrke >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${area.styrke}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{area.anbefalteOvelser} anbefalte øvelser</span>
                      <span className="text-blue-600">+{area.forbedringPotensial}% potensial</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Recommendations */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <LightBulbIcon className="w-6 h-6 text-yellow-500 mr-2" />
                Dagens anbefalinger
              </h2>
              <div className="space-y-3">
                {dailyRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rec.type === 'quiz' ? 'bg-blue-500' :
                        rec.type === 'review' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}>
                        {rec.type === 'quiz' ? (
                          <PlayIcon className="w-4 h-4 text-white" />
                        ) : rec.type === 'review' ? (
                          <BookOpenIcon className="w-4 h-4 text-white" />
                        ) : (
                          <FlagIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                          <span>{rec.estimertTid}</span>
                          <span>•</span>
                          <span className="text-blue-600">{rec.xp} XP</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors">
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-500 mr-2" />
                Fremgang denne uken
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quizer fullført</span>
                  <span className="font-semibold text-gray-800">12/15</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">80% av ukesmål</span>
                  <span className="text-gray-500">3 igjen</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                  Se detaljert rapport
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 