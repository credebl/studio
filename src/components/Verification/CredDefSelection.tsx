'use client';

import type { AxiosResponse } from "axios";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import SchemaCard from "../../commonComponents/SchemaCard";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import BreadCrumbs from "../BreadCrumbs";
import { AlertComponent } from "../AlertComponent";
import type { SchemaState, CredDefData } from "./interface";
import type { TableData } from "../../commonComponents/datatable/interface";
import DataTable from "../../commonComponents/datatable";
import { getCredentialDefinitionsForVerification } from "../../api/verification";
import CustomSpinner from "../CustomSpinner";
import BackButton from  '../../commonComponents/backbutton'

const CredDefSelection = () => {
	const [schemaState, setSchemaState] = useState({ schemaName: '', version: '' })
	const [loading, setLoading] = useState<boolean>(true)
	const [schemaLoader, setSchemaLoader] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [credDefList, setCredDefList] = useState<TableData[]>([])
	const [schemaDetailsState, setSchemaDetailsState] = useState<SchemaState>({ schemaId: '', issuerDid: '', attributes: [], createdDateTime: '' })

	useEffect(() => {
		const fetchData = async () => {
			await removeFromLocalStorage(storageKeys.CRED_DEF_ID);
			getSchemaAndCredDef();
		};

		fetchData();
	}, []);

	const getSchemaAndCredDef = async () => {
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID)
		if (schemaId) {
			getSchemaDetails(schemaId)
			getCredDefs(schemaId)
			const parts = schemaId?.split(":");
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
		{ columnName: 'Credential definition Id' },
		{ columnName: 'Revocable' },
		{ columnName: 'Select' }
	]

	const getCredDefs = async (schemaId: string) => {
		setLoading(true)
		const response = await getCredentialDefinitionsForVerification(schemaId);
		
		const { data } = response as AxiosResponse
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const credDefs = data?.data?.map((ele: CredDefData) => {
				return {
					data: [{ data: ele?.tag ? ele?.tag : 'Not available' }, { data: ele?.credentialDefinitionId ? ele?.credentialDefinitionId : 'Not available' },
					{ data: ele?.revocable === true ? <span className="text-blue-700 dark:text-white">Yes</span> : <span className="text-cyan-500 dark:text-white">No</span> },
					{
						data: (
							<div className="flex items-center">
								<input
									id="default-checkbox"
									type="checkbox"
									onClick={(event: React.MouseEvent<HTMLInputElement>) => {
										const inputElement = event?.target as HTMLInputElement;
										selectConnection(ele?.credentialDefinitionId, inputElement?.checked);
									}}
									value=""
									className="w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 rounded focus:ring-primary-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
								/>
							</div>
						)
					}
					]

				}
			})

			if (credDefs?.length === 0) {
				setError('No Data Found')
			}
            setLoading(false)
			setCredDefList(credDefs)
		} else {
			setLoading(false)
			setError(response as string)
		}

		setLoading(false)
	}

	const schemaSelectionCallback = () => {

	}

	const selectConnection = async (credDefId: string, checked: boolean) => {
		if (credDefId && checked) {
			await setToLocalStorage(storageKeys.CRED_DEF_ID, credDefId)
		} else {
			removeFromLocalStorage(storageKeys.CRED_DEF_ID)
		}
	}

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
			<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.verification.schemas}/>
				</div>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Schema
				</h1>
			</div>
			<div className="mb-4 col-span-full xl:mb-2 pb-3">
				{schemaLoader ?
					<div className="flex items-center justify-center mb-4">
						
						<CustomSpinner/>
					</div>
					: <div className="m-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap4">
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
			<DataTable header={header} data={credDefList} loading={loading} callback={() => { }}></DataTable>
			<div>
				<Button onClick={() => {
					window.location.href = `${pathRoutes.organizations.verification.connections}`
				}}
					className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto'
				><svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">
				<path fill="#fff" d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z" />
				<path fill="#fff" d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z" />
			</svg>
					Continue
				</Button>
			</div>
		</div>

	)
}

export default CredDefSelection
