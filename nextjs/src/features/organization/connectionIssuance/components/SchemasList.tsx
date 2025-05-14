'use client'

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { DidMethod, SchemaType, SchemaTypes } from '@/common/enums';
import type { IW3cSchemaDetails, SchemaDetails } from '../type/SchemasList';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import React, { useEffect, useState } from 'react';
import { allSchemas, apiStatusCodes, itemPerPage, storageKeys } from '../../../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '@/app/api/schema';
import { setAllSchema, setSchemaDetails, setW3cSchemaData } from "@/lib/storageKeys";
import { useDispatch, useSelector } from "react-redux";

import type { AxiosResponse } from 'axios';
import type { ChangeEvent } from 'react';
// import CustomSpinner from '../../CustomSpinner';
import { EmptyListMessage } from '@/components/EmptyListComponent';
import { Features } from '@/common/enums';
import type { GetAllSchemaListParameter } from '../type/SchemasList';
// import type { ICheckEcosystem } from '../../../config/ecosystem';
import Loader from '@/components/Loader';
import PageContainer from "@/components/layout/page-container";
import { Plus } from 'lucide-react';
import RoleViewButton from '@/components/RoleViewButton';
import { RootState } from "@/lib/store";
import SchemaCard from './SchemaCard';
// import SchemaCard from '../../schemas/components/SchemaCard';
import SearchInput from '@/components/SearchInput';
// import { checkEcosystem } from '../../../config/ecosystem';
import { envConfig } from '../../../../config/envConfig';
import { getOrganizationById } from '@/app/api/organization';
import { pathRoutes } from '../../../../config/pathRoutes';

// import Select, { type SingleValue, type ActionMeta } from 'react-select';


// import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../../../api/Auth';


const SchemaList = (props: {
		schemaSelectionCallback?: (
		schemaId: string,
		schemaDetails: SchemaDetails,
	) => void;

	W3CSchemaSelectionCallback?: (
		schemaId: string,
		w3cSchemaDetails: IW3cSchemaDetails,
	) => void;

	verificationFlag?: boolean;
}) => {
	const dispatch= useDispatch()
	const verificationFlag = props.verificationFlag ?? false;
	const [schemaList, setSchemaList] = useState([]);
	const [schemaListErr, setSchemaListErr] = useState<string | null>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false);
	// const [orgId, setOrgId] = useState<string>('');
	// const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: itemPerPage,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [walletStatus, setWalletStatus] = useState(false);
	const [lastPage, setLastPage] = useState(0);
	const [totalItem, setTotalItem] = useState(0);
	const [searchValue, setSearchValue] = useState('');
	const [schemaType, setSchemaType] = useState('');

	const [defaultDropdownValue]= useState<string[]>([`Organization's schema`,'All schemas']);
	const[selectedValue,setSelectedValue]=useState<string>(defaultDropdownValue[0])
	const [w3cSchema,setW3CSchema]= useState<boolean>(false);
	const [isNoLedger,setisNoLedger]= useState<boolean>(false);	
    const orgId = useSelector((state:RootState)=>state.organization.orgId)
    const ledgerId = useSelector((state:RootState)=>state.organization.ledgerId)
    
    const Create = () => (
        <div className="pr-3 shrink-0">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    fill="#fff"
                    d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
                />
            </svg>
        </div>
    );
    
    
    const SchemaEndorsement = () => (
        <svg
          className="mr-2 mt-1 shrink-0"
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
      );
      
    

	const getSchemaList = async (
		schemaListAPIParameter: GetAllSchemaListParameter,
		flag: boolean,
	) => {
		try {
			const organizationId = orgId
			// setOrgId(organizationId);
			setLoading(true);
			let schemaList;
			if (allSchemaFlag) {
				schemaList = await getAllSchemas(schemaListAPIParameter, schemaType,ledgerId);
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
					setLastPage(data?.data?.lastPage);
					setTotalItem(data?.data?.totalItems);					
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

	const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		event.preventDefault();
		const inputValue = event.target.value;
		setSearchValue(inputValue);
	
		setSchemaListAPIParameter(prev => ({
			...prev,
			search: allSchemaFlag ? '' : inputValue,
			allSearch: allSchemaFlag ? inputValue : '',
		}));
	
		setTimeout(() => {
			getSchemaList(
				{
					...schemaListAPIParameter,
					search: allSchemaFlag ? '' : inputValue,
					allSearch: allSchemaFlag ? inputValue : '',
				},
				false
			);
		}, 100);
	};
	
	const schemaSelectionCallback = (
		{
			schemaId,
			attributes,
			issuerDid,
			created,
		  }: {
			schemaId: string;
			attributes: string[];
			issuerDid: string;
			created: string;
		  }) => {
		const schemaDetails = {
			attribute: attributes,
			issuerDid,
			createdDate: created,
		};
		props.schemaSelectionCallback?.(schemaId, schemaDetails);
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
		props.W3CSchemaSelectionCallback?.(schemaId, w3cSchemaDetails);
		// await setToLocalStorage(storageKeys.W3C_SCHEMA_DATA, w3cSchemaDetails);		
		dispatch(setW3cSchemaData(w3cSchemaDetails))
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
		// await setToLocalStorage(storageKeys.W3C_SCHEMA_DETAILS, schemaDetails);
		dispatch(setSchemaDetails(schemaDetails))

	  };

	const handleFilter = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedValue(e.target.value);
	
		const isAllSchemas = e.target.value === allSchemas;
		setAllSchemaFlag(isAllSchemas);
		// await setToLocalStorage(storageKeys.ALL_SCHEMAS, isAllSchemas ? `true` : `false`);
		dispatch(setAllSchema(isAllSchemas ? `true` : `false`))

	};
	
	useEffect(() => {
		getSchemaList(schemaListAPIParameter, allSchemaFlag);
	}, [allSchemaFlag]);
	
	const fetchOrganizationDetails = async () => {
		setLoading(true);
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const did = data?.data?.org_agents?.[0]?.orgDid;

			// await setToLocalStorage(storageKeys.ORG_DID, did)
			dispatch(setAllSchema(did))

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
		// (async () => {
		// 	try {
		// 		const data: ICheckEcosystem = await checkEcosystem();				
		// 		setIsEcosystemData(data);
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// })();
		// (async () => {
		// 	// await setToLocalStorage (storageKeys.ALL_SCHEMAS, `false`);
		// 	dispatch(setAllSchema(`false`))

		// 		})();
	}, []);


	// const createSchemaTitle = isEcosystemData?.isEcosystemMember
	// 	? { title: 'Schema Endorsement', toolTip: 'Add new schema request', svg: <SchemaEndorsement/> }
	// 	: { title: 'Create', svg: <Create/>, toolTip: 'Create new schema' };	
	const emptyListTitle = 'No Schemas';
	const emptyListDesc = 'Get started by creating a new Schema';
	// const emptyListBtn = isEcosystemData?.isEcosystemMember
	// ? { title: 'Schema Endorsement', svg: <SchemaEndorsement/> }
	// : { title: 'Create Schema', svg: <Create/> };
	
	const createSchemaTitle = { title: 'Create', svg: <Create/>, toolTip: 'Create new schema' };
	const emptyListBtn = { title: 'Create Schema', svg: <Create/> }

	return (
		<PageContainer>
		<div className="px-4 pt-2 overflow-scroll">
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
									svgComponent={<Plus/>}
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
									svgComponent={<Plus/>}
									onClickEvent={() => {
										window.location.href = `${pathRoutes.organizations.dashboard}`;
									}}
								/>
							)}
						</div>
					</div>
				</div>
				{schemaListErr && (
					<Alert variant="destructive" className="relative" >
                        <div className="absolute top-5 right-5" onClick={() => setSchemaListErr('')}>x</div>
						<span className="w-24" >
							{/* <p>{typeof schemaListErr === 'string' ? schemaListErr : JSON.stringify(schemaListErr)}</p> */}
							<p>Test Error</p>
						</span>
					</Alert>
				)}
				{schemaList && schemaList.length > 0 ? (
					<div
						className="Flex-wrap"
						style={{ display: 'flex', flexDirection: 'column' }}
					>
						<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-2">
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
											selectedSchemas={[]}										
										/>
									</div>
								))}
						</div>
						<div
							className="flex items-center justify-center mb-4"
							id="schemasPagination"
						>
							{totalItem > itemPerPage && (
								<div className='mt-6 flex justify-end'>
									<Pagination>
									<PaginationContent>
										{schemaListAPIParameter.page > 1 && (
										<PaginationItem>
											<PaginationPrevious
											href='#'
											onClick={() =>
												setSchemaListAPIParameter((prev) => ({
												...prev,
												page: prev.page - 1
												}))
											}
											/>
										</PaginationItem>
										)}

										{Array.from({ length: lastPage }).map((_, index) => {
										const page = index + 1;
										const isActive = page === schemaListAPIParameter.page;
										return (
											<PaginationItem key={page}>
											<PaginationLink
												className={`${
												isActive
													? 'bg-primary text-white'
													: 'bg-background text-muted-foreground'
												} rounded-lg px-4 py-2`}
												href='#'
												onClick={() =>
												setSchemaListAPIParameter((prev) => ({
													...prev,
													page
												}))
												}
											>
												{page}
											</PaginationLink>
											</PaginationItem>
										);
										})}

										{schemaListAPIParameter.page < lastPage && (
										<PaginationItem>
											<PaginationNext
											href='#'
											onClick={() =>
												setSchemaListAPIParameter((prev) => ({
												...prev,
												page: prev.page + 1
												}))
											}
											/>
										</PaginationItem>
										)}
									</PaginationContent>
									</Pagination>
								</div>
								)}
						</div>
					</div>
				) : (
					<div>
						{ loading ? (
							<div className="flex items-center justify-center mb-4">
								<Loader height='2rem' width='2rem' />
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
		</PageContainer>
		
	);
};

export default SchemaList;
