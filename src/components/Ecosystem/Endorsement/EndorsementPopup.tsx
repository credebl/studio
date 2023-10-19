import { Button, Modal, Spinner } from 'flowbite-react';
import { EndorsementStatus, EndorsementType } from '../../../common/enums';
import {
	ICheckEcosystem,
	checkEcosystem,
	getEcosystemId,
} from '../../../config/ecosystem';
import EndorsementCard from './EndorsementCard';
import { useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { RejectEndorsementRequest, SignEndorsementRequest, SubmitEndorsementRequest } from '../../../api/ecosystem';
import type { AxiosResponse } from 'axios';
import { AlertComponent } from '../../AlertComponent';
import { getFromLocalStorage } from '../../../api/Auth';

const EndorsementPopup = (props: {
	openModal: boolean;
	closeModal: () => void;
	isAccepted: (flag: boolean) => void;
	setMessage: (message: string) => void;
	endorsementData: any;
	onAlertClose: boolean;
}) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingReject, setLoadingReject] = useState<boolean>(false);
	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();

	useEffect(() => {
		const checkEcosystemData = async () => {
			const data: ICheckEcosystem = await checkEcosystem();
			setIsEcosystemData(data);
		};
		checkEcosystemData();
	}, []);

	useEffect(() => {
		props.setMessage("");
	}, [props.onAlertClose]);

	const SignEndorsement = async (endorsementId: string) => {
		try {
			setLoading(true);
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			const ecoId = await getEcosystemId();
			const SignEndorsementrequest = await SignEndorsementRequest(
				ecoId,
				organizationId,
				endorsementId,
			);

			const response = SignEndorsementrequest as AxiosResponse;
			if (response?.data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				props.isAccepted(true);
				props.setMessage(response?.data.message);
			} else {
				setErrMsg(response as unknown as string);
			}
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.error('Error while Sign schema:', error);
		}
	};

	const SubmitEndorsement = async (endorsementId: string) => {
		try {
			setLoading(true);
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			const ecoId = await getEcosystemId();
			const SubmitEndorsementrequest = await SubmitEndorsementRequest(
				ecoId,
				organizationId,
				endorsementId,
			);

			const response = SubmitEndorsementrequest as AxiosResponse;
			if (response?.data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				props.isAccepted(true);
				props.setMessage(response?.data.message);
			} else {
				setErrMsg(response as unknown as string);
			}
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.error('Error while Submit schema:', error);
		}
	};

	const RejectEndorsement = async (endorsementId: string) => {
		try {
			setLoadingReject(true);
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			const ecoId = await getEcosystemId();
			const RejectEndorsementrequest = await RejectEndorsementRequest(
				ecoId,
				organizationId,
				endorsementId,
			);

			const response = RejectEndorsementrequest as AxiosResponse;
			if (response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				props.isAccepted(true);
				props.setMessage(response?.data.message);
			} else {
				setErrMsg(response as unknown as string);
			}
			setLoadingReject(false);
		} catch (error) {
			setLoadingReject(false);
			console.error('Error while Reject schema:', error);
		}
	};

	return (
		<Modal
		className='h-full'
		 show={props.openModal} onClose={() => {
			props.closeModal()
			setErrMsg(null)
		}} size="xl">
			<Modal.Header>
				{isEcosystemData?.isEcosystemLead ? (
					<div>Requested {props.endorsementData?.type === EndorsementType.credDef ? "Credential Definition" : "Schema" }</div>
				) : (
					<div>View {props.endorsementData?.type === EndorsementType.credDef ? "Credential Definition" : "Schema"}</div>
				)}
			</Modal.Header>
			<div className="mt-3 mx-3 -mb-3">
				<AlertComponent
					message={errMsg}
					type={'failure'}
					onAlertClose={() => {
						setErrMsg(null);
					}}
				/>
			</div>
			<EndorsementCard
				cardTransitionDisabled={true}
				data={props.endorsementData}
				allAttributes={true}
			/>

			<div className="justify-between">
				<div className="flex justify-end">
					{isEcosystemData?.isEcosystemLead &&
						props.endorsementData?.status === EndorsementStatus.requested ? (
						<div className="flex gap-3 pt-1 pb-3">
							<button
								onClick={() => RejectEndorsement(props.endorsementData.id)}
								disabled={loadingReject}
								className="hover:bg-secondary-700  !ring-2 dark:text-white text-primary-700 font-medium rounded-lg text-sm dark:hover:text-primary-700 "
							>
								<span className='flex items-center rounded-md text-sm px-4 py-2'>
									{
										loadingReject &&
										<Spinner
											className='mr-2'
											color={'info'}
											size={'md'}

										/>
									}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M20.4848 3.51515C18.2172 1.24747 15.2071 0 12 0C8.79293 0 5.78283 1.24747 3.51515 3.51515C1.24747 5.78283 0 8.79293 0 12C0 15.2071 1.24747 18.2172 3.51515 20.4848C5.78283 22.7525 8.79293 24 12 24C15.2071 24 18.2172 22.7525 20.4848 20.4848C22.7525 18.2172 24 15.2071 24 12C24 8.79293 22.7525 5.78283 20.4848 3.51515ZM19.5202 19.5202C17.5101 21.5303 14.8384 22.6364 12 22.6364C9.16162 22.6364 6.4899 21.5303 4.4798 19.5202C0.333333 15.3737 0.333333 8.62626 4.4798 4.4798C6.4899 2.4697 9.16162 1.36364 12 1.36364C14.8384 1.36364 17.5101 2.4697 19.5202 4.4798C23.6667 8.62626 23.6667 15.3737 19.5202 19.5202Z"
											fill="#1F4EAD"
										/>
										<path
											d="M17.2882 6.71248C17.0206 6.4448 16.5913 6.4448 16.3236 6.71248L12.0004 11.0357L7.67712 6.71248C7.40945 6.4448 6.98015 6.4448 6.71248 6.71248C6.4448 6.98015 6.4448 7.40945 6.71248 7.67712L11.0357 12.0004L6.71248 16.3236C6.4448 16.5913 6.4448 17.0206 6.71248 17.2882C6.84379 17.4195 7.02056 17.4903 7.19227 17.4903C7.36399 17.4903 7.54076 17.4246 7.67207 17.2882L11.9953 12.965L16.3185 17.2882C16.4499 17.4195 16.6266 17.4903 16.7983 17.4903C16.9751 17.4903 17.1468 17.4246 17.2781 17.2882C17.5458 17.0206 17.5458 16.5913 17.2781 16.3236L12.965 12.0004L17.2882 7.67712C17.5559 7.40945 17.5559 6.98015 17.2882 6.71248Z"
											fill="#1F4EAD"
										/>
									</svg>
									<span className="ml-2 mr-2">Reject</span>
								</span>
							</button>

							<Button
								isProcessing={loading}
								color="bg-primary-800"
								disabled={loading}
								className="text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mr-3"
								onClick={() => {
									SignEndorsement(props.endorsementData.id);
								}}
							>
								<svg
									className="h-8 w-8 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span className='ml-2 mr-2'>
									Accept
								</span>
							</Button>
						</div>
					) : (
						<>
							{!isEcosystemData?.isEcosystemLead &&
								isEcosystemData?.isEcosystemMember &&
								props.endorsementData?.status === EndorsementStatus.signed ? (
								<div className="flex gap-3 pt-1 pb-3">
									<Button
										isProcessing={loading}
										color="bg-primary-800"
										disabled={loading}
										className="text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mr-3"
										onClick={() => {
											SubmitEndorsement(props.endorsementData.id);
										}}
									>
										<svg
											className="h-8 w-8 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="1"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span className='ml-2 mr-2'>
											Submit
										</span>
									</Button>
								</div>
							) : (
								<div className="flex gap-3 pt-1 pb-3 mr-3">
									<Button
										onClick={() => props.closeModal()}
										class="text-primary-700 hover:bg-secondary-700 bg-transparent ring-2 font-medium rounded-lg text-sm dark:text-white dark:hover:text-primary-700 "
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
										>
											<path
												d="M20.4848 3.51515C18.2172 1.24747 15.2071 0 12 0C8.79293 0 5.78283 1.24747 3.51515 3.51515C1.24747 5.78283 0 8.79293 0 12C0 15.2071 1.24747 18.2172 3.51515 20.4848C5.78283 22.7525 8.79293 24 12 24C15.2071 24 18.2172 22.7525 20.4848 20.4848C22.7525 18.2172 24 15.2071 24 12C24 8.79293 22.7525 5.78283 20.4848 3.51515ZM19.5202 19.5202C17.5101 21.5303 14.8384 22.6364 12 22.6364C9.16162 22.6364 6.4899 21.5303 4.4798 19.5202C0.333333 15.3737 0.333333 8.62626 4.4798 4.4798C6.4899 2.4697 9.16162 1.36364 12 1.36364C14.8384 1.36364 17.5101 2.4697 19.5202 4.4798C23.6667 8.62626 23.6667 15.3737 19.5202 19.5202Z"
												fill="#1F4EAD"
											/>
											<path
												d="M17.2882 6.71248C17.0206 6.4448 16.5913 6.4448 16.3236 6.71248L12.0004 11.0357L7.67712 6.71248C7.40945 6.4448 6.98015 6.4448 6.71248 6.71248C6.4448 6.98015 6.4448 7.40945 6.71248 7.67712L11.0357 12.0004L6.71248 16.3236C6.4448 16.5913 6.4448 17.0206 6.71248 17.2882C6.84379 17.4195 7.02056 17.4903 7.19227 17.4903C7.36399 17.4903 7.54076 17.4246 7.67207 17.2882L11.9953 12.965L16.3185 17.2882C16.4499 17.4195 16.6266 17.4903 16.7983 17.4903C16.9751 17.4903 17.1468 17.4246 17.2781 17.2882C17.5458 17.0206 17.5458 16.5913 17.2781 16.3236L12.965 12.0004L17.2882 7.67712C17.5559 7.40945 17.5559 6.98015 17.2882 6.71248Z"
												fill="#1F4EAD"
											/>
										</svg>

										<span className="ml-2 mr-2">Close</span>
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</Modal >
	);
};

export default EndorsementPopup;
