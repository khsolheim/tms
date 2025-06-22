import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  AcademicCapIcon, 
  Cog6ToothIcon,
  TrophyIcon,
  CpuChipIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  ServerIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Import alle forslag-komponenter
import BrukerForslag1_Gamification from './BrukerForslag1_Gamification';
import BrukerForslag2_Adaptive from './BrukerForslag2_Adaptive';
import BrukerForslag3_Social from './BrukerForslag3_Social';
import BrukerForslag4_Mobile from './BrukerForslag4_Mobile';
import BrukerForslag5_VR from './BrukerForslag5_VR';
import LaererForslag1_Dashboard from './LaererForslag1_Dashboard';
import LaererForslag2_Builder from './LaererForslag2_Builder';
import LaererForslag3_Analytics from './LaererForslag3_Analytics';
import LaererForslag4_Collaboration from './LaererForslag4_Collaboration';
import LaererForslag5_Assessment from './LaererForslag5_Assessment';
import AdminForslag1_System from './AdminForslag1_System';
import AdminForslag2_Analytics from './AdminForslag2_Analytics';
import AdminForslag3_Platform from './AdminForslag3_Platform';
import AdminForslag4_Security from './AdminForslag4_Security';
import AdminForslag5_AI from './AdminForslag5_AI';

const QuizIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState('brukerforslag');

  const brukerForslag = [
    {
      id: 'gamification',
      title: 'Gamification Dashboard',
      description: 'XP-system, achievements, leaderboards og daglige utfordringer for økt motivasjon',
      icon: TrophyIcon,
      color: 'from-purple-500 to-pink-500',
      path: '/quiz/bruker-forslag1',
      features: ['XP og Nivåer', 'Achievements', 'Leaderboards', 'Daglige Utfordringer']
    },
    {
      id: 'adaptive',
      title: 'Adaptive Learning',
      description: 'AI-basert personalisering som tilpasser seg din læringsstil og progresjon',
      icon: CpuChipIcon,
      color: 'from-blue-500 to-indigo-500',
      path: '/quiz/bruker-forslag2',
      features: ['AI Personalisering', 'Læringsbaner', 'Svake Områder', 'Anbefalinger']
    },
    {
      id: 'social',
      title: 'Social Learning',
      description: 'Studiegrupper, utfordringer og sosiale funksjoner for samarbeidslæring',
      icon: UsersIcon,
      color: 'from-green-500 to-teal-500',
      path: '/quiz/bruker-forslag3',
      features: ['Studiegrupper', 'Sosiale Utfordringer', 'Samarbeid', 'Diskusjoner']
    },
    {
      id: 'mobile',
      title: 'Mobile-First Experience',
      description: 'Offline-støtte, touch-optimalisering og quick quiz for læring på farten',
      icon: DevicePhoneMobileIcon,
      color: 'from-orange-500 to-red-500',
      path: '/quiz/bruker-forslag4',
      features: ['Offline Modus', 'Touch UI', 'Quick Quiz', 'Swipe Navigation']
    },
    {
      id: 'vr',
      title: 'VR/AR Immersive Learning',
      description: '3D simulering, VR-scenarioer og AR-funksjoner for immersive læring',
      icon: EyeIcon,
      color: 'from-pink-500 to-purple-500',
      path: '/quiz/bruker-forslag5',
      features: ['3D Simulering', 'VR Scenarioer', 'AR Funksjoner', 'Immersive Quiz']
    }
  ];

  const laererForslag = [
    {
      id: 'dashboard',
      title: 'Teacher Dashboard',
      description: 'Omfattende elevanalyse, klassestyring og ytelsesovervåking for lærere',
      icon: ChartBarIcon,
      color: 'from-blue-600 to-purple-600',
      path: '/quiz/laerer-forslag1',
      features: ['Elevanalyse', 'Klassestyring', 'Ytelsesovervåking', 'Varsler']
    },
    {
      id: 'builder',
      title: 'Interactive Quiz Builder',
      description: 'Drag-and-drop quiz-builder med templates og avanserte spørsmålstyper',
      icon: PuzzlePieceIcon,
      color: 'from-green-600 to-blue-600',
      path: '/quiz/laerer-forslag2',
      features: ['Drag & Drop', 'Templates', 'Spørsmålstyper', 'Forhåndsvisning']
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detaljerte rapporter, trendanalyse og elevprestasjon med AI-innsikter',
      icon: DocumentChartBarIcon,
      color: 'from-purple-600 to-pink-600',
      path: '/quiz/laerer-forslag3',
      features: ['Detaljerte Rapporter', 'Trendanalyse', 'AI Innsikter', 'Eksport']
    },
    {
      id: 'collaboration',
      title: 'Collaboration Hub',
      description: 'Deling av quiz, teamwork og kollegasamarbeid for lærere',
      icon: UserGroupIcon,
      color: 'from-indigo-600 to-blue-600',
      path: '/quiz/laerer-forslag4',
      features: ['Quiz Deling', 'Teamwork', 'Kollegasamarbeid', 'Ressursbibliotek']
    },
    {
      id: 'assessment',
      title: 'Advanced Assessment',
      description: 'Adaptive testing, kompetansevurdering og diagnostiske tester',
      icon: ClipboardDocumentCheckIcon,
      color: 'from-teal-600 to-green-600',
      path: '/quiz/laerer-forslag5',
      features: ['Adaptive Testing', 'Kompetansevurdering', 'Diagnostiske Tester', 'Feedback']
    }
  ];

  const adminForslag = [
    {
      id: 'system',
      title: 'System Management',
      description: 'Omfattende brukerstyring, systemkonfigurasjon og roller/tillatelser',
      icon: Cog6ToothIcon,
      color: 'from-gray-600 to-blue-600',
      path: '/quiz/admin-forslag1',
      features: ['Brukerstyring', 'Systemkonfigurasjon', 'Roller & Tillatelser', 'Audit Trail']
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'BI dashboard, prediktive analyser og AI-innsikter for administratorer',
      icon: ChartBarIcon,
      color: 'from-blue-600 to-indigo-600',
      path: '/quiz/admin-forslag2',
      features: ['BI Dashboard', 'Prediktive Analyser', 'AI Innsikter', 'KPI Tracking']
    },
    {
      id: 'platform',
      title: 'Platform Management',
      description: 'Integrasjoner, API-styring, webhooks og eksterne tjenester',
      icon: ServerIcon,
      color: 'from-indigo-600 to-purple-600',
      path: '/quiz/admin-forslag3',
      features: ['API Styring', 'Integrasjoner', 'Webhooks', 'Eksterne Tjenester']
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      description: 'Sikkerhetsstyring, overvåking og compliance-rapportering',
      icon: ShieldCheckIcon,
      color: 'from-red-600 to-pink-600',
      path: '/quiz/admin-forslag4',
      features: ['Sikkerhetsstyring', 'Overvåking', 'Compliance', 'Trusseldeteksjon']
    },
    {
      id: 'ai',
      title: 'AI-Assistert Læring',
      description: 'AI-drevet automatisering, personlig tutor og intelligente anbefalinger',
      icon: SparklesIcon,
      color: 'from-purple-600 to-pink-600',
      path: '/quiz/admin-forslag5',
      features: ['AI Tutor', 'Automatisering', 'Intelligente Anbefalinger', 'Prediktiv Analyse']
    }
  ];

  const renderForslagCard = (forslag: any) => (
    <Link
      key={forslag.id}
      to={forslag.path}
      className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${forslag.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${forslag.color} shadow-lg`}>
            <forslag.icon className="h-6 w-6 text-white" />
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">
          {forslag.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {forslag.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {forslag.features.map((feature: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz System - Innovative Forslag
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Utforsk 15 innovative forslag for å revolusjonere quiz-opplevelsen. 
            Hver kategori tilbyr unike funksjoner tilpasset forskjellige brukerroller.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('brukerforslag')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'brukerforslag'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Brukerforslag
            </button>
            <button
              onClick={() => setActiveTab('laererforslag')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'laererforslag'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Lærerforslag
            </button>
            <button
              onClick={() => setActiveTab('adminforslag')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'adminforslag'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Admin-forslag
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'brukerforslag' && brukerForslag.map(renderForslagCard)}
          {activeTab === 'laererforslag' && laererForslag.map(renderForslagCard)}
          {activeTab === 'adminforslag' && adminForslag.map(renderForslagCard)}
        </div>

        {/* Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
              <div className="text-gray-600">Innovative Forslag</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3</div>
              <div className="text-gray-600">Brukerroller</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-gray-600">Unike Funksjoner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizIndex; 