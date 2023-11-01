'use client';

import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { getConnectionsByOrg } from '../../api/connection';
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
import { Button } from 'flowbite-react';

const History = () => {
	const [connectionList, setConnectionList] = useState<TableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getConnections();
	}, []);

	const getConnections = async () => {
		setLoading(true);
		const response = await getConnectionsByOrg();

		// const { data } = response as AxiosResponse;
		// console.log("data11",data);
		const data = {
			statusCode: 200,
			message: 'Connection fetched successfully',
			data: [
				{
					_tags: {
						did: 'did:peer:1zQmQnwgpcbQTqgrr2ieTL6Fn9ZQRboUt57aXmFKiiYJAM4y',
						outOfBandId: 'f0919eb2-03d4-41da-85ac-0195aac497c0',
						role: 'responder',
						state: 'completed',
						theirDid:
							'did:peer:1zQmbCEkLbcjUNVHTijvWnpafMwuwCsrktEWVPMf9oA4KW7Y',
						threadId: 'e08e244e-d247-4e44-9588-c0423435fe20',
					},
					metadata: {},
					connectionTypes: [],
					id: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
					createdAt: '2023-10-19T08:10:31.687Z',
					did: 'did:peer:1zQmQnwgpcbQTqgrr2ieTL6Fn9ZQRboUt57aXmFKiiYJAM4y',
					theirDid: 'did:peer:1zQmbCEkLbcjUNVHTijvWnpafMwuwCsrktEWVPMf9oA4KW7Y',
					theirLabel: 'ADEYA SSI',
					state: 'completed',
					role: 'responder',
					autoAcceptConnection: true,
					threadId: 'e08e244e-d247-4e44-9588-c0423435fe20',
					protocol: 'https://didcomm.org/connections/1.0',
					outOfBandId: 'f0919eb2-03d4-41da-85ac-0195aac497c0',
					updatedAt: '2023-10-19T08:10:33.582Z',
					totalRecords: '1000',
					successfulRecords: '945',
					failedRecords: '55',
				},
			],
		};

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const connections = data?.data?.map(
				(ele: { theirLabel: string; id: string; createdAt: string }) => {
					const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';
					const totalRecords = ele.totalRecords
						? ele.totalRecords
						: 'Not available';
					const successfulRecords = ele.successfulRecords
						? ele.successfulRecords
						: 'Not available';
					const failedRecords = ele.failedRecords
						? ele.failedRecords
						: 'Not available';
					const createdOn = ele?.createdAt ? ele?.createdAt : 'Not available';
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
									<Button
										onClick={() => {
											window.location.href =
												pathRoutes.organizations.Issuance.details;
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
								),
							},
						],
					};
				},
			);
			setConnectionList(connections);
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	const header = [
		{ columnName: 'File Name' },
		{ columnName: 'Uploaded Date' },
		{ columnName: 'Total Records' },
		{ columnName: 'Successful Records' },
		{ columnName: 'Failed Records' },
		{ columnName: 'Action' },
	];

	return (
		<div className="p-4" id="connection_list">
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
				<SearchInput />
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>

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

export default History;
