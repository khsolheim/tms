import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrophy, FaStar, FaFireAlt, FaUsers, FaGift, FaLock, FaCheck, FaCalendarDay, FaBolt, FaShare } from 'react-icons/fa';
import AchievementShare from '../../../components/sikkerhetskontroll/AchievementShare';

interface Achievement {
  id: number;
  navn: string;
  beskrivelse: string;
  ikonUrl?: string;
  type: 'FERDIGHET' | 'INNSATS' | 'SOSIAL' | 'SPESIELL';
  kriteria: any;
  xpBelonning: number;
  sjelden: boolean;
  skjult: boolean;
  aktiv: boolean;
  opprettet: Date;
}

interface ElevAchievement {
  id: number;
  elevId: number;
  achievementId: number;
  oppnaddDato: Date;
  achievement: Achievement;
}

interface AchievementsData {
  oppnadde: ElevAchievement[];
  alle: Achievement[];
}

const Achievements: React.FC = () => {
  const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(null);
  const [activeTab, setActiveTab] = useState<'alle' | 'oppnadde' | 'type'>('alle');
  const [filterType, setFilterType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userName, setUserName] = useState('Elev');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/sikkerhetskontroll-laering/achievements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente achievements');
      }

      const data = await response.json();
      setAchievementsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'FERDIGHET': { icon: FaStar, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Ferdighet', desc: 'Mestret spesifikke kunnskapsområder' },
      'INNSATS': { icon: FaBolt, color: 'text-green-600', bg: 'bg-green-100', text: 'Innsats', desc: 'Basert på aktivitet og øving' },
      'SOSIAL': { icon: FaUsers, color: 'text-purple-600', bg: 'bg-purple-100', text: 'Sosial', desc: 'Konkurranser og samarbeid' },
      'SPESIELL': { icon: FaGift, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Spesiell', desc: 'Skjulte og sjeldne prestasjoner' }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.FERDIGHET;
  };

  const isAchievementUnlocked = (achievementId: number) => {
    return achievementsData?.oppnadde.some(a => a.achievementId === achievementId) || false;
  };

  const getFilteredAchievements = () => {
    if (!achievementsData) return [];
    
    let achievements = achievementsData.alle;
    
    if (activeTab === 'oppnadde') {
      achievements = achievementsData.oppnadde.map(a => a.achievement);
    }
    
    if (filterType) {
      achievements = achievements.filter(a => a.type === filterType);
    }
    
    // Skjul skjulte achievements som ikke er oppnådd
    achievements = achievements.filter(a => {
      if (a.skjult) {
        return isAchievementUnlocked(a.id);
      }
      return true;
    });
    
    return achievements;
  };

  const getAchievementDate = (achievementId: number) => {
    const oppnadd = achievementsData?.oppnadde.find(a => a.achievementId === achievementId);
    return oppnadd?.oppnaddDato;
  };

  const totalXpOpptjent = achievementsData?.oppnadde.reduce((sum, a) => sum + a.achievement.xpBelonning, 0) || 0;

  const handleShare = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShareModalOpen(true);
  };

  const getAchievementIcon = (type: string) => {
    const typeInfo = getTypeInfo(type);
    return typeInfo.icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !achievementsData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        <p className="text-red-800">Feil: {error || 'Kunne ikke laste achievements'}</p>
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
          <span>Tilbake til læring</span>
        </Link>

        <div className="text-center cards-spacing-vertical">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
            <FaTrophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dine Achievements</h1>
          <p className="text-lg text-gray-600">
            Vis frem prestasjoner og mål du har oppnådd i sikkerhetskontroll
          </p>
        </div>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-1 md:grid-cols-4 cards-spacing-grid">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-2 py-1 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <FaTrophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-700 font-medium">Oppnådde</p>
              <p className="text-xl font-bold text-yellow-900">
                {achievementsData.oppnadde.length} / {achievementsData.alle.filter(a => !a.skjult || isAchievementUnlocked(a.id)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 px-2 py-1 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <FaBolt className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Total XP</p>
              <p className="text-xl font-bold text-green-900">{totalXpOpptjent}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-2 py-1 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <FaGift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Sjeldne</p>
              <p className="text-xl font-bold text-purple-900">
                {achievementsData.oppnadde.filter(a => a.achievement.sjelden).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaCalendarDay className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Siste</p>
              <p className="text-sm font-bold text-blue-900">
                {achievementsData.oppnadde.length > 0 
                  ? new Date(achievementsData.oppnadde[achievementsData.oppnadde.length - 1].oppnaddDato).toLocaleDateString('no') 
                  : 'Ingen ennå'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs og Filter */}
      <div className="bg-white border border-gray-200 rounded-lg px-2 py-1">
        <div className="flex flex-wrap items-center justify-between cards-spacing-grid">
          <div className="flex space-x-1">
            {[
              { key: 'alle', label: 'Alle Achievements' },
              { key: 'oppnadde', label: 'Oppnådde' },
              { key: 'type', label: 'Per Type' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'type' && (
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Alle typer</option>
              <option value="FERDIGHET">Ferdighet</option>
              <option value="INNSATS">Innsats</option>
              <option value="SOSIAL">Sosial</option>
              <option value="SPESIELL">Spesiell</option>
            </select>
          )}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
        {getFilteredAchievements().map((achievement) => {
          const isUnlocked = isAchievementUnlocked(achievement.id);
          const unlockedDate = getAchievementDate(achievement.id);
          const typeInfo = getTypeInfo(achievement.type);
          
          return (
            <div 
              key={achievement.id} 
              className={`bg-white border-2 rounded-xl p-6 transition-all duration-200 ${
                isUnlocked 
                  ? 'border-yellow-300 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="cards-spacing-vertical">
                {/* Achievement Header */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {isUnlocked ? (
                      <FaTrophy className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <FaLock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {achievement.sjelden && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        Sjelden
                      </span>
                    )}
                    {isUnlocked && (
                      <FaCheck className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Achievement Info */}
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isUnlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.navn}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    isUnlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.beskrivelse}
                  </p>
                </div>

                {/* Type og XP */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                    <typeInfo.icon className="w-3 h-3" />
                    <span>{typeInfo.text}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FaBolt className="w-3 h-3" />
                    <span>{achievement.xpBelonning} XP</span>
                  </div>
                </div>

                {/* Oppnådd dato og share */}
                {isUnlocked && (
                  <div className="pt-2 border-t border-gray-100 space-y-6">
                    {unlockedDate && (
                      <p className="text-xs text-gray-500">
                        Oppnådd: {new Date(unlockedDate).toLocaleDateString('no', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    
                    <button
                      onClick={() => handleShare(achievement)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                    >
                      <FaShare className="w-3 h-3" />
                      <span>Del achievement</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {getFilteredAchievements().length === 0 && (
        <div className="text-center py-12">
          <FaTrophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'oppnadde' ? 'Ingen achievements oppnådd ennå' : 'Ingen achievements funnet'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'oppnadde' 
              ? 'Start å øve for å oppnå dine første prestasjoner!'
              : 'Juster filtrene for å se andre achievements.'
            }
          </p>
        </div>
      )}

      {/* Achievement Share Modal */}
      {selectedAchievement && (
        <AchievementShare
          achievement={{
            ...selectedAchievement,
            type: selectedAchievement.type === 'SPESIELL' ? 'SPESIAL' : selectedAchievement.type as any,
            ikon: '🏆', // Fallback ikon
            opplastDato: getAchievementDate(selectedAchievement.id)?.toString() || new Date().toISOString()
          }}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedAchievement(null);
          }}
          userLevel={userLevel}
          userName={userName}
        />
      )}
    </div>
  );
};

export default Achievements; 