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

const CredentialDefinition = () => {
  const [loading, setLoading] = useState(true);
  const [credentialDefinition, setCredentialDefinition] = useState([]);

  const fetchCredentialDefinitionById = async () => {
    setLoading(true);
    try {
      const response = await getAllCredDef();
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
    fetchCredentialDefinitionById();
  }, []);

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-xl'>Credential Definitions</CardTitle>
          <CardDescription>Manage your credential definitions</CardDescription>
        </div>
        <Badge
          variant='secondary'
          className='bg-amber-100 text-amber-800 hover:bg-amber-100'
        >
          {credentialDefinition.length}
        </Badge>
      </CardHeader>

      <CardContent className='pb-2'>
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
        ) : credentialDefinition.length > 0 ? (
          <div className='space-y-4'>
            {credentialDefinition.map((cred: any, index: number) => (
              <div
                key={index}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <div className='bg-background flex h-10 w-10 items-center justify-center rounded-md border'>
                    <Key className='h-5 w-5 text-amber-500' />
                  </div>
                  <div className='flex-1 truncate font-medium'>
                    <span className='text-amber-500'>{cred.tag} </span> {cred.credentialDefinitionId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>
            No credential definitions found.
          </p>
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

export default CredentialDefinition;
