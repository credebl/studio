'use client'

import { setSchemaAttr, setSchemaId } from "@/lib/storageKeys";

import { SchemaDetails } from "../type/SchemasList";
import SchemaList from "./SchemasList";
import { pathRoutes } from "@/config/pathRoutes";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const SchemaSelection = () => {
    const router = useRouter()
    const dispatch = useDispatch()
	const schemaSelectionCallback = async (schemaId: string,schemaDetails:SchemaDetails) => {
        dispatch(setSchemaAttr(schemaDetails))
        dispatch(setSchemaId(schemaId))
        router.push(`${pathRoutes.organizations.Issuance.credDef}`)
	}

	return (
		<SchemaList schemaSelectionCallback={schemaSelectionCallback} />
	)
}

export default SchemaSelection
