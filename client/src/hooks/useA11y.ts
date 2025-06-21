/**
 * Accessibility Hooks
 * 
 * Custom hooks for comprehensive accessibility support:
 * - Keyboard navigation
 * - Focus management  
 * - Screen reader announcements
 * - ARIA live regions
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Hook for managing focus trap within modal/dialog
 */
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  const focusableElementsSelector = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])',
  ].join(',');

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      focusableElementsSelector
    ) as NodeListOf<HTMLElement>;

    firstFocusableRef.current = focusableElements[0] || null;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;
  }, [focusableElementsSelector]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return;

    const { activeElement } = document;
    
    if (event.shiftKey) {
      // Shift + Tab - moving backwards
      if (activeElement === firstFocusableRef.current) {
        event.preventDefault();
        lastFocusableRef.current?.focus();
      }
    } else {
      // Tab - moving forwards
      if (activeElement === lastFocusableRef.current) {
        event.preventDefault();
        firstFocusableRef.current?.focus();
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    updateFocusableElements();
    
    // Focus first element when trap becomes active
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleKeyDown, updateFocusableElements]);

  return {
    containerRef,
    updateFocusableElements,
  };
};

/**
 * Hook for automatically focusing elements when they become visible
 */
export const useAutoFocus = <T extends HTMLElement>(
  shouldFocus: boolean = true,
  delay: number = 0
) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      const timeoutId = setTimeout(() => {
        elementRef.current?.focus();
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus, delay]);

  return elementRef;
};

/**
 * Hook for managing focus restoration after modal closes
 */
export const useFocusRestore = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
  };
};

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Hook for arrow key navigation in lists/grids
 */
export const useArrowNavigation = <T extends HTMLElement>(
  direction: 'horizontal' | 'vertical' | 'grid' = 'vertical',
  loop: boolean = true
) => {
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex^="-"])'
      )
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'grid') {
          event.preventDefault();
          nextIndex = currentIndex + 1;
          if (loop && nextIndex >= focusableElements.length) {
            nextIndex = 0;
          }
        }
        break;

      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'grid') {
          event.preventDefault();
          nextIndex = currentIndex - 1;
          if (loop && nextIndex < 0) {
            nextIndex = focusableElements.length - 1;
          }
        }
        break;

      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'grid') {
          event.preventDefault();
          nextIndex = currentIndex + 1;
          if (loop && nextIndex >= focusableElements.length) {
            nextIndex = 0;
          }
        }
        break;

      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'grid') {
          event.preventDefault();
          nextIndex = currentIndex - 1;
          if (loop && nextIndex < 0) {
            nextIndex = focusableElements.length - 1;
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        nextIndex = focusableElements.length - 1;
        break;
    }

    if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
      focusableElements[nextIndex].focus();
    }
  }, [direction, loop]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return containerRef;
};

/**
 * Hook for escape key handling
 */
export const useEscapeKey = (onEscape: () => void, isActive: boolean = true) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isActive && event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [onEscape, isActive]);
};

// ============================================================================
// SCREEN READER SUPPORT
// ============================================================================

/**
 * Hook for managing ARIA live regions
 */
export const useLiveRegion = () => {
  const [announcement, setAnnouncement] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the announcement
    setAnnouncement(message);

    // Clear announcement after a delay to allow screen readers to read it
    timeoutRef.current = setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    announcement,
    announce,
  };
};

/**
 * Hook for announcing route changes to screen readers
 */
export const useRouteAnnouncement = () => {
  const { announce } = useLiveRegion();

  const announceRouteChange = useCallback((routeName: string) => {
    announce(`Navigert til ${routeName}`, 'polite');
  }, [announce]);

  return announceRouteChange;
};

/**
 * Hook for form validation announcements
 */
export const useFormAnnouncements = () => {
  const { announce } = useLiveRegion();

  const announceError = useCallback((fieldName: string, errorMessage: string) => {
    announce(`${fieldName}: ${errorMessage}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  return {
    announceError,
    announceSuccess,
  };
};

// ============================================================================
// VISUAL INDICATORS
// ============================================================================

/**
 * Hook for managing focus-visible state
 */
export const useFocusVisible = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleMouseDown = () => setIsKeyboardUser(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isKeyboardUser;
};

/**
 * Hook for reduced motion preference
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook for high contrast preference
 */
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersHighContrast;
};

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

/**
 * Comprehensive modal accessibility hook
 */
export const useModalA11y = (isOpen: boolean, onClose: () => void) => {
  const { containerRef } = useFocusTrap(isOpen);
  const { saveFocus, restoreFocus } = useFocusRestore();
  
  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      saveFocus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      restoreFocus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, saveFocus, restoreFocus]);

  return {
    modalRef: containerRef,
  };
};

/**
 * Table accessibility hook
 */
export const useTableA11y = () => {
  const tableRef = useArrowNavigation<HTMLTableElement>('grid', false);
  const { announce } = useLiveRegion();
  
  const announceSort = useCallback((columnName: string, direction: 'asc' | 'desc') => {
    announce(`Tabellen er sortert etter ${columnName}, ${direction === 'asc' ? 'stigende' : 'synkende'}`, 'polite');
  }, [announce]);

  return {
    tableRef,
    announceSort,
  };
};

// Accessibility hooks collection
const a11yHooksCollection = {
  useFocusTrap,
  useAutoFocus,
  useFocusRestore,
  useArrowNavigation,
  useEscapeKey,
  useLiveRegion,
  useRouteAnnouncement,
  useFormAnnouncements,
  useFocusVisible,
  useReducedMotion,
  useHighContrast,
  useModalA11y,
  useTableA11y,
};

export default a11yHooksCollection; 