'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { IconChevronRight } from '@tabler/icons-react'
import { Icons } from '@/components/icons'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

const APP_ENV =
  process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || 'credebl'

type AdminNavItem = {
  title: string
  url: string
  icon: keyof typeof Icons
  items?: { title: string; url: string }[]
}

const adminNavItems: AdminNavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: 'dashboard',
  },
  {
    title: 'Ecosystem',
    url: '#',
    icon: 'world',
    items: [
      { title: 'Invitations', url: '/admin/invitations' },
      { title: 'Settings', url: '/admin/settings' },
    ],
  },
]

export function AdminSidebar(): React.JSX.Element {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const { data: session } = useSession()

  const hasOrgAccess = session?.hasOrgAccess === true

  const logoImageSrc =
    resolvedTheme === 'dark'
      ? `/logos/${APP_ENV}_logo_dark.svg`
      : `/logos/${APP_ENV}_logo.svg`
  const collapsedLogoImageSrc = `/favicons/favicon-${APP_ENV}.ico`

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-border border-b">
        <Link
          href="/admin"
          aria-label="Go to platform dashboard"
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
        <SidebarGroup>
          <SidebarMenu>
            {adminNavItems.map((item) => {
              const Icon = Icons[item.icon]

              if (item.items?.length) {
                const groupActive = item.items.some((subItem) =>
                  pathname.startsWith(subItem.url),
                )

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={groupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <Icon />
                          <span>{item.title}</span>
                          <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                                className="data-[active=true]:bg-primary data-[active=true]:hover:bg-primary/90 data-[active=true]:text-primary-foreground dark:data-[active=true]:bg-sidebar-accent dark:data-[active=true]:hover:bg-sidebar-accent dark:data-[active=true]:text-sidebar-accent-foreground dark:data-[active=true]:shadow-glow dark:data-[active=true]:before:bg-sidebar-ring relative dark:data-[active=true]:before:absolute dark:data-[active=true]:before:inset-y-1.5 dark:data-[active=true]:before:left-0 dark:data-[active=true]:before:w-0.5 dark:data-[active=true]:before:rounded-full"
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-primary data-[active=true]:hover:bg-primary/90 data-[active=true]:text-primary-foreground dark:data-[active=true]:bg-sidebar-accent dark:data-[active=true]:hover:bg-sidebar-accent dark:data-[active=true]:text-sidebar-accent-foreground dark:data-[active=true]:shadow-glow dark:data-[active=true]:before:bg-sidebar-ring relative dark:data-[active=true]:before:absolute dark:data-[active=true]:before:inset-y-1.5 dark:data-[active=true]:before:left-0 dark:data-[active=true]:before:w-0.5 dark:data-[active=true]:before:rounded-full"
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {hasOrgAccess && (
        <SidebarFooter className="border-border border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Organization console">
                <Link href="/dashboard">
                  <Icons.organization />
                  <span>Organization console</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  )
}
