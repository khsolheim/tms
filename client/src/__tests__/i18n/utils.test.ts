import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getMessages,
  getFlattenedMessages,
  getUserLocale,
  setUserLocale,
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_INFO
} from '../../i18n';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('i18n utilities', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('formatNumber', () => {
    it('should format numbers in Norwegian locale', () => {
      const result = formatNumber(123456.789, LOCALES.NO);
      
      // Norwegian format uses space as thousands separator and comma as decimal
      expect(result).toMatch(/123.*456.*789/);
      expect(result).toMatch(/.*,.*|.*\./); // Should have decimal separator
    });

    it('should format numbers in English locale', () => {
      const result = formatNumber(123456.789, LOCALES.EN);
      
      // English format uses comma as thousands separator and dot as decimal
      expect(result).toMatch(/123.*456.*789/);
      expect(result).toMatch(/.*\./); // Should have decimal separator
    });

    it('should handle whole numbers correctly', () => {
      const norwegianResult = formatNumber(123456, LOCALES.NO);
      const englishResult = formatNumber(123456, LOCALES.EN);
      
      expect(norwegianResult).toMatch(/123.*456/);
      expect(englishResult).toMatch(/123.*456/);
    });

    it('should handle small numbers correctly', () => {
      const result = formatNumber(42, LOCALES.NO);
      expect(result).toBe('42');
    });

    it('should handle negative numbers correctly', () => {
      const result = formatNumber(-123456.789, LOCALES.NO);
      expect(result).toMatch(/-.*123.*456.*789/);
    });

    it('should respect custom options', () => {
      const result = formatNumber(123456.789, LOCALES.EN, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
      
      expect(result).toMatch(/123.*456/);
      expect(result).not.toMatch(/\./); // Should not have decimal
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in Norwegian locale', () => {
      const result = formatCurrency(99999.50, LOCALES.NO);
      
      // Should contain kr and the amount
      expect(result).toMatch(/kr|NOK/i);
      expect(result).toMatch(/99.*999.*50/);
    });

    it('should format currency in English locale', () => {
      const result = formatCurrency(99999.50, LOCALES.EN);
      
      // Should contain currency symbol and amount
      expect(result).toMatch(/\$|kr|NOK/i);
      expect(result).toMatch(/99.*999.*50/);
    });

    it('should handle custom currency', () => {
      const result = formatCurrency(1000, LOCALES.EN, 'EUR');
      
      expect(result).toMatch(/EUR|€/);
      expect(result).toMatch(/1.*000/);
    });

    it('should handle zero amounts', () => {
      const result = formatCurrency(0, LOCALES.NO);
      
      expect(result).toMatch(/kr|NOK/i);
      expect(result).toMatch(/0/);
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(1234567.89, LOCALES.NO);
      
      expect(result).toMatch(/1.*234.*567.*89/);
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-06-11T10:30:00Z');

    it('should format dates in Norwegian locale', () => {
      const result = formatDate(testDate, LOCALES.NO);
      
      // Should contain the date parts
      expect(result).toMatch(/11|06|2024/);
    });

    it('should format dates in English locale', () => {
      const result = formatDate(testDate, LOCALES.EN);
      
      // Should contain the date parts
      expect(result).toMatch(/11|06|2024|6/);
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-06-11T10:30:00Z', LOCALES.NO);
      
      expect(result).toMatch(/11|06|2024/);
    });

    it('should respect custom options', () => {
      const result = formatDate(testDate, LOCALES.EN, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      expect(result).toMatch(/June|juni/i);
      expect(result).toMatch(/11/);
      expect(result).toMatch(/2024/);
    });

    it('should handle current date', () => {
      const now = new Date();
      const result = formatDate(now, LOCALES.NO);
      
      // Should format without throwing
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time in Norwegian', () => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const result = formatRelativeTime(oneHourAgo, LOCALES.NO);
      
      expect(result).toMatch(/time|timer|siden/i);
    });

    it('should format relative time in English', () => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const result = formatRelativeTime(oneHourAgo, LOCALES.EN);
      
      expect(result).toMatch(/hour|hours|ago/i);
    });

    it('should handle string dates', () => {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const result = formatRelativeTime(oneHourAgo, LOCALES.NO);
      
      expect(result).toMatch(/time|timer|siden|hour|ago/i);
    });

    it('should handle future dates', () => {
      const oneHourFromNow = new Date(Date.now() + 3600000);
      const result = formatRelativeTime(oneHourFromNow, LOCALES.EN);
      
      expect(result).toMatch(/in|om/i);
    });

    it('should handle recent dates', () => {
      const fiveMinutesAgo = new Date(Date.now() - 300000);
      const result = formatRelativeTime(fiveMinutesAgo, LOCALES.NO);
      
      expect(result).toMatch(/minutter|siden|minutes|ago/i);
    });
  });

  describe('getMessages', () => {
    it('should return Norwegian messages for NO locale', () => {
      const messages = getMessages(LOCALES.NO);
      
      expect(messages).toBeDefined();
      expect(messages.common).toBeDefined();
      expect(messages.common.welcome).toBe('Velkommen');
    });

    it('should return English messages for EN locale', () => {
      const messages = getMessages(LOCALES.EN);
      
      expect(messages).toBeDefined();
      expect(messages.common).toBeDefined();
      expect(messages.common.welcome).toBe('Welcome');
    });

    it('should fall back to default locale for invalid locale', () => {
      const messages = getMessages('invalid' as any);
      
      expect(messages).toBeDefined();
      expect(messages.common.welcome).toBe('Velkommen'); // Should be Norwegian (default)
    });
  });

  describe('getFlattenedMessages', () => {
    it('should flatten Norwegian messages correctly', () => {
      const flattened = getFlattenedMessages(LOCALES.NO);
      
      expect(flattened['common.welcome']).toBe('Velkommen');
      expect(flattened['common.save']).toBe('Lagre');
      expect(flattened['navigation.companies']).toBe('Bedrifter');
      expect(flattened['demo.i18n.title']).toBe('Internasjonalisering Demo');
    });

    it('should flatten English messages correctly', () => {
      const flattened = getFlattenedMessages(LOCALES.EN);
      
      expect(flattened['common.welcome']).toBe('Welcome');
      expect(flattened['common.save']).toBe('Save');
      expect(flattened['navigation.companies']).toBe('Companies');
      expect(flattened['demo.i18n.title']).toBe('Internationalization Demo');
    });

    it('should handle nested objects correctly', () => {
      const flattened = getFlattenedMessages(LOCALES.NO);
      
      expect(flattened['companies.fields.name']).toBe('Bedriftsnavn');
      expect(flattened['validation.required']).toBe('Dette feltet er påkrevd');
    });

    it('should preserve all translation keys', () => {
      const norwegian = getFlattenedMessages(LOCALES.NO);
      const english = getFlattenedMessages(LOCALES.EN);
      
      // Should have the same keys
      const norwegianKeys = Object.keys(norwegian);
      const englishKeys = Object.keys(english);
      
      expect(norwegianKeys.sort()).toEqual(englishKeys.sort());
    });
  });

  describe('getUserLocale', () => {
    it('should return stored locale from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      const locale = getUserLocale();
      
      expect(locale).toBe(LOCALES.EN);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tms-locale');
    });

    it('should fall back to browser language if no stored preference', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock browser language
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US',
      });
      
      const locale = getUserLocale();
      
      expect(locale).toBe(LOCALES.EN);
    });

    it('should fall back to default locale if browser language not supported', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock unsupported browser language
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'fr-FR',
      });
      
      const locale = getUserLocale();
      
      expect(locale).toBe(DEFAULT_LOCALE);
    });

    it('should handle Norwegian browser language', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'nb-NO',
      });
      
      const locale = getUserLocale();
      
      expect(locale).toBe(LOCALES.NO);
    });
  });

  describe('setUserLocale', () => {
    it('should save locale to localStorage', () => {
      setUserLocale(LOCALES.EN);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tms-locale', LOCALES.EN);
    });

    it('should handle Norwegian locale', () => {
      setUserLocale(LOCALES.NO);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tms-locale', LOCALES.NO);
    });
  });

  describe('LOCALE_INFO', () => {
    it('should contain information for all supported locales', () => {
      expect(LOCALE_INFO[LOCALES.NO]).toBeDefined();
      expect(LOCALE_INFO[LOCALES.EN]).toBeDefined();
    });

    it('should have proper Norwegian locale info', () => {
      const noInfo = LOCALE_INFO[LOCALES.NO];
      
      expect(noInfo.name).toMatch(/norsk/i);
      expect(noInfo.flag).toBe('🇳🇴');
      expect(noInfo.direction).toBe('ltr');
    });

    it('should have proper English locale info', () => {
      const enInfo = LOCALE_INFO[LOCALES.EN];
      
      expect(enInfo.name).toMatch(/english/i);
      expect(enInfo.flag).toBe('🇬🇧');
      expect(enInfo.direction).toBe('ltr');
    });
  });

  describe('Constants', () => {
    it('should have correct default locale', () => {
      expect(DEFAULT_LOCALE).toBe(LOCALES.NO);
    });

    it('should have all expected locales', () => {
      expect(LOCALES.NO).toBe('no');
      expect(LOCALES.EN).toBe('en');
    });

    it('should have readonly locale constants', () => {
      // This would throw in strict mode if trying to modify
      expect(() => {
        (LOCALES as any).NO = 'modified';
      }).not.toThrow(); // TypeScript prevents this, but runtime might allow
      
      // Values should remain unchanged
      expect(LOCALES.NO).toBe('no');
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      // Should not throw
      expect(() => getUserLocale()).not.toThrow();
      
      // Should fall back to default
      const locale = getUserLocale();
      expect(locale).toBe(DEFAULT_LOCALE);
    });

    it('should handle setItem errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      // Should not throw
      expect(() => setUserLocale(LOCALES.EN)).not.toThrow();
    });

    it('should handle invalid date objects', () => {
      const invalidDate = new Date('invalid');
      
      expect(() => formatDate(invalidDate, LOCALES.NO)).not.toThrow();
      expect(() => formatRelativeTime(invalidDate, LOCALES.NO)).not.toThrow();
    });
  });
}); 