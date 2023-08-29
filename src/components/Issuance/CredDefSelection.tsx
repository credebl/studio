'use client';

import type { AxiosResponse } from "axios";
import { Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { getFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import { getCredentialDefinitions } from "../../api/issuance";
import { getSchemaById } from "../../api/Schema";
import SchemaCard from "../../commonComponents/SchemaCard";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import { dateConversion } from "../../utils/DateConversion";
import BreadCrumbs from "../BreadCrumbs";
import { AlertComponent } from "../AlertComponent";
import type { SchemaState, CredDefData } from "./interface";
import type { TableData } from "../../commonComponents/datatable/interface";
import DataTable from "../../commonComponents/datatable";

const CredDefSelection = () => {
	const [schemaState, setSchemaState] = useState({ schemaName: '', version: '' })
	const [loading, setLoading] = useState<boolean>(true)
	const [schemaLoader, setSchemaLoader] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [credDefList, setCredDefList] = useState<TableData[]>([])
	const [schemaDetailsState, setSchemaDetailsState] = useState<SchemaState>({ schemaId: '', issuerDid: '', attributes: [], createdDateTime: ''})

	
	useEffect(() => {
		getSchemaAndCredDef()
	}, []);

	const getSchemaAndCredDef = async () => {
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID)
		
		if (schemaId) {
			getSchemaDetails(schemaId)
			getCredDefs(schemaId)
			const parts = schemaId.split(":");
			const schemaName = parts[2];
			const version = parts[3];
			setSchemaState({ schemaName, version })
		} else {
			setSchemaState({ schemaName: '', version: '' })
		}
	}

	const getSchemaDetails = async (schemaId: string) => {
		setSchemaLoader(true)
		const schemaDid = await getFromLocalStorage(storageKeys.SCHEMA_ATTR)
		const schemaDidObject = JSON.parse(schemaDid)
		if (schemaDidObject) {
			setSchemaDetailsState({ schemaId: schemaId, issuerDid: schemaDidObject?.issuerDid, attributes: schemaDidObject?.attribute, createdDateTime: schemaDidObject?.createdDate })
		}
		setSchemaLoader(false)
	}
	

	const header = [
		{ columnName: 'Name' },
		{ columnName: 'Created on' },
		{ columnName: 'Revocable?' }
	]

	//Fetch credential definitions against schemaId
	const getCredDefs = async (schemaId: string) => {
		setLoading(true)
		const response = await getCredentialDefinitions(schemaId);
		const { data } = response as AxiosResponse
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const credDefs = data?.data?.data.map((ele: CredDefData) => {
				return {
					clickId: ele.credentialDefinitionId, 
					data: [{ data: ele?.tag ? ele?.tag : 'Not available' }, { data: ele?.createDateTime ? dateConversion(ele?.createDateTime): 'Not available' },
					{ data: ele.revocable === true ? <span className="text-blue-700 dark:text-white">Yes</span> : <span className="text-cyan-500 dark:text-white">No</span> }
					]
				}
			})

			if (credDefs.length === 0) {
				setError('No Data Found')
			}

			setCredDefList(credDefs)
		} else {
			setError(response as string)
		}

		setLoading(false)
	}

	const schemaSelectionCallback = () => {

	}

	const selectCredDef = async(credDefId: string | null | undefined) => {
		if (credDefId) {
			await setToLocalStorage(storageKeys.CRED_DEF_ID, credDefId)
			window.location.href = `${pathRoutes.organizations.Issuance.connections}`
		}
	}

	return (
		<div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Schema
				</h1>
			</div>
			<div className="mb-4 col-span-full xl:mb-2 pb-3">
				{schemaLoader ?
					<div className="flex items-center justify-center mb-4">
						<Spinner
							color="info"
						/>
					</div>
					: 
					<div className="m-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap4">
					<SchemaCard className="col-span-1 sm:col-span-2 md:col-span-1" schemaName={schemaState?.schemaName} version={schemaState?.version} schemaId={schemaDetailsState.schemaId} issuerDid={schemaDetailsState.issuerDid} attributes={schemaDetailsState.attributes} created={schemaDetailsState.createdDateTime} 
						onClickCallback={schemaSelectionCallback} />
						</div>}
			</div>

			<div className="mb-4 col-span-full xl:mb-2 pt-5">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Credential definitions
				</h1>
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null)
				}}
			/>
			<DataTable header={header} data={credDefList} loading={loading} callback={selectCredDef} showBtn={true}></DataTable>
		</div>
	)
}

export default CredDefSelection