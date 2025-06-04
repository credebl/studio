'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import React, { useEffect, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
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
import { setOrgId, setOrgInfo } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { IconChevronRight } from '@tabler/icons-react'
import { Icons } from '../icons'
import Image from 'next/image'
import Link from 'next/link'
import { NavItem } from '../../../types'
import { Organization } from '@/features/dashboard/type/organization'
import { getOrganizations } from '@/app/api/organization'
import { navItems } from '@/constants/data'
import { setSidebarCollapsed } from '@/lib/sidebarSlice'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useThemeConfig } from '../active-theme'

export default function AppSidebar(): React.JSX.Element {
  const pathname = usePathname()

  const { activeTheme } = useThemeConfig()
  const { resolvedTheme } = useTheme()

  const logoImageSrc = ((): string => {
    if (activeTheme === 'credebl') {
      return resolvedTheme === 'dark'
        ? '/images/CREDEBL_Logo_Web_Dark.svg'
        : '/images/CREDEBL_Logo_Web.svg'
    } else {
      return resolvedTheme === 'dark'
        ? '/images/sovio_dark_theme_logo.svg'
        : '/images/sovio_logo.svg'
    }
  })()

  const collapsedLogoImageSrc =
    activeTheme === 'credebl'
      ? '/images/favicon-credebl.ico'
      : '/images/favicon-sovio.ico'

  const dispatch = useAppDispatch()

  const [currentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm] = useState('')
  const [, setOrgList] = useState<Organization[]>([])

  const selectedOrgId = useAppSelector((state) => state.organization.orgId)

  const isCollapsed = useAppSelector((state) => state.sidebar.isCollapsed)

  useEffect(() => {
    dispatch(setSidebarCollapsed(true))
  }, [])

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await getOrganizations(
          currentPage,
          pageSize,
          searchTerm,
          '',
        )
        if (
          typeof response !== 'string' &&
          response?.data?.data?.organizations
        ) {
          const orgs = response.data.data.organizations
          setOrgList(orgs)

          // Only set initial organization if no organization is currently selected in Redux
          if (!selectedOrgId && orgs.length > 0) {
            dispatch(setOrgId(orgs[0]?.id))
            dispatch(
              setOrgInfo({
                id: orgs[0]?.id,
                name: orgs[0]?.name,
                description: orgs[0]?.description,
                logoUrl: orgs[0]?.logoUrl,
                roles:
                  orgs[0]?.userOrgRoles?.map(
                    (role: { orgRole: { name: string } }) =>
                      role?.orgRole?.name,
                  ) || [],
              }),
            )
          }
        } else {
          setOrgList([])
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching organizations:', err)
      }
    }

    fetchOrganizations()
  }, [dispatch, currentPage, pageSize, searchTerm, selectedOrgId])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group" data-collapsed>
        <div className="relative transition-all duration-300">
          {isCollapsed ? (
            <div className="h-[40px] w-[150px] overflow-hidden">
              <Image
                height={40}
                width={150}
                alt="Full Logo"
                className="h-full w-full object-contain"
                src={logoImageSrc}
              />
            </div>
          ) : (
            <div className="hidden h-[40px] w-[40px] group-data-[collapsed=true]:block">
              <Image
                height={40}
                width={40}
                alt="Collapsed Logo"
                className="h-full w-full object-contain"
                src={collapsedLogoImageSrc}
              />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item: NavItem) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo
              return item?.items && item.items.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
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
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
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

      <SidebarRail />
    </Sidebar>
  )
}
