import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  CameraIcon,
  MicrophoneIcon,
  MapPinIcon,
  WifiIcon,
  SignalIcon,
  Battery50Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PhotoIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  HandRaisedIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

interface MobilKontroll {
  id: string;
  tittel: string;
  status: 'ikke_startet' | 'pågår' | 'fullført' | 'feilet';
  progresjon: number;
  estimertTid: number;
  faktiskTid?: number;
  kreverFoto: boolean;
  kreverLyd: boolean;
  kreverLokasjon: boolean;
  kritiskPunkt: boolean;
}

interface DeviceStatus {
  battery: number;
  signal: number;
  wifi: boolean;
  gps: boolean;
  camera: boolean;
  microphone: boolean;
}

const Forslag4Mobil: React.FC = () => {
  const [kontroller, setKontroller] = useState<MobilKontroll[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [activeKontroll, setActiveKontroll] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    const mockKontroller: MobilKontroll[] = [
      {
        id: '1',
        tittel: 'Daglig sikkerhetskontroll',
        status: 'ikke_startet',
        progresjon: 0,
        estimertTid: 5,
        kreverFoto: true,
        kreverLyd: false,
        kreverLokasjon: true,
        kritiskPunkt: false
      },
      {
        id: '2',
        tittel: 'Utstyrskontroll',
        status: 'pågår',
        progresjon: 60,
        estimertTid: 8,
        faktiskTid: 5,
        kreverFoto: true,
        kreverLyd: true,
        kreverLokasjon: false,
        kritiskPunkt: true
      },
      {
        id: '3',
        tittel: 'Miljøkontroll',
        status: 'fullført',
        progresjon: 100,
        estimertTid: 3,
        faktiskTid: 4,
        kreverFoto: false,
        kreverLyd: false,
        kreverLokasjon: true,
        kritiskPunkt: false
      }
    ];

    const mockDeviceStatus: DeviceStatus = {
      battery: 78,
      signal: 4,
      wifi: true,
      gps: true,
      camera: true,
      microphone: true
    };

    setKontroller(mockKontroller);
    setDeviceStatus(mockDeviceStatus);
    setLoading(false);
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ikke_startet': return 'bg-gray-100 text-gray-800';
      case 'pågår': return 'bg-blue-100 text-blue-800';
      case 'fullført': return 'bg-green-100 text-green-800';
      case 'feilet': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ikke_startet': return ClockIcon;
      case 'pågår': return PlayIcon;
      case 'fullført': return CheckCircleIconSolid;
      case 'feilet': return ExclamationTriangleIconSolid;
      default: return ClockIcon;
    }
  };

  const startKontroll = (id: string) => {
    setActiveKontroll(id);
    setCurrentStep(1);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setRecordingTime(0);
    }
  };

  const capturePhoto = () => {
    // Mock photo capture
    setCapturedPhoto('/api/placeholder/300/200');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Control Interface
  if (activeKontroll) {
    const kontroll = kontroller.find(k => k.id === activeKontroll);
    if (!kontroll) return null;

    return (
      <div className="bg-gray-900 min-h-screen text-white">
        {/* Mobile Header */}
        <div className="bg-black px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <SignalIcon className="w-4 h-4" />
            <span>{deviceStatus?.signal}/5</span>
            {deviceStatus?.wifi && <WifiIcon className="w-4 h-4" />}
          </div>
          <div className="font-mono">12:34</div>
          <div className="flex items-center gap-1">
            <span>{deviceStatus?.battery}%</span>
            <Battery50Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Control Header */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setActiveKontroll(null)}
              className="p-2 bg-gray-700 rounded-full"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{kontroll.tittel}</h2>
              <p className="text-gray-400 text-sm">Steg {currentStep} av {totalSteps}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400">
            {Math.round((currentStep / totalSteps) * 100)}% fullført
          </div>
        </div>

        {/* Control Content */}
        <div className="p-4 space-y-6">
          {/* Current Step */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-2">
              Kontroller sikkerhetsutstyr
            </h3>
            <p className="text-gray-400 mb-4">
              Inspiser alt sikkerhetsutstyr og dokumenter eventuelle feil
            </p>
            
            {/* Requirements */}
            <div className="space-y-3 mb-6">
              {kontroll.kreverFoto && (
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <CameraIcon className="w-6 h-6 text-blue-400" />
                  <span>Foto påkrevd</span>
                  {capturedPhoto && <CheckCircleIconSolid className="w-5 h-5 text-green-400" />}
                </div>
              )}
              
              {kontroll.kreverLyd && (
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <MicrophoneIcon className="w-6 h-6 text-red-400" />
                  <span>Lydopptak påkrevd</span>
                  {isRecording && <span className="text-red-400 animate-pulse">REC {formatTime(recordingTime)}</span>}
                </div>
              )}
              
              {kontroll.kreverLokasjon && (
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-green-400" />
                  <span>GPS-lokasjon påkrevd</span>
                  <CheckCircleIconSolid className="w-5 h-5 text-green-400" />
                </div>
              )}
            </div>
          </div>

          {/* Photo Capture */}
          {kontroll.kreverFoto && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="font-semibold mb-3">Ta foto av utstyr</h4>
              {capturedPhoto ? (
                <div className="space-y-3">
                  <img 
                    src={capturedPhoto} 
                    alt="Captured" 
                    className="w-full h-48 object-cover rounded-lg bg-gray-700"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium"
                    >
                      Ta nytt foto
                    </button>
                    <button className="px-4 py-3 bg-gray-700 rounded-lg">
                      <PhotoIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={capturePhoto}
                  className="w-full h-48 bg-gray-700 rounded-lg flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-600 transition-colors"
                >
                  <CameraIcon className="w-12 h-12" />
                  <span>Trykk for å ta foto</span>
                </button>
              )}
            </div>
          )}

          {/* Audio Recording */}
          {kontroll.kreverLyd && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="font-semibold mb-3">Lydopptak av observasjoner</h4>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isRecording ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                >
                  {isRecording ? (
                    <StopIcon className="w-8 h-8" />
                  ) : (
                    <MicrophoneIcon className="w-8 h-8" />
                  )}
                </button>
                <div className="flex-1">
                  {isRecording ? (
                    <div>
                      <div className="text-red-400 font-semibold">Tar opp...</div>
                      <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-400">Trykk for å starte opptak</div>
                      <div className="text-sm text-gray-500">Beskriv hva du observerer</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-6 h-6" />
              Godkjent
            </button>
            <button className="bg-red-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6" />
              Avvik
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              disabled={currentStep === 1}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            >
              Forrige
            </button>
            <button
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium"
              onClick={() => {
                if (currentStep < totalSteps) {
                  setCurrentStep(currentStep + 1);
                } else {
                  setActiveKontroll(null);
                }
              }}
            >
              {currentStep === totalSteps ? 'Fullfør' : 'Neste'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Mobile Interface
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/sikkerhetskontroll"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Tilbake
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Mobiloptimalisert
          </h1>
          <div className="w-8"></div>
        </div>

        {/* Device Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Enhetsstatus</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Battery50Icon className={`w-5 h-5 ${deviceStatus?.battery && deviceStatus.battery > 20 ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">{deviceStatus?.battery}%</span>
            </div>
            <div className="flex items-center gap-2">
              <SignalIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm">{deviceStatus?.signal}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiIcon className={`w-5 h-5 ${deviceStatus?.wifi ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">{deviceStatus?.wifi ? 'Tilkoblet' : 'Frakoblet'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className={`w-5 h-5 ${deviceStatus?.gps ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">{deviceStatus?.gps ? 'GPS aktiv' : 'GPS av'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-blue-600 text-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2">
            <QrCodeIcon className="w-8 h-8" />
            <span className="font-medium">Skann QR</span>
          </button>
          <button className="bg-green-600 text-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2">
            <CameraIcon className="w-8 h-8" />
            <span className="font-medium">Hurtigfoto</span>
          </button>
        </div>

        {/* Kontroller List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Dine kontroller</h2>
          
          {kontroller.map((kontroll) => {
            const StatusIcon = getStatusIcon(kontroll.status);
            return (
              <div key={kontroll.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <StatusIcon className="w-6 h-6 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{kontroll.tittel}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>~{kontroll.estimertTid} min</span>
                      {kontroll.faktiskTid && (
                        <span>Brukt: {kontroll.faktiskTid} min</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(kontroll.status)}`}>
                    {kontroll.status === 'ikke_startet' ? 'Ikke startet' :
                     kontroll.status === 'pågår' ? 'Pågår' :
                     kontroll.status === 'fullført' ? 'Fullført' : 'Feilet'}
                  </span>
                </div>
                
                {/* Requirements Icons */}
                <div className="flex items-center gap-3 mb-3">
                  {kontroll.kreverFoto && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CameraIcon className="w-4 h-4" />
                      <span>Foto</span>
                    </div>
                  )}
                  {kontroll.kreverLyd && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MicrophoneIcon className="w-4 h-4" />
                      <span>Lyd</span>
                    </div>
                  )}
                  {kontroll.kreverLokasjon && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPinIcon className="w-4 h-4" />
                      <span>GPS</span>
                    </div>
                  )}
                  {kontroll.kritiskPunkt && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Kritisk</span>
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                {kontroll.status === 'pågår' && (
                  <div className="mb-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${kontroll.progresjon}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{kontroll.progresjon}% fullført</div>
                  </div>
                )}
                
                {/* Action Button */}
                <button
                  onClick={() => kontroll.status !== 'fullført' && startKontroll(kontroll.id)}
                  disabled={kontroll.status === 'fullført'}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    kontroll.status === 'fullført'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : kontroll.status === 'pågår'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {kontroll.status === 'ikke_startet' ? 'Start kontroll' :
                   kontroll.status === 'pågår' ? 'Fortsett kontroll' :
                   kontroll.status === 'fullført' ? 'Fullført' : 'Prøv igjen'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center gap-8">
              <button className="flex flex-col items-center gap-1 text-blue-600">
                <DevicePhoneMobileIcon className="w-6 h-6" />
                <span className="text-xs">Kontroller</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400">
                <DocumentTextIcon className="w-6 h-6" />
                <span className="text-xs">Rapporter</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400">
                <Cog6ToothIcon className="w-6 h-6" />
                <span className="text-xs">Innstillinger</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom padding for fixed navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Forslag4Mobil; 