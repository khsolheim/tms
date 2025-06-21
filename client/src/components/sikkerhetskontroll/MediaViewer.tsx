import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaExpand, FaCompress, FaImage, FaVideo, FaVolumeUp, FaVolumeMute, FaMousePointer, FaInfoCircle, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

interface SporsmalMedia {
  id: number;
  type: 'IMAGE' | 'VIDEO' | 'INTERACTIVE' | 'AUDIO';
  url: string;
  tittel: string;
  beskrivelse?: string;
  rekkefølge: number;
  interactivePoints?: InteractivePoint[];
}

interface InteractivePoint {
  id: string;
  x: number; // Prosent (0-100)
  y: number; // Prosent (0-100)
  tittel: string;
  beskrivelse: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'TIP' | 'PROBLEM';
  action?: 'ZOOM' | 'POPUP' | 'HIGHLIGHT';
}

interface MediaViewerProps {
  media: SporsmalMedia[];
  onInteraction?: (pointId: string, mediaId: number) => void;
  compact?: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  media, 
  onInteraction,
  compact = false 
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInteractivePoints, setShowInteractivePoints] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<InteractivePoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMedia = media[currentMediaIndex];

  useEffect(() => {
    // Reset zoom når media endres
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
    setSelectedPoint(null);
  }, [currentMediaIndex]);

  const togglePlayPause = () => {
    if (currentMedia.type === 'VIDEO' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (currentMedia.type === 'AUDIO' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleInteractivePointClick = (point: InteractivePoint) => {
    setSelectedPoint(point);
    
    if (point.action === 'ZOOM') {
      setZoomLevel(2);
      setZoomPosition({ x: point.x, y: point.y });
    }
    
    if (onInteraction) {
      onInteraction(point.id, currentMedia.id);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.5);
    } else if (direction === 'out' && zoomLevel > 1) {
      setZoomLevel(zoomLevel - 0.5);
      if (zoomLevel <= 1.5) {
        setZoomPosition({ x: 0, y: 0 });
      }
    }
  };

  const getPointIcon = (type: InteractivePoint['type']) => {
    switch (type) {
      case 'INFO': return '💡';
      case 'WARNING': return '⚠️';
      case 'CRITICAL': return '🚨';
      case 'TIP': return '💡';
      case 'PROBLEM': return '❌';
      default: return '📍';
    }
  };

  const getPointColor = (type: InteractivePoint['type']) => {
    switch (type) {
      case 'INFO': return 'bg-blue-500 border-blue-600';
      case 'WARNING': return 'bg-yellow-500 border-yellow-600';
      case 'CRITICAL': return 'bg-red-500 border-red-600';
      case 'TIP': return 'bg-green-500 border-green-600';
      case 'PROBLEM': return 'bg-red-600 border-red-700';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  if (!media || media.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg px-2 py-1 text-center text-gray-600">
        <FaImage className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>Ingen media tilgjengelig</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg px-2 py-1">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {currentMedia.type === 'IMAGE' && <FaImage className="w-5 h-5 text-blue-600" />}
            {currentMedia.type === 'VIDEO' && <FaVideo className="w-5 h-5 text-red-600" />}
            {currentMedia.type === 'AUDIO' && <FaVolumeUp className="w-5 h-5 text-green-600" />}
            {currentMedia.type === 'INTERACTIVE' && <FaMousePointer className="w-5 h-5 text-purple-600" />}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{currentMedia.tittel}</h4>
            {currentMedia.beskrivelse && (
              <p className="text-sm text-gray-600">{currentMedia.beskrivelse}</p>
            )}
          </div>
          {media.length > 1 && (
            <div className="text-sm text-gray-500">
              {currentMediaIndex + 1} / {media.length}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
      }`}
    >
      {/* Media Header */}
      <div className="px-2 py-1 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {currentMedia.type === 'IMAGE' && <FaImage className="w-4 h-4 text-blue-600" />}
              {currentMedia.type === 'VIDEO' && <FaVideo className="w-4 h-4 text-red-600" />}
              {currentMedia.type === 'AUDIO' && <FaVolumeUp className="w-4 h-4 text-green-600" />}
              {currentMedia.type === 'INTERACTIVE' && <FaMousePointer className="w-4 h-4 text-purple-600" />}
              <h3 className="font-medium text-gray-900">{currentMedia.tittel}</h3>
            </div>
            {currentMedia.beskrivelse && (
              <p className="text-sm text-gray-600">{currentMedia.beskrivelse}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls for Images */}
            {currentMedia.type === 'IMAGE' && (
              <>
                <button
                  onClick={() => handleZoom('out')}
                  disabled={zoomLevel <= 1}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  title="Zoom ut"
                >
                  <FaSearchMinus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => handleZoom('in')}
                  disabled={zoomLevel >= 3}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  title="Zoom inn"
                >
                  <FaSearchPlus className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Interactive Points Toggle */}
            {currentMedia.interactivePoints && currentMedia.interactivePoints.length > 0 && (
              <button
                onClick={() => setShowInteractivePoints(!showInteractivePoints)}
                className={`p-1 rounded ${
                  showInteractivePoints 
                    ? 'text-purple-600 bg-purple-100' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Vis/skjul interaktive punkter"
              >
                <FaMousePointer className="w-4 h-4" />
              </button>
            )}

            {/* Media Navigation */}
            {media.length > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                  disabled={currentMediaIndex === 0}
                  className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  ‹
                </button>
                <span className="text-sm text-gray-600">
                  {currentMediaIndex + 1} / {media.length}
                </span>
                <button
                  onClick={() => setCurrentMediaIndex(Math.min(media.length - 1, currentMediaIndex + 1))}
                  disabled={currentMediaIndex === media.length - 1}
                  className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  ›
                </button>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-600 hover:text-gray-800"
              title={isFullscreen ? 'Avslutt fullskjerm' : 'Fullskjerm'}
            >
              {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative">
        {currentMedia.type === 'IMAGE' && (
          <div className="relative overflow-hidden">
            <img
              src={currentMedia.url}
              alt={currentMedia.tittel}
              className="w-full h-auto transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel}) translate(${-zoomPosition.x * (zoomLevel - 1)}px, ${-zoomPosition.y * (zoomLevel - 1)}px)`,
                transformOrigin: 'center'
              }}
            />
            
            {/* Interactive Points Overlay */}
            {showInteractivePoints && currentMedia.interactivePoints && (
              <div className="absolute inset-0">
                {currentMedia.interactivePoints.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => handleInteractivePointClick(point)}
                    className={`absolute w-6 h-6 rounded-full border-2 ${getPointColor(point.type)} 
                      text-white text-xs font-bold flex items-center justify-center
                      transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform
                      animate-pulse hover:animate-none shadow-lg`}
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / zoomLevel})`
                    }}
                    title={point.tittel}
                  >
                    {getPointIcon(point.type)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentMedia.type === 'VIDEO' && (
          <div className="relative">
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="w-full h-auto"
              controls={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayPause}
                  className="p-2 text-white hover:text-gray-300"
                >
                  {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:text-gray-300"
                >
                  {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentMedia.type === 'AUDIO' && (
          <div className="px-2 py-1 bg-gray-50">
            <audio
              ref={audioRef}
              src={currentMedia.url}
              className="hidden"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
              </button>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{currentMedia.tittel}</h4>
                <p className="text-sm text-gray-600">Lydfil</p>
              </div>
              
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {currentMedia.type === 'INTERACTIVE' && (
          <div className="px-2 py-1 bg-purple-50">
            <div className="text-center">
              <FaMousePointer className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">Interaktivt Diagram</h4>
              <p className="text-sm text-gray-600 mb-4">
                Klikk på de markerte punktene for å utforske
              </p>
              <button onClick={() => console.log('Launch interactive')} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                Start Interaktiv Modus
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Point Details Modal */}
      {selectedPoint && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg px-2 py-1 max-w-md mx-4 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getPointIcon(selectedPoint.type)}</span>
                <h3 className="font-bold text-gray-900">{selectedPoint.tittel}</h3>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-700 mb-4">{selectedPoint.beskrivelse}</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedPoint(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Lukk
              </button>
              {selectedPoint.action === 'ZOOM' && (
                <button
                  onClick={() => {
                    handleZoom('in');
                    setSelectedPoint(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Zoom Inn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaViewer; 