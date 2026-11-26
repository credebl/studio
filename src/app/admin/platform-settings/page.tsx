import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getCloudBaseWalletStatus,
  requirePlatformAdmin,
} from '@/lib/server/admin'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { dateConversion } from '@/utils/DateConversion'
import { getPlatformSettings } from '@/lib/server/admin-metrics'

export const metadata = {
  title: 'Platform Settings',
}

const Field = ({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}): React.JSX.Element => (
  <div className="space-y-1">
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className={mono ? 'font-mono text-xs break-all' : 'text-sm'}>
      {value || <span className="text-muted-foreground">Not set</span>}
    </dd>
  </div>
)

export default async function PlatformSettingsPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()

  const [settings, cloudWallet] = await Promise.all([
    getPlatformSettings(),
    getCloudBaseWalletStatus().catch(() => ({ configured: false })),
  ])

  return (
    <div className="max-w-3xl space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Platform settings</h2>
        <p className="text-muted-foreground text-sm">
          The current platform configuration, for reference. This page is view
          only; these values are changed on the platform itself.
        </p>
      </div>

      {!settings.ok ? (
        <Alert variant="destructive">
          <AlertDescription>
            Platform settings are unavailable right now. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Network and endpoints</CardTitle>
              <CardDescription>
                Addresses the platform uses to reach agents and services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="API endpoint"
                  value={settings.value.apiEndpoint}
                  mono
                />
                <Field
                  label="Tails file server"
                  value={settings.value.tailsFileServer}
                  mono
                />
                <Field
                  label="External IP"
                  value={settings.value.externalIp}
                  mono
                />
                <Field
                  label="Inbound endpoint"
                  value={settings.value.inboundEndpoint}
                  mono
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>
                How the platform sends email. The API key is never displayed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="From address" value={settings.value.emailFrom} />
                <Field label="Username" value={settings.value.emailUsername} />
                <Field
                  label="API key"
                  value={
                    <Badge
                      variant={
                        settings.value.emailApiKeyConfigured
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {settings.value.emailApiKeyConfigured
                        ? 'Configured'
                        : 'Not set'}
                    </Badge>
                  }
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features and wallets</CardTitle>
              <CardDescription>
                Change these on their own pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Ecosystem feature"
                  value={
                    settings.value.ecosystemEnabled === null ? (
                      <Badge variant="outline">Unknown</Badge>
                    ) : (
                      <Link href="/admin/settings">
                        <Badge
                          variant={
                            settings.value.ecosystemEnabled
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {settings.value.ecosystemEnabled
                            ? 'Enabled'
                            : 'Disabled'}
                        </Badge>
                      </Link>
                    )
                  }
                />
                <Field
                  label="Cloud base wallet"
                  value={
                    <Link href="/admin/cloud-wallet">
                      <Badge
                        variant={
                          cloudWallet.configured ? 'secondary' : 'outline'
                        }
                      >
                        {cloudWallet.configured
                          ? 'Configured'
                          : 'Not configured'}
                      </Badge>
                    </Link>
                  }
                />
              </dl>
            </CardContent>
          </Card>

          {settings.value.createdAt || settings.value.updatedAt ? (
            <p className="text-muted-foreground text-xs">
              {settings.value.createdAt
                ? `Created ${dateConversion(settings.value.createdAt)}. `
                : ''}
              {settings.value.updatedAt
                ? `Last changed ${dateConversion(settings.value.updatedAt)}.`
                : ''}
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
