import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/hooks'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  Store,
  ShieldAlert,
  Database,
  BarChart
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: 'ADMIN' | 'MODERATOR'
  requiredAccountLevel?: 'SELLER'
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Activity',
    href: '/dashboard/activity',
    icon: Activity
  },
  {
    label: 'Store',
    href: '/dashboard/store',
    icon: Store,
    requiredAccountLevel: 'SELLER'
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
    requiredRole: 'MODERATOR'
  },
  {
    label: 'Monitoring',
    href: '/dashboard/monitoring',
    icon: Database,
    requiredRole: 'ADMIN'
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart,
    requiredRole: 'ADMIN'
  },
  {
    label: 'Security',
    href: '/dashboard/security',
    icon: ShieldAlert,
    requiredRole: 'ADMIN'
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export function DashboardNav() {
  const pathname = usePathname()
  const auth = useAuth()

  // Filter nav items based on user's role and account level
  const filteredNavItems = navItems.filter(item => {
    if (item.requiredRole && !auth.hasRole(item.requiredRole)) {
      return false
    }
    if (item.requiredAccountLevel && !auth.hasAccountLevel(item.requiredAccountLevel)) {
      return false
    }
    return true
  })

  return (
    <nav className="grid items-start gap-2">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              pathname === item.href && "bg-muted font-medium"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  )
}

// Dashboard sidebar that includes the nav and user info
export function DashboardSidebar() {
  const auth = useAuth()

  return (
    <div className="border-r bg-card w-64 p-6 space-y-6">
      {/* User Info */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {auth.email || 'Dashboard'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {auth.role.charAt(0) + auth.role.slice(1).toLowerCase()}
          {auth.accountLevel === 'SELLER' && ' • Seller'}
        </p>
      </div>

      {/* Navigation */}
      <DashboardNav />

      {/* Footer Info */}
      <div className="fixed bottom-6">
        <p className="text-sm text-muted-foreground px-2">
          v1.0.0
        </p>
      </div>
    </div>
  )
}

export default DashboardSidebar