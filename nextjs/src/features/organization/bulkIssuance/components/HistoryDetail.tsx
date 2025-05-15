'use client'
import { getFilesDataHistory } from '@/app/api/BulkIssuance';
import { IConnectionListAPIParameter } from '@/app/api/connection';
import { AlertComponent } from '@/components/AlertComponent';
import { Button } from '@/components/ui/button';
import { apiStatusCodes } from '@/config/CommonConstant';
import { BulkIssuanceStatus } from '@/features/common/enum';
import { ITableData } from '@/features/connections/types/connections-interface';
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';
import { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import SortDataTable from '../../connectionIssuance/components/connectionsTables/SortDataTable';
import { pathRoutes } from '@/config/pathRoutes';
import { ArrowLeft } from 'lucide-react';

interface IProps {
	requestId: string;
}

const HistoryDetails = ({ requestId }: IProps) => {
	const initialPageState = {
		itemPerPage: 10,
		page: 1,
		search: '',
		sortBy: 'createDateTime',
		sortingOrder: 'desc',
	};

	const [listAPIParameter, setListAPIParameter] = useState(initialPageState);
	const [historyList, setHistoryList] = useState<ITableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [totalItem, setTotalItem] = useState(0);
	const [pageInfo, setPageInfo] = useState({
		totalItem: 0,
		nextPage: 0,
		lastPage: 0,
	});
	const orgId = useAppSelector((state: RootState) => state.organization.orgId)
	const router = useRouter()


	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (listAPIParameter.search.length >= 1) {
			getData = setTimeout(() => {
				getHistoryDetails(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getHistoryDetails(listAPIParameter);
		}

		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	const getHistoryDetails = async (apiParameter: IConnectionListAPIParameter) => {
		setLoading(true);
		const response = await getFilesDataHistory(requestId, apiParameter.itemPerPage, apiParameter.page, apiParameter.search, apiParameter.sortBy, apiParameter.sortingOrder, orgId);

		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setTotalItem(data?.data.totalItems);
			const { totalItems, nextPage, lastPage } = data.data;

			setPageInfo({
				totalItem: Number(totalItems),
				nextPage: Number(nextPage),
				lastPage: Number(lastPage),
			});
			const historyData = data?.data?.data?.map(
				(history: {
					isError: any;
					referenceId: string;
					status: string;
					email: string;
					error: string;
				}) => {
					return {
						data: [
							{
								data: history?.referenceId
									? history?.referenceId
									: 'Not available',
							},
							{
								data: (
									<p
										className={`${history?.isError === false
												? 'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
												: 'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
											}	text-md font-medium sm:mr-0 md:mr-2 px-2 min-[320]:px-3 sm:px-3 lg:px-3 py-0.5 rounded-md flex justify-center w-fit`}
									>
										{history?.isError === false
											? BulkIssuanceStatus.successful
											: BulkIssuanceStatus.failed}
									</p>
								),
							},
							{
								data: history?.error
									? history?.error === 'Http Exception'
										? 'Credential Issuance failed due to error in Wallet Agent'
										: history?.error?.replace(/[[\]"{},]/g, ' ')
									: '-',
							},
						],
					};
				},
			);
			setHistoryList(historyData);
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

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
		getHistoryDetails(listAPIParameter);
	};
	const header = [
		{ columnName: 'User' },
		{ columnName: 'Status' },
		{ columnName: 'Description' },
	];

	return (
		<div className="p-4" id="connection_list">
			<div className="flex justify-end items-center">
				<Button onClick={() => router.push(pathRoutes.organizations.Issuance.history)} ><ArrowLeft />Back</Button>

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
				header={header}
				data={historyList}
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
				isHeader={true}
				isSearch={true}
				isRefresh={true}
				isSort={true}
				message={'No History'}
				discription={"You don't have any activities yet"}
			></SortDataTable>
		</div>
	);
};

export default HistoryDetails;