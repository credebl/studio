'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import React, { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserActivity } from '@/app/api/users'

export interface UserActivity {
  id: number
  userId: string
  orgId: string
  action: string
  details: string
  createDateTime: string
  createdBy: string
  lastChangedDateTime: string
  lastChangedBy: string
  deletedAt: Date | string
}

// 👇 Helper function to convert date to "Created X ago"
const getTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Created just now'
  }
  if (minutes < 60) {
    return `Created ${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  if (hours < 24) {
    return `Created ${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  return `Created ${days} day${days > 1 ? 's' : ''} ago`
}

const RecentActivity = (): React.JSX.Element => {
  const [activityList, setActivityList] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [limit] = useState(5)

  const fetchRecentActivity = async (): Promise<void> => {
    setLoading(true)

    try {
      const response = await getUserActivity(limit)
      if (typeof response !== 'string' && response?.data?.data) {
        setActivityList(response.data.data)
      } else {
        setActivityList([])
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const renderActivity = (): React.JSX.Element => {
    if (!activityList?.length) {
      return <p className="text-muted-foreground">No recent activity found.</p>
    }

    return (
      <div className="space-y-4">
        {activityList.slice(0, 3).map((activity, index) => (
          <div key={`${activity.action}-${index}`} className="flex gap-3">
            <div className="relative mt-1">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="bg-primary absolute h-2 w-2 rounded-full" />
              </div>
              <div className="bg-muted ml-1 h-full w-px" />
            </div>
            <div className="space-y-1">
              <div className="max-w-[400px] truncate font-medium">
                {activity.action || 'Performed an action'}
              </div>
              <div className="text-muted-foreground text-sm italic">
                {getTimeAgo(activity.createDateTime)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="border-border relative flex h-full w-full flex-col overflow-hidden rounded-xl border py-4 transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-x-2">
            <CardTitle>Recent Activity</CardTitle>
            <Badge>{activityList.length}</Badge>
          </div>
          <CardDescription>Latest actions in your account</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {loading ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </div>
        ) : (
          renderActivity()
        )}
      </CardContent>
      <CardFooter className="mt-auto justify-end pt-2">
        {/* <Link href='#'>View all</Link> */}
      </CardFooter>
    </Card>
  )
}

export default RecentActivity
