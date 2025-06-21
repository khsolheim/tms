/**
 * Enhanced Test Setup
 * 
 * Konfigurerer testing miljø med utilities og matchers
 * for comprehensive React komponent testing
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './__tests__/utils/test-server';

// ============================================================================
// POLYFILLS FOR MSW v2
// ============================================================================

// Polyfill for TextEncoder/TextDecoder (required by MSW v2)
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// ============================================================================
// TESTING LIBRARY CONFIGURATION
// ============================================================================

// Konfigurer testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  // Ikke vis testing-library suggestions i console
  computedStyleSupportsPseudoElements: false,
});

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock window.matchMedia (brukt av responsive komponenter)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver (brukt av komponenter som overvåker størrelse)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.IntersectionObserver (brukt av lazy loading)
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollTo for testing
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock URL constructor for testing
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// ============================================================================
// MSW SETUP
// ============================================================================

// Establish API mocking before all tests
beforeAll(() => {
  // Bare kjør server setup hvis MSW er tilgjengelig
  try {
    server?.listen({
      onUnhandledRequest: 'error',
    });
  } catch (error) {
    console.log('MSW server ikke tilgjengelig - hopper over API mocking');
  }
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  try {
    server?.resetHandlers();
  } catch (error) {
    // Ignorer hvis MSW ikke er tilgjengelig
  }
});

// Clean up after the tests are finished
afterAll(() => {
  try {
    server?.close();
  } catch (error) {
    // Ignorer hvis MSW ikke er tilgjengelig
  }
});

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

// Extend expect with custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveFocus(): R;
      toHaveValue(value: string | number): R;
      toHaveDisplayValue(value: string | string[]): R;
    }
  }
}

// Console error og warning override for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Ignorer React testing warnings som ikke er relevante
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: An invalid form control') ||
       args[0].includes('Warning: Each child in a list should have a unique "key" prop'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // Ignorer spesifikke warnings som ikke er relevante for testing
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ============================================================================
// CLEANUP
// ============================================================================

// Cleanup efter hver test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Reset document body
  document.body.innerHTML = '';
  
  // Reset document head (title, meta tags, etc.)
  document.head.innerHTML = '';
}); 