import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EyeIcon,
  CubeIcon,
  PlayIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon,
  SparklesIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface VRScenario {
  id: string;
  tittel: string;
  beskrivelse: string;
  type: 'VR' | 'AR' | '3D';
  vanskelighetsgrad: 'Lett' | 'Medium' | 'Vanskelig';
  varighet: string;
  kategori: string;
  tilgjengelig: boolean;
}

export default function BrukerForslag5_VR() {
  const [selectedScenario, setSelectedScenario] = useState<VRScenario | null>(null);
  const [vrSupported] = useState(true);
  const [arSupported] = useState(true);

  const [vrScenarios] = useState<VRScenario[]>([
    {
      id: '1',
      tittel: 'Virtuell Kjøreskole',
      beskrivelse: 'Øv på kjøring i en trygg virtuell verden',
      type: 'VR',
      vanskelighetsgrad: 'Medium',
      varighet: '15 min',
      kategori: 'Kjøring',
      tilgjengelig: true
    },
    {
      id: '2',
      tittel: 'AR Trafikkskilting',
      beskrivelse: 'Lær trafikkskilter i din egen omgivelse',
      type: 'AR',
      vanskelighetsgrad: 'Lett',
      varighet: '10 min',
      kategori: 'Skilt',
      tilgjengelig: true
    },
    {
      id: '3',
      tittel: '3D Motoranatomie',
      beskrivelse: 'Utforsk bilmotoren i detalj',
      type: '3D',
      vanskelighetsgrad: 'Vanskelig',
      varighet: '20 min',
      kategori: 'Teknikk',
      tilgjengelig: false
    },
    {
      id: '4',
      tittel: 'VR Førstehjelpstrening',
      beskrivelse: 'Øv på livredning i realistiske situasjoner',
      type: 'VR',
      vanskelighetsgrad: 'Vanskelig',
      varighet: '25 min',
      kategori: 'Sikkerhet',
      tilgjengelig: true
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VR': return 'from-purple-500 to-pink-500';
      case 'AR': return 'from-blue-500 to-cyan-500';
      case '3D': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VR': return EyeIcon;
      case 'AR': return CameraIcon;
      case '3D': return CubeIcon;
      default: return PlayIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Immersive Learning
              </h1>
              <p className="text-gray-600 mt-1">Lær gjennom VR, AR og 3D-simulering</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
              vrSupported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <EyeIcon className="w-3 h-3" />
              <span>VR {vrSupported ? 'Støttet' : 'Ikke støttet'}</span>
            </div>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
              arSupported ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            }`}>
              <CameraIcon className="w-3 h-3" />
              <span>AR {arSupported ? 'Støttet' : 'Ikke støttet'}</span>
            </div>
          </div>
        </div>

        {/* Device Check */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <DevicePhoneMobileIcon className="w-6 h-6 text-blue-500 mr-2" />
            Enhetskompatibilitet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <EyeIcon className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">VR Headset</span>
              </div>
              <div className="text-sm text-gray-600">
                {vrSupported ? '✅ Kompatibel' : '❌ Krever VR-headset'}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <CameraIcon className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">AR Kamera</span>
              </div>
              <div className="text-sm text-gray-600">
                {arSupported ? '✅ Kamera tilgjengelig' : '❌ Kamera kreves'}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <GlobeAltIcon className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">WebXR</span>
              </div>
              <div className="text-sm text-gray-600">✅ Nettleser støttet</div>
            </div>
          </div>
        </div>

        {/* Scenario Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {vrScenarios.map((scenario) => {
            const IconComponent = getTypeIcon(scenario.type);
            return (
              <div 
                key={scenario.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 transition-all duration-300 ${
                  !scenario.tilgjengelig ? 'opacity-50' : 'hover:shadow-xl transform hover:scale-105'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeColor(scenario.type)} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    scenario.type === 'VR' ? 'bg-purple-100 text-purple-700' :
                    scenario.type === 'AR' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {scenario.type}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">{scenario.tittel}</h3>
                <p className="text-gray-600 text-sm mb-4">{scenario.beskrivelse}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <AcademicCapIcon className="w-3 h-3 mr-1" />
                    {scenario.kategori}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    scenario.vanskelighetsgrad === 'Lett' ? 'bg-green-100 text-green-700' :
                    scenario.vanskelighetsgrad === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {scenario.vanskelighetsgrad}
                  </span>
                  <span>{scenario.varighet}</span>
                </div>

                <button 
                  onClick={() => setSelectedScenario(scenario)}
                  disabled={!scenario.tilgjengelig}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    !scenario.tilgjengelig
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${getTypeColor(scenario.type)} text-white hover:shadow-lg`
                  }`}
                >
                  {scenario.tilgjengelig ? 'Start Opplevelse' : 'Kommer snart'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Scenario Viewer */}
        {selectedScenario && (
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl shadow-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedScenario.tittel}</h2>
              <button 
                onClick={() => setSelectedScenario(null)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {selectedScenario.type === 'VR' ? '🥽' : 
                   selectedScenario.type === 'AR' ? '📱' : '🎮'}
                </div>
                <div className="text-lg mb-2">Klargjør {selectedScenario.type}-opplevelsen</div>
                <div className="text-sm opacity-80">
                  {selectedScenario.type === 'VR' ? 'Sett på VR-headsettet og følg instruksjonene' :
                   selectedScenario.type === 'AR' ? 'Hold telefonen foran deg og tillat kamerabruk' :
                   'Bruk mus og tastatur for å navigere i 3D-miljøet'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{selectedScenario.varighet}</div>
                <div className="text-sm opacity-80">Estimert tid</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{selectedScenario.vanskelighetsgrad}</div>
                <div className="text-sm opacity-80">Nivå</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{selectedScenario.kategori}</div>
                <div className="text-sm opacity-80">Kategori</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                <PlayIcon className="w-5 h-5" />
                <span>Start Opplevelse</span>
              </button>
              <button className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Innstillinger</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-600">VR Opplevelser</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <div className="text-sm text-gray-600">AR Scenarier</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">3D Modeller</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-orange-600">97%</div>
            <div className="text-sm text-gray-600">Immersion Score</div>
          </div>
        </div>
      </div>
    </div>
  );
} 