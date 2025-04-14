'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAppSelector } from '@/lib/hooks';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const token = useAppSelector((state) => state.auth.token);

  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
    if (!token) {
      router.push('/');
    }
  }, [token]);

  if (!clientReady || !token) return null;

  return (
    <KBar>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
