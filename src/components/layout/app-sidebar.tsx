'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import React, { JSX, useEffect, useState } from 'react'
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
import { currentPageNumber, itemPerPage } from '@/config/CommonConstant'
import { setOrgId, setOrgInfo } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { usePathname, useRouter } from 'next/navigation'

import { IconChevronRight } from '@tabler/icons-react'
import { Icons } from '../icons'
import Image from 'next/image'
import Link from 'next/link'
import { NavItem } from '../../../types'
import { Organization } from '@/features/dashboard/type/organization'
import { getOrganizations } from '@/app/api/organization'
import { navItems } from '@/constants/data'
import { setSidebarCollapsed } from '@/lib/sidebarSlice'
import { useTheme } from 'next-themes'

const APP_ENV =
  process.env.NEXT_PUBLIC_ACTIVE_THEME?.toLowerCase().trim() || 'credebl'

const APP_CONFIG = {
  logo: (theme: string, resolvedTheme: string): string =>
    (resolvedTheme === 'dark'
      ? `/logos/${theme}_logo_dark.svg`
      : `/logos/${theme}_logo.svg`),
  collapsedLogo: (theme: string): string => `/favicons/favicon-${theme}.ico`,
  poweredBy: (theme: string): { src: string; alt: string } | null => {
    if (theme === 'credebl') {
      return null
    }
    return { src: '/images/CREDEBL_Logo_Web.svg', alt: 'Powered by CREDEBL' }
  },
}

export default function AppSidebar(): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()

  const { resolvedTheme } = useTheme()
  const dispatch = useAppDispatch()

  const logoImageSrc = APP_CONFIG.logo(APP_ENV, resolvedTheme || 'light')
  const collapsedLogoImageSrc = APP_CONFIG.collapsedLogo(APP_ENV)
  const poweredBy = APP_CONFIG.poweredBy(APP_ENV)

  const [currentPage] = useState(currentPageNumber)
  const [pageSize] = useState(itemPerPage)
  const [searchTerm] = useState('')

  const selectedOrgId = useAppSelector((state) => state.organization.orgId)
  const isCollapsed = useAppSelector((state) => state.sidebar.isCollapsed)

  useEffect(() => {
    dispatch(setSidebarCollapsed(true))
  }, [dispatch])

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

          if (!selectedOrgId && orgs.length > 0) {
            const [firstOrg]: Organization[] = orgs

            dispatch(setOrgId(firstOrg?.id))
            dispatch(
              setOrgInfo({
                id: firstOrg?.id,
                name: firstOrg?.name,
                description: firstOrg?.description,
                logoUrl: firstOrg?.logoUrl,
                roles:
                  firstOrg?.userOrgRoles?.map(
                    (role: { orgRole: { name: string } }) =>
                      role?.orgRole?.name,
                  ) || [],
              }),
            )
          }
        }
      } catch (err) {
        console.error('Error fetching organizations:', err)
      }
    }

    fetchOrganizations()
  }, [dispatch, currentPage, pageSize, searchTerm, selectedOrgId])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group" data-collapsed>
        <button
          onClick={() => router.push('/dashboard')}
          className="focus-visible:ring-primary relative cursor-pointer rounded transition-all duration-300 focus:outline-none focus-visible:ring-2"
          aria-label="Go to dashboard"
        >
          {isCollapsed ? (
            <div className="h-[40px] w-[150px] overflow-hidden">
              <Image
                height={40}
                width={150}
                alt="Full Logo"
                className="h-auto max-h-[100px] w-auto object-contain"
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
        </button>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item: NavItem): JSX.Element => {
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
                        className="data-[active=true]:bg-primary data-[active=true]:hover:bg-primary/90 data-[active=true]:text-primary-foreground"
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
                              className="data-[active=true]:bg-primary data-[active=true]:hover:bg-primary/90 data-[active=true]:text-primary-foreground"
                            >
                              <Link
                                href={
                                  subItem.title === 'DID'
                                    ? `${subItem.url}?orgId=${selectedOrgId}`
                                    : subItem.url
                                }
                              >
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
                    className="data-[active=true]:bg-primary data-[active=true]:hover:bg-primary/90 data-[active=true]:text-primary-foreground"
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

      {poweredBy && (
        <div className="text-muted-foreground flex items-center justify-center border-t p-3 text-sm group-data-[collapsed=true]:flex-col group-data-[collapsed=true]:gap-1">
          {!isCollapsed ? (
            <Image
              src={'/favicons/favicon-credebl.ico'}
              alt={poweredBy.alt}
              width={30}
              height={30}
              className="h-5 w-auto object-contain"
            />
          ) : (
            <>
              <span className="mr-2">Powered by</span>
              <Image
                src={poweredBy.src}
                alt={poweredBy.alt}
                width={90}
                height={30}
                className="h-5 w-auto object-contain"
              />
            </>
          )}
        </div>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
