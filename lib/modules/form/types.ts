import { z } from 'zod';
import { ReactNode } from 'react';

// Base type for form values
export type FormValues = Record<string, unknown>;

// Field key type helper
export type FieldKey<T> = Extract<keyof T, string>;

// Field value type helper
export type FieldValue<T, K extends FieldKey<T>> = T[K];

// Field types supported by the form
export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file';

// Option type for select and radio fields
export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Base field configuration
export type BaseField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = {
  name: K;
  type: FieldType;
  label?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: FieldValue<T, K>;
  validation?: z.ZodType<FieldValue<T, K>>;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
};

// Text field specific configuration
export type TextField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'text' | 'email' | 'password';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

// Number field specific configuration
export type NumberField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

// Select field specific configuration
export type SelectField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'select';
  options: FieldOption[];
  multiple?: boolean;
};

// Textarea field specific configuration
export type TextareaField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'textarea';
  rows?: number;
  cols?: number;
  minLength?: number;
  maxLength?: number;
  resize?: boolean;
};

// Checkbox field specific configuration
export type CheckboxField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'checkbox';
  checked?: boolean;
};

// Radio field specific configuration
export type RadioField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'radio';
  options: FieldOption[];
};

// File field specific configuration
export type FileField<T extends FormValues, K extends FieldKey<T> = FieldKey<T>> = BaseField<T, K> & {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
};

// Union type of all field configurations
export type FormField<T extends FormValues> =
  | TextField<T>
  | NumberField<T>
  | SelectField<T>
  | TextareaField<T>
  | CheckboxField<T>
  | RadioField<T>
  | FileField<T>;

// Form configuration
export type FormConfig<T extends FormValues> = {
  fields: FormField<T>[];
  initialValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (error: Error) => void;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
};

// Form state
export type FormState<T extends FormValues> = {
  values: Partial<T>;
  errors: Partial<Record<FieldKey<T>, string>>;
  touched: Partial<Record<FieldKey<T>, boolean>>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
};

// Form field component props
export type FormFieldComponentProps<T extends FormValues> = {
  field: FormField<T>;
  value: FieldValue<T, FieldKey<T>>;
  error?: string;
  onChange: (value: FieldValue<T, FieldKey<T>>) => void;
  onBlur: () => void;
};

// Form component props
export type FormComponentProps<T extends FormValues> = {
  config: FormConfig<T>;
  className?: string;
  children?: ReactNode;
};

// Form hook return type
export type UseFormReturn<T extends FormValues> = {
  formRef: React.RefObject<HTMLFormElement>;
  state: FormState<T>;
  setFieldValue: <K extends FieldKey<T>>(name: K, value: FieldValue<T, K>) => Promise<void>;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  revert: () => void;
  validate: (fieldName?: FieldKey<T>) => Promise<boolean>;
  setTouched: (fieldName: FieldKey<T>, isTouched?: boolean) => void;
};