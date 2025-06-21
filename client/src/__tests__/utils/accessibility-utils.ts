/**
 * Accessibility Testing Utilities
 * 
 * Helper functions for testing accessibility compliance:
 * - Axe-core integration
 * - Keyboard navigation testing
 * - Screen reader testing
 * - Focus management testing
 */

import { RenderResult } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// AXE-CORE TESTING
// ============================================================================

/**
 * Test component for accessibility violations using axe-core
 */
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

/**
 * Test specific accessibility rules
 */
export const testAccessibilityRules = async (
  container: HTMLElement,
  rules: string[]
) => {
  const results = await axe(container, {
    rules: rules.reduce((acc, rule) => ({ ...acc, [rule]: { enabled: true } }), {}),
  });
  expect(results).toHaveNoViolations();
};

/**
 * Test color contrast
 */
export const testColorContrast = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
    },
  });
  expect(results).toHaveNoViolations();
};

// ============================================================================
// KEYBOARD NAVIGATION TESTING
// ============================================================================

/**
 * Test tab navigation through focusable elements
 */
export const testTabNavigation = async (
  container: HTMLElement,
  expectedFocusableElements: string[]
) => {
  // Start at first element
  await userEvent.tab();
  
  for (const selector of expectedFocusableElements) {
    // eslint-disable-next-line testing-library/no-node-access
    const element = container.querySelector(selector) as HTMLElement;
    expect(element).toHaveFocus();
    await userEvent.tab();
  }
};

/**
 * Test reverse tab navigation
 */
export const testShiftTabNavigation = async (
  container: HTMLElement,
  expectedFocusableElements: string[]
) => {
  // Start at last element
  // eslint-disable-next-line testing-library/no-node-access
  const lastElement = container.querySelector(
    expectedFocusableElements[expectedFocusableElements.length - 1]
  ) as HTMLElement;
  lastElement.focus();
  
  // Navigate backwards
  for (let i = expectedFocusableElements.length - 2; i >= 0; i--) {
    await userEvent.tab({ shift: true });
    // eslint-disable-next-line testing-library/no-node-access
    const element = container.querySelector(expectedFocusableElements[i]) as HTMLElement;
    expect(element).toHaveFocus();
  }
};

/**
 * Test arrow key navigation
 */
export const testArrowKeyNavigation = async (
  container: HTMLElement,
  direction: 'horizontal' | 'vertical',
  expectedElements: string[]
) => {
  // Use Testing Library methods instead of querySelector
  const firstElement = screen.getByRole('button', { name: new RegExp(expectedElements[0], 'i') });
  firstElement.focus();
  
  const key = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
  
  for (let i = 1; i < expectedElements.length; i++) {
    await userEvent.keyboard(`{${key}}`);
    const element = screen.getByRole('button', { name: new RegExp(expectedElements[i], 'i') });
    expect(element).toHaveFocus();
  }
};

/**
 * Test escape key functionality
 */
export const testEscapeKey = async (
  onEscape: jest.Mock,
  triggerElement?: HTMLElement
) => {
  if (triggerElement) {
    triggerElement.focus();
  }
  
  await userEvent.keyboard('{Escape}');
  expect(onEscape).toHaveBeenCalled();
};

/**
 * Test Enter/Space key activation
 */
export const testKeyboardActivation = async (
  element: HTMLElement,
  onActivate: jest.Mock
) => {
  element.focus();
  
  // Test Enter key
  await userEvent.keyboard('{Enter}');
  expect(onActivate).toHaveBeenCalled();
  
  onActivate.mockClear();
  
  // Test Space key (for buttons)
  if (element.tagName === 'BUTTON') {
    await userEvent.keyboard(' ');
    expect(onActivate).toHaveBeenCalled();
  }
};

// ============================================================================
// FOCUS MANAGEMENT TESTING
// ============================================================================

/**
 * Test focus trap functionality
 */
export const testFocusTrap = async (
  container: HTMLElement,
  focusableElements: string[]
) => {
  // Use Testing Library methods
  const allFocusable = screen.getAllByRole('button').concat(
    screen.getAllByRole('textbox'),
    screen.getAllByRole('combobox'),
    screen.getAllByRole('link')
  );
  
  const firstElement = allFocusable[0];
  firstElement.focus();
  expect(firstElement).toHaveFocus();
  
  // Tab to last element
  for (let i = 1; i < allFocusable.length; i++) {
    await userEvent.tab();
  }
  
  const lastElement = allFocusable[allFocusable.length - 1];
  expect(lastElement).toHaveFocus();
  
  // Tab should wrap to first element
  await userEvent.tab();
  expect(firstElement).toHaveFocus();
  
  // Shift+Tab should wrap to last element
  await userEvent.tab({ shift: true });
  expect(lastElement).toHaveFocus();
};

/**
 * Test auto-focus functionality
 */
export const testAutoFocus = (expectedElement: HTMLElement) => {
  expect(expectedElement).toHaveFocus();
};

/**
 * Test focus restoration
 */
export const testFocusRestoration = async (
  triggerElement: HTMLElement,
  modalTrigger: () => void,
  modalClose: () => void
) => {
  // Initial focus
  triggerElement.focus();
  expect(triggerElement).toHaveFocus();
  
  // Open modal
  modalTrigger();
  
  // Close modal
  modalClose();
  
  // Focus should be restored
  expect(triggerElement).toHaveFocus();
};

// ============================================================================
// ARIA TESTING
// ============================================================================

/**
 * Test ARIA labels and descriptions
 */
export const testAriaLabels = (
  element: HTMLElement,
  expectedLabel?: string,
  expectedDescription?: string
) => {
  if (expectedLabel) {
    expect(element).toHaveAccessibleName(expectedLabel);
  }
  
  if (expectedDescription) {
    expect(element).toHaveAccessibleDescription(expectedDescription);
  }
};

/**
 * Test ARIA states
 */
export const testAriaStates = (
  element: HTMLElement,
  states: Record<string, string | boolean>
) => {
  Object.entries(states).forEach(([attribute, value]) => {
    expect(element).toHaveAttribute(`aria-${attribute}`, String(value));
  });
};

/**
 * Test ARIA live regions
 */
export const testLiveRegion = async (
  liveRegion: HTMLElement,
  expectedContent: string,
  level: 'polite' | 'assertive' = 'polite'
) => {
  expect(liveRegion).toHaveAttribute('aria-live', level);
  expect(liveRegion).toHaveTextContent(expectedContent);
};

/**
 * Test landmark roles
 */
export const testLandmarks = (container: HTMLElement, expectedLandmarks: string[]) => {
  expectedLandmarks.forEach(landmark => {
    // Use Testing Library methods
    const element = screen.getByRole(landmark as any);
    expect(element).toBeInTheDocument();
  });
};

// ============================================================================
// SCREEN READER TESTING
// ============================================================================

/**
 * Test screen reader only content
 */
export const testScreenReaderContent = (
  container: HTMLElement,
  expectedContent: string
) => {
  // Use Testing Library methods
  const srElement = screen.getByText(expectedContent, { selector: '.sr-only' });
  expect(srElement).toBeInTheDocument();
  expect(srElement).toHaveTextContent(expectedContent);
};

/**
 * Test content is hidden from screen readers
 */
export const testAriaHidden = (element: HTMLElement) => {
  expect(element).toHaveAttribute('aria-hidden', 'true');
};

/**
 * Test heading hierarchy
 */
export const testHeadingHierarchy = (container: HTMLElement) => {
  // Use Testing Library methods
  const headings = screen.getAllByRole('heading');
  const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
  
  // Check that heading levels increase by at most 1
  for (let i = 1; i < headingLevels.length; i++) {
    const currentLevel = headingLevels[i];
    const previousLevel = headingLevels[i - 1];
    
    // Allow same level or increase by 1, or jump back to any previous level
    if (currentLevel > previousLevel) {
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }
  }
};

// ============================================================================
// FORM ACCESSIBILITY TESTING
// ============================================================================

/**
 * Test form field accessibility
 */
export const testFormField = (
  input: HTMLElement,
  label: HTMLElement,
  errorElement?: HTMLElement,
  helpElement?: HTMLElement
) => {
  // Test label association
  const labelFor = label.getAttribute('for');
  const inputId = input.getAttribute('id');
  expect(labelFor).toBe(inputId);
  
  // Test described by
  const describedBy = input.getAttribute('aria-describedby');
  if (errorElement || helpElement) {
    expect(describedBy).toBeTruthy();
    
    if (errorElement) {
      const errorId = errorElement.getAttribute('id');
      expect(describedBy).toContain(errorId);
    }
    
    if (helpElement) {
      const helpId = helpElement.getAttribute('id');
      expect(describedBy).toContain(helpId);
    }
  }
  
  // Test error state
  if (errorElement) {
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(errorElement).toHaveAttribute('role', 'alert');
  }
};

/**
 * Test required field indicators
 */
export const testRequiredField = (
  input: HTMLElement,
  label: HTMLElement
) => {
  expect(input).toHaveAttribute('aria-required', 'true');
  expect(label).toHaveTextContent('*');
};

/**
 * Test fieldset accessibility
 */
export const testFieldset = (
  fieldset: HTMLElement,
  legend: HTMLElement
) => {
  expect(fieldset.tagName).toBe('FIELDSET');
  expect(legend.tagName).toBe('LEGEND');
  expect(fieldset).toContainElement(legend);
};

// ============================================================================
// TABLE ACCESSIBILITY TESTING
// ============================================================================

/**
 * Test table accessibility
 */
export const testTable = (table: HTMLElement) => {
  // Use Testing Library methods for table elements
  const tableElement = screen.getByRole('table');
  expect(tableElement).toBeInTheDocument();
  
  // Check for table headers
  const headers = screen.getAllByRole('columnheader');
  expect(headers.length).toBeGreaterThan(0);
  
  // Check for table rows
  const rows = screen.getAllByRole('row');
  expect(rows.length).toBeGreaterThan(0);
};

/**
 * Test table caption
 */
export const testTableCaption = (
  table: HTMLElement,
  expectedCaption: string
) => {
  // Use Testing Library methods
  const caption = screen.getByText(expectedCaption);
  expect(caption).toBeInTheDocument();
  expect(caption.tagName.toLowerCase()).toBe('caption');
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Wait for accessibility announcements
 */
export const waitForAnnouncement = async (timeout = 1000) => {
  await new Promise(resolve => setTimeout(resolve, timeout));
};

/**
 * Test component with multiple accessibility checks
 */
export const runFullAccessibilityTest = async (
  renderResult: RenderResult,
  options: {
    skipAxe?: boolean;
    skipKeyboard?: boolean;
    expectedFocusableElements?: string[];
    expectedLandmarks?: string[];
  } = {}
) => {
  const { container } = renderResult;
  
  // Axe-core testing
  if (!options.skipAxe) {
    await testAccessibility(container);
  }
  
  // Keyboard navigation testing
  if (!options.skipKeyboard && options.expectedFocusableElements) {
    await testTabNavigation(container, options.expectedFocusableElements);
  }
  
  // Landmark testing
  if (options.expectedLandmarks) {
    testLandmarks(container, options.expectedLandmarks);
  }
  
  // Heading hierarchy
  testHeadingHierarchy(container);
};

const a11yTestUtils = {
  testAccessibility,
  testAccessibilityRules,
  testColorContrast,
  testTabNavigation,
  testShiftTabNavigation,
  testArrowKeyNavigation,
  testEscapeKey,
  testKeyboardActivation,
  testFocusTrap,
  testAutoFocus,
  testFocusRestoration,
  testAriaLabels,
  testAriaStates,
  testLiveRegion,
  testLandmarks,
  testScreenReaderContent,
  testAriaHidden,
  testHeadingHierarchy,
  testFormField,
  testRequiredField,
  testFieldset,
  testTable,
  testTableCaption,
  waitForAnnouncement,
  runFullAccessibilityTest,
};

export default a11yTestUtils; 