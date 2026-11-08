import { Alert, AlertDescription } from '@/components/ui/alert'
import { getEcosystemStatus, requirePlatformAdmin } from '@/lib/server/admin'
import { EcosystemToggle } from './ecosystem-toggle'

export const metadata = {
  title: 'Admin Settings',
}

export default async function AdminSettingsPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()
  const enabled = await getEcosystemStatus()

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Ecosystem</h2>
        <p className="text-muted-foreground text-sm">
          Control whether the ecosystem feature is available across the
          platform.
        </p>
      </div>

      {enabled === null ? (
        <Alert variant="destructive">
          <AlertDescription>
            The ecosystem setting is unavailable right now. Please try again
            later.
          </AlertDescription>
        </Alert>
      ) : (
        <EcosystemToggle initialEnabled={enabled} />
      )}
    </div>
  )
}
