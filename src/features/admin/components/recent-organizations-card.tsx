import type {
  AdminOrganizationSummary,
  MetricResult,
} from '@/features/admin/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function RecentOrganizationsCard({
  result,
}: {
  result: MetricResult<AdminOrganizationSummary[]>
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent organizations</CardTitle>
        <CardDescription>
          The newest organizations on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!result.ok ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Organizations are unavailable right now.
          </p>
        ) : result.value.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No organizations yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {result.value.map((organization) => (
              <li
                key={organization.id}
                className="py-3 text-sm font-medium first:pt-0 last:pb-0"
              >
                <span className="block truncate">{organization.name}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
