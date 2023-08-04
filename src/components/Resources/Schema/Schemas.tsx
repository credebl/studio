import { pathRoutes } from "../../../config/pathRoutes"
import SchemaList from "./SchemasList"

const Schemas = () => {
    const schemaSelectionCallback = (schemaId: string) => {
        window.location.href = `${pathRoutes.organizations.viewSchema}?schemaId=${schemaId}`
    }
    return (
        <SchemaList schemaSelectionCallback={schemaSelectionCallback} />
    )
}

export  default Schemas
