'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { IssueCredential, IssueCredentialUserText } from '../../common/enums';

import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import { Button, Pagination } from 'flowbite-react';
import CustomSpinner from '../CustomSpinner';
import DataTable from '../../commonComponents/datatable';
import DateTooltip from '../Tooltip';
import { EmptyListMessage } from '../EmptyListComponent';
import { Features } from '../../utils/enums/features';
import RoleViewButton from '../RoleViewButton';
import SearchInput from '../SearchInput';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { dateConversion } from '../../utils/DateConversion';
import { getIssuedCredentials } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrgDetails } from '../../config/ecosystem';
import type { IConnectionListAPIParameter } from '../../api/connection';
import type { IssuedCredential } from './interface';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'DESC',
	allSearch: '',
};

const CredentialList = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [issuedCredList, setIssuedCredList] = useState<TableData[]>([]);
	const [walletCreated, setWalletCreated] = useState(false);
	const [listAPIParameter, setListAPIParameter] =
		useState<IConnectionListAPIParameter>(initialPageState);
	const [totalItem, setTotalItem] = useState(0);

	const getIssuedCredDefs = async (
		listAPIParameter: IConnectionListAPIParameter,
	) => {
		setLoading(true);
		try {
			const orgData = await getOrgDetails();
			const isWalletCreated = Boolean(orgData.orgDid);
			setWalletCreated(isWalletCreated);
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

			if (orgId && isWalletCreated) {
				const response = await getIssuedCredentials(listAPIParameter);
				setLoading(false);
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setTotalItem(data?.data.totalItems);
					const credentialList = data?.data?.data?.map(
						(issuedCredential: IssuedCredential) => {
							const schemaName = issuedCredential.schemaId
								? issuedCredential.schemaId.split(':').slice(2).join(':')
								: 'Not available';

							return {
								data: [
									{
										data: issuedCredential.connectionId
											? issuedCredential.connectionId
											: 'Not available',
									},
									{ data: schemaName },
									{
										data: (
											<DateTooltip date={issuedCredential.createDateTime}>
												{' '}
												{dateConversion(issuedCredential.createDateTime)}{' '}
											</DateTooltip>
										),
									},
									{
										data: (
											<span
												className={` ${
													issuedCredential.state ===
														IssueCredential.offerSent &&
													'bg-orange-100 text-orange-800 border border-orange-100 dark:bg-gray-700 dark:border-orange-300 dark:text-orange-300'
												} ${
													issuedCredential?.state === IssueCredential.done &&
													'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
												} ${
													issuedCredential?.state ===
														IssueCredential.abandoned &&
													'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
												} ${
													issuedCredential?.state ===
														IssueCredential.requestReceived &&
													'bg-primary-100 text-primary-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300'
												} ${
													issuedCredential?.state ===
														IssueCredential.proposalReceived &&
													'bg-secondary-700 text-primary-600 border border-secondary-100 dark:border-secondary-700 dark:bg-gray-700 dark:text-secondary-800'
												} ${
													issuedCredential?.state ===
														IssueCredential.credentialIssued &&
													'bg-sky-300 text-primary-700 border border-sky-100 dark:border-sky-700 dark:bg-gray-700 dark:text-sky-500'
												} text-xs font-medium mr-0.5 px-0.5 py-0.5 rounded-md border flex justify-center rounded-md items-center w-fit px-2`}
											>
												{issuedCredential.state === IssueCredential.offerSent
													? IssueCredentialUserText.offerSent
													: issuedCredential.state === IssueCredential.done
													? IssueCredentialUserText.done
													: issuedCredential.state === IssueCredential.abandoned
													? IssueCredentialUserText.abandoned
													: issuedCredential.state ===
													  IssueCredential.requestReceived
													? IssueCredentialUserText.received
													: issuedCredential.state ===
													  IssueCredential.proposalReceived
													? IssueCredentialUserText.proposalReceived
													: IssueCredentialUserText.credIssued}
											</span>
										),
									},
									// {
									// 	data: issuedCredential?.isRevocable ? (
									// 		<Button
									// 			disabled
									// 			className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
									// 		>
									// 			Revoke
									// 		</Button>
									// 	) : (
									// 		<span className="text-gray-400">Non revocable</span>
									// 	),
									// },
								],
							};
						},
					);

					setIssuedCredList(credentialList);
					setError(null);
				} else {
					setIssuedCredList([]);
				}
			}
		} catch (error) {
			setIssuedCredList([]);
			setError(error as string);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (listAPIParameter?.search?.length >= 1) {
			getData = setTimeout(() => {
				getIssuedCredDefs(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getIssuedCredDefs(listAPIParameter);
		}
		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	//onChange of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};

	const schemeSelection = () => {
		window.location.href = pathRoutes.organizations.Issuance.issue;
	};

	const refreshPage = () => {
		getIssuedCredDefs(listAPIParameter);
	};

	const header = [
		{ columnName: 'Connection Id' },
		{ columnName: 'Schema Name' },
		{ columnName: 'Date' },
		{ columnName: 'Status' },
		// { columnName: 'Action' },
	];

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div className="mb-4 flex justify-between flex-wrap flex-col sm:flex-row gap-4">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white mr-auto">
					Credentials
				</h1>
				<div>
					<SearchInput onInputChange={searchInputChange} />
				</div>
				<div className="flex gap-4 items-center">
					<button
						className="focus:z-10 focus:ring-2 bg-white-700 hover:bg-secondary-700 rounded-lg"
						onClick={refreshPage}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="36"
							height="36"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 20C9.76667 20 7.875 19.225 6.325 17.675C4.775 16.125 4 14.2333 4 12C4 9.76667 4.775 7.875 6.325 6.325C7.875 4.775 9.76667 4 12 4C13.15 4 14.25 4.2375 15.3 4.7125C16.35 5.1875 17.25 5.86667 18 6.75V4H20V11H13V9H17.2C16.6667 8.06667 15.9375 7.33333 15.0125 6.8C14.0875 6.26667 13.0833 6 12 6C10.3333 6 8.91667 6.58333 7.75 7.75C6.58333 8.91667 6 10.3333 6 12C6 13.6667 6.58333 15.0833 7.75 16.25C8.91667 17.4167 10.3333 18 12 18C13.2833 18 14.4417 17.6333 15.475 16.9C16.5083 16.1667 17.2333 15.2 17.65 14H19.75C19.2833 15.7667 18.3333 17.2083 16.9 18.325C15.4667 19.4417 13.8333 20 12 20Z"
								fill="#1F4EAD"
							/>
						</svg>
					</button>
					{walletCreated && (
						<RoleViewButton
							buttonTitle="Issue"
							feature={Features.ISSUANCE}
							svgComponent={
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="27"
									height="18"
									fill="none"
									viewBox="0 0 27 18"
									className="mr-1"
								>
									<path
										fill="#fff"
										d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 5.985-5.48-5.277.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277L15.27 16.57Z"
									/>
								</svg>
							}
							onClickEvent={schemeSelection}
						/>
					)}
				</div>
			</div>
			<div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<AlertComponent
						message={error}
						type={'failure'}
						onAlertClose={() => {
							setError(null);
						}}
					/>
					{!walletCreated && !loading ? (
						<div className="flex justify-center items-center">
							<EmptyListMessage
								message={'No Wallet Details Found'}
								description={'The owner is required to create a wallet'}
								buttonContent={''}
							/>
						</div>
					) : (
						<div>
							{loading ? (
								<div className="flex items-center justify-center mb-4">
									<CustomSpinner />
								</div>
							) : (
								<div
									className="Flex-wrap"
									style={{ display: 'flex', flexDirection: 'column' }}
								>
									<div className="">
										{issuedCredList && issuedCredList.length > 0 ? (
											<DataTable
												header={header}
												data={issuedCredList}
												loading={loading}
											></DataTable>
										) : (
											<EmptyListMessage
												message={'No issuance records'}
												description={'You have no issuance record yet'}
											/>
										)}
									</div>
									{Math.ceil(totalItem / listAPIParameter?.itemPerPage) > 1 && (
										<div className="flex items-center justify-end my-4">
											<Pagination
												currentPage={listAPIParameter?.page}
												onPageChange={(page: number) => {
													setListAPIParameter((prevState) => ({
														...prevState,
														page,
													}));
												}}
												totalPages={Math.ceil(
													totalItem / listAPIParameter?.itemPerPage,
												)}
											/>
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CredentialList;
