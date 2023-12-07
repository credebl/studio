import { ChangeEvent, useEffect, useState } from 'react';
import { getEcosystemMemberList } from '../../api/ecosystem';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { AlertComponent } from '../AlertComponent';
import { Pagination } from 'flowbite-react';
import { getFromLocalStorage } from '../../api/Auth';
import SearchInput from '../SearchInput';
import CopyDid from '../../commonComponents/CopyDid';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

interface IMemberList {
	orgId: string;
	ecosystem: { createDateTime: string };
	ecosystemRole: { name: string };
	organisation: { name: string; orgSlug: string; org_agents: {orgDid: string}[] };
	// orgName: string;
	// orgDid: string;
	role: string;
	createDateTime: any;
	status: string;
	copied?: boolean;
}


const MemberList = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [memberList, setMemberList] = useState<IMemberList[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [searchText, setSearchText] = useState('');
	const [memberTableData, setMemberTableData] = useState<TableData[]>([])

	useEffect(() => {
		generateTable(memberList)
	}, [memberList])

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const generateTable = async (memberList: IMemberList[]): Promise<void> => {

		const userOrgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const compareMembers = (
			firstMember: { ecosystemRole: { name: string } },
			secondMember: { ecosystemRole: { name: string } },
		) => {
			// remove this sorting logic when implemented from backend
			const firstName = firstMember?.ecosystemRole?.name;
			const secondName = secondMember?.ecosystemRole?.name;

			switch (true) {
				case firstName > secondName:
					return 1;
				case secondName > firstName:
					return -1;
				default:
					return 0;
			}
		};

		const sortedMemberList = memberList && memberList.length > 0 && memberList?.sort(compareMembers);
		const membersData = sortedMemberList && sortedMemberList.length > 0 && sortedMemberList?.map(
			(member: IMemberList) => {
				let orgDid ='Not available'
				if(member.organisation.org_agents.length > 0){
					const orgAgent = member.organisation.org_agents[0];
					orgDid = orgAgent.orgDid
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
							data: orgDid? (
								<div className='flex items-center'>
									<CopyDid className="text-sm mr-2 py-1 font-courier pt-[0.55rem]" value={orgDid} />
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
										className={`${member?.ecosystemRole?.name === 'Ecosystem Lead'
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
									className={`${member.status === 'SUSPENDED'
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
			},
		);

		if(membersData){	
			setMemberTableData(membersData);
		}
	}

	const getEcosystemMembers = async () => {
		setLoading(true);
		const response = await getEcosystemMemberList(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			setMemberList(data?.data?.members)
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
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
			className="p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div className="flex justify-between mb-4 gap-4">
				<h2 className="text-xl dark:text-white font-medium font-body">
					Ecosystem Members
				</h2>
				<div className="">
					<SearchInput onInputChange={searchInputChange} />
				</div>
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>
			<DataTable
				header={header}
				data={memberTableData}
				loading={loading}
			></DataTable>

			{currentPage.total > 1 && (
				<div className="flex items-center justify-end mb-4">
					<Pagination
						currentPage={currentPage.pageNumber}
						onPageChange={onPageChange}
						totalPages={currentPage.total}
					/>
				</div>
			)}
		</div>
	);
};

export default MemberList;
