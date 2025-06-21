import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaChevronRight, FaTrophy, FaBullseye, FaClock, FaPlay, FaAward, FaCalendarDay, FaFire, FaBrain, FaHistory } from 'react-icons/fa';
import BilBuilder from '../../../components/sikkerhetskontroll/BilBuilder';

interface SikkerhetskontrollKlasse {
  id: number;
  navn: string;
  beskrivelse: string;
  ikonUrl?: string;
  kategorier: {
    id: number;
    navn: string;
    beskrivelse?: string;
    ikonUrl?: string;
    farge?: string;
    _count: {
      sporsmal: number;
    };
  }[];
}

interface MinDagData {
  dagensRepetisjon?: {
    kategori: string;
    antallSporsmal: number;
    sistOvd: string;
  };
  sisteAchievement?: {
    navn: string;
    oppnaddDato: string;
    ikonUrl?: string;
  };
  totalProgresjon: number;
  ovetidIDag: number;
  streak: number;
}

const SikkerhetskontrollLaering: React.FC = () => {
  const [klasser, setKlasser] = useState<SikkerhetskontrollKlasse[]>([]);
  const [minDagData, setMinDagData] = useState<MinDagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKlasser();
    fetchMinDagData();
  }, []);

  const fetchKlasser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Found' : 'Not found');
      
      const response = await fetch('/api/sikkerhetskontroll-laering/klasser', {
        headers: {
          'Authorization': `Bearer ${token || 'demo-token-123'}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Kunne ikke hente klasser (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setKlasser(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  const fetchMinDagData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sikkerhetskontroll-laering/min-dag', {
        headers: {
          'Authorization': `Bearer ${token || 'demo-token-123'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMinDagData(data);
      } else {
        // Fallback data hvis API ikke er tilgjengelig
        setMinDagData({
          totalProgresjon: 0,
          ovetidIDag: 0,
          streak: 0
        });
      }
    } catch (err) {
      console.warn('Kunne ikke hente Min Dag data:', err);
      // Fallback data
      setMinDagData({
        totalProgresjon: 0,
        ovetidIDag: 0,
        streak: 0
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
        <p className="text-red-800">Feil: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div className="text-center cards-spacing-vertical">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FaCar className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Sikkerhetskontroll Læring
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Mestre sikkerhetskontroll steg for steg. Velg din førerkortklasse og 
          bygg din personlige bil mens du lærer!
        </p>
      </div>

      {/* Min Dag Dashboard - Dynamisk personlig oversikt */}
      {minDagData && (
        <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-xl px-2 py-1 border border-indigo-200">
          <div className="flex items-center space-x-3 mb-6">
            <FaCalendarDay className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Min Dag</h2>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('no-NO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid">
            {/* Dagens Repetisjon Widget */}
            <div className="bg-white rounded-lg px-2 py-1 border border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaBrain className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900">Dagens Repetisjon</h3>
              </div>
              {minDagData.dagensRepetisjon ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>{minDagData.dagensRepetisjon.kategori}</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    {minDagData.dagensRepetisjon.antallSporsmal} spørsmål å repetere
                  </p>
                  <p className="text-xs text-orange-600">
                    Sist øvd: {minDagData.dagensRepetisjon.sistOvd}
                  </p>
                  <button onClick={() => console.log('Start repetisjon')} className="w-full mt-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded text-sm font-medium transition-colors">
                    Start repetisjon
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">Ingen repetisjon i dag</p>
                  <p className="text-xs text-green-600 mt-1">Du er oppdatert! 🎉</p>
                </div>
              )}
            </div>

            {/* Siste Achievement Widget */}
            <div className="bg-white rounded-lg px-2 py-1 border border-yellow-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaTrophy className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900">Siste Prestasjon</h3>
              </div>
              {minDagData.sisteAchievement ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {minDagData.sisteAchievement.navn}
                  </p>
                  <p className="text-xs text-gray-600">
                    Oppnådd: {minDagData.sisteAchievement.oppnaddDato}
                  </p>
                  <Link 
                    to="/sikkerhetskontroll-laering/achievements"
                    className="inline-block w-full mt-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-sm font-medium transition-colors text-center"
                  >
                    Se alle achievements
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">Ingen achievements ennå</p>
                  <p className="text-xs text-blue-600 mt-1">Start å lære for å låse opp! 🏆</p>
                </div>
              )}
            </div>

            {/* Progresjon Widget */}
            <div className="bg-white rounded-lg px-2 py-1 border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaBullseye className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Total Progresjon</h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(minDagData.totalProgresjon)}%
                  </p>
                  <p className="text-xs text-gray-600">av alle kategorier</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${minDagData.totalProgresjon}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Streak & Øvetid Widget */}
            <div className="bg-white rounded-lg px-2 py-1 border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaFire className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Streak & Tid</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Streak:</span>
                  <span className="font-bold text-green-600">{minDagData.streak} dager</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">I dag:</span>
                  <span className="font-bold text-blue-600">{minDagData.ovetidIDag} min</span>
                </div>
                {minDagData.streak > 0 && (
                  <p className="text-xs text-green-600 text-center mt-2">
                    Flott! Hold streaken gående! 🔥
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistikk Cards - Oppdatert med ekte data */}
      <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaBullseye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Din Progresjon</p>
              <p className="text-xl font-bold text-blue-900">
                {minDagData ? Math.round(minDagData.totalProgresjon) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-2 py-1 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <FaTrophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-700 font-medium">Achievements</p>
              <p className="text-xl font-bold text-yellow-900">
                {minDagData?.sisteAchievement ? '1+' : '0'} / 7
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 px-2 py-1 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <FaClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Øvetid i dag</p>
              <p className="text-xl font-bold text-green-900">
                {minDagData ? minDagData.ovetidIDag : 0} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Klasser Grid */}
      <div className="cards-spacing-vertical">
        <h2 className="text-2xl font-bold text-gray-900">Velg Førerkortklasse</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
          {klasser.map((klasse) => (
            <Link
              key={klasse.id}
              to={`/sikkerhetskontroll-laering/klasse/${klasse.id}`}
              className="group bg-white border border-gray-200 rounded-xl px-2 py-1 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 cards-spacing-vertical">
                  {/* Klasse Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FaCar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {klasse.navn}
                      </h3>
                      <p className="text-gray-600 text-sm">{klasse.beskrivelse}</p>
                    </div>
                  </div>

                  {/* Kategorier Preview */}
                  <div className="space-y-6">
                    <p className="text-sm font-medium text-gray-700">
                      {klasse.kategorier.length} kategorier:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {klasse.kategorier.slice(0, 3).map((kategori) => (
                        <span
                          key={kategori.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {kategori.navn}
                        </span>
                      ))}
                      {klasse.kategorier.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          +{klasse.kategorier.length - 3} til
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      {klasse.kategorier.reduce((sum, k) => sum + k._count.sporsmal, 0)} spørsmål totalt
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <FaPlay className="w-4 h-4 text-blue-600" />
                  </div>
                  <FaChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl px-2 py-1 border border-indigo-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rask Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
          <button onClick={() => console.log('Button clicked')} className="flex items-center space-x-3 px-2 py-1 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors text-left">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaHistory className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Fortsett der du slapp</p>
              <p className="text-sm text-gray-600">Gå til sist besøkte kategori</p>
            </div>
          </button>
          
          <Link
            to="/sikkerhetskontroll-laering/achievements"
            className="group relative bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-xl text-white hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🏆 Achievements</h3>
                <p className="text-yellow-100">Se dine prestasjoner og opplåste badges</p>
              </div>
              <FaAward className="w-8 h-8 text-yellow-200 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          <Link
            to="/sikkerhetskontroll-laering/leaderboard"
            className="group relative bg-gradient-to-r from-purple-400 to-purple-600 px-2 py-1 rounded-xl text-white hover:from-purple-500 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🥇 Leaderboard</h3>
                <p className="text-purple-100">Sammenlign deg med andre elever</p>
              </div>
              <FaTrophy className="w-8 h-8 text-purple-200 group-hover:scale-110 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Bil Builder Demo */}
      <div className="cards-spacing-vertical">
        <h3 className="text-xl font-bold text-gray-900">Din Bil-fremgang</h3>
        {klasser.length > 0 && (
          <BilBuilder 
            klasse={klasser[0]}
            kategorier={klasser[0].kategorier.map(k => ({ ...k, mestret: false }))}
            compact={true}
          />
        )}
      </div>

      {/* Min Bil Hub - Personlig bil-vedlikehold */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-2 py-1 border border-green-200">
        <div className="flex items-center space-x-3 mb-6">
          <FaCar className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Min Bil Hub</h2>
          <span className="text-sm text-gray-600">Praktisk bil-vedlikehold</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid">
          {/* Registreringsnummer & EU-kontroll */}
          <div className="bg-white rounded-lg px-2 py-1 border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarDay className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">EU-kontroll</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registreringsnummer
                </label>
                <input
                  type="text"
                  placeholder="AB12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-sm font-medium text-yellow-800">Neste EU-kontroll</span>
                </div>
                <p className="text-sm text-yellow-700">15. mars 2025</p>
                <p className="text-xs text-yellow-600 mt-1">Om 3 måneder</p>
              </div>
              
              <button onClick={() => console.log('Sjekk EU-kontroll')} className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                Sjekk via Statens Vegvesen
              </button>
            </div>
          </div>

          {/* Dekkskift Påminnelse */}
          <div className="bg-white rounded-lg px-2 py-1 border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaClock className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900">Dekkskift</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-orange-600">🛞</span>
                  <span className="text-sm font-medium text-orange-800">Sesong-påminnelse</span>
                </div>
                <p className="text-sm text-orange-700">Tid for vinterdekk!</p>
                <p className="text-xs text-orange-600 mt-1">Anbefalt: 1. oktober - 30. april</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Siste skift:</strong> 15. april 2024</p>
                <p><strong>Type:</strong> Sommerdekk</p>
              </div>
              
              <button onClick={() => console.log('Sett dekkskift-påminnelse')} className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                Sett påminnelse
              </button>
            </div>
          </div>

          {/* Service-logg */}
          <div className="bg-white rounded-lg px-2 py-1 border border-green-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaHistory className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">Service-logg</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="bg-gray-50 rounded px-2 py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Oljeskift</p>
                      <p className="text-xs text-gray-600">15. aug 2024</p>
                    </div>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded px-2 py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bremseskiver</p>
                      <p className="text-xs text-gray-600">3. mai 2024</p>
                    </div>
                    <span className="text-xs text-green-600">✓</span>
                  </div>
                </div>
              </div>
              
              <button onClick={() => console.log('Legg til service')} className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                + Legg til service
              </button>
            </div>
          </div>
        </div>

        {/* Partnertilbud (Kommersialisering) */}
        <div className="mt-6 bg-white rounded-lg px-2 py-1 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaTrophy className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Eksklusive Tilbud</h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Partner</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-2 py-1 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🛞</span>
                <div>
                  <h4 className="font-medium text-blue-900">Dekk-Express</h4>
                  <p className="text-xs text-blue-700">20% rabatt på vinterdekk</p>
                </div>
              </div>
              <button onClick={() => console.log('Vis tilbud')} className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                Se tilbud
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg px-2 py-1 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🔧</span>
                <div>
                  <h4 className="font-medium text-green-900">AutoService</h4>
                  <p className="text-xs text-green-700">Gratis EU-kontroll ved service</p>
                </div>
              </div>
              <button onClick={() => console.log('Vis tilbud')} className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                Book time
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg px-2 py-1 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h4 className="font-medium text-yellow-900">TryggForsikring</h4>
                  <p className="text-xs text-yellow-700">15% rabatt for TMS-elever</p>
                </div>
              </div>
              <button onClick={() => console.log('Vis tilbud')} className="w-full bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
                Få tilbud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SikkerhetskontrollLaering; 