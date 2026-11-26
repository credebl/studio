'use client'

import ModeToggle from '@/components/mode-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserNav } from '@/components/layout/user-nav'
import { adminPageTitles } from '@/components/layout/admin-nav'
import { usePathname } from 'next/navigation'

export function AdminHeader(): React.JSX.Element {
  const pathname = usePathname()
  const currentPage = adminPageTitles.find((page) =>
    pathname.startsWith(page.prefix),
  )

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="text-muted-foreground flex items-center gap-2 px-4 text-sm">
        <SidebarTrigger className="-ml-1" />
        <span>Platform Administration</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground font-medium">
          {currentPage?.title ?? 'Dashboard'}
        </span>
      </div>

      <div className="flex items-center gap-2 px-4">
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  )
}
