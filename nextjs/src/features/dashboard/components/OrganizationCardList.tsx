'use client';

import { useEffect, useState } from 'react';
import { Eye, Edit, Trash, MoreVertical, Plus } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrganizations } from '@/app/api/organization';
import { Organization } from '@/features/dashboard/type/organization';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';


const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  total: 1,
  totalCount: 0
};

const OrganizationCardList = () => {
  const [orgList, setOrgList] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPageState);
  
  const router = useRouter();

  const onPageChange = (page: number) => {
    setCurrentPage({
      ...currentPage,
      pageNumber: page,
    });
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getOrganizations(
        currentPage.pageNumber,
        currentPage.pageSize,
        searchTerm,
        ''
      );
      if (typeof response !== 'string' && response?.data?.data?.organizations) {
        setOrgList(response.data.data.organizations);
        setCurrentPage({
          ...currentPage,
          total: response.data.data.totalPages || 1,
          totalCount: response.data.data.totalCount || 0
        });
      } else {
        setOrgList([]);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage.pageNumber, currentPage.pageSize, searchTerm]);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='space-y-1'>
          <div className='flex items-center gap-x-2'>
            <CardTitle>Organizations</CardTitle>
            <Badge>
              {currentPage.totalCount}
            </Badge>
          </div>
          <CardDescription>Manage your organizations</CardDescription>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' /> New Organization
        </Button>
      </CardHeader>

      <CardContent className='pb-2'>
        {loading ? (
          <div className='space-y-4'>
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg p-3'
              >
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-20' />
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-8 w-8 rounded-md' />
                  <Skeleton className='h-8 w-8 rounded-md' />
                  <Skeleton className='h-8 w-8 rounded-md' />
                  <Skeleton className='h-8 w-8 rounded-md' />
                </div>
              </div>
            ))}
          </div>
        ) : orgList.length === 0 ? (
          <div className='text-muted-foreground px-6 py-4'>
            No organizations found.
          </div>
        ) : (
          <div className='space-y-4'>
            {orgList.map((org) => (
              <div
                key={org.id}
                className='hover:bg-muted/50 flex items-center justify-between p-3 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  {org.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={org.logoUrl}
                      alt='Org Logo'
                      className='h-10 w-10 rounded-full object-cover'
                    />
                  ) : (
                    <div className='flex h-10 w-10 items-center justify-center rounded-full'>
                      {org.name?.[0]?.toUpperCase() || 'O'}
                    </div>
                  )}
                  <div>
                    <div className='font-medium'>{org.name}</div>
                    <div className='text-muted-foreground'>
                      {org.userOrgRoles?.map((role, index) => (
                        <span key={index}>
                          {role.orgRole.name}
                          {index < org.userOrgRoles.length - 1 ? ', ' : ''}
                        </span>
                      )) || 'Admin'}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' size='icon'>
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <Trash className='h-4 w-4' />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                      <DropdownMenuItem className='text-destructive'>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {currentPage.total > 1 && (
        <div className="flex items-center justify-end px-6 py-4">
          {/* <Pagination
            currentPage={currentPage.pageNumber}
            onPageChange={onPageChange}
            totalPages={currentPage.total}
          /> */}
        </div>
      )}

      <CardFooter className='mt-auto justify-end pt-2'>
        <Button
          onClick={() => router.push('/organizations')}
        >
          View all
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrganizationCardList;
