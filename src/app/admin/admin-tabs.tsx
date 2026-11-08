'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const tabs = [
  { title: 'Overview', href: '/admin' },
  { title: 'Invitations', href: '/admin/invitations' },
  { title: 'Settings', href: '/admin/settings' },
] as const

export function AdminTabs(): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Platform administration"
      className="border-border flex gap-1 border-b"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/admin'
            ? pathname === tab.href
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {tab.title}
          </Link>
        )
      })}
    </nav>
  )
}
