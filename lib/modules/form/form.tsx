import React from 'react';
import {
  FormValues,
  FormConfig,
  FormComponentProps,
  FieldKey,
  FieldValue,
  FormField as FormFieldType,
} from './types';
import { useForm } from './use-form';

type FieldRendererProps<T extends FormValues, K extends FieldKey<T>> = {
  field: FormFieldType<T>;
  name: K;
  value: FieldValue<T, K>;
  error?: string;
  touched?: boolean;
  onChange: (value: FieldValue<T, K>) => void;
  onBlur: () => void;
};

function TextField<T extends FormValues, K extends FieldKey<T>>({
  field,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FieldRendererProps<T, K>) {
  return (
    <div className="form-field">
      {field.label && (
        <label htmlFor={name} className="form-label">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        type={field.type}
        value={String(value ?? '')}
        onChange={(e) => {
          const newValue = e.target.value as unknown as FieldValue<T, K>;
          onChange(newValue);
        }}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={`form-input ${touched && error ? 'error' : ''}`}
        required={field.required}
        disabled={field.disabled}
        aria-invalid={touched && !!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {touched && error && (
        <div id={`${name}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
      {field.description && (
        <div className="form-description" id={`${name}-description`}>
          {field.description}
        </div>
      )}
    </div>
  );
}

function TextareaField<T extends FormValues, K extends FieldKey<T>>({
  field,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FieldRendererProps<T, K>) {
  return (
    <div className="form-field">
      {field.label && (
        <label htmlFor={name} className="form-label">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        value={String(value ?? '')}
        onChange={(e) => {
          const newValue = e.target.value as unknown as FieldValue<T, K>;
          onChange(newValue);
        }}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={`form-textarea ${touched && error ? 'error' : ''}`}
        required={field.required}
        disabled={field.disabled}
        rows={field.type === 'textarea' ? field.rows : undefined}
        aria-invalid={touched && !!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {touched && error && (
        <div id={`${name}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
      {field.description && (
        <div className="form-description" id={`${name}-description`}>
          {field.description}
        </div>
      )}
    </div>
  );
}

function SelectField<T extends FormValues, K extends FieldKey<T>>({
  field,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FieldRendererProps<T, K>) {
  if (field.type !== 'select') return null;

  return (
    <div className="form-field">
      {field.label && (
        <label htmlFor={name} className="form-label">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        value={String(value ?? '')}
        onChange={(e) => {
          const newValue = e.target.value as unknown as FieldValue<T, K>;
          onChange(newValue);
        }}
        onBlur={onBlur}
        className={`form-select ${touched && error ? 'error' : ''}`}
        required={field.required}
        disabled={field.disabled}
        aria-invalid={touched && !!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="" disabled hidden>
          {field.placeholder || 'Select an option'}
        </option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {touched && error && (
        <div id={`${name}-error`} className="form-error" role="alert">
          {error}
        </div>
      )}
      {field.description && (
        <div className="form-description" id={`${name}-description`}>
          {field.description}
        </div>
      )}
    </div>
  );
}

function FormField<T extends FormValues>({
  field,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FieldRendererProps<T, FieldKey<T>>) {
  const props = {
    field,
    name,
    value,
    error,
    touched,
    onChange,
    onBlur,
  };

  switch (field.type) {
    case 'select':
      return <SelectField {...props} />;
    case 'textarea':
      return <TextareaField {...props} />;
    default:
      return <TextField {...props} />;
  }
}

export function Form<T extends FormValues>({
  config,
  className,
  children,
}: FormComponentProps<T>) {
  const {
    formRef,
    state,
    setFieldValue,
    handleSubmit,
    setTouched,
    validate,
  } = useForm<T>(config);

  const handleFieldBlur = async (name: FieldKey<T>) => {
    setTouched(name, true);
    if (config.validationMode === 'onBlur') {
      await validate(name);
    }
  };

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(e) => handleSubmit(e)}
      noValidate
    >
      {config.fields.map((field) => {
        const name = field.name;
        const currentValue = (state.values[name] ?? field.defaultValue ?? '') as FieldValue<T, typeof name>;

        return (
          <FormField
            key={name}
            field={field}
            name={name}
            value={currentValue}
            error={state.errors[name]}
            touched={state.touched[name]}
            onChange={(value) => setFieldValue(name, value)}
            onBlur={() => handleFieldBlur(name)}
          />
        );
      })}
      {children}
      {state.isSubmitting && (
        <div className="form-submitting" role="status" aria-live="polite">
          Submitting...
        </div>
      )}
    </form>
  );
}

export default Form;