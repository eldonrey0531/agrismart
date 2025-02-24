"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { type TooltipVariant } from "@/lib/utils/tooltip"
import { getTooltipPosition, getArrowPosition } from "@/lib/utils/tooltip-animations"

export interface InteractiveTooltipProps {
  /** The element to trigger the tooltip */
  children: React.ReactNode
  /** The content to display in the tooltip */
  content: React.ReactNode
  /** Visual style variant */
  variant?: TooltipVariant
  /** Side to display the tooltip */
  side?: "top" | "right" | "bottom" | "left"
  /** Alignment of the tooltip */
  align?: "start" | "center" | "end"
  /** Whether to stay open on click */
  sticky?: boolean
  /** Control the open state externally */
  open?: boolean
  /** Whether to show a close button */
  closeable?: boolean
  /** Additional classes to apply to the tooltip */
  className?: string
  /** Callback when tooltip is opened */
  onOpen?: () => void
  /** Callback when tooltip is closed */
  onClose?: () => void
}

export function InteractiveTooltip({
  children,
  content,
  variant = "default",
  side = "top",
  align = "center",
  sticky = false,
  open: controlledOpen,
  closeable = false,
  className,
  onOpen,
  onClose
}: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const open = controlledOpen !== undefined ? controlledOpen : isOpen

  // Handle hover events
  const handleMouseEnter = () => {
    if (!sticky) {
      setIsOpen(true)
      onOpen?.()
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (!sticky && !tooltipRef.current?.contains(event.relatedTarget as Node)) {
      setIsOpen(false)
      onClose?.()
    }
  }

  // Handle click events
  const handleClick = () => {
    if (sticky) {
      setIsOpen(!isOpen)
      if (!isOpen) onOpen?.()
      else onClose?.()
    }
  }

  // Handle click outside
  React.useEffect(() => {
    if (!sticky || !open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sticky, open, onClose])

  // Handle trigger element
  const trigger = React.isValidElement(children)
    ? React.cloneElement(children, {
        ...children.props,
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handleClick,
        className: cn(
          children.props.className,
          "inline-block relative",
          sticky && "cursor-pointer"
        )
      })
    : (
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={cn("inline-block relative", sticky && "cursor-pointer")}
      >
        {children}
      </div>
    )

  return (
    <>
      {trigger}
      {open && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "absolute z-50 min-w-[8rem] rounded-md",
            "shadow-md",
            getTooltipPosition(side, align),
            className
          )}
          data-state={open ? "open" : "closed"}
        >
          {content}
          {closeable && (
            <button
              onClick={() => {
                setIsOpen(false)
                onClose?.()
              }}
              className={cn(
                "absolute top-2 right-2 p-1 rounded-sm opacity-70",
                "hover:opacity-100 focus:opacity-100",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}