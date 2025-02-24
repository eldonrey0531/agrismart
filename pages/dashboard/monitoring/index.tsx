import { Suspense } from 'react'
import { AdminRoute } from '@/components/auth/protected-route'
import { DatabaseMonitor } from '@/components/dashboard/database-monitor'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Loading states for each section
function SystemStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MonitoringContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Monitoring</h1>
      
      <div className="grid gap-6">
        {/* System Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <Suspense fallback={<SystemStatsLoading />}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4GB</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">67%</div>
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </section>

        {/* Database Monitoring */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <DatabaseMonitor />
          </Suspense>
        </section>

        {/* Active Users */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Active Users</h2>
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">1,234</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Users online in the last 5 minutes
                  </div>
                </div>
              </CardContent>
            </Card>
          </Suspense>
        </section>
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  return (
    <AdminRoute
      fallback="/dashboard"
      loadingComponent={
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <SystemStatsLoading />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[200px]" />
        </div>
      }
    >
      <div className="p-6">
        <MonitoringContent />
      </div>
    </AdminRoute>
  )
}

// Metadata
export const metadata = {
  title: 'System Monitoring | Admin Dashboard',
  description: 'System monitoring and health status for administrators',
}