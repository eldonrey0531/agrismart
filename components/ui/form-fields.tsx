import React from 'react';
import { useFormContext, Controller, FieldValues } from 'react-hook-form';
import {
  FormFieldProps,
  FormInputProps,
  FormSelectProps,
  FormCheckboxProps,
  FormTextareaProps,
  FormFieldRenderProps,
} from '@/lib/types/form';

export function FormField<T extends FieldValues>({
  name,
  render,
}: {
  name: string;
  render: (props: FormFieldRenderProps<T>) => React.ReactNode;
}) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={(props) => render(props as FormFieldRenderProps<T>)}
    />
  );
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = 'text',
  description,
  required,
  placeholder,
  className,
  ...props
}: FormInputProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        className={`w-full rounded-md border border-input px-3 py-2 ${
          error ? 'border-destructive' : ''
        } ${className}`}
        placeholder={placeholder}
        aria-describedby={description ? `${name}-description` : undefined}
        {...register(name)}
        {...props}
      />
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  required,
  placeholder,
  rows = 3,
  className,
  ...props
}: FormTextareaProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
      )}
      <textarea
        id={name}
        rows={rows}
        className={`w-full rounded-md border border-input px-3 py-2 ${
          error ? 'border-destructive' : ''
        } ${className}`}
        placeholder={placeholder}
        aria-describedby={description ? `${name}-description` : undefined}
        {...register(name)}
        {...props}
      />
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  description,
  required,
  options,
  placeholder,
  className,
  ...props
}: FormSelectProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
      )}
      <select
        id={name}
        className={`w-full rounded-md border border-input px-3 py-2 ${
          error ? 'border-destructive' : ''
        } ${className}`}
        aria-describedby={description ? `${name}-description` : undefined}
        {...register(name)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(({ label, value, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {label}
          </option>
        ))}
      </select>
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  className,
  ...props
}: FormCheckboxProps<T>) {
  const { register, formState: { errors } } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className={`h-4 w-4 rounded border-gray-300 ${
            error ? 'border-destructive' : ''
          } ${className}`}
          {...register(name)}
          {...props}
        />
        <span className="text-sm">{label}</span>
      </label>
      {description && (
        <p className="text-sm text-muted-foreground pl-6">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive pl-6" role="alert">
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className="rounded-md bg-destructive/10 p-4" role="alert">
      <p className="text-sm text-destructive">{error}</p>
    </div>
  );
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="rounded-md bg-primary/10 p-4" role="status">
      <p className="text-sm text-primary">{message}</p>
    </div>
  );
}

interface FormErrorProps {
  error?: string | null;
}

interface FormSuccessProps {
  message?: string | null;
}