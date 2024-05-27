import 'react-toastify/dist/ReactToastify.css';
import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import BreadCrumbs from '../BreadCrumbs';
import BackButton from '../../commonComponents/backbutton';
import { pathRoutes } from '../../config/pathRoutes';
import { Button } from 'flowbite-react';
import { getFilesHistory, retryBulkIssuance } from '../../api/BulkIssuance';
import SOCKET from '../../config/SocketConfig';
import {
	BulkIssuanceHistory,
	BulkIssuanceHistoryData,
} from '../../common/enums';
import { ToastContainer, toast } from 'react-toastify';
import SortDataTable from '../../commonComponents/datatable/SortDataTable';
import type { IConnectionListAPIParameter } from '../../api/connection';

const HistoryBulkIssuance = () => {
	const initialPageState = {
		itemPerPage: 10,
		page: 1,
		search: '',
		sortBy: 'createDateTime',
		sortingOrder: 'desc',
	};
	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [failure, setFailure] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: '',
		nextPage: '',
		lastPage: '',
	});

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};
	const handleRetry = async (fileId: string) => {
		setSuccess('Issuance process reinitiated. Please wait a moment.');
		setLoading(true);
		const retryIssunace = await retryBulkIssuance(fileId, SOCKET.id);
		const { data } = retryIssunace as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			if (data?.data) {
				setLoading(false);
				getHistory(listAPIParameter);
			} else {
				setLoading(false);
			}
		} else {
			setLoading(false);
			setFailure(retryIssunace as string);
			setTimeout(() => {
				setFailure(null);
			}, 4000);
		}
	};

	const searchSortByValue = (value: any) => {
		setListAPIParameter({
			...listAPIParameter,
			page: 1,
			sortingOrder: value,
		});
	};

	useEffect(() => {
		SOCKET.emit('bulk-connection');
		SOCKET.on('bulk-issuance-process-retry-completed', () => {
			setSuccess(null);
			console.log(`bulk-issuance-process-retry-completed`);
			toast.success('Issuance process completed', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'colored',
			});
			getHistory(listAPIParameter);
		});

		SOCKET.on('error-in-bulk-issuance-retry-process', () => {
			setFailure(null);
			console.log(`error-in-bulk-issuance-retry-process-initiated`);
			toast.error('Issuance process failed. Please retry', {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'colored',
			});
			getHistory(listAPIParameter);
		});

		let getData: NodeJS.Timeout;

		if (listAPIParameter.search.length >= 1) {
			getData = setTimeout(() => {
				getHistory(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getHistory(listAPIParameter);
		}

		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	const getHistory = async (apiParameter: IConnectionListAPIParameter) => {
		setLoading(true);
		const response = await getFilesHistory(apiParameter);

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
				(ele: {
					totalRecords: number;
					successfulRecords: number;
					failedRecords: number;
					status: string;
					createDateTime: string;
					name: string;
					theirLabel: string;
					id: string;
					createdAt: string;
				}) => {
					const fileId = ele?.id;
					const userName = ele?.name ? ele.name : 'Not available';
					const totalRecords = ele.totalRecords ? ele.totalRecords : 0;
					const successfulRecords = ele.successfulRecords
						? ele.successfulRecords
						: 0;
					const failedRecords = ele.failedRecords ? ele.failedRecords : 0;
					const createdOn = ele?.createDateTime
						? ele?.createDateTime
						: 'Not available';

					const status = ele?.status ? ele?.status : 'Not available';

					return {
						data: [
							{ data: userName },
							{
								data: (
									<DateTooltip date={createdOn} id="issuance_connection_list">
										{' '}
										{dateConversion(createdOn)}{' '}
									</DateTooltip>
								),
							},
							{ data: totalRecords },
							{ data: successfulRecords },
							{ data: failedRecords },
							{
								data: (
									<p
										className={`${
											failedRecords > 0
												? 'bg-orange-100 text-orange-800 dark:bg-gray-700 dark:text-orange-400 border border-orange-100 dark:border-orange-400'
												: 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
										}text-sm font-medium mr-0.5 py-0.5 rounded-md flex justify-center items-center w-fit px-2`}
									>
										{failedRecords > 0
											? BulkIssuanceHistoryData.interrupted
											: BulkIssuanceHistoryData.completed}
									</p>
								),
							},
							{
								data: (
									<div className="flex">
										<Button
											disabled={status === BulkIssuanceHistory.started}
											onClick={() => {
												window.location.href = `${pathRoutes.organizations.Issuance.history}/${ele?.id}`;
											}}
											className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
											style={{ height: '2.5rem', minWidth: '4rem' }}
										>
											<p className="pr-1 flex text-center justify-center item-center">
												{' '}
												<svg
													className="pr-1 mt-0.5 flex items-center"
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="15"
													fill="none"
													viewBox="0 0 24 15"
												>
													{' '}
													<path
														fill="#fff"
														d="M23.385 7.042C23.175 6.755 18.165 0 11.767 0 5.37 0 .36 6.755.15 7.042a.777.777 0 0 0 0 .916C.36 8.245 5.37 15 11.767 15c6.398 0 11.408-6.755 11.618-7.042.2-.273.2-.643 0-.916Zm-11.618 6.406c-4.713 0-8.795-4.483-10.003-5.949 1.207-1.466 5.28-5.947 10.003-5.947 4.713 0 8.794 4.482 10.003 5.949-1.207 1.466-5.28 5.947-10.003 5.947Z"
													/>{' '}
													<path
														fill="#fff"
														d="M11.772 2.84a4.66 4.66 0 0 0-4.655 4.655 4.66 4.66 0 0 0 4.655 4.655 4.66 4.66 0 0 0 4.656-4.655 4.66 4.66 0 0 0-4.656-4.655Zm0 7.758A3.107 3.107 0 0 1 8.67 7.495a3.107 3.107 0 0 1 3.103-3.103 3.107 3.107 0 0 1 3.104 3.103 3.107 3.107 0 0 1-3.104 3.103Z"
													/>
												</svg>
												<span className="pl-1">View</span>{' '}
											</p>
										</Button>
										{failedRecords > 0 && (
											<Button
												onClick={() => handleRetry(fileId)}
												className="text-base ml-4 font-medium text-center hover:!bg-secondary-700 dark:bg-transparent hover:bg-secondary-700 bg-secondary-700 focus:ring-4 focus:ring-primary-300 ring-primary-700 bg-white-700 text-primary-600 rounded-md lg:px-3 py-2 lg:py-2.5 mr-2 border-blue-600 hover:text-primary-600 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-500 dark:hover:bg-secondary-700"
												style={{ height: '2.5rem', minWidth: '4rem' }}
											>
												<p className="pr-1 flex text-center justify-center item-center">
													{' '}
													<svg
														className="pr-1 mt-0.5 flex items-center"
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="15"
														fill="none"
														viewBox="0 0 24 20"
													>
														<path
															stroke="currentColor"
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"
														/>
													</svg>
													<span>Retry</span>{' '}
												</p>
											</Button>
										)}
									</div>
								),
							},
						],
					};
				},
			);
			setConnectionList(connections);
		} else {
			if (response?.toString()?.toLowerCase() !== 'history not found') {
				setFailure(response as string);
			}
		}
		setLoading(false);
	};

	const header = [
		{ columnName: 'File Name' },
		{ columnName: 'Uploaded Date' },
		{ columnName: 'Total Records' },
		{ columnName: 'Successful Records' },
		{ columnName: 'Failed Records' },
		{ columnName: 'Status' },
		{ columnName: 'Action' },
	];

	const refreshPage = () => {
		getHistory(listAPIParameter);
	};

	return (
		<div className="p-4" id="connection_list">
			<ToastContainer />
			<div className="flex justify-between items-center">
				<BreadCrumbs />

				<div className="flex items-center">
					<BackButton path={pathRoutes.organizations.Issuance.bulkIssuance} />
				</div>
			</div>
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1">
					<p className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						History
					</p>
					<p className="text-sm text-gray-400">Bulk Issuance History</p>
				</h1>
			</div>

			{(success || failure) && (
				<AlertComponent
					message={success ?? failure}
					type={success ? 'success' : 'failure'}
					onAlertClose={() => {
						setSuccess(null);
						setFailure(null);
					}}
				/>
			)}

			<SortDataTable
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
				searchSortByValue={searchSortByValue}
				totalPages={Math.ceil(totalItem / listAPIParameter?.itemPerPage)}
				pageInfo={pageInfo}
				message={'No History'}
				discription={"You don't have any activities yet"}
			></SortDataTable>
		</div>
	);
};

export default HistoryBulkIssuance;
