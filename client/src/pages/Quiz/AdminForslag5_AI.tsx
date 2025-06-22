import React, { useState } from 'react';
import { CpuChipIcon, SparklesIcon, LightBulbIcon, ChartBarIcon, Cog6ToothIcon, UserGroupIcon, DocumentTextIcon, AcademicCapIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminForslag5_AI: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai-tutoring');

  const renderAITutoring = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CpuChipIcon className="h-6 w-6 text-purple-600 mr-2" />
          AI-Drevet Personlig Tutor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Intelligent Veiledning</h4>
            <p className="text-sm text-gray-600 mb-3">AI-tutor som gir personaliserte forklaringer</p>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Aktiv</span>
              <span className="text-xs text-gray-500">2,847 interaksjoner</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Adaptive Forklaringer</h4>
            <p className="text-sm text-gray-600 mb-3">Tilpasser stil basert på læringsprofil</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentGeneration = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="h-6 w-6 text-green-600 mr-2" />
          Automatisk Innholdsgenerering
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <DocumentTextIcon className="h-8 w-8 text-green-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Quiz Generering</h4>
            <p className="text-sm text-gray-600">AI lager quiz basert på læreplan</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <LightBulbIcon className="h-8 w-8 text-yellow-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Forklaringer</h4>
            <p className="text-sm text-gray-600">Automatiske svarforklaringer</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <AcademicCapIcon className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Læringsressurser</h4>
            <p className="text-sm text-gray-600">Tilleggsmateriale basert på behov</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'ai-tutoring', name: 'AI Tutor', icon: CpuChipIcon },
    { id: 'content-generation', name: 'Innholdsgenerering', icon: SparklesIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Assistert Læring
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Avansert AI-teknologi for personalisert læring og automatisk innholdsgenerering
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'ai-tutoring' && renderAITutoring()}
            {activeTab === 'content-generation' && renderContentGeneration()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForslag5_AI; 