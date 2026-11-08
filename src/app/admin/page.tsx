import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowRight,
  Building2,
  Globe,
  Mail,
  Settings,
  UserPlus,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getDashboardSummary,
  getPlatformAdminIdentity,
  getPlatformInvitations,
  requirePlatformAdmin,
} from '@/lib/server/admin'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { dateConversion } from '@/utils/DateConversion'

export const metadata = {
  title: 'Admin Overview',
}

const numberFormatter = new Intl.NumberFormat()

export default async function AdminOverviewPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()

  const [identity, summary, recentInvitations] = await Promise.all([
    getPlatformAdminIdentity(),
    getDashboardSummary(),
    getPlatformInvitations({ page: 1, pageSize: 5 }),
  ])

  const displayName = identity?.name || identity?.email || 'there'

  if (!summary) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Platform metrics are unavailable right now. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  const stats = [
    { title: 'Ecosystems', value: summary.ecosystem, icon: Globe },
    { title: 'Invitations Sent', value: summary.invitations, icon: Mail },
    {
      title: 'Active Organizations',
      value: summary.activeOrgs,
      icon: Building2,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {displayName}
        </h2>
        <p className="text-muted-foreground text-sm">
          Platform-wide metrics, ecosystem invitations and configuration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {numberFormatter.format(value)}
                </p>
              </div>
              <Icon
                aria-hidden="true"
                className="text-muted-foreground/40 size-10"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Recent invitations</CardTitle>
              <CardDescription>
                The latest ecosystem owner invitations sent from this console.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/invitations">
                View all
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInvitations.data.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No invitations have been sent yet.
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {recentInvitations.data.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {invitation.email}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Invited {dateConversion(invitation.createDateTime)}
                      </p>
                    </div>
                    <Badge
                      variant={invitation.ecosystem ? 'secondary' : 'outline'}
                      className="shrink-0"
                    >
                      {invitation.ecosystem ? 'Created' : 'Pending'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Common platform administration tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/invitations">
                <UserPlus aria-hidden="true" />
                Invite ecosystem owner
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/settings">
                <Settings aria-hidden="true" />
                Ecosystem settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
