'use client';

import { Alert, Pagination } from 'flowbite-react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import type { GetAllSchemaListParameter } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '../../api/Schema';
import SchemaSelectionAccordion from '../../components/Verification/ProofAccordionComponents/SchemSelectionAccordion'
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import { Features } from '../../utils/enums/features';
import RoleViewButton from '../RoleViewButton';
import SchemaCard from '../../commonComponents/SchemaCard';
import type { SchemaDetails } from '../Verification/interface';
import SearchInput from '../SearchInput';
import { getFromLocalStorage } from '../../api/Auth';
import { pathRoutes } from '../../config/pathRoutes';
import { getOrganizationById } from '../../api/organization';
import { ICheckEcosystem, checkEcosystem } from '../../config/ecosystem';
import { Create, SchemaEndorsement } from '../Issuance/Constant';
import type { TableData } from '../../commonComponents/datatable/interface';
import ConnectionList from '../Issuance/ConnectionList';
import CredDefAccordionComponent from './ProofAccordionComponents/CredDefAccordionComponent';


// const ProofVerificationRequest = (props: {
// 	schemaSelectionCallback: (
// 		schemaId: string,
// 		schemaDetails: SchemaDetails,
// 	) => void;
// }) => {
	const ProofVerificationRequest = () => {
	const [schemaList, setSchemaList] = useState<TableData[]>();
	const [schemaListErr, setSchemaListErr] = useState<string | null>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false);
	const [orgId, setOrgId] = useState<string>('');
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: 9,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'desc',
		allSearch: '',
	});
	// const [walletStatus, setWalletStatus] = useState(false);
	// const [totalItem, setTotalItem] = useState(0);
	// const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();
	// const [searchValue, setSearchValue] = useState('');

	// const getSchemaList = async (
	// 	schemaListAPIParameter: GetAllSchemaListParameter,
	// 	flag: boolean,
	// ) => {
	// 	try {
	// 		const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
	// 		setOrgId(organizationId);
	// 		setLoading(true);
	// 		let schemaList;

			
	// 		if (allSchemaFlag) {	
	// 			schemaList = await getAllSchemas(schemaListAPIParameter);
	// 		} else {
	// 			schemaList = await getAllSchemasByOrgId(
	// 				schemaListAPIParameter,
	// 				organizationId,
	// 			);
	// 		}
	// 		const { data } = schemaList as AxiosResponse;
	// 		if (schemaList === 'Schema records not found') {
	// 			setLoading(false);
	// 			setSchemaList([]);
	// 		}

	// 		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
	// 			if (data?.data?.data) {
	// 				setTotalItem(data?.data?.lastPage);
	// 				setSchemaList(data?.data?.data);
	// 				setLoading(false);
	// 			} else {
	// 				setLoading(false);
	// 				if (schemaList !== 'Schema records not found') {
	// 					setSchemaListErr(schemaList as string);
	// 				}
	// 			}
	// 		} else {
	// 			setLoading(false);
	// 			if (schemaList !== 'Schema records not found') {
	// 				setSchemaListErr(schemaList as string);
	// 			}
	// 		}
	// 		setTimeout(() => {
	// 			setSchemaListErr('');
	// 		}, 3000);
	// 	} catch (error) {
	// 		console.error('Error while fetching schema list:', error);
	// 		setLoading(false);
	// 	}
	// };

	// useEffect(() => {
	// 	getSchemaList(schemaListAPIParameter, false);
	// }, [schemaListAPIParameter, allSchemaFlag]);


	// const onSearch = async (
	// 	event: ChangeEvent<HTMLInputElement>,
	// ): Promise<void> => {
	// 	event.preventDefault();
	// 	const inputValue = event.target.value;
	// 	setSearchValue(inputValue);

	// 	getSchemaList(
	// 		{
	// 			...schemaListAPIParameter,
	// 			search: inputValue,
	// 		},
	// 		false,
	// 	);

	// 	if (allSchemaFlag) {
	// 		getSchemaList(
	// 			{
	// 				...schemaListAPIParameter,
	// 				allSearch: inputValue,
	// 			},
	// 			false,
	// 		);
	// 	}
	// };

	// const schemaSelectionCallback = (
	// 	schemaId: string,
	// 	attributes: string[],
	// 	issuerId: string,
	// 	created: string,
	// ) => {
	// 	const schemaDetails = {
	// 		attribute: attributes,
	// 		issuerDid: issuerId,
	// 		createdDate: created,
	// 	};
	// 	props.schemaSelectionCallback(schemaId, schemaDetails);
	// };

	// const options = ['All schemas'];

	// const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
	// 	console.log('Handle filter', e.target.value);
	// 	if (e.target.value === 'All schemas') {
	// 		setAllSchemaFlag(true);
	// 	} else {
	// 		setAllSchemaFlag(false);
	// 		getSchemaList(schemaListAPIParameter, false);
	// 	}
	// };

	// const fetchOrganizationDetails = async () => {
	// 	setLoading(true);
	// 	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	// 	const response = await getOrganizationById(orgId);
	// 	const { data } = response as AxiosResponse;
	// 	if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
	// 		if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
	// 			setWalletStatus(true);
	// 		}
	// 	}
	// 	setLoading(false);
	// };

	// useEffect(() => {
	// 	fetchOrganizationDetails();
	// 	(async () => {
	// 		try {
	// 			const data: ICheckEcosystem = await checkEcosystem();
	// 			setIsEcosystemData(data);
	// 		} catch (error) {
	// 			console.log(error);
	// 		}
	// 	})();
	// 	setSearchValue('');
	// }, []);

	// const createSchemaTitle = isEcosystemData?.isEcosystemMember
	// 	? { title: 'Schema Endorsement', toolTip: 'Add new schema request', svg: <SchemaEndorsement /> }
	// 	: { title: 'Create', svg: <Create />, toolTip: 'Create new schema' };
	// const emptyListTitle = 'No Schemas';
	// const emptyListDesc = 'Get started by creating a new Schema';
	// const emptyListBtn = isEcosystemData?.isEcosystemMember
	// 	? { title: 'Schema Endorsement', svg: <SchemaEndorsement /> }
	// 	: { title: 'Create Schema', svg: <Create /> };
	// function selectConnection(connections: IConnectionList[]): void {
	// 	throw new Error('Function not implemented.');
	// }

	return (
		<div className="px-4 pt-2">



			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div>
				<div>
					<div className="mb-4 flex justify-between flex-wrap gap-4 items-center">
						<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white mr-auto">
							Verification
						</h1>
						{/* <SearchInput onInputChange={onSearch} value={searchValue}/> */}

						{/* <select
							onChange={handleFilter}
							id="schamfilter"
							className="min-h-[42px] h-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
						>
							<option selected>Organization's schema</option>
							{options.map((opt) => (
								<option key={opt} className="" value={opt}>
									{opt}
								</option>
							))}
						</select> */}

						{/* <div className="flex space-x-2">
							{walletStatus ? (
								<RoleViewButton
								title={createSchemaTitle.toolTip}
									buttonTitle={createSchemaTitle.title}
									feature={Features.CRETAE_SCHEMA}
									svgComponent={createSchemaTitle.svg}
									onClickEvent={() => {
										window.location.href = `${pathRoutes.organizations.createSchema}`;
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
						</div> */}
					</div>
				</div>
				{schemaListErr && (
					<Alert color="failure" onDismiss={() => setSchemaListErr(null)}>
						<span>
							<p>{schemaListErr}</p>
						</span>
					</Alert>
				)}
				<div id="accordion-collapse" data-accordion="collapse">
					<h2 id="accordion-collapse-heading-1">
						<button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1">
							<span>schema</span>
							<svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
							</svg>
						</button>
					</h2>
					<div id="accordion-collapse-body-1" className="hidden" aria-labelledby="accordion-collapse-heading-1">
						<SchemaSelectionAccordion selectConnection={(value) => console.log("Schema selected data:::", value)} />
						
					</div>
				</div>

				

				<div id="accordion-collapse" data-accordion="collapse">
					<h2 id="accordion-collapse-heading-2">
						<button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#accordion-collapse-body-2" aria-expanded="true" aria-controls="accordion-collapse-body-2">
							<span>Connections</span>
							<svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
							</svg>
						</button>
					</h2>
					<div id="accordion-collapse-body-2" className="hidden" aria-labelledby="accordion-collapse-heading-2">
						<ConnectionList selectConnection={(value) => console.log("Schema selected data:::", value)} />
						
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProofVerificationRequest;
