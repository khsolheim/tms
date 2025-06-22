import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  TrophyIcon,
  CalendarIcon,
  PlayIcon,
  ArrowLeftIcon,
  UsersIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  TrophyIcon as TrophySolid
} from '@heroicons/react/24/solid';

interface StudyGroup {
  id: string;
  navn: string;
  medlemmer: number;
  aktivitet: string;
  tid: string;
  tema: string;
}

interface Challenge {
  id: string;
  tittel: string;
  beskrivelse: string;
  deltakere: number;
  slutt: string;
  belonning: string;
}

export default function BrukerForslag3_Social() {
  const [studyGroups] = useState<StudyGroup[]>([
    { id: '1', navn: 'Trafikkregler Teamet', medlemmer: 8, aktivitet: 'Quiz Battle', tid: '19:00', tema: 'Trafikklys' },
    { id: '2', navn: 'Førstehjelp Fokus', medlemmer: 12, aktivitet: 'Gruppe-quiz', tid: '20:30', tema: 'Livredning' },
    { id: '3', navn: 'Motorvei Masterne', medlemmer: 6, aktivitet: 'Diskusjon', tid: '18:00', tema: 'Høyhastighet' }
  ]);

  const [challenges] = useState<Challenge[]>([
    { id: '1', tittel: 'Ukens Quiz Champion', beskrivelse: 'Hvem kan få flest poeng denne uken?', deltakere: 47, slutt: '3 dager', belonning: '500 XP + Badge' },
    { id: '2', tittel: 'Perfekt Score Challenge', beskrivelse: 'Få 100% på 5 quizer på rad', deltakere: 23, slutt: '1 uke', belonning: 'Gull Trophy' },
    { id: '3', tittel: 'Hjelpe-helten', beskrivelse: 'Hjelp 10 andre med spørsmål', deltakere: 15, slutt: '5 dager', belonning: 'Helper Badge' }
  ]);

  const [recentActivity] = useState([
    { bruker: 'Emma A.', aktivitet: 'fullførte "Trafikkregler Quiz"', tid: '2 min siden', likes: 5 },
    { bruker: 'Noah H.', aktivitet: 'oppnådde "Speed Demon" achievement', tid: '5 min siden', likes: 12 },
    { bruker: 'Olivia B.', aktivitet: 'startet studiegruppe "Parkering Pro"', tid: '15 min siden', likes: 8 },
    { bruker: 'William O.', aktivitet: 'delte quiz-tips i forumet', tid: '23 min siden', likes: 15 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Social Learning Hub
              </h1>
              <p className="text-gray-600 mt-1">Lær sammen med andre og del kunnskap</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full">
            <UsersIcon className="w-5 h-5" />
            <span className="font-semibold">127 Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Groups */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <UserGroupIcon className="w-6 h-6 text-green-500 mr-2" />
                Aktive Studiegrupper
              </h2>
              <div className="space-y-4">
                {studyGroups.map((group) => (
                  <div key={group.id} className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">{group.navn}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {group.medlemmer} medlemmer • {group.aktivitet} • Tema: {group.tema}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3" />
                          <span>I dag kl. {group.tid}</span>
                        </div>
                      </div>
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        Bli med
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                Opprett ny studiegruppe
              </button>
            </div>

            {/* Community Challenges */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrophySolid className="w-6 h-6 text-yellow-500 mr-2" />
                Community Challenges
              </h2>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-800">{challenge.tittel}</h3>
                        <p className="text-sm text-gray-600 mt-1">{challenge.beskrivelse}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{challenge.deltakere} deltakere</span>
                          <span>•</span>
                          <span>Slutt om {challenge.slutt}</span>
                          <span>•</span>
                          <span className="text-yellow-600">{challenge.belonning}</span>
                        </div>
                      </div>
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                        Delta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sosiale Aktiviteter</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <PlayIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Quiz Battle</div>
                  <div className="text-xs opacity-80">Utfordre venner</div>
                </button>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Forum</div>
                  <div className="text-xs opacity-80">Still spørsmål</div>
                </button>
                <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <HandRaisedIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Hjelp andre</div>
                  <div className="text-xs opacity-80">Få helper-poeng</div>
                </button>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ShareIcon className="w-6 h-6 text-blue-500 mr-2" />
                Aktivitetsfeed
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {activity.bruker.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">{activity.bruker}</span> {activity.aktivitet}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{activity.tid}</span>
                          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                            <HeartIcon className="w-3 h-3" />
                            <span>{activity.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                Se alle aktiviteter
              </button>
            </div>

            {/* Friend Suggestions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Foreslåtte venner</h2>
              <div className="space-y-3">
                {['Liam Johansen', 'Ella Andersen', 'Oliver Nielsen'].map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{name}</div>
                        <div className="text-xs text-gray-500">Samme klasse</div>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600 transition-colors">
                      Legg til
                    </button>
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