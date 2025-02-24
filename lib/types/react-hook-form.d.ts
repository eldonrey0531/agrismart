declare module "react-hook-form" {
  import { Ref } from "react";

  export type FieldValues = Record<string, any>;

  export type Path<T> = keyof T;

  export type FieldPath<T> = keyof T;

  export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  } : T;

  export type DeepRequired<T> = {
    [P in keyof T]-?: DeepRequired<NonNullable<T[P]>>;
  };

  export type RegisterOptions = {
    required?: boolean | string;
    min?: number | string;
    max?: number | string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: any) => boolean | string | Promise<boolean | string>;
  };

  export type FieldError = {
    type: string;
    message?: string;
  };

  export type FieldErrors<T extends FieldValues = FieldValues> = {
    [K in keyof T]?: T[K] extends any[]
      ? T[K][number] extends object
        ? FieldErrors<T[K][number]>[] | FieldError
        : FieldError
      : T[K] extends object
      ? FieldErrors<T[K]>
      : FieldError;
  };

  export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
    isDirty: boolean;
    dirtyFields: Record<keyof TFieldValues, boolean>;
    isSubmitted: boolean;
    isSubmitSuccessful: boolean;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    errors: FieldErrors<TFieldValues>;
    touchedFields: Record<keyof TFieldValues, boolean>;
  };

  export type FieldState = {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    error?: FieldError;
  };

  export type UseFormRegister<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
  >(
    name: TFieldName,
    options?: RegisterOptions
  ) => {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    ref: (instance: any) => void;
    name: TFieldName;
  };

  export type Control<TFieldValues extends FieldValues = FieldValues> = {
    _formState: FormStateProxy<TFieldValues>;
    _defaultValues: DeepPartial<TFieldValues>;
    _options: UseFormProps<TFieldValues>;
  };

  export type UseFormReturn<TFieldValues extends FieldValues = FieldValues> = {
    watch: (name?: keyof TFieldValues | (keyof TFieldValues)[]) => any;
    register: UseFormRegister<TFieldValues>;
    handleSubmit: (
      onSubmit: (data: TFieldValues) => Promise<void> | void,
      onError?: (errors: FieldErrors<TFieldValues>) => void
    ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    formState: FormStateProxy<TFieldValues>;
    reset: (values?: DeepPartial<TFieldValues>) => void;
    setError: (
      name: keyof TFieldValues | 'root',
      error: { type: string; message: string }
    ) => void;
    clearErrors: (name?: keyof TFieldValues | (keyof TFieldValues)[] | 'root') => void;
    setValue: <TFieldName extends keyof TFieldValues>(
      name: TFieldName,
      value: TFieldValues[TFieldName],
      config?: { shouldValidate?: boolean; shouldDirty?: boolean }
    ) => void;
    getValues: () => TFieldValues;
    getFieldState: (name: keyof TFieldValues) => FieldState;
    trigger: (name?: keyof TFieldValues | (keyof TFieldValues)[]) => Promise<boolean>;
    control: Control<TFieldValues>;
  };

  export type UseFormProps<TFieldValues extends FieldValues = FieldValues> = {
    mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
    reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur';
    defaultValues?: DeepPartial<TFieldValues>;
    resolver?: (values: TFieldValues) => Promise<{
      values: TFieldValues;
      errors: FieldErrors<TFieldValues>;
    }>;
    context?: any;
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
    criteriaMode?: 'firstError' | 'all';
  };

  export interface ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
  > {
    name: TName;
    control?: Control<TFieldValues>;
    defaultValue?: any;
    rules?: RegisterOptions;
    render: (props: {
      field: {
        onChange: (...event: any[]) => void;
        onBlur: () => void;
        value: any;
        name: TName;
        ref: Ref<any>;
      };
      fieldState: FieldState;
      formState: FormStateProxy<TFieldValues>;
    }) => React.ReactElement;
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    props?: UseFormProps<TFieldValues>
  ): UseFormReturn<TFieldValues>;

  export function FormProvider<TFieldValues extends FieldValues = FieldValues>(
    props: { children: React.ReactNode } & UseFormReturn<TFieldValues>
  ): JSX.Element;

  export function useFormContext<
    TFieldValues extends FieldValues = FieldValues
  >(): UseFormReturn<TFieldValues>;

  export function Controller<
    TFieldValues extends FieldValues = FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>
  >(props: ControllerProps<TFieldValues, TName>): JSX.Element;
}

declare module "@hookform/resolvers/zod" {
  import { ZodType } from "zod";
  import { FieldValues, FieldErrors } from "react-hook-form";

  export function zodResolver<T extends FieldValues>(
    schema: ZodType<T>
  ): (values: T) => Promise<{
    values: T;
    errors: FieldErrors<T>;
  }>;
}