import { useEffect, useState } from 'react';
import { getEcosystemMemberList } from '../../api/ecosystem';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { AlertComponent } from '../AlertComponent';
import { Pagination } from 'flowbite-react';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

const MemberList = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [memberList, setMemberList] = useState<TableData[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const getEcosystemMembers = async () => {
		setLoading(true);
		const response = await getEcosystemMemberList(
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
		);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			const sortedMemberList = data?.data?.members?.sort(
				(
					firstMember: { ecosystemRole: { name: number } },
					secondMember: { ecosystemRole: { name: number } },
				) =>
				firstMember?.ecosystemRole?.name > secondMember?.ecosystemRole?.name
						? 1
						: secondMember?.ecosystemRole?.name > firstMember?.ecosystemRole?.name
						? -1
						: 0,
			);
			const membersData = sortedMemberList?.map(
				(member: {
					ecosystemRole: { name: any };
					orgName: any;
					role: any;
					createDateTime: any;
					status: any;
				}) => {
					return {
						data: [
							{
								data: member.orgName ? member.orgName : 'Not avilable',
							},
							{
								data: member?.createDateTime ? (
									<DateTooltip date={member?.createDateTime}>
										{' '}
										{dateConversion(member?.createDateTime)}{' '}
									</DateTooltip>
								) : (
									'Not available'
								),
							},
							{
								data: member.ecosystemRole.name ? (
									<span
										className={`${
											member.ecosystemRole.name === 'Ecosystem Lead'
												? 'bg-primary-100 text-primary-800 rounded dark:bg-primary-900 dark:text-primary-300  border-primary-100 dark:border-primary-500'
												: 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400 rounded border border-green-100 dark:border-green-500'
										}'text-sm font-medium mr-2 px-2.5 py-1 rounded-md'`}
									>
										{member.ecosystemRole.name}
									</span>
								) : (
									'Not avilable'
								),
							},
							{
								data: member.status ? (
									<span
										className={`${
											member.status === 'SUSPENDED'
												? 'bg-red-100 text-red-800 rounded dark:bg-red-900 dark:text-red-300  border-red-100 dark:border-red-500'
												: 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400 rounded border border-green-100 dark:border-green-500'
										}'text-sm font-medium mr-2 px-2.5 py-1 rounded-md'`}
									>
										{member.status}
									</span>
								) : (
									'Not avilable'
								),
							},
							{
								data: (
									<svg
										className="ml-4 w-4 h-4 text-gray-800 cursor-pointer dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 4 15"
									>
										<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
									</svg>
								),
							},
						],
					};
				},
			);

			setMemberList(membersData);

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
		{ columnName: 'Org Name' },
		{ columnName: 'Member Since' },
		{ columnName: 'Role' },
		{ columnName: 'Status' },
		{ columnName: 'Action' },
	];

	return (
		<div
			id="ecosystem-datable"
			className="p-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
		>
			<div className="flex justify-between p-2">
				<h2 className="text-xl dark:text-white font-medium font-body">
					{' '}
					Ecosystem Members
				</h2>
				<a
					href={`/ecosystem/sent-invitations`}
					className="text-lg text-primary-700 dark:text-primary-600 hover:text-primary-800"
				>
					Sent Invitations
				</a>
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
				data={memberList}
				loading={loading}
			></DataTable>
			<div className="flex items-center justify-end mb-4">
				<Pagination
					currentPage={currentPage.pageNumber}
					onPageChange={onPageChange}
					totalPages={currentPage.total}
				/>
			</div>
		</div>
	);
};

export default MemberList;
