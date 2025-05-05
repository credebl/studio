'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosResponse } from 'axios';

import { getOrganizations } from '@/app/api/organization';
import { Organization } from '@/features/dashboard/type/organization';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiStatusCodes } from '@/config/CommonConstant';
import { Plus } from 'lucide-react';

export const OrganizationList = () => {
  const [organizationsList, setOrganizationsList] = useState<Organization[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const [currentPage, setCurrentPage] = useState({
    pageNumber: 1,
    pageSize: 9,
    total: 0,
    totalCount: 0
  });

  const router = useRouter();

  const getAllOrganizations = async () => {
    setLoading(true);
    try {
      const response = await getOrganizations(
        currentPage.pageNumber,
        currentPage.pageSize,
        searchText
      );

      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages;
        const totalCount = data?.data?.totalCount;

        const orgList = data?.data?.organizations.map(
          (userOrg: Organization) => {
            const roles: string[] = userOrg.userOrgRoles.map(
              (role) => role.orgRole.name
            );
            return {
              ...userOrg,
              roles
            };
          }
        );

        setOrganizationsList(orgList);
        setCurrentPage((prev) => ({
          ...prev,
          total: totalPages,
          totalCount
        }));
      } else {
        setError(response as string);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleCardClick = (orgId: string) => {
    if (!orgId) {
      console.error('Invalid organization ID');
      return;
    }
    router.push(`/organizations/dashboard/${orgId}`);
  };
  const handleCreateOrg = () => {
    router.push('organizations/create-organization');
  };

  useEffect(() => {
    getAllOrganizations();
  }, [currentPage.pageNumber, currentPage.pageSize, searchText]);

  return (
    <div className='space-y-6'>
      <div className='mx-8 mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Organizations</h1>
        <div className='flex items-center gap-4'>
          <Input
            placeholder='Search'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className='w-64'
          />
          <Button onClick={handleCreateOrg} className="gap-2">
      <Plus className="h-4 w-4" />
      Create Organization
    </Button>
        </div>
      </div>

      <div className='mx-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {loading ? (
          <div className=''>Loading organizations...</div>
        ) : organizationsList.length > 0 ? (
          organizationsList.map((org) => (
            <Card
              key={org.id}
              onClick={() => handleCardClick(org.id)}
              className='cursor-pointer p-6 transition-all hover:shadow-md'
            >
               <div className="flex items-start gap-4">
                <Avatar className='h-16 w-16 rounded-md'>
                  {org.logoUrl ? (
                    <AvatarImage src={org.logoUrl} alt={org.name} />
                  ) : (
                    <AvatarFallback className='text-2xl font-bold'>
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className='flex-1'>
                  <h3 className='text-lg font-semibold'>{org.name}</h3>
                  <p className=''>{org.description}</p>
                  <div className='mt-2 text-sm'>
                    Role(s):{' '}
                    <span className='rounded-full px-2 py-1 text-xs'>
                      {org.userOrgRoles[0].orgRole.name || 'No Role'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className=''>No organizations found.</div>
        )}
      </div>

      <div className='mt-6 flex items-center justify-between px-8'>
        <div className='text-muted-foreground text-sm'>
          Showing {(currentPage.pageNumber - 1) * currentPage.pageSize + 1} to{' '}
          {Math.min(
            currentPage.pageNumber * currentPage.pageSize,
            currentPage.totalCount
          )}{' '}
          of {currentPage.totalCount} entries
        </div>

        {organizationsList && organizationsList.length > 0 && (
          <div>
            <Pagination>
              <PaginationContent className='gap-1'>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage.pageNumber > 1 &&
                      handlePageChange(currentPage.pageNumber - 1)
                    }
                    className={
                      currentPage.pageNumber === 1
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>

                {Array.from({ length: currentPage.total }, (_, index) => (
                  <PaginationItem key={index}>
                    <Button
                      variant={
                        currentPage.pageNumber === index + 1
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage.pageNumber < currentPage.total &&
                      handlePageChange(currentPage.pageNumber + 1)
                    }
                    className={
                      currentPage.pageNumber === currentPage.total
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};
