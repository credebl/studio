'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

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
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { IconChevronRight, IconPhotoUp } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useEffect, useState } from 'react';
import { getOrganizations } from '@/app/api/organization';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setOrgId } from '@/lib/orgSlice';

// export const company = {
//   name: 'AyanWorks',
//   logo: IconPhotoUp,
//   plan: 'Enterprise'
// };

// const tenants = [
//   { id: '1', name: 'AyanWorks' },
//   { id: '2', name: 'Beta Corp' },
//   { id: '3', name: 'Gamma Ltd' }
// ];

export default function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  // const { isOpen } = useMediaQuery();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm] = useState('');
  const [orgList, setOrgList] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getOrganizations(
          currentPage,
          pageSize,
          searchTerm,
          ''
        );
        if (
          typeof response !== 'string' &&
          response?.data?.data?.organizations
        ) {
          const orgs = response.data.data.organizations;
          setOrgList(orgs);
          setSelectedOrg(orgs[0]);
          dispatch(setOrgId(orgs[0]?.id));
        } else {
          setOrgList([]);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };

    fetchOrganizations();
  }, []);

  const handleSwitchTenant = (orgId: string) => {
    const selected = orgList.find((org) => org.id === orgId);
    if (selected) {
      setSelectedOrg(selected);
      dispatch(setOrgId(selected.id));
    }
  };

  const activeTenant = orgList[0];

  // useEffect(() => {
  //   // Side effects based on sidebar state changes
  // }, [isOpen]);

  // useEffect(() => {
  //   console.log('orgList', orgList);
  //   // Side effects based on sidebar state changes
  // }, [orgList]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={orgList.map((org) => ({
            id: org.id,
            name: org.name
          }))}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
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
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
