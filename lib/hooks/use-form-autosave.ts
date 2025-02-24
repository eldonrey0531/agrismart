import { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import debounce from 'lodash/debounce';

interface AutosaveOptions<T> {
  key: string;
  form: UseFormReturn<T>;
  onSave?: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useFormAutosave<T extends Record<string, any>>({
  key,
  form,
  onSave,
  debounceMs = 1000,
  enabled = true,
}: AutosaveOptions<T>) {
  const [lastSavedData, setLastSavedData] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    mounted.current = true;
    
    if (!enabled) return;

    const saved = localStorage.getItem(`form_${key}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        form.reset(data);
        setLastSavedData(data);
      } catch (err) {
        console.error('Error loading saved form data:', err);
        localStorage.removeItem(`form_${key}`);
      }
    }

    return () => {
      mounted.current = false;
    };
  }, [key, form, enabled]);

  // Setup autosave
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((formData) => {
      // Don't save if the form is pristine
      if (!form.formState.isDirty) return;

      // Don't save if the data hasn't changed
      if (JSON.stringify(formData) === JSON.stringify(lastSavedData)) return;

      debouncedSave(formData as T);
    });

    return () => subscription.unsubscribe();
  }, [form, lastSavedData, enabled]);

  // Debounced save function
  const debouncedSave = debounce(async (data: T) => {
    if (!mounted.current) return;

    setIsSaving(true);
    setError(null);

    try {
      // Save to localStorage
      localStorage.setItem(`form_${key}`, JSON.stringify(data));

      // Call onSave callback if provided
      if (onSave) {
        await onSave(data);
      }

      setLastSavedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving form data');
      console.error('Form autosave error:', err);
    } finally {
      if (mounted.current) {
        setIsSaving(false);
      }
    }
  }, debounceMs);

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem(`form_${key}`);
    setLastSavedData(null);
  };

  // Get last saved timestamp
  const getLastSavedTime = (): Date | null => {
    const saved = localStorage.getItem(`form_${key}_timestamp`);
    return saved ? new Date(saved) : null;
  };

  // Check if there's unsaved changes
  const hasUnsavedChanges = (): boolean => {
    const currentData = form.getValues();
    return JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
  };

  // Manual save function
  const saveForm = async (): Promise<void> => {
    const data = form.getValues();
    await debouncedSave.flush();
    await debouncedSave(data);
  };

  return {
    isSaving,
    error,
    lastSavedData,
    clearSavedData,
    getLastSavedTime,
    hasUnsavedChanges,
    saveForm,
  };
}

export default useFormAutosave;