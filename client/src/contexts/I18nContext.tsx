import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import {
  Locale,
  LOCALES,
  DEFAULT_LOCALE,
  getUserLocale,
  setUserLocale,
  getFlattenedMessages,
  LOCALE_INFO,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime
} from '../i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: typeof LOCALES;
  localeInfo: typeof LOCALE_INFO;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  t: (key: string, values?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setCurrentLocale] = useState<Locale>(getUserLocale);

  const setLocale = (newLocale: Locale) => {
    setCurrentLocale(newLocale);
    setUserLocale(newLocale);
    
    // Update document language
    document.documentElement.lang = newLocale;
    
    // Update document direction if needed
    document.documentElement.dir = LOCALE_INFO[newLocale].direction;
  };

  useEffect(() => {
    // Set initial language and direction
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_INFO[locale].direction;
  }, [locale]);

  // Simple translation function
  const t = (key: string, values?: Record<string, any>): string => {
    const messages = getFlattenedMessages(locale);
    let message = messages[key] || key;
    
    // Simple variable substitution
    if (values) {
      Object.keys(values).forEach(valueKey => {
        message = message.replace(`{${valueKey}}`, String(values[valueKey]));
      });
    }
    
    return message;
  };

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    availableLocales: LOCALES,
    localeInfo: LOCALE_INFO,
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, locale, options),
    formatCurrency: (value: number, currency?: string) => formatCurrency(value, locale, currency),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => formatDate(date, locale, options),
    formatRelativeTime: (date: Date | string) => formatRelativeTime(date, locale),
    t
  };

  const intlProps = {
    locale,
    messages: getFlattenedMessages(locale),
    defaultLocale: DEFAULT_LOCALE
  };

  return (
    <I18nContext.Provider value={contextValue}>
      <IntlProvider {...intlProps}>
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for easy access to common i18n functions
export function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

// Hook for translation
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
} 