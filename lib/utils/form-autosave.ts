interface AutosaveOptions {
  formId: string;
  storageKey?: string;
  debounceMs?: number;
  maxAge?: number; // Maximum age of saved data in milliseconds
  excludeFields?: string[]; // Fields to exclude from autosave
  onSave?: (data: Record<string, any>) => void;
  onRestore?: (data: Record<string, any>) => void;
  onError?: (error: Error) => void;
}

interface SavedFormData {
  timestamp: number;
  data: Record<string, any>;
  formId: string;
}

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export class FormAutosaveManager {
  private options: Required<AutosaveOptions>;
  private form: HTMLFormElement | null;
  private saveTimeout: number | null;
  private lastSavedData: string | null;

  constructor(options: AutosaveOptions) {
    this.options = {
      storageKey: `form_autosave_${options.formId}`,
      debounceMs: 1000,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      excludeFields: [],
      onSave: () => {},
      onRestore: () => {},
      onError: console.error,
      ...options,
    };

    this.form = null;
    this.saveTimeout = null;
    this.lastSavedData = null;

    this.initialize();
  }

  private initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup() {
    this.form = document.getElementById(this.options.formId) as HTMLFormElement;
    if (!this.form) {
      this.options.onError(new Error(`Form with ID "${this.options.formId}" not found`));
      return;
    }

    // Restore saved data if available
    this.restoreSavedData();

    // Setup form change listeners
    this.setupFormListeners();

    // Handle form submission
    this.form.addEventListener('submit', () => this.clearSavedData());
  }

  private setupFormListeners() {
    if (!this.form) return;

    // Listen to input events on all form fields
    this.form.querySelectorAll<FormField>('input, select, textarea').forEach(field => {
      const fieldId = field.id || field.name;
      if (!this.options.excludeFields.includes(fieldId)) {
        field.addEventListener('input', () => this.debounceSave());
        field.addEventListener('change', () => this.debounceSave());
      }
    });
  }

  private debounceSave() {
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = window.setTimeout(() => {
      this.saveFormData();
    }, this.options.debounceMs);
  }

  private getFormData(): Record<string, any> {
    if (!this.form) return {};

    const formData = new FormData(this.form);
    const data: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (!this.options.excludeFields.includes(key)) {
        // Handle multiple values for same field (e.g., checkboxes)
        if (key in data) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(value);
        } else {
          data[key] = value;
        }
      }
    });

    return data;
  }

  private saveFormData() {
    try {
      const data = this.getFormData();
      const saveData: SavedFormData = {
        timestamp: Date.now(),
        data,
        formId: this.options.formId,
      };

      // Only save if data has changed
      const serializedData = JSON.stringify(saveData);
      if (serializedData === this.lastSavedData) return;

      localStorage.setItem(this.options.storageKey, serializedData);
      this.lastSavedData = serializedData;
      this.options.onSave(data);

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Form data autosaved for ${this.options.formId}`, data);
      }
    } catch (error) {
      this.options.onError(error instanceof Error ? error : new Error('Failed to save form data'));
    }
  }

  private restoreSavedData() {
    try {
      const saved = localStorage.getItem(this.options.storageKey);
      if (!saved) return;

      const saveData: SavedFormData = JSON.parse(saved);

      // Check if data is expired
      if (Date.now() - saveData.timestamp > this.options.maxAge) {
        this.clearSavedData();
        return;
      }

      // Check if data belongs to this form
      if (saveData.formId !== this.options.formId) return;

      // Restore data to form fields
      if (this.form) {
        Object.entries(saveData.data).forEach(([key, value]) => {
          if (!this.options.excludeFields.includes(key)) {
            const field = this.form!.elements.namedItem(key);
            if (field instanceof HTMLInputElement || 
                field instanceof HTMLSelectElement || 
                field instanceof HTMLTextAreaElement) {
              if (field.type === 'checkbox' || field.type === 'radio') {
                if (field instanceof HTMLInputElement) {
                  field.checked = field.value === value;
                }
              } else {
                field.value = value as string;
              }
            }
          }
        });

        this.options.onRestore(saveData.data);

        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Form data restored for ${this.options.formId}`, saveData.data);
        }
      }
    } catch (error) {
      this.options.onError(error instanceof Error ? error : new Error('Failed to restore form data'));
    }
  }

  public clearSavedData() {
    localStorage.removeItem(this.options.storageKey);
    this.lastSavedData = null;

    if (process.env.NODE_ENV === 'development') {
      console.log(`Form data cleared for ${this.options.formId}`);
    }
  }

  public forceSave() {
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
    }
    this.saveFormData();
  }

  public getSavedData(): SavedFormData | null {
    try {
      const saved = localStorage.getItem(this.options.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public destroy() {
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
    }
    this.lastSavedData = null;
  }
}

export default FormAutosaveManager;