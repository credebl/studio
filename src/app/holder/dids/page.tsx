import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getHolderWalletState, requireHolderSession } from '@/lib/server/holder'
import { DidsPanel } from './dids-panel'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Holder DIDs',
}

export default async function HolderDidsPage(): Promise<React.JSX.Element> {
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

  if (!wallet.hasWallet) {
    redirect('/holder/onboarding')
  }

  return <DidsPanel dids={wallet.dids} />
}
