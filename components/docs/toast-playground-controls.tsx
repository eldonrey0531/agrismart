"use client"

import { useEffect } from 'react'
import { useToastMessages } from '@/hooks/use-toast-messages'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { InfoIcon, KeyboardIcon, FileJson } from 'lucide-react'

interface ToastInfo {
  title: string
  description: string
  type: 'success' | 'error' | 'info'
  keyboard?: string
}

/**
 * Keyboard shortcut manager for toast playground
 */
function useToastKeyboardShortcuts() {
  const toast = useToastMessages()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if Ctrl/Cmd is pressed
      if (!(e.ctrlKey || e.metaKey)) return

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault()
          toast.success('emailVerified')
          break
        case 'e':
          e.preventDefault()
          toast.error('serverError')
          break
        case 'i':
          e.preventDefault()
          toast.info('maintenance')
          break
        case 'a':
          e.preventDefault()
          toast.showAction(
            'Action Required',
            <Button size="sm" onClick={() => toast.success('profileUpdated')}>
              Confirm
            </Button>
          )
          break
        case 'k':
          e.preventDefault()
          document.querySelector<HTMLButtonElement>('[data-shortcuts-dialog]')?.click()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toast])
}

/**
 * Toast information tooltip
 */
export function ToastInfo({ toast }: { toast: ToastInfo }) {
  return (
    <TooltipProvider>
      <Tooltip content={
        <div className="flex flex-col gap-1">
          <p className="font-medium">{toast.title}</p>
          <p className="text-xs text-muted-foreground">{toast.description}</p>
          {toast.keyboard && (
            <kbd className="mt-1 px-2 py-1 text-xs bg-muted rounded">
              {toast.keyboard}
            </kbd>
          )}
        </div>
      }>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <InfoIcon className="h-4 w-4" />
          <span className="sr-only">Toast information</span>
        </Button>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Keyboard shortcuts dialog
 */
export function KeyboardShortcuts() {
  const shortcuts = [
    { key: '⌘/Ctrl + S', description: 'Show success toast' },
    { key: '⌘/Ctrl + E', description: 'Show error toast' },
    { key: '⌘/Ctrl + I', description: 'Show info toast' },
    { key: '⌘/Ctrl + A', description: 'Show action toast' },
    { key: '⌘/Ctrl + K', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Dismiss all toasts' },
  ]

  return (
    <Dialog>
      <Button 
        variant="outline" 
        size="icon"
        data-shortcuts-dialog
        className="shrink-0"
        onClick={() => {}} // Dialog will handle this
      >
        <KeyboardIcon className="h-4 w-4" />
        <span className="sr-only">Keyboard shortcuts</span>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to quickly trigger toasts
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shortcuts.map(({ key, description }) => (
            <div
              key={key}
              className="grid grid-cols-2 items-center gap-4"
            >
              <kbd className="px-2 py-1.5 text-sm bg-muted rounded text-center">
                {key}
              </kbd>
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Code preview dialog
 */
export function CodePreview({ code }: { code: string }) {
  return (
    <Dialog>
      <Button 
        variant="outline" 
        size="icon" 
        className="shrink-0"
        onClick={() => {}} // Dialog will handle this
      >
        <FileJson className="h-4 w-4" />
        <span className="sr-only">View code</span>
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Code Preview</DialogTitle>
          <DialogDescription>
            Copy and paste this code to use in your application
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <pre className="mt-4 max-h-[400px] overflow-x-auto rounded-lg bg-muted p-4">
            <code className="text-sm">{code}</code>
          </pre>
          <Button 
            size="sm"
            className="absolute top-6 right-6"
            onClick={() => {
              navigator.clipboard.writeText(code)
            }}
          >
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}