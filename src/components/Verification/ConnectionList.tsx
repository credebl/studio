
import type { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
	getConnectionsByOrg,
} from '../../api/connection';
import type { IConnectionListAPIParameter } from '../../api/connection';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import type { IConnectionList } from './interface';
import SortDataTable from '../../commonComponents/datatable/SortDataTable';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../../api/Auth';

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
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [tableData, setTableData] = useState<TableData[]>([]);
	const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([]);

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

	const renderCheckbox = (
		ele: IConnectionList,
		isChecked: boolean,
		connections: IConnectionList[],
	  ) => {
		return (
		  <div className="flex items-center" id="issuance_checkbox">
			<input
			  id="default-checkbox"
			  type="checkbox"
			  name="connection"
			  defaultChecked={ele.checked || isChecked}
			  onClick={async (event: React.MouseEvent<HTMLInputElement>) => {
				const inputElement = event.target as HTMLInputElement;
	  
				const updateConnectionList = connections.map((item) => {
				  if (item.connectionId === ele.connectionId) {
					selectOrganization(item, inputElement.checked);
					return {
					  ...item,
					  checked: inputElement.checked,
					};
				  }
				  return item;
				});
				setConnectionList(updateConnectionList);
			  }}
			  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
			/>
		  </div>
		);
	  };

	
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
							{ data: renderCheckbox(ele, isChecked, connections) },
							{ data: userName },
							{ data: connectionId },
							{
								data: (
									<DateTooltip date={createdOn} id="verification_connecetion_list">
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
	useEffect(() => {
		props.selectConnection(localOrgs);
	}, [localOrgs]);


	useEffect(() => {
		generateTable(connectionList);
	}, [connectionList, localOrgs]);

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
				getConnectionsVerification(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getConnectionsVerification(listAPIParameter);
		}
		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	useEffect(() => {
		updateLocalOrgs();
	}, []);

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
				
				setConnectionList(data?.data?.data);
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
			id="verification_connection_list"
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