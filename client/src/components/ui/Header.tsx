import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaQuestionCircle, FaCog, FaUserCircle, FaChevronDown, FaExclamationTriangle, FaUsers, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../contexts';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Alert } from './index';

interface Bruker {
  id: number;
  navn: string;
  epost: string;
  rolle: string;
  bedrift?: {
    id: number;
    navn: string;
  } | null;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [byttBrukerOpen, setByttBrukerOpen] = useState(false);
  const [alleBrukere, setAlleBrukere] = useState<Bruker[]>([]);
  const [brukerSok, setBrukerSok] = useState('');
  const [henterBrukere, setHenterBrukere] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const byttBrukerRef = useRef<HTMLDivElement>(null);
  const { loggUt, bruker, impersonateUser, stopImpersonate, erImpersonert } = useAuth();
  const navigate = useNavigate();

  // Lukk menyer ved klikk utenfor
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (byttBrukerRef.current && !byttBrukerRef.current.contains(e.target as Node)) {
        setByttBrukerOpen(false);
      }
    }
    if (menuOpen || byttBrukerOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, byttBrukerOpen]);

  // Hent alle brukere når bytt bruker menyen åpnes
  useEffect(() => {
    if (byttBrukerOpen && bruker?.rolle === 'ADMIN') {
      hentAlleBrukere();
    }
  }, [byttBrukerOpen, bruker?.rolle]);

  const hentAlleBrukere = async () => {
    try {
      setHenterBrukere(true);
      const response = await api.get('/brukere');
      setAlleBrukere(response.data);
    } catch (error) {
      console.error('Feil ved henting av brukere:', error);
    } finally {
      setHenterBrukere(false);
    }
  };

  const handleLoggUt = () => {
    loggUt();
    navigate('/logg-inn');
  };

  const handleByttBruker = async (targetUser: Bruker) => {
    try {
      await impersonateUser(targetUser.id);
      setByttBrukerOpen(false);
      setMenuOpen(false);
      setBrukerSok('');
      // Naviger til oversikt etter brukerbytte
      navigate('/oversikt');
    } catch (error) {
      console.error('Feil ved brukerbytte:', error);
      alert('Kunne ikke bytte bruker. Prøv igjen.');
    }
  };

  const handleStoppImpersonate = async () => {
    try {
      await stopImpersonate();
      setMenuOpen(false);
      navigate('/oversikt');
    } catch (error) {
      console.error('Feil ved tilbakekobling:', error);
      alert('Kunne ikke gå tilbake til admin konto. Prøv igjen.');
    }
  };

  const filteredBrukere = alleBrukere.filter(b => 
    (b.navn || '').toLowerCase().includes(brukerSok.toLowerCase()) ||
    (b.epost || '').toLowerCase().includes(brukerSok.toLowerCase()) ||
    (b.bedrift?.navn ? b.bedrift.navn.toLowerCase().includes(brukerSok.toLowerCase()) : false)
  );

  return (
    <>
      {erImpersonert && (
        <Alert type="warning" className="text-sm animate-fadein rounded-none">
          <FaExclamationTriangle className="text-yellow-600" />
          Impersonerer bruker: <span className="font-bold">{bruker?.navn}</span>
          <button
            className="ml-4 px-2 py-1 rounded bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-semibold border border-yellow-400"
            onClick={handleStoppImpersonate}
          >
            Gå tilbake til Admin
          </button>
        </Alert>
      )}
      <header className={`h-[60px] bg-[#003366] text-white flex items-center px-8 text-lg shadow-sm border-b border-[#223366] sticky top-0 z-10 min-h-[60px]`}>
        <div className="font-bold text-xl tracking-wide">TMS - Total Management System</div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-x-4 py-1">
          <FaBell className="text-xl hover:text-blue-300 cursor-pointer" />
          <FaQuestionCircle className="text-xl hover:text-blue-300 cursor-pointer" />
          <FaCog className="text-xl hover:text-blue-300 cursor-pointer" />
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-blue-700 px-2 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <FaUserCircle className="text-xl" />
              <span className="text-sm font-medium">{bruker?.navn || 'Bruker'}</span>
              <FaChevronDown className={`text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white text-[#003366] rounded shadow-lg z-50 min-w-[140px] border border-blue-100 animate-fadein text-sm">
                <div className="px-2 py-1 border-b border-blue-100">
                  <div className="font-semibold leading-tight text-[15px]">{bruker?.navn}</div>
                  <div className="text-xs text-blue-700 leading-tight">
                    {bruker?.rolle === 'ADMIN' ? 'Administrator' :
                     bruker?.rolle === 'HOVEDBRUKER' ? 'Hovedbruker' : 
                     bruker?.rolle === 'TRAFIKKLARER' ? 'Trafikklærer' : 'Bruker'}
                  </div>
                </div>
                <button className="w-full text-left px-2 py-1.5 hover:bg-blue-50" onClick={() => setMenuOpen(false)}>Min side</button>
                <button className="w-full text-left px-2 py-1.5 hover:bg-blue-50" onClick={handleLoggUt}>Logg ut</button>
                
                {bruker?.rolle === 'ADMIN' && !erImpersonert && (
                  <div className="border-t border-blue-100 mt-1">
                    <div className="px-2 py-1 text-xs text-blue-700 font-semibold">Admin funksjoner</div>
                    <div className="relative" ref={byttBrukerRef}>
                      <button
                        className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-blue-50"
                        onClick={() => setByttBrukerOpen(!byttBrukerOpen)}
                      >
                        <FaUsers className="text-blue-600" />
                        Bytt bruker
                      </button>
                      
                      {byttBrukerOpen && (
                        <div className="absolute right-0 top-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                          <div className="px-2 py-1 border-b border-gray-200">
                            <div className="font-semibold text-gray-900 mb-2">Velg bruker å impersonere</div>
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                              <input
                                type="text"
                                placeholder="Søk etter navn, e-post eller bedrift..."
                                value={brukerSok}
                                onChange={(e) => setBrukerSok(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto">
                            {henterBrukere ? (
                              <div className="px-2 py-1 text-center text-gray-500 text-xs">Laster brukere...</div>
                            ) : filteredBrukere.length > 0 ? (
                              filteredBrukere.map(targetUser => (
                                <button
                                  key={targetUser.id}
                                  onClick={() => handleByttBruker(targetUser)}
                                  className="w-full text-left px-2 py-1 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-xs text-gray-900">{targetUser.navn}</div>
                                  <div className="text-xs text-gray-600">{targetUser.epost}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                      targetUser.rolle === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                      targetUser.rolle === 'HOVEDBRUKER' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {targetUser.rolle === 'ADMIN' ? 'Admin' :
                                       targetUser.rolle === 'HOVEDBRUKER' ? 'Hovedbruker' : 'Trafikklærer'}
                                    </span>
                                    {targetUser.bedrift && (
                                      <span className="text-xs text-gray-500">{targetUser.bedrift.navn}</span>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-2 py-1 text-center text-gray-500 text-xs">
                                {brukerSok ? 'Ingen brukere funnet' : 'Laster...'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
} 