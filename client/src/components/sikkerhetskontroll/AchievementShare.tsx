import React, { useState } from 'react';
import { FaShare, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaWhatsapp, FaCopy, FaDownload, FaTimes } from 'react-icons/fa';

interface Achievement {
  id: number;
  navn: string;
  beskrivelse: string;
  ikon: string;
  type: 'FERDIGHET' | 'INNSATS' | 'SOSIAL' | 'SPESIAL';
  sjelden: boolean;
  xpBelonning: number;
  opplastDato: string;
}

interface AchievementShareProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
  userLevel: number;
  userName: string;
}

const AchievementShare: React.FC<AchievementShareProps> = ({
  achievement,
  isOpen,
  onClose,
  userLevel,
  userName
}) => {
  const [shareMethod, setShareMethod] = useState<'social' | 'image' | 'link'>('social');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const shareText = `🏆 Jeg har nettopp oppnådd "${achievement.navn}" achievement i TMS Sikkerhetskontroll! ${achievement.sjelden ? '⭐ Dette er en sjelden prestasjon!' : ''} #TMSSikkerhetskontroll #Førerkort #Achievement`;

  const shareUrl = `https://tms.no/sikkerhetskontroll/achievement/${achievement.id}`;

  const socialMediaPlatforms = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    }
  ];

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Kunne ikke kopiere link:', err);
    }
  };

  const handleDownloadImage = () => {
    // Generer achievement-bilde for nedlasting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Bakgrunn gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Achievement info
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Achievement Unlocked!', 300, 80);

    ctx.font = 'bold 24px Arial';
    ctx.fillText(achievement.navn, 300, 140);

    ctx.font = '18px Arial';
    ctx.fillText(achievement.beskrivelse, 300, 180);

    ctx.font = '16px Arial';
    ctx.fillText(`${userName} - Level ${userLevel}`, 300, 240);
    ctx.fillText(`+${achievement.xpBelonning} XP`, 300, 270);

    if (achievement.sjelden) {
      ctx.fillText('⭐ Sjelden prestasjon!', 300, 310);
    }

    ctx.font = '14px Arial';
    ctx.fillText('TMS Sikkerhetskontroll', 300, 360);

    // Last ned bildet
    const link = document.createElement('a');
    link.download = `achievement-${achievement.navn.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'FERDIGHET': return 'from-blue-400 to-blue-600';
      case 'INNSATS': return 'from-green-400 to-green-600';
      case 'SOSIAL': return 'from-purple-400 to-purple-600';
      case 'SPESIAL': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 py-1">
      <div className="bg-white rounded-xl max-w-md w-full px-2 py-1 cards-spacing-vertical">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Del ditt achievement! 🎉</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement preview */}
        <div className={`bg-gradient-to-r ${getAchievementTypeColor(achievement.type)} p-6 rounded-lg text-white text-center`}>
          <div className="text-4xl mb-2">{achievement.ikon}</div>
          <h3 className="text-lg font-bold mb-1">{achievement.navn}</h3>
          <p className="text-sm opacity-90 mb-2">{achievement.beskrivelse}</p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span>+{achievement.xpBelonning} XP</span>
            {achievement.sjelden && <span>⭐ Sjelden</span>}
          </div>
        </div>

        {/* Share method tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'social', label: 'Sosiale medier', icon: FaShare },
            { key: 'image', label: 'Last ned bilde', icon: FaDownload },
            { key: 'link', label: 'Kopier link', icon: FaCopy }
          ].map((method) => (
            <button
              key={method.key}
              onClick={() => setShareMethod(method.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                shareMethod === method.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <method.icon className="w-4 h-4" />
              <span>{method.label}</span>
            </button>
          ))}
        </div>

        {/* Share content */}
        <div className="cards-spacing-vertical">
          {shareMethod === 'social' && (
            <div className="cards-spacing-vertical">
              <p className="text-sm text-gray-600">Velg hvor du vil dele ditt achievement:</p>
              <div className="grid grid-cols-2 cards-spacing-grid">
                {socialMediaPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleSocialShare(platform.url)}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-white transition-colors ${platform.color}`}
                  >
                    <platform.icon className="w-5 h-5" />
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {shareMethod === 'image' && (
            <div className="cards-spacing-vertical">
              <p className="text-sm text-gray-600">
                Last ned et bilde av ditt achievement for å dele hvor du vil:
              </p>
              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-1 px-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload className="w-5 h-5" />
                <span>Last ned achievement-bilde</span>
              </button>
              <p className="text-xs text-gray-500 text-center">
                Bildet vil inneholde ditt achievement og kan deles på Instagram, Snapchat, eller andre plattformer.
              </p>
            </div>
          )}

          {shareMethod === 'link' && (
            <div className="cards-spacing-vertical">
              <p className="text-sm text-gray-600">
                Kopier linken til ditt achievement:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className={`p-3 rounded-lg transition-colors ${
                    copySuccess 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <FaCopy className="w-4 h-4" />
                </button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-600 text-center">✅ Link kopiert!</p>
              )}
            </div>
          )}
        </div>

        {/* Motivational message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-center">
          <p className="text-sm text-blue-800">
            🎯 <strong>Del fremgangen din!</strong> Inspirer andre elever til å nå sine mål i sikkerhetskontroll.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementShare; 