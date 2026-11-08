import { AdminTabs } from './admin-tabs'
import type { Metadata } from 'next'
import PageContainer from '@/components/layout/page-container'
import { requirePlatformAdmin } from '@/lib/server/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Platform Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  await requirePlatformAdmin()

  return (
    <PageContainer>
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Platform Administration
        </h1>
        <p className="text-muted-foreground text-sm">
          Platform-wide metrics, invitations and configuration. Restricted to
          platform administrators.
        </p>
      </div>

      <AdminTabs />

      <div className="mt-6">{children}</div>
    </PageContainer>
  )
}
