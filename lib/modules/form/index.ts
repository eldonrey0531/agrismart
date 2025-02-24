import { Form } from './form';
import { useForm } from './use-form';
import {
  FormValues,
  FormConfig,
  FormState,
  FormField,
  FormFieldComponentProps,
  FormComponentProps,
  FieldKey,
  FieldValue,
  FieldOption,
  UseFormReturn,
  TextField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioField,
  FileField,
  BaseField,
} from './types';

import {
  formFieldStyles,
  labelStyles,
  inputStyles,
  textareaStyles,
  selectStyles,
  descriptionStyles,
  errorStyles,
  loadingStyles,
} from './styles';

export {
  // Components
  Form,
  useForm,

  // Types
  type FormValues,
  type FormConfig,
  type FormState,
  type FormField,
  type FormFieldComponentProps,
  type FormComponentProps,
  type UseFormReturn,
  type FieldKey,
  type FieldValue,
  type FieldOption,
  type TextField,
  type TextareaField,
  type SelectField,
  type CheckboxField,
  type RadioField,
  type FileField,
  type BaseField,

  // Styles
  formFieldStyles,
  labelStyles,
  inputStyles,
  textareaStyles,
  selectStyles,
  descriptionStyles,
  errorStyles,
  loadingStyles,
};

// Default exports
export default Form;