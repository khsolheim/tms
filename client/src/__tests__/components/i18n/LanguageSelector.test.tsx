import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../../contexts/I18nContext';
import { LanguageSelector, LanguageSelectorButton } from '../../../components/ui/LanguageSelector';
import { LOCALES } from '../../../i18n';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function renderWithI18n(component: React.ReactElement) {
  return render(
    <I18nProvider>
      {component}
    </I18nProvider>
  );
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('LanguageSelector dropdown', () => {
    it('should render with current language selected', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<LanguageSelector />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue(LOCALES.NO);
    });

    it('should show both Norwegian and English options', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<LanguageSelector />);
      
      const norwegianOption = screen.getByRole('option', { name: /norsk/i });
      const englishOption = screen.getByRole('option', { name: /english/i });
      
      expect(norwegianOption).toBeInTheDocument();
      expect(englishOption).toBeInTheDocument();
    });

    it('should change language when option selected', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<LanguageSelector />);
      
      const select = screen.getByRole('combobox');
      
      await userEvent.selectOptions(select, LOCALES.EN);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('tms-locale', LOCALES.EN);
      });
    });

    it('should display correct labels for each language', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<LanguageSelector />);
      
      const norwegianOption = screen.getByRole('option', { name: /norsk/i });
      const englishOption = screen.getByRole('option', { name: /english/i });
      
      expect(norwegianOption).toHaveValue(LOCALES.NO);
      expect(englishOption).toHaveValue(LOCALES.EN);
    });

    it('should have proper accessibility attributes', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<LanguageSelector />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-label');
    });
  });

  describe('LanguageSelectorButton', () => {
    it('should render with current language flag and label', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<LanguageSelectorButton />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Should show Norwegian flag and label
      expect(button).toHaveTextContent(/🇳🇴|norsk/i);
    });

    it('should toggle language when clicked', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      renderWithI18n(<LanguageSelectorButton />);
      const button = screen.getByRole('button');
      // Klikk for å bytte til engelsk
      await userEvent.click(button);
      expect(button).toHaveTextContent(/🇬🇧|english/i);
      // Klikk igjen for å bytte tilbake til norsk
      await userEvent.click(button);
      expect(button).toHaveTextContent(/🇳🇴|norsk/i);
    });

    it('should show correct flag for English when selected', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      renderWithI18n(<LanguageSelectorButton />);
      const button = screen.getByRole('button');
      // Should show English flag and label
      expect(button).toHaveTextContent(/🇬🇧|english/i);
    });
  });

  describe('Integration with I18n system', () => {
    it('should reflect language changes in both components', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(
        <div>
          <LanguageSelector />
          <LanguageSelectorButton />
        </div>
      );
      
      const select = screen.getByRole('combobox');
      const button = screen.getByRole('button');
      
      // Both should initially show Norwegian
      expect(select).toHaveValue(LOCALES.NO);
      expect(button).toHaveTextContent(/🇳🇴|norsk/i);
      
      // Change language via dropdown
      await userEvent.selectOptions(select, LOCALES.EN);
      
      await waitFor(() => {
        expect(button).toHaveTextContent(/🇬🇧|english/i);
      });
    });

    it('should persist language selection across components', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      const { rerender } = renderWithI18n(<LanguageSelector />);
      
      const select = screen.getByRole('combobox');
      
      // Change language
      await userEvent.selectOptions(select, LOCALES.EN);
      
      // Rerender with button component
      rerender(
        <I18nProvider>
          <LanguageSelectorButton />
        </I18nProvider>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/🇬🇧|english/i);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid locale gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-locale');
      
      // Should fall back to default locale
      expect(() => renderWithI18n(<LanguageSelector />)).not.toThrow();
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue(LOCALES.NO); // Should use default
    });

    it('should handle missing translation keys gracefully', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      // Should render without throwing even if some translations are missing
      expect(() => renderWithI18n(<LanguageSelectorButton />)).not.toThrow();
    });
  });
}); 