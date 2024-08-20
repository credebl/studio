
import React from "react";
import { removeFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import type { SchemaDetails } from "./interface";
import VerificationSchemasList from "./VerificationSchemasList";

const EmailSchemaSelection = () => {

	const handleSchemaSelection = async (schemaId: string, schemaDetails:SchemaDetails) => {
		await setToLocalStorage(storageKeys.SCHEMA_ID, schemaId)
		await setToLocalStorage(storageKeys.SCHEMA_ATTR, schemaDetails)
		await removeFromLocalStorage(storageKeys.CRED_DEF_ID)
		window.location.href = `${pathRoutes.organizations.verification.credDef}`
	}

	return (
		<VerificationSchemasList handleSchemaSelection={handleSchemaSelection} />
	)
}

export default EmailSchemaSelection;
