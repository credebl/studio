import { Button, Modal, Spinner } from 'flowbite-react';
import React, { useState } from 'react';
import { apiStatusCodes } from '../config/CommonConstant';
import type { RequestProof } from '../components/Verification/interface';
import { getVerificationList, verifyPresentation } from '../api/verification';
import type { AxiosResponse } from 'axios';
import type { object } from 'yup';
import { pathRoutes } from '../config/pathRoutes';

const ProofRequest = (props: {
	openModal: boolean;
	closeModal: (flag: boolean, id: string) => void;
	onSucess: (verifyPresentationId: string) => void;
	requestId: string;
	userData: object[];
	view:boolean
}) => {
	
	const [buttonLoader, setButtonLoader] = useState<boolean>(false);
	const [navigation, setNavigation] = useState(false);
	const [succesMsg, setSuccesMsg] = useState('');

	const handleConfirmClick = async (id: string) => {
		try {
			setButtonLoader(true);
			const response = await verifyPresentation(id);
			const { data } = response as AxiosResponse;
			if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
				setButtonLoader(false);
				setNavigation(true);
				setSuccesMsg(data?.message);
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setButtonLoader(false);
		}
	};

	const aggregatedData: { entity: string; properties: any[]; }[] = [];
	let credDefId = null;
	let schemaId = null;

	props?.userData?.forEach((item:object) => {
		const entity = Object.keys(item)[0];
		const propertyValue = item[entity];

		if (entity === 'credDefId') {
			credDefId = propertyValue;
		} else if (entity === 'schemaId') {
			schemaId = propertyValue;
		} else {
			const existingEntry = aggregatedData.find(
				(entry) => entry.entity === entity,
			);
			if (existingEntry) {
				existingEntry.properties.push(propertyValue);
			} else {
				aggregatedData.push({
					entity,
					properties: [propertyValue],
				});
			}
		}
	});

	return (
		<div>{
			!props.view ? 
		<Modal show={props.openModal} size="2xl">
			<div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
				<button
					onClick={() => {
						setButtonLoader(false);
						props.closeModal(false, '');
						{
							navigation === true
								? (window.location.href = `${pathRoutes.organizations.credentials}`)
								: '';
						}
					}}
					className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
				>
					<svg
						aria-hidden="true"
						className="w-5 h-5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						></path>
					</svg>
					<span className="sr-only">Close modal</span>
				</button>
				<div className="p-6 m-4">
				<p className="font-xl font-semibold m-1 p-1 flex justify-start">
						{' '}
						Please review the attributes before you confirm the
						verification
					</p>
					{
						!props.userData ? 
						 <div className="flex items-center justify-center m-4">
						<Spinner
							color="info"
						/>
					</div>
					:
				
					<div className=" text-gray-500 dark:text-gray-300 w-full">
						{aggregatedData?.map((item, index) => (
							<div key={index} className="flex justify-start w-full m-2 border">
								<div className="flex w-full">
									<div className="w-3/12 m-1 p-1 flex justify-start items-center">
										{item.entity}
									</div>
									<div className="w-1/12 m-1 p-1 flex  items-center">:</div>
									<div className="w-8/12 bg-cyan-100 m-1 p-1 text-green-900 flex flex-start items-center">
										{item.properties.join(', ')}
									</div>
								</div>
							</div>
						))}
						{props?.userData?.slice(0, 1).map((item, index) => (
							<div className="flex justify-start ml-2 w-full mt-6">
								<div key={index} className="w-full">
									<div className="flex flex-start mb-2 w-full ">
										<div className=" w-3/12 m-1 p-1 flex justify-start items-center">
											Schema Id
										</div>
										<div className=" w-1/12 flex items-center  p-1 m-1">:</div>{' '}
										<div className="w-8/12 m-1 p-1 flex-start items-center text-black">
											{' '}
											{Object.values(item)[2]}
										</div>
									</div>
									{Object.values(item)[1] ? (
										<div className="flex flex-start mb-2 w-full ">
											<div className=" w-3/12 m-1 p-1 flex justify-start items-center">
												{Object.values(item)[1] ? 'CredDef Id' : ''}
											</div>{' '}
											<div className=" w-1/12 flex items-center  m-1 p-1">
												{' '}
												:
											</div>{' '}
											<div className=" w-8/12 m-1 flrx flex-start p-1 items-center flex-wrap text-black">
												{Object.values(item)[1] ? Object.values(item)[1] : ''}
											</div>
										</div>
									) : (
										''
									)}
								</div>
							</div>
						))}
					</div>
									}
									</div>
				{succesMsg && (
					<div
						className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
						role="alert"
					>
						<span className="font-medium">Success alert! </span> {succesMsg}
					</div>
				)}

				<div className="flex justify-center items-center space-x-4">
					<button
						onClick={() => {
							setButtonLoader(false);
							props.closeModal(false, '');
							{
								navigation === true
									? (window.location.href = `${pathRoutes.organizations.credentials}`)
									: '';
							}
						}}
						style={{ height: '2.5rem', minWidth:"100px" }}
						className="py-1 px-2 medium text-center font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 "
					>
						{navigation ? "Close": "No, cancel"}
					</button>
					<Button
						isProcessing={buttonLoader}
						onClick={() => handleConfirmClick(props.requestId)}
						disabled={navigation || buttonLoader}
						className="py-1 px-2 medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
						style={{ height: '2.5rem', minWidth: '3rem' }}
					>
						Verify 
					</Button>
				</div>
			</div>
		</Modal>
		:
		<Modal show={props.openModal} size="2xl">
		<div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
			<button
				onClick={() => {
					setButtonLoader(false);
					props.closeModal(false, '');
					{
						navigation === true
							? (window.location.href = `${pathRoutes.organizations.credentials}`)
							: '';
					}
				}}
				className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
			>
				<svg
					aria-hidden="true"
					className="w-5 h-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clipRule="evenodd"
					></path>
				</svg>
				<span className="sr-only">Ok</span>
			</button>
			<div className="p-6 m-4">
			<p className="font-xl font-semibold m-1 p-1 flex flex-start">
					{' '}
				Verified Details
				</p>
				{
					!props.userData ? 
					 <div className="flex items-center justify-center m-4">
					<Spinner
						color="info"
					/>
				</div>
				:
			
				<div className=" text-gray-500 dark:text-gray-300 w-full">
					{aggregatedData?.map((item, index) => (
						<div key={index} className="flex justify-start w-full m-2 border">
							<div className="flex w-full">
								<div className="w-3/12 m-1 p-1 flex justify-start items-center">
									{item.entity}
								</div>
								<div className="w-1/12 m-1 p-1 flex  items-center">:</div>
								<div className="w-8/12 bg-cyan-100 m-1 p-1 text-green-900 flex flex-start items-center">
									{item.properties.join(', ')}
								</div>
							</div>
						</div>
					))}
					{props?.userData?.slice(0, 1).map((item, index) => (
						<div className="flex justify-start ml-2 w-full mt-6">
							<div key={index} className="w-full">
								<div className="flex flex-start mb-2 w-full ">
									<div className=" w-3/12 m-1 p-1 flex justify-start items-center">
										Schema Id
									</div>
									<div className=" w-1/12 flex items-center  p-1 m-1">:</div>{' '}
									<div className="w-8/12 m-1 p-1 flex-start items-center text-black">
										{' '}
										{Object.values(item)[2]}
									</div>
								</div>
								{Object.values(item)[1] ? (
									<div className="flex flex-start border mb-2 w-full ">
										<div className=" w-3/12 m-1 p-1 flex justify-start items-center">
											{Object.values(item)[1] ? 'CredDef Id' : ''}
										</div>{' '}
										<div className=" w-1/12 flex items-center  m-1 p-1">
											{' '}
											:
										</div>{' '}
										<div className=" w-8/12 m-1 flrx flex-start p-1 items-center flex-wrap text-black">
											{Object.values(item)[1] ? Object.values(item)[1] : ''}
										</div>
									</div>
								) : (
									''
								)}
							</div>
						</div>
					))}
				</div>
								}
								</div>

			<div className="flex justify-center items-center space-x-4">
				<button
					onClick={() => {
						setButtonLoader(false);
						props.closeModal(false, '');
					}}
					disabled={buttonLoader}
					style={{ height: '2.5rem', minWidth:"100px" }}
					className="py-1 px-2 
					text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
				>
					Ok
				</button>
			</div>
		</div>
	</Modal>
		}
		</div>
	);
};

export default ProofRequest;
