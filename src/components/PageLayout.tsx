'use client'

import React, { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from './ui/sidebar'

import AppSidebar from './layout/app-sidebar'
import Header from './layout/header'
import KBar from './kbar'
import { usePathname } from 'next/navigation'

interface PageLayoutProps {
  children: ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  // Define routes where PageLayout should be excluded
  const excludeLayoutRoutes = [
    '/sign-in',
    '/sign-up',
    '/verify-email-success',
    '/reset-password',
  ]

  // The platform console and holder wallet render their own role-scoped shells.
  const isAdminRoute = pathname.startsWith('/admin')
  const isHolderRoute = pathname.startsWith('/holder')

  return (
    <>
      {excludeLayoutRoutes.includes(pathname) ||
      isAdminRoute ||
      isHolderRoute ? (
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
  )
}

export default PageLayout
