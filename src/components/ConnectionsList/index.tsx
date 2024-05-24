
import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import type {ChangeEvent} from 'react';
import {
	getConnectionsByOrg,
} from '../../api/connection';
import type { IConnectionListAPIParameter } from '../../api/connection';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import BreadCrumbs from '../BreadCrumbs';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrgDetails } from '../../config/ecosystem';
import type { IConnectionList } from '../../components/Issuance/interface';
import SortDataTable from '../../commonComponents/datatable/SortDataTable';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'desc',
	allSearch: '',
};
const ConnectionList = () => {
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

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
					const { totalItems, nextPage, lastPage } = data.data;

					setPageInfo({
						totalItem: totalItems,
						nextPage: nextPage,
						lastPage: lastPage,
					});
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

	const searchSortByValue = (value: any) => {
		setListAPIParameter({
			...listAPIParameter,
			page: 1,
			sortingOrder: value,
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
			<SortDataTable
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
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={true}
				message={'No Connections'}
				discription={"You don't have any connections yet"}
			></SortDataTable>
		</div>
	);
};

export default ConnectionList;
