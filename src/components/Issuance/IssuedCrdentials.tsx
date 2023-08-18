'use client';

import { Button, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import SearchInput from '../SearchInput';
import { dateConversion } from '../../utils/DateConversion';
import { getIssuedCredentials } from '../../api/issuance';
import { IssueCredential } from '../../common/enums';
import { AlertComponent } from '../AlertComponent';
import { pathRoutes } from '../../config/pathRoutes';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';

interface IssuedCredential {
	metadata: { [x: string]: { schemaId: string; }; };
	connectionId: string;
	updatedAt: string;
	state: string;
	isRevocable: boolean;
}
const CredentialList = () => {
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [searchText, setSearchText] = useState("");
	const [issuedCredList, setIssuedCredList] = useState<TableData[]>([])

	//Fetch all issued credential list
	const getIssuedCredDefs = async () => {
		setLoading(true)
		const response = await getIssuedCredentials(IssueCredential.credentialIssued);
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const credentialList = data?.data?.map((issuedCredential: IssuedCredential) => {
				const schemaName = issuedCredential.metadata["_anoncreds/credential"].schemaId ? issuedCredential.metadata["_anoncreds/credential"].schemaId.split(':').slice(2).join(':') : 'Not available'
				return {
					data: [{ data: issuedCredential.connectionId ? issuedCredential.connectionId : 'Not available' }, { data: schemaName }, { data: dateConversion(issuedCredential.updatedAt) },
					{
						data: <span
							className={`bg-cyan-100 ${issuedCredential.state === IssueCredential.offerSent && 'text-blue-900'} ${(issuedCredential.state === IssueCredential.done || issuedCredential.state === IssueCredential.credentialIssued) && 'text-green-900'} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-white border border-cyan-100 dark:border-cyan-500`}>
							{issuedCredential.state.replace(/_/g, ' ').replace(/\w\S*/g, (word: string) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())}
						</span>
					}, {
						data: issuedCredential?.isRevocable ? <Button disabled
							className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
						>
							Revoke
						</Button>
							: <span className='text-gray-400'>Non revocable</span>
					}]
				};
			})

			setIssuedCredList(credentialList)
		} else {
			setError(response as string)
		}

		setLoading(false)
	}


	//This useEffect is called when the searchText changes 
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

	//onCHnage of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	}

	const schemeSelection = () => {
		window.location.href = pathRoutes.organizations.Issuance.schema
	}

	const header = [
		{ columnName: 'Connection Id' },
		{ columnName: 'Schema Name' },
		{ columnName: 'Date' },
		{ columnName: 'Status' },
		{ columnName: 'Action' }
	]

	return (
		<div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Issued Credentials
				</h1>
			</div>
			<div>
				<div
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<div className="flex items-center justify-between mb-4">
						<SearchInput
							onInputChange={searchInputChange}
						/>
						<Button onClick={schemeSelection}
							className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
						><svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" viewBox="0 0 25 18">
								<path fill="#fff" d="M.702 10.655a.703.703 0 1 0-.001-1.406.703.703 0 0 0 .001 1.406Z" />
								<path fill="#fff" d="m24.494 5.965-5.8-5.8a.562.562 0 0 0-.795 0l-2.06 2.06H8.884c-1.602 0-3.128.73-4.137 1.966H3.652V3.35a.562.562 0 0 0-.562-.562H.562a.562.562 0 0 0 0 1.123h1.966v7.866H.562a.562.562 0 0 0 0 1.124H3.09c.31 0 .562-.252.562-.562v-1.404h1.096A5.358 5.358 0 0 0 8.885 12.9h.653l4.01 4.01a.56.56 0 0 0 .795 0l10.15-10.15a.562.562 0 0 0 0-.795ZM5.478 10.04a.562.562 0 0 0-.455-.231h-1.37V5.315h1.37c.18 0 .349-.086.455-.23a4.23 4.23 0 0 1 3.407-1.736h5.83L11.38 6.682a5.675 5.675 0 0 1-1.238-1.243.562.562 0 0 0-.908.66 6.74 6.74 0 0 0 4.429 2.71.633.633 0 0 1-.197 1.25 8 8 0 0 1-4.14-1.974.562.562 0 0 0-.755.833c.1.091.204.18.308.266l-1.132 1.131a.562.562 0 0 0 0 .795l.637.636a4.235 4.235 0 0 1-2.907-1.705Zm8.468 5.677L8.94 10.713l.86-.86a9.16 9.16 0 0 0 3.492 1.316 1.759 1.759 0 0 0 2.008-1.46 1.758 1.758 0 0 0-1.461-2.01 5.69 5.69 0 0 1-1.454-.432l5.911-5.91 5.006 5.005-9.356 9.356Z" />
							</svg>

							Issue
						</Button>
					</div>
					<AlertComponent
						message={error}
						type={'failure'}
						onAlertClose={() => {
							setError(null)
						}}
					/>
					<DataTable header={header} data={issuedCredList} loading={loading}></DataTable>
				</div>
			</div>
		</div>
	)
}

export default CredentialList;
