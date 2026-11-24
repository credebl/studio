'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserNav } from '@/components/layout/user-nav'
import { usePathname } from 'next/navigation'

const pageTitles = [
  { prefix: '/holder/credentials', title: 'Credentials' },
  { prefix: '/holder/offers', title: 'Redeem offer' },
  { prefix: '/holder/proofs', title: 'Proof requests' },
  { prefix: '/holder/connections', title: 'Connections' },
  { prefix: '/holder/dids', title: 'DIDs' },
  { prefix: '/holder/onboarding', title: 'Set up your wallet' },
  { prefix: '/holder', title: 'Overview' },
]

export function HolderHeader(): React.JSX.Element {
  const pathname = usePathname()
  const currentPage = pageTitles.find((page) =>
    pathname.startsWith(page.prefix),
  )

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="text-muted-foreground flex items-center gap-2 px-4 text-sm">
        <SidebarTrigger className="-ml-1" />
        <span>My Wallet</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground font-medium">
          {currentPage?.title ?? 'Overview'}
        </span>
      </div>
      <div className="px-4">
        <UserNav />
      </div>
    </header>
  )
}
