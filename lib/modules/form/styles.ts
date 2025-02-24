import { cva } from 'class-variance-authority';

export const formFieldStyles = cva(
  'form-field flex flex-col gap-1.5',
  {
    variants: {
      size: {
        default: '',
        sm: 'gap-1',
        lg: 'gap-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export const labelStyles = cva(
  'form-label text-sm font-medium',
  {
    variants: {
      size: {
        default: '',
        sm: 'text-xs',
        lg: 'text-base',
      },
      required: {
        true: 'after:content-["*"] after:ml-0.5 after:text-red-500',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export const inputStyles = cva(
  [
    'form-input w-full rounded-md border px-3 py-2',
    'bg-background text-foreground',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-muted-foreground',
  ].join(' '),
  {
    variants: {
      size: {
        default: 'h-10',
        sm: 'h-8 text-sm',
        lg: 'h-12 text-lg',
      },
      error: {
        true: 'border-destructive focus:ring-destructive',
        false: 'border-input',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

export const textareaStyles = cva(
  [
    'form-textarea w-full rounded-md border px-3 py-2',
    'bg-background text-foreground',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-muted-foreground',
    'resize-none',
  ].join(' '),
  {
    variants: {
      size: {
        default: 'min-h-[80px]',
        sm: 'min-h-[60px] text-sm',
        lg: 'min-h-[120px] text-lg',
      },
      error: {
        true: 'border-destructive focus:ring-destructive',
        false: 'border-input',
      },
      resize: {
        true: 'resize-y',
        false: 'resize-none',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
      resize: false,
    },
  }
);

export const selectStyles = cva(
  [
    'form-select w-full rounded-md border px-3 py-2',
    'bg-background text-foreground',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      size: {
        default: 'h-10',
        sm: 'h-8 text-sm',
        lg: 'h-12 text-lg',
      },
      error: {
        true: 'border-destructive focus:ring-destructive',
        false: 'border-input',
      },
    },
    defaultVariants: {
      size: 'default',
      error: false,
    },
  }
);

export const descriptionStyles = cva(
  'form-description text-sm text-muted-foreground',
  {
    variants: {
      size: {
        default: '',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export const errorStyles = cva(
  'form-error text-sm text-destructive',
  {
    variants: {
      size: {
        default: '',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export const loadingStyles = cva(
  [
    'form-loading flex items-center justify-center',
    'p-2 text-sm text-muted-foreground',
  ].join(' '),
  {
    variants: {
      size: {
        default: '',
        sm: 'text-xs',
        lg: 'text-base p-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);