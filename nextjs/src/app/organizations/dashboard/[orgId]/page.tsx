import { OrganizationDashboard } from "@/features/organization/components/OrganizationDashboard";

// type LocaleProps = {
//   params: { locale: string }
// }

// const Page = ({ params: { locale } }: LocaleProps): React.JSX.Element => {

//   return (
//     <>
//       <OrganizationDashboard />
//     </>
//   )
// }

// export default Page

type Params = Promise<{ orgId: string }>

export default async function Page({ params }: { params: Params }): Promise<React.JSX.Element> {
  // const { orgId } = params;
  const { orgId } = await params;
  console.log('orgId',params)
  return (
    <>
      <OrganizationDashboard orgId={orgId} />
    </>
  )
}