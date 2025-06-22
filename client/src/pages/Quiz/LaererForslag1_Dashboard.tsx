import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  ExclamationTriangleIcon as ExclamationSolid
} from '@heroicons/react/24/solid';

interface Student {
  id: string;
  navn: string;
  klasse: string;
  gjennomsnitt: number;
  sisteAktivitet: string;
  status: 'Aktiv' | 'Inaktiv' | 'Bekymring';
  quizerFullfort: number;
  streak: number;
}

interface QuizStats {
  tittel: string;
  gjennomsnitt: number;
  fullforinger: number;
  vanskelighetsgrad: number;
  kategori: string;
}

export default function LaererForslag1_Dashboard() {
  const [selectedClass, setSelectedClass] = useState('Alle klasser');
  const [timeframe, setTimeframe] = useState('Denne uken');

  const [students] = useState<Student[]>([
    { id: '1', navn: 'Emma Andersen', klasse: '10A', gjennomsnitt: 92, sisteAktivitet: '2 timer siden', status: 'Aktiv', quizerFullfort: 28, streak: 7 },
    { id: '2', navn: 'Noah Hansen', klasse: '10A', gjennomsnitt: 78, sisteAktivitet: '1 dag siden', status: 'Aktiv', quizerFullfort: 15, streak: 3 },
    { id: '3', navn: 'Olivia Berg', klasse: '10B', gjennomsnitt: 45, sisteAktivitet: '5 dager siden', status: 'Bekymring', quizerFullfort: 8, streak: 0 },
    { id: '4', navn: 'William Olsen', klasse: '10A', gjennomsnitt: 88, sisteAktivitet: '3 timer siden', status: 'Aktiv', quizerFullfort: 22, streak: 12 },
    { id: '5', navn: 'Ella Johansen', klasse: '10B', gjennomsnitt: 67, sisteAktivitet: '1 uke siden', status: 'Inaktiv', quizerFullfort: 12, streak: 0 }
  ]);

  const [quizStats] = useState<QuizStats[]>([
    { tittel: 'Trafikkregler Grunnleggende', gjennomsnitt: 82, fullforinger: 45, vanskelighetsgrad: 3, kategori: 'Trafikk' },
    { tittel: 'Førstehjelpstrening', gjennomsnitt: 76, fullforinger: 38, vanskelighetsgrad: 4, kategori: 'Sikkerhet' },
    { tittel: 'Parkering og Manøvrering', gjennomsnitt: 68, fullforinger: 32, vanskelighetsgrad: 5, kategori: 'Kjøring' },
    { tittel: 'Motorvei Kjøring', gjennomsnitt: 71, fullforinger: 28, vanskelighetsgrad: 4, kategori: 'Motorvei' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktiv': return 'text-green-600 bg-green-100';
      case 'Inaktiv': return 'text-yellow-600 bg-yellow-100';
      case 'Bekymring': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aktiv': return CheckCircleIcon;
      case 'Inaktiv': return ClockIcon;
      case 'Bekymring': return ExclamationSolid;
      default: return CheckCircleIcon;
    }
  };

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
                Lærer Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Oversikt over elevenes fremgang og ytelse</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>Alle klasser</option>
              <option>10A</option>
              <option>10B</option>
              <option>10C</option>
            </select>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>Denne uken</option>
              <option>Denne måneden</option>
              <option>Dette semesteret</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">127</div>
                <div className="text-sm text-gray-600">Totale elever</div>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">+12% fra forrige måned</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">78%</div>
                <div className="text-sm text-gray-600">Gjennomsnittsscore</div>
              </div>
              <TrophySolid className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">+5% forbedring</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">342</div>
                <div className="text-sm text-gray-600">Quizer fullført</div>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">+23 siden i går</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">8</div>
                <div className="text-sm text-gray-600">Trenger oppfølging</div>
              </div>
              <ExclamationSolid className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-2 text-xs text-red-600">Krever handling</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-500 mr-2" />
                  Elevoversikt
                </h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  Eksporter rapport
                </button>
              </div>
              
              <div className="space-y-4">
                {students.map((student) => {
                  const StatusIcon = getStatusIcon(student.status);
                  return (
                    <div key={student.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {student.navn.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{student.navn}</div>
                            <div className="text-sm text-gray-600">{student.klasse} • {student.sisteAktivitet}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{student.gjennomsnitt}%</div>
                            <div className="text-xs text-gray-500">Snitt</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{student.quizerFullfort}</div>
                            <div className="text-xs text-gray-500">Quizer</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-800">{student.streak}</div>
                            <div className="text-xs text-gray-500">Streak</div>
                          </div>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(student.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{student.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <ChartBarIcon className="w-6 h-6 text-green-500 mr-2" />
                Quiz Ytelse
              </h2>
              
              <div className="space-y-4">
                {quizStats.map((quiz, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{quiz.tittel}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{quiz.kategori}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Gjennomsnitt</div>
                        <div className="font-bold text-lg text-green-600">{quiz.gjennomsnitt}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Fullføringer</div>
                        <div className="font-bold text-lg text-blue-600">{quiz.fullforinger}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Vanskelighetsgrad</div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div 
                              key={i} 
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < quiz.vanskelighetsgrad ? 'bg-orange-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BellIcon className="w-6 h-6 text-purple-500 mr-2" />
                Nylige aktiviteter
              </h2>
              
              <div className="space-y-3">
                {[
                  { elev: 'Emma A.', aktivitet: 'fullførte "Trafikkregler Quiz"', tid: '5 min siden', type: 'success' },
                  { elev: 'Noah H.', aktivitet: 'trengte hjelp med spørsmål 7', tid: '12 min siden', type: 'help' },
                  { elev: 'William O.', aktivitet: 'oppnådde ny personlig rekord', tid: '23 min siden', type: 'achievement' },
                  { elev: 'Olivia B.', aktivitet: 'har ikke vært aktiv på 5 dager', tid: '5 dager siden', type: 'warning' }
                ].map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'help' ? 'bg-blue-500' :
                        activity.type === 'achievement' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">{activity.elev}</span> {activity.aktivitet}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.tid}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Hurtighandlinger</h2>
              
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Opprett ny quiz</span>
                </button>
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <EyeIcon className="w-5 h-5" />
                  <span>Se detaljerte rapporter</span>
                </button>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Planlegg quiz-økt</span>
                </button>
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <AcademicCapIcon className="w-5 h-5" />
                  <span>Send melding til elever</span>
                </button>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CalendarIcon className="w-6 h-6 text-orange-500 mr-2" />
                Dagens timeplan
              </h2>
              
              <div className="space-y-3">
                {[
                  { tid: '09:00', aktivitet: 'Quiz-økt 10A', status: 'pågår' },
                  { tid: '11:00', aktivitet: 'Oppfølging Olivia B.', status: 'planlagt' },
                  { tid: '13:00', aktivitet: 'Ny quiz publisering', status: 'planlagt' },
                  { tid: '15:00', aktivitet: 'Rapport til rektor', status: 'planlagt' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2">
                    <div className="text-sm font-medium text-gray-600 w-12">{item.tid}</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">{item.aktivitet}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'pågår' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 