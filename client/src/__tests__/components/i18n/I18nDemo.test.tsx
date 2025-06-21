import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../../contexts/I18nContext';
import { I18nDemo } from '../../../components/demo/I18nDemo';
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

describe('I18nDemo', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      expect(() => renderWithI18n(<I18nDemo />)).not.toThrow();
    });

    it('should display the demo title in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Internasjonalisering Demo')).toBeInTheDocument();
    });

    it('should display the demo title in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Internationalization Demo')).toBeInTheDocument();
    });
  });

  describe('Language selector section', () => {
    it('should show language selector components', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Språkvelger')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show correct section title in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Language Selector')).toBeInTheDocument();
    });
  });

  describe('Current locale display', () => {
    it('should display current locale information in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Gjeldende språk')).toBeInTheDocument();
      expect(screen.getByText('Språkkode:')).toBeInTheDocument();
      expect(screen.getByText('no')).toBeInTheDocument();
    });

    it('should display current locale information in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Current Language')).toBeInTheDocument();
      expect(screen.getByText('Language Code:')).toBeInTheDocument();
      expect(screen.getByText('en')).toBeInTheDocument();
    });
  });

  describe('Translation examples', () => {
    it('should show translation examples in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Oversettelser')).toBeInTheDocument();
      expect(screen.getByText('Velkommen:')).toBeInTheDocument();
      expect(screen.getByText('Lagre:')).toBeInTheDocument();
      expect(screen.getByText('Avbryt:')).toBeInTheDocument();
      expect(screen.getByText('Bedrifter:')).toBeInTheDocument();
      expect(screen.getByText('Kontrakter:')).toBeInTheDocument();
    });

    it('should show translation examples in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Translations')).toBeInTheDocument();
      expect(screen.getByText('Welcome:')).toBeInTheDocument();
      expect(screen.getByText('Save:')).toBeInTheDocument();
      expect(screen.getByText('Cancel:')).toBeInTheDocument();
      expect(screen.getByText('Companies:')).toBeInTheDocument();
      expect(screen.getByText('Contracts:')).toBeInTheDocument();
    });
  });

  describe('Formatting examples', () => {
    it('should display formatting section in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Formatering')).toBeInTheDocument();
      expect(screen.getByText('Tall:')).toBeInTheDocument();
      expect(screen.getByText('Valuta:')).toBeInTheDocument();
      expect(screen.getByText('Dato:')).toBeInTheDocument();
      expect(screen.getByText('Relativ tid:')).toBeInTheDocument();
    });

    it('should display formatting section in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Formatting')).toBeInTheDocument();
      expect(screen.getByText('Number:')).toBeInTheDocument();
      expect(screen.getByText('Currency:')).toBeInTheDocument();
      expect(screen.getByText('Date:')).toBeInTheDocument();
      expect(screen.getByText('Relative Time:')).toBeInTheDocument();
    });

    it('should show formatted numbers correctly', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should show Norwegian number format
      expect(screen.getByText(/123.*456.*789/)).toBeInTheDocument();
    });

    it('should show formatted currency correctly', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should show Norwegian currency format
      const currencyElement = screen.getByText(/99.*999.*50/);
      expect(currencyElement).toBeInTheDocument();
    });

    it('should show formatted date correctly', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should show some kind of date format
      const datePattern = /\d{1,2}[./]\d{1,2}[./]\d{4}/;
      const dateElement = screen.getByText(datePattern);
      expect(dateElement).toBeInTheDocument();
    });

    it('should show relative time correctly', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should show some kind of relative time format
      const relativeTimeElement = screen.getByText(/time|timer|siden|hour|ago/i);
      expect(relativeTimeElement).toBeInTheDocument();
    });
  });

  describe('Variable substitution', () => {
    it('should show variable substitution example in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Variabler')).toBeInTheDocument();
      expect(screen.getByText(/Hei Karsten! Du har 42 nye meldinger/)).toBeInTheDocument();
    });

    it('should show variable substitution example in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Variables')).toBeInTheDocument();
      expect(screen.getByText(/Hi Karsten! You have 42 new messages/)).toBeInTheDocument();
    });
  });

  describe('Navigation translations', () => {
    it('should show navigation section in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Navigasjon')).toBeInTheDocument();
      expect(screen.getByText('Menyelementer:')).toBeInTheDocument();
      expect(screen.getByText('Beskrivelser:')).toBeInTheDocument();
      
      // Should show Norwegian navigation items
      expect(screen.getByText('Oversikt')).toBeInTheDocument();
      expect(screen.getByText('Bedrifter')).toBeInTheDocument();
      expect(screen.getByText('Kontrakter')).toBeInTheDocument();
    });

    it('should show navigation section in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Menu Items:')).toBeInTheDocument();
      expect(screen.getByText('Descriptions:')).toBeInTheDocument();
      
      // Should show English navigation items
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Companies')).toBeInTheDocument();
      expect(screen.getByText('Contracts')).toBeInTheDocument();
    });
  });

  describe('Success message', () => {
    it('should show success message in Norwegian', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('🎉 Internasjonalisering virker perfekt!')).toBeInTheDocument();
    });

    it('should show success message in English', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.EN);
      
      renderWithI18n(<I18nDemo />);
      
      expect(screen.getByText('🎉 Internationalization works perfectly!')).toBeInTheDocument();
    });
  });

  describe('Interactive functionality', () => {
    it('should change language when using embedded language selector', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Initially in Norwegian
      expect(screen.getByText('Internasjonalisering Demo')).toBeInTheDocument();
      
      // Find and use the language selector
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, LOCALES.EN);
      
      // Should change to English
      await waitFor(() => {
        expect(screen.getByText('Internationalization Demo')).toBeInTheDocument();
      });
      
      // All content should be in English
      expect(screen.getByText('Language Selector')).toBeInTheDocument();
      expect(screen.getByText('Current Language')).toBeInTheDocument();
      expect(screen.getByText('Formatting')).toBeInTheDocument();
    });

    it('should change language when using embedded language button', async () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Initially in Norwegian
      expect(screen.getByText('Internasjonalisering Demo')).toBeInTheDocument();
      
      // Finn og klikk språkbytte-knappen
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      // Nå skal språket være engelsk
      await waitFor(() => {
        expect(screen.getByText('Internationalization Demo')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive design', () => {
    it('should render properly in narrow viewport', () => {
      // Mock a narrow viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should still render all sections
      expect(screen.getByText('Internasjonalisering Demo')).toBeInTheDocument();
      expect(screen.getByText('Språkvelger')).toBeInTheDocument();
      expect(screen.getByText('Formatering')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should have h2 for main title
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Internasjonalisering Demo');
      
      // Should have h3 for section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it('should have proper semantic structure', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      renderWithI18n(<I18nDemo />);
      
      // Should have buttons and form controls
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Error boundaries', () => {
    it('should handle rendering errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue(LOCALES.NO);
      
      // Mock console.error to prevent test pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Should not throw even if some parts fail
      expect(() => renderWithI18n(<I18nDemo />)).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
}); 