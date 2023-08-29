'use client';

import type { AxiosResponse } from "axios";
import { Alert, Button, Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { getFromLocalStorage, removeFromLocalStorage } from "../../api/Auth";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import BreadCrumbs from "../BreadCrumbs";
import DataTable from "../../commonComponents/datatable";
import type { TableData } from "../../commonComponents/datatable/interface";
import { verifyCredential } from "../../api/verification";

interface SchemaDetails {
	schemaName: string,
	version: string,
	schemaId: string,
	credDefId: string
}

interface SelectedUsers {
	userName: string,
	connectionId: string
}

interface VerifyCredentialPayload {
	connectionId: string;
	attributes: Array<{
		attributeName: string;
		credDefId: string;
	}>;
	comment: string;
	orgId: number;
}

const VerificationCred = () => {
	const [attributeList, setAttributeList] = useState<TableData[]>([])
	const [proofReqSuccess, setProofReqSuccess] = useState<string>('')
	const [errMsg, setErrMsg] = useState<string|null>(null)
	const [schemaLoader, setSchemaLoader] = useState<boolean>(false)
	const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>({
		schemaName: '', version: '', schemaId: '', credDefId: ''
	})
	const [loading, setLoading] = useState<boolean>(false)
	const [schemaAttributes, setSchemaAttributes] = useState<string[]>([]);
	const [selectedUsersData, setSelectedUsersData] = useState<Array<{ name: string, selected: boolean }>>([]);
	const [requestLoader, setRequestLoader] = useState<boolean>(false)


	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				await getSchemaAndUsers();
				const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTR)
				const parsedSchemaDetails = JSON.parse(schemaAttributes) || [];
				const attributes = parsedSchemaDetails.attribute.map((ele: any) => {
					const attributes = ele.attributeName ? ele.attributeName : 'Not available';
					return {
						data: [
							{
								data: (
									<div className="flex items-center">
										<input
											id="default-checkbox"
											type="checkbox"
											onClick={(event: React.MouseEvent<HTMLInputElement>) => {
												const inputElement = event?.target as HTMLInputElement;
												selectConnection(attributes, inputElement?.checked);
											}}
											value=""
											className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
										/>
									</div>
								)
							},
							{ data: attributes },
						]
					};
				});
				setAttributeList(attributes);
				setLoading(false)
			} catch (error) {
				setLoading(false)
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);


	const selectConnection = (attributes: string, checked: boolean) => {
		if (checked) {
			setSelectedUsersData(prevSelectedUsersData => [
				...prevSelectedUsersData,
				{ name: attributes, selected: true }
			]);
		} else {
			setSelectedUsersData(prevSelectedUsersData =>
				prevSelectedUsersData.filter(item => item.name !== attributes)
			);
		}
	}


	const getSchemaAndUsers = async () => {
		const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTR)
		const parsedSchemaAttributes = JSON.parse(schemaAttributes) || [];

		setSchemaAttributes(parsedSchemaAttributes);
		const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID)
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID)
		createSchemaPayload(schemaId, credDefId)
	}



	const createSchemaPayload = async (schemaId: string, credDefId: string) => {
		if (schemaId) {
			setSchemaLoader(true)
			const parts = schemaId.split(":");
			const schemaName = parts[2];
			const version = parts[3];
			setSchemaDetails({ schemaName, version, schemaId, credDefId })
			setSchemaLoader(false)
		}
	}

	const getSelectedUsers = async (): Promise<SelectedUsers[]> => {
		const selectedUsers = await getFromLocalStorage(storageKeys.SELECTED_USER)
		return JSON.parse(selectedUsers)
	}

	const clearLocalStorage = () => {
		removeFromLocalStorage(storageKeys.SELECTED_USER)
		removeFromLocalStorage(storageKeys.SCHEMA_ID)
		removeFromLocalStorage(storageKeys.CRED_DEF_ID)
	
	}


	const verifyCredentialSubmit = async () => {
		try {
			setRequestLoader(true);
			const selectedUsers = await getSelectedUsers();
			const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
			const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	
			const attributes = await selectedUsersData.map(user => ({
				attributeName: user.name,
				credDefId: credDefId,
				schemaId: schemaId
			}));
			const verifyCredentialPayload: VerifyCredentialPayload = {
				connectionId: `${selectedUsers[0].connectionId}`,
				attributes: attributes,
				comment: "string",
				orgId: Number(orgId)
			};
			if (attributes) {
				const response = await verifyCredential(verifyCredentialPayload);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
					setProofReqSuccess(data?.message);
					setRequestLoader(false);
					await clearLocalStorage()
					setTimeout(()=>{
						window.location.href = '/organizations/verification'
		
					}, 5000)
					
					
				} else {
					setErrMsg(response as string);
					
				}
			}
			setTimeout(()=>{
				setErrMsg('');
				setProofReqSuccess('')

			}, 4000)
		} catch (error) {
			console.error("Error:", error);
			setErrMsg("An error occurred. Please try again.");
			setRequestLoader(false);
		}
	};
	

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'Attributes' }
	]


	return (
		<><div className="px-4 pt-6">
			<div className="pl-6 mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Verification
				</h1>
			</div>
			<Card className='transform transition duration-500 hover:scale-105 hover:bg-gray-50' style={{ width: '470px', height: '140px', maxWidth: '100%', maxHeight: '100%', overflow: 'auto' }}>
				<div className="flex justify-between items-start">
					<div>
						<h5 className="text-xl font-bold leading-none text-primary dark:text-white">
							{schemaDetails.schemaName}
						</h5>
						<p className='text-primary dark:text-white'>
							Version: {schemaDetails.version}
						</p>
					</div>
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
						<span className="font-semibold text-primary">Schema ID:</span> {schemaDetails.schemaId}
					</p>
					<p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
						<span className="font-semibold text-primary">Credential definition restriction:</span>
						{schemaDetails.credDefId ? ' Yes' : ' No'}

					</p>
				</div>
			</Card>
			{
				(proofReqSuccess || errMsg) &&
				<div className="p-2">
				<Alert
					color={proofReqSuccess ? "success" : "failure"}
					onDismiss={() => setErrMsg(null)}
				>
					<span>
						<p>
							{proofReqSuccess || errMsg}
						</p>
					</span>
				</Alert>
				</div>
			}
			<div className="font-montserrat text-base font-semibold leading-6 tracking-normal text-left p-4">
				Attribute List
			</div>
			<div
				className="p-6 mr-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
				<DataTable header={header} data={attributeList} loading={loading}></DataTable>
			</div>
		</div>

			<div>
				<Button
					onClick={verifyCredentialSubmit}
					isProcessing={requestLoader}
					disabled={!selectedUsersData.length}
					className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto mr-8'
				>
					Request Proof
				</Button>

			</div> 
		</>

	)
}

export default VerificationCred
