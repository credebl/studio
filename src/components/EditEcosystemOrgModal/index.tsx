import * as yup from 'yup';
import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { apiStatusCodes } from '../../config/CommonConstant';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import { updateOrganization } from '../../api/organization';
import { updateEcosystem } from '../../api/ecosystem';
import type {
	EditEntityModalProps,
	EditEntityValues,
	ILogoImage,
} from '../Ecosystem/interfaces';
import React, { useEffect, useState } from 'react';
import EndorsementTooltip from '../../commonComponents/EndorsementTooltip';
import { processImage } from '../../utils/enums/processImage';
import FormikErrorMessage from '../../commonComponents/formikerror/index'

const EditPopupModal = (props: EditEntityModalProps) => {
	const [logoImage, setLogoImage] = useState<ILogoImage>({
		logoFile: '',
		imagePreviewUrl: props?.entityData?.logoUrl ?? '',
		fileName: '',
	});

	const [loading, setLoading] = useState<boolean>(false);
	const [isImageEmpty, setIsImageEmpty] = useState(true);
	const [initialEntityData, setInitialEntityData] = useState<EditEntityValues>({
		name: '',
		description: '',
	});

	useEffect(() => {
		if (props.openModal && props.entityData) {
			setInitialEntityData({
				name: props.entityData.name ?? '',
				description: props.entityData.description ?? '',
			});
			SetisAutoEndorse(props.entityData.autoEndorsement);
			setLogoImage({
				logoFile: '',
				imagePreviewUrl: props.entityData.logoUrl ?? '',
				fileName: props.entityData.logoFile ?? '',
			});
		}
	}, [props.entityData, props.openModal]);

	const [errMsg, setErrMsg] = useState<string | null>(null);
	const [imgError, setImgError] = useState('');
	const [isAutoEndorse, SetisAutoEndorse] = useState(false);

	useEffect(() => {
		if (!props.openModal) {
			setInitialEntityData({
				name: '',
				description: '',
			});

			setLogoImage({
				logoFile: '',
				imagePreviewUrl: '',
				fileName: '',
			});
			setImgError('');
			setErrMsg(null);
			setLoading(false);
		}
	}, [props.openModal]);

	const handleImageChange = (event: any): void => {
		setImgError('');
		processImage(event, (result, error) => {
			if (result) {
				setLogoImage({
					logoFile: '',
					imagePreviewUrl: result,
					fileName: event.target.files[0].name,
				});
			} else {
				setImgError(error || 'An error occurred while processing the image.');
			}
		});
	};

	const submitUpdateEntity = async (values: EditEntityValues) => {
		setLoading(true);

		const entityData = {
			id: props?.entityData?.id,
			name: values.name,
			description: values.description,
			logo:
				(logoImage?.imagePreviewUrl as string) || props?.entityData?.logoUrl,
			autoEndorsement: isAutoEndorse,
		};

		try {
			if (props.isOrganization) {
				const response = await updateOrganization(
					entityData,
					entityData.id?.toString() as string,
				);
				const { data } = response as AxiosResponse;
				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					if (props?.onEditSuccess) {
						props?.onEditSuccess();
					}
					props.setOpenModal(false);
					props.setMessage(data?.message);
				} else {
					setErrMsg(response as string);
					setLoading(false);
				}
			} else {
				const response = await updateEcosystem(entityData);
				const { data } = response as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					if (props?.onEditSuccess) {
						props?.onEditSuccess();
					}
					props.setOpenModal(false);
					props.setMessage(data?.message);
				} else {
					setErrMsg(response as string);
					setLoading(false);
				}
			}
		} catch (error) {
			console.error('An error occurred:', error);
			setLoading(false);
		}
	};

	return (
		<Modal
			size={'3xl'}
			show={props.openModal}
			onClose={() => {
				setLogoImage({
					logoFile: '',
					imagePreviewUrl: '',
					fileName: '',
				});
				setInitialEntityData({
					name: '',
					description: '',
				});
				props.setOpenModal(false);
			}}
		>
			<Modal.Header>
				Edit {props.isOrganization ? 'Organization' : 'Ecosystem'}
			</Modal.Header>
			<Modal.Body>
				<AlertComponent
					message={errMsg}
					type={'failure'}
					onAlertClose={() => {
						setErrMsg(null);
					}}
				/>
				<Formik
					initialValues={initialEntityData}
					validationSchema={yup.object().shape({
						name: yup
							.string()
							.min(
								2,
								`${
									props.isOrganization ? 'Organization' : 'Ecosystem'
								} name must be at least 2 characters`,
							)
							.max(
								50,
								`${
									props.isOrganization ? 'Organization' : 'Ecosystem'
								} name must be at most 50 characters`,
							)
							.required(
								`${
									props.isOrganization ? 'Organization' : 'Ecosystem'
								} name is required`,
							)
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
						values: EditEntityValues,
						{ resetForm }: FormikHelpers<EditEntityValues>,
					) => {
						await submitUpdateEntity(values);
					}}
				>
					{(formikHandlers): JSX.Element => (
						<Form className="space-y-6" onSubmit={formikHandlers.handleSubmit}>
							<div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
								<div className="items-center sm:flex 2xl:flex sm:space-x-4 xl:space-x-4 2xl:space-x-4">
									{logoImage.imagePreviewUrl ? (
										<img
											className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
											src={logoImage?.imagePreviewUrl || ''}
											alt={`${
												props.isOrganization ? 'Organization' : 'Ecosystem'
											} Logo`}
										/>
									) : (
										<Avatar size="lg" />
									)}

									<div>
										<h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
											{props.isOrganization
												? 'Organization Logo'
												: 'Ecosystem Logo'}
										</h3>
										<div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
											JPG, JPEG and PNG. Max size of 1MB
										</div>
										<div className="flex items-center space-x-4">
											<div>
												<label htmlFor="entityLogo">
													<div className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-center rounded-lg">
														Choose file
													</div>
													<input
														type="file"
														accept="image/*"
														name="file"
														className="hidden"
														id="entityLogo"
														title=""
														onChange={(event): void => handleImageChange(event)}
													/>
													{imgError ? (
														<div className="text-red-500">{imgError}</div>
													) : (
														<span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
															{logoImage.fileName}
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
									placeholder={`Enter ${
										props.isOrganization ? 'Organization' : 'Ecosystem'
									} Name`}
									onChange={(e) => {
										const value = e.target.value;
										formikHandlers.setFieldValue('name', value);
										formikHandlers.setFieldTouched('name', true, false);

										if (value.length > 50) {
											formikHandlers.setFieldError(
												'name',
												props.isOrganization
													? 'Organization name must be at most 50 characters'
													: 'Ecosystem name must be at most 50 characters',
											);
										}
									}}
								/>
								<FormikErrorMessage
									error={formikHandlers?.errors?.name}
									touched={formikHandlers?.touched?.name}
								/>
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
									placeholder={`Enter ${
										props.isOrganization ? 'Organization' : 'Ecosystem'
									} Description`}
									onChange={(e) => {
										const value = e.target.value;
										formikHandlers.setFieldValue('description', value);
										formikHandlers.setFieldTouched('description', true, false);

										if (value.length > 50) {
											formikHandlers.setFieldError(
												'description',
												'Description must be at most 255 characters',
											);
										}
									}}
								/>
								<FormikErrorMessage
									error={formikHandlers?.errors?.description}
									touched={formikHandlers?.touched?.description}
								/>
							</div>
							<div>
								<div className="flex items-center">
									<Label htmlFor="name" value="Endorsement Flow" />
									<EndorsementTooltip />
								</div>
								<div>
									<input
										className=""
										type="radio"
										id="sign"
										name="autoEndorsement"
										checked={isAutoEndorse === false}
										onChange={() => SetisAutoEndorse(false)}
									/>
									<span className="ml-2 text-gray-900 dark:text-white text-sm">
										Sign
									</span>
								</div>
								<div>
									<input
										className=""
										type="radio"
										id="sign-submit"
										name="autoEndorsement"
										checked={isAutoEndorse === true}
										onChange={() => SetisAutoEndorse(true)}
									/>
									<span className="ml-2 text-gray-900 dark:text-white text-sm">
										Sign and Submit
									</span>
								</div>
							</div>
							<Button
								type="submit"
								isProcessing={loading}
								className="float-right text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
							>
								Update
							</Button>
						</Form>
					)}
				</Formik>
			</Modal.Body>
		</Modal>
	);
};

export default EditPopupModal;
