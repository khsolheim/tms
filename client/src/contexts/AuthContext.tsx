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
  demoModus: boolean;
  loggInn: (epost: string, passord: string) => Promise<void>;
  loggUt: () => void;
  impersonateUser: (userId: number) => Promise<void>;
  stopImpersonate: () => Promise<void>;
  hentBrukerInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Dummy bruker for fallback
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
  const [bruker, setBruker] = useState<Bruker | null>(null);
  const [loading, setLoading] = useState(true);
  const [erImpersonert, setErImpersonert] = useState(false);
  const [demoModus, setDemoModus] = useState(true);

  useEffect(() => {
    // Gå direkte til demo-modus uten å sjekke server
    aktiverDemoModus();
  }, []);

  const aktiverDemoModus = () => {
    setDemoModus(true);
    setBruker(DUMMY_BRUKER);
    setLoading(false);
    
    // Lagre dummy token
    localStorage.setItem('token', DUMMY_TOKEN);
    localStorage.setItem('bruker', JSON.stringify(DUMMY_BRUKER));
    
    // Oppdater Sentry
    setSentryUser({
      id: DUMMY_BRUKER.id,
      email: DUMMY_BRUKER.epost,
      navn: DUMMY_BRUKER.navn,
      rolle: DUMMY_BRUKER.rolle,
      bedriftId: DUMMY_BRUKER.bedrift?.id?.toString(),
      bedriftNavn: DUMMY_BRUKER.bedrift?.navn,
    });
    
    log.info('Demo modus aktivert', { navn: DUMMY_BRUKER.navn });
  };

  const loggInn = async (epost: string, passord: string) => {
    // I demo-modus, bare acceptér alle innloggingsforsøk
    setLoading(true);
    
    try {
      // Simuler en kort loading-periode
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Opprett en bruker basert på e-post
      const brukerData: Bruker = {
        id: '2',
        navn: epost === 'admin@test.no' ? 'Admin Bruker' : 'Demo Bruker',
        epost,
        rolle: 'ADMIN' as Rolle,
        tilganger: ['READ_ALL', 'WRITE_ALL', 'ADMIN'],
        bedrift: {
          id: 1,
          navn: 'Demo Bedrift AS'
        }
      };
      
      setBruker(brukerData);
      setDemoModus(true);
      setErImpersonert(false);
      
      localStorage.setItem('token', DUMMY_TOKEN);
      localStorage.setItem('bruker', JSON.stringify(brukerData));
      
      // Oppdater Sentry
      setSentryUser({
        id: brukerData.id,
        email: brukerData.epost,
        navn: brukerData.navn,
        rolle: brukerData.rolle,
        bedriftId: brukerData.bedrift?.id?.toString(),
        bedriftNavn: brukerData.bedrift?.navn,
      });
      
      log.info('Demo innlogging vellykket', { epost, navn: brukerData.navn });
    } catch (error) {
      log.error('Demo innlogging feilet', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loggUt = () => {
    setBruker(null);
    setDemoModus(false);
    setErImpersonert(false);
    
    // Fjern lagrede data
    localStorage.removeItem('token');
    localStorage.removeItem('bruker');
    
    // Ryd Sentry
    clearSentryUser();
    
    // Gå tilbake til demo-modus
    setTimeout(aktiverDemoModus, 100);
    
    log.info('Utlogget');
  };

  const impersonateUser = async (userId: number) => {
    try {
      // TODO: Implementer ekte impersonation
      log.info('Impersonation forsøkt', { userId });
    } catch (error) {
      log.error('Impersonation feilet', error);
    }
  };

  const stopImpersonate = async () => {
    setErImpersonert(false);
    log.info('Stopp impersonation');
  };

  const hentBrukerInfo = async () => {
    // I demo-modus, ikke gjør API-kall
    if (demoModus) {
      log.info('Demo-modus: Hopper over brukerinfo-henting');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token || token === DUMMY_TOKEN) return;
      
      // I demo-modus, ikke gjør ekte API-kall
      log.info('Demo-modus aktivt, bruker eksisterende brukerdata');
    } catch (error) {
      log.error('Feil ved henting av brukerinfo', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        bruker,
        erInnlogget: !!bruker,
        loading,
        erImpersonert,
        demoModus,
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