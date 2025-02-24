/**
 * UI Component Types
 */

// Badge variants
export type BadgeVariant = 
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'success'  // Added for status indicators
  | 'warning'  // Added for warnings
  | 'info';    // Added for information

// Button variants
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

// Button sizes
export type ButtonSize =
  | 'default'
  | 'sm'
  | 'lg'
  | 'icon';

// Input types
export type InputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'search'
  | 'tel'
  | 'url';

// Status types
export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default';

// Modal sizes
export type ModalSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'full';

// Toast variants
export type ToastVariant = 
  | 'default'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info';

// Loading states
export type LoadingState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Animation types
export type AnimationVariant =
  | 'slide'
  | 'fade'
  | 'scale'
  | 'bounce';

// Position types
export type Position =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';