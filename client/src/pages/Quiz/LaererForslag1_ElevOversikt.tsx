import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  ChatBubbleLeftRightIcon as ChatSolid
} from '@heroicons/react/24/solid';

interface Elev {
  id: string;
  navn: string;
  email: string;
  klasse: string;
  totalQuizer: number;
  fullforteQuizer: number;
  gjennomsnittScore: number;
  sisteAktivitet: string;
  streak: number;
  trengerHjelp: boolean;
  hjelpeMelding?: string;
  status: 'aktiv' | 'treg' | 'problemer';
  level: number;
  xp: number;
}

interface HjelpeForesporsel {
  id: string;
  elevNavn: string;
  kategori: string;
  sporsmal: string;
  melding: string;
  tidspunkt: string;
  prioritet: 'høy' | 'medium' | 'lav';
  status: 'ny' | 'under_behandling' | 'løst';
}

export default function LaererForslag1_ElevOversikt() {
  const [elever, setElever] = useState<Elev[]>([
    {
      id: '1',
      navn: 'Emma Andersen',
      email: 'emma.andersen@skole.no',
      klasse: '3A',
      totalQuizer: 25,
      fullforteQuizer: 23,
      gjennomsnittScore: 87,
      sisteAktivitet: '2 timer siden',
      streak: 7,
      trengerHjelp: false,
      status: 'aktiv',
      level: 8,
      xp: 2340
    },
    {
      id: '2',
      navn: 'Noah Hansen',
      email: 'noah.hansen@skole.no',
      klasse: '3A',
      totalQuizer: 25,
      fullforteQuizer: 18,
      gjennomsnittScore: 65,
      sisteAktivitet: '1 dag siden',
      streak: 2,
      trengerHjelp: true,
      hjelpeMelding: 'Forstår ikke trafikklyssignaler',
      status: 'problemer',
      level: 5,
      xp: 1240
    },
    {
      id: '3',
      navn: 'Sophia Berg',
      email: 'sophia.berg@skole.no',
      klasse: '3A',
      totalQuizer: 25,
      fullforteQuizer: 20,
      gjennomsnittScore: 78,
      sisteAktivitet: '5 timer siden',
      streak: 4,
      trengerHjelp: false,
      status: 'aktiv',
      level: 6,
      xp: 1680
    },
    {
      id: '4',
      navn: 'William Olsen',
      email: 'william.olsen@skole.no',
      klasse: '3A',
      totalQuizer: 25,
      fullforteQuizer: 12,
      gjennomsnittScore: 45,
      sisteAktivitet: '3 dager siden',
      streak: 0,
      trengerHjelp: true,
      hjelpeMelding: 'Sliter med alle kategorier',
      status: 'problemer',
      level: 3,
      xp: 680
    }
  ]);

  const [hjelpeForesporelser, setHjelpeForesporelser] = useState<HjelpeForesporsel[]>([
    {
      id: '1',
      elevNavn: 'Noah Hansen',
      kategori: 'Trafikkregler',
      sporsmal: 'Hva betyr rødt lys?',
      melding: 'Jeg forstår ikke forskjellen på rødt lys og rødt blinkende lys.',
      tidspunkt: '10 min siden',
      prioritet: 'høy',
      status: 'ny'
    },
    {
      id: '2',
      elevNavn: 'William Olsen',
      kategori: 'Sikkerhet',
      sporsmal: 'Sikkerhetsutstyr på bil',
      melding: 'Hvilken sikkerhetsutstyr er påkrevd vs anbefalt?',
      tidspunkt: '1 time siden',
      prioritet: 'medium',
      status: 'ny'
    }
  ]);

  const [aktivTab, setAktivTab] = useState<'oversikt' | 'hjelp' | 'progresjon'>('oversikt');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'text-green-600 bg-green-50 border-green-200';
      case 'treg': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'problemer': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPrioritetColor = (prioritet: string) => {
    switch (prioritet) {
      case 'høy': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'lav': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const klasseStats = {
    totalElever: elever.length,
    aktivElever: elever.filter(e => e.status === 'aktiv').length,
    trengerHjelp: elever.filter(e => e.trengerHjelp).length,
    gjennomsnittScore: Math.round(elever.reduce((sum, e) => sum + e.gjennomsnittScore, 0) / elever.length),
    fullforingsgrad: Math.round(elever.reduce((sum, e) => sum + (e.fullforteQuizer / e.totalQuizer * 100), 0) / elever.length)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/quiz" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz - Lærer Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Følg med på elevenes progresjon og gi hjelp når det trengs</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full">
            <AcademicCapIcon className="w-5 h-5" />
            <span className="font-semibold">Klasse 3A</span>
          </div>
        </div>

        {/* Klasse Statistikk */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Elever</p>
                <p className="text-2xl font-bold text-blue-600">{klasseStats.totalElever}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Elever</p>
                <p className="text-2xl font-bold text-green-600">{klasseStats.aktivElever}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trenger Hjelp</p>
                <p className="text-2xl font-bold text-red-600">{klasseStats.trengerHjelp}</p>
              </div>
              <HandRaisedIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gj.snitt Score</p>
                <p className="text-2xl font-bold text-purple-600">{klasseStats.gjennomsnittScore}%</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fullføringsgrad</p>
                <p className="text-2xl font-bold text-indigo-600">{klasseStats.fullforingsgrad}%</p>
              </div>
              <TrophySolid className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-6 border border-white/20">
          <div className="flex space-x-0">
            {[
              { id: 'oversikt', navn: 'Elev Oversikt', ikon: UserGroupIcon },
              { id: 'hjelp', navn: 'Hjelpeforespørsler', ikon: ChatBubbleLeftRightIcon },
              { id: 'progresjon', navn: 'Progresjon', ikon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAktivTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all ${
                  aktivTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.ikon className="w-5 h-5" />
                <span className="font-medium">{tab.navn}</span>
                {tab.id === 'hjelp' && hjelpeForesporelser.filter(h => h.status === 'ny').length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {hjelpeForesporelser.filter(h => h.status === 'ny').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {aktivTab === 'oversikt' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Elev Oversikt</h2>
              <div className="space-y-4">
                {elever.map((elev) => (
                  <div key={elev.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {elev.navn.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{elev.navn}</h3>
                          <p className="text-sm text-gray-600">{elev.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Progresjon</p>
                          <p className="font-semibold">{elev.fullforteQuizer}/{elev.totalQuizer}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-semibold">{elev.gjennomsnittScore}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Level</p>
                          <p className="font-semibold">Level {elev.level}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Sist aktiv</p>
                          <p className="font-semibold text-sm">{elev.sisteAktivitet}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(elev.status)}`}>
                            {elev.status === 'aktiv' ? 'Aktiv' : elev.status === 'treg' ? 'Treg' : 'Problemer'}
                          </span>
                          {elev.trengerHjelp && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                              Trenger hjelp
                            </span>
                          )}
                        </div>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <EyeIcon className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    {elev.trengerHjelp && elev.hjelpeMelding && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Hjelp trengs:</strong> {elev.hjelpeMelding}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aktivTab === 'hjelp' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Hjelpeforespørsler</h2>
              <div className="space-y-4">
                {hjelpeForesporelser.map((forespørsel) => (
                  <div key={forespørsel.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-800">{forespørsel.elevNavn}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPrioritetColor(forespørsel.prioritet)}`}>
                            {forespørsel.prioritet} prioritet
                          </span>
                          <span className="text-sm text-gray-500">{forespørsel.tidspunkt}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Kategori:</strong> {forespørsel.kategori}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Spørsmål:</strong> {forespørsel.sporsmal}
                        </p>
                        <p className="text-gray-700">{forespørsel.melding}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                          Svar
                        </button>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                          Løst
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {aktivTab === 'progresjon' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Klasse Progresjon</h2>
              <div className="space-y-4">
                {elever.map((elev) => (
                  <div key={elev.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{elev.navn}</p>
                      <p className="text-sm text-gray-600">{elev.fullforteQuizer}/{elev.totalQuizer} quizer</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(elev.fullforteQuizer / elev.totalQuizer) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {Math.round((elev.fullforteQuizer / elev.totalQuizer) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ytelse Oversikt</h2>
              <div className="space-y-4">
                {elever.map((elev) => (
                  <div key={elev.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{elev.navn}</p>
                      <p className="text-sm text-gray-600">Level {elev.level} • {elev.xp} XP</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{elev.gjennomsnittScore}%</p>
                      <p className="text-sm text-gray-600">{elev.streak} dagers streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 