import React, { useState } from 'react';
import { 
  CubeIcon,
  ChartPieIcon,
  BoltIcon,
  DocumentTextIcon,
  PhotoIcon,
  CodeBracketIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { 
  CubeIcon as CubeSolidIcon,
  ChartPieIcon as ChartPieSolidIcon,
  BoltIcon as BoltSolidIcon
} from '@heroicons/react/24/solid';

export default function AssetOptimization() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bundles' | 'images' | 'suggestions'>('overview');

  return (
    <div className="cards-spacing-vertical">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1 border-b border-gray-200">
          <div className="flex items-center">
            <CubeSolidIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Asset Optimization</h1>
              <p className="text-sm text-gray-600">
                Bundle analyse og ytelsesoptimering
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-2">
            {[
              { id: 'overview', name: 'Oversikt', icon: ChartBarIcon },
              { id: 'bundles', name: 'Bundles', icon: CubeIcon },
              { id: 'images', name: 'Bilder', icon: PhotoIcon },
              { id: 'suggestions', name: 'Forslag', icon: BoltIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-2 py-1">
          <div className="text-center">
            <CubeSolidIcon className="h-24 w-24 text-purple-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Asset Optimization Dashboard
            </h3>
            <p className="text-gray-600 mb-8">
              Komplett bundle analyse og ytelsesoptimering kommer snart
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid max-w-4xl mx-auto">
              <div className="text-center px-2 py-1 border border-gray-200 rounded-lg">
                <ServerIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900">Bundle Analyse</h4>
                <p className="text-sm text-gray-600">Analysér JavaScript og CSS bundles</p>
              </div>
              
              <div className="text-center px-2 py-1 border border-gray-200 rounded-lg">
                <PhotoIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900">Bildeoptimering</h4>
                <p className="text-sm text-gray-600">WebP konvertering og komprimering</p>
              </div>
              
              <div className="text-center px-2 py-1 border border-gray-200 rounded-lg">
                <BoltSolidIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900">Performance Tips</h4>
                <p className="text-sm text-gray-600">Automatiske optimaliseringsforslag</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 