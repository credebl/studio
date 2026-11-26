'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { ACTIVE_THEME } from '@/lib/theme-assets'
import { Icons } from '@/components/icons'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

const APP_ENV = ACTIVE_THEME

type HolderNavItem = {
  title: string
  url: string
  icon: keyof typeof Icons
}

type HolderNavSection = {
  label: string
  items: HolderNavItem[]
}

const holderNavSections: HolderNavSection[] = [
  {
    label: 'Wallet',
    items: [
      { title: 'Overview', url: '/holder', icon: 'dashboard' },
      { title: 'Credentials', url: '/holder/credentials', icon: 'billing' },
      { title: 'DIDs', url: '/holder/dids', icon: 'settings' },
    ],
  },
  {
    label: 'Interactions',
    items: [
      { title: 'Connections', url: '/holder/connections', icon: 'connections' },
      { title: 'Redeem offer', url: '/holder/offers', icon: 'wallet' },
      { title: 'Proof requests', url: '/holder/proofs', icon: 'post' },
    ],
  },
]

const isActiveRoute = (pathname: string, url: string): boolean => {
  if (url === '/holder') {
    return pathname === url
  }
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function HolderSidebar(): React.JSX.Element {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const { data: session } = useSession()

  const hasOrgAccess = session?.hasOrgAccess === true
  const isPlatformAdmin = session?.isPlatformAdmin === true

  const logoImageSrc =
    resolvedTheme === 'dark'
      ? `/logos/${APP_ENV}_logo_dark.svg`
      : `/logos/${APP_ENV}_logo.svg`
  const collapsedLogoImageSrc = `/favicons/favicon-${APP_ENV}.ico`

  const renderNavItem = (item: HolderNavItem): React.JSX.Element => {
    const Icon = Icons[item.icon]

    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isActiveRoute(pathname, item.url)}
          className="data-[active=true]:bg-primary data-[active=true]:hover:bg-primary/90 data-[active=true]:text-primary-foreground dark:data-[active=true]:bg-sidebar-accent dark:data-[active=true]:hover:bg-sidebar-accent dark:data-[active=true]:text-sidebar-accent-foreground dark:data-[active=true]:shadow-glow dark:data-[active=true]:before:bg-sidebar-ring relative dark:data-[active=true]:before:absolute dark:data-[active=true]:before:inset-y-1.5 dark:data-[active=true]:before:left-0 dark:data-[active=true]:before:w-0.5 dark:data-[active=true]:before:rounded-full"
        >
          <Link href={item.url}>
            <Icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-border border-b">
        <Link
          href="/holder"
          aria-label="Go to holder wallet overview"
          className="flex h-12 items-center justify-center"
        >
          <Image
            height={40}
            width={150}
            alt="CREDEBL"
            src={logoImageSrc}
            className="h-8 w-auto object-contain group-data-[collapsible=icon]:hidden"
          />
          <Image
            height={32}
            width={32}
            alt="CREDEBL"
            src={collapsedLogoImageSrc}
            className="hidden size-8 object-contain group-data-[collapsible=icon]:block"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {holderNavSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>{section.items.map(renderNavItem)}</SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-border border-t">
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            {renderNavItem({
              title: 'Profile',
              url: '/holder/profile',
              icon: 'user',
            })}
          </SidebarMenu>
        </SidebarGroup>

        {(hasOrgAccess || isPlatformAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel>Switch context</SidebarGroupLabel>
            <SidebarMenu>
              {hasOrgAccess && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Organization console">
                    <Link href="/dashboard">
                      <Icons.organization />
                      <span>Organization console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isPlatformAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Platform console">
                    <Link href="/admin">
                      <Icons.world />
                      <span>Platform console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
