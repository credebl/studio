import { OrganizationDashboard } from "@/features/organization/components/organization-dashboard";

type Props = {
  params: { orgId: string }
}

const Page = ({ params: { orgId } }: Props) => {

  return (
    <div>
      <OrganizationDashboard orgId={orgId} />
    </div>
  )
}

export default Page
