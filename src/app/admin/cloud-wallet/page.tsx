import {
  getCloudBaseWalletStatus,
  getKnownAgentOptions,
  requirePlatformAdmin,
} from '@/lib/server/admin'
import { CloudBaseWalletPanel } from './cloud-base-wallet-form'

export const metadata = {
  title: 'Cloud Wallet Configuration',
}

export default async function AdminCloudWalletPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()
  const initialStatus = await getCloudBaseWalletStatus()
  const knownAgents = await getKnownAgentOptions(initialStatus.agentEndpoint)

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Cloud wallets</h2>
        <p className="text-muted-foreground text-sm">
          Configure the shared agent that hosts personal wallets for holders.
          The platform creates one tenant per holder on this agent.
        </p>
      </div>

      <CloudBaseWalletPanel
        initialStatus={initialStatus}
        knownAgents={knownAgents}
      />
    </div>
  )
}
