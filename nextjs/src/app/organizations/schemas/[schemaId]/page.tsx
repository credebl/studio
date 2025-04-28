import ViewSchemas from "@/features/schemas/components/ViewSchema";

interface SchemaPageProps {
  params: {
    schemaId: string;
  };
}

export default function SchemaPage({ params }: SchemaPageProps) {
  const { schemaId } = params;

  return (
    <div className="p-4">
      <ViewSchemas schemaId={schemaId} />
      {/* View Scheams Page */}
    </div>
  )
}
