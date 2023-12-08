import { Alert, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import DeviceDetails from '../../commonComponents/DeviceDetailsCard';
import PasskeyAddDevice from '../../commonComponents/PasseyAddDevicePopup';
import {
	addDeviceDetails,
	generateRegistrationOption,
	getUserDeviceDetails,
	verifyRegistration,
} from '../../api/Fido';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { apiRoutes } from '../../config/apiRoutes';
import { startRegistration } from '@simplewebauthn/browser';
import { getFromLocalStorage } from '../../api/Auth';
import CustomSpinner from '../CustomSpinner';
import type {
	IDeviceData,
	IdeviceBody,
	RegistrationOptionInterface,
	VerifyRegistrationObjInterface,
} from './interfaces';
import type { AxiosError, AxiosResponse } from 'axios';
import { AlertComponent } from '../AlertComponent';

interface IResponseMessages {type: "error" | "success", message: string}

const AddPasskey = ({ responseMessages }: { responseMessages: (value: IResponseMessages) => IResponseMessages }) => {
	const [fidoError, setFidoError] = useState('');
	const [fidoLoader, setFidoLoader] = useState(true);
	const [OrgUserEmail, setOrgUserEmail] = useState<string>('');
	const [deviceList, setDeviceList] = useState<IDeviceData[]>([]);
	const [addSuccess, setAddSuccess] = useState<string | null>(null);
	const [editSuccess, setEditSuccess] = useState<string | null>(null);
	const [editFailure, setEditFailure] = useState<string | null>(null);
	const [addfailure, setAddFailure] = useState<string | null>(null);
	const [disableFlag, setDisableFlag] = useState<boolean>(false);

	const [openModel, setOpenModel] = useState<boolean>(false);

	const props = { openModel, setOpenModel };
	const setProfile = async () => {
		const UserEmail = await getFromLocalStorage(storageKeys.USER_EMAIL);
		setOrgUserEmail(UserEmail);
		return UserEmail;
	};

	const showFidoError = (error: unknown): void => {
		const err = error as AxiosError;
		if (
			err.message.includes('The operation either timed out or was not allowed')
		) {
			const [errorMsg] = err.message.split('.');
			setFidoError(errorMsg);
		} else {
			setFidoError(err.message);
		}
	};

	const addDevice = async (): Promise<void> => {
		try {
			setOpenModel(true);
		} catch (error) {
			setFidoLoader(false);
		}
	};

	const registerWithPasskey = async (flag: boolean): Promise<void> => {
		try {
			const RegistrationOption: RegistrationOptionInterface = {
				userName: OrgUserEmail,
				deviceFlag: flag,
			};
			// Generate Registration Option
			const generateRegistrationResponse = await generateRegistrationOption(
				RegistrationOption,
			);
			const { data } = generateRegistrationResponse as AxiosResponse;
			const opts = data?.data;
			const challangeId = data?.data?.challenge;
			if (opts) {
				opts.authenticatorSelection = {
					residentKey: 'preferred',
					requireResidentKey: false,
					userVerification: 'preferred',
				};
			}
			setOpenModel(false);
			const attResp = await startRegistration(opts);

			const verifyRegistrationObj = {
				...attResp,
				challangeId,
			};
			await verifyRegistrationMethod(verifyRegistrationObj, OrgUserEmail);
		} catch (error) {
			showFidoError(error);
		}
	};

	const verifyRegistrationMethod = async (
		verifyRegistrationObj: VerifyRegistrationObjInterface,
		OrgUserEmail: string,
	) => {
		try {
			const verificationRegisterResp = await verifyRegistration(
				verifyRegistrationObj,
				OrgUserEmail,
			);
			const { data } = verificationRegisterResp as AxiosResponse;
			const credentialID = data?.data?.newDevice?.credentialID;

			if (data?.data?.verified) {
				let platformDeviceName = '';

				if (
					verifyRegistrationObj?.authenticatorAttachment === 'cross-platform'
				) {
					platformDeviceName = 'Passkey';
				} else {
					platformDeviceName = navigator.platform;
				}

				const deviceBody: IdeviceBody = {
					userName: OrgUserEmail,
					credentialId: encodeURIComponent(credentialID),
					deviceFriendlyName: platformDeviceName,
				};
				await addDeviceDetailsMethod(deviceBody);
			}
		} catch (error) {
			showFidoError(error);
		}
	};

	const addDeviceDetailsMethod = async (deviceBody: IdeviceBody) => {
		try {
			const deviceDetailsResp = await addDeviceDetails(deviceBody);
			const { data } = deviceDetailsResp as AxiosResponse;
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				setAddSuccess('Device added successfully');
				userDeviceDetails();
			} else {
				setAddFailure(deviceDetailsResp as string);
			}
		} catch (error) {
			showFidoError(error);
		}
	};

	//userDeviceDetails on page reload
	const userDeviceDetails = async (): Promise<void> => {
		try {
			setFidoLoader(true);

			const userDeviceDetailsResp = await getUserDeviceDetails(OrgUserEmail);
			const { data } = userDeviceDetailsResp as AxiosResponse;
			setFidoLoader(false);
			if (userDeviceDetailsResp) {
				const deviceDetails =
					Object.keys(data)?.length > 0
						? userDeviceDetailsResp?.data?.data.map((data) => {
								data.lastChangedDateTime = data.lastChangedDateTime
									? data.lastChangedDateTime
									: '-';
								return data;
						  })
						: [];
				if (data?.data?.length === 1) {
					setDisableFlag(true);
				} else {
					setDisableFlag(false);
				}
				setDeviceList(deviceDetails);
			}
		} catch (error) {
			setAddFailure('Error while fetching the device details');
			setFidoLoader(false);
		}
	};
	useEffect(() => {
		if (OrgUserEmail) {
			userDeviceDetails();
		} else {
			setProfile();
		}
	}, [OrgUserEmail]);

	return (
		<div className="h-full">
			{(addSuccess || addfailure || fidoError) && (
				<div className="p-2">
					<Alert
						color={addSuccess ? 'success' : 'failure'}
						onDismiss={() => {
							setAddSuccess(null);
							setFidoError('');
							setAddFailure('');
						}}
					>
						<span>
							<p>{addSuccess || addfailure || fidoError}</p>
						</span>
					</Alert>
				</div>
			)}
			<div className="page-container relative h-full flex flex-auto flex-col p-3 sm:p-4">
				<div className="w-full mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
					<div className="px-6 py-6">
						{fidoLoader ? (
							<div className="flex items-center justify-center mb-4">
								<CustomSpinner />
							</div>
						) : (
							<form action="#">
								<div className="form-container">
									<div>
										<h1 className="text-gray-500 text-xl font-medium font-montserrat dark:text-white">
											Add Passkey
										</h1>
										<p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal dark:text-white">
											With Passkey, no complex passwords to remember.
										</p>
									</div>

									{(editSuccess || editFailure) && (
										<AlertComponent
										message={editSuccess ?? editFailure}
										type={editSuccess ? 'success' : 'error'}
										onAlertClose={() => {
											setEditSuccess(null);
											setEditFailure(null);
										}}
									/>
									)}

									{deviceList &&
										deviceList.length > 0 &&
										deviceList.map((element) => (
											<div key={element['credentialId']}>
												<DeviceDetails
												deviceFriendlyName={element['deviceFriendlyName']}
												createDateTime={element['createDateTime']}
												credentialID={element['credentialId']}
												refreshList={userDeviceDetails}
												disableRevoke={disableFlag}
												responseMessages={(value) => {
													if (value.type === 'success') {
													  setEditSuccess(value.message);
													} else {
													  setEditFailure(value.message);
													}
												  }}
											/>
												</div>
										))}

									<div>
										<Button
											onClick={addDevice}
											type="button"
											color="bg-primary-800"
											className='mt-10 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="mr-4"
												width="18"
												height="18"
												fill="none"
												viewBox="0 0 18 18"
											>
												<path
													stroke="#fff"
													d="M11.03 4.32a3.82 3.82 0 1 1-7.64 0 3.82 3.82 0 0 1 7.64 0Zm6.473 4.047a2.94 2.94 0 0 1-.486 1.62c-.315.476-.76.838-1.273 1.044l-.691.276.517.535.812.842-1.053 1.091-.335.348.335.347 1.053 1.091-1.619 1.678-.888-.92v-5.241l-.28-.138a2.774 2.774 0 0 1-1.098-.98 2.958 2.958 0 0 1-.168-2.917c.226-.455.566-.838.98-1.109a2.65 2.65 0 0 1 2.775-.081 2.79 2.79 0 0 1 1.038 1.05c.25.443.383.948.38 1.463Zm-1.55-1.761-.42.27.42-.27a1.434 1.434 0 0 0-.638-.542 1.396 1.396 0 0 0-1.566.32 1.491 1.491 0 0 0-.305 1.578c.105.265.286.494.52.656a1.403 1.403 0 0 0 1.813-.183 1.484 1.484 0 0 0 .175-1.83Zm-7.48 3.934c.664 0 1.32.122 1.934.359a5.18 5.18 0 0 0 1.332 1.626v4.213H.5v-1.3c0-1.291.537-2.535 1.5-3.456a5.284 5.284 0 0 1 3.649-1.443h2.824Z"
												/>
											</svg>
											Add Passkey
										</Button>
									</div>

									<PasskeyAddDevice
										openModal={openModel}
										setOpenModel={props.setOpenModel}
										closeModal={function (flag: boolean): void {
											throw new Error('Function not implemented.');
										}}
										registerWithPasskey={registerWithPasskey}
									/>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddPasskey;
