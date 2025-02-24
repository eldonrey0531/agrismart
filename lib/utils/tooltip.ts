import { type ClassValue } from "clsx"

export type TooltipVariant = 
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "muted"

export type TooltipPlacement = {
  side: "top" | "right" | "bottom" | "left"
  align: "start" | "center" | "end"
}

export const tooltipVariants: Record<TooltipVariant, ClassValue> = {
  default: "bg-popover text-popover-foreground shadow-md",
  info: "bg-blue-50 text-blue-900 shadow-blue-100",
  success: "bg-green-50 text-green-900 shadow-green-100",
  warning: "bg-yellow-50 text-yellow-900 shadow-yellow-100",
  error: "bg-red-50 text-red-900 shadow-red-100",
  muted: "bg-muted text-muted-foreground shadow-sm"
}