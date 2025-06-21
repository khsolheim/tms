import React from 'react';
import { FaCar, FaLock, FaCheck, FaStar } from 'react-icons/fa';

interface BilDel {
  id: string;
  navn: string;
  kategoriId: number;
  kategoriNavn: string;
  mestret: boolean;
  farge: string;
  posisjon: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface BilBuilderProps {
  klasse: {
    id: number;
    navn: string;
  };
  kategorier: Array<{
    id: number;
    navn: string;
    farge?: string;
    mestret?: boolean;
  }>;
  compact?: boolean;
}

const BilBuilder: React.FC<BilBuilderProps> = ({ klasse, kategorier, compact = false }) => {
  // Definerer bil-deler basert på kategori
  const getBilDeler = (): BilDel[] => {
    const standardDeler: Omit<BilDel, 'mestret'>[] = [
      {
        id: 'motor',
        navn: 'Motor',
        kategoriId: kategorier.find(k => k.navn.toLowerCase().includes('motor'))?.id || 0,
        kategoriNavn: 'Motorrom',
        farge: '#ef4444',
        posisjon: { x: 60, y: 35, width: 35, height: 25 }
      },
      {
        id: 'bremser',
        navn: 'Bremser',
        kategoriId: kategorier.find(k => k.navn.toLowerCase().includes('brems'))?.id || 0,
        kategoriNavn: 'Bremser',
        farge: '#f59e0b',
        posisjon: { x: 15, y: 70, width: 15, height: 15 }
      },
      {
        id: 'hjul',
        navn: 'Hjul',
        kategoriId: kategorier.find(k => k.navn.toLowerCase().includes('hjul') || k.navn.toLowerCase().includes('dekk'))?.id || 0,
        kategoriNavn: 'Dekk/Hjul',
        farge: '#10b981',
        posisjon: { x: 10, y: 75, width: 25, height: 25 }
      },
      {
        id: 'lys',
        navn: 'Lys',
        kategoriId: kategorier.find(k => k.navn.toLowerCase().includes('lys'))?.id || 0,
        kategoriNavn: 'Lys',
        farge: '#3b82f6',
        posisjon: { x: 5, y: 45, width: 20, height: 10 }
      },
      {
        id: 'vinduer',
        navn: 'Vinduer',
        kategoriId: kategorier.find(k => k.navn.toLowerCase().includes('vindu') || k.navn.toLowerCase().includes('speil'))?.id || 0,
        kategoriNavn: 'Vinduer/Speil',
        farge: '#8b5cf6',
        posisjon: { x: 30, y: 20, width: 50, height: 30 }
      }
    ];

    return standardDeler.map(del => ({
      ...del,
      mestret: kategorier.find(k => k.id === del.kategoriId)?.mestret || false
    }));
  };

  const bilDeler = getBilDeler();
  const mestredeDeler = bilDeler.filter(del => del.mestret).length;
  const totalDeler = bilDeler.length;
  const ferdighetsprosent = Math.round((mestredeDeler / totalDeler) * 100);

  const getBilStatus = () => {
    if (ferdighetsprosent >= 100) return { status: 'FERDIG', farge: 'text-green-600', tekst: 'Bil ferdig bygget!' };
    if (ferdighetsprosent >= 80) return { status: 'NESTEN_FERDIG', farge: 'text-blue-600', tekst: 'Nesten ferdig!' };
    if (ferdighetsprosent >= 60) return { status: 'GOD_FREMGANG', farge: 'text-yellow-600', tekst: 'God fremgang' };
    if (ferdighetsprosent >= 40) return { status: 'KOMMER_I_GANG', farge: 'text-orange-600', tekst: 'Kommer i gang' };
    return { status: 'STARTER', farge: 'text-gray-600', tekst: 'Nettopp startet' };
  };

  const bilStatus = getBilStatus();

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Din {klasse.navn} Bil</h3>
          <span className={`text-sm font-medium ${bilStatus.farge}`}>
            {ferdighetsprosent}% ferdig
          </span>
        </div>
        
        {/* Mini bil */}
        <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
          <svg viewBox="0 0 120 50" className="w-full h-full">
            {/* Bil-ramme */}
            <rect x="10" y="15" width="100" height="25" rx="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
            
            {/* Deler som er mestret */}
            {bilDeler.map((del) => (
              <g key={del.id}>
                <rect
                  x={del.posisjon.x * 0.4} // Skalert ned for compact visning
                  y={del.posisjon.y * 0.4}
                  width={del.posisjon.width * 0.4}
                  height={del.posisjon.height * 0.4}
                  rx="2"
                  fill={del.mestret ? del.farge : '#d1d5db'}
                  opacity={del.mestret ? 1 : 0.3}
                />
                {del.mestret && (
                  <FaCheck 
                    x={del.posisjon.x * 0.4 + 2} 
                    y={del.posisjon.y * 0.4 + 2} 
                    className="w-2 h-2 text-white"
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{mestredeDeler} av {totalDeler} deler</span>
          <span className={bilStatus.farge}>{bilStatus.tekst}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Bygg din {klasse.navn} bil</h2>
        <p className="text-gray-600">
          Mestre kategorier for å låse opp bildeler og bygge din egen bil!
        </p>
        <div className={`text-lg font-bold ${bilStatus.farge}`}>
          {ferdighetsprosent}% ferdig - {bilStatus.tekst}
        </div>
      </div>

      {/* Progresjonsbalk */}
      <div className="space-y-6">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Fremgang</span>
          <span>{mestredeDeler} / {totalDeler} deler</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${ferdighetsprosent}%` }}
          ></div>
        </div>
      </div>

      {/* Bil-visualisering */}
      <div className="relative bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl px-2 py-1">
        <div className="relative h-64 mx-auto max-w-md">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* Bakgrunn bil-skisse */}
            <g stroke="#d1d5db" strokeWidth="2" fill="none" strokeDasharray="5,5">
              <rect x="20" y="40" width="160" height="50" rx="10" />
              <circle cx="50" cy="95" r="15" />
              <circle cx="150" cy="95" r="15" />
              <rect x="30" y="20" width="80" height="40" rx="5" />
              <rect x="120" y="25" width="50" height="35" rx="5" />
            </g>

            {/* Bil-deler (fylt inn basert på progresjon) */}
            {bilDeler.map((del) => (
              <g key={del.id}>
                <rect
                  x={del.posisjon.x}
                  y={del.posisjon.y}
                  width={del.posisjon.width}
                  height={del.posisjon.height}
                  rx="5"
                  fill={del.mestret ? del.farge : '#f3f4f6'}
                  stroke={del.mestret ? 'none' : '#d1d5db'}
                  strokeWidth="2"
                  strokeDasharray={del.mestret ? 'none' : '3,3'}
                  className="transition-all duration-500"
                />
                
                {/* Ikon for mestret del */}
                {del.mestret && (
                  <g>
                    <circle 
                      cx={del.posisjon.x + del.posisjon.width - 8} 
                      cy={del.posisjon.y + 8} 
                      r="6" 
                      fill="white" 
                    />
                    <text 
                      x={del.posisjon.x + del.posisjon.width - 8} 
                      y={del.posisjon.y + 12} 
                      textAnchor="middle" 
                      fontSize="8" 
                      fill="#16a34a"
                    >
                      ✓
                    </text>
                  </g>
                )}

                {/* Låse-ikon for ikke-mestrede deler */}
                {!del.mestret && (
                  <g>
                    <circle 
                      cx={del.posisjon.x + del.posisjon.width/2} 
                      cy={del.posisjon.y + del.posisjon.height/2} 
                      r="8" 
                      fill="#6b7280" 
                      opacity="0.8"
                    />
                    <text 
                      x={del.posisjon.x + del.posisjon.width/2} 
                      y={del.posisjon.y + del.posisjon.height/2 + 3} 
                      textAnchor="middle" 
                      fontSize="8" 
                      fill="white"
                    >
                      🔒
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Bil-status badge */}
        <div className="absolute topx-2 py-1 right-4">
          {ferdighetsprosent === 100 ? (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              <FaStar className="w-3 h-3" />
              <span>Ferdig!</span>
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {ferdighetsprosent}% ferdig
            </div>
          )}
        </div>
      </div>

      {/* Bildel-liste */}
      <div className="space-y-8">
        <h3 className="font-bold text-gray-900">Bildeler og fremgang</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
          {bilDeler.map((del) => (
            <div 
              key={del.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                del.mestret 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div 
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  del.mestret ? 'text-white' : 'bg-gray-200 text-gray-400'
                }`}
                style={{ backgroundColor: del.mestret ? del.farge : undefined }}
              >
                {del.mestret ? (
                  <FaCheck className="w-4 h-4" />
                ) : (
                  <FaLock className="w-4 h-4" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${del.mestret ? 'text-green-900' : 'text-gray-700'}`}>
                  {del.navn}
                </h4>
                <p className={`text-sm ${del.mestret ? 'text-green-700' : 'text-gray-500'}`}>
                  {del.mestret ? `Mestret via ${del.kategoriNavn}` : `Lås opp via ${del.kategoriNavn}`}
                </p>
              </div>

              {del.mestret && (
                <div className="text-green-600">
                  <FaStar className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Motiverende melding */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg px-2 py-1 text-center">
        {ferdighetsprosent === 100 ? (
          <div className="space-y-6">
            <FaCar className="w-8 h-8 text-green-600 mx-auto" />
            <h3 className="font-bold text-green-900">Gratulerer! 🎉</h3>
            <p className="text-green-700">
              Du har bygget din {klasse.navn} bil ferdig! Du har mestret alle kategorier.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-indigo-900">
              {mestredeDeler === 0 
                ? 'Begynn å bygge bilen din!' 
                : `Flott fremgang! ${totalDeler - mestredeDeler} deler igjen.`
              }
            </h3>
            <p className="text-indigo-700 text-sm">
              {mestredeDeler === 0
                ? 'Velg en kategori og start å lære for å låse opp din første bildel.'
                : 'Fortsett å mestre kategorier for å fullføre bilen din.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BilBuilder; 