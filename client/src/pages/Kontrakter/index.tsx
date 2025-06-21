import React, { useState } from 'react';
import { FiPlus, FiList } from 'react-icons/fi';
import OpprettKontrakt from './OpprettKontrakt';
import KontraktOversikt from './KontraktOversikt';

type Tab = 'opprett' | 'oversikt';

export default function Kontrakter() {
  const [activeTab, setActiveTab] = useState<Tab>('opprett');

  return (
    <div className="px-2 py-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kontrakter</h1>
        <p className="text-gray-600">
          Administrer nedbetalingskontrakter for elever
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('opprett')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opprett'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiPlus className="inline-block w-4 h-4 mr-2" />
            Opprett kontrakt
          </button>
          <button
            onClick={() => setActiveTab('oversikt')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'oversikt'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiList className="inline-block w-4 h-4 mr-2" />
            Kontraktoversikt
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'opprett' && <OpprettKontrakt />}
      {activeTab === 'oversikt' && <KontraktOversikt />}
    </div>
  );
} 