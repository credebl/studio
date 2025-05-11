import React from 'react'
import ViewSchemas from '@/features/schemas/components/ViewSchema'

// interface SchemaPageProps {
//   params: {
//     schemaId: string;
//   };
// }

// export default async function SchemaPage({ params }: SchemaPageProps) {
//   const { schemaId } = await params;

//   return (
//     <div className="p-4">
//       <ViewSchemas schemaId={schemaId} />
//     </div>
//   );
// }
type Params = Promise<{ schemaId: string }>

export default async function SchemaPage({
  params,
}: {
  params: Params
}): Promise<React.JSX.Element> {
  const { schemaId } = await params

  return (
    <div className="p-4">
      <ViewSchemas schemaId={schemaId} />
    </div>
  )
}
