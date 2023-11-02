'use client';

import { useEffect, useState } from 'react';
import { getConnectionsByOrg } from '../../api/connection';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import { EmptyListMessage } from '../EmptyListComponent';
import { pathRoutes } from '../../config/pathRoutes';
import BackButton from '../../commonComponents/backbutton';
import SearchInput from '../SearchInput';

const HistoryDetails = () => {
	const [historyList, setHistoryList] = useState<TableData[]>([]);
	console.log('historyList', historyList);
	const [options, setOptions] = useState(['All', 'Successful', 'Failed']);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getConnections();
	}, []);

	const getConnections = async () => {
		setLoading(true);
		// const response = await getConnectionsByOrg();

		// const { data } = response as AxiosResponse;

		const data = {
			statusCode: 200,
			message: 'Proof presentation received successfully.',
			data: [
				{
					_tags: {
						connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
						state: 'abandoned',
						threadId: 'e31a778c-9e5a-4937-a7da-1cecdb6ac616',
					},
					metadata: {},
					id: 'b3de22d4-1d35-454e-aa06-2b2b547c181b',
					createdAt: '2023-10-19T08:11:50.223Z',
					protocolVersion: 'v1',
					state: 'Successful',
					connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
					threadId: 'e31a778c-9e5a-4937-a7da-1cecdb6ac616',
					autoAcceptProof: 'never',
					updatedAt: '2023-10-19T08:12:35.180Z',
					errorMessage: 'abandoned: Declined',
					email: 'user1@gmail.com',
					description: '-',
				},
				{
					_tags: {
						connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
						state: 'presentation-received',
						threadId: '859f4a1d-0011-4f61-93e7-587f148a4d43',
					},
					metadata: {},
					id: 'e16ec669-a892-412e-90ed-05f3c9734139',
					createdAt: '2023-10-19T08:13:59.807Z',
					protocolVersion: 'v1',
					state: 'Failed',
					connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
					threadId: '859f4a1d-0011-4f61-93e7-587f148a4d43',
					autoAcceptProof: 'never',
					updatedAt: '2023-10-19T08:14:17.694Z',
					isVerified: true,
					email: 'user2@gmail.com',
					description: 'Error',
				},
				{
					_tags: {
						connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
						state: 'presentation-received',
						threadId: '57419aa2-1b94-4e47-bdf2-628f9c07b128',
					},
					metadata: {},
					id: '623eeedc-4c7f-4d26-827f-8fe72921e0e1',
					createdAt: '2023-10-19T08:14:26.155Z',
					protocolVersion: 'v1',
					state: 'Successful',
					connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
					threadId: '57419aa2-1b94-4e47-bdf2-628f9c07b128',
					autoAcceptProof: 'never',
					updatedAt: '2023-10-19T08:14:41.712Z',
					isVerified: true,
					email: 'user2@gmail.com',
					status: 'Successful',
					description: '-',
				},
				{
					_tags: {
						connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
						state: 'abandoned',
						threadId: '0dac50c2-7be2-401a-9fbb-18de36b42730',
					},
					metadata: {},
					id: '7b3d9744-6c7f-4530-8b40-a44a332cc290',
					createdAt: '2023-10-19T08:13:05.254Z',
					protocolVersion: 'v1',
					state: 'Failed',
					connectionId: 'e01c18c9-7c0b-4b20-ba4e-a559e6e575f5',
					threadId: '0dac50c2-7be2-401a-9fbb-18de36b42730',
					autoAcceptProof: 'never',
					updatedAt: '2023-10-19T08:13:15.489Z',
					errorMessage: 'abandoned: Declined',
					email: 'user3@gmail.com',
					description: 'Information Not Provided',
				},
			],
		};

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const connections = data?.data?.map((requestProof) => {
				return {
					data: [
						{
							data: requestProof?.email ? requestProof?.email : 'Not available',
						},
						{
							data: (
								<span
									className={`${
										requestProof?.state === 'Successful' &&
										'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
									} ${
										requestProof?.state === 'Failed' &&
										'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
									}	text-xs font-medium sm:mr-0 md:mr-2 min-[320]:px-3 sm:px-3 lg:px-3 py-0.5 rounded-md flex justify-center min-[320]:w-full md:w-1/3`}
								>
									{requestProof?.state}
								</span>
							),
						},
						{
							data: requestProof?.description
								? requestProof?.description
								: 'Not available',
						},
					],
				};
			});
			setHistoryList(connections);
		} else {
			// setError(response as string);
		}
		setLoading(false);
	};

	const header = [
		{ columnName: 'User' },
		{ columnName: 'Status' },
		{ columnName: 'Description' },
	];

	return (
		<div className="p-4" id="connection_list">
			<div className="flex justify-between items-center">
				<BreadCrumbs />
				<BackButton path={pathRoutes.organizations.Issuance.history} />
			</div>
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1">
					<p className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						History Details
					</p>
					<p className="text-sm text-gray-400">Bulk Issuance History Details</p>
				</h1>
			</div>
			<div
				id="schemasSearchInput"
				className="mb-2 flex space-x-2 items-end justify-between"
			>
				<SearchInput onInputChange={undefined} />

				<select
					onChange={undefined}
					id="schamfilter"
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
				>
					{options.map((opt) => (
						<option key={opt} className="" value={opt}>
							{opt}
						</option>
					))}
				</select>
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
			) : historyList && historyList?.length > 0 ? (
				<div
					id="issuance_datatable"
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<DataTable
						header={header}
						data={historyList}
						loading={loading}
					></DataTable>
				</div>
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

export default HistoryDetails;
