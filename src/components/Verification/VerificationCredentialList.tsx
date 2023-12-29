'use client';

import { Alert, Button, Pagination } from 'flowbite-react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
	ProofRequestState,
	ProofRequestStateUserText,
} from '../../common/enums';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import {
	getProofAttributes,
	getVerificationList,
	verifyPresentation,
} from '../../api/verification';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomSpinner from '../CustomSpinner';
import DataTable from '../../commonComponents/datatable';
import DateTooltip from '../Tooltip';
import { EmptyListMessage } from '../EmptyListComponent';
import { Features } from '../../utils/enums/features';
import ProofRequest from './ProofRequestPopup';
import type { RequestProof } from './interface';
import RoleViewButton from '../RoleViewButton';
import SearchInput from '../SearchInput';
import type { TableData } from '../../commonComponents/datatable/interface';
import { dateConversion } from '../../utils/DateConversion';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage, removeFromLocalStorage } from '../../api/Auth';
import { getOrgDetails } from '../../config/ecosystem';
import type { IConnectionListAPIParameter } from '../../api/connection';

const initialPageState = {
	itemPerPage: 10,
	page: 1,
	search: '',
	sortBy: 'createDateTime',
	sortingOrder: 'DESC',
	allSearch: '',
};

const VerificationCredentialList = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [verificationList, setVerificationList] = useState<TableData[]>([]);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [requestId, setRequestId] = useState<string>('');
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [proofReqSuccess, setProofReqSuccess] = useState<string>('');
	const [verifyLoader, setVerifyloader] = useState<boolean>(false);
	const [userData, setUserData] = useState(null);
	const [view, setView] = useState(false);
	const [walletCreated, setWalletCreated] = useState(false);
	const [listAPIParameter, setListAPIParameter] =
		useState<IConnectionListAPIParameter>(initialPageState);
	const [totalItem, setTotalItem] = useState(0);

	const getProofPresentationData = async (id: string) => {
		try {
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			const response = await getProofAttributes(id, orgId);

			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {
				setUserData(data?.data);
			} else {
				setErrMsg(response as string);
			}
		} catch (error) {
			throw error;
		}
	};

	//onChange of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setListAPIParameter({
			...listAPIParameter,
			search: e.target.value,
			page: 1,
		});
	};

	const getproofRequestList = async (
		apiParameter: IConnectionListAPIParameter,
	) => {
		await removeFromLocalStorage(storageKeys.SELECTED_USER);
		await removeFromLocalStorage(storageKeys.SCHEMA_ID);
		await removeFromLocalStorage(storageKeys.CRED_DEF_ID);
		await removeFromLocalStorage(storageKeys.SCHEMA_ATTR);
		setLoading(true);

		try {
			const orgData = await getOrgDetails();
			const isWalletCreated = Boolean(orgData.orgDid);
			setWalletCreated(isWalletCreated);
			const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
			if (orgId && isWalletCreated) {
				const response = await getVerificationList(apiParameter);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					setTotalItem(data?.data.totalItems);
					const credentialList = data?.data?.data?.map(
						(requestProof: RequestProof) => {
							return {
								data: [
									{
										data: requestProof?.presentationId
											? requestProof?.presentationId
											: 'Not available',
									},
									{
										data: requestProof?.connectionId
											? requestProof?.connectionId
											: 'Not available',
									},
									{
										data: (
											<DateTooltip date={requestProof.createDateTime}>
												{' '}
												{dateConversion(requestProof.createDateTime)}{' '}
											</DateTooltip>
										),
									},
									{
										data: (
											<span
												className={`${
													requestProof?.state ===
														ProofRequestState.requestSent &&
													'bg-orange-100 text-orange-800 border border-orange-100 dark:bg-gray-700 dark:border-orange-300 dark:text-orange-300'
												} ${
													requestProof?.state === ProofRequestState.done &&
													'bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500'
												} ${
													requestProof?.state === ProofRequestState.abandoned &&
													'bg-red-100 text-red-800 border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400'
												} ${
													requestProof?.state ===
														ProofRequestState.presentationReceived &&
													'bg-secondary-700 text-primary-600 border border-secondary-100 dark:border-secondary-700 dark:bg-gray-700 dark:text-secondary-800'
												}	text-xs font-medium sm:mr-0 md:mr-2 min-[320]:px-1 sm:px-0 lg:px-0.5 py-0.5 rounded-md flex justify-center min-[320]:w-full 2xl:w-8/12`}
											>
												{requestProof?.state === ProofRequestState.requestSent
													? ProofRequestStateUserText.requestSent
													: requestProof?.state ===
													  ProofRequestState.presentationReceived
													? ProofRequestStateUserText.requestReceived
													: requestProof?.state === ProofRequestState.done
													? ProofRequestStateUserText.done
													: requestProof?.state === ProofRequestState.abandoned
													? ProofRequestStateUserText.abandoned
													: ''}
											</span>
										),
									},
									{
										data: (
											<Button
												disabled={
													requestProof.state !==
														ProofRequestState.presentationReceived &&
													requestProof?.state !== 'done'
												}
												className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
												style={{ height: '2.5rem', minWidth: '4rem' }}
												onClick={() => {
													openProofRequestModel(
														true,
														requestProof?.presentationId,
														requestProof?.state,
													);
													getProofPresentationData(
														requestProof?.presentationId,
													);
												}}
											>
												{requestProof?.state === 'done' ? (
													<p className="pr-1 flex text-center justify-center item-center">
														{' '}
														<svg
															className="pr-1 mt-0.5 flex items-center"
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="15"
															fill="none"
															viewBox="0 0 24 15"
														>
															{' '}
															<path
																fill="#fff"
																d="M23.385 7.042C23.175 6.755 18.165 0 11.767 0 5.37 0 .36 6.755.15 7.042a.777.777 0 0 0 0 .916C.36 8.245 5.37 15 11.767 15c6.398 0 11.408-6.755 11.618-7.042.2-.273.2-.643 0-.916Zm-11.618 6.406c-4.713 0-8.795-4.483-10.003-5.949 1.207-1.466 5.28-5.947 10.003-5.947 4.713 0 8.794 4.482 10.003 5.949-1.207 1.466-5.28 5.947-10.003 5.947Z"
															/>{' '}
															<path
																fill="#fff"
																d="M11.772 2.84a4.66 4.66 0 0 0-4.655 4.655 4.66 4.66 0 0 0 4.655 4.655 4.66 4.66 0 0 0 4.656-4.655 4.66 4.66 0 0 0-4.656-4.655Zm0 7.758A3.107 3.107 0 0 1 8.67 7.495a3.107 3.107 0 0 1 3.103-3.103 3.107 3.107 0 0 1 3.104 3.103 3.107 3.107 0 0 1-3.104 3.103Z"
															/>
														</svg>
														<span className="pl-1">View</span>{' '}
													</p>
												) : (
													<p className="flex items-center justify-center">
														{' '}
														<svg
															className="pr-2 flex items-center"
															xmlns="http://www.w3.org/2000/svg"
															width="25"
															height="25"
															fill="none"
															viewBox="0 0 17 17"
														>
															<path
																fill="#fff"
																d="M15.749 6.99c-.334-.21-.813-.503-.813-.697.01-.397.113-.786.3-1.136.277-.69.561-1.395.204-1.915-.358-.519-1.122-.462-1.853-.405-.358.082-.73.082-1.089 0a2.74 2.74 0 0 1-.374-1.087c-.162-.739-.333-1.501-.942-1.704-.61-.203-1.154.3-1.699.811-.309.276-.723.65-.934.65-.212 0-.634-.374-.943-.65C7.07.362 6.51-.14 5.908.046c-.602.187-.805.933-.967 1.671-.05.383-.18.75-.382 1.08a2.295 2.295 0 0 1-1.09 0c-.722-.066-1.478-.13-1.844.405-.365.535-.081 1.225.195 1.914.19.35.295.739.31 1.136-.066.195-.521.487-.854.698C.65 7.34 0 7.76 0 8.41c0 .649.65 1.07 1.276 1.468.333.211.812.495.853.69-.014.4-.12.791-.309 1.144-.276.69-.56 1.395-.195 1.914.366.52 1.122.463 1.845.398a2.441 2.441 0 0 1 1.089.04c.2.33.33.697.382 1.08.162.738.333 1.508.934 1.711a.86.86 0 0 0 .277.106 2.439 2.439 0 0 0 1.422-.812c.308-.275.731-.657.942-.657.212 0 .626.382.935.657.544.487 1.105.998 1.698.812.593-.187.813-.974.943-1.712a2.69 2.69 0 0 1 .374-1.08 2.472 2.472 0 0 1 1.089-.04c.73.065 1.479.138 1.852-.397.374-.536.073-1.225-.203-1.915a2.585 2.585 0 0 1-.3-1.144c.056-.194.511-.478.812-.69C16.35 9.587 17 9.174 17 8.517c0-.658-.618-1.136-1.251-1.526Zm-.431 2.248c-.537.332-1.04.649-1.195 1.135a2.73 2.73 0 0 0 .325 1.68c.155.373.399.99.293 1.151-.106.163-.731.09-1.113.057a2.393 2.393 0 0 0-1.626.203 2.594 2.594 0 0 0-.682 1.55c-.082.365-.236 1.054-.406 1.111-.171.057-.667-.422-.894-.625a2.585 2.585 0 0 0-1.48-.868c-.58.11-1.105.417-1.486.868-.22.203-.756.674-.894.625-.138-.049-.325-.746-.407-1.111a2.594 2.594 0 0 0-.674-1.55 1.522 1.522 0 0 0-.95-.243 7.016 7.016 0 0 0-.708.04c-.374 0-1.008.09-1.105-.056-.098-.146.097-.78.26-1.112.285-.51.4-1.1.325-1.68-.146-.486-.65-.81-1.186-1.135-.358-.227-.902-.568-.902-.811 0-.244.544-.552.902-.811.536-.333 1.04-.658 1.186-1.136a2.754 2.754 0 0 0-.325-1.688c-.163-.348-.398-.973-.284-1.127.113-.154.73-.09 1.105-.057.549.122 1.123.05 1.625-.203.392-.427.629-.972.674-1.55.082-.364.236-1.054.407-1.11.17-.058.674.421.894.624.381.45.907.753 1.487.86a2.569 2.569 0 0 0 1.479-.86c.227-.203.756-.673.894-.625.138.049.325.747.406 1.112.048.578.288 1.123.682 1.55a2.397 2.397 0 0 0 1.626.202c.382 0 1.007-.09 1.113.057.106.146-.138.811-.292 1.144a2.755 2.755 0 0 0-.326 1.687c.155.479.659.811 1.195 1.136.357.227.902.568.902.811 0 .243-.488.527-.845.755Z"
															/>
															<path
																fill="#fff"
																d="m11.253 6.126-3.78 3.943-1.687-1.403a.473.473 0 0 0-.149-.08.556.556 0 0 0-.352 0 .473.473 0 0 0-.148.08.377.377 0 0 0-.101.12.306.306 0 0 0 0 .284.377.377 0 0 0 .101.12l2.002 1.7a.459.459 0 0 0 .152.083.548.548 0 0 0 .181.027.601.601 0 0 0 .19-.043.499.499 0 0 0 .153-.097l4.105-4.284a.312.312 0 0 0 .074-.265.365.365 0 0 0-.174-.234.55.55 0 0 0-.632.049h.065Z"
															/>
														</svg>
														<span>Verify</span>
													</p>
												)}
											</Button>
										),
									},
								],
							};
						},
					);

					setVerificationList(credentialList);
					setErrMsg(null);
				} else {
					setVerificationList([]);
				}
			}
		} catch (error) {
			setVerificationList([]);
			setErrMsg('An error occurred while fetching the proof request list');
		}

		setLoading(false);
	};

	const presentProofById = async (id: string) => {
		try {
			const response = await verifyPresentation(id);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
				setOpenModal(false);
				setProofReqSuccess(data.message);
				setVerifyloader(false);
				setTimeout(() => {
					getproofRequestList(listAPIParameter);
				}, 2000);
			} else {
				setOpenModal(false);
				setErrMsg(response as string);
				setVerifyloader(false);
			}
			setTimeout(() => {
				setProofReqSuccess('');
				setErrMsg('');
			}, 4000);
		} catch (error) {
			setOpenModal(false);
			setVerifyloader(false);
			console.error('An error occurred:', error);
			setErrMsg('An error occurred while processing the presentation.');
		}
	};

	const openProofRequestModel = (
		flag: boolean,
		requestId: string,
		state: string,
	) => {
		setRequestId(requestId);
		setOpenModal(flag);
		setView(state === 'done');
	};

	const refreshPage = () => {
		getproofRequestList(listAPIParameter);
	};

	const requestProof = async (proofVericationId: string) => {
		if (proofVericationId) {
			setOpenModal(false);
			presentProofById(proofVericationId);
		}
	};

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (listAPIParameter?.search?.length >= 1) {
			getData = setTimeout(() => {
				getproofRequestList(listAPIParameter);
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getproofRequestList(listAPIParameter);
		}
		return () => clearTimeout(getData);
	}, [listAPIParameter]);

	const schemeSelection = () => {
		window.location.href = pathRoutes.organizations.verification.schema;
	};

	const header = [
		{ columnName: 'Request Id' },
		{ columnName: 'Connection Id' },
		{ columnName: 'Requested On' },
		{ columnName: 'Status' },
		{ columnName: 'Action' },
	];

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div className="mb-4 flex flex-wrap justify-between gap-4">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white mr-auto">
					Verification List
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
							buttonTitle="Request"
							feature={Features.VERIFICATION}
							svgComponent={
								<svg
									className="mr-2 mt-1"
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									fill="none"
									viewBox="0 0 25 25"
								>
									<path
										fill="#fff"
										d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"
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
					{(proofReqSuccess || errMsg) && (
						<div className="p-2">
							<Alert
								color={proofReqSuccess ? 'success' : 'failure'}
								onDismiss={() => setErrMsg(null)}
							>
								<span>
									<p>{proofReqSuccess || errMsg}</p>
								</span>
							</Alert>
						</div>
					)}

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
							) : verificationList && verificationList.length > 0 ? (
								<div
									className="Flex-wrap"
									style={{ display: 'flex', flexDirection: 'column' }}
								>
									<div className="">
										{verificationList && verificationList.length > 0 && (
											<DataTable
												header={header}
												data={verificationList}
												loading={loading}
											></DataTable>
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
							) : (
								<EmptyListMessage
									message={'No verification records'}
									description={'You have no verification record yet'}
								/>
							)}
						</div>
					)}

					{userData && (
						<ProofRequest
							openModal={openModal}
							closeModal={() => openProofRequestModel(false, '', '')}
							onSucess={requestProof}
							requestId={requestId}
							userData={userData}
							view={view}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default VerificationCredentialList;
