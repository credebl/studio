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
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

interface IMemberList {
	orgId: string;
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

const MemberList = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [memberList, setMemberList] = useState<IMemberList[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [searchText, setSearchText] = useState('');
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getEcosystemMembers();
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getEcosystemMembers();
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	const refreshPage = () => {
		getEcosystemMembers();
	};

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const getEcosystemMembers = async () => {
		const userOrgId = await getFromLocalStorage(storageKeys.ORG_ID);
		setLoading(true);
		const response = await getEcosystemMemberList(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
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
										{member?.orgId === userOrgId ? '(You)' : ''}
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
		getEcosystemMembers();
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
			<h2 className="pl-4 pt-2 text-xl dark:text-white font-medium font-body">
				Ecosystem Members
			</h2>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>
			<SortDataTable
				onInputChange={searchInputChange}
				refresh={refreshPage}
				header={header}
				data={memberList}
				loading={loading}
				currentPage={currentPage?.pageNumber}
				onPageChange={(page: number) => {
					setCurrentPage({
						...currentPage,
						pageNumber: page,
					});
				}}
				totalPages={totalItem}
				pageInfo={pageInfo}
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={false}
				message={'No Members'}
				discription={"The ecosystem doesn't have any matching member"}
				noExtraHeight={true}
			></SortDataTable>
		</div>
	);
};

export default MemberList;
