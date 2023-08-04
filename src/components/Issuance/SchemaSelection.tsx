'use client';

import { pathRoutes } from "../../config/pathRoutes";
import SchemaList from "../Resources/Schema/SchemasList";

const SchemaSelection = () => {

	const schemaSelectionCallback = (schemaId: string) => {
		window.location.href = `${pathRoutes.organizations.Issuance.credDef}?schemaId=${schemaId}`
	}

	return (
		<SchemaList schemaSelectionCallback={schemaSelectionCallback} />
	)
}

export default SchemaSelection
