import * as React from "react"

export type ToastProps = {
  variant?: "default" | "destructive" | "success"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement<{
  id: string
  className?: string
}>