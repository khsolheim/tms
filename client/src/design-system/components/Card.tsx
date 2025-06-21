/**
 * Card Component
 * 
 * Fleksibel kort-komponent for innhold med forskjellige varianter
 */

import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Whether the card is interactive (hover effects) */
  interactive?: boolean;
  
  /** Custom padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

// ============================================================================
// MAIN CARD COMPONENT
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      interactive = false,
      padding = 'sm',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses = [
      'relative',
      'rounded-lg',
      'transition-all',
      'duration-200'
    ];

    // Variant styles
    const variantClasses = {
      default: [
        'bg-white',
        'border',
        'border-slate-200',
        'shadow-sm'
      ],
      outlined: [
        'bg-white',
        'border-2',
        'border-slate-200'
      ],
      elevated: [
        'bg-white',
        'border-0',
        'shadow-lg'
      ],
      flat: [
        'bg-slate-50',
        'border-0'
      ]
    };

    // Interactive styles
    const interactiveClasses = interactive
      ? [
          'cursor-pointer',
          'hover:shadow-md',
          'hover:scale-[1.02]',
          'active:scale-[0.98]'
        ]
      : [];

    // Padding styles
    const paddingClasses = {
      none: [],
      sm: ['p-3'],
      md: ['p-4'],
      lg: ['p-6']
    };

    // Combine classes
    const cardClasses = cn(
      baseClasses,
      variantClasses[variant],
      interactiveClasses,
      paddingClasses[padding],
      className
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================================================
// CARD HEADER COMPONENT
// ============================================================================

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const headerClasses = cn(
      'flex',
      'flex-col',
      'space-y-1.5',
      'pb-4',
      className
    );

    return (
      <div
        ref={ref}
        className={headerClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================================================
// CARD TITLE COMPONENT
// ============================================================================

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    const titleClasses = cn(
      'text-lg',
      'font-semibold',
      'leading-none',
      'tracking-tight',
      'text-slate-900',
      className
    );

    return (
      <h3
        ref={ref}
        className={titleClasses}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// ============================================================================
// CARD DESCRIPTION COMPONENT
// ============================================================================

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const descriptionClasses = cn(
      'text-sm',
      'text-slate-500',
      className
    );

    return (
      <p
        ref={ref}
        className={descriptionClasses}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

// ============================================================================
// CARD CONTENT COMPONENT
// ============================================================================

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    const contentClasses = cn(
      'text-sm',
      'text-slate-700',
      className
    );

    return (
      <div
        ref={ref}
        className={contentClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ============================================================================
// CARD FOOTER COMPONENT
// ============================================================================

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    const footerClasses = cn(
      'flex',
      'items-center',
      'pt-4',
      className
    );

    return (
      <div
        ref={ref}
        className={footerClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ============================================================================
// EXPORTS
// ============================================================================

export default Card; 