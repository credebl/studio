import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ClipboardCheck,
  Clock3,
  CreditCard,
  KeyRound,
  Link2,
  type LucideIcon,
  Users,
} from 'lucide-react'
import type { HolderOverviewMetrics } from '@/features/holder/overview-metrics'
import Link from 'next/link'

interface MetricCardProps {
  label: string
  value: number | string
  detail?: string
  icon: LucideIcon
}

const MetricCard = ({
  label,
  value,
  detail,
  icon: Icon,
}: MetricCardProps): React.JSX.Element => (
  <Card>
    <CardContent className="flex items-center justify-between p-6">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
        {detail && (
          <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
        )}
      </div>
      <Icon
        aria-hidden="true"
        className="text-muted-foreground/40 size-9 shrink-0"
      />
    </CardContent>
  </Card>
)

const DetailItem = ({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint?: string
}): React.JSX.Element => (
  <div className="space-y-1">
    <dt className="text-muted-foreground text-xs">{label}</dt>
    <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
  </div>
)

export function HolderOverviewMetricsPanel({
  metrics,
}: {
  metrics: HolderOverviewMetrics
}): React.JSX.Element {
  const { credentials, proofs, connections, dids, health, binding } = metrics
  const credentialDetail =
    credentials.byFormat
      .filter((item) => item.count > 0)
      .map((item) => `${item.count} ${item.label}`)
      .join(' · ') || 'No credentials stored yet'
  const connectionDetail = [
    `${connections.connected} connected`,
    `${connections.invited} invited`,
    `${connections.requested} requested`,
  ].join(' · ')
  const didDetail =
    dids.byMethod
      .map((item) => `${item.count} did:${item.label}`)
      .join(' · ') || 'No identifiers yet'
  const pendingDetail =
    proofs.total === 0
      ? 'No proof requests yet'
      : `${proofs.total} total in history`

  return (
    <div className="space-y-4">
      {metrics.unavailable.length > 0 && (
        <Alert>
          <AlertTitle>Some metrics are unavailable</AlertTitle>
          <AlertDescription>
            The wallet could not load {metrics.unavailable.join(', ')}. The
            remaining numbers reflect the data that is available.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Credentials"
          value={credentials.total}
          detail={credentialDetail}
          icon={CreditCard}
        />
        <MetricCard
          label="Pending proofs"
          value={proofs.pending}
          detail={pendingDetail}
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Connections"
          value={connections.total}
          detail={connectionDetail}
          icon={Users}
        />
        <MetricCard
          label="DIDs"
          value={dids.total}
          detail={didDetail}
          icon={KeyRound}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credential health</CardTitle>
            <CardDescription>
              Validity and issuer spread across your credential vault.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Distinct issuers"
                value={health.distinctIssuers}
                hint="Credentials in vault"
              />
              <DetailItem
                label="Expiring soon"
                value={health.expiring}
                hint="Within 30 days"
              />
              <DetailItem label="Expired" value={health.expired} />
              <DetailItem
                label="No expiry date"
                value={health.noExpiry}
                hint="Including mDocs"
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Binding privacy</CardTitle>
            <CardDescription>
              How stored credentials are bound to your identifiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Detected bindings"
                value={`${binding.detected}/${credentials.total}`}
                hint="Credentials with visible binding"
              />
              <DetailItem
                label="Fresh keys"
                value={binding.freshKey}
                hint="One-off did:jwk bindings"
              />
              <DetailItem
                label="Stored DIDs"
                value={binding.storedDid}
                hint="Reused wallet identifiers"
              />
              <DetailItem
                label="Shared identifier"
                value={binding.sharedCredentials}
                hint="Credentials sharing a DID"
              />
              <DetailItem
                label="Primary DID reuse"
                value={binding.primaryReuse}
                hint="Using your suggested DID"
              />
              <DetailItem
                label="Not detected"
                value={binding.undetected}
                hint="Binding data unavailable"
              />
            </dl>
            <p className="text-muted-foreground flex items-start gap-2 text-xs">
              <Link2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Detected from stored SD-JWT and W3C records. mDoc binding details
              are not decoded here.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            The latest changes across credentials, DIDs, proofs and connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet.</p>
          ) : (
            <ul className="divide-border divide-y text-sm">
              {metrics.activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <Link href={item.href} className="hover:underline">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      · {item.detail}
                    </span>
                  </Link>
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs whitespace-nowrap">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    {item.at}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
