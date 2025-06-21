import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider, useI18n, useTranslation } from '../../../contexts/I18nContext';
import { LOCALES, DEFAULT_LOCALE } from '../../../i18n';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses i18n hooks
function TestComponent() {
  const { locale, setLocale, formatNumber, formatCurrency, formatDate, formatRelativeTime } = useI18n();
  const { t } = useTranslation();

  return (
    <div>
      <div data-testid="current-locale">{locale}</div>
      <div data-testid="translation">{t('common.welcome')}</div>
      <div data-testid="formatted-number">{formatNumber(123456.789)}</div>
      <div data-testid="formatted-currency">{formatCurrency(99999.50)}</div>
      <div data-testid="formatted-date">{formatDate(new Date('2024-06-11T10:30:00Z'))}</div>
      <div data-testid="formatted-relative-time">{formatRelativeTime(new Date(Date.now() - 3600000))}</div>
      <div data-testid="translation-with-variables">{t('demo.i18n.userGreeting', { name: 'Test', count: 5 })}</div>
      
      <button onClick={() => setLocale(LOCALES.EN)} data-testid="switch-to-en">
        Switch to English
      </button>
      <button onClick={() => setLocale(LOCALES.NO)} data-testid="switch-to-no">
        Switch to Norwegian
      </button>
    </div>
  );
}

function renderWithI18n(component: React.ReactElement) {
  return render(
    <I18nProvider>
      {component}
    </I18nProvider>
  );
}

describe('I18nContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('Default behavior', () => {
    it('should use default locale when no preference stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent(DEFAULT_LOCALE);
    });

    it('should set document language and direction', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      renderWithI18n(<TestComponent />);
      
      expect(document.documentElement.lang).toBe(DEFAULT_LOCALE);
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('Locale persistence', () => {
    it('should load saved locale from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent(LOCALES.EN);
    });

    it('should save locale changes to localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      const switchButton = screen.getByTestId('switch-to-en');
      
      fireEvent.click(switchButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tms-locale', LOCALES.EN);
    });
  });

  describe('Translations', () => {
    it('should translate Norwegian text correctly', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('translation')).toHaveTextContent('Velkommen');
    });

    it('should translate English text correctly', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('translation')).toHaveTextContent('Welcome');
    });

    it('should handle variable substitution', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('translation-with-variables')).toHaveTextContent('Hi Test! You have 5 new messages.');
    });

    it('should fall back to key when translation missing', () => {
      const TestMissingTranslation = () => {
        const { t } = useTranslation();
        return <div data-testid="missing">{t('non.existent.key')}</div>;
      };

      renderWithI18n(<TestMissingTranslation />);
      
      expect(screen.getByTestId('missing')).toHaveTextContent('non.existent.key');
    });
  });

  describe('Number formatting', () => {
    it('should format numbers according to Norwegian locale', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      // Norwegian number format uses space as thousands separator and comma as decimal
      expect(screen.getByTestId('formatted-number')).toHaveTextContent('123 456,789');
    });

    it('should format numbers according to English locale', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      // English number format uses comma as thousands separator and dot as decimal
      expect(screen.getByTestId('formatted-number')).toHaveTextContent('123,456.789');
    });
  });

  describe('Currency formatting', () => {
    it('should format currency according to Norwegian locale', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      const currencyText = screen.getByTestId('formatted-currency').textContent;
      expect(currencyText).toMatch(/kr\s*99\s*999[,.]50|99\s*999[,.]50\s*kr/);
    });

    it('should format currency according to English locale', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      const currencyText = screen.getByTestId('formatted-currency').textContent;
      expect(currencyText).toMatch(/\$99,999\.50|NOK\s*99,999\.50/);
    });
  });

  describe('Date formatting', () => {
    it('should format dates according to Norwegian locale', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      const dateText = screen.getByTestId('formatted-date').textContent;
      // Norwegian date format: dd.MM.yyyy or similar
      expect(dateText).toMatch(/11\.06\.2024|11\/06\/2024/);
    });

    it('should format dates according to English locale', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      const dateText = screen.getByTestId('formatted-date').textContent;
      // English date format: MM/dd/yyyy or similar
      expect(dateText).toMatch(/06\/11\/2024|6\/11\/2024/);
    });
  });

  describe('Relative time formatting', () => {
    it('should format relative time in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      const relativeTimeText = screen.getByTestId('formatted-relative-time').textContent;
      expect(relativeTimeText).toMatch(/time|timer|siden/i);
    });

    it('should format relative time in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      const relativeTimeText = screen.getByTestId('formatted-relative-time').textContent;
      expect(relativeTimeText).toMatch(/hour|hours|ago/i);
    });
  });

  describe('Language switching', () => {
    it('should switch from Norwegian to English', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent(LOCALES.NO);
      expect(screen.getByTestId('translation')).toHaveTextContent('Velkommen');
      
      const switchButton = screen.getByTestId('switch-to-en');
      
      fireEvent.click(switchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-locale')).toHaveTextContent(LOCALES.EN);
      });
      
      expect(screen.getByTestId('translation')).toHaveTextContent('Welcome');
    });

    it('should switch from English to Norwegian', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestComponent />);
      
      expect(screen.getByTestId('current-locale')).toHaveTextContent(LOCALES.EN);
      expect(screen.getByTestId('translation')).toHaveTextContent('Welcome');
      
      const switchButton = screen.getByTestId('switch-to-no');
      
      fireEvent.click(switchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-locale')).toHaveTextContent(LOCALES.NO);
      });
      
      expect(screen.getByTestId('translation')).toHaveTextContent('Velkommen');
    });

    it('should update document attributes when switching languages', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<TestComponent />);
      
      expect(document.documentElement.lang).toBe(LOCALES.NO);
      
      const switchButton = screen.getByTestId('switch-to-en');
      
      fireEvent.click(switchButton);
      
      await waitFor(() => {
        expect(document.documentElement.lang).toBe(LOCALES.EN);
      });
    });
  });

  describe('Error handling', () => {
    it('should throw error when useI18n used outside provider', () => {
      const TestOutsideProvider = () => {
        const { locale } = useI18n();
        return <div>{locale}</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestOutsideProvider />)).toThrow('useI18n must be used within an I18nProvider');
      
      consoleSpy.mockRestore();
    });

    it('should throw error when useTranslation used outside provider', () => {
      const TestOutsideProvider = () => {
        const { t } = useTranslation();
        return <div>{t('test')}</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<TestOutsideProvider />)).toThrow('useI18n must be used within an I18nProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Multiple variable substitution', () => {
    it('should handle multiple variables in translation', () => {
      const TestMultipleVars = () => {
        const { t } = useTranslation();
        return (
          <div data-testid="multi-vars">
            {t('demo.i18n.userGreeting', { name: 'John', count: 42 })}
          </div>
        );
      };

      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestMultipleVars />);
      
      expect(screen.getByTestId('multi-vars')).toHaveTextContent('Hi John! You have 42 new messages.');
    });

    it('should handle missing variables gracefully', () => {
      const TestMissingVars = () => {
        const { t } = useTranslation();
        return (
          <div data-testid="missing-vars">
            {t('demo.i18n.userGreeting', { name: 'Jane' })} {/* count missing */}
          </div>
        );
      };

      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<TestMissingVars />);
      
      // Should keep {count} placeholder when variable is missing
      expect(screen.getByTestId('missing-vars')).toHaveTextContent('Hi Jane! You have {count} new messages.');
    });
  });
}); 