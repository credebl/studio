
import type { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {getConnectionsByOrg,
} from '../../api/connection';
import type {IConnectionListAPIParameter} from '../../api/connection'
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import type { IConnectionList } from './interface';
import NewDataTable from '../../commonComponents/datatable/SortDataTable';
import {
	getFromLocalStorage,
	removeFromLocalStorage,
	setToLocalStorage,
} from '../../api/Auth';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'desc',
	allSearch: '',
};

type LocalOrgs = {
	connectionId: string;
	theirLabel: string;
	createDateTime: string;
};

const ConnectionList = (props: {
	selectConnection: (connections: IConnectionList[]) => void;
}) => {
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [tableData, setTableData] = useState<TableData[]>([]);
	const [connectionList, setConnectionList] = useState([]);
	const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([]);

	const [loading, setLoading] = useState<boolean>(false);
	const [totalItem, setTotalItem] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

	const selectOrganization = async (
		item: IConnectionList,
		checked: boolean,
	) => {
		try {
			const index =
				localOrgs?.length > 0
					? localOrgs.findIndex((ele) => ele.connectionId === item.connectionId)
					: -1;

			const { connectionId, theirLabel, createDateTime } = item || {};
			if (index === -1) {
				setLocalOrgs((prev: LocalOrgs[]) => [
					...prev,
					{
						connectionId,
						theirLabel,
						createDateTime,
					},
				]);
			} else {
				const updateLocalOrgs = [...localOrgs];
				if (!checked) {
					updateLocalOrgs.splice(index, 1);
				}
				setLocalOrgs(updateLocalOrgs);
			}
		} catch (error) {
			console.error('SELECTED ORGANIZATION:::', error);
		}
	};

	const generateTable = async (connections: IConnectionList[]) => {
		try {
			const connectionsData =
				connections?.length > 0 &&
				connections?.map((ele: IConnectionList) => {
					const createdOn = ele?.createDateTime
						? ele?.createDateTime
						: 'Not available';
					const connectionId = ele.connectionId
						? ele.connectionId
						: 'Not available';
					const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';

					const isChecked = localOrgs
						.map((item) => item.connectionId)
						.includes(ele.connectionId);

					return {
						data: [
							{
								data: (
									<div className="flex items-center" id="issuance_checkbox">
										<input
											id="default-checkbox"
											type="checkbox"
											name="connection"
											defaultChecked={ele.checked || isChecked}
											onClick={async (
												event: React.MouseEvent<HTMLInputElement>,
											) => {
												const inputElement = event.target as HTMLInputElement;

												const updateConnectionList = connections?.map(
													(item) => {
														if (item.connectionId === ele.connectionId) {
															selectOrganization(item, inputElement.checked);
															return {
																...item,
																checked: inputElement.checked,
															};
														}
														return item;
													},
												);
												setConnectionList(updateConnectionList);
											}}
											// checked={ele.checked || isChecked}
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

			setTableData(connectionsData);
		} catch (err) {}
	};

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
				setConnectionList(data?.data?.data);
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

	const searchSortByValue = (value: any) => {
		setListAPIParameter({
			...listAPIParameter,
			page: 1,
			sortingOrder: value,
		});
	};

	const refreshPage = () => {
		setLocalOrgs([]);
		getConnections(listAPIParameter);
	};

	const updateLocalOrgs = async () => {
		const res = await getFromLocalStorage(storageKeys.SELECTED_CONNECTIONS);
		const selectedOrg = res ? JSON.parse(res) : [];
		setLocalOrgs(selectedOrg);
	};

	useEffect(() => {
		const clearStorageAndRefresh = async () => {
			refreshPage();
			await removeFromLocalStorage(storageKeys.SELECTED_CONNECTIONS);
			await removeFromLocalStorage(storageKeys.SELECTED_USER);
		};

		clearStorageAndRefresh();
	}, []);

	useEffect(() => {
		props.selectConnection(localOrgs);
	}, [localOrgs]);

	useEffect(() => {
		generateTable(connectionList);
	}, [connectionList, localOrgs]);

	useEffect(() => {
		(async () => {
			await setToLocalStorage(
				storageKeys.SELECTED_CONNECTIONS,
				JSON.stringify(localOrgs),
			);
		})();
	}, [localOrgs]);

	useEffect(() => {
		let getData: NodeJS.Timeout;
		updateLocalOrgs();
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

	useEffect(() => {
		updateLocalOrgs();
	}, []);

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
				data={tableData}
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
