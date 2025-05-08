'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserActivity } from '@/app/api/users';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const RecentActivity = () => {
  const [activityList, setActivityList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(5);

  const fetchRecentActivity = async () => {
    setLoading(true);

    try {
      const response = await getUserActivity(limit);
      if (typeof response !== 'string' && response?.data?.data) {
        setActivityList(response.data.data);
      } else {
        setActivityList([]);
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const renderActivity = () => {
    if (!activityList?.length) {
      return <p>No recent activity found.</p>;
    }

    return (
      <div className='space-y-4'>
        {activityList.slice(0,3).map((activity, index) => (
          <div key={index} className='flex gap-3'>
            <div className='relative mt-1'>
              <div className='flex h-2 w-2 items-center justify-center'>
                <div className='absolute h-2 w-2 rounded-full' />
              </div>
              <div className='ml-1 h-full w-px' />
            </div>
            <div className='space-y-1'>
              <div className='max-w-[400px] truncate font-medium'>
                {activity.action || 'Performed an action'}
              </div>
              <div className='text-muted-foreground'>
                {new Date(activity.createDateTime).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className='border-border relative flex h-full w-full flex-col overflow-hidden rounded-xl border py-4 shadow-xl transition-transform duration-300'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='space-y-1'>
          <div className='flex items-center gap-x-2'>
            <CardTitle>Recent Activity</CardTitle>
            <Badge>{activityList.length}</Badge>
          </div>
          <CardDescription>Latest actions in your account</CardDescription>
        </div>
      </CardHeader>
      <CardContent className='pb-2'>
        {loading ? (
          <div className='space-y-4'>
            <div className='flex gap-3'>
              <Skeleton className='h-4 w-4 rounded-full' />
              <div className='w-full space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
                <Skeleton className='h-3 w-2/3' />
              </div>
            </div>
            <div className='flex gap-3'>
              <Skeleton className='h-4 w-4 rounded-full' />
              <div className='w-full space-y-2'>
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-3 w-1/4' />
                <Skeleton className='h-3 w-1/3' />
              </div>
            </div>
          </div>
        ) : (
          renderActivity()
        )}
      </CardContent>
      <CardFooter className='mt-auto justify-end pt-2'>
        {/* <Link href='#'>View all</Link> */}
      </CardFooter>
    </Card>
  );
};

export default RecentActivity;
