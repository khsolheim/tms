import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  SparklesIcon,
  TrophyIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  Squares2X2Icon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

const brukerForslagData = [
  {
    id: 1,
    title: 'Moderne Dashboard',
    subtitle: 'Interaktive Widgets & Sanntidsdata',
    description: 'Modular widget-basert dashboard med drag-and-drop funksjonalitet, interaktive grafer og sanntids-statistikk.',
    icon: ChartBarIcon,
    features: ['Sanntids-statistikk widgets', 'Progresjon-tracker', 'Varslings-senter', 'Hurtighandlinger'],
    bestFor: 'Administratorer som trenger full oversikt',
    path: '/sikkerhetskontroll/forslag1',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Gamification & Læring',
    subtitle: 'XP-System & Achievements',
    description: 'Spillinspirert læring med XP-system, achievements, leaderboards og interaktive utfordringer som motiverer brukere.',
    icon: TrophyIcon,
    features: ['XP og leveling system', 'Achievement badges', 'Leaderboards', 'Interaktive utfordringer'],
    bestFor: 'Elever og engasjerende læring',
    path: '/sikkerhetskontroll/forslag2',
    color: 'yellow',
    recommended: true
  },
  {
    id: 3,
    title: 'Avansert Analyse',
    subtitle: 'BI Dashboard & Prediktiv Analyse',
    description: 'Business Intelligence dashboard med avanserte analyser, prediktive modeller og detaljerte rapporter.',
    icon: DocumentChartBarIcon,
    features: ['Prediktiv analyse', 'Avanserte filtre', 'Eksport til Excel/PDF', 'Automatiske rapporter'],
    bestFor: 'Dataanalytikere og ledelse',
    path: '/sikkerhetskontroll/forslag3',
    color: 'purple'
  },
  {
    id: 4,
    title: 'Mobiloptimalisert',
    subtitle: 'Touch-Vennlig & Offline-Støtte',
    description: 'Fullstendig mobiloptimalisert interface med touch-kontroller, QR-scanning og offline-funksjonalitet.',
    icon: DevicePhoneMobileIcon,
    features: ['QR-kode scanning', 'GPS-integrasjon', 'Offline-modus', 'Touch-optimalisert'],
    bestFor: 'Feltarbeidere og mobile brukere',
    path: '/sikkerhetskontroll/forslag4',
    color: 'green'
  },
  {
    id: 5,
    title: 'AI-Assistert',
    subtitle: 'Maskinlæring & Automatisering',
    description: 'AI-drevet system med automatisk bilde/lyd-analyse, smart anbefalinger og maskinlæringsbaserte forbedringer.',
    icon: SparklesIcon,
    features: ['Automatisk bilde-analyse', 'AI-anbefalinger', 'Stemmegjenkjenning', 'Prediktive varsler'],
    bestFor: 'Avanserte brukere og automatisering',
    path: '/sikkerhetskontroll/forslag5',
    color: 'indigo'
  }
];

const adminForslagData = [
  {
    id: 1,
    title: 'Management Dashboard',
    subtitle: 'Administrasjon & Overstyring',
    description: 'Kraftig administrativt dashboard for å administrere spørsmål, biblioteker, brukere og systemkonfigurasjon.',
    icon: CogIcon,
    features: ['Spørsmål-administrasjon', 'Bibliotek-håndtering', 'Bruker-administrasjon', 'System-konfigurasjon'],
    bestFor: 'System administratorer',
    path: '/sikkerhetskontroll/admin-forslag1',
    color: 'gray'
  },
  {
    id: 2,
    title: 'Content Builder',
    subtitle: 'Drag-and-Drop Builder',
    description: 'Visuell builder for å lage spørsmål og tester med drag-and-drop funksjonalitet og sanntids forhåndsvisning.',
    icon: Squares2X2Icon,
    features: ['Visual test builder', 'Drag-and-drop elementer', 'Sanntids forhåndsvisning', 'Template bibliotek'],
    bestFor: 'Innholds-skapere og lærere',
    path: '/sikkerhetskontroll/admin-forslag2',
    color: 'emerald',
    recommended: true
  },
  {
    id: 3,
    title: 'Advanced Analytics',
    subtitle: 'BI & Rapportering',
    description: 'Avansert business intelligence med detaljerte rapporter, trendanalyse og automatiserte insights.',
    icon: PresentationChartBarIcon,
    features: ['Detaljerte rapporter', 'Trendanalyse', 'Automatiserte insights', 'Eksport-funksjoner'],
    bestFor: 'Ledelse og dataanalytikere',
    path: '/sikkerhetskontroll/admin-forslag3',
    color: 'rose'
  }
];

const Sikkerhetskontroll: React.FC = () => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      rose: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBorderColor = (color: string) => {
    const colors = {
      blue: 'border-blue-200',
      yellow: 'border-yellow-200',
      purple: 'border-purple-200',
      green: 'border-green-200',
      indigo: 'border-indigo-200',
      gray: 'border-gray-200',
      emerald: 'border-emerald-200',
      rose: 'border-rose-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderForslagCard = (forslag: any, isAdmin: boolean = false) => (
    <div
      key={forslag.id}
      className={`bg-white rounded-xl shadow-lg border-2 ${getBorderColor(forslag.color)} hover:shadow-xl transition-all duration-300 overflow-hidden group`}
    >
      {forslag.recommended && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 text-center">
          ⭐ ANBEFALT
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(forslag.color)} text-white`}>
            <forslag.icon className="w-6 h-6" />
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isAdmin ? 'ADMIN' : 'BRUKER'}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{forslag.title}</h3>
        <p className="text-sm text-gray-600 font-medium mb-3">{forslag.subtitle}</p>
        <p className="text-gray-700 mb-4 text-sm leading-relaxed">{forslag.description}</p>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Hovedfunksjoner:</h4>
          <ul className="space-y-1">
            {forslag.features.slice(0, 3).map((feature: string, index: number) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
            {forslag.features.length > 3 && (
              <li className="text-sm text-gray-500 italic">
                +{forslag.features.length - 3} flere funksjoner...
              </li>
            )}
          </ul>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Best for:</span> {forslag.bestFor}
          </p>
        </div>

        <Link
          to={forslag.path}
          className={`w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r ${getColorClasses(forslag.color)} text-white font-medium rounded-lg transition-all duration-200 group-hover:shadow-lg`}
        >
          Se Demo
          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sikkerhetskontroll Design Forslag
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Utforsk forskjellige tilnærminger til sikkerhetskontroll-systemet. 
            Vi har laget både bruker-orienterte og admin-orienterte løsninger.
          </p>
        </div>

        {/* Bruker Forslag */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bruker-orienterte Forslag</h2>
              <p className="text-gray-600">For elever, testdeltagere og sluttbrukere</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brukerForslagData.map((forslag) => renderForslagCard(forslag, false))}
          </div>
        </div>

        {/* Admin Forslag */}
        <div>
          <div className="flex items-center mb-8">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <WrenchScrewdriverIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin-orienterte Forslag</h2>
              <p className="text-gray-600">For administratorer, lærere og innholds-skapere</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminForslagData.map((forslag) => renderForslagCard(forslag, true))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Anbefaling</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              For optimal brukeropplevelse anbefaler vi å kombinere <strong>Gamification & Læring</strong> for 
              brukersiden med <strong>Content Builder</strong> for admin-siden. Dette gir både engasjerende 
              læring og kraftige administrative verktøy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sikkerhetskontroll; 