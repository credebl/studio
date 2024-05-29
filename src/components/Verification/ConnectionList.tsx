
import type { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
	getConnectionsByOrg,
} from '../../api/connection';
import type { IConnectionListAPIParameter } from '../../api/connection';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import type { IConnectionList } from './interface';
import SortDataTable from '../../commonComponents/datatable/SortDataTable';

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
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [selectedConnectionList, setSelectedConnectionList] = useState<
		TableData[]
	>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [listAPIParameter, setListAPIParameter] =
		useState<IConnectionListAPIParameter>(initialPageState);
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
				getConnectionsVerification(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getConnectionsVerification(listAPIParameter);
		}
		return () => clearTimeout(getData);
	}, [listAPIParameter]);
	
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};

	const getConnectionsVerification = async (
		apiParameter: IConnectionListAPIParameter,
	) => {
		setLoading(true);
		try {
			const response = await getConnectionsByOrg(apiParameter);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setTotalItem(data?.data.totalItems);
				const { totalItems, nextPage, lastPage } = data.data;

				setPageInfo({
					totalItem: totalItems,
					nextPage: nextPage,
					lastPage: lastPage,
				});
				const connections = data?.data?.data?.map(
					(ele: IConnectionList) => {
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
										<div
											className="flex items-center"
											id="verification_checkbox"
										>
											<input
												id="default-checkbox"
												type="radio"
												name="connection"
												onClick={(
													event: React.MouseEvent<HTMLInputElement>,
												) => {
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
										<DateTooltip date={createdOn} id="connectionlist">
											{' '}
											{dateConversion(createdOn)}{' '}
										</DateTooltip>
									),
								},
							],
						};
					},
				);

				setConnectionList(connections);
				setError(null);
			} else {
				setConnectionList([]);
			}
		} catch {
			setConnectionList([]);
			setError(error as string);
		} finally {
			setLoading(false);
		}
	};

	const verification_header = [
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
					(connection) => connection?.data[1]?.data !== connectionId,
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
		getConnectionsVerification(listAPIParameter);
	};


	useEffect(() => {
		props.selectConnection(selectedConnectionList);
	}, [selectedConnectionList]);

	return (
		<div
			id="verification_connection_list
		"
		>
			<div
				className="flex items-center justify-between mb-4"
				id="verification-list"
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
			<SortDataTable
				onInputChange={searchInputChange}
				refresh={refreshPage}
				header={verification_header}
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
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={true}
				isPagination={true}
				message={'No Connections'}
				discription={"You don't have any connections yet"}
			></SortDataTable>
		</div>
	);
};

export default ConnectionList;
