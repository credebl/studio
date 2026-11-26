import type {
  AdminInvitationsMetric,
  MetricResult,
} from '@/features/admin/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { dateConversion } from '@/utils/DateConversion'

export function InvitationsCard({
  result,
}: {
  result: MetricResult<AdminInvitationsMetric>
}): React.JSX.Element {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            Ecosystem owner invitations and what became of them.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/invitations">
            View all
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result.ok ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Invitations are unavailable right now.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{result.value.created} created</Badge>
              <Badge variant="outline">{result.value.pending} pending</Badge>
              {result.value.capped ? (
                <span className="text-muted-foreground text-xs">
                  Counted from the latest {result.value.counted} invitations.
                </span>
              ) : null}
            </div>

            {result.value.recent.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No invitations have been sent yet.
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {result.value.recent.map((invitation) => (
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
