import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getHolderWalletState, requireHolderSession } from '@/lib/server/holder'
import { OffersPanel } from './offers-panel'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Redeem Credential Offer',
}

export default async function HolderOffersPage(): Promise<React.JSX.Element> {
  await requireHolderSession()
  const wallet = await getHolderWalletState()

  if (!wallet.available) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Wallet unavailable</AlertTitle>
        <AlertDescription>
          The platform cloud wallet is not reachable right now. Please try again
          later.
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
    />
  )
}
