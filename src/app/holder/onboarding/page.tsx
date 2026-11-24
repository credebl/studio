import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getHolderWalletState, requireHolderSession } from '@/lib/server/holder'
import { OnboardingPanel } from './onboarding-panel'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Set up your wallet',
}

export default async function HolderOnboardingPage(): Promise<React.JSX.Element> {
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

  if (wallet.hasWallet && wallet.dids.length > 0) {
    redirect('/holder')
  }

  return (
    <OnboardingPanel
      hasWallet={wallet.hasWallet}
      didCount={wallet.dids.length}
    />
  )
}
