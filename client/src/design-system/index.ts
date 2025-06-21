/**
 * TMS Design System
 * 
 * Sentral eksport for alle design system komponenter og tokens
 */

// ============================================================================
// TOKENS
// ============================================================================

import tokensImport, { colors, spacing, typography, borderRadius, boxShadow, animation, breakpoints, zIndex, components } from './tokens';

export { tokensImport as tokens, colors, spacing, typography, borderRadius, boxShadow, animation, breakpoints, zIndex, components };

// ============================================================================
// COMPONENTS
// ============================================================================

// Button components
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  DestructiveButton,
  type ButtonProps
} from './components/Button';

// Card components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
  type CardFooterProps
} from './components/Card';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  cn,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateId,
  debounce,
  throttle,
  isEmpty,
  capitalize,
  camelToKebab,
  kebabToCamel,
  stripHtml,
  truncate,
  sortBy,
  groupBy
} from '../lib/utils';

// ============================================================================
// DESIGN SYSTEM METADATA
// ============================================================================

export const designSystemVersion = '1.0.0';

export const designSystemInfo = {
  name: 'TMS Design System',
  version: designSystemVersion,
  description: 'Komponentbibliotek og design tokens for TMS (Training Management System)',
  author: 'TMS Team',
  license: 'MIT'
};

// ============================================================================
// THEME CONTEXT (for future use)
// ============================================================================

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
}

// Default theme configuration
export const defaultTheme = {
  theme: 'light' as const,
  colors,
  spacing,
  typography,
  borderRadius,
  boxShadow,
  animation,
  breakpoints,
  zIndex,
  components
};

// ============================================================================
// COMPONENT COMPOSITION HELPERS
// ============================================================================

/**
 * Helper for creating consistent spacing
 */
export const getSpacing = (size: keyof typeof spacing) => spacing[size];

/**
 * Helper for creating consistent colors
 */
export const getColor = (color: string, shade?: number) => {
  const colorPath = color.split('.');
  let result: any = colors;
  
  for (const path of colorPath) {
    result = result[path];
    if (!result) return undefined;
  }
  
  if (shade && typeof result === 'object') {
    return result[shade];
  }
  
  return result;
};

/**
 * Helper for creating consistent typography
 */
export const getTypography = (property: keyof typeof typography, key: string) => {
  return typography[property][key as keyof typeof typography[typeof property]];
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates if a color exists in the design system
 */
export const isValidColor = (color: string): boolean => {
  try {
    return getColor(color) !== undefined;
  } catch {
    return false;
  }
};

/**
 * Validates if a spacing value exists in the design system
 */
export const isValidSpacing = (space: string): boolean => {
  return space in spacing;
};

/**
 * Gets all available color variants for a given color family
 */
export const getColorVariants = (colorFamily: string) => {
  const color = colors[colorFamily as keyof typeof colors];
  if (typeof color === 'object' && color !== null) {
    return Object.keys(color);
  }
  return [];
};

// ============================================================================
// RESPONSIVE HELPERS
// ============================================================================

/**
 * Helper for creating responsive breakpoint classes
 */
export const createResponsiveClasses = (
  baseClass: string,
  breakpointClasses: Partial<Record<keyof typeof breakpoints, string>>
) => {
  const classes = [baseClass];
  
  Object.entries(breakpointClasses).forEach(([breakpoint, className]) => {
    if (className) {
      classes.push(`${breakpoint}:${className}`);
    }
  });
  
  return classes.join(' ');
};

/**
 * Media query helper for styled-components or custom CSS
 */
export const mediaQuery = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
};

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * ARIA helpers for consistent accessibility
 */
export const aria = {
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  disabled: (disabled: boolean) => ({ 'aria-disabled': disabled }),
  hidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
  current: (current: string) => ({ 'aria-current': current }),
  live: (level: 'polite' | 'assertive' | 'off') => ({ 'aria-live': level })
};

/**
 * Focus management helpers
 */
export const focusHelpers = {
  focusVisible: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  focusWithin: 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md'
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const animationPresets = {
  fadeIn: 'animate-[fadeIn_0.3s_ease-out_forwards]',
  fadeOut: 'animate-[fadeOut_0.3s_ease-out_forwards]',
  slideUp: 'animate-[slideUp_0.3s_ease-out_forwards]',
  slideDown: 'animate-[slideDown_0.3s_ease-out_forwards]',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce'
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const designSystemExports = {
  tokens: tokensImport,
  components: { /* Button, Card */ },
  // utilities: { cn, formatNumber, formatCurrency, formatDate },
  theme: defaultTheme,
  helpers: { getSpacing, getColor, getTypography },
  validation: { isValidColor, isValidSpacing },
  responsive: { createResponsiveClasses, mediaQuery },
  accessibility: { aria, focusHelpers },
  animations: animationPresets,
  info: designSystemInfo
};

export default designSystemExports; 