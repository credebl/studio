import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getServiceStatusReport,
  uncheckableServices,
} from '@/lib/server/admin-status'
import { Badge } from '@/components/ui/badge'
import { RefreshButton } from './refresh-button'
import type { ServiceState } from '@/features/admin/types'
import { requirePlatformAdmin } from '@/lib/server/admin'

export const metadata = {
  title: 'Service Status',
}

const stateBadge: Record<
  ServiceState,
  {
    label: string
    variant: 'secondary' | 'destructive' | 'outline'
    className?: string
  }
> = {
  operational: {
    label: 'Operational',
    variant: 'secondary',
    className: 'bg-success text-success-foreground',
  },
  unavailable: { label: 'Unavailable', variant: 'destructive' },
  unknown: { label: 'Unknown', variant: 'outline' },
}

const formatCheckedAt = (iso: string): string =>
  `${iso.replace('T', ' ').slice(0, 19)} UTC`

export default async function ServiceStatusPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()
  const report = await getServiceStatusReport()

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Service status</h2>
          <p className="text-muted-foreground text-sm">
            Whether Studio can reach each platform service through the API
            gateway. These are reachability checks, not full health checks: the
            platform has no health endpoint for its services, so each check
            calls a read-only endpoint the service answers. A failure can mean
            the service is down or that it returned an error.
          </p>
        </div>
        <RefreshButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checked services</CardTitle>
          <CardDescription>
            Last checked {formatCheckedAt(report.checkedAt)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-border divide-y">
            {report.checks.map((check) => (
              <li
                key={check.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {check.covers}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs break-all">
                    {check.probe}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {check.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {check.latencyMs !== undefined ? (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {check.latencyMs} ms
                    </span>
                  ) : null}
                  <Badge
                    variant={stateBadge[check.state].variant}
                    className={stateBadge[check.state].className}
                  >
                    {stateBadge[check.state].label}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Not checked</CardTitle>
          <CardDescription>
            These cannot be checked from the admin console. Their absence above
            does not mean they are healthy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-border divide-y">
            {uncheckableServices.map((service) => (
              <li key={service.name} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-muted-foreground text-xs">
                  {service.reason}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
