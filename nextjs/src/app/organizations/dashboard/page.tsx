'use client'

import { OrganizationDashboard } from '@/features/organization/components/OrganizationDashboard'
import React from 'react'
import { useSearchParams } from 'next/navigation'

export default function DashboardPage(): React.JSX.Element {
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')

  if (!orgId) {
    return <p className="text-red-500">No organization ID provided</p>
  }

  return <OrganizationDashboard orgId={orgId} />
}
