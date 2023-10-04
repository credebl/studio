import * as yup from "yup"
import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, apiStatusCodes, imageSizeAccepted } from '../../config/CommonConstant'
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { useEffect, useState } from "react";
import { AlertComponent } from "../AlertComponent";
import type { AxiosResponse } from 'axios';
import { updateEcosystem } from "../../api/ecosystems";
import type { Ecosystem } from "./interfaces";

interface EditEcoValues {
    website: any;
    name: string;
    description: string;
}

interface EditLogoImage {
    logoFile: string | File
    imagePreviewUrl: string | ArrayBuffer | null | File,
    fileName: string
}

interface EditEcosystemsModalProps {
    openModal: boolean;
    setMessage: (message: string) => void;
    setOpenModal: (flag: boolean) => void;
    onEditSucess?: () => void;
    EditEcoData: Ecosystem | null;

}

const EditEcosystemsModal = (props: EditEcosystemsModalProps) => {
    const [editLogoImage, setEditLogoImage] = useState<EditLogoImage>({
        logoFile: "",
        imagePreviewUrl: props?.EditEcoData?.logoUrl ?? "",
        fileName: '',

    })
    const [loading, setLoading] = useState<boolean>(false)
    const [isEditImageEmpty, setIsEditImageEmpty] = useState(true)


    const [initialEditEcoData, setEditEcoData] = useState({
        name: props?.EditEcoData?.name ?? "",
        description: props?.EditEcoData?.description ?? "",
        website: props?.EditEcoData?.website ?? "",
    })
    const newInitialEcoData = initialEditEcoData
    useEffect(() => {

        if (props.EditEcoData) {
            setEditEcoData({
                name: props.EditEcoData.name ?? '',
                description: props.EditEcoData.description ?? '',
                website: props?.EditEcoData?.website ?? "",
            });

            setEditLogoImage({
                logoFile: "",
                imagePreviewUrl: props.EditEcoData.logoUrl ?? "",
                fileName: ''
            });
        }
    }, [props]);


    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const [imgError, setImgError] = useState('')

    useEffect(() => {
        if (props.openModal === false) {
            setEditEcoData({
                name: '',
                description: '',
                website: ''
            })

            setEditLogoImage({
                ...editLogoImage,
                logoFile: "",
                imagePreviewUrl: ""
            })
        }
    }, [props.openModal])


    const ProcessImg = (e: any): string | undefined => {

        const file = e?.target.files[0]
        if (!file) { return }

        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (event): void => {
            const imgElement = document.createElement("img")
            if (imgElement) {
                imgElement.src = typeof event?.target?.result === 'string' ? event.target.result : ""
                imgElement.onload = (e): void => {
                    let fileUpdated: File | string = file
                    let srcEncoded = ''
                    const canvas = document.createElement("canvas")

                    const { width, height, ev } = calculateSize(imgElement, IMG_MAX_WIDTH, IMG_MAX_HEIGHT)
                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext("2d")
                    if (ctx && e?.target) {
                        ctx.imageSmoothingEnabled = true
                        ctx.imageSmoothingQuality = "high"
                        ctx.drawImage(ev, 0, 0, canvas.width, canvas.height)
                        srcEncoded = ctx.canvas.toDataURL(ev, file.type)
                        const blob = dataURItoBlob(srcEncoded, file.type)
                        fileUpdated = new File([blob], file.name, { type: file.type, lastModified: new Date().getTime() })
                        setEditLogoImage({
                            logoFile: fileUpdated,
                            imagePreviewUrl: srcEncoded,
                            fileName: file.name
                        })
                    }
                }
            }
        }
    }

    const isEmpty = (object: any): boolean => {
        for (const property in object) {
            setIsEditImageEmpty(false)
            return false
        }
        setIsEditImageEmpty(true)
        return true
    }


    const handleImageChange = (event: any): void => {
        setImgError('')
        const reader = new FileReader()
        const file = event?.target?.files

        const fieSize = Number((file[0]?.size / 1024 / 1024)?.toFixed(2))
        const extension = file[0]?.name?.substring(file[0]?.name?.lastIndexOf(".") + 1)?.toLowerCase()
        if (extension === "png" || extension === "jpeg" || extension === "jpg") {
            if (fieSize <= imageSizeAccepted) {
                reader.onloadend = (): void => {
                    ProcessImg(event)
                    isEmpty(reader.result)
                }
                reader.readAsDataURL(file[0])
                event.preventDefault()
            } else {
                setImgError("Please check image size")
            }
        } else {
            setImgError("Invalid image type")
        }
    }

    const submitUpdateEcosystem = async (values: EditEcoValues) => {

        setLoading(true)

        const EcoData = {
            orgId: props?.EditEcoData?.id,
            name: values.name,
            description: values.description,
            logo: editLogoImage?.imagePreviewUrl as string || props?.EditEcoData?.logoUrl,
            website: values.website,

        }

        const resUpdateEco = await updateEcosystem(EcoData, EcoData.orgId?.toString() as string)

        const { data } = resUpdateEco as AxiosResponse
        setLoading(false)

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            if (props?.onEditSucess) {
                props?.onEditSucess()
            }
            props.setOpenModal(false)
        } else {
            setErrorMsg(resUpdateEco as string)
        }
    }

    return (
        <Modal show={props.openModal} onClose={() => {
            setEditLogoImage({
                logoFile: "",
                imagePreviewUrl: "",
                fileName: ''
            })
            setEditEcoData(newInitialEcoData)
            props.setOpenModal(false)
        }
        }>
            <Modal.Header>Edit Ecosystem</Modal.Header>
            <Modal.Body>
                <AlertComponent
                    message={errorMsg}
                    type={'failure'}
                    onAlertClose={() => {
                        setErrorMsg(null)
                    }}
                />
                <Formik
                    initialValues={
                        newInitialEcoData
                    }
                    validationSchema={
                        yup.object().shape({
                            name: yup
                                .string()
                                .min(2, 'Ecosystem name must be at least 2 characters')
                                .max(50, 'Ecosystem name must be at most 50 characters')
                                .required('Ecosystem name is required')
                                .trim(),
                            description: yup
                                .string()
                                .min(2, 'Ecosystem description must be at least 2 characters')
                                .max(255, 'Ecosystem description must be at most 255 characters')
                                .required('Description is required')
                        })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={async (
                        values: EditEcoValues,
                        { resetForm }: FormikHelpers<EditEcoValues>
                    ) => {
                        submitUpdateEcosystem(values)
                    }}
                >
                    {(formikHandlers): JSX.Element => (

                        <Form className="space-y-6" onSubmit={
                            formikHandlers.handleSubmit
                        }>
                            <div
                                className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                            >
                                <div
                                    className="items-center sm:flex 2xl:flex sm:space-x-4 xl:space-x-4 2xl:space-x-4"
                                >


                                    {
                                        (typeof (editLogoImage.logoFile) === "string" && props?.EditEcoData?.logoUrl) ?
                                            <img
                                                className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                                                src={props?.EditEcoData?.logoUrl}
                                                alt="Jese picture"
                                            />
                                            : typeof (editLogoImage.logoFile) === "string" ?
                                                <Avatar
                                                    size="lg"
                                                /> :
                                                <img
                                                    className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                                                    src={URL.createObjectURL(editLogoImage?.logoFile)}
                                                    alt="Jese picture"
                                                />
                                    }


                                    <div>
                                        <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                            Ecosystem Logo
                                        </h3>
                                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                            JPG, JPEG and PNG . Max size of 1MB
                                        </div>
                                        <div className="flex items-center space-x-4">

                                            <div>
                                                <label htmlFor="editecosystemlogo">
                                                    <div className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-center rounded-lg">Choose file</div>
                                                    <input type="file" accept="image/*" name="file"
                                                        className="hidden"
                                                        id="editecosystemlogo" title=""
                                                        onChange={(event): void => handleImageChange(event)} />
                                                    {/* <span>{selectedImage || 'No File Chosen'}</span> */}
                                                    {imgError ? <div className="text-red-500">{imgError}</div> : <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">{editLogoImage.fileName || 'No File Chosen'}</span>}
                                                </label>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    <Label
                                        htmlFor="name"
                                        value="Name"
                                    />
                                    <span className='text-red-500 text-xs'>*</span>

                                </div>
                                <Field
                                    id="name"
                                    name="name"
                                    value={formikHandlers.values.name}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Your organization name" />
                                {
                                    (formikHandlers?.errors?.name && formikHandlers?.touched?.name) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.name}</span>
                                }

                            </div>


                            <div>
                                <div
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    <Label
                                        htmlFor="description"
                                        value="Description"
                                    />
                                    <span className='text-red-500 text-xs'>*</span>

                                </div>

                                <Field
                                    id="description"
                                    name="description"
                                    value={formikHandlers.values.description}
                                    as='textarea'
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Description of your organization" />
                                {
                                    (formikHandlers?.errors?.description && formikHandlers?.touched?.description) &&
                                    <span className="text-red-500 text-xs">{formikHandlers?.errors?.description}</span>
                                }
                            </div>
                            <div>


                            </div>

                            <Button type="submit"
                                isProcessing={loading}
                                className='mb-2 float-right text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'

                            ><svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 18 18">
                                    <path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 1v12l-4-2-4 2V1h8ZM3 17h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                                </svg>
                                Save
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>

        </Modal>
    )
}

export default EditEcosystemsModal;
