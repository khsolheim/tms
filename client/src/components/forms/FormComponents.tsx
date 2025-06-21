/**
 * Enhanced Form Components with React Hook Form and Zod
 */

import React from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodSchema } from 'zod';
import { cn } from '../../lib/utils';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const validationSchemas = {
  email: z.string().email('Ugyldig e-postadresse'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Ugyldig telefonnummer'),
  postalCode: z.string().regex(/^\d{4}$/, 'Postnummer må være 4 siffer'),
  organizationNumber: z.string().regex(/^\d{9}$/, 'Organisasjonsnummer må være 9 siffer'),
  required: (message = 'Dette feltet er påkrevd') => z.string().min(1, message),
  minLength: (min: number, message?: string) => 
    z.string().min(min, message || `Minimum ${min} tegn`),
  maxLength: (max: number, message?: string) => 
    z.string().max(max, message || `Maksimum ${max} tegn`),
  positiveNumber: z.number().positive('Må være et positivt tall'),
  percentage: z.number().min(0).max(100, 'Må være mellom 0 og 100'),
};

// ============================================================================
// FORM HOOKS
// ============================================================================

export function useEnhancedForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  defaultValues?: Partial<T>
) {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });
}

// ============================================================================
// ENHANCED INPUT COMPONENTS
// ============================================================================

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    const hasError = !!error;
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            hasError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {helpText && !error && (
          <p className="text-sm text-gray-600">{helpText}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

interface EnhancedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const EnhancedSelect = React.forwardRef<HTMLSelectElement, EnhancedSelectProps>(
  ({ label, error, helpText, options, placeholder, className, ...props }, ref) => {
    const hasError = !!error;
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            hasError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {helpText && !error && (
          <p className="text-sm text-gray-600">{helpText}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

EnhancedSelect.displayName = 'EnhancedSelect';

// ============================================================================
// EXAMPLE SCHEMAS
// ============================================================================

export const exampleSchemas = {
  contact: z.object({
    name: validationSchemas.required('Navn er påkrevd'),
    email: validationSchemas.email,
    phone: validationSchemas.phone,
    message: validationSchemas.minLength(10, 'Meldingen må være minst 10 tegn'),
  }),
  
  address: z.object({
    street: validationSchemas.required('Gateadresse er påkrevd'),
    postalCode: validationSchemas.postalCode,
    city: validationSchemas.required('By er påkrevd'),
    country: z.string().default('Norge'),
  }),
  
  company: z.object({
    name: validationSchemas.required('Bedriftsnavn er påkrevd'),
    organizationNumber: validationSchemas.organizationNumber,
    email: validationSchemas.email,
    phone: validationSchemas.phone.optional(),
  }),
};

export type ContactFormData = z.infer<typeof exampleSchemas.contact>;
export type AddressFormData = z.infer<typeof exampleSchemas.address>;
export type CompanyFormData = z.infer<typeof exampleSchemas.company>; 