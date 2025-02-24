import { forwardRef } from 'react'
import { Input, type InputProps } from '@/components/ui/input'

export interface PhoneInputProps extends Omit<InputProps, 'onChange'> {
  onChange?: (value: string) => void
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, ...props }, ref) => {
    // Handle phone number formatting and validation
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value

      // Remove all non-numeric characters except +
      value = value.replace(/[^\d+]/g, '')

      // Ensure only one + at the start
      if (value.length > 1) {
        value = '+' + value.replace(/\+/g, '')
      }

      // Limit length to 15 digits (E.164 standard)
      if (value.length > 16) { // +15 digits
        value = value.slice(0, 16)
      }

      // Update input value
      event.target.value = value
      onChange?.(value)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        pattern="[+][0-9]{1,15}"
        maxLength={16}
        onChange={handleChange}
        className={className}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }