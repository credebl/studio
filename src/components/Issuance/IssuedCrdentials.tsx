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
console.log("datadata",data.data);

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
						>
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
