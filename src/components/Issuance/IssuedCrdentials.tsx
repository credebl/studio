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
			<div className='mb-4 flex justify-between flex-col sm:flex-row'>
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Credentials
				</h1>
				<div className='flex gap-4 items-center'>

					{
						walletCreated &&
						<RoleViewButton
							buttonTitle='Issue'
							feature={Features.ISSUENCE}
							isOutline={true}
							svgComponent={
								<svg xmlns="http://www.w3.org/2000/svg" width="27" height="18" fill="none" viewBox="0 0 27 18" className='mr-1'>
									<path fill="#1F4EAD" d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 5.985-5.48-5.277.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277L15.27 16.57Z" />
								</svg>
							}
							onClickEvent={schemeSelection}
						/>
					}
					{
						walletCreated &&
						<RoleViewButton
							buttonTitle='Bulk Issue'
							feature={Features.ISSUENCE}
							svgComponent={
								<svg xmlns="http://www.w3.org/2000/svg" width="217" height="168" fill="none" viewBox="0 0 217 168" className='mr-1 w-[28px] h-[20px]'>
									<path stroke="#fff" strokeWidth={8} d="m113.5 67.5 63.783-30.94a4 4 0 0 1 5.127 1.462l29.442 46.58a4 4 0 0 1-1.261 5.529L206 93" />
									<path fill="#fff" d="m212.417 49.803-50.302-48.43c-1.903-1.83-4.988-1.83-6.892 0l-17.868 17.203H77.05c-13.893 0-27.121 6.095-35.877 16.419H31.67v-7.037c0-2.59-2.181-4.69-4.872-4.69H4.873c-2.692 0-4.873 2.1-4.873 4.69 0 2.59 2.181 4.692 4.873 4.692h17.053v65.675H4.873c-2.692 0-4.873 2.1-4.873 4.691 0 2.59 2.181 4.691 4.873 4.691h21.926c2.691 0 4.873-2.101 4.873-4.691V91.288h9.5c8.757 10.324 21.986 16.419 35.878 16.419l-2.05-.044s21.203 19.663 40.122 37.211c1.317 1.222 3.374 3.126 3.374 3.126l6.781-6.616 41.325-40.321 45.815-44.626a4.604 4.604 0 0 0 1.427-3.317 4.605 4.605 0 0 0-1.427-3.317ZM47.502 83.833c-.917-1.21-2.38-1.927-3.938-1.927H31.672V44.377h11.893c1.557 0 3.02-.716 3.938-1.928 6.869-9.073 17.915-14.49 29.548-14.49h50.56L98.702 55.79a48.35 48.35 0 0 1-10.736-10.382c-1.583-2.095-4.63-2.558-6.807-1.034-2.176 1.524-2.657 4.458-1.074 6.553 9.246 12.236 22.887 20.272 38.411 22.629 2.986.453 5.032 3.16 4.561 6.035-.47 2.874-3.279 4.841-6.268 4.39-13.487-2.047-25.904-7.744-35.907-16.474-1.994-1.74-5.075-1.594-6.882.326-1.808 1.92-1.656 4.886.337 6.626a78.403 78.403 0 0 0 2.672 2.217l-9.815 9.449C66.281 87.005 66 87.5 66 89c0 1.244 1.194 3.76 1.194 3.76l3.306 5.565c-9.998-1.163-16.99-6.555-22.998-14.491ZM70.5 98.326 72 93.25l12.988-10.99c9.126 5.583 19.397 9.335 30.282 10.988.801.121 1.595.18 2.381.18 7.358 0 13.85-5.163 15.032-12.377 1.307-7.985-4.376-15.505-12.669-16.765a50.786 50.786 0 0 1-12.606-3.61l51.261-49.352 43.412 41.795L197 56.5l2.5 4.176 3.065 5.358-17.987 17.52-8.976 8.743-9 8.766L118.496 148 75 107.663l-4.5-9.338Z" />
									<path stroke="#fff" strokeWidth={8} d="m128 81 65.1-14.624a4 4 0 0 1 4.779 3.023l14.234 63.166a4 4 0 0 1-3.055 4.789L89.885 163.159a4 4 0 0 1-4.75-3.039l-13.79-61.829a4 4 0 0 1 2.92-4.747L102 86.5" />
								</svg>
							}
							onClickEvent={() => window.location.href = pathRoutes.organizations.Issuance.bulkIssuance}
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
