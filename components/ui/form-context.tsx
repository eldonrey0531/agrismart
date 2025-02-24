import React, { createContext, useContext } from 'react';
import {
  useForm,
  UseFormReturn,
  FieldValues,
  FormProvider,
  UseFormProps,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface FormContextProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  formState: UseFormReturn<T>['formState'];
}

const FormContext = createContext<FormContextProps<any> | undefined>(undefined);

interface FormWrapperProps<T extends FieldValues> extends UseFormProps<T> {
  children: React.ReactNode;
  schema?: z.ZodType<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  className?: string;
}

export function FormWrapper<T extends FieldValues>({
  children,
  schema,
  onSubmit,
  className,
  ...formProps
}: FormWrapperProps<T>) {
  const form = useForm<T>({
    ...formProps,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <FormProvider {...form}>
      <FormContext.Provider value={{ form, formState: form.formState }}>
        <form
          onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
          className={className}
        >
          {children}
        </form>
      </FormContext.Provider>
    </FormProvider>
  );
}

export function useFormContext<T extends FieldValues>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormWrapper');
  }
  return context as FormContextProps<T>;
}

export function Form<T extends FieldValues>({
  children,
  ...props
}: FormWrapperProps<T>) {
  return <FormWrapper {...props}>{children}</FormWrapper>;
}

// Re-export for convenience
export type { UseFormReturn, FieldValues };
export { useForm };

export default Form;