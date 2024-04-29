'use client';

import type { AxiosResponse } from 'axios';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
	IConnectionListAPIParameter,
	getConnectionsByOrg,
} from '../../../api/connection';
import type { TableData } from '../../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { AlertComponent } from '../../AlertComponent';
import { dateConversion } from '../../../utils/DateConversion';
import DateTooltip from '../../Tooltip';
import type { IConnectionList } from './interface';
import NewDataTable from '../../../commonComponents/datatable/SortDataTable';
import { getFromLocalStorage, setToLocalStorage } from '../../../api/Auth';
import { getAllSchemas } from '../../../api/Schema';
import type { GetAllSchemaListParameter } from '../../Resources/Schema/interfaces';
import type { IAttribute, IProofSchemaDetails } from '../interface';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'desc',
	allSearch: '',
};

interface LocalOrgs {
	schemaLedgerId: string;
	theirLabel: string;
	createDateTime: string;
}

const ConnectionList = (props: {
	selectConnection: (connections: IProofSchemaDetails[]) => void;
}) => {
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [tableData, setTableData] = useState<TableData[]>([]);
	const [connectionList, setConnectionList] = useState([])
	const [localOrgs, setLocalOrgs] = useState<LocalOrgs[]>([]);

	const [loading, setLoading] = useState<boolean>(false);
	const [totalItem, setTotalItem] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

	const selectOrganization = async (item: IConnectionList, checked: boolean) => {
		try {
			const index = localOrgs?.length > 0 ? localOrgs.findIndex(ele => ele.schemaLedgerId === item.schemaLedgerId) : -1

			const { schemaLedgerId, theirLabel, createDateTime } = item || {};
			if (index === -1) {
				setLocalOrgs((prev: LocalOrgs[]) => [...prev, {
					schemaLedgerId,
					theirLabel,
					createDateTime
				}])
			} else {
				const updateLocalOrgs = [...localOrgs]
				if (!checked) {
					updateLocalOrgs.splice(index, 1);
				}
				setLocalOrgs(updateLocalOrgs)
			}
		} catch (error) {
			console.error("SELECTED ORGANIZATION:::", error)
		}
	}

	const generateTable = async (connections: IProofSchemaDetails[]) => {
		try {
			const connectionsData = connections?.length > 0 && connections?.map((ele: IProofSchemaDetails) => {

				console.log(12313211, ele);

				const createdOn = ele?.createDateTime
					? ele?.createDateTime
					: 'Not available';
				const connectionId = ele.schemaLedgerId
					? ele.schemaLedgerId
					: 'Not available';
				const userName = ele?.name ? ele.name : 'Not available';

				const isChecked = localOrgs.map(item => item.schemaLedgerId).includes(ele.schemaLedgerId)

				return {
					data: [
						{
							data: (
								<div className="flex items-center" id="issuance_checkbox">
									<input
										id="default-checkbox"
										type="checkbox"
										name="connection"
										onClick={async (event: React.MouseEvent<HTMLInputElement>) => {
											const inputElement = event.target as HTMLInputElement;

											const updateConnectionList = connections?.map(item => {
												if (item.schemaLedgerId === ele.schemaLedgerId) {
													selectOrganization(item, inputElement.checked)
													return {
														...item,
														checked: inputElement.checked
													}
												}
												return item
											})
											console.log(87687, updateConnectionList);
											
											setConnectionList(updateConnectionList)
										}}
										checked={ele.checked || isChecked}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-lg dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
									/>
								</div>
							),
						},
						{ data: ele.name },
						{ data: ele.schemaLedgerId },
						{
							data: (
								<div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white flex-wrap p-1">
									{ele.attributes &&
										ele.attributes?.length > 0 ?
										ele.attributes.map(
											(element: IAttribute) => (
												<span
													key={`schema-details-${element.attributeName}`}
													className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
												>
													{' '}
													{element.attributeName}
												</span>
											),
										)
									: <div>-</div>
									}
								</div>
							)
						},
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

			setTableData(connectionsData)
		} catch (err) {

		}
	}

	const getConnections = async (apiParameter: GetAllSchemaListParameter) => {
		setLoading(true);
		try {
			const response = await getAllSchemas(apiParameter);
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
		{ columnName: 'Schema Name' },
		{ columnName: 'Schema ID' },
		{ columnName: 'Attributes' },
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

	const updateLocalOrgs = async () => {
		const res = await getFromLocalStorage(storageKeys.SELECTED_CONNECTIONS)
		const selectedOrg = res ? JSON.parse(res) : []
		setLocalOrgs(selectedOrg);
	}

	useEffect(() => {
		props.selectConnection(localOrgs);
	}, [localOrgs]);

	useEffect(() => {
		generateTable(connectionList);
	}, [connectionList, localOrgs])

	useEffect(() => {
		(async () => {
			await setToLocalStorage(storageKeys.SELECTED_CONNECTIONS, JSON.stringify(localOrgs))
		})()
	}, [localOrgs])

	useEffect(() => {
		let getData: NodeJS.Timeout;
		updateLocalOrgs()
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
		updateLocalOrgs()
	}, [])

	return (
		<div id="issuance_connection_list">
			<div
				className="flex items-center justify-between mb-4"
				id="issued-credentials-list"
			>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Schemas
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
