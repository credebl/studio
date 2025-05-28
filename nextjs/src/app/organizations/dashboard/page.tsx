import { OrganizationDashboard } from '@/features/organization/components/OrganizationDashboard'
import { redirect } from 'next/navigation'

export default function Page({
  searchParams,
}: {
  searchParams: { orgId?: string }
}): React.JSX.Element {
  const { orgId } = searchParams

  if (!orgId) {
    // optionally redirect or show an error
    redirect('/organizations') // or render a fallback component
  }

  return <OrganizationDashboard orgId={orgId} />
}
