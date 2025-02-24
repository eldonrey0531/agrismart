import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  {
    title: 'General',
    href: '/dashboard/profile',
  },
  {
    title: 'Security',
    href: '/dashboard/profile/security',
  },
  {
    title: 'Notifications',
    href: '/dashboard/profile/notifications',
  },
  {
    title: 'API Keys',
    href: '/dashboard/profile/api-keys',
  }
]

export function ProfileNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
            pathname === item.href
              ? 'bg-accent'
              : 'text-muted-foreground'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}