import SchemaList from "./SchemasList"

const Schemas = () => {
    const schemaSelectionCallback = (schemaId: string) => {
        window.location.href = `/organizations/schemas/view-schema?schemaId=${schemaId}`
    }
    return (
        <SchemaList schemaSelectionCallback={schemaSelectionCallback} />
    )
}

export  default Schemas