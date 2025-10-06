import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Rolle } from '../types/roller';
import api from '../lib/api';
import { setSentryUser, clearSentryUser, trackUserAction } from '../config/sentry';
import { log } from '../utils/logger';
import { secureStorage } from '../utils/secureStorage';

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

// Dummy bruker for fallback (kun development)
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

// Demo token for API-kall (kun development)
const DUMMY_TOKEN = 'demo-token-123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bruker, setBruker] = useState<Bruker | null>(null);
  const [loading, setLoading] = useState(true);
  const [erImpersonert, setErImpersonert] = useState(false);
  
  // Demo mode only in development
  const [demoModus, setDemoModus] = useState(
    process.env.NODE_ENV === 'development' // Aktivert som standard i development
  );

  useEffect(() => {
    // Only activate demo mode in development
    if (process.env.NODE_ENV === 'development') {
      aktiverDemoModus();
    } else {
      // In production, check for existing token
      sjekkEksisterendeToken();
    }
  }, []);

  const sjekkEksisterendeToken = async () => {
    try {
      const token = secureStorage.getItem('token');
      if (token) {
        // Verify token with server
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/verify-token');
        if (response.data.bruker) {
          setBruker(response.data.bruker);
          setSentryUser({
            id: response.data.bruker.id,
            email: response.data.bruker.epost,
            navn: response.data.bruker.navn,
            rolle: response.data.bruker.rolle,
            bedriftId: response.data.bruker.bedrift?.id?.toString(),
            bedriftNavn: response.data.bruker.bedrift?.navn,
          });
        }
      }
    } catch (error) {
      // Invalid token, remove it
      secureStorage.removeItem('token');
      secureStorage.removeItem('bruker');
      delete api.defaults.headers.common['Authorization'];
      log.warn('Invalid token removed');
    } finally {
      setLoading(false);
    }
  };

  const aktiverDemoModus = () => {
    if (process.env.NODE_ENV !== 'development') {
      log.error('Demo mode attempted in production - blocked');
      return;
    }
    
    setDemoModus(true);
    setBruker(DUMMY_BRUKER);
    setLoading(false);
    
    // Lagre dummy token med sikker storage OG localStorage for API wrapper
    secureStorage.setItem('token', DUMMY_TOKEN);
    localStorage.setItem('token', DUMMY_TOKEN); // For API wrapper
    secureStorage.setObject('bruker', DUMMY_BRUKER);
    
    // Oppdater Sentry
    setSentryUser({
      id: DUMMY_BRUKER.id,
      email: DUMMY_BRUKER.epost,
      navn: DUMMY_BRUKER.navn,
      rolle: DUMMY_BRUKER.rolle,
      bedriftId: DUMMY_BRUKER.bedrift?.id?.toString(),
      bedriftNavn: DUMMY_BRUKER.bedrift?.navn,
    });
    
    log.info('Demo modus aktivert (kun development)', { navn: DUMMY_BRUKER.navn });
  };

  const loggInn = async (epost: string, passord: string) => {
    setLoading(true);
    
    try {
      if (demoModus && process.env.NODE_ENV === 'development') {
        // Demo mode login - kun i development
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        
        // Sikker lagring
        secureStorage.setItem('token', DUMMY_TOKEN);
        secureStorage.setObject('bruker', brukerData);
        
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
      } else {
        // In production, perform actual login
        const response = await api.post('/auth/login', { epost, passord });
        if (response.data.token) {
          setBruker(response.data.bruker);
          setSentryUser({
            id: response.data.bruker.id,
            email: response.data.bruker.epost,
            navn: response.data.bruker.navn,
            rolle: response.data.bruker.rolle,
            bedriftId: response.data.bruker.bedrift?.id?.toString(),
            bedriftNavn: response.data.bruker.bedrift?.navn,
          });
          
          // Sikker lagring
          secureStorage.setItem('token', response.data.token);
          secureStorage.setObject('bruker', response.data.bruker);
          
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          log.info('Innlogging vellykket', { epost, navn: response.data.bruker.navn });
        } else {
          throw new Error('Innlogging feilet');
        }
      }
    } catch (error) {
      log.error('Innlogging feilet', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loggUt = () => {
    setBruker(null);
    setDemoModus(false);
    setErImpersonert(false);
    
    // Rydde opp sikker storage
    secureStorage.removeItem('token');
    secureStorage.removeItem('bruker');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Rydde opp Sentry
    clearSentryUser();
    
    log.info('Utlogget');
  };

  const impersonateUser = async (userId: number) => {
    try {
      // Implementer impersonering hvis nødvendig
      log.info('Impersonering startet', { userId });
      setErImpersonert(true);
    } catch (error) {
      log.error('Impersonering feilet', error);
    }
  };

  const stopImpersonate = async () => {
    setErImpersonert(false);
    log.info('Impersonering stoppet');
  };

  const hentBrukerInfo = async () => {
    try {
      const token = secureStorage.getItem('token');
      if (!token) return; // Only fetch if token exists
      
      if (demoModus && process.env.NODE_ENV === 'development') {
        // I demo-modus, ikke gjør ekte API-kall
        log.info('Demo-modus aktivt, bruker eksisterende brukerdata');
        return;
      }
      
      const response = await api.get('/auth/me');
      if (response.data.bruker) {
        setBruker(response.data.bruker);
        
        // Oppdater sikker storage
        secureStorage.setObject('bruker', response.data.bruker);
        
        // Oppdater Sentry
        setSentryUser({
          id: response.data.bruker.id,
          email: response.data.bruker.epost,
          navn: response.data.bruker.navn,
          rolle: response.data.bruker.rolle,
          bedriftId: response.data.bruker.bedrift?.id?.toString(),
          bedriftNavn: response.data.bruker.bedrift?.navn,
        });
      }
    } catch (error: any) {
      log.error('Kunne ikke hente brukerinfo', error);
      // If token is invalid, log out
      if (error.response?.status === 401) {
        loggUt();
      }
    }
  };

  const value: AuthContextType = {
    bruker,
    erInnlogget: !!bruker,
    loading,
    erImpersonert,
    demoModus,
    loggInn,
    loggUt,
    impersonateUser,
    stopImpersonate,
    hentBrukerInfo,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth må brukes innenfor AuthProvider');
  }
  return context;
} 