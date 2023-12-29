'use client';

import { Alert, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { GetAllSchemaListParameter } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '../../../api/Schema';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import CustomSpinner from '../../CustomSpinner';
import { EmptyListMessage } from '../../EmptyListComponent';
import { Features } from '../../../utils/enums/features';
import RoleViewButton from '../../RoleViewButton';
import SchemaCard from '../../../commonComponents/SchemaCard';
import type { SchemaDetails } from '../../Verification/interface';
import SearchInput from '../../SearchInput';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { getOrganizationById } from '../../../api/organization';
import { ICheckEcosystem, checkEcosystem } from '../../../config/ecosystem';

const SchemaList = (props: {
	schemaSelectionCallback: (
		schemaId: string,
		schemaDetails: SchemaDetails,
	) => void;
}) => {
	const [schemaList, setSchemaList] = useState([]);
	const [schemaListErr, setSchemaListErr] = useState<string | null>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false);
	const [orgId, setOrgId] = useState<string>('');
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: 9,
		page: 1,
		search: '',
		sortBy: 'id',
		sortingOrder: 'DESC',
		allSearch: '',
	});
	const [walletStatus, setWalletStatus] = useState(false);
	const [totalItem, setTotalItem] = useState(0);
	const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();

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
				schemaList = await getAllSchemas(schemaListAPIParameter);
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
		getSchemaList(
			{
				...schemaListAPIParameter,
				search: event.target.value,
			},
			false,
		);

		if (allSchemaFlag) {
			getSchemaList(
				{
					...schemaListAPIParameter,
					allSearch: event.target.value,
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

	const options = ['All schemas'];

	const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
		console.log('Handle filter', e.target.value);
		if (e.target.value === 'All schemas') {
			setAllSchemaFlag(true);
		} else {
			setAllSchemaFlag(false);
			getSchemaList(schemaListAPIParameter, false);
		}
	};

	const fetchOrganizationDetails = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizationById(orgId);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
				setWalletStatus(true);
			}
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchOrganizationDetails();
		const checkEcosystemData = async () => {
			const data: ICheckEcosystem = await checkEcosystem();
			setIsEcosystemData(data);
		};

		checkEcosystemData();
	}, []);

	const schemaEndorsement = (
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
	);

	const create = (
		<div className="pr-3">
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

	const createSchemaTitle = isEcosystemData?.isEcosystemMember
		? { title: 'Schema Endorsement', svg: schemaEndorsement }
		: { title: 'Create', svg: create };
	const emptyListTitle = 'No Schemas';
	const emptyListDesc = 'Get started by creating a new Schema';
	const emptyListBtn = isEcosystemData?.isEcosystemMember
		? { title: 'Schema Endorsement', svg: schemaEndorsement }
		: { title: 'Create Schema', svg: create };
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
						<SearchInput onInputChange={onSearch} />

						<select
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
						</select>

						<div className="flex space-x-2">
							{walletStatus ? (
								<RoleViewButton
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
											onClickCallback={schemaSelectionCallback}
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
