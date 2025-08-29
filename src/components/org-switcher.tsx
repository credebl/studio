'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { setOrgRoles, setSelectedOrgId, setTenantData } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AxiosResponse } from 'axios'
import React from 'react'
import { RootState } from '@/lib/store'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationRoles } from '@/app/api/organization'
import { useRouter } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  logoUrl?: string
}

const OrgSwitcherInner = ({
  tenants,
  defaultTenant,
  onTenantSwitch,
}: {
  tenants: Tenant[]
  defaultTenant?: Tenant
  onTenantSwitch?: (tenantId: string) => void
}): React.ReactElement => {
  const selectedTenant =
    useAppSelector((state: RootState) => state.organization.selectedTenant) ??
    defaultTenant ??
    tenants[0]

  const dispatch = useAppDispatch()
  const router = useRouter()
  const selectedOrgId = useAppSelector((state) => state.organization.orgId)

  const currentTenant = React.useMemo(() => {
    if (selectedOrgId) {
      const found = tenants.find((tenant) => tenant.id === selectedOrgId)
      if (found) {
        return found
      }
    }

    return defaultTenant ?? (tenants.length > 0 ? tenants[0] : undefined)
  }, [selectedOrgId, tenants, defaultTenant])

  const getRoles = async (orgId: string): Promise<void> => {
    try {
      const res = await getOrganizationRoles(orgId)
      const { data } = res as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const roles = data?.data ?? []
        dispatch(setOrgRoles(roles))
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const handleTenantSwitch = (tenant: Tenant): void => {
    dispatch(setSelectedOrgId(tenant.id))
    dispatch(setTenantData(tenant))
    getRoles(tenant.id)
    if (onTenantSwitch) {
      onTenantSwitch(tenant.id)
    }
  }

  function getInitials(name: string = ''): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <SidebarMenu className="w-fit">
      <SidebarMenuItem className="w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="focus:ring-ring bg-card hover:bg-card mx-2 my-2 h-9 rounded-xl border p-2 shadow outline-none hover:text-inherit focus:ring-1!"
          >
            <SidebarMenuButton
              size="lg"
              className="border-ring w-[200px] justify-start gap-2 border"
            >
              {tenants.length > 0 && (
                <div className="bg-popover border-muted flex size-6 min-w-6 items-center justify-center overflow-hidden rounded-full">
                  {selectedTenant?.logoUrl ? (
                    <Avatar className="shrink rounded-md object-contain">
                      {selectedTenant.logoUrl ? (
                        <AvatarImage
                          src={selectedTenant.logoUrl}
                          alt={selectedTenant.name}
                          className="w-full shrink object-contain"
                        />
                      ) : (
                        <AvatarFallback className="text-2xl font-bold">
                          {selectedTenant.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  ) : (
                    <span className="text-sm font-bold">
                      {getInitials(selectedTenant?.name)}
                    </span>
                  )}
                </div>
              )}

              <div className="flex max-w-[200px] min-w-0 flex-col gap-0.5 overflow-hidden leading-none font-semibold">
                <span className="truncate">
                  {tenants.length > 0
                    ? (selectedTenant?.name ?? 'Select Organization')
                    : 'Select Organization'}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] border"
            align="start"
          >
            {tenants.length > 0 ? (
              <div>
                {tenants.map((tenant) => (
                  <DropdownMenuItem
                    key={tenant.id}
                    onSelect={() => handleTenantSwitch(tenant)}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-muted text-foreground flex size-6 shrink-0 items-center justify-center rounded-md">
                      {tenant.logoUrl ? (
                        <Avatar className="shrink rounded-md">
                          {tenant.logoUrl ? (
                            <AvatarImage
                              src={tenant.logoUrl}
                              alt={tenant.name}
                              className="object-contain"
                            />
                          ) : (
                            <AvatarFallback className="text-2xl font-bold">
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      ) : (
                        <span className="text-xs font-semibold">
                          {getInitials(tenant.name)}
                        </span>
                      )}
                    </div>
                    <div className="max-w-[200px] min-w-0 flex-1 truncate">
                      {tenant.name}
                    </div>

                    {tenant.id === currentTenant?.id && (
                      <Check className="ml-auto shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => router.push('/create-organization')}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Plus size={16} />
                  Create Organization
                </DropdownMenuItem>
              </div>
            ) : (
              <>
                <DropdownMenuItem className="text-muted-foreground">
                  No organization found
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => router.push('/create-organization')}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Plus size={16} />
                  Create Organization
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export const OrgSwitcher = React.memo(OrgSwitcherInner)
