'use client';

import type { AxiosResponse } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import {
	IConnectionListAPIParameter,
	getConnectionsByOrg,
} from '../api/connection';
import type { TableData } from '../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { AlertComponent } from './AlertComponent';
import { dateConversion } from '../utils/DateConversion';
import DateTooltip from './Tooltip';
import BreadCrumbs from './BreadCrumbs';
import { getFromLocalStorage, setToLocalStorage } from '../api/Auth';
import { getOrgDetails } from '../config/ecosystem';
import type { IConnectionList } from './Issuance/interface';
import SortDataTable from '../commonComponents/datatable/SortDataTable';
import { getOrganizations } from '../api/organization';
import CustomAvatar from '../components/Avatar';

import type { Organisation } from '../components/organization/interfaces';


const initialPageState = {
	page: 1,
	search: '',
	sortBy: 'name',
	sortingOrder: 'desc',
	pageSize: 3,
	total: 100
};

const AddOrganizationInEcosystem = () => {
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [localOrgs, setLocalOrgs] = useState<string[]>([]);
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: 0,
		nextPage: 0,
		lastPage: 0,
	});
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			page,
		});
	};
	const [organizationsList, setOrganizationsList] = useState<Array<Organisation> | null>(null);
	const [tableData, setTableData] = useState<TableData[]>([])

	const [searchText, setSearchText] = useState('');

	const selectOrganization = async (item: Organisation, checked: boolean) => {
		try {
			const index = localOrgs?.length > 0 ? localOrgs.findIndex(ele => ele === item.id) : -1

			if (index === -1) {
				setLocalOrgs((prev: string[]) => [...prev, item.id])
			} else {
				const updateLocalOrgs = [...localOrgs]
				if(!checked){
					updateLocalOrgs.splice(index, 1);
				}
				setLocalOrgs(updateLocalOrgs)
			}
		} catch (error) {
			console.error("SELECTED ORGANIZATION:::", error)
		}
	}

	const generateTable = async (organizationsList: Organisation[] | null) => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const updateList = organizationsList && organizationsList.filter(item => item.id !== orgId);
		const connections = updateList && updateList?.map((ele: Organisation) => {
			const isChecked = localOrgs.includes(ele.id)

			return {
				data: [
					{
						data: (
							<div className="flex items-center" id="issuance_checkbox">
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
									checked={ele.checked || isChecked}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
								/>
							</div>
						),
					},
					{
						data: (
							<div className='flex gap-3 items-center'>
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
								<div>{ele.name}</div>
							</div>
						)
					},
					{ data: ele.id },
					{
						data: (
							<div>
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
				],
			};
		});
		setTableData(connections);
	}

	useEffect(() => {
		generateTable(organizationsList);
		// console.log(454545, organizationsList);

	}, [organizationsList, localOrgs])

	const getOwnerOrganizations = async (currentPage) => {
		setLoading(true);
		const response = await getOrganizations(
			currentPage.page,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			setTotalItem(data?.data?.totalCount)
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
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'Name' },
		{ columnName: 'Id' },
		{ columnName: 'Role(s)' },
	];

	//onChange of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};

	const searchSortByValue = (value: any) => {
		setListAPIParameter({
			...listAPIParameter,
			page: 1,
			sortingOrder: value,
		});
	};

	const refreshPage = () => {
		getOwnerOrganizations(listAPIParameter);
	};

	const updateLocalOrgs = async () => {
		const res = await localStorage.getItem("selected-orgs")
		const selectedOrg = res ? JSON.parse(res) : []
		setLocalOrgs(selectedOrg);
	}

	useEffect(() => {
		getOwnerOrganizations(listAPIParameter);
		updateLocalOrgs()
	}, [listAPIParameter]);

	useEffect(() => {
		updateLocalOrgs()
	}, [])

	useEffect(() => {
		(async () => {
			await localStorage.setItem("selected-orgs", JSON.stringify(localOrgs))
		})()
	}, [localOrgs])

	return (
		<div className="p-4" id="connection_list">
			<BreadCrumbs />
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Organizations
				</h1>
			</div>
			{error && (
				<AlertComponent
					message={error}
					type={'failure'}
					onAlertClose={() => {
						setError(null);
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
				totalPages={currentPage.total}
				pageInfo={pageInfo}
				searchSortByValue={searchSortByValue}
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={true}
				message={'No Organizations'}
				discription={"You don't have any Organization to add"}
				itemPerPage={listAPIParameter.pageSize}
			></SortDataTable>
		</div>
	);
};

export default AddOrganizationInEcosystem;
