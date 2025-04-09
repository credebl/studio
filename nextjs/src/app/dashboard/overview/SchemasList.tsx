'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSchemasByOrgId } from '@/app/api/schema';
import { Calendar, Plus } from 'lucide-react';

const SchemasList = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm] = useState('');
  const [schemas, setSchemas] = useState([]);

  const orgId = '8cc5e6ed-54fa-41ed-9a61-2503899e72fe';

  const fetchSchemas = async () => {
    setLoading(true);

    try {
      const response = await getAllSchemasByOrgId(
        {
          search: searchTerm,
          itemPerPage: pageSize,
          page: currentPage
        },
        orgId
      );

      if (typeof response !== 'string' && response?.data?.data?.data) {
        setSchemas(response.data.data.data);
      } else {
        setSchemas([]);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
      setSchemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, [currentPage, pageSize, searchTerm]);

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='w-full space-y-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-xl'>Schemas</CardTitle>
              <Badge
                variant='secondary'
                className='bg-amber-100 text-amber-800 hover:bg-amber-100'
              >
                {schemas.length}
              </Badge>
            </div>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> New Schemas
            </Button>
          </div>
          <CardDescription>Manage your data schemas</CardDescription>
        </div>
      </CardHeader>

      <CardContent className='flex-1 pb-2'>
        {loading ? (
          <div className='space-y-4'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-md' />
                  <Skeleton className='h-4 w-[300px]' />
                </div>
              </div>
            ))}
          </div>
        ) : schemas.length > 0 ? (
          <div className='space-y-4'>
            {schemas.map((schema: any, index: number) => (
              <div
                key={index}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <div className='bg-background flex h-10 w-10 items-center justify-center rounded-md border'>
                    <Calendar className='h-5 w-5 text-amber-500' />
                  </div>
                  <div className='flex-1 truncate font-medium'>
                    <span className='text-amber-500'>{schema.name} </span> :
                    {schema.version}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>No schemas found.</p>
        )}
      </CardContent>

      <CardFooter className='mt-auto justify-end pt-2'>
        <Button
          variant='ghost'
          className='text-amber-600 hover:bg-amber-50 hover:text-amber-700'
        >
          View all
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SchemasList;
