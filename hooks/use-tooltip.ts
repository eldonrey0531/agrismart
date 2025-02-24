import * as React from "react"

interface UseTooltipOptions {
  /** Delay before showing tooltip (ms) */
  showDelay?: number
  /** Delay before hiding tooltip (ms) */
  hideDelay?: number
  /** Whether to disable the tooltip on touch devices */
  disableOnTouch?: boolean
  /** Initial state */
  initialOpen?: boolean
  /** Callback when tooltip state changes */
  onOpenChange?: (open: boolean) => void
}

interface Position {
  x: number
  y: number
}

interface UseTooltipReturn {
  isOpen: boolean
  triggerProps: {
    ref: React.RefObject<HTMLElement>
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
    onTouchStart: (e: React.TouchEvent) => void
    "aria-describedby"?: string
  }
  tooltipProps: {
    ref: React.RefObject<HTMLElement>
    role: "tooltip"
    id: string
    style: React.CSSProperties
  }
  position: Position
  updatePosition: () => void
}

/**
 * Hook to manage tooltip interactions and positioning
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const {
    showDelay = 200,
    hideDelay = 150,
    disableOnTouch = true,
    initialOpen = false,
    onOpenChange
  } = options

  // State
  const [isOpen, setIsOpen] = React.useState(initialOpen)
  const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  // Refs
  const triggerRef = React.useRef<HTMLElement>(null)
  const tooltipRef = React.useRef<HTMLElement>(null)
  const showTimeoutRef = React.useRef<NodeJS.Timeout>()
  const hideTimeoutRef = React.useRef<NodeJS.Timeout>()
  const tooltipId = React.useId()

  // Check if device supports touch
  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

  // Handle state changes
  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }, [onOpenChange])

  // Clear any pending timeouts
  const clearTimeouts = React.useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  // Show tooltip with delay
  const show = React.useCallback(() => {
    clearTimeouts()
    if (disableOnTouch && isTouchDevice) return

    showTimeoutRef.current = setTimeout(() => {
      handleOpenChange(true)
    }, showDelay)
  }, [clearTimeouts, disableOnTouch, handleOpenChange, isTouchDevice, showDelay])

  // Hide tooltip with delay
  const hide = React.useCallback(() => {
    clearTimeouts()
    hideTimeoutRef.current = setTimeout(() => {
      handleOpenChange(false)
    }, hideDelay)
  }, [clearTimeouts, handleOpenChange, hideDelay])

  // Update tooltip position
  const updatePosition = React.useCallback(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    // Center the tooltip above the trigger
    const x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
    const y = triggerRect.top - tooltipRect.height - 8

    // Keep tooltip within viewport
    const safeX = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8))
    const safeY = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8))

    setPosition({ x: safeX, y: safeY })
  }, [isOpen])

  // Update position on scroll/resize
  React.useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition)

      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  // Handle touch interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isOpen) {
      show()
    } else {
      hide()
    }
  }

  // Clean up timeouts
  React.useEffect(() => {
    return () => clearTimeouts()
  }, [clearTimeouts])

  return {
    isOpen,
    triggerProps: {
      ref: triggerRef,
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      onTouchStart: handleTouchStart,
      "aria-describedby": isOpen ? tooltipId : undefined
    },
    tooltipProps: {
      ref: tooltipRef,
      role: "tooltip",
      id: tooltipId,
      style: {
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none'
      }
    },
    position,
    updatePosition
  }
}