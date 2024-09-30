
import { Alert, Button, Pagination } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { AxiosResponse } from 'axios';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, itemPerPage, storageKeys } from '../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '../../api/Schema';
import { DidMethod, SchemaTypes } from '../../common/enums';
import { getOrganizationById } from '../../api/organization';
import { Create } from '../Issuance/Constant';
import BreadCrumbs from '../BreadCrumbs';
import SearchInput from '../SearchInput';
import RoleViewButton from '../RoleViewButton';
import { Features } from '../../utils/enums/features';
import { pathRoutes } from '../../config/pathRoutes';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import SchemaCard from '../../commonComponents/SchemaCard';
import type { IAttributesDetails, ISchema, ISchemaData } from './interface';

const VerificationSchemasList = () => {
	const [schemasList, setSchemasList] = useState([]);
	const [schemasDetailsErr, setSchemasDetailsErr] = useState<string | null>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [allSchemasFlag, setAllSchemasFlag] = useState<boolean>(false);
	const [schemasListParameter, setSchemasListParameter] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [walletStatus, setWalletStatus] = useState(false);
	const [totalItems, setTotalItems] = useState(0);
	const [searchValue, setSearchValue] = useState('');
	const [selectedSchemas, setSelectedSchemas] = useState<ISchema[]>([]);
	const [w3cSchema, setW3cSchema] = useState<boolean>(false);
	const [isNoLedger, setIsNoLedger] = useState<boolean>(false);
	const [schemaType, setSchemaType] = useState('');

		const getSchemaListDetails = async () => {
	
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setLoading(true);
			let schemasList;
				if (allSchemasFlag) {
				schemasList = await getAllSchemas(schemasListParameter, schemaType);
			} else {
				schemasList = await getAllSchemasByOrgId(
					schemasListParameter,
					organizationId,
				);
			}

			const { data } = schemasList as AxiosResponse;

			if (schemasList === 'Schema records not found') {
				setLoading(false);
				setSchemasList([]);
			}

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				if (data?.data?.data) {
					setTotalItems(data?.data?.lastPage);
					setSchemasList(data?.data?.data);
					setLoading(false);
				} else {
					setLoading(false);
					if (schemasList !== 'Schema records not found') {
						setSchemasDetailsErr(schemasList as string);
					}
				}
			} else {
				setLoading(false);
				if (schemasList !== 'Schema records not found') {
					setSchemasDetailsErr(schemasList as string);
				}
			}
			setTimeout(() => {
				setSchemasDetailsErr('');
			}, 3000);
		} catch (error) {
			console.error('Error while fetching schema list:', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getSchemaListDetails();
	}, [schemasListParameter, allSchemasFlag]);

	const onSchemaListParameterSearch = async (
		event: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		event.preventDefault();
		const inputValue = event.target.value;
		setSearchValue(inputValue);
		if (allSchemasFlag) {
			setSchemasListParameter(prevParams => ({
				...prevParams,
				allSearch: inputValue,
				page: 1,
			}));
		} else {
			setSchemasListParameter(prevParams => ({
				...prevParams,
				search: inputValue,
				page: 1,
			}));
		}
	};

	const handleSchemaSelection = (
		schemaId: string,
		attributes: IAttributesDetails[],
		issuerId: string,
		created: string,
		checked: boolean,
	) => {
		const schemaDetails = {
			schemaId: schemaId,
			attributes: attributes,
			issuerId: issuerId,
			createdDate: created,
		};
	
		if (checked) {
			setSelectedSchemas((prevSelectedSchemas) => [...prevSelectedSchemas, schemaDetails]);
		} else {
			setSelectedSchemas((prevSelectedSchemas) =>
				prevSelectedSchemas.filter((schema) => schema.schemaId !== schemaId)
			);
		}
	};

	const handleW3cSchemas = async (checked: boolean, schemaData?: ISchemaData) => {
		const updateSchemas = (prevSchemas: ISchemaData[]) => {
			let updatedSchemas = [...prevSchemas];
			if (checked && schemaData) {
				updatedSchemas = [...updatedSchemas, schemaData];
			} else {
				updatedSchemas = updatedSchemas.filter(schema => schema?.schemaLedgerId !== schemaData?.schemaLedgerId);
			}

			return updatedSchemas;
		};

		setSelectedSchemas(prevSchemas => {
			if (!Array.isArray(prevSchemas)) {
				console.error('Previous schemas is not an array:', prevSchemas);
				return [];
			}

			const updatedSchemas = updateSchemas(prevSchemas);

			setToLocalStorage(storageKeys.SELECTED_SCHEMAS, updatedSchemas)
				.catch(error => console.error('Failed to save to local storage:', error));

			return updatedSchemas;
		});
	};

	const fetchOrganizationDetails = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const did = data?.data?.org_agents?.[0]?.orgDid;

			if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
				setWalletStatus(true);
			}
			if (did.includes(DidMethod.POLYGON) || did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
				setW3cSchema(true);
				setSchemaType(SchemaTypes.schema_W3C)
			}
			if (did.includes(DidMethod.INDY)) {
				setW3cSchema(false);
				setSchemaType(SchemaTypes.schema_INDY)
			}
			if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
				setIsNoLedger(true);
			}
		}
		setLoading(false);
	};

	const handleContinue = async () => {
		const schemaIds = selectedSchemas?.map(schema => schema?.schemaId)
		await setToLocalStorage(storageKeys.SCHEMA_IDS, schemaIds)

		const schemaAttributes = selectedSchemas.map(schema => ({
			schemaId: schema.schemaId,
			attributes: schema.attributes,
		}));

		await setToLocalStorage(storageKeys.SCHEMA_ATTRIBUTES, schemaAttributes);

		window.location.href = `${pathRoutes.organizations.verification.emailCredDef}`;
	};

	const handleW3CSchemaDetails = async () => {
		const w3cSchemaDetails = await getFromLocalStorage(storageKeys.SELECTED_SCHEMAS)

		const parsedSchemaDetails = JSON.parse(w3cSchemaDetails);

		const w3cSchemaAttributes = parsedSchemaDetails.map(schema => ({
			schemaId: schema.schemaId,
			attributes: schema.attributes,
			schemaName: schema.schemaName
		}))
		await setToLocalStorage(storageKeys.W3C_SCHEMA_ATTRIBUTES, w3cSchemaAttributes);

		window.location.href = `${pathRoutes.organizations.verification.w3cAttributes}`;
	};

	const options = ['All schemas'];

	const handleFilter = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedFilter = e.target.value;
		setAllSchemasFlag(selectedFilter === 'All schemas');
			
			setSchemasListParameter((prevParams) => ({
				...prevParams,
				page: 1,
				search: '', 
				allSearch: '', 	  
			}));
			setSearchValue(''); 

	};	
	useEffect(() => {
		fetchOrganizationDetails();
		setSearchValue('');
	}, []);

	const createSchemaButtonTitle =  { title: 'Create', svg: <Create />, toolTip: 'Create new schema' };
	const emptySchemaListTitle = 'No Schemas';
	const emptySchemaListDescription = 'Get started by creating a new Schema';
	const emptySchemaListBtn = { title: 'Create Schema', svg: <Create /> };
	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>

			<div>
				<div>
					<div className="mb-4 flex justify-between flex-wrap gap-4 items-center">
						<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white mr-auto">
							Schemas
						</h1>
						<SearchInput onInputChange={onSchemaListParameterSearch} value={searchValue} />

						<select
							onChange={handleFilter}
							id="schamfilter"
							defaultValue="Organization's schema"
							className="min-h-[42px] h-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							<option value="Organization's schema">Organization's schema</option>
							{options.map((opt) => (
								<option key={opt} className="" value={opt}>
									{opt}
								</option>
							))}
						</select>

						<div className="flex space-x-2">
							{walletStatus ? (
								<RoleViewButton
									title={createSchemaButtonTitle.toolTip}
									buttonTitle={createSchemaButtonTitle.title}
									feature={Features.CRETAE_SCHEMA}
									svgComponent={createSchemaButtonTitle.svg}
									onClickEvent={() => {
										window.location.href = `${pathRoutes.organizations.createSchema}`;
									}}
								/>
							) : (
								<RoleViewButton
									buttonTitle={createSchemaButtonTitle.title}
									feature={Features.CRETAE_SCHEMA}
									svgComponent={createSchemaButtonTitle.svg}
									onClickEvent={() => {
										window.location.href = `${pathRoutes.organizations.dashboard}`;
									}}
								/>
							)}
						</div>
					</div>
				</div>
				{schemasDetailsErr && (
					<Alert color="failure" onDismiss={() => setSchemasDetailsErr(null)}>
						<span>
							<p>{schemasDetailsErr}</p>
						</span>
					</Alert>
				)}
				{schemasList && schemasList.length > 0 ? (
					<div
						className="Flex-wrap"
						style={{ display: 'flex', flexDirection: 'column' }}
					>
						<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
							{schemasList &&
								schemasList.length > 0 &&
								schemasList.map((element) => (
									<div className="px-0 sm:px-2" key={element['schemaLedgerId']}>
										<SchemaCard
											schemaName={element['name']}
											version={element['version']}
											schemaId={element['schemaLedgerId']}
											issuerDid={element['issuerId']}
											attributes={element['attributes']}
											created={element['createDateTime']}
											showCheckbox={true}
											isClickable={false}
											w3cSchema={w3cSchema}
											noLedger={isNoLedger}
											isVerificationUsingEmail={true}
											onChange={(checked) => {
												w3cSchema 
													? handleW3cSchemas(checked, element) 
													: handleSchemaSelection(
														  element['schemaLedgerId'], 
														  element['attributes'], 
														  element['issuerId'], 
														  element['createDateTime'], 
														  checked
													  );
											}}										
										/>
									</div>
								))}
						</div>

						<div>
							<Button

								onClick={w3cSchema ? handleW3CSchemaDetails : handleContinue}
								disabled={selectedSchemas.length === 0}
								className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto'
							><svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">
									<path fill="#fff" d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z" />
									<path fill="#fff" d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z" />
								</svg>
								Continue
							</Button>
						</div>
						<div
							className="flex items-center justify-end mb-4"
							id="schemasPagination"
						>
							{totalItems > 1 && (
								<Pagination
									currentPage={schemasListParameter?.page}
									onPageChange={(page) => {
										setSchemasListParameter((prevState) => ({
											...prevState,
											page: page,
										}));
									}}
									totalPages={totalItems}
								/>
							)}
						</div>
					</div>
				) : (
					<div>
						{loading ? (
							<div className="flex items-center justify-center mb-4">
								<CustomSpinner />
							</div>
						) : (
							<div className="bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
								<EmptyListMessage
									message={emptySchemaListTitle}
									description={emptySchemaListDescription}
									buttonContent={emptySchemaListBtn.title}
									svgComponent={emptySchemaListBtn.svg}
									onClick={() => {
										window.location.href = `${pathRoutes.organizations.createSchema}`;
									}}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default VerificationSchemasList;
