'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useEffect } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

import { setOrgId } from '@/lib/orgSlice';
import Image from 'next/image';

interface Tenant {
  id: string;
  name: string;
  logoUrl?: string;
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch
}: {
  tenants: Tenant[];
  defaultTenant: Tenant;
  onTenantSwitch?: (tenantId: string) => void;
}) {
  const tenantId = useAppSelector((state) => state.organization.orgId);
  const [selectedTenant, setSelectedTenant] = React.useState<
    Tenant | undefined
  >(defaultTenant ?? (tenants.length > 0 ? tenants[0] : undefined));

  const dispatch = useAppDispatch();

  const selectedOrgId = useAppSelector((state) => state.organization.orgId);

  const currentTenant = React.useMemo(() => {
    if (selectedOrgId) {
      const found = tenants.find((tenant) => tenant.id === selectedOrgId);
      if (found) {
        return found;
      }
    }

    return defaultTenant ?? (tenants.length > 0 ? tenants[0] : undefined);
  }, [selectedOrgId, tenants, defaultTenant]);

  const handleTenantSwitch = (tenant: Tenant) => {
    dispatch(setOrgId(tenant.id));

    if (onTenantSwitch) {
      onTenantSwitch(tenant.id);
    }
  };

  function getInitials(name: string = '') {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  useEffect(() => {
    if (tenantId && tenants.length > 0) {
      const item = tenants.find((item) => item.id === tenantId);
      if (item) {
        setSelectedTenant(item);
      }
    }
  }, [tenantId, tenants]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-ring w-[200px] justify-start gap-2 border'
            >
              <div className='bg-muted border-muted flex size-8 items-center justify-center overflow-hidden rounded-full border'>
                {selectedTenant?.logoUrl ? (
                  <Image
                    src={selectedTenant.logoUrl}
                    alt={selectedTenant.name}
                    width={32}
                    height={32}
                    className='object-cover'
                  />
                ) : (
                  <span className='text-sm font-bold'>
                    {getInitials(selectedTenant?.name)}
                  </span>
                )}
              </div>

              <div className='flex max-w-[200px] flex-col gap-0.5 overflow-hidden leading-none font-semibold'>
                <span className='truncate'>
                  {selectedTenant?.name ??
                    tenants.find((t) => t.id === tenantId)?.name ??
                    'Select Organization'}
                </span>
                {/* <div className='flex flex-col gap-0.5 leading-none'>
                  <span>{currentTenant?.name ?? 'Select Organization'}</span>
                </div> */}
              </div>

              <ChevronsUpDown className='ml-auto shrink-0' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onSelect={() => handleTenantSwitch(tenant)}
                className='flex items-center gap-2'
              >
                <div className='bg-muted text-foreground flex size-6 items-center justify-center rounded-md'>
                  {tenant.logoUrl ? (
                    <Image
                      src={tenant.logoUrl}
                      alt={tenant.name}
                      width={24}
                      height={24}
                      className='rounded object-cover'
                    />
                  ) : (
                    <span className='text-xs font-semibold'>
                      {getInitials(tenant.name)}
                    </span>
                  )}
                </div>
                <span className='truncate'>{tenant.name}</span>
                {tenant.id === selectedTenant?.id && (
                  <span className='truncate'>{tenant.name}</span>
                )}
                {tenant.id === currentTenant?.id && (
                  <Check className='ml-auto' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
