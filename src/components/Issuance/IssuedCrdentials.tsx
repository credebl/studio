'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { IssueCredential, IssueCredentialUserText } from '../../common/enums';

import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import { Button } from 'flowbite-react';
import CustomSpinner from '../CustomSpinner';
import DataTable from '../../commonComponents/datatable';
import DateTooltip from '../Tooltip';
import { EmptyListMessage } from '../EmptyListComponent';
import { Features } from '../../utils/enums/features';
import React from 'react';
import RoleViewButton from '../RoleViewButton';
import SearchInput from '../SearchInput';
import type { TableData } from '../../commonComponents/datatable/interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { dateConversion } from '../../utils/DateConversion';
import { getIssuedCredentials } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage } from '../../api/Auth';
import { getOrgDetails } from '../../config/ecosystem'

interface IssuedCredential {
	metadata: { [x: string]: { schemaId: string } };
	connectionId: string;
	updatedAt: string;
	state: string;
	isRevocable: boolean;
}
const CredentialList = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchText, setSearchText] = useState('');
	const [issuedCredList, setIssuedCredList] = useState<TableData[]>([]);
	const [walletCreated, setWalletCreated] = useState(false)

	const getIssuedCredDefs = async () => {
		setLoading(true)
		const orgData = await getOrgDetails()
		const isWalletCreated = Boolean(orgData.orgDid)
		setWalletCreated(isWalletCreated)
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId && isWalletCreated) {
			const response = await getIssuedCredentials();

			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

				const credentialList = data?.data?.map(
					(issuedCredential: IssuedCredential) => {
						const schemaName = issuedCredential.metadata['_anoncreds/credential']
							.schemaId
							? issuedCredential.metadata['_anoncreds/credential'].schemaId
								.split(':')
								.slice(2)
								.join(':')
							: 'Not available';

						return {
							data: [
								{
									data: issuedCredential.connectionId
										? issuedCredential.connectionId
										: 'Not available',
								},
								{ data: schemaName },
								{ data: <DateTooltip date={issuedCredential.updatedAt}> {dateConversion(issuedCredential.updatedAt)} </DateTooltip> },
								{
									data: (
										<span
											className={` ${issuedCredential.state === IssueCredential.offerSent &&
												'bg-orange-100 text-orange-800 border border-orange-100 dark:bg-gray-700 dark:border-orange-300 dark:text-orange-300'
												} ${issuedCredential?.state === IssueCredential.done &&
												'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
												} ${issuedCredential?.state === IssueCredential.abandoned &&
												'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
												} text-xs font-medium mr-0.5 px-0.5 py-0.5 rounded-md border flex justify-center min-[320]:w-full xl:w-9/12 2xl:w-6/12`}
										>
											{issuedCredential.state === IssueCredential.offerSent
												? IssueCredentialUserText.offerSent
												: issuedCredential.state === IssueCredential.done
													? IssueCredentialUserText.done
													: issuedCredential.state === IssueCredential.abandoned
														? IssueCredentialUserText.abandoned : ''}
										</span>
									),
								},
								{
									data: issuedCredential?.isRevocable ? (
										<Button
											disabled
											className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
										>
											Revoke
										</Button>
									) : (
										<span className="text-gray-400">Non revocable</span>
									),
								},
							],
						};
					},
				);

				setIssuedCredList(credentialList)
			} else {
				setError(response as string)
			}
		}
		setLoading(false)
	}

	useEffect(() => {
		let getData: NodeJS.Timeout

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getIssuedCredDefs()

			}, 1000)
		} else {
			getIssuedCredDefs()
		}

		return () => clearTimeout(getData)
	}, [searchText])

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	}

	const schemeSelection = () => {
		window.location.href = pathRoutes.organizations.Issuance.schema;
	}

	const header = [
		{ columnName: 'Connection Id' },
		{ columnName: 'Schema Name' },
		{ columnName: 'Date' },
		{ columnName: 'Status' },
		{ columnName: 'Action' }
	]

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div className='mb-4 flex justify-between'>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Credentials
				</h1>
				<div>
					{
						walletCreated &&
						<RoleViewButton
							buttonTitle='Issue'
							feature={Features.ISSUENCE}
							svgComponent={
								<svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" viewBox="0 0 25 18">
									<path fill="#fff" d="M.702 10.655a.703.703 0 1 0-.001-1.406.703.703 0 0 0 .001 1.406Z" />
									<path fill="#fff" d="m24.494 5.965-5.8-5.8a.562.562 0 0 0-.795 0l-2.06 2.06H8.884c-1.602 0-3.128.73-4.137 1.966H3.652V3.35a.562.562 0 0 0-.562-.562H.562a.562.562 0 0 0 0 1.123h1.966v7.866H.562a.562.562 0 0 0 0 1.124H3.09c.31 0 .562-.252.562-.562v-1.404h1.096A5.358 5.358 0 0 0 8.885 12.9h.653l4.01 4.01a.56.56 0 0 0 .795 0l10.15-10.15a.562.562 0 0 0 0-.795ZM5.478 10.04a.562.562 0 0 0-.455-.231h-1.37V5.315h1.37c.18 0 .349-.086.455-.23a4.23 4.23 0 0 1 3.407-1.736h5.83L11.38 6.682a5.675 5.675 0 0 1-1.238-1.243.562.562 0 0 0-.908.66 6.74 6.74 0 0 0 4.429 2.71.633.633 0 0 1-.197 1.25 8 8 0 0 1-4.14-1.974.562.562 0 0 0-.755.833c.1.091.204.18.308.266l-1.132 1.131a.562.562 0 0 0 0 .795l.637.636a4.235 4.235 0 0 1-2.907-1.705Zm8.468 5.677L8.94 10.713l.86-.86a9.16 9.16 0 0 0 3.492 1.316 1.759 1.759 0 0 0 2.008-1.46 1.758 1.758 0 0 0-1.461-2.01 5.69 5.69 0 0 1-1.454-.432l5.911-5.91 5.006 5.005-9.356 9.356Z" />
								</svg>
							}
							onClickEvent={schemeSelection}
						/>
					}
				</div>
			</div>
			<div>
				<div
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<AlertComponent
						message={error}
						type={'failure'}
						onAlertClose={() => {
							setError(null)
						}}
					/>
					{
						!walletCreated && !loading ?
							<div className="flex justify-center items-center">
								<EmptyListMessage
									message={'No Wallet Details Found'}
									description={'The owner is required to create a wallet'}
									buttonContent={''}
								/>
							</div>
							:
							<div>
								{
									loading ? (
										<div className="flex items-center justify-center mb-4">
											<CustomSpinner />
										</div>
									) : issuedCredList && issuedCredList.length > 0 ? (
										<div
											className="Flex-wrap"
											style={{ display: 'flex', flexDirection: 'column' }}
										>
											<div className="">
												{issuedCredList && issuedCredList.length > 0 &&
													<DataTable header={header} data={issuedCredList} loading={loading}></DataTable>
												}
											</div>
										</div>
									) : (
										<div>
											<span className="dark:text-white block text-center p-4 m-8">
												There isn't any data available.
											</span>
										</div>
									)
								}
							</div>
					}
				</div>
			</div>
		</div>
	)
}

export default CredentialList;
