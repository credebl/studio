import { OrganizationDashboard } from '@/features/organization/components/OrganizationDashboard'
import { redirect } from 'next/navigation'

export default function Page({
  searchParams,
}: {
  searchParams: { orgId?: string }
}): React.JSX.Element {
  const { orgId } = searchParams

  if (!orgId) {
    redirect('/organizations')
  }

  return <OrganizationDashboard orgId={orgId} />
}
