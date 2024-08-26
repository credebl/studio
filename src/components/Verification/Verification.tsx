
import type { AxiosResponse } from 'axios';
import { Alert, Button } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { getFromLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import BreadCrumbs from '../BreadCrumbs';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { verifyCredential } from '../../api/verification';
import { pathRoutes } from '../../config/pathRoutes';
import CustomSpinner from '../CustomSpinner';
import BackButton from '../../commonComponents/backbutton';
import { v4 as uuidv4 } from 'uuid';
import type {
	IAttribute,
	ISelectedUser,
	SchemaDetail,
	SelectedUsers,
	IW3cSchemaDetails,
	SelectedOption,
} from './interface';
import SummaryCard from '../../commonComponents/SummaryCard';
import { getOrganizationById } from '../../api/organization';
import { DidMethod, RequestType } from '../../common/enums';

const VerificationCred = () => {
	const [attributeList, setAttributeList] = useState<TableData[]>([]);
	const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null);
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [display, setDisplay] = useState<boolean | undefined>(false);
	const [schemaDetails, setSchemaDetails] = useState<SchemaDetail>({
		schemaName: '',
		version: '',
		schemaId: '',
		credDefId: '',
	});
	const [w3cSchemaDetails, setW3CSchemaDetails] = useState<IW3cSchemaDetails>({
		schemaName: '',
		version: '',
		schemaId: '',
		w3cAttributes:[],
		issuerDid:''
	});
	const [w3cSchema, setW3CSchema] = useState<boolean>(false);
	const [requestType, setRequestType] = useState<RequestType>();
	const [failure, setFailure] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [requestLoader, setRequestLoader] = useState<boolean>(false);
	const [attributeData, setAttributeData] = useState<ISelectedUser[] | null>(
		null,
	);

	useEffect(() => {
		fetchOrganizationDetails();
		return () => {
			setRequestLoader(false);
		};
	}, []);

	
	const fetchOrganizationDetails = async () => {
		try{
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (!orgId) return;
			const response = await getOrganizationById(orgId);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const did = data?.data?.org_agents?.[0]?.orgDid;
				
				if (did?.includes(DidMethod.POLYGON)) {
					setW3CSchema(true);
					setRequestType(RequestType.PRESENTATION_EXCHANGE)
					await getSchemaAndUsers(true);
				}
				if (did?.includes(DidMethod.KEY) || did?.includes(DidMethod.WEB)) {
					setW3CSchema(true);
					setRequestType(RequestType.PRESENTATION_EXCHANGE)
					await getSchemaAndUsers(true);

				}
				if (did?.includes(DidMethod.INDY)) {
					setW3CSchema(false);
					setRequestType(RequestType.INDY)
					await getSchemaAndUsers(false);
				}
			}
		} catch(error){
			console.error('Error in getSchemaAndUsers:', error);
			setFailure('Error fetching schema and users');
		}
		
	};
	const handleCheckboxChange = (attributeName: string) => {
		
		setAttributeData(
			attributeData &&
				attributeData?.map((attribute) => {
					if (attribute?.attributeName === attributeName) {
						return {
							...attribute,
							isChecked: !attribute?.isChecked,
							value: '',
							selectedOption: 'Select',
							inputError: '',
							selectError: '',
						};
					}
					return attribute;
				}) as ISelectedUser[],
		);
	};

	const handleInputChange = (attributeName:string, value:number) => {
		setAttributeData(
			attributeData &&
				attributeData.map((attribute) => {
					if (attribute?.attributeName === attributeName) {
						return { ...attribute, value, inputError: '' };
					}
					return attribute;
				}),
		);
	};

	const handleSelectChange = (attributeName:string, selectedOption:SelectedOption) => {
		setAttributeData(
			attributeData &&
				attributeData?.map((attribute) => {
					if (attribute?.attributeName === attributeName) {
						return { ...attribute, selectedOption, selectError: '' };
					}
					return attribute;
				}),
		);
	};

	const validateInputs = () => {
		const updatedInputs =
			attributeData &&
			attributeData.map((attribute) => {
				if (!attribute.isChecked) return attribute;

				if (
					attribute?.dataType === 'number' &&
					attribute?.value !== '' &&
					attribute?.selectedOption == 'Select'
				) {
					return { ...attribute, selectError: 'Please select an option' };
				}

				if (
					!attribute?.value.trim() &&
					attribute?.selectedOption !== 'Select' &&
					attribute?.value == ''
				) {
					return { ...attribute, inputError: 'Input is required' };
				}
				if (
					attribute?.dataType === 'number' &&
					attribute?.selectedOption !== 'Select' &&
					attribute?.value
				) {
					const numberValue = parseFloat(attribute?.value);
					if (isNaN(numberValue) || numberValue < 0) {
						return {
							...attribute,
							inputError: 'Input should be a positive number',
							selectError: '',
						};
					}
				}

				return attribute;
			});

		setAttributeData(updatedInputs);

		return updatedInputs?.every(
			(attribute) => !attribute?.inputError && !attribute?.selectError,
		);
	};

	const handleSubmit = async () => {
		const isValid = validateInputs();

		const dataToSubmit =
			attributeData &&
			attributeData.map((attribute) => ({
				name: attribute?.attributeName,
				isChecked: attribute?.isChecked,
				value: attribute?.value,
				condition: attribute?.selectedOption,
			}));

		const selectedAttributes = dataToSubmit?.filter((data) => {
			return data?.isChecked;
		});

		if (isValid) {
			try {
				setRequestLoader(true);
				const selectedUsers = selectedAttributes;
				const userData = await getFromLocalStorage(storageKeys.SELECTED_USER);
				const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
				const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
				const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
				const attributes =
					selectedUsers &&
					selectedUsers.map((user) => ({
						attributeName: user.name,
						condition: user.condition === 'Select' ? undefined : user.condition,
						value: user?.value === '' ? undefined : user?.value,
						...(credDefId ? { credDefId } : {}),
						schemaId: schemaId,
					}));

				let verifyCredentialPayload;
	
				if (!w3cSchema) { 
					verifyCredentialPayload = {
							connectionId: JSON.parse(userData)[0]?.connectionId,
							comment: 'string',
							orgId: orgId,
							proofFormats: {
								indy: {
									attributes: attributes,
								}
							}
						};

				} 			
				if(w3cSchema) { 

					const attributePaths = attributes?.map(
						(attr) => `$.credentialSubject['${attr.attributeName}']`
					  );
					verifyCredentialPayload = {
						connectionId: JSON.parse(userData)[0]?.connectionId,
						comment: 'proof request',
						presentationDefinition: {
						  id: uuidv4(),
						  input_descriptors: [
							{
								id:uuidv4(),
								name:w3cSchemaDetails.schemaName,
							  schema: [
								{
								  uri: w3cSchemaDetails.schemaId
								}
							  ],
							  constraints: {
								fields: [
									{
									  path: attributePaths,
									},
								  ],
							  },
							  purpose: 'Verify proof'
							}
						  ]
						}
					  };
					}

				if (attributes && verifyCredentialPayload) {
					const response = await verifyCredential(verifyCredentialPayload, requestType);
					const { data } = response as AxiosResponse;
					if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
						setProofReqSuccess(data?.message);
						window.location.href = pathRoutes.organizations.credentials;
					} else {
						setErrMsg(response as string);
						setRequestLoader(false);
					}
				}
			} catch (error) {
				setErrMsg('An error occurred. Please try again.');
				setRequestLoader(false);
			}
		}
	};

	const fetchData = async () => {
		try {
			setLoading(true);
		
			const schemaAttributes = await getFromLocalStorage(
				storageKeys.SCHEMA_ATTR,
			);
			
			if(!w3cSchema){
			
				const parsedSchemaDetails = JSON.parse(schemaAttributes) || [];
				const inputArray: SelectedUsers[] = parsedSchemaDetails.attribute.map(
					(attribute: IAttribute) => {
						return {
							displayName: attribute.displayName,
							attributeName: attribute.attributeName,
							isChecked: false,
							value: '',
							condition: '',
							options: [
								{ value: '', label: 'Select' },
								{ value: '>', label: 'Greater than' },
								{ value: '<', label: 'Less than' },
								{ value: '>=', label: 'Greater than or equal to' },
								{ value: '<=', label: 'Less than or equal to' },
							],
							dataType: attribute.schemaDataType,
						};
					},
					
				);
				
				setAttributeData(inputArray);
			}

			if(w3cSchema){

				const getW3cAttributes = await getFromLocalStorage(storageKeys.W3C_SCHEMA_DATA);
					
				const parsedSchemaAttributes = JSON.parse(getW3cAttributes) || [];
				
				const w3cInputArray: SelectedUsers[] = parsedSchemaAttributes.attributes.map(
					(attribute: IAttribute) => {
						return {
							displayName: attribute.displayName,
							attributeName: attribute.attributeName,
							isChecked: false,
							value: '',
							dataType: attribute.schemaDataType,
						};
						
					},
				);

				setAttributeData(w3cInputArray);
			
			}

			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.error('Error fetching data:', error);
		}
	};

	useEffect(() => {
		fetchData();
	  }, [w3cSchema]);


	const attributeFunction = () => {
		const attributes =
			attributeData &&
			attributeData.map((attribute: ISelectedUser, index: number) => {
				return {
					data: [
						{
							data: (
								<div className="flex items-center">
									<label>
										<input
											className="w-4 h-4 cursor-pointer"
											type="checkbox"
											checked={attribute?.isChecked}
											onChange={() =>
												handleCheckboxChange(attribute?.attributeName)
											}
										/>
									</label>
								</div>
							),
						},
						{ data: attribute?.displayName },
						!w3cSchema && {
							data: (
								<div className="flex items-center relative">
									{attribute?.dataType === 'number' && (
										<select
											disabled={!attribute?.isChecked}
											value={attribute?.selectedOption}
											onChange={(e) =>
												handleSelectChange(
													attribute?.attributeName,
													e.target.value,
												)
											}
											className={`${
												!attribute?.isChecked
													? 'opacity-50 cursor-not-allowed'
													: 'cursor-pointer'
											} p-1 border border-black rounded-md dark:text-gray-200 dark:bg-gray-700 dark:border-gray-300 dark:placeholder-gray-400 dark:text-white`}
										>
											{attribute?.options?.map(
												(
													option: {
														value: number | undefined | string;
														label: string | undefined;
													},
													index: React.Key | null | undefined,
												) => (
													<option key={index} value={option?.value}>
														{option?.label}
													</option>
												),
											)}
										</select>
									)}
									{attribute?.selectError && (
										<div className="text-red-500 text-xs absolute bottom-[-16px]">
											{attribute?.selectError}
										</div>
									)}
								</div>
							),
						},
						!w3cSchema && {
							data: (
								<div className="relative flex flex-col items-start">
									{attribute?.dataType === 'number' && (
										<input
											type="number"
											value={attribute?.value}
											onChange={(e) =>
												handleInputChange(
													attribute?.attributeName,
													e.target.value,
												)
											}
											disabled={!attribute?.isChecked}
											className={`${
												!attribute?.isChecked
													? 'opacity-50 cursor-not-allowed'
													: 'cursor-pointer'
											} p-1 border border-black rounded-md dark:text-gray-200 dark:bg-gray-700 dark:border-gray-300 dark:placeholder-gray-400 dark:text-white`}
										/>
									)}
									{attribute?.inputError && (
										<div className="text-red-500 text-xs absolute bottom-[-16px]">
											{attribute?.inputError}
										</div>
									)}
								</div>
							),
						},
					],
				};
			});
			
			setAttributeList(attributes);			
			
			setDisplay(
				attributeData?.some((attribute) => attribute?.dataType === 'number'),
			);
		};

	useEffect(() => {
		attributeData && attributeFunction();
	}, [attributeData]);

	const getSchemaAndUsers = async (isW3c:boolean) => {
		if (!isW3c) {
		const credDefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);
		createSchemaPayload(schemaId, credDefId);
		}
		
		if(isW3c){
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			const getW3cSchemaDetails = await getFromLocalStorage(storageKeys.W3C_SCHEMA_DATA);
			
		const parsedW3cSchemaDetails = JSON.parse(getW3cSchemaDetails);
		const schemaId = parsedW3cSchemaDetails?.schemaId
		createW3cSchemaPayload(schemaId,parsedW3cSchemaDetails)
		}
	};

	const createSchemaPayload = async (schemaId: string, credDefId: string) => {
		if (schemaId) {
			const parts = schemaId.split(':');
			const schemaName = parts[2];
			const version = parts[3];
			setSchemaDetails({ schemaName, version, schemaId, credDefId });
		}
		
	};
	const createW3cSchemaPayload = async (schemaId: string, parsedW3cSchemaDetails: any) => {
		if (schemaId) {

			if (parsedW3cSchemaDetails) {
				setW3CSchemaDetails(parsedW3cSchemaDetails);
			}
		}
		
	};

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'Attributes' },
		display && !w3cSchema && { columnName: 'Condition' },
		display && !w3cSchema && { columnName: 'Value', width: 'w-0.75' },
	];

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.organizations.verification.schema} />
				</div>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Verification
				</h1>
			</div>
			{loading ? (
  <div className="flex items-center justify-center mb-4">
    <CustomSpinner />
  </div>
) : (
  !w3cSchema ? (
    <SummaryCard
      schemaId={schemaDetails.schemaId}
      schemaName={schemaDetails.schemaName}
      version={schemaDetails.version}
      credDefId={schemaDetails.credDefId}
      hideCredDefId={true}
    />
  ) : (
	<SummaryCard
	schemaName={w3cSchemaDetails.schemaName}
	schemaId={w3cSchemaDetails.schemaId}
	version={w3cSchemaDetails.version}
	hideCredDefId={true}
  />
    )
  )}
			{(proofReqSuccess || errMsg) && (
				<div className="p-2">
					<Alert
						color={proofReqSuccess ? 'success' : 'failure'}
						onDismiss={() => {
							setProofReqSuccess(null);
							setErrMsg(null);
						}}
					>
						{proofReqSuccess || errMsg}
					</Alert>
				</div>
			)}
			<div
				className={` flex sm:flex-row flex-col sm:justify-between font-montserrat sm:space-x-2 text-base font-semibold leading-6 tracking-normal text-left dark:text-white p-2`}
			>
				<p>Attribute List</p>
			</div>
			<div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
				<DataTable
					header={header}
					data={attributeList}
					loading={loading}
				></DataTable>
			</div>

			<div>
				<Button
					onClick={handleSubmit}
					isProcessing={requestLoader}
					disabled={
						requestLoader || !attributeData?.some((ele) => ele.isChecked)
					}
					className="text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto"
				>
					<svg
						className="mr-2 mt-1"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="none"
						viewBox="0 0 25 25"
					>
						<path
							fill="#fff"
							d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"
						/>
					</svg>
					Request Proof
				</Button>
			</div>
		</div>
	);
};

export default VerificationCred;
