import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../design-system";
import { 
  Cog6ToothIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  BellIcon,
  LanguageIcon,
  ChartBarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface QuizSettings {
  // Generelle innstillinger
  defaultTimeLimit: number;
  minPassingScore: number;
  maxAttempts: number;
  allowRetakes: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  
  // Sikkerhetsinnstillinger
  preventCheating: boolean;
  showResults: boolean;
  allowBackNavigation: boolean;
  fullscreenMode: boolean;
  
  // Notifikasjoner
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderDays: number;
  
  // UI/UX
  theme: 'light' | 'dark' | 'auto';
  language: 'no' | 'en';
  showProgress: boolean;
  showTimer: boolean;
  
  // Rapportering
  autoGenerateReports: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  includeAnalytics: boolean;
}

const QuizInnstillinger: React.FC = () => {
  const [settings, setSettings] = useState<QuizSettings>({
    // Standardverdier
    defaultTimeLimit: 30,
    minPassingScore: 70,
    maxAttempts: 3,
    allowRetakes: true,
    shuffleQuestions: true,
    shuffleAnswers: true,
    
    preventCheating: true,
    showResults: true,
    allowBackNavigation: false,
    fullscreenMode: true,
    
    emailNotifications: true,
    smsNotifications: false,
    reminderDays: 7,
    
    theme: 'light',
    language: 'no',
    showProgress: true,
    showTimer: true,
    
    autoGenerateReports: true,
    reportFrequency: 'weekly',
    includeAnalytics: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof QuizSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Innstillinger lagret!');
      setHasChanges(false);
    } catch (error) {
      alert('Feil ved lagring av innstillinger. Prøv igjen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Er du sikker på at du vil tilbakestille alle innstillinger til standardverdier?')) {
      setSettings({
        defaultTimeLimit: 30,
        minPassingScore: 70,
        maxAttempts: 3,
        allowRetakes: true,
        shuffleQuestions: true,
        shuffleAnswers: true,
        
        preventCheating: true,
        showResults: true,
        allowBackNavigation: false,
        fullscreenMode: true,
        
        emailNotifications: true,
        smsNotifications: false,
        reminderDays: 7,
        
        theme: 'light',
        language: 'no',
        showProgress: true,
        showTimer: true,
        
        autoGenerateReports: true,
        reportFrequency: 'weekly',
        includeAnalytics: true
      });
      setHasChanges(true);
    }
  };

  return (
    <div className="px-2 py-1 cards-spacing-vertical">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Innstillinger</h1>
          <p className="text-gray-600 mt-2">
            Konfigurer globale innstillinger for quiz-systemet
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center px-2 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="mr-2 h-4 w-4" />
            Tilbakestill
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircleIcon className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">Du har ulagrede endringer</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        {/* Generelle Innstillinger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Generelle Innstillinger</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="cards-spacing-vertical">
            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">
                Standard tidsbegrensning (minutter)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={settings.defaultTimeLimit}
                onChange={(e) => handleSettingChange('defaultTimeLimit', parseInt(e.target.value))}
                min="1"
                max="180"
              />
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">
                Minimum bestått score (%)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={settings.minPassingScore}
                onChange={(e) => handleSettingChange('minPassingScore', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">
                Maksimalt antall forsøk
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={settings.maxAttempts}
                onChange={(e) => handleSettingChange('maxAttempts', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowRetakes"
                  checked={settings.allowRetakes}
                  onChange={(e) => handleSettingChange('allowRetakes', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowRetakes" className="text-sm text-gray-700">
                  Tillat gjentakelse av quiz
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={settings.shuffleQuestions}
                  onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="shuffleQuestions" className="text-sm text-gray-700">
                  Bland spørsmål tilfeldig
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shuffleAnswers"
                  checked={settings.shuffleAnswers}
                  onChange={(e) => handleSettingChange('shuffleAnswers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="shuffleAnswers" className="text-sm text-gray-700">
                  Bland svaralternativer tilfeldig
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sikkerhetsinnstillinger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Sikkerhetsinnstillinger</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="cards-spacing-vertical">
            <div className="space-y-8">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preventCheating"
                  checked={settings.preventCheating}
                  onChange={(e) => handleSettingChange('preventCheating', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="preventCheating" className="text-sm text-gray-700">
                  Aktiver anti-juks tiltak
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fullscreenMode"
                  checked={settings.fullscreenMode}
                  onChange={(e) => handleSettingChange('fullscreenMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="fullscreenMode" className="text-sm text-gray-700">
                  Krev fullskjerm modus
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowBackNavigation"
                  checked={settings.allowBackNavigation}
                  onChange={(e) => handleSettingChange('allowBackNavigation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowBackNavigation" className="text-sm text-gray-700">
                  Tillat tilbakenavigering
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showResults"
                  checked={settings.showResults}
                  onChange={(e) => handleSettingChange('showResults', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showResults" className="text-sm text-gray-700">
                  Vis resultater etter fullføring
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifikasjoner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5" />
              <span>Notifikasjoner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="cards-spacing-vertical">
            <div className="space-y-8">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                  E-post notifikasjoner
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="text-sm text-gray-700">
                  SMS notifikasjoner
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">
                Påminnelse (dager før utløp)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={settings.reminderDays}
                onChange={(e) => handleSettingChange('reminderDays', parseInt(e.target.value))}
                min="1"
                max="30"
              />
            </div>
          </CardContent>
        </Card>

        {/* UI/UX Innstillinger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PaintBrushIcon className="h-5 w-5" />
              <span>Brukergrensesnitt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="cards-spacing-vertical">
            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">Tema</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value as any)}
              >
                <option value="light">Lyst</option>
                <option value="dark">Mørkt</option>
                <option value="auto">Automatisk</option>
              </select>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700">Språk</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value as any)}
              >
                <option value="no">Norsk</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showProgress"
                  checked={settings.showProgress}
                  onChange={(e) => handleSettingChange('showProgress', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showProgress" className="text-sm text-gray-700">
                  Vis fremdriftsindikatorer
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTimer"
                  checked={settings.showTimer}
                  onChange={(e) => handleSettingChange('showTimer', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showTimer" className="text-sm text-gray-700">
                  Vis nedtellingstimer
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rapportering */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span>Rapportering og Analyse</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="cards-spacing-vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 cards-spacing-grid">
              <div className="space-y-8">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoGenerateReports"
                    checked={settings.autoGenerateReports}
                    onChange={(e) => handleSettingChange('autoGenerateReports', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoGenerateReports" className="text-sm text-gray-700">
                    Automatisk rapportgenerering
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeAnalytics"
                    checked={settings.includeAnalytics}
                    onChange={(e) => handleSettingChange('includeAnalytics', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeAnalytics" className="text-sm text-gray-700">
                    Inkluder avansert analyse
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-sm font-medium text-gray-700">Rapportfrekvens</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={settings.reportFrequency}
                  onChange={(e) => handleSettingChange('reportFrequency', e.target.value as any)}
                  disabled={!settings.autoGenerateReports}
                >
                  <option value="daily">Daglig</option>
                  <option value="weekly">Ukentlig</option>
                  <option value="monthly">Månedlig</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5" />
            <span>Systemstatus</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 cards-spacing-grid">
            <div className="flex items-center space-x-3 px-2 py-1 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">Database</p>
                <p className="text-xs text-green-600">Tilkoblet og operativ</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-2 py-1 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">E-post tjeneste</p>
                <p className="text-xs text-green-600">Fungerer normalt</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-2 py-1 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-yellow-800">SMS tjeneste</p>
                <p className="text-xs text-yellow-600">Vedlikehold pågår</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizInnstillinger; 