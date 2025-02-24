"use client"

import { useState } from 'react'
import { useToastMessages } from '@/hooks/use-toast-messages'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  successToasts, 
  errorToasts, 
  infoToasts 
} from '@/lib/utils/toast-messages'

type SuccessToastKey = keyof typeof successToasts
type ErrorToastKey = keyof typeof errorToasts
type InfoToastKey = keyof typeof infoToasts

export function ToastPlayground() {
  const toast = useToastMessages()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState<'default' | 'destructive' | 'success'>('default')

  // Predefined toasts data
  const toastKeys = {
    success: Object.keys(successToasts) as SuccessToastKey[],
    error: Object.keys(errorToasts) as ErrorToastKey[],
    info: Object.keys(infoToasts) as InfoToastKey[]
  }

  // Handle predefined toast
  const handlePredefinedToast = (type: keyof typeof toastKeys, key: string) => {
    switch (type) {
      case 'success':
        toast.success(key as SuccessToastKey)
        break
      case 'error':
        toast.error(key as ErrorToastKey)
        break
      case 'info':
        toast.info(key as InfoToastKey)
        break
    }
  }

  // Handle custom toast
  const handleCustomToast = () => {
    if (!title || !message) {
      toast.showError(new Error('Title and message are required'))
      return
    }

    switch (variant) {
      case 'success':
        toast.showSuccess(title, message)
        break
      case 'destructive':
        toast.showErrorWithTitle(title, message)
        break
      default:
        toast.showInfo(title, message)
    }
  }

  // Handle action toast
  const handleActionToast = () => {
    toast.showAction(
      'This is an action toast',
      <div className="flex gap-2">
        <Button size="sm" onClick={() => toast.success('emailVerified')}>
          Confirm
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.info('maintenance')}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Toast Playground</CardTitle>
        <CardDescription>
          Try out different toast notifications with live preview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predefined">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predefined">Predefined</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Predefined Toasts */}
          <TabsContent value="predefined" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Success Toasts</h3>
                <div className="flex gap-2">
                  {toastKeys.success.map((key) => (
                    <Button
                      key={key}
                      size="sm"
                      onClick={() => handlePredefinedToast('success', key)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Error Toasts</h3>
                <div className="flex gap-2">
                  {toastKeys.error.map((key) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="destructive"
                      onClick={() => handlePredefinedToast('error', key)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Info Toasts</h3>
                <div className="flex gap-2">
                  {toastKeys.info.map((key) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      onClick={() => handlePredefinedToast('info', key)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Custom Toasts */}
          <TabsContent value="custom" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter toast title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter toast message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="variant">Variant</Label>
                <Select
                  value={variant}
                  onValueChange={(value: typeof variant) => setVariant(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="destructive">Destructive</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCustomToast}>Show Toast</Button>
            </div>
          </TabsContent>

          {/* Action Toasts */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Try out toasts with interactive actions
              </p>
              <Button onClick={handleActionToast}>Show Action Toast</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}