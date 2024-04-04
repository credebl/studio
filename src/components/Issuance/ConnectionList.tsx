'use client';

import type { AxiosResponse } from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
	IConnectionListAPIParameter,
	getConnectionsByOrg,
} from '../../api/connection';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import type { IConnectionList } from './interface';
import NewDataTable from '../../commonComponents/datatable/SortDataTable';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'desc',
	allSearch: '',
};
const ConnectionList = (props: {
	selectConnection: (connections: TableData[]) => void;
}) => {
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [selectedConnectionList, setSelectedConnectionList] = useState<
		TableData[]
	>([]);

	const [loading, setLoading] = useState<boolean>(false);
	const [totalItem, setTotalItem] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (listAPIParameter?.search?.length >= 1) {
			getData = setTimeout(() => {
				getConnections(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getConnections(listAPIParameter);
		}
		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	const getConnections = async (apiParameter: IConnectionListAPIParameter) => {
		setLoading(true);
		try {
			const response = await getConnectionsByOrg(apiParameter);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const { totalItems, nextPage, lastPage } = data.data;
				setTotalItem(data?.data.totalItems);

				setPageInfo({
					totalItem: totalItems,
					nextPage: nextPage,
					lastPage: lastPage,
				});
				const connections = data?.data?.data?.map((ele: IConnectionList) => {
					const createdOn = ele?.createDateTime
					? ele?.createDateTime
					: 'Not available';
					const connectionId = ele.connectionId
					? ele.connectionId
					: 'Not available';
					const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';
					return {
						data: [
							{
								data: (
									<div className="flex items-center" id="issuance_checkbox">
										<input
											id="default-checkbox"
											type="checkbox"
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
											className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
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
				setError(null);
			} else {
				setConnectionList([]);
			}
		} catch (error) {
			setConnectionList([]);
			setError(error as string);
		} finally {
			setLoading(false);
		}
	};

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'User' },
		{ columnName: 'Connection ID' },
		{ columnName: 'Created on' },
	];

	//onChange of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};

	const selectConnection = (
		user: string,
		connectionId: string,
		checked: boolean,
	) => {
		if (checked) {
			// Needed for multiple connection selection
			setSelectedConnectionList((prevList) => [...prevList, {
				data: [
					{
						data: user,
					}, {
						data: connectionId,
					}]
			}]
			)
		} else {
			setSelectedConnectionList((prevList) =>
				prevList.filter(
					(connection) => connection.data[1].data !== connectionId,
				),
			);
		}
	};

	const searchSortByValue = (value: any) => {
		setListAPIParameter({
			...listAPIParameter,
			page: 1,
			sortingOrder: value,
		});
	};

	const refreshPage = () => {
		setSelectedConnectionList([]);
		getConnections(listAPIParameter);
	};

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
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>
			<NewDataTable
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={true}
				onInputChange={searchInputChange}
				refresh={refreshPage}
				header={header}
				data={connectionList}
				loading={loading}
				currentPage={listAPIParameter?.page}
				onPageChange={(page: number) => {
					setListAPIParameter((prevState) => ({
						...prevState,
						page,
					}));
				}}
				totalPages={Math.ceil(totalItem / listAPIParameter?.itemPerPage)}
				pageInfo={pageInfo}
				searchSortByValue={searchSortByValue}
				message={'No Connections'}
				discription={"You don't have any connections yet"}
			></NewDataTable>
		</div>
	);
};

export default ConnectionList;
