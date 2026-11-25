import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getHolderWalletState, requireHolderSession } from '@/lib/server/holder'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HolderOverviewMetricsPanel } from '@/features/holder/components/holder-overview-metrics'
import Link from 'next/link'
import { buildHolderOverviewMetrics } from '@/features/holder/overview-metrics'
import { getHolderOverviewData } from '@/lib/server/holder-overview'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Holder Wallet',
}

export default async function HolderOverviewPage(): Promise<React.JSX.Element> {
  await requireHolderSession()
  const wallet = await getHolderWalletState()

  if (!wallet.available) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Wallet unavailable</AlertTitle>
        <AlertDescription>
          {wallet.message ??
            'The platform cloud wallet is not reachable right now. Please try again later.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!wallet.hasWallet || wallet.dids.length === 0) {
    redirect('/holder/onboarding')
  }

  const primaryDid = wallet.dids.find((did) => did.isPrimary) ?? wallet.dids[0]
  const overview = await getHolderOverviewData()
  const metrics = buildHolderOverviewMetrics({
    dids: wallet.dids,
    ...overview,
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">My wallet</h2>
          <Badge variant="outline">Wallet active</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Your personal credentials and identifiers. This wallet belongs to you,
          not to an organization.
        </p>
      </div>

      <HolderOverviewMetricsPanel metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Add a credential or respond to a verifier request.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/holder/offers">Redeem a credential offer</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/holder/proofs">Review proof requests</Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/holder/credentials">Open credential vault</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your identifier</CardTitle>
            <CardDescription>
              The DID currently used by your personal wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{primaryDid.method ?? 'did'}</Badge>
              {primaryDid.isPrimary && <Badge variant="outline">Primary</Badge>}
            </div>
            <p className="font-mono text-sm break-all">
              {primaryDid.did ?? 'No DID returned'}
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/holder/dids">Manage DIDs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
