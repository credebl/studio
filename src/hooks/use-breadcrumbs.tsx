'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

type BreadcrumbItem = {
  title: string
  link: string
}

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' },
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' },
  ],
  '/credentials': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'Issued credentials', link: '/credentials' },
  ],
  '/credentials/issue': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'Issue via DIDComm', link: '/credentials/issue' },
  ],
  '/credentials/issue/email': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'Issue via DIDComm', link: '/credentials/issue' },
    { title: 'Email', link: '/credentials/issue/email' },
  ],
  '/credentials/issue/schemas': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'Issue via DIDComm', link: '/credentials/issue' },
    { title: 'Schemas', link: '/credentials/issue/schemas' },
  ],
  '/verification': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'Verify via DIDComm', link: '/verification' },
  ],
  '/oid4vc/issuers': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'OID4VC issuance', link: '/oid4vc/issuers' },
  ],
  '/oid4vc/create-issuer': [
    { title: 'Credentials', link: '/credentials' },
    { title: 'OID4VC issuance', link: '/oid4vc/issuers' },
    { title: 'Create issuer', link: '/oid4vc/create-issuer' },
  ],
  '/x509-certificate': [
    { title: 'x509 certificates', link: '/x509-certificate' },
  ],
  // Add more custom mappings as needed
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname]
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      }
    })
  }, [pathname])

  return breadcrumbs
}
