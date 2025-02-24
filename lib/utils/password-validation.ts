interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Calculate password strength score (0-4)
  let score = 0;
  if (password.length >= 12) score++; // Length bonus
  if (/[A-Z].*[A-Z]/.test(password)) score++; // Multiple uppercase
  if (/[a-z].*[a-z]/.test(password)) score++; // Multiple lowercase
  if (/\d.*\d/.test(password)) score++; // Multiple numbers
  if (/[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) score++; // Multiple special chars

  return {
    isValid: errors.length === 0,
    score,
    errors
  };
}