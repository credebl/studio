'use client'

import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import React, { useEffect } from 'react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { setOrgId, setOrgRoles, setSelectedOrgId } from '@/lib/orgSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AxiosResponse } from 'axios'
import Image from 'next/image'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationRoles } from '@/app/api/organization'
import { useRouter } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  logoUrl?: string
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch,
}: {
  tenants: Tenant[]
  defaultTenant?: Tenant
  onTenantSwitch?: (tenantId: string) => void
}): React.ReactElement {
  const [selectedTenant, setSelectedTenant] = React.useState<
    Tenant | undefined
  >(defaultTenant ?? tenants[0])

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
    dispatch(setOrgId(tenant.id))
    dispatch(setSelectedOrgId(tenant.id))
    setSelectedTenant(tenant)
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

  useEffect(() => {
    if (selectedOrgId) {
      getRoles(selectedOrgId)
    }
  }, [selectedOrgId])

  useEffect(() => {
    if (selectedOrgId && tenants.length > 0) {
      const found = tenants.find((item) => item.id === selectedOrgId)
      if (found) {
        setSelectedTenant(found)
      }
    }
  }, [selectedOrgId, tenants])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="focus:ring-ring bg-popover hover:bg-popover outline-none hover:text-inherit focus:ring-1!"
          >
            <SidebarMenuButton
              size="lg"
              className="border-ring w-[200px] justify-start gap-2 border"
            >
              {tenants.length > 0 && (
                <div className="bg-popover border-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                  {selectedTenant?.logoUrl ? (
                    <Image
                      src={selectedTenant.logoUrl}
                      alt={selectedTenant.name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
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
            className="w-[--radix-dropdown-menu-trigger-width] border"
            align="start"
          >
            {tenants.length > 0 ? (
              tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onSelect={() => handleTenantSwitch(tenant)}
                  className="flex items-center gap-2"
                >
                  <div className="bg-muted text-foreground flex size-6 shrink-0 items-center justify-center rounded-md">
                    {tenant.logoUrl ? (
                      <Image
                        src={tenant.logoUrl}
                        alt={tenant.name}
                        width={24}
                        height={24}
                        className="rounded object-cover"
                      />
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
              ))
            ) : (
              <>
                <DropdownMenuItem className="text-muted-foreground">
                  No organization found
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() =>
                    router.push('/organizations/create-organization')
                  }
                  className="text-primary-foreground flex cursor-pointer items-center gap-2"
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
