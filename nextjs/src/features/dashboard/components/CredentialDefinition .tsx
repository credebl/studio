'use client';

import { useEffect, useState } from 'react';
import { getAllCredDef } from '@/app/api/schema';
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
import { Key } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/lib/hooks';

const CredentialDefinition = () => {
  const [loading, setLoading] = useState(true);
  const [credentialDefinition, setCredentialDefinition] = useState([]);

  const orgId = useAppSelector((state) => state.organization.orgId);
  const fetchCredentialDefinitionById = async () => {
    setLoading(true);
    try {
      const response = await getAllCredDef(orgId as string);
      if (typeof response !== 'string' && response?.data?.data?.data) {
        setCredentialDefinition(response.data.data.data);
      } else {
        setCredentialDefinition([]);
      }
    } catch (err) {
      console.error('Error fetching credential definition:', err);
      setCredentialDefinition([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchCredentialDefinitionById();
    }
  }, [orgId]);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='space-y-1'>
          <div className='flex items-center gap-x-2'>
            <CardTitle>Credential Definitions</CardTitle>
            <Badge>{credentialDefinition.length}</Badge>
          </div>
          <CardDescription>Manage your credential definitions</CardDescription>
        </div>
      </CardHeader>

      <CardContent className='pb-2'>
        {loading ? (
          <div className='space-y-4'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between rounded-lg p-3'
              >
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-md' />
                  <Skeleton className='h-4 w-[300px]' />
                </div>
              </div>
            ))}
          </div>
        ) : credentialDefinition.length > 0 ? (
          <div className='space-y-4'>
            {credentialDefinition.map((cred: any, index: number) => (
              <div
                key={index}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <div className='bg-background flex h-10 w-10 items-center justify-center rounded-md'>
                    <Key />
                  </div>
                  <div className='flex-1 font-medium'>
                    <div>{cred.tag}</div>
                    <div className='text-muted-foreground truncate break-all'>
                      {cred.credentialDefinitionId}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-40 items-center justify-center'>
            <p className='text-muted-foreground'>
              No credential definitions found.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className='mt-auto justify-end pt-2'>
        <Button>View all</Button>
      </CardFooter>
    </Card>
  );
};

export default CredentialDefinition;
