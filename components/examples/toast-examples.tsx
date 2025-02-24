"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToastMessages } from '@/hooks/use-toast-messages'

/**
 * Example component demonstrating different toast usage patterns
 */
export function ToastExamples() {
  const toast = useToastMessages()
  const [loading, setLoading] = useState(false)

  // Simulate an async operation
  const handleAsyncOperation = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('profileUpdated')
    } catch (error) {
      toast.showError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  // Simulate an error
  const handleError = () => {
    toast.error('serverError')
  }

  // Simulate a confirmation
  const handleConfirmation = () => {
    toast.showAction(
      'Are you sure you want to delete this item?',
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => toast.success('profileUpdated')}
        >
          Delete
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info('sessionExpired')}
        >
          Cancel
        </Button>
      </div>
    )
  }

  // Simulate a custom error
  const handleCustomError = () => {
    toast.showErrorWithTitle(
      'Database Error',
      'Failed to connect to database at localhost:5432'
    )
  }

  // Simulate extending a toast
  const handleExtendedToast = () => {
    toast.extend('emailVerified', {
      description: 'You can now access all features of the application.',
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => console.log('Action clicked')}
        >
          Get Started
        </Button>
      )
    })
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-4">Toast Examples</h2>
      
      <div className="grid gap-4">
        {/* Predefined Toasts */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Predefined Toasts</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => toast.success('emailVerified')}
              variant="default"
            >
              Success Toast
            </Button>
            <Button
              onClick={() => toast.error('invalidToken')}
              variant="destructive"
            >
              Error Toast
            </Button>
            <Button
              onClick={() => toast.info('maintenance')}
              variant="secondary"
            >
              Info Toast
            </Button>
          </div>
        </section>

        {/* Async Operation */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Async Operation</h3>
          <Button
            onClick={handleAsyncOperation}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Start Async Operation'}
          </Button>
        </section>

        {/* Error Handling */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Error Handling</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleError}
              variant="destructive"
            >
              Show Error
            </Button>
            <Button
              onClick={handleCustomError}
              variant="destructive"
            >
              Custom Error
            </Button>
          </div>
        </section>

        {/* Confirmations */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Confirmations</h3>
          <Button onClick={handleConfirmation}>
            Show Confirmation
          </Button>
        </section>

        {/* Extended Toast */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Extended Toast</h3>
          <Button onClick={handleExtendedToast}>
            Show Extended Toast
          </Button>
        </section>
      </div>
    </div>
  )
}

/**
 * Toast provider wrapper for examples
 */
export function ToastExamplesWrapper() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <ToastExamples />
      </div>
    </div>
  )
}