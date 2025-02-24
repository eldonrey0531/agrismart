import { useCallback, useRef, useState } from 'react';
import * as z from 'zod';
import {
  FormValues,
  FormConfig,
  FormState,
  UseFormReturn,
  FormField,
  FieldKey,
  FieldValue,
} from './types';

export function useForm<T extends FormValues>(config: FormConfig<T>): UseFormReturn<T> {
  // Initialize form state
  const [state, setState] = useState<FormState<T>>({
    values: config.initialValues || {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
    isValid: true,
  });

  // Refs for form element and last valid values
  const formRef = useRef<HTMLFormElement>(null);
  const lastValidValues = useRef<Partial<T>>({});

  // Type guard for checking if a value exists
  const hasValue = <K extends FieldKey<T>>(
    value: FieldValue<T, K> | undefined
  ): value is FieldValue<T, K> => {
    return value !== undefined;
  };

  // Validate a single field
  const validateField = useCallback(async <K extends FieldKey<T>>(
    field: FormField<T>,
    value: FieldValue<T, K> | undefined
  ): Promise<string | undefined> => {
    if (!field.validation || !hasValue(value)) {
      return field.required && !hasValue(value) ? 'This field is required' : undefined;
    }

    try {
      await field.validation.parseAsync(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return 'Invalid value';
    }
  }, []);

  // Validate entire form or specific field
  const validate = useCallback(async (fieldName?: FieldKey<T>): Promise<boolean> => {
    const fieldsToValidate = fieldName
      ? config.fields.filter(f => f.name === fieldName)
      : config.fields;

    const errors: Partial<Record<FieldKey<T>, string>> = {};
    const validationPromises = fieldsToValidate.map(async field => {
      const value = state.values[field.name];
      const error = await validateField(field, value);
      if (error) {
        errors[field.name] = error;
      }
    });

    await Promise.all(validationPromises);

    setState(prev => ({
      ...prev,
      errors: fieldName
        ? { ...prev.errors, [fieldName]: errors[fieldName] }
        : errors,
      isValid: Object.keys(errors).length === 0,
    }));

    return Object.keys(errors).length === 0;
  }, [config.fields, state.values, validateField]);

  // Set field as touched/untouched
  const setTouched = useCallback((fieldName: FieldKey<T>, isTouched = true) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: isTouched,
      },
    }));

    if (isTouched && config.validationMode === 'onBlur') {
      validate(fieldName);
    }
  }, [config.validationMode, validate]);

  // Set field value and validate
  const setFieldValue = useCallback(async <K extends FieldKey<T>>(
    name: K,
    value: FieldValue<T, K>
  ): Promise<void> => {
    const field = config.fields.find(f => f.name === name);
    if (!field) return;

    setState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      isDirty: true,
    }));

    if (config.validationMode === 'onChange') {
      await validate(name);
    }
  }, [config.fields, config.validationMode, validate]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const isValid = await validate();
      if (!isValid) {
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      await config.onSubmit(state.values as T);
      lastValidValues.current = state.values;
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isDirty: false,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      if (config.onError) {
        config.onError(error instanceof Error ? error : new Error('Form submission failed'));
      }
    }
  }, [config, state.values, validate]);

  // Reset form to initial state
  const reset = useCallback(() => {
    setState({
      values: config.initialValues || {},
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
    });

    if (formRef.current) {
      formRef.current.reset();
    }
  }, [config.initialValues]);

  // Revert form to last valid state
  const revert = useCallback(() => {
    setState(prev => ({
      ...prev,
      values: lastValidValues.current,
      errors: {},
      isDirty: false,
      isValid: true,
    }));
  }, []);

  return {
    formRef,
    state,
    setFieldValue,
    handleSubmit,
    reset,
    revert,
    validate,
    setTouched,
  };
}

export default useForm;