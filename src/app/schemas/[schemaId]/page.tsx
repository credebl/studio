import React from 'react'
import ViewSchemas from '@/features/schemas/components/ViewSchema'

type Params = Promise<{ schemaId: string }>

export default async function SchemaPage({
  params,
}: {
  readonly params: Params
}): Promise<React.JSX.Element> {
  const { schemaId } = await params

  return (
    <div className="p-4">
      <ViewSchemas schemaId={schemaId} />
    </div>
  )
}
