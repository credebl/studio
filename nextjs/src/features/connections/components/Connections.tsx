'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { useAppSelector } from '@/lib/hooks';
import { IConnectionList } from '../types/connections-interface';
import {
  IConnectionListAPIParameter,
  getConnectionsByOrg
} from '@/app/api/connection';
import { dateConversion } from '@/utils/DateConversion';
import { apiStatusCodes } from '@/config/CommonConstant';
import { RotateCcwIcon } from 'lucide-react';
import { IconSearch } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyMessage } from '@/components/EmptyMessage';
import DateTooltip from '@/components/DateTooltip';

const initialPageState = {
  itemPerPage: 10,
  page: 1,
  search: '',
  sortBy: 'createDateTime',
  sortingOrder: 'desc',
  allSearch: ''
};

const Connections = () => {
  const orgId = useAppSelector((state) => state.organization.orgId);
  const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
  const [connectionList, setConnectionList] = useState<IConnectionList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const [paginationInfo, setPaginationInfo] = useState({
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: 1,
    previousPage: 0,
    lastPage: 1
  });

  const getConnections = async (apiParameter: IConnectionListAPIParameter) => {
    try {
      setLoading(true);

      if (orgId) {
        const response = await getConnectionsByOrg({
          orgId,
          page: apiParameter.page,
          itemPerPage: apiParameter.itemPerPage,
          search: apiParameter.search,
          sortBy: apiParameter.sortBy,
          sortingOrder: apiParameter.sortingOrder
        });

        const { data } = response as any;

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setConnectionList(data.data.data || []);
          setPaginationInfo({
            totalItems: data.data.totalItems,
            hasNextPage: data.data.hasNextPage,
            hasPreviousPage: data.data.hasPreviousPage,
            nextPage: data.data.nextPage,
            previousPage: data.data.previousPage,
            lastPage: data.data.lastPage
          });
        } else {
          setConnectionList([]);
        }
      } else {
        setConnectionList([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      getConnections(listAPIParameter);
    }
  }, [listAPIParameter, orgId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchText(value);
    setListAPIParameter((prev) => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleSortChange = (value: string) => {
    setListAPIParameter((prev) => ({
      ...prev,
      sortingOrder: value,
      page: 1
    }));
  };

  const handleRefresh = () => {
    getConnections(listAPIParameter);
  };

  const onPageChange = (page: number) => {
    setListAPIParameter((prev) => ({
      ...prev,
      page
    }));
  };

  return (
    <div className='p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Connections</h1>

      <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='relative w-full max-w-sm'>
          <Input
            type='text'
            placeholder='Search...'
            value={searchText}
            onChange={handleSearchChange}
            className='bg-background text-muted-foreground focus-visible:ring-primary h-10 rounded-lg pr-4 pl-10 text-sm shadow-sm focus-visible:ring-1'
          />
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
        </div>

        <div className='flex items-center gap-3'>
          <Button variant='outline' size='icon' onClick={handleRefresh}>
            <RotateCcwIcon className='h-5 w-5' />
          </Button>

          <Select
            value={listAPIParameter.sortingOrder}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className='bg-background w-[140px] rounded-lg px-3 py-2 text-sm shadow-sm'>
              <SelectValue placeholder='Sort' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='desc'>Descending</SelectItem>
              <SelectItem value='asc'>Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-300 shadow-sm'>
        <Table>
          <TableHeader className='bg-muted'>
            <TableRow>
              <TableHead className='text-muted-foreground'>USER</TableHead>
              <TableHead className='text-muted-foreground'>
                CONNECTION ID
              </TableHead>
              <TableHead className='text-muted-foreground'>
                CREATED ON
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-32' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                </TableRow>
              ))
            ) : connectionList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className='p-6 text-center'>
                  <EmptyMessage
                    title='No Connections'
                    description="You don't have any connections yet."
                    height='250px'
                  />
                </TableCell>
              </TableRow>
            ) : (
              connectionList.map((connection) => (
                <TableRow
                  key={connection.connectionId}
                  className='hover:bg-muted/100'
                >
                  <TableCell>
                    {connection.theirLabel || 'Not available'}
                  </TableCell>
                  <TableCell>{connection.connectionId}</TableCell>
                  <TableCell>
                    <DateTooltip date={connection.createDateTime}>
                      <span className='cursor-default'>
                        {dateConversion(connection.createDateTime)}
                      </span>
                    </DateTooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {connectionList.length > 0 && (
        <div className='mt-6'>
          <Pagination className='justify-end'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    paginationInfo.hasPreviousPage &&
                    onPageChange(paginationInfo.previousPage)
                  }
                />
              </PaginationItem>

              {Array.from({ length: paginationInfo.lastPage }, (_, index) => {
                const page = index + 1;
                const isActive = page === listAPIParameter.page;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      className={
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : ''
                      }
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    paginationInfo.hasNextPage &&
                    onPageChange(paginationInfo.nextPage)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Connections;
