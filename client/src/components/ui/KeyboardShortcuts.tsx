import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  CommandLineIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  category?: string;
  disabled?: boolean;
  scope?: 'global' | 'modal' | 'page';
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  showHelp: () => void;
  hideHelp: () => void;
  isHelpVisible: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const pressedKeys = useRef<Set<string>>(new Set());

  // Common shortcuts that are always available
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      id: 'show-help',
      keys: ['?', 'shift+/'],
      description: 'Vis hurtigtaster',
      category: 'Generelt',
      action: () => setIsHelpVisible(true)
    },
    {
      id: 'hide-help',
      keys: ['escape'],
      description: 'Lukk hjelpedialog',
      category: 'Generelt',
      action: () => setIsHelpVisible(false),
      scope: 'modal'
    },
    {
      id: 'focus-search',
      keys: ['ctrl+k', 'cmd+k'],
      description: 'Fokuser på søkefelt',
      category: 'Navigasjon',
      action: () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    },
    {
      id: 'go-home',
      keys: ['g h'],
      description: 'Gå til hjem/oversikt',
      category: 'Navigasjon',
      action: () => {
        window.location.href = '/oversikt';
      }
    },
    {
      id: 'refresh-page',
      keys: ['r r'],
      description: 'Oppdater siden',
      category: 'Generelt',
      action: () => {
        window.location.reload();
      }
    }
  ];

  useEffect(() => {
    setShortcuts(prev => [...defaultShortcuts, ...prev]);
  }, []);

  const registerShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.id !== shortcut.id), shortcut]);
  };

  const unregisterShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  };

  const showHelp = () => setIsHelpVisible(true);
  const hideHelp = () => setIsHelpVisible(false);

  // Normalize key names
  const normalizeKey = (key: string): string => {
    const normalizedKey = key.toLowerCase();
    const keyMappings: { [key: string]: string } = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right',
      'meta': 'cmd'
    };
    return keyMappings[normalizedKey] || normalizedKey;
  };

  // Check if shortcut matches pressed keys
  const matchesShortcut = (shortcut: KeyboardShortcut, pressedKeys: Set<string>): boolean => {
    return shortcut.keys.some(keyCombo => {
      const keys = keyCombo.split(/[\s+]/).map(normalizeKey);
      
      // Check for modifier + key combinations (e.g., "ctrl+k")
      if (keys.length === 2 && keys[0].includes('ctrl') || keys[0].includes('cmd') || keys[0].includes('shift')) {
        const [modifier, key] = keys;
        return pressedKeys.has(modifier) && pressedKeys.has(key);
      }
      
      // Check for sequence combinations (e.g., "g h")
      if (keys.length === 2) {
        const keysArray = Array.from(pressedKeys);
        return keysArray.length >= 2 && 
               keysArray[keysArray.length - 2] === keys[0] &&
               keysArray[keysArray.length - 1] === keys[1];
      }
      
      // Single key combinations
      return keys.every(key => pressedKeys.has(key));
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key);
      
      // Add modifier keys
      if (event.ctrlKey) pressedKeys.current.add('ctrl');
      if (event.metaKey) pressedKeys.current.add('cmd');
      if (event.shiftKey) pressedKeys.current.add('shift');
      if (event.altKey) pressedKeys.current.add('alt');
      
      pressedKeys.current.add(key);

      // Check for matching shortcuts
      const matchingShortcut = shortcuts.find(shortcut => {
        if (shortcut.disabled) return false;
        
        // Check scope
        if (isHelpVisible && shortcut.scope !== 'modal') return false;
        if (!isHelpVisible && shortcut.scope === 'modal') return false;
        
        return matchesShortcut(shortcut, pressedKeys.current);
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
        pressedKeys.current.clear();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key);
      
      // Remove modifier keys
      if (!event.ctrlKey) pressedKeys.current.delete('ctrl');
      if (!event.metaKey) pressedKeys.current.delete('cmd');
      if (!event.shiftKey) pressedKeys.current.delete('shift');
      if (!event.altKey) pressedKeys.current.delete('alt');
      
      // Keep last few keys for sequences
      const keysArray = Array.from(pressedKeys.current);
      if (keysArray.length > 3) {
        pressedKeys.current.clear();
        keysArray.slice(-2).forEach(k => pressedKeys.current.add(k));
      }
    };

    // Don't capture shortcuts when user is typing in input fields
    const isTypingContext = (target: EventTarget | null): boolean => {
      if (!target) return false;
      const element = target as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const isEditable = element.isContentEditable;
      const isInput = ['input', 'textarea', 'select'].includes(tagName);
      return isInput || isEditable;
    };

    const keyDownHandler = (event: KeyboardEvent) => {
      if (!isTypingContext(event.target)) {
        handleKeyDown(event);
      }
    };

    const keyUpHandler = (event: KeyboardEvent) => {
      if (!isTypingContext(event.target)) {
        handleKeyUp(event);
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, [shortcuts, isHelpVisible]);

  const value: KeyboardShortcutsContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    showHelp,
    hideHelp,
    isHelpVisible
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      {isHelpVisible && <ShortcutsHelpModal />}
    </KeyboardShortcutsContext.Provider>
  );
};

// Help modal component
const ShortcutsHelpModal: React.FC = () => {
  const { shortcuts, hideHelp } = useKeyboardShortcuts();
  const { actualTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Annet';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  // Filter shortcuts based on search
  const filteredGroups = Object.entries(groupedShortcuts).reduce((acc, [category, shortcuts]) => {
    const filteredShortcuts = shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (filteredShortcuts.length > 0) {
      acc[category] = filteredShortcuts;
    }
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKeys = (keys: string[]): string => {
    return keys[0]; // Show first key combination
  };

  const renderKeyCombo = (keyCombo: string) => {
    const keys = keyCombo.split(/[\s+]/);
    return (
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className={`px-2 py-1 text-xs font-semibold rounded border ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-200 border-gray-600'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}>
              {key.replace('cmd', '⌘').replace('ctrl', 'Ctrl').replace('shift', '⇧').replace('alt', '⌥')}
            </kbd>
            {index < keys.length - 1 && <span className="text-gray-400">+</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-1 bg-black bg-opacity-50">
      <div className={`w-full max-w-2xl max-h-[80vh] rounded-lg shadow-lg overflow-hidden ${
        actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CommandLineIcon className={`h-6 w-6 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`} />
              <h2 className={`text-xl font-semibold ${
                actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Hurtigtaster
              </h2>
            </div>
            <button
              onClick={hideHelp}
              className={`p-2 rounded-md transition-colors ${
                actualTheme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={`px-6 py-4 border-b ${
          actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Søk etter hurtigtaster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(filteredGroups).map(([category, shortcuts]) => (
            <div key={category} className={`px-6 py-4 border-b ${
              actualTheme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className={`text-sm font-semibold mb-3 ${
                actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {category}
              </h3>
              <div className="space-y-6">
                {shortcuts.map(shortcut => (
                  <div key={shortcut.id} className="flex items-center justify-between">
                    <span className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {shortcut.description}
                    </span>
                    {renderKeyCombo(formatKeys(shortcut.keys))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 text-center ${
          actualTheme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'
        }`}>
          <p className={`text-xs ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Trykk <kbd className={`px-1 text-xs font-semibold rounded ${
              actualTheme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
            }`}>Esc</kbd> for å lukke eller{' '}
            <kbd className={`px-1 text-xs font-semibold rounded ${
              actualTheme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
            }`}>?</kbd> for å åpne
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook for using keyboard shortcuts
export const useKeyboardShortcuts = (): KeyboardShortcutsContextType => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

// Hook for registering shortcuts in components
export const useShortcut = (shortcut: Omit<KeyboardShortcut, 'id'> & { id?: string }) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const shortcutId = shortcut.id || `shortcut-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    registerShortcut({ ...shortcut, id: shortcutId });
    return () => unregisterShortcut(shortcutId);
  }, [shortcut.keys.join(','), shortcut.disabled]);
};

// Help button component
export const ShortcutsHelpButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { showHelp } = useKeyboardShortcuts();
  const { actualTheme } = useTheme();

  return (
    <button
      onClick={showHelp}
      className={`p-2 rounded-md transition-colors ${
        actualTheme === 'dark'
          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      } ${className}`}
      title="Vis hurtigtaster (?)"
    >
      <QuestionMarkCircleIcon className="h-5 w-5" />
    </button>
  );
};

export default KeyboardShortcutsProvider; 