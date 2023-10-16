import { useEffect, useState } from 'react';
import { getEcosystemMemberList } from '../../api/ecosystem';
import { apiStatusCodes } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { AlertComponent } from '../AlertComponent';
import { Button, Pagination } from 'flowbite-react';
import { pathRoutes } from '../../config/pathRoutes';

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

			const compareMembers = (
				firstMember: { ecosystemRole: { name: string } },
				secondMember: { ecosystemRole: { name: string } },
			) => {
				const firstName = firstMember?.ecosystemRole?.name;
				const secondName = secondMember?.ecosystemRole?.name;

				if (firstName > secondName) {
					return 1;
				} else if (secondName > firstName) {
					return -1;
				} else {
					return 0;
				}
			};
			const sortedMemberList = data?.data?.members?.sort(compareMembers);
			const membersData = sortedMemberList?.map(
				(member: {
					ecosystemRole: { name: string };
					orgName: string;
					role: string;
					createDateTime: any;
					status: string;
				}) => {
					return {
						data: [
							{
								data: member.orgName || 'Not available',
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
								data: member.ecosystemRole.name ? (
									<span
										className={`${
											member.ecosystemRole.name === 'Ecosystem Lead'
												? 'bg-primary-100 text-primary-800 dark:bg-gray-900 dark:text-primary-400 border border-primary-100 dark:border-primary-500'
												: 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
										} text-sm font-medium mr-2 px-2.5 py-1 rounded-md`}
									>
										{member.ecosystemRole.name}
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
										{member.status}
									</span>
								) : (
									'Not available'
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
		{ columnName: 'Organization' },
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
			<div className="flex justify-between p-2 mb-4">
				<h2 className="text-xl dark:text-white font-medium font-body">
					Ecosystem Members
				</h2>

				<Button
					type="submit"
					color="bg-primary-800"
					onClick={() => {
						window.location.href = `${pathRoutes.ecosystem.sentinvitation}`;
					}}
					className="bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 
						ring-2 text-black font-medium rounded-lg text-sm
						 ml-auto dark:text-white dark:hover:text-black 
						dark:hover:bg-primary-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="27"
						height="16"
						viewBox="0 0 27 16"
						fill="none"
					>
						<path
							d="M8.8125 3.29502H4.125M8.8125 7.99999H1M8.8125 12.705H4.125M15.0352 1.12145L26 7.99999L15.0352 14.8785C14.4544 15.243 13.7206 14.7341 13.855 14.0598L15.0625 7.99999L13.855 1.94019C13.7206 1.266 14.4544 0.757051 15.0352 1.12145Z"
							stroke="#1F4EAD"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span className="hidden sm:block ml-2">Sent Invitations</span>
				</Button>
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
