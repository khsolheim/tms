import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load saved theme from localStorage or default to system
    const savedTheme = localStorage.getItem('tms-theme') as Theme;
    return savedTheme || 'system';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (newTheme: Theme) => {
      let resolvedTheme: 'light' | 'dark';
      
      if (newTheme === 'system') {
        resolvedTheme = getSystemTheme();
      } else {
        resolvedTheme = newTheme;
      }

      setActualTheme(resolvedTheme);
      
      // Remove previous theme classes
      root.classList.remove('light', 'dark');
      
      // Add new theme class
      root.classList.add(resolvedTheme);
      
      // Update document meta for styling
      if (resolvedTheme === 'dark') {
        root.style.colorScheme = 'dark';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1f2937');
      } else {
        root.style.colorScheme = 'light';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
      }
    };

    // Apply theme on mount and when theme changes
    applyTheme(theme);

    // Listen for system theme changes when using 'system' theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('tms-theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      handleSetTheme('dark');
    } else if (theme === 'dark') {
      handleSetTheme('system');
    } else {
      handleSetTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme: handleSetTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme-aware color utilities
export const getThemeClasses = (lightClasses: string, darkClasses: string) => {
  return `${lightClasses} dark:${darkClasses}`;
};

// CSS variables for dynamic theming
export const themeVariables = {
  light: {
    '--color-primary': '59 130 246', // blue-500
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '243 244 246', // gray-100
    '--color-secondary-foreground': '17 24 39', // gray-900
    '--color-background': '255 255 255',
    '--color-foreground': '17 24 39', // gray-900
    '--color-muted': '249 250 251', // gray-50
    '--color-muted-foreground': '107 114 128', // gray-500
    '--color-accent': '239 246 255', // blue-50
    '--color-accent-foreground': '30 58 138', // blue-900
    '--color-border': '229 231 235', // gray-200
    '--color-input': '255 255 255',
    '--color-ring': '59 130 246', // blue-500
    '--color-card': '255 255 255',
    '--color-card-foreground': '17 24 39', // gray-900
    '--color-success': '34 197 94', // green-500
    '--color-warning': '245 158 11', // amber-500
    '--color-error': '239 68 68', // red-500
    '--color-info': '59 130 246', // blue-500
  },
  dark: {
    '--color-primary': '59 130 246', // blue-500
    '--color-primary-foreground': '255 255 255',
    '--color-secondary': '31 41 55', // gray-800
    '--color-secondary-foreground': '243 244 246', // gray-100
    '--color-background': '17 24 39', // gray-900
    '--color-foreground': '243 244 246', // gray-100
    '--color-muted': '31 41 55', // gray-800
    '--color-muted-foreground': '156 163 175', // gray-400
    '--color-accent': '30 58 138', // blue-900
    '--color-accent-foreground': '191 219 254', // blue-200
    '--color-border': '75 85 99', // gray-600
    '--color-input': '31 41 55', // gray-800
    '--color-ring': '59 130 246', // blue-500
    '--color-card': '31 41 55', // gray-800
    '--color-card-foreground': '243 244 246', // gray-100
    '--color-success': '34 197 94', // green-500
    '--color-warning': '245 158 11', // amber-500
    '--color-error': '239 68 68', // red-500
    '--color-info': '59 130 246', // blue-500
  }
};

// Hook for applying theme variables
export const useThemeVariables = () => {
  const { actualTheme } = useTheme();
  
  useEffect(() => {
    const root = document.documentElement;
    const variables = themeVariables[actualTheme];
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [actualTheme]);
};

export default ThemeContext; 