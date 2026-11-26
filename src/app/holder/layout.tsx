import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { HolderHeader } from './holder-header'
import { HolderSidebar } from '@/components/layout/holder-sidebar'
import type { Metadata } from 'next'
import PageContainer from '@/components/layout/page-container'
import { requireHolderSession } from '@/lib/server/holder'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Wallet',
  robots: { index: false, follow: false },
}

export default async function HolderLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  await requireHolderSession()

  return (
    <SidebarProvider defaultOpen={true}>
      <HolderSidebar />
      <SidebarInset>
        <HolderHeader />
        <PageContainer>{children}</PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
