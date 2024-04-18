
import { setToLocalStorage } from "../../api/Auth.ts";
import { storageKeys } from "../../config/CommonConstant.ts";
import { pathRoutes } from "../../config/pathRoutes.ts";
import SchemaList from "../Resources/Schema/SchemasList.tsx";

const SchemaSelection = () => {

	const schemaSelectionCallback = async (schemaId: string,attributes:any) => {
		await setToLocalStorage(storageKeys.SCHEMA_ATTR, attributes)
		await setToLocalStorage(storageKeys.SCHEMA_ID, schemaId)
		window.location.href = `${pathRoutes.organizations.Issuance.credDef}`
	}

	return (
		<SchemaList schemaSelectionCallback={schemaSelectionCallback} />
	)
}

export default SchemaSelection
