import { Button, Card, Modal } from 'flowbite-react';
import React, { useState } from 'react';
import { getVerificationList, verifyPresentation } from '../api/verification';

import type { AxiosResponse } from 'axios';
import CustomSpinner from '../components/CustomSpinner';
import type { RequestProof } from '../components/Verification/interface';
import { apiStatusCodes } from '../config/CommonConstant';
import type { object } from 'yup';
import { pathRoutes } from '../config/pathRoutes';

const ProofRequest = (props: {
	openModal: boolean;
	closeModal: (flag: boolean, id: string) => void;
	onSucess: (verifyPresentationId: string) => void;
	requestId: string;
	userData: object[];
	view: boolean;
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

	const aggregatedData: { entity: string; properties: any[] }[] = [];
	let credDefId = null;
	let schemaId = null;

	props?.userData?.forEach((item: object) => {
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

	const AttributesListData = (): JSX.Element => {
		return (
			<>
				<Card >
					<div className="flex h-full flex-col justify-center gap-0 sm:p-0">
						<div className="flex border-b">
							<div className="w-5/12 font-semibold flex justify-start truncate md:pl-1 sm:mr-8 md:mr-0 text-primary-700 dark:bg-gray-800 text-xl">
								Attributes
							</div>
							<div className="w-1/12 font-semibold flex justify-start truncate md:pl-1 sm:mr-8 md:mr-0 text-primary-700 dark:bg-gray-800 text-xl">
							</div>
							<div className="w-6/12 font-semibold flex justify-start truncate sm:pl-4 text-primary-700 dark:bg-gray-800 text-xl">
								{' '}
								Values
							</div>
						</div>

						{
							aggregatedData?.map((item, index) => (
								<div
									key={item.entity + 1}
									className="flex justify-start w-full"
								>
									<div
										className={`flex w-full text-lg`}
									>
										<div className="w-5/12 m-1 p-1 flex justify-start items-center text-gray-700 text-lg">
											{item.entity}
										</div>
										<div className="w-1/12 m-1 p-1 flex  items-center text-gray-700 text-lg">
											:
										</div>
										<div className="w-6/12 m-1 truncate p-1 flex flex-start items-center text-gray-700 text-lg">
											{item.properties.join(', ')}
										</div>
									</div>
								</div>
							))
						}

					</div>
				</Card>

			</>
		)
	}

	const SchemaCredDefDetails = () => {
		return (
			<>
				{props?.userData?.slice(0, 1).map((item, index) => (
					<div className="flex justify-start ml-2 w-full mt-6">
						<div key={Object.values(item)[2]} className="w-full">
							<div className="flex flex-start mb-2 w-full ">
								<div className=" w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center">
									Schema Id
								</div>
								<div className=" flex items-center p-1 m-1 ">:</div>{' '}
								<div className="w-9/12 m-1 flex justify-start truncate text-gray-600  items-center">
									{Object.values(item)[2]}
								</div>
							</div>
							{Object.values(item)[1] ? (
								<div className="flex flex-start mb-2 w-full ">
									<div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center">
										{Object.values(item)[1] ? 'CredDef Id' : ''}
									</div>{' '}
									<div className="flex items-center p-1 m-1">
										{' '}
										:
									</div>{' '}
									<div className="w-9/12 m-1 flex justify-start truncate text-gray-600  items-center">
										{Object.values(item)[1]
											? Object.values(item)[1].slice(0, 36)
											: ''}
									</div>
								</div>
							) : (
								''
							)}
						</div>
					</div>
				))}
			</>
		)
	}

	return (
		<div>
			{!props.view ? (
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
						<div className="sm:p-2 lg:p-6 m-4">
							<p className="text-xl text-gray-700 pb-2 dark:bg-gray-800 font-semibold flex flex-start">
								{' '}
								Verification Details
							</p>
							{!props.userData ? (
								<div className="flex items-center justify-center m-4">
									<CustomSpinner />

								</div>
							) : (
								<div className=" text-gray-500 dark:text-gray-300 w-full">
									<div className="mt-1">
										<AttributesListData />									
										<SchemaCredDefDetails/>								
									</div>
								</div>
							)}
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
								style={{ height: '2.5rem', minWidth: '100px' }}
								className="py-1 px-2 medium text-center font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 "
							>
								{navigation ? 'Close' : 'No, cancel'}
							</button>
							<Button
								isProcessing={buttonLoader}
								onClick={() => handleConfirmClick(props.requestId)}
								disabled={navigation || buttonLoader}
								className="py-1 px-2 medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								style={{ height: '2.5rem', minWidth: '3rem' }}
							>
								<svg className='pr-2 flex items-center' xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 17 17">
									<path fill="#fff" d="M15.749 6.99c-.334-.21-.813-.503-.813-.697.01-.397.113-.786.3-1.136.277-.69.561-1.395.204-1.915-.358-.519-1.122-.462-1.853-.405-.358.082-.73.082-1.089 0a2.74 2.74 0 0 1-.374-1.087c-.162-.739-.333-1.501-.942-1.704-.61-.203-1.154.3-1.699.811-.309.276-.723.65-.934.65-.212 0-.634-.374-.943-.65C7.07.362 6.51-.14 5.908.046c-.602.187-.805.933-.967 1.671-.05.383-.18.75-.382 1.08a2.295 2.295 0 0 1-1.09 0c-.722-.066-1.478-.13-1.844.405-.365.535-.081 1.225.195 1.914.19.35.295.739.31 1.136-.066.195-.521.487-.854.698C.65 7.34 0 7.76 0 8.41c0 .649.65 1.07 1.276 1.468.333.211.812.495.853.69-.014.4-.12.791-.309 1.144-.276.69-.56 1.395-.195 1.914.366.52 1.122.463 1.845.398a2.441 2.441 0 0 1 1.089.04c.2.33.33.697.382 1.08.162.738.333 1.508.934 1.711a.86.86 0 0 0 .277.106 2.439 2.439 0 0 0 1.422-.812c.308-.275.731-.657.942-.657.212 0 .626.382.935.657.544.487 1.105.998 1.698.812.593-.187.813-.974.943-1.712a2.69 2.69 0 0 1 .374-1.08 2.472 2.472 0 0 1 1.089-.04c.73.065 1.479.138 1.852-.397.374-.536.073-1.225-.203-1.915a2.585 2.585 0 0 1-.3-1.144c.056-.194.511-.478.812-.69C16.35 9.587 17 9.174 17 8.517c0-.658-.618-1.136-1.251-1.526Zm-.431 2.248c-.537.332-1.04.649-1.195 1.135a2.73 2.73 0 0 0 .325 1.68c.155.373.399.99.293 1.151-.106.163-.731.09-1.113.057a2.393 2.393 0 0 0-1.626.203 2.594 2.594 0 0 0-.682 1.55c-.082.365-.236 1.054-.406 1.111-.171.057-.667-.422-.894-.625a2.585 2.585 0 0 0-1.48-.868c-.58.11-1.105.417-1.486.868-.22.203-.756.674-.894.625-.138-.049-.325-.746-.407-1.111a2.594 2.594 0 0 0-.674-1.55 1.522 1.522 0 0 0-.95-.243 7.016 7.016 0 0 0-.708.04c-.374 0-1.008.09-1.105-.056-.098-.146.097-.78.26-1.112.285-.51.4-1.1.325-1.68-.146-.486-.65-.81-1.186-1.135-.358-.227-.902-.568-.902-.811 0-.244.544-.552.902-.811.536-.333 1.04-.658 1.186-1.136a2.754 2.754 0 0 0-.325-1.688c-.163-.348-.398-.973-.284-1.127.113-.154.73-.09 1.105-.057.549.122 1.123.05 1.625-.203.392-.427.629-.972.674-1.55.082-.364.236-1.054.407-1.11.17-.058.674.421.894.624.381.45.907.753 1.487.86a2.569 2.569 0 0 0 1.479-.86c.227-.203.756-.673.894-.625.138.049.325.747.406 1.112.048.578.288 1.123.682 1.55a2.397 2.397 0 0 0 1.626.202c.382 0 1.007-.09 1.113.057.106.146-.138.811-.292 1.144a2.755 2.755 0 0 0-.326 1.687c.155.479.659.811 1.195 1.136.357.227.902.568.902.811 0 .243-.488.527-.845.755Z" />
									<path fill="#fff" d="m11.253 6.126-3.78 3.943-1.687-1.403a.473.473 0 0 0-.149-.08.556.556 0 0 0-.352 0 .473.473 0 0 0-.148.08.377.377 0 0 0-.101.12.306.306 0 0 0 0 .284.377.377 0 0 0 .101.12l2.002 1.7a.459.459 0 0 0 .152.083.548.548 0 0 0 .181.027.601.601 0 0 0 .19-.043.499.499 0 0 0 .153-.097l4.105-4.284a.312.312 0 0 0 .074-.265.365.365 0 0 0-.174-.234.55.55 0 0 0-.632.049h.065Z" />
								</svg>
								Verify
							</Button>
						</div>
					</div>
				</Modal>
			) : (
				<Modal show={props.openModal} size="2xl">
					<div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
						<button
							onClick={() => {
								setButtonLoader(false);
								props.closeModal(false, '');
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
						<div className="sm:p-2 lg:p-6 m-4">
							<p className="text-xl font-semibold text-gray-700 dark:bg-gray-800 flex flex-start pb-2">
								Verified Details
							</p>
							{!props.userData ? (
								<div className="flex items-center justify-center m-4">
									<CustomSpinner />
								</div>
							) : (
								<div className=" text-gray-500 dark:text-gray-300 w-full">
									<div className="mt-1">
										<AttributesListData />										

										<SchemaCredDefDetails/>								
									</div>
								</div>
							)}

						</div>
						<div className="flex justify-center items-center space-x-4">
							<button
								onClick={() => {
									setButtonLoader(false);
									props.closeModal(false, '');
								}}
								className="py-1 px-2 medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								style={{ height: '2.5rem', minWidth: '100px' }}
							>
								Close
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default ProofRequest;
