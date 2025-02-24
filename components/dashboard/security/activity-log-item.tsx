import { relativeTime, formatDate, cn } from '@/lib/utils'
import { Shield, LogIn, Key, AlertTriangle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { SecurityEventType } from '@/lib/utils/security-logger'

interface ActivityLogItemProps {
  type: SecurityEventType
  timestamp: Date
  ipAddress: string
  userAgent: string
  details?: string
  success?: boolean
}

const eventConfig: Record<SecurityEventType, { icon: any; label: string; variant?: 'default' | 'destructive' }> = {
  PASSWORD_CHANGE: {
    icon: Key,
    label: 'Password changed',
    variant: 'default'
  },
  PASSWORD_CHANGE_ATTEMPT: {
    icon: Key,
    label: 'Password change attempted',
    variant: 'destructive'
  },
  LOGIN_SUCCESS: {
    icon: LogIn,
    label: 'Successful login',
    variant: 'default'
  },
  LOGIN_FAILURE: {
    icon: AlertTriangle,
    label: 'Failed login attempt',
    variant: 'destructive'
  },
  TWO_FACTOR_ENABLED: {
    icon: Shield,
    label: '2FA enabled',
    variant: 'default'
  },
  TWO_FACTOR_DISABLED: {
    icon: Shield,
    label: '2FA disabled',
    variant: 'destructive'
  }
}

export function ActivityLogItem({
  type,
  timestamp,
  ipAddress,
  userAgent,
  details,
  success = true
}: ActivityLogItemProps) {
  const config = eventConfig[type]
  const Icon = config?.icon || Shield
  const variant = success ? 'default' : 'destructive'
  const timeString = relativeTime(timestamp, 'en')

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="flex items-start space-x-4 p-4">
        <div className="mt-0.5">
          <Icon className={cn(
            'h-5 w-5',
            variant === 'destructive' ? 'text-destructive' : 'text-primary'
          )} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant={variant}>
              {config?.label || 'Security Event'}
            </Badge>
          </div>
          <CardDescription>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <time 
                  dateTime={timestamp.toISOString()} 
                  className="text-sm cursor-help hover:underline"
                >
                  {timeString}
                </time>
              </TooltipTrigger>
              <TooltipContent side="top">
                {formatDate(timestamp)}
              </TooltipContent>
            </Tooltip>
            <div className="text-xs mt-1">
              <span className="font-medium">IP:</span> {ipAddress}
              <span className="mx-1.5">•</span>
              <span className="font-mono">{userAgent}</span>
            </div>
            {details && (
              <div className="text-xs mt-1 text-muted-foreground">
                {details}
              </div>
            )}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}