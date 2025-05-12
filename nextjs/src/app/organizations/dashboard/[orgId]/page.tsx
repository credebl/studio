import { OrganizationDashboard } from "@/features/organization/components/OrganizationDashboard";

type Props = {
  params: { orgId: string }
}

const Page = ({ params: { orgId } }: Props) => {

  return (
    <div>
      <OrganizationDashboard orgId={orgId} orgData={null} />
    </div>
  )
}

export default Page