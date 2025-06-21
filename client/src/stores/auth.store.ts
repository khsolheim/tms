import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: number;
  navn: string;
  epost: string;
  rolle: 'ADMIN' | 'HOVEDBRUKER' | 'TRAFIKKLARER';
  tilganger: string[];
  bedrift: {
    id: number;
    navn: string;
    orgNummer: string;
  } | null;
  bedriftId: number | null;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  isAdmin: () => boolean;
  isHovedbruker: () => boolean;
  hasAccess: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        login: (token: string, user: User) => {
          set(
            {
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
            },
            false,
            'auth/login'
          );
        },

        logout: () => {
          set(
            {
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            },
            false,
            'auth/logout'
          );
        },

        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set(
              {
                user: { ...currentUser, ...userData },
              },
              false,
              'auth/updateUser'
            );
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'auth/setLoading');
        },

        // Computed values
        isAdmin: () => {
          const user = get().user;
          return user?.rolle === 'ADMIN';
        },

        isHovedbruker: () => {
          const user = get().user;
          return user?.rolle === 'HOVEDBRUKER' || user?.rolle === 'ADMIN';
        },

        hasAccess: (permission: string) => {
          const user = get().user;
          if (!user) return false;
          
          // Admin har alltid tilgang
          if (user.rolle === 'ADMIN') return true;
          
          // Sjekk specific tilganger
          return user.tilganger.includes(permission);
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
); 