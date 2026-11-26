import type {
  AdminLedgerSummary,
  AdminPlatformFeatures,
  CloudBaseWalletStatus,
  MetricResult,
} from '@/features/admin/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const Row = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element => (
  <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex flex-wrap justify-end gap-1.5">{children}</div>
  </div>
)

export function PlatformStatusCard({
  features,
  ledgers,
  cloudWallet,
}: {
  features: MetricResult<AdminPlatformFeatures>
  ledgers: MetricResult<AdminLedgerSummary[]>
  cloudWallet: CloudBaseWalletStatus
}): React.JSX.Element {
  const ecosystem = features.ok ? features.value.ecosystemEnabled : null

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Platform status</CardTitle>
        <CardDescription>
          Feature switches, networks and the shared cloud wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-border divide-y">
        <Row label="Ecosystem feature">
          {ecosystem === null ? (
            <Badge variant="outline">Unavailable</Badge>
          ) : (
            <Badge variant={ecosystem ? 'secondary' : 'outline'}>
              {ecosystem ? 'Enabled' : 'Disabled'}
            </Badge>
          )}
        </Row>
        <Row label="Cloud base wallet">
          <Link href="/admin/cloud-wallet">
            <Badge variant={cloudWallet.configured ? 'secondary' : 'outline'}>
              {cloudWallet.configured ? 'Configured' : 'Not configured'}
            </Badge>
          </Link>
        </Row>
        <Row label="Ledgers and networks">
          {!ledgers.ok ? (
            <Badge variant="outline">Unavailable</Badge>
          ) : ledgers.value.length === 0 ? (
            <Badge variant="outline">None</Badge>
          ) : (
            ledgers.value.map((ledger) => (
              <Badge key={ledger.id} variant="secondary">
                {ledger.name}
              </Badge>
            ))
          )}
        </Row>
      </CardContent>
    </Card>
  )
}
