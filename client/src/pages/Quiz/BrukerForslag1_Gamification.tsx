import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  ChartBarIcon,
  PlayIcon,
  AcademicCapIcon,
  BoltIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  FireIcon as FireSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

interface Achievement {
  id: string;
  navn: string;
  beskrivelse: string;
  ikon: string;
  oppnaadd: boolean;
  progresjon: number;
  maksProgresjon: number;
}

interface LeaderboardEntry {
  rang: number;
  navn: string;
  xp: number;
  level: number;
  badge: string;
}

export default function BrukerForslag1_Gamification() {
  const [brukerStats, setBrukerStats] = useState({
    xp: 2450,
    level: 8,
    xpTilNesteLevel: 550,
    totalQuizer: 47,
    riktigeSvar: 412,
    streak: 12,
    favorittKategori: 'Trafikkregler'
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      navn: 'Quiz Master',
      beskrivelse: 'Fullført 50 quizer',
      ikon: '🏆',
      oppnaadd: false,
      progresjon: 47,
      maksProgresjon: 50
    },
    {
      id: '2',
      navn: 'Perfeksjonist',
      beskrivelse: '10 perfekte scorer på rad',
      ikon: '⭐',
      oppnaadd: true,
      progresjon: 10,
      maksProgresjon: 10
    },
    {
      id: '3',
      navn: 'Speed Demon',
      beskrivelse: 'Svar på 100 spørsmål under 5 sekunder',
      ikon: '⚡',
      oppnaadd: false,
      progresjon: 73,
      maksProgresjon: 100
    },
    {
      id: '4',
      navn: 'Streaker',
      beskrivelse: '15 dagers streak',
      ikon: '🔥',
      oppnaadd: false,
      progresjon: 12,
      maksProgresjon: 15
    }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rang: 1, navn: 'Emma Andersen', xp: 3200, level: 12, badge: '👑' },
    { rang: 2, navn: 'Noah Hansen', xp: 2850, level: 10, badge: '🥈' },
    { rang: 3, navn: 'Olivia Berg', xp: 2450, level: 8, badge: '🥉' },
    { rang: 4, navn: 'William Olsen', xp: 2200, level: 7, badge: '🏅' },
    { rang: 5, navn: 'Sophia Larsen', xp: 1950, level: 6, badge: '🏅' }
  ]);

  const levelProgresjon = (brukerStats.xp % 300) / 300 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quiz Gamification Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Level opp dine ferdigheter og konkurrere med andre!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Level {brukerStats.level}</span>
          </div>
        </div>

        {/* Bruker Stats Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <BoltIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{brukerStats.xp.toLocaleString()}</div>
              <div className="text-gray-600">Total XP</div>
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgresjon}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{brukerStats.xpTilNesteLevel} XP til level {brukerStats.level + 1}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FireSolid className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{brukerStats.streak}</div>
              <div className="text-gray-600">Dagers Streak</div>
              <div className="text-xs text-orange-600 mt-1">🔥 På fyr!</div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{Math.round((brukerStats.riktigeSvar / (brukerStats.totalQuizer * 10)) * 100)}%</div>
              <div className="text-gray-600">Suksessrate</div>
              <div className="text-xs text-green-600 mt-1">{brukerStats.riktigeSvar}/{brukerStats.totalQuizer * 10} riktige</div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{brukerStats.totalQuizer}</div>
              <div className="text-gray-600">Quizer Fullført</div>
              <div className="text-xs text-blue-600 mt-1">Favoritt: {brukerStats.favorittKategori}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrophySolid className="w-6 h-6 text-yellow-500 mr-2" />
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      achievement.oppnaadd 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`text-2xl ${achievement.oppnaadd ? 'grayscale-0' : 'grayscale'}`}>
                        {achievement.ikon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.oppnaadd ? 'text-yellow-800' : 'text-gray-700'}`}>
                          {achievement.navn}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.beskrivelse}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                achievement.oppnaadd ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-400'
                              }`}
                              style={{ width: `${(achievement.progresjon / achievement.maksProgresjon) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {achievement.progresjon}/{achievement.maksProgresjon}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mt-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Start Quiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <PlayIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Random Quiz</div>
                  <div className="text-xs opacity-80">10 spørsmål</div>
                </button>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <BoltIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Speed Quiz</div>
                  <div className="text-xs opacity-80">Rask runde</div>
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <FireIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Daily Challenge</div>
                  <div className="text-xs opacity-80">Hold streaken!</div>
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <UserGroupIcon className="w-6 h-6 text-blue-500 mr-2" />
              Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.rang}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                    index === 2 ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-lg">{entry.badge}</div>
                  <div className="flex-1">
                    <div className={`font-semibold ${index === 2 ? 'text-purple-800' : 'text-gray-800'}`}>
                      {entry.navn}
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {entry.level} • {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${index === 2 ? 'text-purple-600' : 'text-gray-600'}`}>
                      #{entry.rang}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300">
                Se Full Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 