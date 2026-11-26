import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BookText,
  Building2,
  Globe,
  Mail,
  Network,
  Settings,
  ShieldCheck,
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
  getPlatformAdminIdentity,
  requirePlatformAdmin,
} from '@/lib/server/admin'
import { Button } from '@/components/ui/button'
import { InvitationsCard } from '@/features/admin/components/invitations-card'
import { KnownAgentsCard } from '@/features/admin/components/known-agents-card'
import Link from 'next/link'
import { MetricCard } from '@/features/admin/components/metric-card'
import type { MetricResult } from '@/features/admin/types'
import { PlatformStatusCard } from '@/features/admin/components/platform-status-card'
import { RecentOrganizationsCard } from '@/features/admin/components/recent-organizations-card'
import { getAdminDashboardMetrics } from '@/lib/server/admin-metrics'

export const metadata = {
  title: 'Admin Overview',
}

const pick = <T, R>(
  result: MetricResult<T>,
  select: (value: T) => R,
): MetricResult<R> => {
  if (!result.ok) {
    return { ok: false }
  }

  return { ok: true, value: select(result.value) }
}

export default async function AdminOverviewPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()

  const [identity, metrics] = await Promise.all([
    getPlatformAdminIdentity(),
    getAdminDashboardMetrics(),
  ])

  const displayName = identity?.name || identity?.email || 'there'

  const allUnavailable = [
    metrics.summary,
    metrics.organizationCount,
    metrics.recentOrganizations,
    metrics.schemaCount,
    metrics.credentialDefinitionCount,
    metrics.ledgers,
    metrics.invitations,
    metrics.features,
  ].every((result) => !result.ok)

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

      {allUnavailable ? (
        <Alert variant="destructive">
          <AlertDescription>
            Platform metrics are unavailable right now. Please try again later.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Organizations"
          icon={Building2}
          result={metrics.organizationCount}
        />
        <MetricCard
          title="Ecosystems"
          icon={Globe}
          result={pick(metrics.summary, (summary) => summary.ecosystem)}
        />
        <MetricCard
          title="Invitations sent"
          icon={Mail}
          result={pick(metrics.summary, (summary) => summary.invitations)}
        />
        <MetricCard
          title="Schemas"
          icon={BookText}
          result={metrics.schemaCount}
        />
        <MetricCard
          title="Credential definitions"
          icon={ShieldCheck}
          result={metrics.credentialDefinitionCount}
        />
        <MetricCard
          title="Ledgers"
          icon={Network}
          result={pick(metrics.ledgers, (ledgers) => ledgers.length)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentOrganizationsCard result={metrics.recentOrganizations} />
        <InvitationsCard result={metrics.invitations} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlatformStatusCard
          features={metrics.features}
          ledgers={metrics.ledgers}
          cloudWallet={metrics.cloudWallet}
        />

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

        <KnownAgentsCard result={metrics.knownAgents} />
      </div>
    </div>
  )
}
