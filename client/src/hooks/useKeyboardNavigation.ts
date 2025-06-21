import { useEffect, useRef, useCallback, useState } from 'react';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  loop?: boolean;
  focusOnMount?: boolean;
  autoFocus?: boolean;
  direction?: 'horizontal' | 'vertical' | 'both';
  selector?: string;
  onEscape?: () => void;
  onEnter?: (element: HTMLElement) => void;
  onNavigate?: (element: HTMLElement, index: number) => void;
}

export interface FocusableElement extends HTMLElement {
  dataset: DOMStringMap & {
    focusIndex?: string;
    skipFocus?: string;
  };
}

// Hook for basic keyboard navigation within a container
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enabled = true,
    loop = true,
    focusOnMount = false,
    autoFocus = false,
    direction = 'both',
    selector = '[data-keyboard-nav]:not([disabled]):not([aria-disabled="true"])',
    onEscape,
    onEnter,
    onNavigate
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [elements, setElements] = useState<FocusableElement[]>([]);

  // Get focusable elements within container
  const updateElements = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(selector)
    ) as FocusableElement[];
    
    setElements(focusableElements);
    
    // Auto focus first element if requested
    if (autoFocus && focusableElements.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      focusableElements[0].focus();
    }
  }, [selector, autoFocus, currentIndex]);

  // Focus element by index
  const focusElement = useCallback((index: number) => {
    if (index >= 0 && index < elements.length) {
      setCurrentIndex(index);
      elements[index].focus();
      onNavigate?.(elements[index], index);
    }
  }, [elements, onNavigate]);

  // Navigate to next/previous element
  const navigate = useCallback((delta: number) => {
    if (elements.length === 0) return;
    
    let newIndex = currentIndex + delta;
    
    if (loop) {
      newIndex = ((newIndex % elements.length) + elements.length) % elements.length;
    } else {
      newIndex = Math.max(0, Math.min(elements.length - 1, newIndex));
    }
    
    focusElement(newIndex);
  }, [currentIndex, elements.length, loop, focusElement]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || elements.length === 0) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;
    
    // Handle escape
    if (key === 'Escape') {
      onEscape?.();
      return;
    }
    
    // Handle enter/space
    if ((key === 'Enter' || key === ' ') && currentIndex >= 0) {
      event.preventDefault();
      onEnter?.(elements[currentIndex]);
      return;
    }
    
    // Handle navigation keys
    let handled = false;
    
    switch (key) {
      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'both') {
          navigate(-1);
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'both') {
          navigate(1);
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'both') {
          navigate(shiftKey ? -5 : -1);
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'both') {
          navigate(shiftKey ? 5 : 1);
          handled = true;
        }
        break;
      case 'Home':
        if (ctrlKey || metaKey) {
          focusElement(0);
          handled = true;
        }
        break;
      case 'End':
        if (ctrlKey || metaKey) {
          focusElement(elements.length - 1);
          handled = true;
        }
        break;
      case 'PageUp':
        navigate(-10);
        handled = true;
        break;
      case 'PageDown':
        navigate(10);
        handled = true;
        break;
    }
    
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [enabled, elements, currentIndex, direction, navigate, focusElement, onEscape, onEnter]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    updateElements();
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Update elements when DOM changes
    const observer = new MutationObserver(updateElements);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'data-keyboard-nav']
    });
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [enabled, handleKeyDown, updateElements]);

  // Focus on mount if requested
  useEffect(() => {
    if (focusOnMount && elements.length > 0) {
      focusElement(0);
    }
  }, [focusOnMount, elements.length, focusElement]);

  return {
    containerRef,
    currentIndex,
    elements,
    focusElement,
    navigate,
    updateElements
  };
}