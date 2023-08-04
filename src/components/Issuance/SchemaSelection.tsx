'use client';

import { setToLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import SchemaList from "../Resources/Schema/SchemasList";

const SchemaSelection = () => {

	const schemaSelectionCallback = async (schemaId: string) => {
		await setToLocalStorage(storageKeys.SCHEMA_ID, schemaId)
		window.location.href = `${pathRoutes.organizations.Issuance.credDef}`
	}

	return (
		<SchemaList schemaSelectionCallback={schemaSelectionCallback} />
	)
}

export default SchemaSelection
