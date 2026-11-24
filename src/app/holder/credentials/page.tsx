import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  listHolderCredentials,
  requireHolderSession,
} from '@/lib/server/holder'
import { CredentialsPanel } from './credentials-panel'
import type { HolderCredential } from '@/features/holder/types'
import { normalizeHolderCredentials } from '@/features/holder/normalize'

export const metadata = {
  title: 'Holder Credentials',
}

const safeList = async (
  format: 'sd-jwt-vc' | 'mso_mdoc' | 'w3c-vc',
): Promise<HolderCredential[] | null> => {
  try {
    return normalizeHolderCredentials(
      await listHolderCredentials(format),
      format,
    )
  } catch {
    return null
  }
}

export default async function HolderCredentialsPage(): Promise<React.JSX.Element> {
  await requireHolderSession()

  const [sdJwt, mdoc, w3c] = await Promise.all([
    safeList('sd-jwt-vc'),
    safeList('mso_mdoc'),
    safeList('w3c-vc'),
  ])

  if (!sdJwt || !mdoc || !w3c) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Credentials unavailable</AlertTitle>
        <AlertDescription>
          The wallet could not load one or more credential formats. Please try
          again later.
        </AlertDescription>
      </Alert>
    )
  }

  return <CredentialsPanel credentials={{ sdJwt, mdoc, w3c }} />
}
