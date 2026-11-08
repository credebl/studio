import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminHeader } from './admin-header'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
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
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <PageContainer>{children}</PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
