import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  getHolderWalletState,
  getPrimaryDidUrl,
  requireHolderSession,
} from '@/lib/server/holder'
import { OffersPanel } from './offers-panel'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Redeem Credential Offer',
}

interface HolderOffersPageProps {
  // Next.js 16 supplies searchParams as a promise (see app/.../page.md).
  searchParams: Promise<{ orgId?: string | string[] }>
}

export default async function HolderOffersPage({
  searchParams,
}: HolderOffersPageProps): Promise<React.JSX.Element> {
  const session = await requireHolderSession()
  const wallet = await getHolderWalletState()
  const { orgId } = await searchParams
  const primaryDidUrl = await getPrimaryDidUrl(
    typeof orgId === 'string' ? orgId : orgId?.[0],
    session.user.id,
  )

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

  return (
    <OffersPanel
      dids={wallet.dids
        .map((did) => did.did)
        .filter((did): did is string => Boolean(did))}
      primaryDidUrl={primaryDidUrl}
    />
  )
}
