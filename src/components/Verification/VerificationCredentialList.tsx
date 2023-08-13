'use client';

import { Button } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import SearchInput from '../SearchInput';
import { dateConversion } from '../../utils/DateConversion';
import { ProofRequestState } from '../../common/enums';
import { AlertComponent } from '../AlertComponent';
import { pathRoutes } from '../../config/pathRoutes';
import DataTable from '../../commonComponents/datatable';
import type { TableData } from '../../commonComponents/datatable/interface';
import { removeFromLocalStorage } from '../../api/Auth';
import { getVerificationList, verifyPresentation } from '../../api/verification';
import type { RequestProof } from './interface';
import ProofRequest from '../../commonComponents/ProofRequestPopup';

const VerificationCredentialList = () => {
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [searchText, setSearchText] = useState("");
	const [issuedCredList, setIssuedCredList] = useState<TableData[]>([])
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [requestId, setRequestId] = useState<string>('')
	const [message, setMessage] = useState<string | null>(null)

	//Fetch all issued credential list
	const getproofRequestList = async () => {
		await removeFromLocalStorage(storageKeys.SELECTED_USER)
		await removeFromLocalStorage(storageKeys.SCHEMA_ID)
		await removeFromLocalStorage(storageKeys.CRED_DEF_ID)
		await removeFromLocalStorage(storageKeys.SCHEMA_ATTR)
		setLoading(true);

		try {
			const response = await getVerificationList();
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const credentialList = data?.data?.map((requestProof: RequestProof) => {
					return {
						data: [
							{ data: requestProof.connectionId ? requestProof.connectionId : 'Not available' },
							{ data: requestProof.id ? requestProof.id : 'Not available' },
							{ data: dateConversion(requestProof.updatedAt) },
							{
								data: <span
									className={`bg-cyan-100 ${requestProof.state === ProofRequestState.requestSent && 'text-blue-900'} ${(requestProof.state === ProofRequestState.done) && 'text-green-900'} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-white border border-cyan-100 dark:border-cyan-500`}
								>
									{requestProof.state.replace(/_/g, ' ').replace(/\w\S*/g, (word: string) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())}
									{requestProof.state === ProofRequestState.done && requestProof?.isVerified !== undefined && ` - ${requestProof.isVerified ? 'Verified' : 'Not Verified'}`}
								</span>

							},
							{
								data: <Button
									disabled={!(requestProof.state === ProofRequestState.presentationReceived || requestProof.state === ProofRequestState.done)}
									className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
									onClick={() => {
										openProofRequestModel(true, requestProof?.id)
									}}
								>
									Verify
								</Button>
							}
						]
					};
				});

				setIssuedCredList(credentialList);
			} else {
				setError(response as string);
			}
		} catch (error) {
			setError(error.message);
		}

		setLoading(false);
	};

	const presentProofById = async (id: string) => {
		try {
			const response = await verifyPresentation(id);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {

			} else {
				setError(response as string);
			}
		} catch (error) {
			console.error("An error occurred:", error);
			setError("An error occurred while processing the presentation.");
		}
	};



	const openProofRequestModel = (flag: boolean, requestId: string) => {
		setRequestId(requestId)
		setOpenModal(flag)
	}

	const requestProof = (proofVericationId: string) => {
		if (proofVericationId) {
			setOpenModal(false)
			presentProofById(proofVericationId)
		}
	}

	//This useEffect is called when the searchText changes 
	useEffect(() => {
		let getData: NodeJS.Timeout

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getproofRequestList()

			}, 1000)
		} else {
			getproofRequestList()
		}

		return () => clearTimeout(getData)
	}, [searchText])

	//onCHnage of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	}

	const schemeSelection = () => {
		window.location.href = pathRoutes.organizations.verification.schema
	}

	const header = [
		{ columnName: 'Connection Id' },
		{ columnName: 'Request Id' },
		{ columnName: 'Requested On' },
		{ columnName: 'Status' },
		{ columnName: 'Action' }
	]

	return (
		<div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Verification List
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
							Request
						</Button>
					</div>
					<AlertComponent
						message={message ? message : error}
						type={message ? 'success' : 'failure'}
						onAlertClose={() => {
							setMessage(null)
							setError(null)
						}}
					/>
					<DataTable header={header} data={issuedCredList} loading={loading}></DataTable>
					<ProofRequest openModal={openModal}
						closeModal={
							openProofRequestModel
						}
						onSucess={
							requestProof
						}
						requestId={requestId}
					/>
				</div>
			</div>
		</div>
	)
}

export default VerificationCredentialList;
