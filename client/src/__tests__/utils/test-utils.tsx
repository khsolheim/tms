/**
 * Test Utilities
 * 
 * Comprehensive utilities for testing React komponenter
 * med providers, mocks og helper functions
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

// ============================================================================
// TYPES
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withRouter?: boolean;
}

interface TestWrapperProps {
  children: React.ReactNode;
  initialEntries?: string[];
}

// ============================================================================
// TEST WRAPPERS
// ============================================================================

/**
 * Test wrapper som gir alle nødvendige providers
 */
const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  initialEntries = ['/'] 
}) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Enhanced render function med automatisk provider wrapping
 */
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): ReturnType<typeof render> & { user: typeof userEvent } {
  const {
    initialEntries = ['/'],
    withRouter = true,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withRouter) {
      return (
        <TestWrapper initialEntries={initialEntries}>
          {children}
        </TestWrapper>
      );
    }
    return <>{children}</>;
  };

  return {
    user: userEvent,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Render kun komponenten uten providers (for unit testing)
 */
export function renderWithoutProviders(
  ui: ReactElement,
  options?: RenderOptions
): ReturnType<typeof render> & { user: typeof userEvent } {
  return {
    user: userEvent,
    ...render(ui, options),
  };
}

// ============================================================================
// MOCK FUNCTIONS
// ============================================================================

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(),
  };
})();

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(),
  };
})();

/**
 * Mock file for file upload testing
 */
export const createMockFile = (
  name: string = 'test-file.pdf',
  size: number = 1024,
  type: string = 'application/pdf'
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Wait for element to be removed from DOM
 */
export const waitForElementToBeRemoved = async (
  element: HTMLElement | null,
  timeout: number = 1000
): Promise<void> => {
  if (!element) return;
  
  // Use Testing Library's waitFor instead of direct DOM access
  return waitFor(
    () => {
      expect(element).not.toBeInTheDocument();
    },
    { timeout }
  );
};

/**
 * Check hvis en komponent har rendered uten errors
 */
export const expectNoErrors = (): void => {
  const errorElements = screen.queryAllByTestId(/error/);
  expect(errorElements).toHaveLength(0);
};

/**
 * Check om en form er valid
 */
export const expectFormToBeValid = (form: HTMLFormElement): void => {
  expect(form.checkValidity()).toBe(true);
};

/**
 * Check om en form er invalid
 */
export const expectFormToBeInvalid = (form: HTMLFormElement): void => {
  expect(form.checkValidity()).toBe(false);
};

// ============================================================================
// FORM TESTING HELPERS
// ============================================================================

/**
 * Fill out en form med data
 */
export const fillForm = async (
  user: typeof userEvent,
  formData: Record<string, string>
): Promise<void> => {
  for (const [fieldName, value] of Object.entries(formData)) {
    try {
      const field = screen.getByDisplayValue('') || screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') });
      await user.clear(field);
      await user.type(field, value);
    } catch {
      // Field not found, skip
      console.warn(`Field with name "${fieldName}" not found`);
    }
  }
};

/**
 * Submit en form
 */
export const submitForm = async (
  user: typeof userEvent,
  formOrSubmitButton: HTMLFormElement | HTMLButtonElement
): Promise<void> => {
  if (formOrSubmitButton.tagName === 'FORM') {
    try {
      const submitButton = screen.getByRole('button', { name: /submit/i }) || 
                          screen.getByRole('button', { name: /lagre/i }) ||
                          screen.getByRole('button', { name: /send/i });
      await user.click(submitButton);
    } catch {
      console.warn('Submit button not found in form');
    }
  } else {
    await user.click(formOrSubmitButton);
  }
};

// ============================================================================
// DATA MOCKING
// ============================================================================

/**
 * Mock data for testing
 */
export const mockData = {
  ansatt: {
    id: 1,
    fornavn: 'Test',
    etternavn: 'Bruker',
    epost: 'test@eksempel.no',
    telefon: '12345678',
    bedriftId: 1,
    rolle: 'ANSATT',
    aktiv: true,
  },
  bedrift: {
    id: 1,
    navn: 'Test Bedrift AS',
    orgnr: '123456789',
    adresse: 'Testveien 1',
    postnr: '0001',
    poststed: 'Oslo',
    telefon: '22334455',
    epost: 'kontakt@testbedrift.no',
    aktiv: true,
  },
  kontrakt: {
    id: 1,
    navn: 'Test Kontrakt',
    beskrivelse: 'Test beskrivelse',
    startDato: '2025-01-01',
    sluttDato: '2025-12-31',
    bedriftId: 1,
    status: 'AKTIV',
  },
};

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
export { userEvent }; 