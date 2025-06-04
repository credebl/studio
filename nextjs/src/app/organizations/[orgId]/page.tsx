import { OrganizationDashboard } from '@/features/organization/components/OrganizationDashboard'
import React from 'react'

type Params = Promise<{ orgId: string }>

export default async function Page({
  params,
}: {
  params: Params
}): Promise<React.JSX.Element> {
  const { orgId } = await params
  return (
    <>
      <OrganizationDashboard orgId={orgId} />
    </>
  )
}
