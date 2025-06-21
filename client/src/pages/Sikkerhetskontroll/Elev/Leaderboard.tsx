import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrophy, FaMedal, FaAward, FaStar, FaFire, FaCrown, FaUsers, FaGlobeEurope, FaSchool, FaCalendarWeek } from 'react-icons/fa';

interface LeaderboardEntry {
  id: number;
  elevNavn: string;
  skole?: string;
  totalXP: number;
  level: number;
  achievements: number;
  kategorierMestret: number;
  totalKategorier: number;
  streak: number;
  rank: number;
  avatar?: string;
  isCurrentUser: boolean;
}

interface LeaderboardStats {
  totalUsers: number;
  averageXP: number;
  topStreak: number;
  mostActiveDay: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [filterType, setFilterType] = useState<'global' | 'school' | 'week'>('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [filterType]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sikkerhetskontroll-laering/leaderboard?type=${filterType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente leaderboard data');
      }

      const data = await response.json();
      setLeaderboardData(data.leaderboard);
      setStats(data.stats);
      setCurrentUserRank(data.currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <FaMedal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <FaAward className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'global': return <FaGlobeEurope className="w-4 h-4" />;
      case 'school': return <FaSchool className="w-4 h-4" />;
      case 'week': return <FaCalendarWeek className="w-4 h-4" />;
      default: return <FaUsers className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        <p className="text-red-800">Feil: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div className="cards-spacing-vertical">
        <Link 
          to="/sikkerhetskontroll-laering"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Tilbake til oversikt</span>
        </Link>

        <div className="text-center cards-spacing-vertical">
          <div className="flex items-center justify-center space-x-3">
            <FaTrophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <FaTrophy className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-lg text-gray-600">Se hvordan du presterer sammenlignet med andre elever</p>
        </div>
      </div>

      {/* Filter knapper */}
      <div className="flex justify-center space-x-2">
        {[
          { key: 'global', label: 'Globalt', desc: 'Alle brukere' },
          { key: 'school', label: 'Min skole', desc: 'Kun din kjøreskole' },
          { key: 'week', label: 'Denne uken', desc: 'Ukens prestasjon' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterType(filter.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              filterType === filter.key
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {getFilterIcon(filter.key)}
            <div className="text-left">
              <div className="font-medium">{filter.label}</div>
              <div className="text-xs text-gray-500">{filter.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Din posisjon */}
      {currentUserRank && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-2 py-1">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Din posisjon</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getRankIcon(currentUserRank.rank)}
              <div>
                <p className="font-bold text-blue-900">{currentUserRank.elevNavn}</p>
                <p className="text-sm text-blue-700">Level {currentUserRank.level} • {currentUserRank.totalXP.toLocaleString()} XP</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{currentUserRank.achievements}</p>
                  <p className="text-xs text-blue-600">Achievements</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{currentUserRank.kategorierMestret}/{currentUserRank.totalKategorier}</p>
                  <p className="text-xs text-blue-600">Mestret</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{currentUserRank.streak}</p>
                  <p className="text-xs text-blue-600">Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistikk oversikt */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 cards-spacing-grid">
          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-center">
            <FaUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-600">Totale brukere</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-center">
            <FaStar className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageXP).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Gjennomsnitt XP</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-center">
            <FaFire className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.topStreak}</p>
            <p className="text-sm text-gray-600">Beste streak</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-center">
            <FaCalendarWeek className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.mostActiveDay}</p>
            <p className="text-sm text-gray-600">Mest aktiv dag</p>
          </div>
        </div>
      )}

      {/* Leaderboard liste */}
      <div className="space-y-8">
        <h3 className="text-xl font-bold text-gray-900">
          {filterType === 'global' ? 'Globale rangeringer' :
           filterType === 'school' ? 'Skole rangeringer' :
           'Ukens rangeringer'}
        </h3>
        
        <div className="space-y-6">
          {leaderboardData.map((entry) => {
            const progressPercentage = (entry.kategorierMestret / entry.totalKategorier) * 100;
            
            return (
              <div
                key={entry.id}
                className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  entry.isCurrentUser 
                    ? 'ring-2 ring-blue-400 bg-blue-50 border-blue-300' 
                    : getRankColors(entry.rank)
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Venstre side - Rang og bruker info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-bold ${entry.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {entry.elevNavn}
                          {entry.isCurrentUser && <span className="text-blue-600 ml-2">(Deg)</span>}
                        </h4>
                        {entry.skole && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {entry.skole}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Level {entry.level} • {entry.totalXP.toLocaleString()} XP
                        </span>
                        
                        {entry.streak > 0 && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <FaFire className="w-3 h-3" />
                            <span className="text-sm font-medium">{entry.streak}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Høyre side - Progresjon og achievements */}
                  <div className="flex items-center space-x-6">
                    {/* Progresjon */}
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {entry.kategorierMestret}/{entry.totalKategorier}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Kategorier mestret</p>
                    </div>

                    {/* Achievements */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <FaAward className="w-4 h-4 text-yellow-600" />
                        <span className="text-lg font-bold text-gray-900">{entry.achievements}</span>
                      </div>
                      <p className="text-xs text-gray-500">Achievements</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivasjon */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg px-2 py-1 text-center">
        <h3 className="text-lg font-bold text-green-900 mb-2">🎯 Øk din ranking!</h3>
        <p className="text-green-800 mb-4">
          Fullfør flere tester, oppnå achievements og hold streaken din levende for å klatre oppover leaderbordet.
        </p>
        <Link
          to="/sikkerhetskontroll-laering"
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaTrophy className="w-4 h-4" />
          <span>Start øving nå</span>
        </Link>
      </div>
    </div>
  );
};

export default Leaderboard; 