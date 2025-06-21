import React from 'react';
import { useI18n, useTranslation } from '../../contexts/I18nContext';
import { LanguageSelector, LanguageSelectorButton } from '../ui/LanguageSelector';

export function I18nDemo() {
  const { locale, formatNumber, formatCurrency, formatDate, formatRelativeTime } = useI18n();
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto px-2 py-1 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {t('demo.i18n.title')}
      </h2>

      {/* Language Selector Demo */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {t('demo.i18n.languageSelector')}
        </h3>
        <div className="flex items-center cards-spacing-grid">
          <LanguageSelector />
          <LanguageSelectorButton />
        </div>
      </div>

      {/* Current Locale Info */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {t('demo.i18n.currentLocale')}
        </h3>
        <p className="text-gray-600">
          <strong>{t('demo.i18n.locale')}:</strong> {locale}
        </p>
      </div>

      {/* Translation Examples */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {t('demo.i18n.translations')}
        </h3>
        <div className="space-y-6">
          <p><strong>{t('demo.i18n.welcome')}:</strong> {t('common.welcome')}</p>
          <p><strong>{t('demo.i18n.save')}:</strong> {t('common.actions.save')}</p>
          <p><strong>{t('demo.i18n.cancel')}:</strong> {t('common.actions.cancel')}</p>
          <p><strong>{t('demo.i18n.companies')}:</strong> {t('navigation.companies')}</p>
          <p><strong>{t('demo.i18n.contracts')}:</strong> {t('navigation.contracts')}</p>
        </div>
      </div>

      {/* Formatting Examples */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {t('demo.i18n.formatting')}
        </h3>
        <div className="space-y-6">
          <p>
            <strong>{t('demo.i18n.number')}:</strong> {formatNumber(123456.789)}
          </p>
          <p>
            <strong>{t('demo.i18n.currency')}:</strong> {formatCurrency(99999.50)}
          </p>
          <p>
            <strong>{t('demo.i18n.date')}:</strong> {formatDate(new Date())}
          </p>
          <p>
            <strong>{t('demo.i18n.relativeTime')}:</strong> {formatRelativeTime(new Date(Date.now() - 3600000))}
          </p>
        </div>
      </div>

      {/* Variable Substitution Example */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {t('demo.i18n.variables')}
        </h3>
        <p>
          {t('demo.i18n.userGreeting', { name: 'Karsten', count: 42 })}
        </p>
      </div>

      {/* Navigation Translations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {t('demo.i18n.navigation')}
        </h3>
        <div className="grid grid-cols-2 cards-spacing-grid">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">{t('demo.i18n.menuItems')}:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• {t('navigation.overview')}</li>
              <li>• {t('navigation.companies')}</li>
              <li>• {t('navigation.contracts')}</li>
              <li>• {t('navigation.tasks')}</li>
              <li>• {t('navigation.quiz')}</li>
              <li>• {t('navigation.settings')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">{t('demo.i18n.descriptions')}:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• {t('navigation.overview.description')}</li>
              <li>• {t('navigation.companies.description')}</li>
              <li>• {t('navigation.contracts.description')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-md px-2 py-1">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">
              {t('demo.i18n.success')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 