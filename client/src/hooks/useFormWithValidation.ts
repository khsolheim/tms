import { useForm, UseFormProps, UseFormReturn, FieldValues, Path, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { log } from '../utils/logger';

interface UseFormWithValidationProps<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (error: any) => void;
  successMessage?: string;
  showValidationErrors?: boolean;
}

interface UseFormWithValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean;
  submitForm: (e?: React.BaseSyntheticEvent) => Promise<void>;
  validateField: (fieldName: Path<T>, value: any) => Promise<boolean>;
  hasFieldError: (fieldName: Path<T>) => boolean;
  getFieldError: (fieldName: Path<T>) => string | undefined;
}

export function useFormWithValidation<T extends FieldValues = FieldValues>({
  schema,
  onSubmit,
  onError,
  successMessage,
  showValidationErrors = true,
  ...formProps
}: UseFormWithValidationProps<T>): UseFormWithValidationReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange', // Validering ved endringer
    ...formProps,
  });

  const { handleSubmit, setError, trigger, formState: { errors } } = form;

  // Behandle innsending av skjema
  const submitForm = useCallback(async (e?: React.BaseSyntheticEvent) => {
    if (!onSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      await handleSubmit(
        async (data: T) => {
          try {
            await onSubmit(data);
            if (successMessage) {
              toast.success(successMessage);
            }
          } catch (error: any) {
            log.error('Form submission error', error);
            
            // Håndter validasjonsfeil fra server
            if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
              Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                  setError(field as Path<T>, {
                    type: 'server',
                    message: messages[0]
                  });
                }
              });
              
              if (showValidationErrors) {
                toast.error('Vennligst rett opp valideringsfeilene');
              }
            } else {
              const errorMessage = error.response?.data?.message || error.message || 'En feil oppstod';
              toast.error(errorMessage);
              if (onError) {
                onError(error);
              }
            }
            // Fjernet throw error for å unngå uncaught runtime errors
          }
        },
        (validationErrors: FieldErrors<T>) => {
          log.debug('Validation errors', validationErrors);
          if (showValidationErrors) {
            const firstErrorKey = Object.keys(validationErrors)[0] as Path<T>;
            const firstError = validationErrors[firstErrorKey];
            if (firstError?.message) {
              toast.error(`Validering feilet: ${firstError.message}`);
            }
          }
        }
      )(e);
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSubmit, onSubmit, onError, successMessage, showValidationErrors, setError]);

  // Validere et enkelt felt
  const validateField = useCallback(async (fieldName: Path<T>, value: any): Promise<boolean> => {
    try {
      // Bruk trigger for å validere feltet
      return await trigger(fieldName);
    } catch (error) {
      return false;
    }
  }, [trigger]);

  // Sjekk om et felt har feil
  const hasFieldError = useCallback((fieldName: Path<T>): boolean => {
    return !!errors[fieldName];
  }, [errors]);

  // Hent feilmelding for et felt
  const getFieldError = useCallback((fieldName: Path<T>): string | undefined => {
    const error = errors[fieldName];
    return typeof error?.message === 'string' ? error.message : undefined;
  }, [errors]);

  return {
    ...form,
    isSubmitting,
    submitForm,
    validateField,
    hasFieldError,
    getFieldError,
  };
}

// Helper for debounced validering
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper for async validering
export function createAsyncValidator<T>(
  validatorFn: (value: T, ...args: any[]) => Promise<boolean | string>
) {
  return async (value: T, ...args: any[]) => {
    try {
      const result = await validatorFn(value, ...args);
      return result === true ? true : result;
    } catch (error) {
      return error instanceof Error ? error.message : 'Valideringsfeil';
    }
  };
}

// Pre-definerte async validators
export const asyncValidators = {
  // Sjekk om e-post er unik
  uniqueEmail: createAsyncValidator(async (email: string, excludeId?: number) => {
    try {
      const url = new URL('/api/validation/email', window.location.origin);
      url.searchParams.set('email', email);
      if (excludeId) {
        url.searchParams.set('excludeId', excludeId.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke validere e-post');
      }

      const result = await response.json();
      return result.data.isUnique || result.data.message;
    } catch (error) {
      log.error('E-post validering feilet', error);
      return 'Kunne ikke validere e-post';
    }
  }),

  // Sjekk om organisasjonsnummer er unikt
  uniqueOrgNumber: createAsyncValidator(async (orgNr: string, excludeId?: number) => {
    try {
      const url = new URL('/api/validation/organisasjonsnummer', window.location.origin);
      url.searchParams.set('organisasjonsnummer', orgNr);
      if (excludeId) {
        url.searchParams.set('excludeId', excludeId.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke validere organisasjonsnummer');
      }

      const result = await response.json();
      return result.data.isUnique || result.data.message;
    } catch (error) {
      log.error('Organisasjonsnummer validering feilet', error);
      return 'Kunne ikke validere organisasjonsnummer';
    }
  }),

  // Sjekk om personnummer er unikt
  uniquePersonnummer: createAsyncValidator(async (pnr: string, excludeId?: number, type: 'elev' | 'ansatt' = 'elev') => {
    try {
      const url = new URL('/api/validation/personnummer', window.location.origin);
      url.searchParams.set('personnummer', pnr);
      url.searchParams.set('type', type);
      if (excludeId) {
        url.searchParams.set('excludeId', excludeId.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke validere personnummer');
      }

      const result = await response.json();
      return result.data.isUnique || result.data.message;
    } catch (error) {
      log.error('Personnummer validering feilet', error);
      return 'Kunne ikke validere personnummer';
    }
  }),

  // Sjekk for duplikat kontrakter
  checkContractDuplicate: createAsyncValidator(async (elevPersonnummer: string, bedriftId: number, excludeId?: number) => {
    try {
      const url = new URL('/api/validation/kontrakt-duplikat', window.location.origin);
      url.searchParams.set('elevPersonnummer', elevPersonnummer);
      url.searchParams.set('bedriftId', bedriftId.toString());
      if (excludeId) {
        url.searchParams.set('excludeId', excludeId.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunne ikke sjekke for duplikat kontrakter');
      }

      const result = await response.json();
      return !result.data.hasDuplicate || result.data.message;
    } catch (error) {
      log.error('Kontrakt duplikat sjekk feilet', error);
      return 'Kunne ikke sjekke for duplikat kontrakter';
    }
  }),
}; 