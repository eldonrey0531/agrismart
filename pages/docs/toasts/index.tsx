import { Metadata } from 'next'
import { ToastExamples } from '@/components/examples/toast-examples'

export const metadata: Metadata = {
  title: 'Toast Documentation | Your App',
  description: 'Documentation and examples for using the toast notification system',
}

export default function ToastDocsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Introduction */}
        <section>
          <h1 className="text-4xl font-bold mb-4">Toast Notifications</h1>
          <p className="text-muted-foreground text-lg">
            A type-safe and accessible toast notification system with predefined messages and customization options.
          </p>
        </section>

        {/* Installation */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Installation</h2>
          <div className="bg-muted p-4 rounded-lg">
            <pre>
              <code>{`// 1. Import the hook
import { useToastMessages } from '@/hooks/use-toast-messages'

// 2. Add ToastProvider to your layout
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`}</code>
            </pre>
          </div>
        </section>

        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <div className="bg-muted p-4 rounded-lg">
            <pre>
              <code>{`// Using predefined toasts
const { success, error, info } = useToastMessages()

// Success notification
success('emailVerified')

// Error notification
error('invalidToken')

// Info notification
info('maintenance')`}</code>
            </pre>
          </div>
        </section>

        {/* Custom Toasts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Custom Toasts</h2>
          <div className="bg-muted p-4 rounded-lg">
            <pre>
              <code>{`// Custom messages
const { showSuccess, showError, showInfo } = useToastMessages()

// Custom success
showSuccess('Custom Title', 'Success message')

// Custom error with Error object
showError(new Error('Something went wrong'))

// Custom error with title
showErrorWithTitle('Database Error', 'Connection failed')

// Custom info
showInfo('Notice', 'This is a custom notice')`}</code>
            </pre>
          </div>
        </section>

        {/* Action Toasts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Action Toasts</h2>
          <div className="bg-muted p-4 rounded-lg">
            <pre>
              <code>{`// Toast with actions
const { showAction } = useToastMessages()

showAction(
  'Confirm action?',
  <div className="flex gap-2">
    <Button onClick={handleConfirm}>
      Confirm
    </Button>
    <Button onClick={handleCancel}>
      Cancel
    </Button>
  </div>
)`}</code>
            </pre>
          </div>
        </section>

        {/* Extended Toasts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Extending Toasts</h2>
          <div className="bg-muted p-4 rounded-lg">
            <pre>
              <code>{`// Extend predefined toasts
const { extend } = useToastMessages()

extend('emailVerified', {
  description: 'Custom description',
  action: <Button>Action</Button>
})`}</code>
            </pre>
          </div>
        </section>

        {/* Live Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Live Examples</h2>
          <div className="border rounded-lg">
            <ToastExamples />
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use predefined toasts for consistent messaging</li>
            <li>Keep toast messages concise and clear</li>
            <li>Use appropriate variants for different message types</li>
            <li>Include actions only when necessary</li>
            <li>Consider accessibility when adding custom content</li>
            <li>Avoid showing multiple toasts simultaneously</li>
          </ul>
        </section>

        {/* API Reference */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">Predefined Methods</h3>
              <ul className="list-disc pl-6 mt-2">
                <li><code>success(key)</code> - Show success toast</li>
                <li><code>error(key)</code> - Show error toast</li>
                <li><code>info(key)</code> - Show info toast</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium">Custom Methods</h3>
              <ul className="list-disc pl-6 mt-2">
                <li><code>showSuccess(title, message)</code> - Custom success</li>
                <li><code>showError(error)</code> - Show error details</li>
                <li><code>showErrorWithTitle(title, error)</code> - Error with title</li>
                <li><code>showInfo(title, message)</code> - Custom info</li>
                <li><code>showAction(message, action)</code> - Toast with action</li>
                <li><code>showCustom(options)</code> - Fully custom toast</li>
                <li><code>extend(key, override)</code> - Extend predefined toast</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}