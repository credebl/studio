'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import { pathRoutes } from '../../config/pathRoutes';
import BackButton from '../../commonComponents/backbutton';
import SearchInput from '../SearchInput';
import { getFilesDataHistory } from '../../api/BulkIssuance';
import type { AxiosResponse } from 'axios';
import { Pagination } from 'flowbite-react';
import { BulkIssuanceStatus } from '../../common/enums';

interface IProps {
	requestId: string;
}

const HistoryDetails = ({ requestId }: IProps) => {
	const initialPageState = {
		pageNumber: 1,
		pageSize: 10,
		total: 0,
	};
	const [historyList, setHistoryList] = useState<TableData[]>([]);
	const [options, setOptions] = useState(['All', 'Successful', 'Failed']);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [searchText, setSearchText] = useState('');
	const [sortBy, setSortBy] = useState('All');

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};
	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getHistoryDetails();
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getHistoryDetails();
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (sortBy !== 'All') {
			getData = setTimeout(() => {
				getHistoryDetails();
			}, 1000);
		} else {
			getHistoryDetails();
		}

		return () => clearTimeout(getData);
	}, [sortBy]);

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const handleFilter = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSortBy(e.target.value);
	};

	const getHistoryDetails = async () => {
		setLoading(true);
		const response = await getFilesDataHistory(
			requestId,
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
			sortBy,
		);

		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.lastPage;

			const historyData = data?.data?.data?.map(
				(history: {
					isError: any;
					referenceId: string;
					status: string;
					email: string;
					error: string;
				}) => {
					return {
						data: [
							{
								data: history?.referenceId
									? history?.referenceId
									: 'Not available',
							},
							{
								data: (
									<p
										className={`${
											history?.isError === false
												? 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
												: 'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
										}	text-md font-medium sm:mr-0 md:mr-2 px-2 min-[320]:px-3 sm:px-3 lg:px-3 py-0.5 rounded-md flex justify-center w-fit`}
									>
										{history?.isError === false ? BulkIssuanceStatus.successful : BulkIssuanceStatus.failed}
									</p>
								),
							},
							{
								data: history?.error
									? history?.error === 'Http Exception' ? 'Credential Issuance failed due to error in Wallet Agent' : history?.error?.replace(/[[\]"{},]/g, ' ')
									: '-',
							},
						],
					};
				},
			);
			setHistoryList(historyData);
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
		{ columnName: 'User' },
		{ columnName: 'Status' },
		{ columnName: 'Description' },
	];

	return (
		<div className="p-4" id="connection_list">
			<div className="flex justify-between items-center">
				<BreadCrumbs />
				<BackButton path={pathRoutes.organizations.Issuance.history} />
			</div>
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1">
					<p className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						History Details
					</p>
					<p className="text-sm text-gray-400">Bulk Issuance History Details</p>
				</h1>
			</div>
			<div
				id="schemasSearchInput"
				className="mb-2 flex space-x-2 items-end justify-between"
			>
				<SearchInput onInputChange={searchInputChange} />

				<select
					onChange={handleFilter}
					id="schamfilter"
					className="bg-gray-50 h-select-input border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
				>
					{options.map((opt) => (
						<option key={opt} className="" value={opt}>
							{opt}
						</option>
					))}
				</select>
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>

			{loading ? (
				<div className="flex items-center justify-center mt-36 mb-4">
					<CustomSpinner />
				</div>
			) : historyList && historyList?.length > 0 ? (
				<div
					id="issuance_datatable"
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<DataTable
						header={header}
						data={historyList}
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
			) : (
				<div className="bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<EmptyListMessage
						message={'No Records Found'}
						description={"You don't have any data"}
					/>
				</div>
			)}
		</div>
	);
};

export default HistoryDetails;
