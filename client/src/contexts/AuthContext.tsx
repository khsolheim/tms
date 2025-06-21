import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Rolle } from '../types/roller';
import api from '../lib/api';
import { setSentryUser, clearSentryUser, trackUserAction } from '../config/sentry';
import { log } from '../utils/logger';

interface Bruker {
  id: string;
  navn: string;
  epost: string;
  rolle: Rolle;
  tilganger: string[];
  bedrift?: {
    id: number;
    navn: string;
  } | null;
}

interface AuthContextType {
  bruker: Bruker | null;
  erInnlogget: boolean;
  loading: boolean;
  erImpersonert: boolean;
  loggInn: (epost: string, passord: string) => Promise<void>;
  loggUt: () => void;
  impersonateUser: (userId: number) => Promise<void>;
  stopImpersonate: () => Promise<void>;
  hentBrukerInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Dummy bruker som alltid er innlogget
const DUMMY_BRUKER: Bruker = {
  id: '1',
  navn: 'Demo Bruker',
  epost: 'demo@tms.no',
  rolle: 'ADMIN' as Rolle,
  tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
  bedrift: {
    id: 1,
    navn: 'Demo Bedrift AS'
  }
};

// Demo token for API-kall
const DUMMY_TOKEN = 'demo-token-123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bruker, setBruker] = useState<Bruker | null>(DUMMY_BRUKER);
  const [loading, setLoading] = useState(false); // Aldri loading siden vi alltid er innlogget
  const [erImpersonert, setErImpersonert] = useState(false);

  useEffect(() => {
    // Sett opp dummy bruker og token umiddelbart
    setBruker(DUMMY_BRUKER);
    setLoading(false);
    
    // Lagre dummy token i localStorage slik at API-kall fungerer
    localStorage.setItem('token', DUMMY_TOKEN);
    localStorage.setItem('bruker', JSON.stringify(DUMMY_BRUKER));
    
    // Oppdater Sentry med dummy brukerkontext
    setSentryUser({
      id: DUMMY_BRUKER.id,
      email: DUMMY_BRUKER.epost,
      navn: DUMMY_BRUKER.navn,
      rolle: DUMMY_BRUKER.rolle,
      bedriftId: DUMMY_BRUKER.bedrift?.id?.toString(),
      bedriftNavn: DUMMY_BRUKER.bedrift?.navn,
    });
    
    log.info('Demo modus aktivert - bruker automatisk innlogget med token', { navn: DUMMY_BRUKER.navn });
  }, []);

  const loggInn = async (epost: string, passord: string) => {
    // I demo modus, aksepter alle innlogginger
    setBruker(DUMMY_BRUKER);
    setErImpersonert(false);
    
    // Sett dummy token
    localStorage.setItem('token', DUMMY_TOKEN);
    localStorage.setItem('bruker', JSON.stringify(DUMMY_BRUKER));
    
    log.info('Demo innlogging', { epost });
  };

  const loggUt = () => {
    // I demo modus, gå tilbake til demo bruker i stedet for å logge ut
    setBruker(DUMMY_BRUKER);
    setErImpersonert(false);
    
    // Sett dummy token tilbake
    localStorage.setItem('token', DUMMY_TOKEN);
    localStorage.setItem('bruker', JSON.stringify(DUMMY_BRUKER));
    
    log.info('Demo utlogging - tilbake til demo bruker');
  };

  const impersonateUser = async (userId: number) => {
    // Demo implementasjon
    log.info('Demo impersonation', { userId });
  };

  const stopImpersonate = async () => {
    // Demo implementasjon
    setErImpersonert(false);
    log.info('Demo stopp impersonation');
  };

  const hentBrukerInfo = async () => {
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        bruker,
        erInnlogget: true, // Alltid innlogget i demo modus
        loading,
        erImpersonert,
        loggInn,
        loggUt,
        impersonateUser,
        stopImpersonate,
        hentBrukerInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth må brukes innenfor en AuthProvider');
  }
  return context;
} 