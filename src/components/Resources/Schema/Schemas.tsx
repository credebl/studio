import { setToLocalStorage } from "../../../api/Auth"
import { storageKeys } from "../../../config/CommonConstant"
import { pathRoutes } from "../../../config/pathRoutes"
import SchemaList from "./SchemasList"

const Schemas = () => {
    const schemaSelectionCallback = async (schemaId: string, attributes:any) => {
        await setToLocalStorage(storageKeys.SCHEMA_ATTR, attributes)
        window.location.href = `${pathRoutes.organizations.viewSchema}?schemaId=${schemaId}`
    }
    return (
        <SchemaList schemaSelectionCallback={schemaSelectionCallback} />
    )
}

export  default Schemas