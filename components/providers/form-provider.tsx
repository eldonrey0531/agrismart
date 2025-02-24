'use client';

import React, { createContext, useContext, useRef } from 'react';
import { FormProvider as RHFProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormConfig } from '@/lib/config/form-config';

interface FormProviderProps {
  children: React.ReactNode;
  config: FormConfig;
  id?: string;
  className?: string;
  onSubmit?: (data: any) => Promise<void> | void;
}

interface FormContextValue {
  formId: string;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  submitCount: number;
  errors: Record<string, any>;
  setError: (field: string, error: { type: string; message: string }) => void;
  clearErrors: (field?: string | string[]) => void;
  reset: () => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({
  children,
  config,
  id = 'form',
  className,
  onSubmit,
}: FormProviderProps) {
  const submitCount = useRef(0);
  const form = useForm({
    mode: 'onChange',
    resolver: config.validationSchema 
      ? zodResolver(config.validationSchema as z.ZodType<any>) 
      : undefined,
    defaultValues: config.defaultValues,
  });

  const {
    formState: { isSubmitting, isDirty, isValid, errors },
    setError,
    clearErrors,
    reset,
    handleSubmit,
  } = form;

  const handleFormSubmit = async (data: any) => {
    submitCount.current += 1;
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      if (config.onSubmit) {
        await config.onSubmit(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('root', {
        type: 'submit',
        message: 'An error occurred while submitting the form',
      });
    }
  };

  const contextValue: FormContextValue = {
    formId: id,
    isSubmitting,
    isDirty,
    isValid,
    submitCount: submitCount.current,
    errors,
    setError,
    clearErrors,
    reset,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <RHFProvider {...form}>
        <form
          id={id}
          className={className}
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          {children}
        </form>
      </RHFProvider>
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

// Form Analytics Wrapper
interface FormAnalyticsWrapperProps extends FormProviderProps {
  trackingEnabled?: boolean;
  onFormStart?: () => void;
  onFormComplete?: (data: any) => void;
  onFormError?: (error: any) => void;
}

export function FormAnalyticsWrapper({
  children,
  trackingEnabled = true,
  onFormStart,
  onFormComplete,
  onFormError,
  ...props
}: FormAnalyticsWrapperProps) {
  const startTime = useRef(Date.now());

  const handleSubmit = async (data: any) => {
    if (!trackingEnabled) {
      if (props.onSubmit) {
        await props.onSubmit(data);
      }
      return;
    }

    const endTime = Date.now();
    const duration = endTime - startTime.current;

    try {
      // Track form completion
      if (onFormComplete) {
        onFormComplete({
          ...data,
          duration,
          timestamp: new Date().toISOString(),
        });
      }

      // Call original onSubmit
      if (props.onSubmit) {
        await props.onSubmit(data);
      }
    } catch (error) {
      if (onFormError) {
        onFormError(error);
      }
      throw error;
    }
  };

  // Track form start
  React.useEffect(() => {
    if (trackingEnabled && onFormStart) {
      onFormStart();
    }
  }, [trackingEnabled, onFormStart]);

  return (
    <FormProvider {...props} onSubmit={handleSubmit}>
      {children}
    </FormProvider>
  );
}

export default FormProvider;