import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-destructive',
        className
      )}
      role="alert"
    >
      <Icons.error className="h-4 w-4 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

interface FormSuccessProps {
  message?: string
  className?: string
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md bg-emerald-500/15 p-3 text-emerald-500',
        className
      )}
      role="alert"
    >
      <Icons.check className="h-4 w-4 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}