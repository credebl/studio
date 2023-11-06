import * as yup from 'yup';

import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import {
	IMG_MAX_HEIGHT,
	IMG_MAX_WIDTH,
	apiStatusCodes,
	imageSizeAccepted,
	storageKeys,
} from '../../config/CommonConstant';
import { calculateSize, dataURItoBlob } from '../../utils/CompressImage';
import { useEffect, useState } from 'react';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import { asset } from '../../lib/data.js';
import { createOrganization } from '../../api/organization';
import { getFromLocalStorage } from '../../api/Auth';
import { createEcosystems } from '../../api/ecosystem';
import { getOrgDetails } from '../../config/ecosystem';
import defaultUserIcon from '../../../public/images/person_FILL1_wght400_GRAD0_opsz24.svg';
interface Values {
	name: string;
	description: string;
}

interface ILogoImage {
	logoFile: string | File;
	imagePreviewUrl: string | ArrayBuffer | null | File;
	fileName: string;
}
interface EcoValues {
	name: string;
	description: string;
    autoEndorsement: boolean;
}

interface IProps {
	openModal: boolean;
	isorgModal: boolean;
	setMessage?: (message: string) => void;
	setOpenModal: (flag: boolean) => void;
}

const CreateEcosystemOrgModal = (props: IProps) => {
	const [logoImage, setLogoImage] = useState<ILogoImage>({
		logoFile: '',
		imagePreviewUrl: '',
		fileName: '',
	});

	const [loading, setLoading] = useState<boolean>(false);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
        autoEndorsement: false
	});
	const [errMsg, setErrMsg] = useState<string | null>(null);

	const [imgError, setImgError] = useState('');
    const [autoEndorse, setautoEndorse] = useState(false)

	const initialFormData = formData;
	useEffect(() => {
		setFormData({
			name: '',
			description: '',
            autoEndorsement: false
		});
		setLogoImage({
			...logoImage,
			logoFile: '',
			imagePreviewUrl: '',
		});
	}, [props.openModal]);

	const ProcessImg = (e: any): string | undefined => {
		const imgfile = e?.target.files[0];
		if (!imgfile) {
			return;
		}

		const imgreader = new FileReader();
		imgreader.readAsDataURL(imgfile);

		imgreader.onload = (event): void => {
			const imgElement = document.createElement('img');
			if (imgElement) {
				imgElement.src =
					typeof event?.target?.result === 'string' ? event.target.result : '';
				imgElement.onload = (e): void => {
					let fileUpdated: File | string = imgfile;
					let srcEncoded = '';
					const canvas = document.createElement('canvas');

					const { width, height, ev } = calculateSize(
						imgElement,
						IMG_MAX_WIDTH,
						IMG_MAX_HEIGHT,
					);
					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext('2d');
					if (ctx && e?.target) {
						ctx.imageSmoothingEnabled = true;
						ctx.imageSmoothingQuality = 'high';
						ctx.drawImage(ev, 0, 0, canvas.width, canvas.height);
						srcEncoded = ctx.canvas.toDataURL(ev, imgfile.type);
						const blob = dataURItoBlob(srcEncoded, imgfile.type);
						fileUpdated = new File([blob], imgfile.name, {
							type: imgfile.type,
							lastModified: new Date().getTime(),
						});
						setLogoImage({
							logoFile: fileUpdated,
							imagePreviewUrl: srcEncoded,
							fileName: imgfile.name,
						});
					}
				};
			}
		};
	};

	const isEmpty = (object: any): boolean => {
		return true;
	};
	const handleImageChange = (event: any): void => {
		setImgError('');
		const reader = new FileReader();
		const file = event?.target?.files;

		const imgfieSize = Number((file[0]?.size / 1024 / 1024)?.toFixed(2));
		const extension = file[0]?.name
			?.substring(file[0]?.name?.lastIndexOf('.') + 1)
			?.toLowerCase();
		if (extension === 'png' || extension === 'jpeg' || extension === 'jpg') {
			if (imgfieSize <= imageSizeAccepted) {
				reader.onloadend = (): void => {
					ProcessImg(event);
					isEmpty(reader.result);
				};
				reader.readAsDataURL(file[0]);
				event.preventDefault();
			} else {
				setImgError('Please check image size');
			}
		} else {
			setImgError('Invalid image type');
		}
	};

	const submitCreateOrganization = async (values: Values) => {
		setLoading(true);

		const orgData = {
			name: values.name,
			description: values.description,
			logo: (logoImage?.imagePreviewUrl as string) || '',
			website: '',
		};
		const resCreateOrg = await createOrganization(orgData);

		const { data } = resCreateOrg as AxiosResponse;
		setLoading(false);

		if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
			if (props.setMessage) {
				props.setMessage(data?.message);
			}
			props.setOpenModal(false);
		} else {
			setErrMsg(resCreateOrg as string);
		}
	};
	const submitCreateEcosystem = async (values: EcoValues) => {
		try {
			setLoading(true);
			const orgDetails = await getOrgDetails();
			const user_data = JSON.parse(
				await getFromLocalStorage(storageKeys.USER_PROFILE),
			);
			const ecoData = {
				name: values.name,
				description: values.description,
				logo: (logoImage?.imagePreviewUrl as string) || '',
				tags: '',
				userId: Number(user_data?.id),
				orgName: orgDetails?.orgName,
				orgDid: orgDetails?.orgDid,
                autoEndorsement: autoEndorse,
                
			};
			const resCreateEco = await createEcosystems(ecoData);

			const { data } = resCreateEco as AxiosResponse;
			setLoading(false);

			if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
				if (props.setMessage) {
					props.setMessage(data?.message);
				}
				props.setOpenModal(false);
			} else {
				setErrMsg(resCreateEco as string);
			}
		} catch (error) {
			console.error('An error occurred:', error);
			setLoading(false);
		}
	};

	const submit = (values: EcoValues | Values) => {
		if (props.isorgModal) {
			submitCreateOrganization(values);
		} else {
			submitCreateEcosystem(values);
		}
	};

	const orgErrorMsg = {
		name: yup
			.string()
			.min(2, 'Organization name must be at least 2 characters')
			.max(50, 'Organization name must be at most 50 characters')
			.required('Organization name is required')
			.trim(),
		description: yup
			.string()
			.min(2, 'Description must be at least 2 characters')
			.max(255, 'Description must be at most 255 characters')
			.required('Description is required'),
	};

	const ecoErrorMsg = {
		name: yup
			.string()
			.min(2, 'Ecosystem name must be at least 2 characters')
			.max(50, 'Ecosystem name must be at most 50 characters')
			.required('Ecosystem name is required')
			.trim(),
		description: yup
			.string()
			.min(2, 'Description must be at least 2 characters')
			.max(255, 'Description must be at most 255 characters')
			.required('Description is required'),
            
	};
	const renderEcosystemModal = () => {
		const popupName = props.isorgModal ? 'Organization' : 'Ecosystem';
		return (
			<Modal
				show={props.openModal}
				onClose={() => {
					setLogoImage({
						logoFile: ' ',
						imagePreviewUrl: ' ',
						fileName: ' ',
					});
					setFormData({
						name: ' ',
						description: ' ',
                        autoEndorsement: false
					});
					props.setOpenModal(false);
				}}
			>
				<Modal.Header>Create {popupName}</Modal.Header>
				<Modal.Body>
					<AlertComponent
						message={errMsg}
						type={'failure'}
						onAlertClose={() => {
							setErrMsg(null);
						}}
					/>
					<Formik
						initialValues={formData}
						validationSchema={yup.object().shape(props.isorgModal ? { ...orgErrorMsg } : {...ecoErrorMsg} )}
						validateOnBlur
						validateOnChange
						enableReinitialize
						onSubmit={async (
							values: Values,
							{ resetForm }: FormikHelpers<Values>,
						) => {
							submit(values);
							resetForm();
						}}
					>
						{(formikHandlers): JSX.Element => (
							<Form
								className="space-y-6"
								onSubmit={formikHandlers.handleSubmit}
							>
								<div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
									<div className="items-center sm:flex 2xl:flex sm:space-x-4 xl:space-x-4 2xl:space-x-4">
										{typeof logoImage.logoFile === 'string' ? (
											<Avatar size="lg" img={defaultUserIcon} />
										) : (
											<img
												className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
												src={
													typeof logoImage.logoFile === 'string'
														? asset('images/users/bonnie-green-2x.png')
														: URL.createObjectURL(logoImage.logoFile)
												}
												alt="Jese picture"
											/>
										)}

										<div>
											<h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
												{popupName} Logo
											</h3>
											<div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
												JPG, JPEG and PNG . Max size of 1MB
											</div>
											<div className="flex items-center space-x-4">
												<div>
													<label htmlFor="organizationlogo">
														<div className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-center rounded-lg">
															Choose file
														</div>
														<input
															type="file"
															accept="image/*"
															name="file"
															className="hidden"
															id="organizationlogo"
															title=""
															onChange={(event): void =>
																handleImageChange(event)
															}
														/>
														{imgError ? (
															<div className="text-red-500">{imgError}</div>
														) : (
															<span className="mt-1  text-sm text-gray-500 dark:text-gray-400">
																{logoImage.fileName || 'No File Chosen'}
															</span>
														)}
													</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="name" value="Name" />
										<span className="text-red-500 text-xs">*</span>
									</div>
									<Field
										id="name"
										name="name"
										value={formikHandlers.values.name}
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										placeholder={`Enter ${popupName} Name`}
										onChange={(e) => {
											const value = e.target.value;
											formikHandlers.setFieldValue('name', value);
											formikHandlers.setFieldTouched('name', true);

											if (value.length > 50) {
												formikHandlers.setFieldError(
													'name',
													props.isorgModal
														? 'Organization name must be at most 50 characters'
														: 'Ecosystem name must be at most 50 characters',
												);
											} else {
												formikHandlers.setFieldError('name', undefined);
											}
										}}
									/>
									{formikHandlers?.errors?.name &&
										formikHandlers?.touched?.name && (
											<span className="text-red-500 text-xs">
												{formikHandlers?.errors?.name}
											</span>
										)}
								</div>
								<div>
									<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="description" value="Description" />
										<span className="text-red-500 text-xs">*</span>
									</div>

									<Field
										id="description"
										name="description"
										value={formikHandlers.values.description}
										as="textarea"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
										placeholder={`Enter ${popupName} Description`}
										onChange={(e) => {
											const value = e.target.value;
											formikHandlers.setFieldValue('description', value);
											formikHandlers.setFieldTouched('description', true);

											if (value.length > 50) {
												formikHandlers.setFieldError(
													'description',
													'Description must be at most 255 characters',
												);
											} else {
												formikHandlers.setFieldError('description', undefined);
											}
										}}
									/>
									{formikHandlers?.errors?.description &&
										formikHandlers?.touched?.description && (
											<span className="text-red-500 text-xs">
												{formikHandlers?.errors?.description}
											</span>
										)}
								</div>

								{!props.isorgModal && (
									<div>
										<Label
											htmlFor="name"
											value="Endorsement Transaction Type"
										/>
										<div>
											<input
												className=""
												type="radio"
												id="autoEndorsement"
												name="autoEndorsement"
                                                checked={autoEndorse === false}
                                                onChange={() => setautoEndorse(false)}
											/>
											<span className="ml-2 text-gray-900 dark:text-white text-sm">
												Sign
												
											</span>
										</div>

										<div>
											<input
												className=""
												type="radio"
												id="autoEndorsement"
												name="autoEndorsement"
                                                checked={autoEndorse === true}
                                                onChange={() => setautoEndorse(true)}
											/>
											<span className="ml-2 text-gray-900 dark:text-white text-sm">
												Sign and Submit
												
											</span>
										</div>
									</div>
								)}
								<Button
									type="submit"
									isProcessing={loading}
									className="float-right text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
								>
									<svg
										className="pr-2"
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											fill="#fff"
											d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
										/>
									</svg>
									Create
								</Button>
							</Form>
						)}
					</Formik>
				</Modal.Body>
			</Modal>
		);
	};
	return <>{renderEcosystemModal()}</>;
};

export default CreateEcosystemOrgModal;
