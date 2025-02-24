import { useEffect, useRef } from 'react'

interface UseFocusTrapOptions {
  enabled?: boolean
  onEscape?: () => void
}

/**
 * Hook to trap focus within a container and handle keyboard navigation
 */
export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const { enabled = true, onEscape } = options
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Find all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Store the previously focused element
    const previousFocus = document.activeElement

    // Focus the first element
    firstFocusable?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }

      if (e.key === 'Tab') {
        // If shift + tab on first element, move to last
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
        // If tab on last element, move to first
        else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus when unmounting
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus()
      }
    }
  }, [enabled, onEscape])

  return containerRef
}