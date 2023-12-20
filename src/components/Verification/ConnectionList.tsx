'use client';

import type { AxiosResponse } from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
	IConnectionListAPIParameter,
	getConnectionsByOrg,
} from '../../api/connection';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import SearchInput from '../SearchInput';
import { Pagination } from 'flowbite-react';
import type { IConnectionList } from './interface';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'DESC',
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

	useEffect(() => {
		getConnectionsVerification(listAPIParameter);
	}, [listAPIParameter]);

	//onChange of Search input text
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
												className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
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
				<div>
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
			<div
				id="verification_datatable"
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
			>
				<DataTable
					header={verification_header}
					data={connectionList}
					loading={loading}
				></DataTable>
			</div>
			{Math.ceil(totalItem / listAPIParameter?.itemPerPage) > 1 && (
				<div className="flex items-center justify-end my-4">
					<Pagination
						currentPage={listAPIParameter?.page}
						onPageChange={(page: number) => {
							setListAPIParameter((prevState) => ({
								...prevState,
								page,
							}));
						}}
						totalPages={Math.ceil(totalItem / listAPIParameter?.itemPerPage)}
					/>
				</div>
			)}
		</div>
	);
};

export default ConnectionList;
