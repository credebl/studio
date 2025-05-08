'use client';

import * as React from 'react';

import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react';
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

interface Tenant {
  id: string;
  name: string;
}

export function OrgSwitcher({
  tenants,
  defaultTenant,
  onTenantSwitch,
}: {
  tenants: Tenant[];
  defaultTenant: Tenant;
  onTenantSwitch?: (tenantId: string) => void;
}) {
  const dispatch = useAppDispatch();
  
  const selectedOrgId = useAppSelector((state) => state.organization.orgId);
  
  const currentTenant = React.useMemo(() => {
    if (selectedOrgId) {
      const found = tenants.find(tenant => tenant.id === selectedOrgId);
      if (found) return found;
    }
    
    return defaultTenant ?? (tenants.length > 0 ? tenants[0] : undefined);
  }, [selectedOrgId, tenants, defaultTenant]);

  const handleTenantSwitch = (tenant: Tenant) => {
    dispatch(setOrgId(tenant.id));
    
    if (onTenantSwitch) {
      onTenantSwitch(tenant.id);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <GalleryVerticalEnd className='size-4' />
              </div>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span>{currentTenant?.name ?? 'Select Organization'}</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
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
              >
                {tenant.name}
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
