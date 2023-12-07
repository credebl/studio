'use client';

import type { AxiosResponse } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import { getConnectionsByOrg } from '../../api/connection';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import SearchInput from '../SearchInput';
import { Pagination } from 'flowbite-react';

const initialPageState = {
	pageNumber: 1,
	pageSize: 9,
	total: 100,
};

const ConnectionList = (props: {
	selectConnection: (connections: TableData[]) => void;
}) => {
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [selectedConnectionList, setSelectedConnectionList] = useState<
		TableData[]
	>([]);

	const [loading, setLoading] = useState<boolean>(false);
	
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};
	const [searchText, setSearchText] = useState('');

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};
	//This useEffect is called when the searchText changes
	useEffect(() => {
		getConnections();
	}, []);


	//Fetch the connection list against organization id
	const getConnections = async () => {
		setLoading(true);
		const response = await getConnectionsByOrg(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;
		let totalPages = data?.data.lastPage;
		
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const connections = data?.data?.data.map((ele) => {
				const userName = ele?.theirLabel
					? ele?.theirLabel
					: 'Not available';
				
				const connectionId = ele?.connectionId
					? ele?.connectionId
					: 'Not available';
				const createdOn = ele?.createDateTime
					? ele?.createDateTime
					: 'Not available';
				return {
					data: [
						{
							data: (
								<div className="flex items-center" id="issuance_checkbox">
									<input
										id="default-checkbox"
										type="radio"
										name="connection"
										onClick={(event: React.MouseEvent<HTMLInputElement>) => {
											const inputElement = event.target as HTMLInputElement;
											selectConnection(
												userName,
												connectionId,
												inputElement.checked,
											);
										}}
										value=""
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
									/>
								</div>
							),
						},
						{ data: userName },
						{ data: connectionId },
						{
							data: (
								<DateTooltip date={createdOn} id="issuance_connection_list">
									{' '}
									{dateConversion(createdOn)}{' '}
								</DateTooltip>
							),
						},
					],
				};
			});

			setConnectionList(connections);
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
		{ columnName: 'User' },
		{ columnName: 'Connection ID' },
		{ columnName: 'Created on' },
	];

	const selectConnection = (
		user: string,
		connectionId: string,
		checked: boolean,
	) => {
		if (checked) {
			// Needed for multiple connection selection
			// setSelectedConnectionList((prevList) => [...prevList, {
			// 	data: [
			// 		{
			// 			data: user,
			// 		}, {
			// 			data: connectionId,
			// 		}]
			// }]
			// )

			// It is for single connection selection
			setSelectedConnectionList([
				{
					data: [
						{
							data: user,
						},
						{
							data: connectionId,
						},
					],
				},
			]);
		} else {
			setSelectedConnectionList((prevList) =>
				prevList.filter(
					(connection) => connection.data[1].data !== connectionId,
				),
			);
		}
	};
	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getConnections();
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getConnections();
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);



	useEffect(() => {
		props.selectConnection(selectedConnectionList);
	}, [selectedConnectionList]);

	
	
	return (
		<div id="issuance_connection_list">
			<div
				className="flex items-center justify-between mb-4"
				id="issued-credentials-list"
			>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Connection List
				</h1>
				<SearchInput onInputChange={searchInputChange} />
			</div>

			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>

			<div
				id="issuance_datatable"
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
			>
				<DataTable
					header={header}
					data={connectionList}
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
			
		</div>
	);
};

export default ConnectionList;
