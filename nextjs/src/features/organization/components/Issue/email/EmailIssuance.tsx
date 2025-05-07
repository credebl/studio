// EmailIssuance.tsx
'use client';
// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiStatusCodes, CREDENTIAL_CONTEXT_VALUE, itemPerPage, proofPurpose } from "@/config/CommonConstant";
import { CredentialType, DidMethod, ProofType, SchemaTypes, SchemaTypeValue } from "@/features/common/enum";
import { GetAllSchemaListParameter } from "@/features/dashboard/type/schema";
import { RootState } from "@/lib/store";
import { getOrganizationById, getSchemaCredDef } from "@/app/api/organization";
import { AxiosResponse } from "axios";
import Select, { type SingleValue } from 'react-select';
import React from "react";
// import Create from "@/features/schemas/components/Create";
import { AlertComponent } from "@/components/AlertComponent";
import RoleViewButton from "@/components/RoleViewButton";
import { Features } from "@/common/enums";
import { pathRoutes } from "@/config/pathRoutes";
import Loader from "@/components/Loader";
import { FieldArray, Form, Formik } from "formik";
import * as Yup from 'yup';
import { EmptyMessage } from "@/components/EmptyMessage";
import CustomSelect from "@/components/customSelectComponent";
import { IOrgFormValues } from "../../interfaces/organization";
import { getAllSchemas } from "@/app/api/schema";
import { useAppSelector } from "@/lib/hooks";
import EmailAttributeSelection from "./EmailAttributes";


export interface ITransformedData {
	credentialOffer: ICredentialOffer[];
	credentialDefinitionId?: string;
	protocolVersion?: string;
	isReuseConnection?: boolean;
	credentialType?: string;
}

  export interface IIssueAttributes {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}


export interface ICredentials {
	name?:string;
	version?:string;
	type?:string;
	attributes?:IAttributes[];
	schemaLedgerId?:string;
	value?:String;
	label?: string;
	credentialDefinitionId?: string;
	schemaCredDefName?: string;
	schemaName: string;
	schemaVersion: string;
	schemaIdentifier: string;
	schemaAttributes?: IAttributes[];
	credentialDefinition?: string;
}

export interface IAttributes {
	attributeName: string
	schemaDataType: string
	displayName: string
	isRequired?: boolean
}

export interface ICredentialOffer {
	emailId: string;
	attributes?: IAttributesData[];
	credential?: IW3cPayload;
	options?:IOptionData;
  }

  export interface IOptionData  {
	proofType: string;
	proofPurpose: string;
  };
  
  export interface ITransformedData {
	credentialOffer: ICredentialOffer[];
	credentialDefinitionId?: string;
	protocolVersion?: string;
	isReuseConnection?: boolean;
	credentialType?: string;
  }
  export interface IAttributesData {
	isRequired: boolean;
	name: string;
	value: string;
	dataType: string;
}
export interface IW3cPayload {
    "@context": string[];
    type: string[];
    issuer: IIssuerData;
    issuanceDate: string;
    credentialSubject:ICredentialSubjectData;
}

export interface ICredentialSubjectData  {
    id: string;
    [key: string]: any; 
};
export interface IIssuerData {
    id: string;
}
export interface IEmailCredentialData{
	attributes?: IAttributesData[];
	credential?:IW3cPayload;
}

const EmailIssuance = () => {
	const [formData, setFormData] = useState();
	const [userData, setUserData] = useState();
	const [loading, setLoading] = useState<boolean>(true);
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [credentialSelected, setCredentialSelected] = useState<ICredentials | null>(null);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [batchName, setBatchName] = useState('');
	const [openResetModal, setOpenResetModal] = useState<boolean>(false);
	const [attributes, setAttributes] = useState<IAttributes[]>([]);
	const [success, setSuccess] = useState<string | null>(null);
	const [failure, setFailure] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [issueLoader, setIssueLoader] = useState(false);
	const inputRef = useRef(null);
	const [mounted, setMounted] = useState<boolean>(false)
	const [schemaType, setSchemaType]= useState<SchemaTypes>();
	const [credentialType, setCredentialType] = useState<CredentialType>();
	const [credDefId, setCredDefId] = useState<string>();
	const [schemasIdentifier, setSchemasIdentifier] = useState<string>();
	const [schemaTypeValue, setSchemaTypeValue] = useState<SchemaTypeValue>();
	const [isAllSchemaFlagSelected, setIsAllSchemaFlagSelected] = useState<boolean>();
	const [searchValue, setSearchValue] = useState('');
    const [orgData, setOrgData] = useState<IOrgFormValues | null>(null);
    const [orgDid, setOrgDid] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm] = useState('');


    const orgId = useAppSelector((state: RootState) => state.organization.orgId);
      const ledgerId = useAppSelector((state) => state.organization.ledgerId);
    

    const fetchOrganizationDetails = async () => {
        setLoading(true);
        const response = await getOrganizationById(orgId as string);
        const { data } = response as AxiosResponse;
        setLoading(false);
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          const org = data?.data;
          const did = data?.data?.org_agents?.[0]?.orgDid;
          setOrgData(org);
          setOrgDid(did);
        } else {
          setFailure(data?.message as string);
        }
        setLoading(false);
      };

	const handleInputChange = (inputValue: string) => {
		setSearchValue(inputValue); 
		setSchemaListAPIParameter(prevParams => {
			const updatedParams = {
				...prevParams,
				allSearch: inputValue,
			};
			getSchemaCredentials(updatedParams);
			return updatedParams;
		});
	};
		
	const getSchemaCredentials = async (schemaListAPIParameter: GetAllSchemaListParameter) => {

		try {

			// const allSchemaSelectedFlag = await getFromLocalStorage(storageKeys.ALL_SCHEMAS)
			// if (allSchemaSelectedFlag === `false` || !allSchemaSelectedFlag) {
			// 	setIsAllSchemaFlagSelected(false)
			// }
			// else if (allSchemaSelectedFlag === 'true') {
			// 	setIsAllSchemaFlagSelected(true)
			// }
			let currentSchemaType = schemaType;
			if (orgDid?.includes(DidMethod.POLYGON)) {
				currentSchemaType = SchemaTypes.schema_W3C;
				setSchemaTypeValue(SchemaTypeValue.POLYGON)
				setCredentialType(CredentialType.JSONLD)

			} else if (orgDid?.includes(DidMethod.KEY) || orgDid?.includes(DidMethod.WEB)) {
				currentSchemaType = SchemaTypes.schema_W3C;
				setSchemaTypeValue(SchemaTypeValue.NO_LEDGER)

				setCredentialType(CredentialType.JSONLD)
			}
			else if (orgDid?.includes(DidMethod.INDY)) {
				setCredentialType(CredentialType.INDY)
				currentSchemaType = SchemaTypes.schema_INDY;
			}
			setSchemaType(currentSchemaType);

			let options;
			//FIXME:  Logic of API call as per schema selection
			if((currentSchemaType === SchemaTypes.schema_INDY && orgId 
			 ) || (currentSchemaType === SchemaTypes.schema_W3C && isAllSchemaFlagSelected === false)){
				const response = await getSchemaCredDef(SchemaTypes.schema_INDY, orgId);
				const { data } = response as AxiosResponse;
				console.log("🚀 ~ getSchemaCredentials ~ data:888888888888888888888888888", data)
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefs = data.data;

					options = credentialDefs.map(({
						schemaName,
						schemaVersion,
						credentialDefinition,
						credentialDefinitionId,
						schemaIdentifier,
						schemaAttributes
					}: ICredentials) => ({
						value: schemaType === SchemaTypes.schema_INDY ? credentialDefinitionId : schemaVersion,
						label: `${schemaName} [${schemaVersion}]${'indy' === SchemaTypes.schema_INDY ? ` - (${credentialDefinition})` : ''}`,
						schemaName: schemaName,
						schemaVersion: schemaVersion,
						credentialDefinition: credentialDefinition,
						schemaIdentifier: schemaIdentifier,
						credentialDefinitionId: credentialDefinitionId,
						schemaAttributes:
							schemaAttributes &&
							typeof schemaAttributes === 'string' &&
							JSON.parse(schemaAttributes),
					}));

					setCredentialOptions(options);
				} else {
					setSuccess(null);
					setFailure(null);
				}
				setLoading(false);
                console.log("🚀 ~ EmailIssuance ~ credentialOptions:", credentialOptions)
			}

			
			// FIXME:  Logic of API call as per schema selection
			else if ((currentSchemaType === SchemaTypes.schema_W3C) && (orgId) 
            //     && 
            // (allSchemaSelectedFlag)
        )  
        
            {
				const response = await getAllSchemas({ search: searchTerm, itemPerPage: pageSize, page: currentPage },currentSchemaType, ledgerId);
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const credentialDefs = data.data.data;
					options = credentialDefs.map(({
						name,
						version,
						schemaLedgerId,
						attributes,
						type
					}: ICredentials) => ({
						value: version,
						label: `${name} [${version}]`,
						schemaName: name,
						type: type,
						schemaVersion: version,
						schemaIdentifier: schemaLedgerId,
						attributes: Array.isArray(attributes) ? attributes : (attributes ? JSON.parse(attributes) : []),
					}));
					setCredentialOptions(options);
				} else {
					setSuccess(null);
					setFailure(null);
				}
				setLoading(false);
			}


			setCredentialOptions(options);
		} catch (error) {
			setSuccess(null);
			setFailure(null);
		}
	};


	const handleSelectChange = (newValue: SingleValue<ICredentials> | null) => {
		const value = newValue as ICredentials | null;
		setBatchName(value?.label ?? '');
		if (schemaType === SchemaTypes.schema_INDY) {
			setCredDefId(value?.credentialDefinitionId);
			setCredentialSelected(value ?? null);
		} else if (schemaType === SchemaTypes.schema_W3C) {
			setCredentialSelected(value ?? null);
			setSchemasIdentifier(value?.schemaIdentifier);
		}
		setAttributes(value?.schemaAttributes ?? value?.attributes ?? []);
	};


	useEffect(() => {
		setMounted(true);
        fetchOrganizationDetails();
	}, []);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	useEffect(() => {
		getSchemaCredentials(schemaListAPIParameter);
	}, [isAllSchemaFlagSelected]);

	const confirmOOBCredentialIssuance = async () => {
		setIssueLoader(true);
		
		const existingData = userData;
		
		// const organizationDid = await getFromLocalStorage(storageKeys.ORG_DID);
		
		let transformedData: ITransformedData = { credentialOffer: [] };

		if (existingData && existingData.formData) {
			if (schemaType === SchemaTypes.schema_INDY) {
				existingData.formData.forEach((entry: { email: string; attributes: IIssueAttributes[] }) => {
					
					const transformedEntry = { emailId: entry.email, attributes: [] };
					entry.attributes.forEach((attribute) => {
						const transformedAttribute = {
							value: String(attribute.value || ''),
							name: attribute.name || '',
							isRequired: attribute.isRequired,
						};
						transformedEntry.attributes.push(transformedAttribute);
					});
					transformedData.credentialOffer.push(transformedEntry);
				});
				transformedData.credentialDefinitionId = credDefId;
				transformedData.isReuseConnection = true;

			} else if (schemaType=== SchemaTypes.schema_W3C) {
				
				existingData.formData.forEach((entry: { email: string; credentialData: IEmailCredentialData; attributes:IIssueAttributes[] }) => {
					const credentialOffer = {
						emailId: entry.email,
						credential: {
							"@context": [
								CREDENTIAL_CONTEXT_VALUE,
								schemasIdentifier
							],
							"type": [
								"VerifiableCredential",
								credentialSelected?.schemaName
							],
							"issuer": {
								"id": organizationDid 
							},
							"issuanceDate": new Date().toISOString(),
							
							//FIXME: Logic for passing default value as 0 for empty value of number dataType attributes.
							credentialSubject: entry?.attributes?.reduce((acc, attr) => {
								if (attr.schemaDataType === 'number' && (attr.value === '' || attr.value === null)) {
									acc[attr.name] = 0;
								} else if (attr.schemaDataType === 'string' && attr.value === '') {
									acc[attr.name] = '';
								} else if (attr.value !== null) {
									acc[attr.name] = attr.value;
								}
								return acc;
							}, {}),
						},
						options: {
							proofType: schemaTypeValue===SchemaTypeValue.POLYGON ? ProofType.polygon : ProofType.no_ledger,
							proofPurpose: proofPurpose
						}
					};

					transformedData.credentialOffer.push(credentialOffer);
				});

				transformedData.protocolVersion = "v2";
				transformedData.isReuseConnection = true;
				transformedData.credentialType = CredentialType.JSONLD;
			}
			

			const transformedJson = JSON.stringify(transformedData, null, 2);	
			const response = await issueOobEmailCredential(transformedJson, credentialType);
			const { data } = response as AxiosResponse;			

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				if (data?.data) {
					setLoading(false);
					setIssueLoader(false);
					setSuccess(data?.message);
					setOpenModal(false);
					setTimeout(() => {
						setSuccess(null);
					}, 3000);
					handleReset();
					setTimeout(() => {
						window.location.href = pathRoutes?.organizations?.issuedCredentials;
					}, 500);
				} else {					
					setFailure(data?.message);
					setLoading(false);
					setIssueLoader(false);
					setOpenModal(false);
				}
			} else {
				setLoading(false);
				setFailure(response as string);
				setOpenModal(false);
				setIssueLoader(false);
				setTimeout(() => {
					setFailure(null);
				}, 4000);
			}
		}
	};

	useEffect(() => {
		const initFormData = {
			email: '',
			attributes: attributes?.map((item: IAttributes) => {
				return {
					...item,
					value: '',
					name: item?.attributeName,
					isRequired: item?.isRequired,
				};
			}),
		};

		setFormData({ formData: [initFormData] });
	}, [attributes]);

	const isCredSelected = Boolean(credentialSelected);
	
	const selectInputRef = React.useRef<SelectRef | null>(null);

	const handleReset = () => {
		setCredentialSelected(null);
		setBatchName('');
		setOpenResetModal(false);
		if (selectInputRef.current) {
			selectInputRef.current.clearValue();
		}
	};

	const handleCloseConfirmation = () => {
		setOpenModal(false);
	};

	const handleOpenConfirmation = () => {
		setOpenModal(true);
	};
	const handleResetCloseConfirmation = () => {
		setOpenResetModal(false);
	};

	const handleResetOpenConfirmation = () => {
		setOpenResetModal(true);
	};

	// const createSchemaTitle = { title: 'Create Schema', svg: <Create /> };

	return (
		<div className="px-4 pt-2">
			<div className="col-span-full mb-3">
				{/* <div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.organizations.Issuance.issue} />
				</div> */}
			</div>
			<div>
				{(success || failure) && (
					<AlertComponent
						message={success ?? failure}
						type={success ? 'success' : 'failure'}
						onAlertClose={() => {
							setSuccess(null);
							setFailure(null);
						}}
					/>
				)}
				<div className="flex justify-between mb-3 items-center ml-1">
					<div>
						<h1 className="text-2xl font-semibold">Email</h1>
					</div>
					{/* <RoleViewButton
						buttonTitle={createSchemaTitle.title}
						feature={Features.CRETAE_SCHEMA}
						svgComponent={createSchemaTitle.svg}
						onClickEvent={() => {
							window.location.href = `${pathRoutes.organizations.createSchema}`;
						}}
					/> */}
				</div>
				<div className="flex flex-col justify-between gap-4 email-bulk-issuance">
					<Card>
						<CardHeader>
							<CardTitle className="text-xl font-semibold">
								Select Schema and credential definition
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<div className="flex flex-col justify-between">
									<div className="search-dropdown text-primary-700">
										{mounted ? (
											<CustomSelect
											credentialOptions={credentialOptions}
											handleInputChange={handleInputChange}
											handleSelectChange={handleSelectChange}
											searchValue={searchValue}
											selectInputRef={selectInputRef}
										/>
										) : null}
									</div>  
									<div className="mt-4">
										{credentialSelected && (
											<Card className="max-w-md">
												<CardContent className="pt-6">
													<div>
														<p className="pb-2">
															<span className="font-semibold">Schema: </span>
															{credentialSelected?.schemaName || ''}{' '}
															<span>[{credentialSelected?.schemaVersion}]</span>
														</p>
														{schemaType === SchemaTypes.schema_INDY && (
															<p className="pb-2">
																<span className="font-semibold">
																	Credential Definition:
																</span>{' '}
																{credentialSelected?.credentialDefinition}
															</p>
														)}
														<span className="font-semibold">
															Attributes:
														</span>
														
														<div className="flex flex-wrap mt-2">
															{attributes?.map((element: IAttributes) => (
																<div key={element.attributeName} className="truncate">
																	<Badge variant="secondary" className="m-1">
																		{element.attributeName}
																	</Badge>
																</div>
															))}
														</div>
													</div>
												</CardContent>
											</Card>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<div>
                    {isCredSelected && (
                        <EmailAttributeSelection formData={formData}/>
                    )}
						
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailIssuance;