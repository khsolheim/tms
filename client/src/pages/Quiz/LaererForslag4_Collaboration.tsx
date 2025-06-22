import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  StarIcon,
  ArrowLeftIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

interface SharedQuiz {
  id: string;
  tittel: string;
  forfatter: string;
  skole: string;
  kategori: string;
  antallSporsmal: number;
  rating: number;
  likes: number;
  downloads: number;
  dato: string;
  beskrivelse: string;
  tags: string[];
  liked: boolean;
  favoritt: boolean;
}

interface Colleague {
  id: string;
  navn: string;
  skole: string;
  fag: string[];
  quizerDelt: number;
  samarbeider: boolean;
  avatar: string;
}

export default function LaererForslag4_Collaboration() {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

  const [sharedQuizzes] = useState<SharedQuiz[]>([
    {
      id: '1',
      tittel: 'Avanserte Trafikkregler',
      forfatter: 'Lars Andersen',
      skole: 'Oslo Videregående',
      kategori: 'Trafikk',
      antallSporsmal: 25,
      rating: 4.8,
      likes: 127,
      downloads: 89,
      dato: '2024-01-15',
      beskrivelse: 'Omfattende quiz om komplekse trafikksituasjoner og regelverket',
      tags: ['Avansert', 'Regelverket', 'Praktisk'],
      liked: false,
      favoritt: true
    },
    {
      id: '2',
      tittel: 'Førstehjelpstrening Kompakt',
      forfatter: 'Maria Olsen',
      skole: 'Bergen Trafikkskole',
      kategori: 'Sikkerhet',
      antallSporsmal: 15,
      rating: 4.6,
      likes: 94,
      downloads: 156,
      dato: '2024-01-12',
      beskrivelse: 'Praktisk førstehjelp med fokus på trafikkulykker',
      tags: ['Førstehjelp', 'Praktisk', 'Livredning'],
      liked: true,
      favoritt: false
    },
    {
      id: '3',
      tittel: 'Motorveikjøring Masterclass',
      forfatter: 'Erik Hansen',
      skole: 'Stavanger Kjøreskole',
      kategori: 'Kjøring',
      antallSporsmal: 30,
      rating: 4.9,
      likes: 203,
      downloads: 178,
      dato: '2024-01-10',
      beskrivelse: 'Alt om sikker kjøring på motorvei og europavei',
      tags: ['Motorvei', 'Sikkerhet', 'Avansert'],
      liked: false,
      favoritt: true
    }
  ]);

  const [colleagues] = useState<Colleague[]>([
    {
      id: '1',
      navn: 'Anne Kristiansen',
      skole: 'Trondheim Trafikkskole',
      fag: ['Trafikk', 'Sikkerhet'],
      quizerDelt: 23,
      samarbeider: true,
      avatar: 'AK'
    },
    {
      id: '2',
      navn: 'Per Johansen',
      skole: 'Kristiansand Kjøreskole',
      fag: ['Kjøring', 'Motorvei'],
      quizerDelt: 18,
      samarbeider: false,
      avatar: 'PJ'
    },
    {
      id: '3',
      navn: 'Kari Nilsen',
      skole: 'Tromsø Trafikkopplæring',
      fag: ['Vinterkjøring', 'Sikkerhet'],
      quizerDelt: 31,
      samarbeider: true,
      avatar: 'KN'
    }
  ]);

  const toggleLike = (quizId: string) => {
    // Implementation for liking quizzes
  };

  const toggleFavorite = (quizId: string) => {
    // Implementation for favoriting quizzes
  };

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2"
            >
              <option>Alle</option>
              <option>Trafikk</option>
              <option>Sikkerhet</option>
              <option>Kjøring</option>
              <option>Motorvei</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sorter etter</label>
            <select className="bg-white border border-gray-300 rounded-lg px-3 py-2">
              <option>Mest populære</option>
              <option>Nyeste</option>
              <option>Høyest vurdert</option>
              <option>Mest nedlastet</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Søk</label>
            <input
              type="text"
              placeholder="Søk etter quizer..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedQuizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{quiz.tittel}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>av {quiz.forfatter}</span>
                    <span>•</span>
                    <span>{quiz.skole}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(quiz.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      quiz.favoritt ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {quiz.favoritt ? <StarSolid className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleLike(quiz.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      quiz.liked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {quiz.liked ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{quiz.beskrivelse}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {quiz.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  quiz.kategori === 'Trafikk' ? 'bg-blue-100 text-blue-700' :
                  quiz.kategori === 'Sikkerhet' ? 'bg-red-100 text-red-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {quiz.kategori}
                </span>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <span>{quiz.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    <span>{quiz.likes}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {quiz.antallSporsmal} spørsmål • {quiz.downloads} nedlastinger
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>Forhåndsvis</span>
                </button>
                <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Kopier</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNetworkTab = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Ditt Nettverk</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>Inviter kollega</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleagues.map((colleague) => (
            <div key={colleague.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {colleague.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{colleague.navn}</div>
                  <div className="text-sm text-gray-600">{colleague.skole}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${colleague.samarbeider ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Fagområder:</div>
                <div className="flex flex-wrap gap-1">
                  {colleague.fag.map((fag, index) => (
                    <span key={index} className="bg-white/70 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {fag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                {colleague.quizerDelt} quizer delt
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  {colleague.samarbeider ? 'Melding' : 'Følg'}
                </button>
                <button className="flex-1 bg-white/70 text-gray-700 py-2 px-3 rounded-lg hover:bg-white transition-colors text-sm">
                  Se quizer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaboration Requests */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Samarbeidsforespørsler</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                TH
              </div>
              <div>
                <div className="font-semibold text-gray-800">Tone Hansen</div>
                <div className="text-sm text-gray-600">Vil samarbeide om "Vinterkjøring 2024"</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm">
                Godta
              </button>
              <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors text-sm">
                Avslå
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                JS
              </div>
              <div>
                <div className="font-semibold text-gray-800">Jan Svendsen</div>
                <div className="text-sm text-gray-600">Inviterer deg til felles quiz-bibliotek</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 transition-colors text-sm">
                Godta
              </button>
              <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition-colors text-sm">
                Avslå
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMySharedTab = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Mine Delte Quizer</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
            <ShareIcon className="w-4 h-4" />
            <span>Del ny quiz</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800">Grunnleggende Trafikkregler</div>
                <div className="text-sm text-gray-600">20 spørsmål • Publisert 15. jan</div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>156 visninger</span>
                  <span>23 likes</span>
                  <span>12 nedlastinger</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                <EyeIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg">
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800">Sikker Parkering</div>
                <div className="text-sm text-gray-600">15 spørsmål • Publisert 12. jan</div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>89 visninger</span>
                  <span>17 likes</span>
                  <span>8 nedlastinger</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                <EyeIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg">
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">234</div>
          <div className="text-sm text-blue-700">Totale visninger</div>
          <div className="text-xs text-blue-600 mt-1">+18% denne uken</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl shadow-lg p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">45</div>
          <div className="text-sm text-green-700">Totale likes</div>
          <div className="text-xs text-green-600 mt-1">+7 nye</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">28</div>
          <div className="text-sm text-purple-700">Nedlastinger</div>
          <div className="text-xs text-purple-600 mt-1">+5 i dag</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Collaboration Hub
              </h1>
              <p className="text-gray-600 mt-1">Del, samarbeid og lær av andre lærere</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/50 rounded-2xl p-2">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'discover'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <EyeIcon className="w-5 h-5" />
            <span>Oppdag</span>
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'network'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            <span>Nettverk</span>
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'shared'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/70'
            }`}
          >
            <ShareIcon className="w-5 h-5" />
            <span>Mine Delinger</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'discover' && renderDiscoverTab()}
        {activeTab === 'network' && renderNetworkTab()}
        {activeTab === 'shared' && renderMySharedTab()}
      </div>
    </div>
  );
} 