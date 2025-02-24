import { useEffect, useRef } from 'react';
import {
  FormAccessibilityOptions,
  FormAccessibilityReturn,
  DEFAULT_ANNOUNCEMENTS,
  FormErrorMap,
} from '../types/accessibility';

export function useFormAccessibility({
  formId,
  formName,
  announceErrors = true,
  announceSaving = true,
  announceSuccess = true,
  customAnnouncements = {},
}: FormAccessibilityOptions): FormAccessibilityReturn {
  const announcer = useRef<HTMLDivElement | null>(null);
  const previousErrors = useRef<string[]>([]);

  // Create or get announcer element
  useEffect(() => {
    if (!announcer.current) {
      const element = document.createElement('div');
      element.id = `${formId}-announcer`;
      element.className = 'sr-only';
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', 'polite');
      document.body.appendChild(element);
      announcer.current = element;
    }

    return () => {
      announcer.current?.remove();
    };
  }, [formId]);

  // Announce message
  const announce = (message: string) => {
    if (announcer.current) {
      // Clear previous announcement
      announcer.current.textContent = '';
      
      // Force a reflow to ensure screen readers announce the new message
      void announcer.current.offsetWidth;
      
      // Set new announcement
      announcer.current.textContent = message;
    }
  };

  // Setup form accessibility
  const setupFormAccessibility = (form: any) => {
    // Add form ARIA attributes
    const formElement = document.getElementById(formId);
    if (formElement) {
      formElement.setAttribute('role', 'form');
      formElement.setAttribute('aria-label', formName);
      formElement.setAttribute('novalidate', 'true');
    }

    // Watch for form errors if using react-hook-form
    if (announceErrors && form?.watch && form?.formState) {
      const subscription = form.watch(() => {
        const errors = (form.formState.errors || {}) as FormErrorMap;
        const currentErrors = Object.entries(errors)
          .filter(([_, error]) => error?.message)
          .map(([field, error]) => `${field}: ${error?.message}`);

        // Only announce if errors have changed
        if (JSON.stringify(currentErrors) !== JSON.stringify(previousErrors.current)) {
          if (currentErrors.length > 0) {
            announce(
              `${customAnnouncements.error || DEFAULT_ANNOUNCEMENTS.error} ${currentErrors.join('. ')}`
            );
          }
          previousErrors.current = currentErrors;
        }
      });

      return () => subscription?.unsubscribe?.();
    }

    return () => {};
  };

  // Add keyboard navigation
  const setupKeyboardNavigation = () => {
    const formElement = document.getElementById(formId);
    if (!formElement) return;

    // Find all focusable elements
    const getFocusableElements = () => 
      formElement.querySelectorAll(
        'button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        // Trap focus within the form
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    formElement.addEventListener('keydown', handleKeyboardNavigation);
  };

  // Handle form state announcements
  const announceFormState = {
    saving: () => {
      if (announceSaving) {
        announce(customAnnouncements.saving || DEFAULT_ANNOUNCEMENTS.saving);
      }
    },
    saved: () => {
      if (announceSaving) {
        announce(customAnnouncements.saved || DEFAULT_ANNOUNCEMENTS.saved);
      }
    },
    success: () => {
      if (announceSuccess) {
        announce(customAnnouncements.success || DEFAULT_ANNOUNCEMENTS.success);
      }
    },
    error: (message?: string) => {
      if (announceErrors) {
        announce(message || customAnnouncements.error || DEFAULT_ANNOUNCEMENTS.error);
      }
    },
    custom: (message: string) => {
      announce(message);
    },
  };

  // Get field announcement
  const getFieldAnnouncement = (fieldName: string, error?: string) => {
    if (error) {
      return `${fieldName}: ${error}`;
    }
    return `${fieldName} field is valid`;
  };

  return {
    setupFormAccessibility,
    setupKeyboardNavigation,
    announce,
    announceFormState,
    getFieldAnnouncement,
  };
}

export default useFormAccessibility;