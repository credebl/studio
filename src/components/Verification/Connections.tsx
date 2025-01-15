
import { Alert, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import DataTable from "../../commonComponents/datatable";
import type { ITableData } from "../../commonComponents/datatable/interface";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import BreadCrumbs from "../BreadCrumbs";
import ConnectionList from "./ConnectionList";
import EmailList from "./EmailList";
import BackButton from '../../commonComponents/backbutton'
import { DidMethod, RequestType } from "../../common/enums";
import React from "react";
import type { IConnectionList } from "./interface";
import DateTooltip from "../Tooltip";
import { dateConversion } from "../../utils/DateConversion";
import { verifyCredential, verifyCredentialV2 } from '../../api/verification';
import type { AxiosResponse } from "axios";
import { v4 as uuidv4 } from 'uuid';
import { getOrganizationById } from "../../api/organization";

const Connections = () => {
	const [isW3cDid, setIsW3cDid] = useState<boolean>(false);
	const [selectedConnectionList, setSelectedConnectionList] = useState<ITableData[]>([])
	const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null);
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [requestLoader, setRequestLoader] = useState<boolean>(false);

	

	const selectedConnectionHeader = [
		{ columnName: 'User' },
		{ columnName: 'Connection ID' },
		{ columnName: 'Created on' }
	]

	const selectConnection = (connections: IConnectionList[]) => {
		
		try {
			const connectionsData = connections?.length > 0 && connections?.map((ele: IConnectionList) => {
				const createdOn = ele?.createDateTime
				? ele?.createDateTime
				: 'Not available';
				const connectionId = ele.connectionId
				? ele.connectionId
				: 'Not available';
				const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';
				
				return {
					data: [
						{ data: userName },
						{ data: connectionId },
						{
							data: (
								<DateTooltip date={createdOn} id="verification_connection_list">
									{' '}
									{dateConversion(createdOn)}{' '}
								</DateTooltip>
							),
						},
					],
				};
			})
			setSelectedConnectionList(connectionsData);
		} catch (error) {
			console.log("ERROR IN TABLE GENERATION::", error);
		}
	};

	const fetchOrganizationDetails = async () => {
		try{
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (!orgId) return;
			const response = await getOrganizationById(orgId);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const did = data?.data?.org_agents?.[0]?.orgDid;
				
				if (did?.includes(DidMethod.POLYGON)) {
					setIsW3cDid(true);

				}
				if (did?.includes(DidMethod.KEY) || did?.includes(DidMethod.WEB)) {
					setIsW3cDid(true);


				}
				if (did?.includes(DidMethod.INDY)) {
					setIsW3cDid(false);

				}
			}
		} catch(error){
			console.error('Error in getSchemaAndUsers:', error);
		}
		
	};
	useEffect(() => {
		fetchOrganizationDetails();
		return () => {
			setRequestLoader(false);
		};
	}, []);
	
	const handleSubmit = async () => {
		setRequestLoader(true);
    try {

      const selectedConnections = selectedConnectionList.map((ele) => ({
        userName: ele.data[0].data,
        connectionId: ele.data[1].data,
      }));

      await setToLocalStorage(storageKeys.SELECTED_USER, selectedConnections);

      const [attributeData, userData, orgId, attributes] = await Promise.all([
        getFromLocalStorage(storageKeys.ATTRIBUTE_DATA),
        getFromLocalStorage(storageKeys.SELECTED_USER),
        getFromLocalStorage(storageKeys.ORG_ID),
        getFromLocalStorage(storageKeys.SCHEMA_ATTRIBUTES),		
      ]);

	const attr= JSON.parse(attributeData)
	            
				const checkedAttributes = attr
				.filter((attribute: any) => attribute.isChecked) 
				.map((attribute: any) => {
					const basePayload = {
						attributeName: attribute.attributeName,
						credDefId: attribute.credDefId,
						schemaId: attribute.schemaId,
					};
					
					if (attribute.dataType === "number" && attribute.selectedOption !== "Select") {
						return {
							...basePayload,
							condition: attribute.selectedOption,
							value: attribute.value, 
						};
					}
					if (attribute.dataType === "string") {
						return basePayload;
					}
					
					return basePayload; 
				})
				.filter((attr: any) => attr !== null); 

				const checkedW3CAttributes = attr
				.filter((w3cSchemaAttributes: any) => w3cSchemaAttributes.isChecked) 
				.map((attribute: any) => {
					return {
						attributeName: attribute.attributeName,
						schemaId: attribute.schemaId,
						schemaName:attribute.schemaName
						
					};
				});
				let verifyCredentialPayload;

				if (!isW3cDid) {
						const parsedUserData = JSON.parse(userData); 
						const connectionIds = parsedUserData.map((connection: { connectionId: string | string[]; }) => connection.connectionId);

						verifyCredentialPayload = {
							
                              connectionId: connectionIds.length === 1 ? connectionIds[0] : connectionIds,
							  orgId,
							  proofFormats: {
								indy: {
								  attributes: checkedAttributes, 
								},
							  },
							  comment: "string"
						  };
						}

				
				if (isW3cDid) {
					const parsedUserData = JSON.parse(userData);
					const connectionIds = parsedUserData.map((connection: { connectionId: string | string[] }) => connection.connectionId);
				  
					const schemas = checkedW3CAttributes.map((attr: { schemaId: any; schemaName: any }) => ({
						schemaId: attr.schemaId,
						schemaName: attr.schemaName,
					}));
				  
					const groupedAttributes = checkedW3CAttributes.reduce((acc: any, curr: any) => {
						const schemaName = curr.schemaName;
						if (!acc[schemaName]) {
							acc[schemaName] = [];
						}
						acc[schemaName].push(curr);
						return acc;
					}, {});
					
				  
					verifyCredentialPayload = {
						
						connectionId: connectionIds.length === 1 ? connectionIds[0] : connectionIds, 
						comment: 'proof request',
						presentationDefinition: {
							id: uuidv4(),
						input_descriptors: Object.keys(groupedAttributes).map((schemaName) => {
						  const attributesForSchema = groupedAttributes[schemaName];
						  
						  const attributePathsForSchema = attributesForSchema.map(
							  (attr: { attributeName: string }) => `$.credentialSubject['${attr.attributeName}']`
							);
				  
							return {
								id: uuidv4(),
								name: schemaName,
							schema: [
							  {
								  uri: schemas.find((schema: { schemaName: string }) => schema.schemaName === schemaName)?.schemaId,
							  },
							],
							constraints: {
							  fields: [
								{
									path: attributePathsForSchema, 
								},
							],
						},
						purpose: 'Verify proof',
					};
				}),
			},
		
	}
	}
					  
				if (attributes && verifyCredentialPayload ) {
					const requestType = isW3cDid ? RequestType.PRESENTATION_EXCHANGE : RequestType.INDY;
					let response;
					if (typeof verifyCredentialPayload.connectionId === 'string') {
						response = await verifyCredential(verifyCredentialPayload, requestType);
					} else if (Array.isArray(verifyCredentialPayload.connectionId)) {
						response = await verifyCredentialV2(verifyCredentialPayload, requestType);
					}				

					const { data } = response as AxiosResponse;
					if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
						await removeFromLocalStorage(storageKeys.ATTRIBUTE_DATA);
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
			
		};
		

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
			<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.verification.credDef}/>
				</div>
			</div>

			<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
				<ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
					<li className="mr-2">
						<button className="inline-block p-4 border-b-2 rounded-t-lg text-xl" id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Connection</button>
					</li>
				</ul>
			</div>
			<div id="myTabContent">
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
				<div className="hidden rounded-lg bg-gray-50 dark:bg-gray-900" id="profile" role="tabpanel" aria-labelledby="profile-tab">
					<ConnectionList selectConnection={selectConnection} />
				</div>
			</div>
			<div className="flex items-center justify-between mb-4 pt-3">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Selected Users
				</h1>
			</div>
			<div
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
				<DataTable 
				header={selectedConnectionHeader} 
				data={selectedConnectionList} 
				loading={false} >

				</DataTable>
				{selectedConnectionList.length ? <div className="flex justify-end pt-3">
					<Button
						onClick={handleSubmit}
                        isProcessing={requestLoader}
				className="text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto"
					>
						<div className='pr-3'>
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
						</div>
						Request Proof
					</Button>
				</div>
					: ''}
			</div>

		</div>
	)
}

export default Connections