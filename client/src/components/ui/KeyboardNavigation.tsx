import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// SKIP LINKS COMPONENT
// ============================================================================

interface SkipLink {
  id: string;
  label: string;
  target: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = [
    { id: 'skip-main', label: 'Gå til hovedinnhold', target: '#main-content' },
    { id: 'skip-nav', label: 'Gå til navigasjon', target: '#main-navigation' },
    { id: 'skip-search', label: 'Gå til søk', target: '#search' },
  ]
}) => {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-2 py-1 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg">
      <nav aria-label="Hopp til hovedseksjoner">
        <ul className="flex flex-col space-y-6">
          {links.map((link) => (
            <li key={link.id}>
              <a 
                href={link.target}
                className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:rounded"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector(link.target);
                  if (target) {
                    (target as HTMLElement).focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// ============================================================================
// FOCUS TRAP COMPONENT
// ============================================================================

interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active, 
  restoreFocus = true,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Lagre forrige aktive element
    previousActiveElement.current = document.activeElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger escape event that parent can listen to
        container.dispatchEvent(new CustomEvent('focustrap:escape'));
      }
    };

    // Fokuser første element
    firstElement?.focus();

    // Legg til event listeners
    container.addEventListener('keydown', handleTab);
    container.addEventListener('keydown', handleEscape);

    return () => {
      container.removeEventListener('keydown', handleTab);
      container.removeEventListener('keydown', handleEscape);

      // Gjenopprett fokus
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [active, restoreFocus]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
};

// ============================================================================
// KEYBOARD NAVIGATION HELPERS
// ============================================================================

/**
 * Hook for managing roving tabindex in lists/grids
 */
export const useRovingTabIndex = (itemCount: number) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(itemCount - 1);
        break;
    }
  };

  useEffect(() => {
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    tabIndex: index === activeIndex ? 0 : -1,
    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
    onFocus: () => setActiveIndex(index),
  });

  return { activeIndex, getItemProps };
};

// ============================================================================
// ACCESSIBLE BUTTON COMPONENT
// ============================================================================

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Laster...',
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-md
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2" aria-hidden="true">{leftIcon}</span>}
      <span>{loading ? loadingText : children}</span>
      {!loading && rightIcon && <span className="ml-2" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
};

// ============================================================================
// ACCESSIBLE DROPDOWN MENU
// ============================================================================

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface AccessibleDropdownProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  label: string;
  className?: string;
}

export const AccessibleDropdown: React.FC<AccessibleDropdownProps> = ({
  trigger,
  items,
  label,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeIndex, getItemProps } = useRovingTabIndex(items.length);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.href) {
      window.location.href = item.href;
    } else if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={label}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
      >
        {trigger}
      </button>

      {isOpen && (
        <FocusTrap 
          active={isOpen}
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="dropdown-menu"
            className="py-1"
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                {...getItemProps(index)}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                role="menuitem"
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center
                  hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${index === activeIndex ? 'bg-gray-100' : ''}
                `}
              >
                {item.icon && <span className="mr-3" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </FocusTrap>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// ============================================================================
// LIVE REGION FOR ANNOUNCEMENTS
// ============================================================================

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  atomic = true,
  className = '',
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  );
};

// ============================================================================
// ACCESSIBLE FORM SECTION
// ============================================================================

interface AccessibleFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const AccessibleFormSection: React.FC<AccessibleFormSectionProps> = ({
  title,
  description,
  children,
  required = false,
  className = '',
}) => {
  const sectionId = `form-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const descriptionId = description ? `${sectionId}-description` : undefined;

  return (
    <fieldset className={`border-0 p-0 m-0 ${className}`}>
      <legend className="text-lg font-medium text-gray-900 mb-2">
        {title}
        {required && (
          <span className="text-red-500 ml-1" aria-label="påkrevd">
            *
          </span>
        )}
      </legend>
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 mb-4">
          {description}
        </p>
      )}
      <div aria-describedby={descriptionId}>
        {children}
      </div>
    </fieldset>
  );
}; 