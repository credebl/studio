
import { Alert, Button, Pagination } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { AxiosResponse } from 'axios';
import type { SchemaDetails } from './interface';
import { checkEcosystem, type ICheckEcosystem } from '../../config/ecosystem';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '../../api/Schema';
import { SchemaType } from '../../common/enums';
import { getOrganizationById } from '../../api/organization';
import { Create, SchemaEndorsement } from '../Issuance/Constant';
import BreadCrumbs from '../BreadCrumbs';
import SearchInput from '../SearchInput';
import RoleViewButton from '../RoleViewButton';
import { Features } from '../../utils/enums/features';
import { pathRoutes } from '../../config/pathRoutes';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import SchemaCard from '../../commonComponents/SchemaCard';

const VerificationSchemasList = (props: {
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
		sortingOrder: 'desc',
		allSearch: '',
	});
	const [walletStatus, setWalletStatus] = useState(false);
	const [totalItem, setTotalItem] = useState(0);
	const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();
	const [searchValue, setSearchValue] = useState('');
	const [selectedSchemas, setSelectedSchemas] = useState<any[]>([]); // State to hold selected schemas

	const getSchemaList = async (
		schemaListAPIParameter: any,
		flag: boolean,
	) => {
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgId(organizationId);
			setLoading(true);
			let schemaList;
			if (allSchemaFlag) {
				schemaList = await getAllSchemas(schemaListAPIParameter, SchemaType.INDY);
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
			schemaId: schemaId,
			attributes: attributes,
			issuerId: issuerId,
			createdDate: created,
		};

		const isSelected = selectedSchemas.some((schema) => schema.schemaId === schemaId);
console.log('isSelected567:::', isSelected)
		if (isSelected) {
			const updatedSchemas = selectedSchemas.filter((schema) => schema.schemaId !== schemaId);
			console.log('updatedSchemas777:::', updatedSchemas)
			setSelectedSchemas(updatedSchemas);
		} else {
			setSelectedSchemas([...selectedSchemas, schemaDetails]);
		}
	};

	const handleContinue = async () => {
		console.log('Selected Schemas:', selectedSchemas);
		const schemaIds = selectedSchemas?.map(schema => schema?.schemaId)
		console.log('schemaIds5678:::', schemaIds)
		await setToLocalStorage(storageKeys.SCHEMA_IDS, schemaIds)
		window.location.href = `${pathRoutes.organizations.verification.emailCredDef}`;
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
		(async () => {
			try {
				const data: ICheckEcosystem = await checkEcosystem();
				setIsEcosystemData(data);
			} catch (error) {
				console.log(error);
			}
		})();
		setSearchValue('');
	}, []);

	const createSchemaTitle = isEcosystemData?.isEcosystemMember
		? { title: 'Schema Endorsement', toolTip: 'Add new schema request', svg: <SchemaEndorsement /> }
		: { title: 'Create', svg: <Create />, toolTip: 'Create new schema' };
	const emptyListTitle = 'No Schemas';
	const emptyListDesc = 'Get started by creating a new Schema';
	const emptyListBtn = isEcosystemData?.isEcosystemMember
		? { title: 'Schema Endorsement', svg: <SchemaEndorsement /> }
		: { title: 'Create Schema', svg: <Create /> };
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
						<SearchInput onInputChange={onSearch} value={searchValue} />

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
											showCheckbox={true}
											isClickable={false}
											onClickCallback={schemaSelectionCallback}
										/>
									</div>
								))}
						</div>

						<div>
							<Button

								onClick={handleContinue}
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
						{loading ? (
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

export default VerificationSchemasList;
