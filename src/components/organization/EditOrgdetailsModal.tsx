import * as yup from 'yup';
import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import {
	IMG_MAX_HEIGHT,
	IMG_MAX_WIDTH,
	apiStatusCodes,
	imageSizeAccepted,
} from '../../config/CommonConstant';
import { calculateSize, dataURItoBlob } from '../../utils/CompressImage';
import React, { useEffect, useState } from 'react';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import { updateOrganization } from '../../api/organization';
import type { Organisation } from './interfaces';
import defaultUserIcon from '../../../public/images/person_FILL1_wght400_GRAD0_opsz24.svg';

interface Values {
	website: any;
	name: string;
	description: string;
}
interface ILogoImage {
	logoFile: string | File;
	imagePreviewUrl: string | ArrayBuffer | null | File;
	fileName: string;
}
interface EditOrgdetailsModalProps {
	openModal: boolean;
	setMessage: (message: string) => void;
	setOpenModal: (flag: boolean) => void;
	onEditSucess?: () => void;
	orgData: Organisation | null;
}

const EditOrgdetailsModal = (props: EditOrgdetailsModalProps) => {
	const [logoImage, setLogoImage] = useState<ILogoImage>({
		logoFile: '',
		imagePreviewUrl: props?.orgData?.logoUrl ?? '',
		fileName: '',
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [isPublic, setIsPublic] = useState<boolean>();
	const [initialOrgData, setInitialOrgData] = useState({
		name: props?.orgData?.name ?? '',
		description: props?.orgData?.description ?? '',
		website: props?.orgData?.website ?? '',
	});

	useEffect(() => {
		if (props.orgData) {
			setInitialOrgData({
				name: props.orgData.name ?? '',
				description: props.orgData.description ?? '',
				website: props?.orgData?.website ?? '',
			});

			setLogoImage({
				logoFile: '',
				imagePreviewUrl: props.orgData.logoUrl ?? '',
				fileName: '',
			});

			setIsPublic(props?.orgData?.publicProfile);
		}
	}, [props]);

	const [erroMsg, setErrMsg] = useState<string | null>(null);

	const [imgError, setImgError] = useState('');

	useEffect(() => {
		if (props.openModal === false) {
			setInitialOrgData({
				name: '',
				description: '',
				website: '',
			});

			setLogoImage({
				...logoImage,
				logoFile: '',
				imagePreviewUrl: '',
			});
		}
	}, [props.openModal]);

	const ProcessImg = (e: any): string | undefined => {
		const file = e?.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = (event): void => {
			const imgElement = document.createElement('img');
			if (imgElement) {
				imgElement.src =
					typeof event?.target?.result === 'string' ? event.target.result : '';
				imgElement.onload = (e): void => {
					let fileUpdated: File | string = file;
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
						srcEncoded = ctx.canvas.toDataURL(ev, file.type);
						const blob = dataURItoBlob(srcEncoded, file.type);
						fileUpdated = new File([blob], file.name, {
							type: file.type,
							lastModified: new Date().getTime(),
						});
						setLogoImage({
							logoFile: fileUpdated,
							imagePreviewUrl: srcEncoded,
							fileName: file.name,
						});
					}
				};
			}
		};
	};

	const isEmpty = (object: any): boolean => {
		for (const property in object) {
			return false;
		}
		return true;
	};
	const handleImageChange = (event: any): void => {
		setImgError('');
		const reader = new FileReader();
		const file = event?.target?.files;

		const fieSize = Number((file[0]?.size / 1024 / 1024)?.toFixed(2));
		const extension = file[0]?.name
			?.substring(file[0]?.name?.lastIndexOf('.') + 1)
			?.toLowerCase();
		if (extension === 'png' || extension === 'jpeg' || extension === 'jpg') {
			if (fieSize <= imageSizeAccepted) {
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

	const submitUpdateOrganization = async (values: Values) => {
		setLoading(true);

		const orgData = {
			orgId: props?.orgData?.id,
			name: values.name,
			description: values.description,
			logo: (logoImage?.imagePreviewUrl as string) || props?.orgData?.logoUrl,
			website: values.website,
			isPublic: isPublic,
		};

		const resUpdateOrg = await updateOrganization(
			orgData,
			orgData.orgId?.toString() as string,
		);

		const { data } = resUpdateOrg as AxiosResponse;
		setLoading(false);

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			if (props?.onEditSucess) {
				props?.onEditSucess();
			}
			props.setOpenModal(false);
		} else {
			setErrMsg(resUpdateOrg as string);
		}
	};

	return (
		<Modal
			show={props.openModal}
			onClose={() => {
				setLogoImage({
					logoFile: '',
					imagePreviewUrl: '',
					fileName: '',
				});
				props.setOpenModal(false);
			}}
		>
			<Modal.Header>Edit Organization</Modal.Header>
			<Modal.Body>
				<AlertComponent
					message={erroMsg}
					type={'failure'}
					onAlertClose={() => {
						setErrMsg(null);
					}}
				/>
				<Formik
					initialValues={initialOrgData}
					validationSchema={yup.object().shape({
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
					})}
					validateOnBlur
					validateOnChange
					enableReinitialize
					onSubmit={async (
						values: Values,
						{ resetForm }: FormikHelpers<Values>,
					) => {
						submitUpdateOrganization(values);
						window.location.reload();
					}}
				>
					{(formikHandlers): JSX.Element => (
						<Form className="space-y-6" onSubmit={formikHandlers.handleSubmit}>
							<div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
								<div className="flex flex-col items-center sm:flex-row 2xl:flex-row p-2 gap-0 sm:gap-4">
									{typeof logoImage.logoFile === 'string' &&
									props?.orgData?.logoUrl ? (
										<img
											className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
											src={props?.orgData?.logoUrl}
											alt="Jese picture"
										/>
									) : typeof logoImage.logoFile === 'string' ? (
										<Avatar size="lg" img={defaultUserIcon} />
									) : (
										<img
											className="m-2 rounded-md w-28 h-28"
											src={URL.createObjectURL(logoImage?.logoFile)}
											alt="Jese picture"
										/>
									)}
									<div>
										<h3 className="flex items-center justify-center sm:justify-start mb-1 text-xl font-bold text-gray-900 dark:text-white">
											Organization Logo
										</h3>
										<div className="flex items-center justify-center sm:justify-start mb-4 text-sm text-gray-500 dark:text-gray-400">
											JPG, JPEG and PNG . Max size of 1MB
										</div>
										<div className="flex items-center space-x-4 justify-center sm:justify-start">
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
														onChange={(event): void => handleImageChange(event)}
													/>
													{!imgError ? (
														<span className="mt-1 flex justify-center text-sm text-gray-500 dark:text-gray-400">
															{logoImage.fileName || 'No File Chosen'}
														</span>
													) : (
														<div className="text-red-500">{imgError}</div>
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
									placeholder="Your organization name"
									onChange={(e) => {
										const value = e.target.value;
										formikHandlers.setFieldValue('name', value);
										formikHandlers.setFieldTouched('name', true, false);

										if (value.length > 50) {
											formikHandlers.setFieldError(
												'name',
												'Organization name must be at most 50 characters',
											);
										}
									}}
								/>
								{formikHandlers?.errors &&
									formikHandlers?.errors?.name &&
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
									placeholder="Description of your organization"
									onChange={(e) => {
										const value = e.target.value;
										formikHandlers.setFieldValue('description', value);
										formikHandlers.setFieldTouched('description', true);

										if (value.length > 50) {
											formikHandlers.setFieldError(
												'description',
												'Description must be at most 50 characters',
											);
										} else {
											formikHandlers.setFieldError('description', undefined);
										}
									}}
								/>
								{formikHandlers?.errors &&
									formikHandlers?.errors?.description &&
									formikHandlers?.touched &&
									formikHandlers?.touched?.description && (
										<span className="text-red-500 text-xs">
											{formikHandlers?.errors?.description}
										</span>
									)}
							</div>
							<div>
								<div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									<Label htmlFor="website" value="Website URL" />
								</div>
								<Field
									id="website"
									name="website"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									placeholder="Add org URL"
								/>
							</div>
							<div className="mx-2 grid ">
								<div>
									<div className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="name" value="" />
									</div>
									<input
										className=""
										type="radio"
										checked={isPublic === false}
										onChange={() => setIsPublic(false)}
										id="private"
										name="private"
									/>
									<span className="ml-2 text-gray-900 dark:text-white">
										Private
										<span className="block pl-6 text-gray-500 text-sm">
											Only the connected organization can see your organization
											details
										</span>
									</span>
								</div>
								<div>
									<div className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
										<Label htmlFor="name" value="" />
									</div>
									<input
										className=""
										type="radio"
										onChange={() => setIsPublic(true)}
										checked={isPublic === true}
										id="public"
										name="public"
									/>
									<span className="ml-2 text-gray-900 dark:text-white">
										Public
										<span className="block pl-6 text-gray-500 text-sm">
											Your profile and organization details can be seen by
											everyone
										</span>
									</span>
								</div>
							</div>
							<Button
								type="submit"
								isProcessing={loading}
								className="mb-2 float-right text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								<svg
									className="pr-2"
									xmlns="http://www.w3.org/2000/svg"
									width="22"
									height="22"
									fill="none"
									viewBox="0 0 18 18"
								>
									<path
										stroke="#fff"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 1v12l-4-2-4 2V1h8ZM3 17h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
									/>
								</svg>
								Save
							</Button>
						</Form>
					)}
				</Formik>
			</Modal.Body>
		</Modal>
	);
};

export default EditOrgdetailsModal;
