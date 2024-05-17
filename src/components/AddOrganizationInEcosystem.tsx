'use client';

import type { AxiosResponse } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import type { TableData } from '../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { AlertComponent } from './AlertComponent';
import BreadCrumbs from './BreadCrumbs';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../api/Auth';
import SortDataTable from '../commonComponents/datatable/SortDataTable';
import { getOrganizations } from '../api/organization';
import CustomAvatar from '../components/Avatar';

import type { Organisation } from '../components/organization/interfaces';
import { Roles } from '../utils/enums/roles';
import { Button } from 'flowbite-react';
import { addOrganizationInEcosystem } from '../api/ecosystem';
import { pathRoutes } from '../config/pathRoutes';


const initialPageState = {
	page: 1,
	search: '',
	sortingOrder: 'desc',
	pageSize: 10,
	role: Roles.OWNER
};

interface IErrorOrg {
	id: string;
	error: string;
}

interface IErrorResponse {
	statusCode: number;
	message: string;
	data?: {
		orgId: string;
	}
	error?: string;
}

interface ICurrentPage {
	page: number;
	pageSize: number;
	search: string;
	role: string;
}

const AddOrganizationInEcosystem = () => {
	const [listAPIParameter, setListAPIParameter] = useState<ICurrentPage>(initialPageState);
	const [errorList, setErrorList] = useState<IErrorOrg[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [localOrgs, setLocalOrgs] = useState<string[]>([]);
	const [pageInfo, setPageInfo] = useState({
		totalItem: 0,
		nextPage: 0,
		lastPage: 0,
	});
	const [totalPages, setTotalPages] = useState<number>(0);
	const [loader, setLoader] = useState(false);
	const [organizationsList, setOrganizationsList] = useState<Array<Organisation> | null>(null);
	const [tableData, setTableData] = useState<TableData[]>([])

	const selectOrganization = async (item: Organisation, checked: boolean) => {
		try {
			const index = localOrgs?.length > 0 ? localOrgs.findIndex(ele => ele === item.id) : -1

			if (index === -1) {
				setLocalOrgs((prev: string[]) => [...prev, item.id])
			} else {
				const updateLocalOrgs = [...localOrgs]
				if (!checked) {
					updateLocalOrgs.splice(index, 1);
				}
				setLocalOrgs(updateLocalOrgs)
			}
		} catch (error) {
			throw new Error(`SELECTED ORGANIZATION:::${error}`);
		}
	}

	const generateTable = async (organizationsList: Organisation[] | null) => {
		const id = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
		const connections = organizationsList && organizationsList?.length > 0 && organizationsList?.map((ele: Organisation) => {
			const isChecked = localOrgs.includes(ele.id)
			const alreadyAdded = ele.ecosystemOrgs?.some(item => item.ecosystemId === id)
			const title = alreadyAdded ? "Already exists in the ecosystem" : ""
			const error = errorList.find(item => item.id === ele.id)?.error || ele.error;

			return {
				data: [
					{
						data: (
							<div title={title} className={`flex items-center ${alreadyAdded ? "opacity-50" : ""}`} id="issuance_checkbox">
								<input
									id={`default-checkbox-${ele.id}`}
									type="checkbox"
									name="organization"
									onClick={async (event: React.MouseEvent<HTMLInputElement>) => {
										const inputElement = event.target as HTMLInputElement;

										const updateOrgList: Organisation[] = organizationsList?.map(item => {
											if (item.id === ele.id) {
												selectOrganization(item, inputElement.checked)
												return {
													...item,
													checked: inputElement.checked
												}
											}
											return item
										})
										setOrganizationsList(updateOrgList)
									}}
									disabled={alreadyAdded}
									checked={(ele.checked || isChecked) && !alreadyAdded}
									className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-100 ${alreadyAdded ? "cursor-not-allowed" : "cursor-pointer"}`}
								/>
							</div>
						),
					},
					{
						data: (
							<div title={title} className={`flex gap-3 items-center ${alreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}>
								<div>
									{(ele?.logoUrl) ?
										<CustomAvatar
											className="rounded-full w-8 h-8"
											src={ele?.logoUrl}
										/> :
										<CustomAvatar
											className="rounded-full w-8 h-8"
											name={ele?.name || "NA"} />}
								</div>
								<div>
									{ele.name}
								</div>
							</div>
						)
					},
					{ data: (<div title={title} className={`${alreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}>{ele.id}</div>) },
					{
						data: (
							<div title={title} className={`${alreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}>
								{
									ele?.roles?.length > 0 && ele?.roles?.map(item => (
										<span
											key={`org-roles-${item}`}
											className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
										>
											{item}
										</span>
									))
								}
							</div>
						),
					},
					{
						data: (
							<div title={title} className={`text-red-500 ${alreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}>
								{
									<div>{error || "-"}</div>
								}
							</div>
						),
					}
				],
			};
		});
		setTableData(connections);
	}

	useEffect(() => {
		generateTable(organizationsList);
	}, [organizationsList, localOrgs])

	const getOwnerOrganizations = async (currentPage: ICurrentPage) => {
		setLoading(true);
		const response = await getOrganizations(
			currentPage.page,
			currentPage.pageSize,
			currentPage.search,
			currentPage.role
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			const orgList = data?.data?.organizations.map((userOrg: Organisation) => {
				const roles: string[] = userOrg.userOrgRoles.map(
					(role) => role.orgRole.name,
				);
				userOrg.roles = roles;
				return userOrg;
			});
			setPageInfo({
				...pageInfo,
				totalItem: data?.data?.totalCount,
				lastPage: data?.data?.totalPages,
				nextPage: listAPIParameter?.page + 1
			})
			setOrganizationsList(orgList);
			setTotalPages(totalPages);
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'Organization' },
		{ columnName: 'Id' },
		{ columnName: 'Role(s)' },
		{ columnName: 'Error' },
	];

	//onChange of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};

	const refreshPage = () => {
		getOwnerOrganizations(listAPIParameter);
	};

	const updateLocalOrgs = async () => {
		const res = await getFromLocalStorage(storageKeys.SELECT_ORG_IN_ECOSYSTEM)
		const selectedOrg = res ? JSON.parse(res) : []
		setLocalOrgs(selectedOrg);

		const err = await getFromLocalStorage(storageKeys.ERROR_ORG_IN_ECOSYSTEM)
		const errOrgs = err ? JSON.parse(err) : []
		setErrorList(errOrgs);
	}

	const handleAddOrganization = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID) || "";
		const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID) || "";
		setLoader(true)
		try {
			const response = await addOrganizationInEcosystem(localOrgs, ecosystemId, orgId);
			const { data } = response as AxiosResponse;
			setLoader(false)
			switch (data?.statusCode) {
				case apiStatusCodes.API_STATUS_CREATED:
					await removeFromLocalStorage(storageKeys.SELECT_ORG_IN_ECOSYSTEM)
					setSuccess(data.message)
					setTimeout(() => {
						window.location.href = pathRoutes.ecosystem.dashboard;
					}, 1000);
					break;
				case apiStatusCodes.API_STATUS_PARTIALLY_COMPLETED:
					await removeFromLocalStorage(storageKeys.SELECT_ORG_IN_ECOSYSTEM)
					const errors = data?.data?.filter((item: IErrorResponse) => item.statusCode !== apiStatusCodes.API_STATUS_CREATED)
					const errorData = errors.map((item: IErrorResponse) => ({ id: item?.data?.orgId || "", error: item.message }))
					await setToLocalStorage(storageKeys.ERROR_ORG_IN_ECOSYSTEM, JSON.stringify(errorData))
					setErrorList(errorData)
					const updateWithError = organizationsList && organizationsList?.length > 0 ? organizationsList?.map((item => ({
						...item,
						error: errors?.find((ele: IErrorResponse) => ele?.data?.orgId === item.id)?.message || ""
					}))) : []
					setSuccess(data?.message);
					setOrganizationsList(updateWithError)
					break;
				default:
					setError(response as string || data?.message)
					break;
			}
		} catch (error) {
			setError(error.message as string)
			setLoader(false)
		}
	}

	useEffect(() => {
		getOwnerOrganizations(listAPIParameter);
		updateLocalOrgs()
	}, [listAPIParameter]);

	useEffect(() => {
		updateLocalOrgs();
		(async () => {
			await removeFromLocalStorage(storageKeys.SELECT_ORG_IN_ECOSYSTEM);
			await removeFromLocalStorage(storageKeys.ERROR_ORG_IN_ECOSYSTEM);
		})()
	}, [])

	useEffect(() => {
		(async () => {
			await setToLocalStorage(storageKeys.SELECT_ORG_IN_ECOSYSTEM, JSON.stringify(localOrgs))
		})()
	}, [localOrgs])

	return (
		<div className="p-4" id="connection_list">
			<BreadCrumbs />
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1 mt-4 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Add Organizations
				</h1>
			</div>
			{(error || success) && (
				<AlertComponent
					message={error || success}
					type={error ? 'failure' : 'success'}
					onAlertClose={() => {
						setError(null);
						setSuccess(null);
					}}
				/>
			)}
			<SortDataTable
				onInputChange={searchInputChange}
				refresh={refreshPage}
				header={header}
				data={tableData}
				loading={loading}
				currentPage={listAPIParameter?.page}
				onPageChange={(page: number) => {
					setListAPIParameter((prevState) => ({
						...prevState,
						page,
					}));
				}}
				totalPages={totalPages}
				pageInfo={pageInfo}
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={false}
				message={'No Organizations'}
				discription={"You don't have any Organization to add"}
				itemPerPage={listAPIParameter.pageSize}
			></SortDataTable>
			<div className='flex w-full justify-end mt-8'>
				<Button
					onClick={() => handleAddOrganization()}
					isProcessing={loader}
					className={`hover:bg-primary-800 dark:hover:text-white dark:hover:bg-primary-700 hover:!bg-primary-800 text-base font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:focus:ring-primary-800`}
				>
					<svg
						className="pr-2"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							fill="#fff"
							d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
						/>
					</svg>
					Add Organization
				</Button>
			</div>
		</div>
	);
};

export default AddOrganizationInEcosystem;
