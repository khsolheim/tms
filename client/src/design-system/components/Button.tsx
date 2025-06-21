/**
 * Button Component
 * 
 * Hovedknapp-komponent med forskjellige varianter, størrelser og tilstander
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
// Removed unused import: tokens
import { cn } from '../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Loading state */
  loading?: boolean;
  
  /** Icon before text */
  leftIcon?: React.ReactNode;
  
  /** Icon after text */
  rightIcon?: React.ReactNode;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Button content */
  children?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
      'select-none'
    ];

    // Size variations
    const sizeClasses = {
      sm: [
        'h-8',
        'px-3',
        'text-sm',
        'rounded-md',
        'focus:ring-1'
      ],
      md: [
        'h-10',
        'px-4',
        'text-sm',
        'rounded-md'
      ],
      lg: [
        'h-12',
        'px-5',
        'text-base',
        'rounded-lg'
      ]
    };

    // Variant styles
    const variantClasses = {
      primary: [
        'bg-blue-600',
        'text-white',
        'border-transparent',
        'hover:bg-blue-700',
        'focus:ring-blue-500',
        'active:bg-blue-800'
      ],
      secondary: [
        'bg-slate-100',
        'text-slate-900',
        'border-transparent',
        'hover:bg-slate-200',
        'focus:ring-slate-500',
        'active:bg-slate-300'
      ],
      outline: [
        'bg-transparent',
        'text-slate-700',
        'border',
        'border-slate-300',
        'hover:bg-slate-50',
        'hover:border-slate-400',
        'focus:ring-slate-500',
        'active:bg-slate-100'
      ],
      ghost: [
        'bg-transparent',
        'text-slate-700',
        'border-transparent',
        'hover:bg-slate-100',
        'focus:ring-slate-500',
        'active:bg-slate-200'
      ],
      destructive: [
        'bg-red-600',
        'text-white',
        'border-transparent',
        'hover:bg-red-700',
        'focus:ring-red-500',
        'active:bg-red-800'
      ],
      success: [
        'bg-green-600',
        'text-white',
        'border-transparent',
        'hover:bg-green-700',
        'focus:ring-green-500',
        'active:bg-green-800'
      ],
      warning: [
        'bg-yellow-600',
        'text-white',
        'border-transparent',
        'hover:bg-yellow-700',
        'focus:ring-yellow-500',
        'active:bg-yellow-800'
      ]
    };

    // Width classes
    const widthClasses = fullWidth ? ['w-full'] : [];

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Combine all classes
    const buttonClasses = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      widthClasses,
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// COMPONENT VARIATIONS
// ============================================================================

export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);

export const GhostButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);

export const DestructiveButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="destructive" {...props} />
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
OutlineButton.displayName = 'OutlineButton';
GhostButton.displayName = 'GhostButton';
DestructiveButton.displayName = 'DestructiveButton';

// ============================================================================
// EXPORTS
// ============================================================================

export default Button; 