import * as React from 'react';
import { FieldValues, UseFormReturn, useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label?: string;
  description?: string;
  control?: UseFormReturn<FieldValues>['control'];
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, description, className, control: customControl, ...props }, ref) => {
    const formContext = useFormContext();
    const control = customControl || formContext?.control;

    if (!control) {
      throw new Error(
        'Form control not found - FormInput must be used within a Form or provide a control prop'
      );
    }

    return (
      <FormField
        control={control}
        name={name}
        render={({ field: { ref: fieldRef, ...fieldProps } }) => (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <Input
                {...fieldProps}
                {...props}
                ref={(node) => {
                  // Handle both refs
                  fieldRef(node);
                  if (typeof ref === 'function') {
                    ref(node);
                  } else if (ref) {
                    ref.current = node;
                  }
                }}
                className={cn(
                  'w-full',
                  fieldProps.value && 'border-primary',
                  className
                )}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;