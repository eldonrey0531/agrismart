"use client"

import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000

type ToastActionElement = React.ReactElement<any, string | React.JSXElementConstructor<any>>

export interface ToastItem {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
}

export interface ToastOptions {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastState = {
  items: [] as ToastItem[],
  
  // Add toast to state
  add(toast: ToastOptions) {
    this.items = [
      { id: genId(), ...toast },
      ...this.items
    ].slice(0, TOAST_LIMIT)
  },

  // Update existing toast
  update(id: string, toast: ToastOptions) {
    this.items = this.items.map(t => 
      t.id === id ? { ...t, ...toast } : t
    )
  },

  // Remove toast from state
  dismiss(id: string) {
    const timeout = toastTimeouts.get(id)
    if (timeout) clearTimeout(timeout)

    const newTimeout = setTimeout(() => {
      this.items = this.items.filter(t => t.id !== id)
      toastTimeouts.delete(id)
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(id, newTimeout)
  },

  // Remove all toasts
  dismissAll() {
    this.items.forEach(toast => this.dismiss(toast.id))
  }
}

interface UseToastReturn {
  toasts: ToastItem[]
  toast: (props: ToastOptions) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribeToToasts(setToasts)
    return () => {
      unsubscribe()
      // Clear timeouts on unmount
      toastTimeouts.forEach(timeout => clearTimeout(timeout))
      toastTimeouts.clear()
    }
  }, [])

  return {
    toasts,
    toast: (props) => toastState.add(props),
    dismiss: (id) => toastState.dismiss(id),
    dismissAll: () => toastState.dismissAll()
  }
}

// Subscribe to toast state changes
function subscribeToToasts(callback: (toasts: ToastItem[]) => void) {
  const proxy = new Proxy(toastState, {
    set(target, prop: keyof typeof toastState, value) {
      target[prop] = value
      if (prop === 'items') {
        callback(value)
      }
      return true
    }
  })

  return () => {
    Object.setPrototypeOf(toastState, Object.prototype)
  }
}