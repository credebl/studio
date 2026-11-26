import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import type { MetricResult } from '@/features/admin/types'

const numberFormatter = new Intl.NumberFormat()

export function MetricCard({
  title,
  icon: Icon,
  result,
  hint,
}: {
  title: string
  icon: LucideIcon
  result: MetricResult<number>
  hint?: string
}): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {result.ok ? (
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {numberFormatter.format(result.value)}
            </p>
          ) : (
            <p
              className="text-muted-foreground mt-2 text-sm"
              data-testid="metric-unavailable"
            >
              Unavailable
            </p>
          )}
          {hint ? (
            <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
          ) : null}
        </div>
        <Icon
          aria-hidden="true"
          className="text-muted-foreground/40 size-10 shrink-0"
        />
      </CardContent>
    </Card>
  )
}
