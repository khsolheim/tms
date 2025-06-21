import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: Theme;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  activeModal: string | null;
  modalData: any;
  
  // Search
  globalSearchOpen: boolean;
  globalSearchQuery: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  
  setGlobalSearch: (open: boolean, query?: string) => void;
  
  // Bulk operations
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'light',
      globalLoading: false,
      loadingMessage: null,
      notifications: [],
      activeModal: null,
      modalData: null,
      globalSearchOpen: false,
      globalSearchQuery: '',

      // Sidebar actions
      toggleSidebar: () => {
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'ui/toggleSidebar'
        );
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open }, false, 'ui/setSidebarOpen');
      },

      toggleSidebarCollapsed: () => {
        set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          'ui/toggleSidebarCollapsed'
        );
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed');
      },

      // Theme actions
      setTheme: (theme: Theme) => {
        set({ theme }, false, 'ui/setTheme');
        
        // Update document class for theme
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Loading actions
      setGlobalLoading: (loading: boolean, message?: string) => {
        set(
          {
            globalLoading: loading,
            loadingMessage: loading ? message || null : null,
          },
          false,
          'ui/setGlobalLoading'
        );
      },

      // Notification actions
      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
          id,
          duration: 5000, // Default 5 seconds
          ...notification,
        };

        set(
          (state) => ({
            notifications: [...state.notifications, newNotification],
          }),
          false,
          'ui/addNotification'
        );

        // Auto-remove after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'ui/removeNotification'
        );
      },

      clearNotifications: () => {
        set({ notifications: [] }, false, 'ui/clearNotifications');
      },

      // Modal actions
      openModal: (modalId: string, data?: any) => {
        set(
          {
            activeModal: modalId,
            modalData: data,
          },
          false,
          'ui/openModal'
        );
      },

      closeModal: () => {
        set(
          {
            activeModal: null,
            modalData: null,
          },
          false,
          'ui/closeModal'
        );
      },

      // Search actions
      setGlobalSearch: (open: boolean, query?: string) => {
        set(
          {
            globalSearchOpen: open,
            globalSearchQuery: query || '',
          },
          false,
          'ui/setGlobalSearch'
        );
      },

      // Reset
      resetUI: () => {
        set(
          {
            sidebarOpen: true,
            sidebarCollapsed: false,
            globalLoading: false,
            loadingMessage: null,
            notifications: [],
            activeModal: null,
            modalData: null,
            globalSearchOpen: false,
            globalSearchQuery: '',
          },
          false,
          'ui/resetUI'
        );
      },
    }),
    { name: 'UIStore' }
  )
); 