'use client';
import 'react-toastify/dist/ReactToastify.css';
import type { AxiosResponse } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import BackButton from '../../commonComponents/backbutton';
import { pathRoutes } from '../../config/pathRoutes';
import SearchInput from '../SearchInput';
import { Button, Pagination } from 'flowbite-react';
import { getFilesHistory, retryBulkIssuance } from '../../api/BulkIssuance';
import SOCKET from '../../config/SocketConfig';
import { BulkIssuanceHistory, BulkIssuanceHistoryData } from '../../common/enums';
import { ToastContainer, toast } from 'react-toastify';

const HistoryBulkIssuance = () => {
	const initialPageState = {
		pageNumber: 1,
		pageSize: 9,
		total: 0,
	};

	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [failure, setFailure] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};
	const [searchText, setSearchText] = useState('');

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const handleRetry = async (fileId: string) => {
		setSuccess("Issuance process reinitiated. Please await a moment.")
		setLoading(true);
		const retryIssunace = await retryBulkIssuance(fileId, SOCKET.id);
		const { data } = retryIssunace as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			  setSuccess(null)
			if (data?.data) {
				setLoading(false);
				setSuccess(data?.message);
				setTimeout(() => {
					getConnections();
				}, 500);
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

useEffect(()=>{
	SOCKET.emit('bulk-connection', (res) => {
		console.log(6448, res)
				})
				SOCKET.on('bulk-issuance-process-completed', () => {
					console.log(`bulk-issuance-process-initiated`);
					toast.success('Bulk issuance process initiated.', {
						position: 'top-right',
						autoClose: 5000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: 'colored',
					});
				});
			
				SOCKET.on('error-in-bulk-issuance-process', () => {
					console.log(`error-in-bulk-issuance-process-initiated`);
					toast.error('Oops! Something went wrong.', {
						position: 'top-right',
						autoClose: 5000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: 'colored',
					});
				});
		
		
},[])


	useEffect(() => {

		SOCKET.emit('bulk-connection', (res) => {
			console.log(6448, res)
					})

					SOCKET.on('bulk-issuance-process-completed', () => {
						console.log(`bulk-issuance-process-initiated`);
						toast.success('Bulk issuance process initiated.', {
							position: 'top-right',
							autoClose: 5000,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
							theme: 'colored',
						});
					});


		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getConnections();
			}, 1000);
		} else {
			getConnections();
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	const getConnections = async () => {
		setLoading(true);
		const response = await getFilesHistory(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);

		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.lastPage;
			const connections = data?.data?.data?.map(
				(ele: {
					totalRecords: any;
					successfulRecords: any;
					failedRecords: any;
					status: any;
					createDateTime: any;
					name: any;
					theirLabel: string;
					id: string;
					createdAt: string;
				}) => {
					const fileId = ele?.id;
					const userName = ele?.name ? ele.name : 'Not available';
					const totalRecords = ele.totalRecords ? ele.totalRecords : '0';
					const successfulRecords = ele.successfulRecords
						? ele.successfulRecords
						: '0';
					const failedRecords = ele.failedRecords ? ele.failedRecords : '0';
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
											status === BulkIssuanceHistory.started
												? 'bg-primary-100 text-primary-800 dark:bg-gray-700 dark:text-primary-400 border border-primary-100 dark:border-primary-500'
												: status === BulkIssuanceHistory.completed
												? 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
												:status === BulkIssuanceHistory.interrupted ? 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500': 
												'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-500'
										} text-sm font-medium mr-0.5 px-0.5 py-0.5 rounded-md flex justify-center items-center max-w-[180px]`}
									>
										{status === BulkIssuanceHistory.started ? BulkIssuanceHistoryData.started : status === BulkIssuanceHistory.completed ? BulkIssuanceHistoryData.completed : status === BulkIssuanceHistory.interrupted ? BulkIssuanceHistoryData.interrupted : BulkIssuanceHistoryData.retry }
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
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setFailure(response as string);
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

	return (
		<div className="p-4" id="connection_list">
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="colored"
			/>
			<div className="flex justify-between items-center">
				<BreadCrumbs />
				<BackButton path={pathRoutes.organizations.Issuance.connections} />
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
				<div className="flex items-center justify-between mb-4">
					<SearchInput onInputChange={searchInputChange} />
				</div>
			</div>

			{(success || failure) && (
				<AlertComponent
					message={success ?? failure}
					type={success ? 'success' : 'failure'}
					onAlertClose={() => {
						setSuccess(null);
						setFailure(null);
						setError(null);
					}}
				/>
			)}

			{loading ? (
				<div className="flex items-center justify-center mt-36 mb-4">
					<CustomSpinner />
				</div>
			) : connectionList && connectionList?.length > 0 ? (
				<div
					id="issuance_datatable"
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<DataTable
						header={header}
						data={connectionList}
						loading={loading}
					></DataTable>

					{currentPage.total > 1 && (
						<div className="flex items-center justify-end mb-4">
							<Pagination
								currentPage={currentPage.pageNumber}
								onPageChange={onPageChange}
								totalPages={currentPage.total}
							/>
						</div>
					)}
				</div>
			) : (
				<div className="bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<EmptyListMessage
						message={'No History Found'}
						description={"You don't have any history"}
					/>
				</div>
			)}
		</div>
	);
};

export default HistoryBulkIssuance;
