import { useToast } from "@/components/ui/use-toast"
import {
  type ToastMessage,
  successToasts,
  errorToasts,
  infoToasts,
  createCustomToast,
  createErrorToast,
  createSuccessToast,
  createInfoToast,
  createActionToast,
} from "@/lib/utils/toast-messages"
import { type ReactNode } from "react"

type ToastKeys = keyof typeof successToasts | keyof typeof errorToasts | keyof typeof infoToasts

/**
 * Hook for showing toast messages with consistent styling and content
 */
export function useToastMessages() {
  const { toast } = useToast()

  return {
    /**
     * Show a predefined success toast
     */
    success(key: keyof typeof successToasts) {
      toast(successToasts[key])
    },

    /**
     * Show a predefined error toast
     */
    error(key: keyof typeof errorToasts) {
      toast(errorToasts[key])
    },

    /**
     * Show a predefined info toast
     */
    info(key: keyof typeof infoToasts) {
      toast(infoToasts[key])
    },

    /**
     * Show a toast for an error object
     */
    showError(error: Error) {
      toast(createErrorToast(error))
    },

    /**
     * Show a custom error toast with title
     */
    showErrorWithTitle(title: string, error: Error | string) {
      const message = error instanceof Error ? error.message : error
      toast(createCustomToast(
        createErrorToast(new Error(message)),
        { title }
      ))
    },

    /**
     * Show a custom success toast
     */
    showSuccess(title: string, message: string) {
      toast(createSuccessToast(title, message))
    },

    /**
     * Show a custom info toast
     */
    showInfo(title: string, message: string) {
      toast(createInfoToast(title, message))
    },

    /**
     * Show a toast with an action button
     */
    showAction(message: string, action: ReactNode) {
      toast(createActionToast(message, action))
    },

    /**
     * Show a fully custom toast
     */
    showCustom(message: ToastMessage) {
      toast(message)
    },

    /**
     * Extend a predefined toast
     */
    extend(key: ToastKeys, override: Partial<ToastMessage>) {
      const base = {
        ...successToasts,
        ...errorToasts,
        ...infoToasts
      }[key]
      
      toast(createCustomToast(base, override))
    }
  }
}

// Example usage:
/*
const { success, error, showCustom, showAction } = useToastMessages()

// Show predefined toast
success('emailVerified')
error('invalidToken')

// Show error with custom title
showErrorWithTitle(
  "Database Error",
  new Error("Failed to connect to database")
)

// Show custom toast
showCustom({
  title: "Custom Toast",
  description: "This is a custom message",
  variant: "default"
})

// Show toast with action
showAction("Confirm action?", (
  <Button onClick={handleConfirm}>
    Confirm
  </Button>
))
*/