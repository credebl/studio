'use client';

import { Alert, Button } from 'flowbite-react';
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
	const [searchText, setSearchText] = useState("");
	const [verificationList, setVerificationList] = useState<TableData[]>([])
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [requestId, setRequestId] = useState<string>('')
	const [errMsg, setErrMsg] = useState<string | null>(null)
	const [proofReqSuccess, setProofReqSuccess] = useState<string>('')
	const [verifyLoader, setVerifyloader] = useState<boolean>(false)

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
							{ data: requestProof?.connectionId ? requestProof?.connectionId : 'Not available' },
							{ data: requestProof?.id ? requestProof?.id : 'Not available' },
							{ data: dateConversion(requestProof?.updatedAt) },
							{
								data: <span
									className={`bg-cyan-100 ${requestProof?.state === ProofRequestState.requestSent && 'text-blue-900'} ${(requestProof?.state === ProofRequestState.done) && 'text-green-900'} text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-white border border-cyan-100 dark:border-cyan-500`}
								>
									{requestProof?.state?.replace(/_/g, ' ').replace(/\w\S*/g, (word: string) => word?.charAt(0)?.toUpperCase() + word?.substring(1)?.toLowerCase())}
									{requestProof?.state === ProofRequestState.done && requestProof?.isVerified !== undefined && ` - ${requestProof?.isVerified ? 'Verified' : 'Not Verified'}`}
								</span>

							},
							{
								data: <Button
									disabled={!(requestProof.state === ProofRequestState.presentationReceived)}
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

				setVerificationList(credentialList);
			} else {
				setErrMsg(response as string);
			}
		} catch (error) {
			setErrMsg('An error occurred while fetching the proof request list');
		}

		setLoading(false);
	};

	const presentProofById = async (id: string) => {
		try {
			const response = await verifyPresentation(id);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
				setOpenModal(false)
				console.log("98798789", data)
				setProofReqSuccess(data.message)
				setVerifyloader(false)
				setTimeout(() => {
					setProofReqSuccess('')
					setErrMsg('')
					getproofRequestList()
				}, 4000)
			} else {
				setOpenModal(false)
				setErrMsg(response as string);
				setVerifyloader(false)
			}
		} catch (error) {
			setOpenModal(false)
			setVerifyloader(false)
			console.error("An error occurred:", error);
			setErrMsg("An error occurred while processing the presentation.");
		}
	};



	const openProofRequestModel = (flag: boolean, requestId: string) => {
		setRequestId(requestId)
		setOpenModal(flag)
	}

	const requestProof = async (proofVericationId: string) => {
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
						><svg className='mr-2 mt-1'xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 25 25">
						<path fill="#fff" d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"/>
					</svg>
					
							Request
						</Button>
					</div>
					{
						(proofReqSuccess || errMsg) &&
						<div className="p-2">
							<Alert
								color={proofReqSuccess ? "success" : "failure"}
								onDismiss={() => setErrMsg(null)}
							>
								<span>
									<p>
										{proofReqSuccess || errMsg}
									</p>
								</span>
							</Alert>
						</div>
					}
					<DataTable header={header} data={verificationList} loading={loading}></DataTable>
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
