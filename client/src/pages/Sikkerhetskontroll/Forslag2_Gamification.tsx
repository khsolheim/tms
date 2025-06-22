import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlayIcon,
  LockClosedIcon,
  CheckCircleIcon,
  SparklesIcon,
  HeartIcon,
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  BoltIcon as BoltIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
  earned: boolean;
  progress: number;
  maxProgress: number;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  maxProgress: number;
  xp: number;
  timeLeft: string;
  completed: boolean;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  streak: number;
  completedControls: number;
  accuracy: number;
  rank: number;
  totalUsers: number;
}

const Forslag2Gamification: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'achievements' | 'challenges' | 'leaderboard'>('dashboard');

  useEffect(() => {
    // Mock data
    const mockUserStats: UserStats = {
      level: 12,
      xp: 2450,
      xpToNext: 550,
      totalXp: 15750,
      streak: 7,
      completedControls: 89,
      accuracy: 87.5,
      rank: 3,
      totalUsers: 156
    };

    const mockAchievements: Achievement[] = [
      {
        id: 'first-control',
        title: 'Første kontroll',
        description: 'Fullfør din første sikkerhetskontroll',
        icon: CheckCircleIcon,
        iconSolid: CheckCircleIcon,
        earned: true,
        progress: 1,
        maxProgress: 1,
        xp: 50,
        rarity: 'common'
      },
      {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Oppretthold en 7-dagers streak',
        icon: FireIcon,
        iconSolid: FireIconSolid,
        earned: true,
        progress: 7,
        maxProgress: 7,
        xp: 200,
        rarity: 'rare'
      },
      {
        id: 'perfectionist',
        title: 'Perfeksjonist',
        description: 'Få 100% på 10 kontroller',
        icon: StarIcon,
        iconSolid: StarIconSolid,
        earned: false,
        progress: 7,
        maxProgress: 10,
        xp: 500,
        rarity: 'epic'
      },
      {
        id: 'speed-runner',
        title: 'Speed Runner',
        description: 'Fullfør en kontroll under 2 minutter',
        icon: BoltIcon,
        iconSolid: BoltIconSolid,
        earned: true,
        progress: 1,
        maxProgress: 1,
        xp: 150,
        rarity: 'rare'
      },
      {
        id: 'mentor',
        title: 'Mentor',
        description: 'Hjelp 5 andre elever',
        icon: AcademicCapIcon,
        iconSolid: AcademicCapIcon,
        earned: false,
        progress: 2,
        maxProgress: 5,
        xp: 300,
        rarity: 'epic'
      },
      {
        id: 'legend',
        title: 'Legende',
        description: 'Nå level 50',
        icon: TrophyIcon,
        iconSolid: TrophyIconSolid,
        earned: false,
        progress: 12,
        maxProgress: 50,
        xp: 2000,
        rarity: 'legendary'
      }
    ];

    const mockChallenges: Challenge[] = [
      {
        id: 'daily-1',
        title: 'Daglig kontroll',
        description: 'Fullfør 1 sikkerhetskontroll i dag',
        type: 'daily',
        progress: 1,
        maxProgress: 1,
        xp: 100,
        timeLeft: '14t 32m',
        completed: true
      },
      {
        id: 'daily-2',
        title: 'Perfekt score',
        description: 'Få minst 90% på en kontroll',
        type: 'daily',
        progress: 0,
        maxProgress: 1,
        xp: 150,
        timeLeft: '14t 32m',
        completed: false
      },
      {
        id: 'weekly-1',
        title: 'Ukens mester',
        description: 'Fullfør 5 kontroller denne uken',
        type: 'weekly',
        progress: 3,
        maxProgress: 5,
        xp: 500,
        timeLeft: '3d 14t',
        completed: false
      },
      {
        id: 'special-1',
        title: 'Vinterevent',
        description: 'Fullfør spesielle vinterutfordringer',
        type: 'special',
        progress: 2,
        maxProgress: 10,
        xp: 1000,
        timeLeft: '12d 8t',
        completed: false
      }
    ];

    setUserStats(mockUserStats);
    setAchievements(mockAchievements);
    setChallenges(mockChallenges);
    setLoading(false);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateLevelProgress = () => {
    if (!userStats) return 0;
    return (userStats.xp / (userStats.xp + userStats.xpToNext)) * 100;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/sikkerhetskontroll"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Tilbake til forslag
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gamification & Læring
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">{userStats?.xp.toLocaleString()} XP</span>
              </div>
            </div>
            
            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
              <PlayIcon className="w-5 h-5" />
              Start kontroll
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
            { id: 'challenges', label: 'Utfordringer', icon: FireIcon },
            { id: 'leaderboard', label: 'Leaderboard', icon: UserGroupIcon }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Player Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Din progresjon</h2>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{userStats?.level}</span>
                  </div>
                  <span className="font-bold text-gray-900">Level {userStats?.level}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ChartBarIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userStats?.completedControls}</div>
                  <div className="text-sm text-gray-600">Fullførte kontroller</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userStats?.accuracy}%</div>
                  <div className="text-sm text-gray-600">Nøyaktighet</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FireIconSolid className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userStats?.streak}</div>
                  <div className="text-sm text-gray-600">Dagers streak</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrophyIconSolid className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">#{userStats?.rank}</div>
                  <div className="text-sm text-gray-600">Rangering</div>
                </div>
              </div>
              
              {/* Level Progress */}
              <div className="bg-gray-100 rounded-full h-4 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${calculateLevelProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{userStats?.xp} XP</span>
                <span>{userStats?.xpToNext} XP til neste level</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
                <PlayIcon className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Start ny kontroll</h3>
                <p className="text-green-100">Tjen XP og forbedre din score</p>
              </button>
              
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
                <LightBulbIcon className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Læringsmodus</h3>
                <p className="text-blue-100">Øv uten press, lær i ditt tempo</p>
              </button>
              
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
                <UserGroupIcon className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Utfordr venner</h3>
                <p className="text-purple-100">Konkurrér med klassekamerater</p>
              </button>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const IconComponent = achievement.earned ? achievement.iconSolid : achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                    achievement.earned 
                      ? 'border-transparent shadow-md' 
                      : 'border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                        {achievement.earned && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">{achievement.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  {!achievement.earned && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progresjon</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} h-2 rounded-full transition-all`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Challenges Tab */}
        {selectedTab === 'challenges' && (
          <div className="space-y-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-md ${
                  challenge.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${
                      challenge.completed ? 'bg-green-500' : 'bg-gray-400'
                    } rounded-lg flex items-center justify-center`}>
                      {challenge.completed ? (
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      ) : (
                        <ClockIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(challenge.type)}`}>
                          {challenge.type === 'daily' ? 'Daglig' : challenge.type === 'weekly' ? 'Ukentlig' : 'Spesiell'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <SparklesIcon className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-gray-900">{challenge.xp} XP</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {challenge.timeLeft} igjen
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progresjon</span>
                  <span>{challenge.progress}/{challenge.maxProgress}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      challenge.completed ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {selectedTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
              <p className="text-gray-600">Se hvordan du rangerer mot andre elever</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Emma Andersen', xp: 18500, level: 15, avatar: '👑' },
                  { rank: 2, name: 'Noah Johansen', xp: 17200, level: 14, avatar: '🥈' },
                  { rank: 3, name: 'Demo Bruker (Du)', xp: 15750, level: 12, avatar: '🥉' },
                  { rank: 4, name: 'Olivia Berg', xp: 14800, level: 12, avatar: '👤' },
                  { rank: 5, name: 'William Svendsen', xp: 13900, level: 11, avatar: '👤' }
                ].map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      user.name.includes('Du') 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-2xl font-bold text-gray-900 w-8">
                      #{user.rank}
                    </div>
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">Level {user.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{user.xp.toLocaleString()} XP</div>
                      <div className="text-sm text-gray-600">Total XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forslag2Gamification; 