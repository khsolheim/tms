// Type definitions for i18n functionality

// Import message files
import noMessages from './locales/no.json';
import enMessages from './locales/en.json';

// Available locales
export const LOCALES = {
  NO: 'no',
  EN: 'en'
} as const;

export type Locale = typeof LOCALES[keyof typeof LOCALES];

// Messages by locale
const messages = {
  [LOCALES.NO]: noMessages,
  [LOCALES.EN]: enMessages
};

// Default locale
export const DEFAULT_LOCALE: Locale = LOCALES.NO;

// Get user's preferred locale
export function getUserLocale(): Locale {
  // Check localStorage first
  const stored = localStorage.getItem('locale') as Locale;
  if (stored && Object.values(LOCALES).includes(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'en') {
    return LOCALES.EN;
  }
  
  // Default to Norwegian
  return LOCALES.NO;
}

// Set user's locale preference
export function setUserLocale(locale: Locale): void {
  localStorage.setItem('locale', locale);
}

// Get messages for locale
export function getMessages(locale: Locale): any {
  return messages[locale] || messages[DEFAULT_LOCALE];
}

// Flatten nested message object for react-intl
function flattenMessages(nestedMessages: any, prefix = ''): Record<string, string> {
  const flatMessages: Record<string, string> = {};
  
  Object.keys(nestedMessages).forEach(key => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      flatMessages[prefixedKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flatMessages, flattenMessages(value, prefixedKey));
    }
  });
  
  return flatMessages;
}

// Get flattened messages for react-intl
export function getFlattenedMessages(locale: Locale): Record<string, string> {
  return flattenMessages(getMessages(locale));
}

// Format number according to locale
export function formatNumber(
  value: number, 
  locale: Locale = getUserLocale(),
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

// Format currency according to locale
export function formatCurrency(
  value: number, 
  locale: Locale = getUserLocale(),
  currency: string = 'NOK'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

// Format date according to locale
export function formatDate(
  date: Date | string, 
  locale: Locale = getUserLocale(),
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObject);
}

// Format relative time according to locale
export function formatRelativeTime(
  date: Date | string,
  locale: Locale = getUserLocale()
): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObject.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

// Locale information
export const LOCALE_INFO = {
  [LOCALES.NO]: {
    name: 'Norsk',
    flag: '🇳🇴',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    direction: 'ltr'
  },
  [LOCALES.EN]: {
    name: 'English',
    flag: '🇬🇧',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'hh:mm a',
    direction: 'ltr'
  }
} as const; 