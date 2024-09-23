
import { Alert, Pagination } from 'flowbite-react';
import React, {  useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import type { GetAllSchemaListParameter } from './interfaces';
import { apiStatusCodes, itemPerPage, storageKeys } from '../../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '../../../api/Schema';
import { checkEcosystem } from '../../../config/ecosystem';
import type { ICheckEcosystem } from '../../../config/ecosystem';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import CustomSpinner from '../../CustomSpinner';
import { EmptyListMessage } from '../../EmptyListComponent';
import { Features } from '../../../utils/enums/features';
import RoleViewButton from '../../RoleViewButton';
import SchemaCard from '../../../commonComponents/SchemaCard';
import type { IW3cSchemaDetails, SchemaDetails } from '../../Verification/interface';
import SearchInput from '../../SearchInput';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { getOrganizationById } from '../../../api/organization';
import Select, { type SingleValue, type ActionMeta } from 'react-select';
import { Create, SchemaEndorsement } from '../../Issuance/Constant';
import { DidMethod, SchemaType, SchemaTypes } from '../../../common/enums';
import { envConfig } from '../../../config/envConfig';

const SchemaList = (props: {
		schemaSelectionCallback: (
		schemaId: string,
		schemaDetails: SchemaDetails,
	) => void;

	W3CSchemaSelectionCallback: (
		schemaId: string,
		w3cSchemaDetails: IW3cSchemaDetails,
	) => void;

	verificationFlag?: boolean;
}) => {

	const verificationFlag = props.verificationFlag ?? false;
	const [schemaList, setSchemaList] = useState([]);
	const [schemaListErr, setSchemaListErr] = useState<string | null>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false);
	const [orgId, setOrgId] = useState<string>('');
	const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [walletStatus, setWalletStatus] = useState(false);
	const [totalItem, setTotalItem] = useState(0);
	const [searchValue, setSearchValue] = useState('');
	const [schemaType, setSchemaType] = useState('');

	const [defaultDropdownValue]= useState<string[]>([`Organization's schema`,'All schemas']);
	const[selectedValue,setSelectedValue]=useState<string>(defaultDropdownValue[0])
	const [w3cSchema,setW3CSchema]= useState<boolean>(false);
	const [isNoLedger,setisNoLedger]= useState<boolean>(false);	

	const getSchemaList = async (
		schemaListAPIParameter: GetAllSchemaListParameter,
		flag: boolean,
	) => {
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgId(organizationId);
			setLoading(true);
			let schemaList;
			if (allSchemaFlag) {
				schemaList = await getAllSchemas(schemaListAPIParameter, schemaType);
			} else {
				schemaList = await getAllSchemasByOrgId(
					schemaListAPIParameter,
					organizationId,
				);
			}

			const { data } = schemaList as AxiosResponse;	
			if (schemaList === 'Schema records not found') {
				setLoading(false);
				setSchemaList([]);
			}

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {				
				if (data?.data?.data) {
					setTotalItem(data?.data?.lastPage);
					setSchemaList(data?.data?.data);
					setLoading(false);
				} else {
					setLoading(false);
					if (schemaList !== 'Schema records not found') {
						setSchemaListErr(schemaList as string);
					}
				}
			} else {
				setLoading(false);
				if (schemaList !== 'Schema records not found') {
					setSchemaListErr(schemaList as string);
				}
			}
			setTimeout(() => {
				setSchemaListErr('');
			}, 3000);
		} catch (error) {
			console.error('Error while fetching schema list:', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getSchemaList(schemaListAPIParameter, false);
	}, [schemaListAPIParameter, allSchemaFlag]);

	const onSearch = async (
		event: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		event.preventDefault();
		const inputValue = event.target.value;
        setSearchValue(inputValue);

		getSchemaList(
			{
				...schemaListAPIParameter,
				search: inputValue,
			},
			false,
		);

		if (allSchemaFlag) {
			getSchemaList(
				{
					...schemaListAPIParameter,
					allSearch: inputValue,
				},
				false,
			);
		}
	};

	const schemaSelectionCallback = (
		schemaId: string,
		attributes: string[],
		issuerId: string,
		created: string,
	) => {
		const schemaDetails = {
			attribute: attributes,
			issuerDid: issuerId,
			createdDate: created,
		};
		props.schemaSelectionCallback(schemaId, schemaDetails);
	};

	const W3CSchemaSelectionCallback = async ({
		schemaId,
		schemaName,
		version,
		issuerDid,
		attributes,
		created,
	}: {
		schemaId: string,
		schemaName: string,
		version: string,
		issuerDid: string,
		attributes: [],
		created: string
	}) => {
		const w3cSchemaDetails = {
			schemaId,
			schemaName,
			version,
			issuerDid,
			attributes,
			created,
		};
		props.W3CSchemaSelectionCallback(schemaId, w3cSchemaDetails);
		await setToLocalStorage(storageKeys.W3C_SCHEMA_DATA, w3cSchemaDetails);		
	};
	

	const handleW3CIssue = async (
		schemaId: string,
		schemaName: string,
		version: string,
		issuerDid: string,
		attributes: [],
		created: string
	  ) => {
		const schemaDetails = {
		  schemaId,
		  schemaName,
		  version,
		  issuerDid,
		  attributes,
		  created,
		}; 
		await setToLocalStorage(storageKeys.W3C_SCHEMA_DETAILS, schemaDetails);
		
	  };

	const handleFilter = async (e: React.ChangeEvent<HTMLSelectElement>) => {

		setSchemaListAPIParameter((prevState) => ({
			...prevState,
			page: 1,
		}));
		setSelectedValue(e.target.value)
		console.log('Handle filter', e.target.value);
		if (e.target.value === 'All schemas') {
			setAllSchemaFlag(true);
			await setToLocalStorage (storageKeys.ALL_SCHEMAS, `true`);
			
		} else {
			setAllSchemaFlag(false);
			await setToLocalStorage (storageKeys.ALL_SCHEMAS, `false`);
			getSchemaList(schemaListAPIParameter, false);
		}

	};

	const fetchOrganizationDetails = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const did = data?.data?.org_agents?.[0]?.orgDid;

			await setToLocalStorage(storageKeys.ORG_DID, did)
			if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
				setWalletStatus(true);
			}
			if (did.includes(DidMethod.POLYGON) || did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
				setW3CSchema(true);
				setSchemaType(SchemaTypes.schema_W3C)
			}
			if (did.includes(DidMethod.INDY)) {
				setW3CSchema(false);
				setSchemaType(SchemaTypes.schema_INDY)
			}
			if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
				setisNoLedger(true);
			}
		}
		setLoading(false);
	};

	useEffect(() => {	
			setSelectedValue(defaultDropdownValue[0])
	}, []);

	useEffect(() => {

		fetchOrganizationDetails();
		(async () => {
			try {
				const data: ICheckEcosystem = await checkEcosystem();				
				setIsEcosystemData(data);
			} catch (error) {
				console.log(error);
			}
		})();
		(async () => {
			await setToLocalStorage (storageKeys.ALL_SCHEMAS, `false`);
				})();
		setSearchValue('');
	}, []);


	const createSchemaTitle = isEcosystemData?.isEcosystemMember
		? { title: 'Schema Endorsement', toolTip: 'Add new schema request', svg: <SchemaEndorsement/> }
		: { title: 'Create', svg: <Create/>, toolTip: 'Create new schema' };	const emptyListTitle = 'No Schemas';
	const emptyListDesc = 'Get started by creating a new Schema';
	const emptyListBtn = isEcosystemData?.isEcosystemMember
	? { title: 'Schema Endorsement', svg: <SchemaEndorsement/> }
	: { title: 'Create Schema', svg: <Create/> };

	
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
						<SearchInput onInputChange={onSearch} value={searchValue}/>

						<select
							onChange={handleFilter}
							id="schamfilter"
							value={selectedValue}
							className="min-h-[42px] h-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							{defaultDropdownValue.map((opt) => (
								<option key={opt} className="">
									{opt}
								</option>
							))}
						</select>

						<div className="flex space-x-2">
							{walletStatus ? (
								<RoleViewButton
								title={createSchemaTitle.toolTip}
									buttonTitle={createSchemaTitle.title}
									feature={Features.CRETAE_SCHEMA}
									svgComponent={createSchemaTitle.svg}
									onClickEvent={() => {
										if (createSchemaTitle.title === 'Schema Endorsement') {
									window.location.href = `${envConfig.PUBLIC_ECOSYSTEM_FRONT_END_URL}${pathRoutes.organizations.schemas}` 

										} else {
										  window.location.href = `${pathRoutes.organizations.createSchema}`;
										}
									  }}
								/>
							) : (
								<RoleViewButton
									buttonTitle={createSchemaTitle.title}
									feature={Features.CRETAE_SCHEMA}
									svgComponent={createSchemaTitle.svg}
									onClickEvent={() => {
										window.location.href = `${pathRoutes.organizations.dashboard}`;
									}}
								/>
							)}
						</div>
					</div>
				</div>
				{schemaListErr && (
					<Alert color="failure" onDismiss={() => setSchemaListErr(null)}>
						<span>
							<p>{schemaListErr}</p>
						</span>
					</Alert>
				)}
				{schemaList && schemaList.length > 0 ? (
					<div
						className="Flex-wrap"
						style={{ display: 'flex', flexDirection: 'column' }}
					>
						<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
							{schemaList &&
								schemaList.length > 0 &&
								schemaList.map((element, key) => (
									<div className="px-0 sm:px-2" key={`SchemaList-${key}`}>
										<SchemaCard
											schemaName={element['name']}
											version={element['version']}
											schemaId={element['schemaLedgerId']}
											issuerDid={element['issuerId']}
											attributes={element['attributes']}
											created={element['createDateTime']}
											showCheckbox={false}
											onClickCallback={schemaSelectionCallback}
											onClickW3CCallback={W3CSchemaSelectionCallback}
											onClickW3cIssue={handleW3CIssue}
											w3cSchema={w3cSchema}
											noLedger={isNoLedger}
											isVerification={verificationFlag}
																					
										/>
									</div>
								))}
						</div>
						<div
							className="flex items-center justify-end mb-4"
							id="schemasPagination"
						>
							{totalItem > 1 && (
								<Pagination
									currentPage={schemaListAPIParameter?.page}
									onPageChange={(page) => {
										setSchemaListAPIParameter((prevState) => ({
											...prevState,
											page: page,
										}));
									}}
									totalPages={totalItem}
								/>
							)}
						</div>
					</div>
				) : (
					<div>
						{ loading ? (
							<div className="flex items-center justify-center mb-4">
								<CustomSpinner />
							</div>
						) : (
							<div className="bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
								<EmptyListMessage
									message={emptyListTitle}
									description={emptyListDesc}
									buttonContent={emptyListBtn.title}
									svgComponent={emptyListBtn.svg}
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

export default SchemaList;
