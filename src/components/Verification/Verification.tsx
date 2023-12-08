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
import { pathRoutes } from "../../config/pathRoutes";
import CustomSpinner from "../CustomSpinner";
import BackButton from '../../commonComponents/backbutton'

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
		credDefId?: string  ;
	}>;
	comment: string;
	orgId: string;
}

const VerificationCred = () => {
	const [attributeList, setAttributeList] = useState<TableData[]>([])
	const [proofReqSuccess, setProofReqSuccess] = useState<string>('')
	const [errMsg, setErrMsg] = useState<string|null>(null)
	const [schemaLoader, setSchemaLoader] = useState<boolean>(false)
	const [schemaDetails, setSchemaDetails] = useState<SchemaDetails>({
		schemaName: '', version: '', schemaId: '', credDefId: ''
	})
	const [loading, setLoading] = useState<boolean>(true)
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
					const attributesName = ele.attributeName ? ele.attributeName : 'Not available';
					const displayName = ele.displayName ? ele.displayName : 'Not available';

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
												selectConnection(attributesName, inputElement?.checked);
											}}
											value=""
											className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
										/>
									</div>
								)
							},
							{ data: displayName },
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
    ...(credDefId ? { credDefId } : {}),
				schemaId: schemaId
			}));
			const verifyCredentialPayload: VerifyCredentialPayload = {
				connectionId: `${selectedUsers[0].connectionId}`,
				attributes: attributes,
				comment: "string",
				orgId: orgId
			};
			if (attributes) {
				const response = await verifyCredential(verifyCredentialPayload);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
					setProofReqSuccess(data?.message);
					setRequestLoader(false);
					clearLocalStorage()
					setTimeout(()=>{
						window.location.href = '/organizations/verification'
					}, 2000)
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
		<><div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
			<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.verification.verification} />
				</div>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Verification
				</h1>
			</div>
			{loading ? 
				<div className="flex items-center justify-center mb-4">
					<CustomSpinner/>
					</div>
					:
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
			}
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
			<div className="font-montserrat text-base font-semibold leading-6 tracking-normal text-left dark:text-white p-4">
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
					className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto mr-8'
				>
					<svg className='mr-2 mt-1'xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 25 25">
						<path fill="#fff" d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"/>
					</svg>
					Request Proof
				</Button>

			</div> 
		</>

	)
}

export default VerificationCred
