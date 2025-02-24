import { UseFormReturn, FieldValues, Path, Control, FieldError } from 'react-hook-form';

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  control?: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface FormFieldContextValue<T extends FieldValues> {
  name: Path<T>;
  control?: Control<T>;
}

export interface FormFieldRenderProps<T extends FieldValues> {
  field: {
    name: Path<T>;
    value: any;
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    ref: React.Ref<any>;
  };
  fieldState: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
  };
  formState: UseFormReturn<T>['formState'];
}

export interface FormInputProps<T extends FieldValues = FieldValues>
  extends FormFieldProps<T> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  placeholder?: string;
  autoComplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
}

export interface FormSelectProps<T extends FieldValues = FieldValues>
  extends FormFieldProps<T> {
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  placeholder?: string;
}

export interface FormCheckboxProps<T extends FieldValues = FieldValues>
  extends FormFieldProps<T> {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string;
}

export interface FormTextareaProps<T extends FieldValues = FieldValues>
  extends FormFieldProps<T> {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  resize?: boolean;
}

export interface FormRadioGroupProps<T extends FieldValues = FieldValues>
  extends FormFieldProps<T> {
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  inline?: boolean;
}

export interface FormFieldsetProps {
  legend?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export interface FormSubmitProps {
  label?: string;
  submitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FormErrorProps {
  error?: string | null;
  className?: string;
}

export interface FormSuccessProps {
  message?: string | null;
  className?: string;
}

export type FormValidationRules = {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
};