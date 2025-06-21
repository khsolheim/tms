import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeFonts: boolean;
  focusIndicators: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (selector: string) => void;
  skipToContent: () => void;
  isKeyboardUser: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Standardinnstillinger
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeFonts: false,
    focusIndicators: true,
    screenReaderMode: false,
    keyboardNavigation: true,
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Oppdater innstilling
  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Lagre i localStorage
    localStorage.setItem(`accessibility_${key}`, value.toString());
    
    // Announce change for screen readers
    announceMessage(`${key} er nå ${value ? 'aktivert' : 'deaktivert'}`, 'polite');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Announce message til screen readers
  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('accessibility-announcer');
    if (announcer) {
      announcer.textContent = '';
      announcer.setAttribute('aria-live', priority);
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  }, []);

  // Fokuser element med selector
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: settings.reducedMotion ? 'auto' : 'smooth' });
    }
  }, [settings.reducedMotion]);

  // Skip til hovedinnhold
  const skipToContent = useCallback(() => {
    focusElement('#main-content');
  }, [focusElement]);

  // Detekter tastaturbruk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Last inn innstillinger fra localStorage  
  useEffect(() => {
    const savedSettings: Partial<AccessibilitySettings> = {};
    
    Object.keys(settings).forEach(key => {
      const saved = localStorage.getItem(`accessibility_${key}`);
      if (saved !== null) {
        savedSettings[key as keyof AccessibilitySettings] = saved === 'true';
      }
    });

    setSettings(prev => ({ ...prev, ...savedSettings }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sjekk system preferanser
  useEffect(() => {
    // Reduced motion preferanse
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !localStorage.getItem('accessibility_reducedMotion')) {
      updateSetting('reducedMotion', true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !localStorage.getItem('accessibility_reducedMotion')) {
        updateSetting('reducedMotion', true);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [updateSetting]);

  // Oppdater CSS-variabler basert på innstillinger
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large fonts
    if (settings.largeFonts) {
      root.style.fontSize = '1.2em';
    } else {
      root.style.fontSize = '';
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Focus indicators
    if (!settings.focusIndicators) {
      root.classList.add('no-focus-indicators');
    } else {
      root.classList.remove('no-focus-indicators');
    }

    // Keyboard navigation
    if (isKeyboardUser && settings.keyboardNavigation) {
      root.classList.add('keyboard-user');
    } else {
      root.classList.remove('keyboard-user');
    }

  }, [settings, isKeyboardUser]);

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    announceMessage,
    focusElement,
    skipToContent,
    isKeyboardUser,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Skjult announcer for screen readers */}
      <div
        id="accessibility-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility må brukes innenfor AccessibilityProvider');
  }
  return context;
};

// ============================================================================
// ACCESSIBILITY TOOLBAR COMPONENT
// ============================================================================

export const AccessibilityToolbar: React.FC = () => {
  const { settings, updateSetting, isKeyboardUser } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  if (!isKeyboardUser) return null;

  return (
    <div className="fixed topx-2 py-1 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-2 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Åpne tilgjengelighetsverktøy"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 px-2 py-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tilgjengelighetsinnstillinger</h3>
          
          <div className="space-y-8">
            {Object.entries(settings).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting(key as keyof AccessibilitySettings, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {getSettingLabel(key as keyof AccessibilitySettings)}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Lukk
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSettingLabel = (key: keyof AccessibilitySettings): string => {
  const labels: Record<keyof AccessibilitySettings, string> = {
    reducedMotion: 'Redusert animasjon',
    highContrast: 'Høy kontrast',
    largeFonts: 'Store fonter',
    focusIndicators: 'Fokusindikatorer',
    screenReaderMode: 'Skjermlesermodus',
    keyboardNavigation: 'Tastaturnavigasjon',
  };
  
  return labels[key];
};

// ============================================================================
// GLOBAL STYLES FOR ACCESSIBILITY
// ============================================================================

export const injectAccessibilityStyles = () => {
  const styles = `
    /* High contrast mode */
    .high-contrast {
      --bg-primary: #000000;
      --bg-secondary: #ffffff;
      --text-primary: #ffffff;
      --text-secondary: #000000;
      --border-color: #ffffff;
      --focus-color: #ffff00;
    }

    .high-contrast * {
      background-color: var(--bg-primary) !important;
      color: var(--text-primary) !important;
      border-color: var(--border-color) !important;
    }

    .high-contrast button,
    .high-contrast input,
    .high-contrast select,
    .high-contrast textarea {
      background-color: var(--bg-secondary) !important;
      color: var(--text-secondary) !important;
    }

    /* No focus indicators */
    .no-focus-indicators *:focus {
      outline: none !important;
      box-shadow: none !important;
    }

    /* Keyboard user enhanced focus */
    .keyboard-user *:focus {
      outline: 3px solid #4F46E5 !important;
      outline-offset: 2px !important;
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Screen reader only content */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .sr-only:focus,
    .focus\\:not-sr-only:focus {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}; 