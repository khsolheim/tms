import React, { useEffect, useRef } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

interface ValidationFeedbackProps {
  errors?: Record<string, string | string[]>;
  success?: Record<string, string>;
  warnings?: Record<string, string>;
  className?: string;
}

interface FeedbackMessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  fieldName?: string;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ 
  type, 
  message, 
  fieldName 
}) => {
  const Icon = type === 'error' ? FiAlertCircle 
    : type === 'success' ? FiCheckCircle 
    : type === 'warning' ? FiAlertCircle 
    : FiInfo;

  const colorClasses = {
    error: 'text-red-600 bg-red-50 border-red-200',
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  const iconColorClasses = {
    error: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div 
      className={`flex items-start gap-2 p-3 rounded-md border ${colorClasses[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon 
        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconColorClasses[type]}`} 
        aria-hidden="true"
      />
      <div className="flex-1 text-sm">
        {fieldName && (
          <span className="font-medium">{fieldName}: </span>
        )}
        {message}
      </div>
    </div>
  );
};

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  errors = {},
  success = {},
  warnings = {},
  className = ''
}) => {
  const announcementRef = useRef<HTMLDivElement>(null);

  // Convert errors to flat array for easier handling
  const errorMessages = Object.entries(errors).flatMap(([field, error]) => {
    if (Array.isArray(error)) {
      return error.map(msg => ({ field, message: msg, type: 'error' as const }));
    }
    return [{ field, message: error, type: 'error' as const }];
  });

  const successMessages = Object.entries(success).map(([field, message]) => ({
    field,
    message,
    type: 'success' as const
  }));

  const warningMessages = Object.entries(warnings).map(([field, message]) => ({
    field,
    message,
    type: 'warning' as const
  }));

  const allMessages = [...errorMessages, ...successMessages, ...warningMessages];

  // Auto-focus on error messages for screen readers
  useEffect(() => {
    if (errorMessages.length > 0 && announcementRef.current) {
      // Small delay to ensure screen readers announce the error
      setTimeout(() => {
        announcementRef.current?.focus();
      }, 100);
    }
  }, [errorMessages.length]);

  if (allMessages.length === 0) {
    return null;
  }

  return (
    <div 
      className={`space-y-6 ${className}`}
      ref={announcementRef}
      tabIndex={-1}
      aria-label="Skjemavalidering"
    >
      {/* Screen reader summary */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {errorMessages.length > 0 && (
          `${errorMessages.length} feil funnet i skjemaet`
        )}
        {successMessages.length > 0 && (
          ` ${successMessages.length} felt validert`
        )}
        {warningMessages.length > 0 && (
          ` ${warningMessages.length} advarsler`
        )}
      </div>

      {/* Visual feedback messages */}
      {allMessages.map(({ field, message, type }, index) => (
        <FeedbackMessage
          key={`${field}-${type}-${index}`}
          type={type}
          message={message}
          fieldName={field}
        />
      ))}
    </div>
  );
};

// Hook for managing form validation announcements
export const useFormValidation = () => {
  const [errors, setErrors] = React.useState<Record<string, string | string[]>>({});
  const [success, setSuccess] = React.useState<Record<string, string>>({});
  const [warnings, setWarnings] = React.useState<Record<string, string>>({});

  const addError = (field: string, message: string | string[]) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    // Clear any existing success for this field
    setSuccess(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  };

  const addSuccess = (field: string, message: string) => {
    setSuccess(prev => ({ ...prev, [field]: message }));
    // Clear any existing error for this field
    setErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  };

  const addWarning = (field: string, message: string) => {
    setWarnings(prev => ({ ...prev, [field]: message }));
  };

  const clearField = (field: string) => {
    setErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
    setSuccess(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
    setWarnings(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  };

  const clearAll = () => {
    setErrors({});
    setSuccess({});
    setWarnings({});
  };

  const hasErrors = Object.keys(errors).length > 0;
  const hasSuccess = Object.keys(success).length > 0;
  const hasWarnings = Object.keys(warnings).length > 0;

  return {
    errors,
    success,
    warnings,
    addError,
    addSuccess,
    addWarning,
    clearField,
    clearAll,
    hasErrors,
    hasSuccess,
    hasWarnings,
    ValidationFeedback: () => (
      <ValidationFeedback 
        errors={errors} 
        success={success} 
        warnings={warnings} 
      />
    )
  };
};

// Enhanced form field component with validation feedback
interface AccessibleFormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string | string[];
  success?: string;
  warning?: string;
  help?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  children,
  error,
  success,
  warning,
  help,
  required = false,
  className = ''
}) => {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);
  // Removed unused variable: hasWarning

  const describedByIds: string[] = [];
  if (help) describedByIds.push(`${id}-help`);
  if (error) describedByIds.push(`${id}-error`);
  if (success) describedByIds.push(`${id}-success`);
  if (warning) describedByIds.push(`${id}-warning`);

  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={id}
        className={`block text-sm font-medium ${
          hasError ? 'text-red-700' : 'text-gray-700'
        }`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="påkrevd">*</span>
        )}
      </label>

      {help && (
        <p 
          id={`${id}-help`}
          className="text-sm text-gray-600"
        >
          {help}
        </p>
      )}

      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              id,
              'aria-describedby': describedByIds.length > 0 ? describedByIds.join(' ') : undefined,
              'aria-invalid': hasError ? 'true' : undefined,
              'aria-required': required ? 'true' : undefined,
              className: `${(child.props as any).className || ''} ${
                hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' :
                hasSuccess ? 'border-green-300 focus:border-green-500 focus:ring-green-500' :
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`.trim()
            });
          }
          return child;
        })}
      </div>

      {/* Individual field feedback */}
      <div className="space-y-1">
        {error && (
          <div 
            id={`${id}-error`}
            className="flex items-start gap-2 text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            <FiAlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              {Array.isArray(error) ? (
                <ul className="list-disc list-inside space-y-1">
                  {error.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              ) : (
                error
              )}
            </div>
          </div>
        )}

        {success && !error && (
          <div 
            id={`${id}-success`}
            className="flex items-center gap-2 text-sm text-green-600"
            role="status"
            aria-live="polite"
          >
            <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
            {success}
          </div>
        )}

        {warning && !error && (
          <div 
            id={`${id}-warning`}
            className="flex items-center gap-2 text-sm text-yellow-600"
            role="status"
            aria-live="polite"
          >
            <FiAlertCircle className="h-4 w-4" aria-hidden="true" />
            {warning}
          </div>
        )}
      </div>
    </div>
  );
}; 