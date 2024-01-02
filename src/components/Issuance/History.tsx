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
import {
	BulkIssuanceHistory,
	BulkIssuanceHistoryData,
} from '../../common/enums';
import { ToastContainer, toast } from 'react-toastify';
import React from 'react';

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
		setSuccess('Issuance process reinitiated. Please wait a moment.');
		setLoading(true);
		const retryIssunace = await retryBulkIssuance(fileId, SOCKET.id);
		const { data } = retryIssunace as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			if (data?.data) {
				setLoading(false);
				getConnections();
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
			getConnections();
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
			getConnections();
		});

		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getConnections();
			}, 1000);
			return () => clearTimeout(getData);
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
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
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

	return (
		<div className="p-4" id="connection_list">
			<ToastContainer />
			<div className="flex justify-between items-center">
				<BreadCrumbs />

				<div className="flex items-center">
					<button onClick={() => getConnections()}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							className="mr-3"
						>
							<path
								d="M12 20C9.76667 20 7.875 19.225 6.325 17.675C4.775 16.125 4 14.2333 4 12C4 9.76667 4.775 7.875 6.325 6.325C7.875 4.775 9.76667 4 12 4C13.15 4 14.25 4.2375 15.3 4.7125C16.35 5.1875 17.25 5.86667 18 6.75V4H20V11H13V9H17.2C16.6667 8.06667 15.9375 7.33333 15.0125 6.8C14.0875 6.26667 13.0833 6 12 6C10.3333 6 8.91667 6.58333 7.75 7.75C6.58333 8.91667 6 10.3333 6 12C6 13.6667 6.58333 15.0833 7.75 16.25C8.91667 17.4167 10.3333 18 12 18C13.2833 18 14.4417 17.6333 15.475 16.9C16.5083 16.1667 17.2333 15.2 17.65 14H19.75C19.2833 15.7667 18.3333 17.2083 16.9 18.325C15.4667 19.4417 13.8333 20 12 20Z"
								fill="#1F4EAD"
							/>
						</svg>
					</button>

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
