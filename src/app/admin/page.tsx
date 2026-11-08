import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Globe, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getDashboardSummary, requirePlatformAdmin } from '@/lib/server/admin'

export const metadata = {
  title: 'Admin Overview',
}

const numberFormatter = new Intl.NumberFormat()

export default async function AdminOverviewPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()
  const summary = await getDashboardSummary()

  if (!summary) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Platform metrics are unavailable right now. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  const stats = [
    { title: 'Ecosystems', value: summary.ecosystem, icon: Globe },
    { title: 'Invitations Sent', value: summary.invitations, icon: Mail },
    {
      title: 'Active Organizations',
      value: summary.activeOrgs,
      icon: Building2,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map(({ title, value, icon: Icon }) => (
        <Card key={title}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {numberFormatter.format(value)}
              </p>
            </div>
            <Icon
              aria-hidden="true"
              className="text-muted-foreground/40 size-10"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
