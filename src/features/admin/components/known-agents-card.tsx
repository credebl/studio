import type { AdminKnownAgent, MetricResult } from '@/features/admin/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sourceLabels: Record<AdminKnownAgent['source'], string> = {
  allowlist: 'Allow-list',
  'cloud-wallet': 'Cloud wallet',
  'platform-org': 'Organization',
}

export function KnownAgentsCard({
  result,
}: {
  result: MetricResult<AdminKnownAgent[]>
}): React.JSX.Element {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Known to Studio</CardTitle>
        <CardDescription>
          Agents Studio can find from its allow-list, the cloud base wallet and
          your organizations. This is not a complete list of every agent on the
          platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result.ok ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Agents are unavailable right now.
          </p>
        ) : result.value.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No agents are known to Studio. Add some with the STUDIO_KNOWN_AGENTS
            setting.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {result.value.map((agent) => (
              <li
                key={agent.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">{agent.label}</p>
                  <p className="text-muted-foreground font-mono text-xs break-all">
                    {agent.endpoint}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {agent.isCloudBase ? (
                    <Badge variant="secondary">Cloud base</Badge>
                  ) : null}
                  <Badge variant="outline">{sourceLabels[agent.source]}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
