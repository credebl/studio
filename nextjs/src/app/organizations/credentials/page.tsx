import Credentials from "@/features/organization/components/Issue/IssuanceList";

type Props = {
  params: { orgId: string }
}

const Page = ({ params: { orgId } }: Props) => {

  return (
    <div>
      <Credentials  />
    </div>
  )
}

export default Page