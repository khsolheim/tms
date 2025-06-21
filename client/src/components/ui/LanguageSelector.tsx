import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { LOCALES } from '../../i18n';

export function LanguageSelector() {
  const { locale, setLocale, localeInfo } = useI18n();

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        className="
          appearance-none bg-white border border-gray-300 rounded-md 
          px-2 py-1 pr-8 text-sm text-gray-700 
          hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          cursor-pointer transition-colors duration-200
        "
        aria-label="Velg språk / Select language"
      >
        <option value={LOCALES.NO}>
          {localeInfo[LOCALES.NO].flag} {localeInfo[LOCALES.NO].name}
        </option>
        <option value={LOCALES.EN}>
          {localeInfo[LOCALES.EN].flag} {localeInfo[LOCALES.EN].name}
        </option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function LanguageSelectorButton() {
  const { locale, setLocale, localeInfo } = useI18n();
  
  const toggleLanguage = () => {
    const newLocale = locale === LOCALES.NO ? LOCALES.EN : LOCALES.NO;
    setLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="
        flex items-center space-x-2 px-2 py-1 rounded-md text-sm
        text-gray-700 hover:text-gray-900 hover:bg-gray-100
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
      "
      aria-label={`Bytt til ${locale === LOCALES.NO ? 'English' : 'Norsk'} / Switch to ${locale === LOCALES.NO ? 'English' : 'Norwegian'}`}
      title={`Bytt til ${locale === LOCALES.NO ? 'English' : 'Norsk'}`}
    >
      <span className="text-lg">
        {localeInfo[locale].flag}
      </span>
      <span className="hidden sm:inline">
        {localeInfo[locale].name}
      </span>
    </button>
  );
} 