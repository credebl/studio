'use client'

import React, { useEffect, useState } from 'react'
import { currentPageNumber, itemPerPage } from '@/config/CommonConstant'
import { setOrgId, setOrgInfo } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import AppLauncher from '../AppLauncher'
import { Breadcrumbs } from '../breadcrumbs'
import { OrgSwitcher } from '../org-switcher'
import { Organisation } from '@/features/dashboard/type/organization'
import { SidebarTrigger } from '../ui/sidebar'
import { UserNav } from './user-nav'
import { getOrganizations } from '@/app/api/organization'

const enableAppLauncher = process.env.NEXT_PUBLIC_ENABLE_APP_LAUNCHER === 'true'

export default function Header(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const [orgList, setOrgList] = useState<Organisation[]>([])
  const tenantId = useAppSelector((state) => state.organization.orgId)

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await getOrganizations(currentPageNumber, itemPerPage)
        if (
          typeof response !== 'string' &&
          response?.data?.data?.organizations
        ) {
          const orgs = response.data.data.organizations
          setOrgList(orgs)

          if (orgs.length > 0) {
            const defaultOrg =
              orgs.find((org: { id: string }) => org.id === tenantId) || orgs[0]

            dispatch(setOrgId(defaultOrg.id))
            dispatch(
              setOrgInfo({
                id: defaultOrg.id,
                name: defaultOrg.name,
                description: defaultOrg.description,
                logoUrl: defaultOrg.logoUrl,
                appLaunchDetails: defaultOrg.appLaunchDetails,
                roles:
                  defaultOrg.userOrgRoles?.map(
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
        console.error('Error fetching organizations:', err)
      }
    }

    fetchOrganizations()
  }, [])

  const handleSwitchTenant = (orgId: string): void => {
    const selected = orgList.find((org) => org.id === orgId)
    if (selected) {
      dispatch(setOrgId(selected.id))
      dispatch(
        setOrgInfo({
          id: selected.id,
          name: selected.name,
          description: selected.description,
          logoUrl: selected.logoUrl,
          roles:
            selected.userOrgRoles?.map(
              (role: { orgRole: { name: string } }) => role?.orgRole?.name,
            ) || [],
        }),
      )
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <OrgSwitcher
          tenants={orgList.map((org) => ({
            id: org.id,
            name: org.name,
            logoUrl: org.logoUrl,
          }))}
          defaultTenant={orgList.length > 0 ? orgList[0] : undefined}
          onTenantSwitch={handleSwitchTenant}
        />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 px-4">
        {enableAppLauncher && <AppLauncher />}

        {/* NOTE: Currently disabling search and mode toggle */}
        <div className="hidden md:flex">{/* <SearchInput /> */}</div>
        {/* <ModeToggle /> */}
        <UserNav />
      </div>
    </header>
  )
}
