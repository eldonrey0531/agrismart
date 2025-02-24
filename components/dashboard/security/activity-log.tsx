import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { ActivityLogItem } from './activity-log-item'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { groupByDate, formatDateHeading } from '@/lib/utils/date'
import { SecurityEventType } from '@/lib/utils/security-logger'

interface SecurityEvent {
  id: string
  type: SecurityEventType
  timestamp: Date
  ipAddress: string
  userAgent: string
  details?: string
  success: boolean
}

interface DateGroupedEvents {
  [key: string]: SecurityEvent[]
}

export function ActivityLog() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchEvents() {
    try {
      setRefreshing(true)
      setError(null)
      const response = await fetch('/api/user/security/events')
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events.map((event: SecurityEvent) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      })))
    } catch (error) {
      console.error('Failed to fetch security events:', error)
      setError('Failed to load security events. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const groupedEvents: DateGroupedEvents = groupByDate(events)
  const dates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading security events...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Security Activity</CardTitle>
            <CardDescription>
              Recent security events and login activity
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-6 text-sm text-destructive">
            {error}
          </div>
        ) : dates.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No security events found
          </p>
        ) : (
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date} className="space-y-4">
                <h4 className="text-sm font-medium">
                  {formatDateHeading(new Date(date))}
                </h4>
                <div className="space-y-2">
                  {groupedEvents[date]
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map(event => (
                      <ActivityLogItem
                        key={event.id}
                        type={event.type}
                        timestamp={event.timestamp}
                        ipAddress={event.ipAddress}
                        userAgent={event.userAgent}
                        details={event.details}
                        success={event.success}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}