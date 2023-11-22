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
								<svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" fill="none" viewBox="0 0 28 20" className='mr-1'>
									<path fill="#fff" d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 6.032-5.48-5.324.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277-1.014.954L25 8l-.09.965L21 12.73l-4.956 4.77-.774-.883Z" />
									<mask id="a" fill="#fff">
										<rect width="16.651" height="9.948" x="7.832" y="11.281" rx=".5" transform="rotate(-30.933 7.832 11.281)" />
									</mask>
									<rect width="16.651" height="9.948" x="7.832" y="11.281" stroke="#fff" stroke-width="2" mask="url(#a)" rx=".5" transform="rotate(-30.933 7.832 11.281)" />
									<mask id="b" fill="#fff">
										<rect width="16.634" height="9.094" x="9" y="11.008" rx=".5" transform="rotate(-17.524 9 11.008)" />
									</mask>
									<rect width="16.634" height="9.094" x="9" y="11.008" stroke="#fff" stroke-width="2" mask="url(#b)" rx=".5" transform="rotate(-17.524 9 11.008)" />
									<path fill="#1F4EAD" d="m11 7.5 1.516.956L14 9l1.5.5.03.417-.474.431-.987-.036-.368.037L12 10l-1.438-1.167L11 7.5Z" />
									<path fill="#1F4EAD" d="M14.575 10.586a.432.432 0 0 0-.086-.359.657.657 0 0 0-.36-.23.673.673 0 0 0-.43.025.447.447 0 0 0-.258.27l.563.162.571.132Zm.321.021a.53.53 0 0 0 .429-.124.768.768 0 0 0 .255-.439c.036-.177-.075-.55-.062-.508 0 0-.013-.042-.018-.036l.005-.006-.488.428-.12.684Zm.692 6.377 9.505-6.982.932 2.972L21 15.5l-5 2-.412-.516Z" />
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
