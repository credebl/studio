'use client';

import type { AxiosResponse } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import {
	IConnectionListAPIParameter,
	getConnectionsByOrg,
} from '../../api/connection';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrgDetails } from '../../config/ecosystem';
import { Pagination } from 'flowbite-react';
import SearchInput from '../SearchInput';
import type { IConnectionList } from '../../components/Issuance/interface'

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'DESC',
	allSearch: '',
};
const ConnectionList = () => {
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [totalItem, setTotalItem] = useState(0);

	const getConnections = async (apiParameter: IConnectionListAPIParameter) => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const orgData = await getOrgDetails();
		const checkWalletCreated = Boolean(orgData.orgDid);

		if (orgId && checkWalletCreated) {
			setLoading(true);
			try {
				const response = await getConnectionsByOrg(apiParameter);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setTotalItem(data?.data.totalItems);
					const connections = data?.data?.data?.map((ele: IConnectionList) => {
						const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';
						const connectionId = ele.connectionId
							? ele.connectionId
							: 'Not available';
						const createdOn = ele?.createDateTime
							? ele?.createDateTime
							: 'Not available';
						return {
							data: [
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
		} else {
			setConnectionList([]);
			setLoading(false);
		}
	};

	const header = [
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

	useEffect(() => {
		getConnections(listAPIParameter);
	}, [listAPIParameter]);

	return (
		<div className="p-4" id="connection_list">
			<BreadCrumbs />
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Connections
				</h1>
				<div>
					<SearchInput onInputChange={searchInputChange} />
				</div>
			</div>
			{error && (
				<AlertComponent
					message={error}
					type={'failure'}
					onAlertClose={() => {
						setError(null);
					}}
				/>
			)}
			{loading ? (
				<div className="flex items-center justify-center mt-36 mb-4">
					<CustomSpinner />
				</div>
			) : connectionList && connectionList?.length > 0 ? (
				<>
					<div
						id="issuance_datatable"
						className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
					>
						<DataTable
							header={header}
							data={connectionList}
							loading={loading}
						></DataTable>
					</div>

					{Math.ceil(totalItem / listAPIParameter?.itemPerPage) > 1 && (
						<div className="flex items-center justify-end my-4">
							<Pagination
								currentPage={listAPIParameter?.page}
								onPageChange={(page) => {
									setListAPIParameter((prevState) => ({
										...prevState,
										page: page,
									}));
								}}
								totalPages={Math.ceil(
									totalItem / listAPIParameter?.itemPerPage,
								)}
							/>
						</div>
					)}
				</>
			) : (
				<div className="bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<EmptyListMessage
						message={'No Connections'}
						description={"You don't have any connection"}
					/>
				</div>
			)}
		</div>
	);
};

export default ConnectionList;
