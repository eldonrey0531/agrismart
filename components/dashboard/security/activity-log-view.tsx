import { useState } from 'react'
import { useSecurityEvents } from '@/hooks/use-security-events'
import { ActivityLogItem } from './activity-log-item'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  SecurityEventType,
  SecurityEvent,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_SEVERITY
} from '@/types/security'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Loader2,
  RefreshCw,
  Calendar as CalendarIcon,
  AlertTriangle,
  Shield,
  ShieldCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value: value as SecurityEventType,
  label,
  severity: EVENT_TYPE_SEVERITY[value as SecurityEventType]
}))

interface EventCountProps {
  label: string
  count: number
  icon: React.ComponentType<any>
  variant?: 'default' | 'secondary' | 'destructive'
}

function EventCount({ label, count, icon: Icon, variant = 'default' }: EventCountProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <Icon className={cn(
            'h-4 w-4',
            variant === 'destructive' ? 'text-destructive' : 'text-primary'
          )} />
        </div>
        <CardTitle>{count}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export function ActivityLogView() {
  const [eventType, setEventType] = useState<SecurityEventType>()
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const {
    events,
    total,
    hasMore,
    summary,
    loading,
    error,
    refresh,
    fetchEvents
  } = useSecurityEvents()

  const handleFilterChange = async () => {
    setCurrentPage(1)
    await fetchEvents({
      type: eventType,
      from: dateRange.from,
      to: dateRange.to,
      take: itemsPerPage,
      skip: 0
    })
  }

  const loadMore = async () => {
    await fetchEvents({
      type: eventType,
      from: dateRange.from,
      to: dateRange.to,
      take: itemsPerPage,
      skip: currentPage * itemsPerPage
    })
    setCurrentPage(prev => prev + 1)
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
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <EventCount
            label="Last 24 Hours"
            count={summary.recentEvents}
            icon={ShieldCheck}
          />
          <EventCount
            label="Last 7 Days"
            count={summary.totalEvents}
            icon={Shield}
            variant="secondary"
          />
          <EventCount
            label="Failed Attempts"
            count={summary.failedAttempts}
            icon={AlertTriangle}
            variant="destructive"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            value={eventType}
            onValueChange={setEventType}
            onOpenChange={() => eventType && handleFilterChange()}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Events</SelectItem>
              {EVENT_TYPES.map(({ value, label, severity }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center">
                    <Badge variant={severity === 'high' ? 'destructive' : 'default'}>
                      {label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range || {})
                  handleFilterChange()
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Events List */}
        {error ? (
          <div className="text-center py-6 text-destructive">
            <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="mx-auto h-6 w-6 mb-2" />
            No security events found
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
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
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}