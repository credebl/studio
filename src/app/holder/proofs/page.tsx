import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getHolderProofs, requireHolderSession } from '@/lib/server/holder'
import type { HolderProof } from '@/features/holder/types'
import { ProofsPanel } from './proofs-panel'
import { normalizeHolderProofs } from '@/features/holder/normalize'

export const metadata = {
  title: 'Proof Requests',
}

export default async function HolderProofsPage(): Promise<React.JSX.Element> {
  await requireHolderSession()

  let proofs: HolderProof[] = []
  let unavailable = false
  try {
    proofs = normalizeHolderProofs(await getHolderProofs())
  } catch {
    proofs = []
    unavailable = true
  }

  return (
    <div className="space-y-6">
      {unavailable && (
        <Alert variant="destructive">
          <AlertTitle>Proof history unavailable</AlertTitle>
          <AlertDescription>
            The wallet could not load existing proof records. New requests can
            still be submitted below.
          </AlertDescription>
        </Alert>
      )}
      <ProofsPanel proofs={proofs} />
    </div>
  )
}
