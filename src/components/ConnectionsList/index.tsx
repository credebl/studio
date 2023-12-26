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

	const refreshPage = () => {
		getConnections(listAPIParameter);
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
				<h1 className="ml-1 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Connections
				</h1>
				<div className='flex gap-4 items-center'>
				<div>
					<SearchInput onInputChange={searchInputChange} />
				</div>
				<button
						className="focus:z-10 focus:ring-2 bg-white-700 hover:bg-secondary-700 rounded-lg"
						onClick={refreshPage}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="36"
							height="36"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 20C9.76667 20 7.875 19.225 6.325 17.675C4.775 16.125 4 14.2333 4 12C4 9.76667 4.775 7.875 6.325 6.325C7.875 4.775 9.76667 4 12 4C13.15 4 14.25 4.2375 15.3 4.7125C16.35 5.1875 17.25 5.86667 18 6.75V4H20V11H13V9H17.2C16.6667 8.06667 15.9375 7.33333 15.0125 6.8C14.0875 6.26667 13.0833 6 12 6C10.3333 6 8.91667 6.58333 7.75 7.75C6.58333 8.91667 6 10.3333 6 12C6 13.6667 6.58333 15.0833 7.75 16.25C8.91667 17.4167 10.3333 18 12 18C13.2833 18 14.4417 17.6333 15.475 16.9C16.5083 16.1667 17.2333 15.2 17.65 14H19.75C19.2833 15.7667 18.3333 17.2083 16.9 18.325C15.4667 19.4417 13.8333 20 12 20Z"
								fill="#1F4EAD"
							/>
						</svg>
					</button>
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
