'use client';

import React, { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import KBar from './kbar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import AppSidebar from './layout/app-sidebar';
import Header from './layout/header';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Define routes where PageLayout should be excluded
  const excludeLayoutRoutes = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/verify-email-success'
  ];
  return (
    <>
      {excludeLayoutRoutes.includes(pathname) ? (
        <>{children}</>
      ) : (
        <KBar>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
              <Header />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </KBar>
      )}
    </>
  );
};

export default PageLayout;
