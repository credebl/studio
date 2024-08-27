
import { Alert, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, predicatesConditions, storageKeys } from '../../config/CommonConstant';
import BreadCrumbs from '../BreadCrumbs';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { pathRoutes } from '../../config/pathRoutes';
import BackButton from '../../commonComponents/backbutton';
import type {
	ISelectedAttributes,
} from './interface';
import CustomCheckbox from '../../commonComponents/CustomCheckbox';
import { getOrganizationById } from '../../api/organization';
import type { AxiosResponse } from 'axios';
import { DidMethod } from '../../common/enums';

const EmailAttributesSelection = () => {
	const [attributeList, setAttributeList] = useState<TableData[]>([]);
	const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null);
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [display, setDisplay] = useState<boolean | undefined>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [attributeData, setAttributeData] = useState<ISelectedAttributes[] | null>(
		null,
	);
	const [w3cSchema, setW3cSchema] = useState<boolean>(false);

	const handleAttributeChange = async (
		attributeName: string,
		changeType: 'checkbox' | 'input' | 'select',
		value: string | boolean,
		schemaId?: string | undefined,
        credDefId?: string | undefined
	) => {
		const updatedAttributes = attributeData?.map(attribute => {
			if (attribute.attributeName === attributeName && attribute.schemaId === schemaId && attribute.credDefId === credDefId) {
				switch (changeType) {
					case 'checkbox':
						return {
							...attribute,
							isChecked: value as boolean,
							value: (value as boolean) ? attribute.value : '',
							selectedOption: attribute?.condition || 'Select',
							inputError: '',
							selectError: '',
						};
					case 'input':
						return {
							...attribute,
							value: value as string,
							inputError: '',
						};
					case 'select':
						return {
							...attribute,
							selectedOption: value as string,
							selectError: '',
						};
					default:
						return attribute;
				}
			}
			return attribute;
		}) ?? [];

		setAttributeData(updatedAttributes);

		await setToLocalStorage(storageKeys.ATTRIBUTE_DATA, JSON.stringify(updatedAttributes));
	};


	const getOrgDetails = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const did = data?.data?.org_agents?.[0]?.orgDid;

			if (did.includes(DidMethod.POLYGON) || did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
				setW3cSchema(true);
			}else if (did.includes(DidMethod.INDY)) {
				setW3cSchema(false);
			}
		}

		setLoading(false);
	};

	useEffect(() => {
		getOrgDetails();
	}, []);


	const handleSubmit = () => {
		setErrMsg(null);
	
		if (w3cSchema) {
			redirectToAppropriatePage();
			return;
		}
	
		if (hasInvalidNumberAttributes()) {
			return;
		}
	
		redirectToAppropriatePage();
	};
	
	const hasInvalidNumberAttributes = (): boolean => {
		const numberAttributes = attributeData?.filter(
			(attr) => attr.dataType === 'number' && attr.isChecked
		);
	
		for (const attribute of numberAttributes || []) {
			if (isInvalidNumberAttribute(attribute)) {
				return true;
			}
		}
	
		return false;
	};
	
	const isInvalidNumberAttribute = (attribute: any): boolean => {
		if (attribute.selectedOption === 'Select' && !attribute.value) {
			setErrMsg('Condition and value are required');
			return true;
		} else if (!attribute.value) {
			setErrMsg('Value is required');
			return true;
		} else if (!attribute.selectedOption) {
			setErrMsg('Condition is required');
			return true;
		}
	
		return false;
	};
	
	const redirectToAppropriatePage = () => {
		window.location.href = w3cSchema
			? `${pathRoutes.organizations.verification.w3cEmailVerification}`
			: `${pathRoutes.organizations.verification.emailVerification}`;
	};
	
	const loadAttributesData = async () => {
	
		setLoading(true);
	
		try {
			setAttributeData([]);
	
			if (w3cSchema) {
				const getW3CSchemaDetails = await getFromLocalStorage(storageKeys.SELECTED_SCHEMAS);
				const parsedW3CSchemaDetails = JSON.parse(getW3CSchemaDetails || '[]');
		
				if (Array.isArray(parsedW3CSchemaDetails) && parsedW3CSchemaDetails.length > 0) {
					const allAttributes = parsedW3CSchemaDetails.flatMap(schema => {
						if (schema.attributes && Array.isArray(schema.attributes)) {
							return schema.attributes.map(attribute => ({
								...attribute,
								schemaName: schema.name,
								credDefName: '',
								schemaId: schema.schemaLedgerId,
								credDefId: ''
							}));
						}
						return [];
					});
	
					const inputArray = allAttributes.map(attribute => ({
						displayName: attribute.displayName,
						attributeName: attribute.attributeName,
						isChecked: false,
						value: '',
						condition: '',
						options: predicatesConditions,
						dataType: attribute.schemaDataType,
						schemaName: attribute.schemaName,
						credDefName: attribute.credDefName,
						schemaId: attribute.schemaId,
						credDefId: attribute.credDefId,
						selectedOption: 'Select',
						inputError: '',
						selectError: ''
					}));
	
					setAttributeData(inputArray);
				} else {
					console.error('W3C schema details are not in the expected format.');
				}
	
			} else {
				const getSelectedCredDefData = await getFromLocalStorage(storageKeys.CRED_DEF_DATA);
				const selectedCredDefs = JSON.parse(getSelectedCredDefData || '[]');
	
				const schemaAttributes = await getFromLocalStorage(storageKeys.SCHEMA_ATTRIBUTES);
				const parsedSchemaDetails = JSON.parse(schemaAttributes || '[]');
	
	
				if (Array.isArray(parsedSchemaDetails) && parsedSchemaDetails.length > 0) {
					const allAttributes = parsedSchemaDetails.flatMap(schema => {
						if (schema.attributes && Array.isArray(schema.attributes)) {
							return schema.attributes.flatMap(attribute => {
								const matchingCredDefs = selectedCredDefs.filter(
									credDef => credDef.schemaLedgerId === schema.schemaId
								);
	
								return matchingCredDefs.map(credDef => ({
									displayName: attribute.displayName,
									attributeName: attribute.attributeName,
									isChecked: false,
									value: '',
									condition: '',
									options: predicatesConditions,
									dataType: attribute.schemaDataType,
									schemaName: schema.schemaId.split(':')[2],
									credDefName: credDef.tag,
									schemaId: schema.schemaId,
									credDefId: credDef.credentialDefinitionId,
									selectedOption: 'Select',
									inputError: '',
									selectError: ''
								}));
							});
						}
						return [];
					});
	
					setAttributeData(allAttributes);
				} else {
					console.error('Parsed schema details are not in the expected format.');
				}
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};
	
	useEffect(() => {
		loadAttributesData();
	}, [w3cSchema]);
	
	
	const attributeFunction = async () => {
		const attributes = attributeData?.map((attribute: ISelectedAttributes) => {
			return {
				data: [
					{
						data: (
							<div className="flex items-center">
								<CustomCheckbox
									showCheckbox={true}
									isVerificationUsingEmail={true}
									onChange={(checked: boolean) => {
										handleAttributeChange(attribute?.attributeName, 'checkbox', checked, attribute?.schemaId, attribute?.credDefId);
									}}
								/>
							</div>
						),
					},
					{ data: attribute?.displayName },
					{
						data: !w3cSchema && (
							<div className="flex items-center relative">
								{attribute?.dataType === 'number' && (
									<select
										disabled={!attribute?.isChecked}
										value={attribute?.selectedOption}
										onChange={(e) =>
											handleAttributeChange(attribute?.attributeName, 'select', e.target.value, attribute?.schemaId, attribute?.credDefId)
										}
										className={`${!attribute?.isChecked
											? 'opacity-50 cursor-not-allowed'
											: 'cursor-pointer'
											} p-1 border border-black rounded-md dark:text-gray-200 dark:bg-gray-700 dark:border-gray-300 dark:placeholder-gray-400 dark:text-white`}
									>
										{attribute?.options?.map(
											(option) => (
												<option key={option?.value} value={option?.value}>
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
					{
						data: !w3cSchema && (
							<div className="relative flex flex-col items-start">
								{attribute?.dataType === 'number' && (
									<input
										type="number"
										value={attribute?.value}
										onChange={(e) =>
											handleAttributeChange(attribute?.attributeName, 'input', e.target.value, attribute?.schemaId, attribute?.credDefId)
										}
										disabled={!attribute?.isChecked}
										className={`${!attribute?.isChecked
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
					{ data: attribute.schemaName },
					{ data: attribute.credDefName },
				],
			};
		});

		setAttributeList(attributes);
		setDisplay(attributeData?.some((attribute) => attribute?.dataType === 'number'));
	};


	useEffect(() => {
		attributeData && attributeFunction();
	}, [attributeData]);

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'Attributes' },
		display && !w3cSchema && { columnName: 'Condition' },
		display && !w3cSchema && { columnName: 'Value', width: 'w-0.75' },
		{ columnName: 'Schema Name' },
		!w3cSchema && { columnName: 'Cred Def Name' },
	];

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={w3cSchema ? pathRoutes.organizations.verification.email : pathRoutes.organizations.verification.emailCredDef} />
				</div>
			</div>

			{(proofReqSuccess || errMsg) && (
				<div className="p-2">
					<Alert
						color={proofReqSuccess ? 'success' : 'failure'}
						onDismiss={() => {
							setProofReqSuccess(null);
							setErrMsg(null);
						}}
					>
						{proofReqSuccess ?? errMsg}
					</Alert>
				</div>
			)}
			<div
				className={` flex sm:flex-row flex-col sm:justify-between font-montserrat sm:space-x-2 text-base font-semibold leading-6 tracking-normal text-left dark:text-white p-2`}
			>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white mr-auto">
					Attributes
				</h1>
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
					disabled={
						!attributeData?.some((ele) => ele.isChecked)
					}
					className="text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto"
				>
					<svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">
						<path fill="#fff" d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z" />
						<path fill="#fff" d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z" />
					</svg>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default EmailAttributesSelection;

