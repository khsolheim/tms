/**
 * Accessibility Components
 * 
 * Reusable components for comprehensive accessibility support:
 * - Screen reader only content
 * - ARIA live regions
 * - Skip links
 * - Accessible landmarks
 */

import React, { forwardRef, HTMLProps, ReactNode } from 'react';
import { useLiveRegion } from '../../hooks/useA11y';

// ============================================================================
// SCREEN READER COMPONENTS
// ============================================================================

/**
 * Content that is only visible to screen readers
 */
interface ScreenReaderOnlyProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  as: Component = 'span' 
}) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

/**
 * ARIA live region for announcements
 */
interface LiveRegionProps {
  level?: 'polite' | 'assertive';
  children?: ReactNode;
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  level = 'polite', 
  children,
  className = ''
}) => {
  return (
    <div 
      aria-live={level}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Global announcement component using live regions
 */
export const GlobalAnnouncements: React.FC = () => {
  const { announcement } = useLiveRegion();
  
  return (
    <LiveRegion level="polite" aria-label="Globale kunngjøringer">
      {announcement}
    </LiveRegion>
  );
};

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

/**
 * Skip links for keyboard navigation
 */
interface SkipLinkProps {
  href: string;
  children: ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="skip-link absolute -top-10 left-4 z-50 bg-blue-600 text-white px-2 py-1 rounded-md focus:topx-2 py-1 transition-all duration-200"
      onFocus={(e) => e.currentTarget.style.transform = 'translateY(44px)'}
      onBlur={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {children}
    </a>
  );
};

/**
 * Skip navigation container
 */
export const SkipNavigation: React.FC = () => {
  return (
    <nav aria-label="Hopp til innhold">
      <SkipLink href="#main-content">
        Hopp til hovedinnhold
      </SkipLink>
      <SkipLink href="#main-navigation">
        Hopp til hovednavigasjon
      </SkipLink>
      <SkipLink href="#main-search">
        Hopp til søk
      </SkipLink>
    </nav>
  );
};

// ============================================================================
// LANDMARK COMPONENTS
// ============================================================================

/**
 * Main content landmark
 */
interface MainContentProps extends HTMLProps<HTMLElement> {
  children: ReactNode;
}

export const MainContent = forwardRef<HTMLElement, MainContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <main
        ref={ref}
        id="main-content"
        className={className}
        role="main"
        aria-label="Hovedinnhold"
        {...props}
      >
        {children}
      </main>
    );
  }
);

/**
 * Navigation landmark
 */
interface NavigationProps extends HTMLProps<HTMLElement> {
  children: ReactNode;
  label?: string;
}

export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ children, label = 'Hovednavigasjon', className = '', ...props }, ref) => {
    return (
      <nav
        ref={ref}
        id="main-navigation"
        className={className}
        aria-label={label}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

/**
 * Search landmark
 */
interface SearchLandmarkProps extends HTMLProps<HTMLElement> {
  children: ReactNode;
}

export const SearchLandmark = forwardRef<HTMLDivElement, SearchLandmarkProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        id="main-search"
        className={className}
        role="search"
        aria-label="Søk"
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * Complementary content (sidebar)
 */
interface ComplementaryProps extends HTMLProps<HTMLElement> {
  children: ReactNode;
  label?: string;
}

export const Complementary = forwardRef<HTMLElement, ComplementaryProps>(
  ({ children, label = 'Tilleggsinnhold', className = '', ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={className}
        aria-label={label}
        {...props}
      >
        {children}
      </aside>
    );
  }
);

// ============================================================================
// HEADING COMPONENTS
// ============================================================================

/**
 * Page heading with proper hierarchy
 */
interface PageHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({ 
  level, 
  children, 
  className = '',
  id 
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Component 
      id={id}
      className={`heading-${level} ${className}`}
      tabIndex={-1} // Allow programmatic focus for skip links
    >
      {children}
    </Component>
  );
};

/**
 * Section heading with automatic level management
 */
interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
  id?: string;
  level?: 2 | 3 | 4 | 5 | 6; // Section headings start at h2
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  children, 
  className = '',
  id,
  level = 2
}) => {
  return (
    <PageHeading level={level} className={className} id={id}>
      {children}
    </PageHeading>
  );
};

// ============================================================================
// FORM COMPONENTS
// ============================================================================

/**
 * Accessible form field with proper labeling
 */
interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  help?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  children,
  error,
  help,
  required = false,
  className = ''
}) => {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-field ${className} ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="påkrevd">
            *
          </span>
        )}
      </label>
      
      <div className="form-input-wrapper">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': describedBy,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required,
        })}
      </div>

      {help && (
        <div id={helpId} className="form-help text-sm text-gray-600 mt-1">
          {help}
        </div>
      )}

      {error && (
        <div 
          id={errorId} 
          className="form-error text-sm text-red-600 mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Accessible fieldset for grouping form controls
 */
interface FieldsetProps {
  legend: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  legend,
  children,
  className = '',
  required = false
}) => {
  return (
    <fieldset className={`fieldset ${className}`} aria-required={required}>
      <legend className="fieldset-legend">
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="påkrevd">
            *
          </span>
        )}
      </legend>
      {children}
    </fieldset>
  );
};

// ============================================================================
// STATUS AND FEEDBACK COMPONENTS
// ============================================================================

/**
 * Status message component
 */
interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  children,
  className = '',
  dismissible = false,
  onDismiss
}) => {
  const baseClasses = 'status-message p-4 rounded-md border';
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const statusIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        <span className="status-icon mr-2" aria-hidden="true">
          {statusIcons[type]}
        </span>
        <div className="flex-1">
          <ScreenReaderOnly>
            {type === 'success' && 'Suksess: '}
            {type === 'error' && 'Feil: '}
            {type === 'warning' && 'Advarsel: '}
            {type === 'info' && 'Informasjon: '}
          </ScreenReaderOnly>
          {children}
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            className="ml-2 text-current hover:opacity-75"
            onClick={onDismiss}
            aria-label="Lukk melding"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Loading state with proper announcements
 */
interface LoadingStateProps {
  children?: ReactNode;
  text?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  children,
  text = 'Laster...',
  className = ''
}) => {
  return (
    <div 
      className={`loading-state ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <ScreenReaderOnly>{text}</ScreenReaderOnly>
      {children || (
        <div className="flex items-center justify-center px-2 py-1">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" aria-hidden="true"></div>
          <span className="ml-2">{text}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Focus trap boundary for modals/dialogs
 */
interface FocusTrapProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>(
  ({ children, className = '', as = 'div' }, ref) => {
    if (as === 'div') {
      return (
        <div
          ref={ref}
          className={className}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      );
    }
    
    const Component = as;
    return (
      <Component
        className={className}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </Component>
    );
  }
);

/**
 * Visually hidden but screen reader accessible element
 */
interface VisuallyHiddenProps extends HTMLProps<HTMLSpanElement> {
  children: ReactNode;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <span 
      className={`sr-only ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

const AccessibilityComponents = {
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
};

export default AccessibilityComponents; 