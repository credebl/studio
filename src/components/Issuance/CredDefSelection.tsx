'use client';

import type { CredDefData, SchemaState } from "./interface";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import { getFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import { useEffect, useState } from "react";

import { AlertComponent } from "../AlertComponent";
import type { AxiosResponse } from "axios";
import BreadCrumbs from "../BreadCrumbs";
import { Button } from "flowbite-react";
import CustomSpinner from "../CustomSpinner";
import DataTable from "../../commonComponents/datatable";
import SchemaCard from "../../commonComponents/SchemaCard";
import type { TableData } from "../../commonComponents/datatable/interface";
import { dateConversion } from "../../utils/DateConversion";
import { getCredentialDefinitions } from "../../api/issuance";
import { getSchemaById } from "../../api/Schema";
import { pathRoutes } from "../../config/pathRoutes";
import DateTooltip from "../Tooltip";

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
					clickId: ele.credentialDefinitionId, data: [{ data: ele.tag ? ele.tag : 'Not available' }, 
					{ data: ele?.createDateTime ? <DateTooltip date={ele?.createDateTime}> {dateConversion(ele?.createDateTime)} </DateTooltip>: 'Not available' },
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
				<div className="flex justify-between">
					<BreadCrumbs />
					<Button
            type="submit"
            color='bg-primary-800'
            onClick={() => {
              window.location.href = `${pathRoutes.back.issuance.schemas}`
            }}
            className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 m-2 ml-auto dark:text-white'
            style={{ height: '2.5rem', width: '5rem', minWidth: '2rem' }}
          >
            <svg className='mr-1' xmlns="http://www.w3.org/2000/svg" width="22" height="12" fill="none" viewBox="0 0 30 20">
              <path fill="#1F4EAD" d="M.163 9.237a1.867 1.867 0 0 0-.122 1.153c.083.387.287.742.587 1.021l8.572 7.98c.198.19.434.343.696.447a2.279 2.279 0 0 0 1.657.013c.263-.1.503-.248.704-.435.201-.188.36-.41.468-.655a1.877 1.877 0 0 0-.014-1.543 1.999 1.999 0 0 0-.48-.648l-4.917-4.576h20.543c.568 0 1.113-.21 1.515-.584.402-.374.628-.882.628-1.411 0-.53-.226-1.036-.628-1.41a2.226 2.226 0 0 0-1.515-.585H7.314l4.914-4.574c.205-.184.368-.404.48-.648a1.878 1.878 0 0 0 .015-1.542 1.99 1.99 0 0 0-.468-.656A2.161 2.161 0 0 0 11.55.15a2.283 2.283 0 0 0-1.657.013 2.154 2.154 0 0 0-.696.447L.626 8.589a1.991 1.991 0 0 0-.463.648Z" />
            </svg>
            Back
          </Button>
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
					: 
					<div className="m-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap4">
					<SchemaCard className="col-span-1 sm:col-span-2 md:col-span-1" schemaName={schemaState?.schemaName} version={schemaState?.version} schemaId={schemaDetailsState.schemaId} issuerDid={schemaDetailsState.issuerDid} attributes={schemaDetailsState.attributes} created={schemaDetailsState.createdDateTime} 
						onClickCallback={schemaSelectionCallback} />
						</div>}
			</div>

			<div className="mb-4 col-span-full xl:mb-2 pt-5 flex">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Credential definitions
				</h1>
				{/* <div className='flex space-x-2'> */}
							<Button
								id='createSchemaButton'
								onClick={() => {
									window.location.href = `${pathRoutes.organizations.viewSchema}?schemaId=${schemaDetailsState?.schemaId}`
								}}
								className='ml-auto text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
								title='Create New Schema'
							>
								<svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
									<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
								</svg>
								Create
							</Button>
						{/* </div> */}
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