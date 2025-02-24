// Toast variants
export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

// Toast types
export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Toast context
export interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: ToastProps) => void;
  removeToast: (index: number) => void;
}