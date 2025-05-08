'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconChevronRight } from '@tabler/icons-react';

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
import { Icons } from '../icons';
import { navItems } from '@/constants/data';
import { useThemeConfig } from '../active-theme';
import Image from 'next/image';
import { setOrgId, setOrgInfo } from '@/lib/orgSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, useState } from 'react';

import { getOrganizations } from '@/app/api/organization';
export default function AppSidebar() {
  const pathname = usePathname();

  const { activeTheme } = useThemeConfig();

  const logoImageSrc =
    activeTheme === 'credebl'
      ? '/images/CREDEBL_Logo_Web.svg'
      : '/images/sovio_logo.svg';

  // export default function AppSidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [currentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm] = useState('');
  const [orgList, setOrgList] = useState<any[]>([]);

  const selectedOrgId = useAppSelector((state) => state.organization.orgId);

  const selectedOrg = orgList.find((org) => org.id === selectedOrgId) ?? null;

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

          // Only set initial organization if no organization is currently selected in Redux
          if (!selectedOrgId && orgs.length > 0) {
            dispatch(setOrgId(orgs[0]?.id));
            dispatch(
              setOrgInfo({
                id: orgs[0]?.id,
                name: orgs[0]?.name,
                description: orgs[0]?.description,
                logoUrl: orgs[0]?.logoUrl,
                roles:
                  orgs[0]?.userOrgRoles?.map(
                    (role: any) => role?.orgRole?.name
                  ) || []
              })
            );
          }
        } else {
          setOrgList([]);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };

    fetchOrganizations();
  }, [dispatch, currentPage, pageSize, searchTerm, selectedOrgId]);

  const handleSwitchTenant = (orgId: string) => {
    const selected = orgList.find((org) => org.id === orgId);
    if (selected) {
      dispatch(setOrgId(selected.id));
      dispatch(
        setOrgInfo({
          id: selected.id,
          name: selected.name,
          description: selected.description,
          logoUrl: selected.logoUrl,
          roles:
            selected.userOrgRoles?.map((role: any) => role?.orgRole?.name) || []
        })
      );

      router.push(`/organizations/dashboard/${selected.id}`);
    }
  };

  const activeTenant = selectedOrg || orgList[0];

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='h-[40px] w-[150px] overflow-hidden transition-all duration-300 group-data-[collapsed=true]:h-0 group-data-[collapsed=true]:w-0'>
          <Image
            height={40}
            width={150}
            alt='Logo'
            className='h-full w-full object-contain'
            src={logoImageSrc}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item.items.length > 0 ? (
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
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
