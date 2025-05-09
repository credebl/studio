import React, { useEffect, useState } from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import { UserNav } from './user-nav';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import { OrgSwitcher } from '../org-switcher';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getOrganizations } from '@/app/api/organization';
import { setOrgId, setOrgInfo } from '@/lib/orgSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const [currentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm] = useState('');
  const [orgList, setOrgList] = useState<any[]>([]);
  const tenantId = useAppSelector((state) => state.organization.orgId);

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

          const defaultOrg =
            orgs.find((org: { id: string }) => org.id === tenantId) || orgs[0];

          dispatch(setOrgId(defaultOrg.id));
          dispatch(
            setOrgInfo({
              id: defaultOrg.id,
              name: defaultOrg.name,
              description: defaultOrg.description,
              logoUrl: defaultOrg.logoUrl,
              roles:
                defaultOrg.userOrgRoles?.map(
                  (role: any) => role?.orgRole?.name
                ) || []
            })
          );
        } else {
          setOrgList([]);
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    };

    fetchOrganizations();
  }, [dispatch, currentPage, pageSize, searchTerm, tenantId]);

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
    }
  };

  const activeTenant = tenantId
    ? orgList.find((item) => item.id === tenantId)
    : orgList[0];
  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <OrgSwitcher
          tenants={orgList.map((org) => ({
            id: org.id,
            name: org.name,
            logoUrl: org.logoUrl
          }))}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
        <div className='hidden md:flex'>{/* <SearchInput /> */}</div>
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  );
}
