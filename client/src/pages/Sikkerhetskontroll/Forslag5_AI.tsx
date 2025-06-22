import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  SparklesIcon,
  CpuChipIcon,
  EyeIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesIconSolid,
  CpuChipIcon as CpuChipIconSolid
} from '@heroicons/react/24/solid';

interface AIAnalyse {
  id: string;
  type: 'bilde' | 'lyd' | 'tekst' | 'video';
  status: 'analyserer' | 'fullført' | 'feil';
  resultat?: {
    score: number;
    problemer: string[];
    anbefalinger: string[];
    sikkerhetsnivå: 'høy' | 'medium' | 'lav';
  };
  tidBrukt: number;
}

interface AIAssistent {
  aktivt: boolean;
  modus: 'lytter' | 'analyserer' | 'svarer';
  sisteSpørsmål?: string;
  sisteSvar?: string;
  tilgjengeligeKommandoer: string[];
}

interface SmartSuggestion {
  id: string;
  type: 'forbedring' | 'advarsel' | 'tips';
  tittel: string;
  beskrivelse: string;
  prioritet: 'høy' | 'medium' | 'lav';
  implementert: boolean;
}

const Forslag5AI: React.FC = () => {
  const [aiAnalyser, setAiAnalyser] = useState<AIAnalyse[]>([]);
  const [aiAssistent, setAiAssistent] = useState<AIAssistent | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    // Mock data
    const mockAnalyser: AIAnalyse[] = [
      {
        id: '1',
        type: 'bilde',
        status: 'fullført',
        resultat: {
          score: 92,
          problemer: ['Liten rust på høyre hjørne', 'Manglende sikkerhetsetikett'],
          anbefalinger: ['Behandle rust med rustbeskyttelse', 'Påfør ny sikkerhetsetikett'],
          sikkerhetsnivå: 'høy'
        },
        tidBrukt: 2.3
      },
      {
        id: '2',
        type: 'lyd',
        status: 'analyserer',
        tidBrukt: 1.1
      },
      {
        id: '3',
        type: 'tekst',
        status: 'fullført',
        resultat: {
          score: 87,
          problemer: ['Ufullstendig dokumentasjon'],
          anbefalinger: ['Legg til dato og signatur', 'Spesifiser type utstyr'],
          sikkerhetsnivå: 'medium'
        },
        tidBrukt: 0.8
      }
    ];

    const mockAssistent: AIAssistent = {
      aktivt: true,
      modus: 'lytter',
      sisteSpørsmål: 'Hvordan gjennomfører jeg en sikkerhetskontroll?',
      sisteSvar: 'Start med å kontrollere alle synlige deler av utstyret. Se etter rust, skader eller manglende deler. Dokumenter alt du finner med foto og notater.',
      tilgjengeligeKommandoer: [
        'Start ny kontroll',
        'Analyser bilde',
        'Generer rapport',
        'Vis anbefalinger',
        'Hjelp med prosedyre'
      ]
    };

    const mockSuggestions: SmartSuggestion[] = [
      {
        id: '1',
        type: 'advarsel',
        tittel: 'Økt feilrate oppdaget',
        beskrivelse: 'AI har oppdaget 23% økning i feil på teknisk utstyr siste uke',
        prioritet: 'høy',
        implementert: false
      },
      {
        id: '2',
        type: 'forbedring',
        tittel: 'Optimalisert kontrollrekkefølge',
        beskrivelse: 'Basert på historiske data foreslår AI en ny rekkefølge som kan spare 15% tid',
        prioritet: 'medium',
        implementert: false
      },
      {
        id: '3',
        type: 'tips',
        tittel: 'Beste tid for kontroll',
        beskrivelse: 'Analyse viser at kontroller gjennomført mellom 09:00-11:00 har høyest nøyaktighet',
        prioritet: 'lav',
        implementert: true
      }
    ];

    setAiAnalyser(mockAnalyser);
    setAiAssistent(mockAssistent);
    setSmartSuggestions(mockSuggestions);
    setLoading(false);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  const startAIAnalysis = (type: 'bilde' | 'lyd' | 'tekst') => {
    const newAnalyse: AIAnalyse = {
      id: Date.now().toString(),
      type,
      status: 'analyserer',
      tidBrukt: 0
    };
    setAiAnalyser(prev => [...prev, newAnalyse]);
  };

  const toggleVoiceAssistant = () => {
    setIsListening(!isListening);
    if (aiAssistent) {
      setAiAssistent({
        ...aiAssistent,
        modus: isListening ? 'lytter' : 'analyserer'
      });
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    // Mock AI response
    if (aiAssistent) {
      setAiAssistent({
        ...aiAssistent,
        sisteSpørsmål: chatInput,
        sisteSvar: 'AI analyserer ditt spørsmål og genererer et svar basert på best practice og historiske data...',
        modus: 'svarer'
      });
    }
    setChatInput('');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'advarsel': return ExclamationTriangleIcon;
      case 'forbedring': return LightBulbIcon;
      case 'tips': return InformationCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getSuggestionColor = (type: string, prioritet: string) => {
    if (type === 'advarsel') return 'border-red-200 bg-red-50';
    if (prioritet === 'høy') return 'border-orange-200 bg-orange-50';
    if (prioritet === 'medium') return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyserer': return 'text-blue-600';
      case 'fullført': return 'text-green-600';
      case 'feil': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-assistert Sikkerhetskontroll
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <SparklesIconSolid className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900">AI Aktiv</span>
              </div>
            </div>
            
            <button
              onClick={toggleVoiceAssistant}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              <MicrophoneIcon className="w-5 h-5" />
              {isListening ? 'Lytter...' : 'Stemmeassistent'}
            </button>
          </div>
        </div>

        {/* AI Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CpuChipIconSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Analyse</h3>
                <p className="text-sm text-gray-600">Sanntidsanalyse aktiv</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Prosessert i dag</span>
                <span className="font-medium">247 elementer</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nøyaktighet</span>
                <span className="font-medium text-green-600">96.8%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Bildegjenkjenning</h3>
                <p className="text-sm text-gray-600">Automatisk defektdeteksjon</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bilder analysert</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Defekter funnet</span>
                <span className="font-medium text-orange-600">23</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BeakerIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Prediktiv Analyse</h3>
                <p className="text-sm text-gray-600">Forutsier vedlikeholdsbehov</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Prediksjoner</span>
                <span className="font-medium">89 aktive</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Treffsikkerhet</span>
                <span className="font-medium text-purple-600">94.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistent</h3>
                  <p className="text-sm text-gray-600">
                    Status: {aiAssistent?.modus === 'lytter' ? 'Klar til å hjelpe' : 
                             aiAssistent?.modus === 'analyserer' ? 'Analyserer...' : 'Svarer...'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {aiAssistent?.sisteSpørsmål && (
                <div className="space-y-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Du:</strong> {aiAssistent.sisteSpørsmål}
                    </p>
                  </div>
                  {aiAssistent.sisteSvar && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>AI:</strong> {aiAssistent.sisteSvar}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Spør AI-assistenten..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Send
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Hurtigkommandoer:</p>
                <div className="flex flex-wrap gap-2">
                  {aiAssistent?.tilgjengeligeKommandoer.map((kommando, index) => (
                    <button
                      key={index}
                      onClick={() => setChatInput(kommando)}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      {kommando}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Smart Anbefalinger</h3>
              <p className="text-sm text-gray-600">AI-genererte forslag basert på data</p>
            </div>
            
            <div className="p-6 space-y-4">
              {smartSuggestions.map((suggestion) => {
                const IconComponent = getSuggestionIcon(suggestion.type);
                return (
                  <div
                    key={suggestion.id}
                    className={`p-4 border rounded-lg ${getSuggestionColor(suggestion.type, suggestion.prioritet)}`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{suggestion.tittel}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            suggestion.prioritet === 'høy' ? 'bg-red-100 text-red-800' :
                            suggestion.prioritet === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {suggestion.prioritet}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.beskrivelse}</p>
                        <button
                          disabled={suggestion.implementert}
                          className={`text-sm font-medium ${
                            suggestion.implementert 
                              ? 'text-green-600 cursor-not-allowed' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {suggestion.implementert ? '✓ Implementert' : 'Implementer'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Pågående AI-analyser</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startAIAnalysis('bilde')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  <CameraIcon className="w-4 h-4" />
                  Analyser bilde
                </button>
                <button
                  onClick={() => startAIAnalysis('lyd')}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  <MicrophoneIcon className="w-4 h-4" />
                  Analyser lyd
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {aiAnalyser.map((analyse) => (
                <div key={analyse.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        analyse.type === 'bilde' ? 'bg-blue-100' :
                        analyse.type === 'lyd' ? 'bg-green-100' :
                        analyse.type === 'tekst' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        {analyse.type === 'bilde' && <CameraIcon className="w-5 h-5 text-blue-600" />}
                        {analyse.type === 'lyd' && <MicrophoneIcon className="w-5 h-5 text-green-600" />}
                        {analyse.type === 'tekst' && <DocumentTextIcon className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{analyse.type}-analyse</h4>
                        <p className={`text-sm ${getStatusColor(analyse.status)}`}>
                          {analyse.status === 'analyserer' ? 'Analyserer...' :
                           analyse.status === 'fullført' ? 'Fullført' : 'Feil oppstod'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{analyse.tidBrukt}s</div>
                      {analyse.resultat && (
                        <div className={`text-lg font-bold ${
                          analyse.resultat.score >= 90 ? 'text-green-600' :
                          analyse.resultat.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analyse.resultat.score}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {analyse.status === 'analyserer' && (
                    <div className="mb-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {analyse.resultat && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className={`w-5 h-5 ${
                          analyse.resultat.sikkerhetsnivå === 'høy' ? 'text-green-500' :
                          analyse.resultat.sikkerhetsnivå === 'medium' ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                        <span className="text-sm font-medium">
                          Sikkerhetsnivå: {analyse.resultat.sikkerhetsnivå}
                        </span>
                      </div>
                      
                      {analyse.resultat.problemer.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Identifiserte problemer:</h5>
                          <ul className="text-sm text-red-600 space-y-1">
                            {analyse.resultat.problemer.map((problem, index) => (
                              <li key={index}>• {problem}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analyse.resultat.anbefalinger.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">AI-anbefalinger:</h5>
                          <ul className="text-sm text-blue-600 space-y-1">
                            {analyse.resultat.anbefalinger.map((anbefaling, index) => (
                              <li key={index}>• {anbefaling}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">AI Innsikter</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Forbedret effektivitet</p>
                  <p className="text-xs text-blue-700">AI har redusert kontrolltid med 23%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Økt nøyaktighet</p>
                  <p className="text-xs text-green-700">96.8% nøyaktighet i defektdeteksjon</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <AcademicCapIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Kontinuerlig læring</p>
                  <p className="text-xs text-purple-700">Modellen forbedres med hver kontroll</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Kommende AI-funksjoner</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BoltIcon className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sanntids-coaching</p>
                  <p className="text-xs text-gray-600">Live veiledning under kontroller</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Avansert rapportering</p>
                  <p className="text-xs text-gray-600">Automatisk genererte analyser</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BeakerIcon className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Prediktiv vedlikehold</p>
                  <p className="text-xs text-gray-600">Forutsi problemer før de oppstår</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forslag5AI; 