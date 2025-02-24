interface FormEnhancementOptions {
  formId: string;
  action: string;
  method?: 'get' | 'post';
  validationRules?: ValidationRules;
  fallbackMessages?: FallbackMessages;
}

interface ValidationRules {
  [fieldName: string]: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    customMessage?: string;
  };
}

interface FallbackMessages {
  required?: string;
  pattern?: string;
  minLength?: string;
  maxLength?: string;
  min?: string;
  max?: string;
  submitError?: string;
  submitSuccess?: string;
}

const defaultMessages: Required<FallbackMessages> = {
  required: 'This field is required',
  pattern: 'Please match the requested format',
  minLength: 'Please lengthen this text',
  maxLength: 'Please shorten this text',
  min: 'Value is too low',
  max: 'Value is too high',
  submitError: 'Form submission failed. Please try again.',
  submitSuccess: 'Form submitted successfully.',
};

export function enhanceForm({
  formId,
  action,
  method = 'post',
  validationRules = {},
  fallbackMessages = {},
}: FormEnhancementOptions) {
  // Combine default and custom messages
  const messages = { ...defaultMessages, ...fallbackMessages };

  // Add native form validation attributes
  const setupNativeValidation = () => {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    // Set form attributes
    form.setAttribute('action', action);
    form.setAttribute('method', method);
    form.setAttribute('novalidate', 'true');

    // Add validation attributes to fields
    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement;
      if (!field) return;

      if (rules.required) {
        field.required = true;
        field.setAttribute('aria-required', 'true');
      }

      if (rules.pattern) {
        field.pattern = rules.pattern;
      }

      if (rules.minLength) {
        field.minLength = rules.minLength;
      }

      if (rules.maxLength) {
        field.maxLength = rules.maxLength;
      }

      if (rules.min) {
        field.min = String(rules.min);
      }

      if (rules.max) {
        field.max = String(rules.max);
      }

      // Add validation message container
      const messageId = `${fieldName}-message`;
      const messageEl = document.createElement('div');
      messageEl.id = messageId;
      messageEl.className = 'validation-message';
      messageEl.setAttribute('aria-live', 'polite');
      field.setAttribute('aria-describedby', messageId);
      field.parentNode?.insertBefore(messageEl, field.nextSibling);
    });
  };

  // Handle native form validation
  const handleNativeValidation = () => {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous messages
      const messageElements = form.getElementsByClassName('validation-message');
      Array.from(messageElements).forEach(el => {
        el.textContent = '';
        el.className = 'validation-message';
      });

      // Check native validation
      if (!form.checkValidity()) {
        // Show validation messages
        Array.from(form.elements).forEach((element) => {
          if (!(element instanceof HTMLInputElement)) return;
          
          const messageEl = document.getElementById(`${element.name}-message`);
          if (!messageEl) return;

          if (!element.validity.valid) {
            let message = element.validationMessage;

            // Use custom messages if available
            if (element.validity.valueMissing && validationRules[element.name]?.required) {
              message = validationRules[element.name].customMessage || messages.required;
            } else if (element.validity.patternMismatch && validationRules[element.name]?.pattern) {
              message = validationRules[element.name].customMessage || messages.pattern;
            }

            messageEl.textContent = message;
            messageEl.className = 'validation-message error';
          }
        });

        return;
      }

      try {
        // Submit form data
        const formData = new FormData(form);
        const response = await fetch(action, {
          method,
          body: formData,
        });

        if (!response.ok) throw new Error(messages.submitError);

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-message success';
        successMessage.setAttribute('role', 'alert');
        successMessage.textContent = messages.submitSuccess;
        form.insertBefore(successMessage, form.firstChild);

        // Reset form after success
        form.reset();
      } catch (error) {
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-message error';
        errorMessage.setAttribute('role', 'alert');
        errorMessage.textContent = messages.submitError;
        form.insertBefore(errorMessage, form.firstChild);
      }
    });
  };

  // Initialize progressive enhancement
  const initialize = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupNativeValidation();
        handleNativeValidation();
      });
    } else {
      setupNativeValidation();
      handleNativeValidation();
    }
  };

  return {
    initialize,
  };
}

export default enhanceForm;