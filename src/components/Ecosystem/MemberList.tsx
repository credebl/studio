import { ChangeEvent, useEffect, useState } from 'react';
import { getEcosystemMemberList } from '../../api/ecosystem';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import type { Data } from '../../commonComponents/datatable/interface';
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { AlertComponent } from '../AlertComponent';
import { getFromLocalStorage } from '../../api/Auth';
import CopyDid from '../../commonComponents/CopyDid';
import SortDataTable from '../../commonComponents/datatable/SortDataTable';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'ASC',
	allSearch: '',
};

interface IMemberList {
	orgId: string;
	ecosystemId: string;
	ecosystem: { createDateTime: string };
	ecosystemRole: { name: string };
	organisation: {
		name: string;
		orgSlug: string;
		org_agents: { orgDid: string }[];
	};
	role: string;
	createDateTime: any;
	status: string;
	copied?: boolean;
	data: Data[];
}
export interface IMemberListAPIParameter {
	itemPerPage: number;
	page: number;
	search: string;
	sortBy: string;
	sortingOrder: string;
	filter?: string;
}
const MemberList = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [memberList, setMemberList] = useState<IMemberList[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (listAPIParameter?.search?.length >= 1) {
			getData = setTimeout(() => {
				getEcosystemMembers(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getEcosystemMembers(listAPIParameter);
		}

		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	const refreshPage = () => {
		getEcosystemMembers(listAPIParameter);
	};

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

	const getEcosystemMembers = async (apiParameter: IMemberListAPIParameter) => {
		const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
		const parsedUserProfileData = JSON.parse(userProfile);
		const userId = parsedUserProfileData.id;
		
		setLoading(true);
		const response = await getEcosystemMemberList(apiParameter);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setTotalItem(data?.data.totalItems);
			const { totalItems, nextPage, lastPage } = data.data;

			setPageInfo({
				totalItem: totalItems,
				nextPage: nextPage,
				lastPage: lastPage,
			});
			const memberList =
				data?.data?.data?.length > 0 &&
				data?.data?.data?.map((member: IMemberList) => {
					let orgDid = 'Not available';
					if (member.organisation.org_agents.length > 0) {
						const orgAgent = member.organisation.org_agents[0];
						orgDid = orgAgent.orgDid;
					}
					return {
						data: [
							{
								data: member?.organisation.name || 'Not available',
							},
							{
								data:
									(
										<DateTooltip date={member?.createDateTime}>
											{dateConversion(member?.createDateTime)}{' '}
										</DateTooltip>
									) || 'Not available',
							},
							{
								data: orgDid ? (
									<div className="flex items-center">
										<CopyDid
											className="text-sm mr-2 py-1 font-courier pt-[0.55rem]"
											value={orgDid}
										/>
									</div>
								) : (
									<span className="text-sm mr-2 px-2.5 py-1 rounded-md">
										Not available
									</span>
								),
							},
							{
								data: member?.ecosystemRole?.name ? (
									<span className="text-sm px-2.5 py-1 rounded-md">
										<span
											className={`${
												member?.ecosystemRole?.name === 'Ecosystem Lead'
													? 'bg-primary-100 text-primary-800 dark:bg-gray-900 dark:text-primary-400 border border-primary-100 dark:border-primary-500'
													: 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
											} text-sm font-medium mr-1 px-2.5 py-1 rounded-md`}
										>
											{member?.ecosystemRole?.name}
										</span>
										{member.organisation.userOrgRoles.some((item) => item.userId === userId) ? '(You)' : ''}

									</span>
								) : (
									'Not available'
								),
							},
							{
								data: member.status ? (
									<span
										className={`${
											member.status === 'SUSPENDED'
												? 'bg-red-100 text-red-800 rounded dark:bg-gray-900 dark:text-red-300  border-red-100 dark:border-red-500 border'
												: 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400 rounded border border-green-100 dark:border-green-500'
										} text-sm font-medium mr-2 px-2.5 py-1 rounded-md`}
									>
										{member.status.charAt(0) +
											member.status.slice(1).toLowerCase()}
									</span>
								) : (
									'Not available'
								),
							},
						],
					};
				});

			setMemberList(memberList);
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	useEffect(() => {
		getEcosystemMembers(listAPIParameter);
	}, []);

	const header = [
		{ columnName: 'Organization' },
		{ columnName: 'Member Since' },
		{ columnName: 'Organization Did', width: 'w-1.5 pl-6' },
		{ columnName: 'Role', width: 'pl-7' },
		{ columnName: 'Status' },
	];

	return (
		<div
			id="ecosystem-datable"
			className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800"
		>
			<h2 className="pl-3 pt-2 text-xl dark:text-white font-semibold">
				Ecosystem Members
			</h2>
			<div className="px-3">
				<AlertComponent
					message={error}
					type={'failure'}
					onAlertClose={() => {
						setError(null);
					}}
				/>
			</div>
			<SortDataTable
				onInputChange={searchInputChange}
				refresh={refreshPage}
				header={header}
				data={memberList}
				loading={loading}
				currentPage={listAPIParameter.page}
				onPageChange={(page: number) => {
					setListAPIParameter((prevState) => ({
						...prevState,
						page,
					}));
				}}
				searchSortByValue={searchSortByValue}
				totalPages={totalItem}
				pageInfo={pageInfo}
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={true}
				isPagination={true}
				message={'No Members'}
				discription={"The ecosystem doesn't have any matching member"}
				noExtraHeight={true}
				sortOrder={listAPIParameter.sortingOrder}
			></SortDataTable>
		</div>
	);
};

export default MemberList;
