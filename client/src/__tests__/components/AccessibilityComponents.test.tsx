/**
 * Accessibility Components Tests
 * 
 * Test suite for comprehensive accessibility compliance:
 * - Screen reader support
 * - Keyboard navigation
 * - ARIA compliance
 * - Focus management
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ScreenReaderOnly,
  LiveRegion,
  GlobalAnnouncements,
  SkipLink,
  SkipNavigation,
  MainContent,
  Navigation,
  SearchLandmark,
  Complementary,
  PageHeading,
  SectionHeading,
  FormField,
  Fieldset,
  StatusMessage,
  LoadingState,
  FocusTrap,
  VisuallyHidden,
} from '../../components/ui/AccessibilityComponents';

// Mock hooks
jest.mock('../../hooks/useA11y', () => ({
  useLiveRegion: () => ({
    announcement: 'Test announcement',
    announce: jest.fn(),
  }),
}));

describe('Accessibility Components', () => {

  // ============================================================================
  // SCREEN READER COMPONENTS
  // ============================================================================

  describe('ScreenReaderOnly', () => {
    test('rendrer innhold som kun er synlig for skjermlesere', () => {
      render(<ScreenReaderOnly>Kun for skjermlesere</ScreenReaderOnly>);
      
      const element = screen.getByText('Kun for skjermlesere');
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass('sr-only');
    });

    test('støtter forskjellige HTML elementer', () => {
      render(<ScreenReaderOnly as="h2">Skjult overskrift</ScreenReaderOnly>);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Skjult overskrift');
      expect(heading).toHaveClass('sr-only');
    });
  });

  describe('LiveRegion', () => {
    test('oppretter ARIA live region med riktige attributter', () => {
      render(
        <LiveRegion level="assertive">
          Viktig melding
        </LiveRegion>
      );
      
      const liveRegion = screen.getByText('Viktig melding');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveClass('sr-only');
    });

    test('bruker polite som standard', () => {
      render(<LiveRegion>Normal melding</LiveRegion>);
      
      const liveRegion = screen.getByText('Normal melding');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('GlobalAnnouncements', () => {
    test('viser globale kunngjøringer', () => {
      render(<GlobalAnnouncements />);
      
      const announcement = screen.getByText('Test announcement');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });
  });

  // ============================================================================
  // NAVIGATION COMPONENTS
  // ============================================================================

  describe('SkipLink', () => {
    test('oppretter tilgjengelig skip link', () => {
      render(<SkipLink href="#main-content">Hopp til innhold</SkipLink>);
      
      const skipLink = screen.getByRole('link', { name: 'Hopp til innhold' });
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveClass('skip-link');
    });
  });

  describe('SkipNavigation', () => {
    test('inneholder alle nødvendige skip links', () => {
      render(<SkipNavigation />);
      
      expect(screen.getByRole('link', { name: 'Hopp til hovedinnhold' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Hopp til hovednavigasjon' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Hopp til søk' })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // LANDMARK COMPONENTS
  // ============================================================================

  describe('MainContent', () => {
    test('oppretter main landmark med riktige attributter', () => {
      render(
        <MainContent>
          <h1>Hovedinnhold</h1>
          <p>Dette er hovedinnholdet på siden.</p>
        </MainContent>
      );
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('aria-label', 'Hovedinnhold');
      expect(main).toContainElement(screen.getByRole('heading', { level: 1 }));
    });
  });

  describe('Navigation', () => {
    test('oppretter nav landmark', () => {
      render(
        <Navigation>
          <ul>
            <li><a href="/hjem">Hjem</a></li>
            <li><a href="/om">Om oss</a></li>
          </ul>
        </Navigation>
      );
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('id', 'main-navigation');
      expect(nav).toHaveAttribute('aria-label', 'Hovednavigasjon');
    });

    test('støtter egendefinert label', () => {
      render(
        <Navigation label="Sidenavigasjon">
          <a href="/side">Side</a>
        </Navigation>
      );
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Sidenavigasjon');
    });
  });

  describe('SearchLandmark', () => {
    test('oppretter search landmark', () => {
      render(
        <SearchLandmark>
          <input type="search" placeholder="Søk..." />
          <button type="submit">Søk</button>
        </SearchLandmark>
      );
      
      const search = screen.getByRole('search');
      expect(search).toHaveAttribute('id', 'main-search');
      expect(search).toHaveAttribute('aria-label', 'Søk');
    });
  });

  describe('Complementary', () => {
    test('oppretter complementary landmark', () => {
      render(
        <Complementary>
          <h2>Sidebar</h2>
          <p>Tilleggsinnhold</p>
        </Complementary>
      );
      
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveAttribute('aria-label', 'Tilleggsinnhold');
    });
  });

  // ============================================================================
  // HEADING COMPONENTS
  // ============================================================================

  describe('PageHeading', () => {
    test('oppretter overskrift med riktig nivå', () => {
      render(<PageHeading level={1}>Sidetittel</PageHeading>);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Sidetittel');
      expect(heading).toHaveAttribute('tabIndex', '-1');
    });

    test('støtter ID for skip links', () => {
      render(<PageHeading level={2} id="section-heading">Seksjon</PageHeading>);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'section-heading');
    });
  });

  describe('SectionHeading', () => {
    test('bruker h2 som standard', () => {
      render(<SectionHeading>Seksjonstittel</SectionHeading>);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Seksjonstittel');
    });

    test('støtter egendefinert nivå', () => {
      render(<SectionHeading level={3}>Underseksjon</SectionHeading>);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Underseksjon');
    });
  });

  // ============================================================================
  // FORM COMPONENTS
  // ============================================================================

  describe('FormField', () => {
    test('kobler label og input korrekt', () => {
      render(
        <FormField id="test-input" label="Test felt">
          <input type="text" />
        </FormField>
      );
      
      const input = screen.getByLabelText('Test felt');
      const label = screen.getByText('Test felt');
      
      expect(input).toHaveAttribute('id', 'test-input');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    test('viser required indikator', () => {
      render(
        <FormField id="required-input" label="Påkrevd felt" required>
          <input type="text" />
        </FormField>
      );
      
      const input = screen.getByLabelText(/Påkrevd felt/);
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('*')).toHaveAttribute('aria-label', 'påkrevd');
    });

    test('håndterer hjelpetekst', () => {
      render(
        <FormField id="help-input" label="Felt med hjelp" help="Dette er hjelpetekst">
          <input type="text" />
        </FormField>
      );
      
      const input = screen.getByLabelText('Felt med hjelp');
      const helpText = screen.getByText('Dette er hjelpetekst');
      
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('help-input-help'));
      expect(helpText).toHaveAttribute('id', 'help-input-help');
    });

    test('håndterer feilmeldinger', () => {
      render(
        <FormField id="error-input" label="Felt med feil" error="Dette er en feil">
          <input type="text" />
        </FormField>
      );
      
      const input = screen.getByLabelText('Felt med feil');
      const errorMessage = screen.getByText('Dette er en feil');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error-input-error'));
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Fieldset', () => {
    test('oppretter tilgjengelig fieldset', () => {
      render(
        <Fieldset legend="Personlige opplysninger">
          <input type="text" placeholder="Fornavn" />
          <input type="text" placeholder="Etternavn" />
        </Fieldset>
      );
      
      const fieldset = screen.getByRole('group', { name: 'Personlige opplysninger' });
      const legend = screen.getByText('Personlige opplysninger');
      
      expect(fieldset.tagName).toBe('FIELDSET');
      expect(legend.tagName).toBe('LEGEND');
    });

    test('viser required indikator for fieldset', () => {
      render(
        <Fieldset legend="Påkrevd gruppe" required>
          <input type="text" />
        </Fieldset>
      );
      
      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('*')).toHaveAttribute('aria-label', 'påkrevd');
    });
  });

  // ============================================================================
  // STATUS COMPONENTS
  // ============================================================================

  describe('StatusMessage', () => {
    test('viser suksessmelding med riktige roller', () => {
      render(
        <StatusMessage type="success">
          Operasjonen var vellykket!
        </StatusMessage>
      );
      
      const message = screen.getByRole('status');
      expect(message).toHaveAttribute('aria-live', 'polite');
      expect(message).toContainElement(screen.getByText('Operasjonen var vellykket!'));
    });

    test('viser feilmelding som alert', () => {
      render(
        <StatusMessage type="error">
          En feil oppstod!
        </StatusMessage>
      );
      
      const message = screen.getByRole('alert');
      expect(message).toHaveAttribute('aria-live', 'assertive');
    });

    test('støtter dismissible meldinger', async () => {
      const handleDismiss = jest.fn();
      const user = userEvent.setup();
      
      render(
        <StatusMessage type="info" dismissible onDismiss={handleDismiss}>
          Informasjonsmelding
        </StatusMessage>
      );
      
      const dismissButton = screen.getByRole('button', { name: 'Lukk melding' });
      await user.click(dismissButton);
      
      expect(handleDismiss).toHaveBeenCalled();
    });
  });

  describe('LoadingState', () => {
    test('viser loading state med riktige attributter', () => {
      render(<LoadingState text="Laster data..." />);
      
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      expect(loadingElement).toHaveAttribute('aria-label', 'Laster data...');
    });

    test('bruker standard tekst', () => {
      render(<LoadingState />);
      
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-label', 'Laster...');
    });
  });

  // ============================================================================
  // UTILITY COMPONENTS
  // ============================================================================

  describe('FocusTrap', () => {
    test('oppretter dialog med riktige attributter', () => {
      render(
        <FocusTrap>
          <h2>Dialog innhold</h2>
          <button>Lukk</button>
        </FocusTrap>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toContainElement(screen.getByRole('heading', { level: 2 }));
    });
  });

  describe('VisuallyHidden', () => {
    test('skjuler innhold visuelt men bevarer tilgjengelighet', () => {
      render(
        <VisuallyHidden>
          Skjult for øyne, men tilgjengelig for skjermlesere
        </VisuallyHidden>
      );
      
      const hiddenElement = screen.getByText('Skjult for øyne, men tilgjengelig for skjermlesere');
      expect(hiddenElement).toHaveClass('sr-only');
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================================================

  describe('Keyboard Navigation', () => {
    test('skip links er tilgjengelige med keyboard', async () => {
      const user = userEvent.setup();
      
      render(<SkipNavigation />);
      
      // Tab to first skip link
      await user.tab();
      
      const skipLink = screen.getByRole('link', { name: 'Hopp til hovedinnhold' });
      expect(skipLink).toHaveFocus();
    });

    test('form fields er navigerbare med keyboard', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <FormField id="field1" label="Felt 1">
            <input type="text" />
          </FormField>
          <FormField id="field2" label="Felt 2">
            <input type="text" />
          </FormField>
          <button type="submit">Send inn</button>
        </form>
      );
      
      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText('Felt 1')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Felt 2')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Send inn' })).toHaveFocus();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration', () => {
    test('komplett side med alle landmarks fungerer sammen', () => {
      render(
        <div>
          <SkipNavigation />
          <Navigation>
            <a href="/hjem">Hjem</a>
          </Navigation>
          <MainContent>
            <PageHeading level={1}>Sidetittel</PageHeading>
            <SearchLandmark>
              <input type="search" />
            </SearchLandmark>
            <SectionHeading>Innholdsseksjon</SectionHeading>
            <p>Hovedinnhold</p>
          </MainContent>
          <Complementary>
            <SectionHeading level={3}>Sidebar</SectionHeading>
            <p>Tilleggsinnhold</p>
          </Complementary>
          <GlobalAnnouncements />
        </div>
      );
      
      // Test at alle landmarks er tilstede
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      
      // Test heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });
}); 