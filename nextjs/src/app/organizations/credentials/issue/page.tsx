import Credentials from "@/features/organization/components/Issue/IssuanceList";
import IssueDashboard from "@/features/organization/components/Issue/IssueDashbaord";

type Props = {
  params: { orgId: string }
}

const Page = ({ params: { orgId } }: Props) => {

  return (
    <div>
      <IssueDashboard  />
    </div>
  )
}

export default Page