'use client';

import { removeFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import SchemaList from "../Resources/Schema/SchemasList";
import type { SchemaDetails } from "./interface";

const SchemaSelection = () => {

	const schemaSelectionCallback = async (schemaId: string, schemaDetails:SchemaDetails) => {
		await setToLocalStorage(storageKeys.SCHEMA_ID, schemaId)
		await setToLocalStorage(storageKeys.SCHEMA_ATTR, schemaDetails)
		await removeFromLocalStorage(storageKeys.CRED_DEF_ID)
		window.location.href = `${pathRoutes.organizations.verification.credDef}`
	}

	return (
		<SchemaList schemaSelectionCallback={schemaSelectionCallback} />
	)
}

export default SchemaSelection
