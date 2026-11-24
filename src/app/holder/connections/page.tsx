import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getHolderConnections, requireHolderSession } from '@/lib/server/holder'
import { ConnectionsPanel } from './connections-panel'
import type { HolderConnection } from '@/features/holder/types'
import { normalizeHolderConnections } from '@/features/holder/normalize'

export const metadata = {
  title: 'Holder Connections',
}

export default async function HolderConnectionsPage(): Promise<React.JSX.Element> {
  await requireHolderSession()

  let connections: HolderConnection[] = []
  let unavailable = false
  try {
    connections = normalizeHolderConnections(await getHolderConnections())
  } catch {
    connections = []
    unavailable = true
  }

  return (
    <div className="space-y-6">
      {unavailable && (
        <Alert variant="destructive">
          <AlertTitle>Connections unavailable</AlertTitle>
          <AlertDescription>
            The wallet could not load connections. You can still try creating or
            accepting an invitation below.
          </AlertDescription>
        </Alert>
      )}
      <ConnectionsPanel connections={connections} />
    </div>
  )
}
