import * as yup from "yup"

import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, apiStatusCodes, imageSizeAccepted } from '../../config/CommonConstant'
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { useRef, useState } from "react";

import type { AxiosResponse } from 'axios';
import { asset } from '../../lib/data.js';
import { createOrganization } from "../../api/organization";

interface Values {
    name: string;
    description: string;
}

interface ILogoImage {
    logoFile: string | File
    imagePreviewUrl: string | ArrayBuffer | null | File
}


const CreateOrgFormModal = (props: { openModal: boolean; setOpenModal: (flag: boolean) => void }) => {


    const [logoImage, setLogoImage] = useState<ILogoImage>({
        logoFile: "",
        imagePreviewUrl: ""
    })

    const [loading, setLoading] = useState<boolean>(false)

    const [isImageEmpty, setIsImageEmpty] = useState(true)
    const [initialOrgData, setOrgData] = useState({
        name: '',
        description: '',
    })
    const [erroMsg, setErrMsg] = useState<string | null>(null)

    const [imgError, setImgError] = useState('')


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
                        setLogoImage({
                            logoFile: fileUpdated,
                            imagePreviewUrl: srcEncoded
                        })
                    }
                }
            }
        }
    }

    const isEmpty = (object: any): boolean => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, guard-for-in
        for (const property in object) {
            setIsImageEmpty(false)
            return false
        }
        setIsImageEmpty(true)
        return true
    }


    const handleImageChange = (event: any): void => {
        setImgError('')
        const reader = new FileReader()
        const file = event?.target?.files
        console.log(file);

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

    const sumitCreateOrganization = async (values: Values) => {
        setLoading(true)

        const orgData = {
            name: values.name,
            description: values.description,
            logo: logoImage?.imagePreviewUrl as string || "",
            website: ""
        }

        const resCreateOrg = await createOrganization(orgData)

        const { data } = resCreateOrg as AxiosResponse
        setLoading(false)

        if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
            // console.log(`Org Message::`,data?.message)
            
            props.setOpenModal(false)

        } else {
            setErrMsg(resCreateOrg as string)
        }
    }

    return (
        <Modal show={props.openModal === true} onClose={() => {
            setLogoImage({
                logoFile: "",
                imagePreviewUrl: ""
            })
            setOrgData(initialOrgData)
            props.setOpenModal(false)
        }
        }>
            <Modal.Header>Create Organization</Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialOrgData}
                    validationSchema={
                        yup.object().shape({
                            name: yup
                                .string()
                                .min(2, 'Organization name must be at least 2 characters')
                                .max(50, 'Organization name must be at most 50 characters')
                                .required('Organization name is required')
                                .trim(),
                            description: yup
                                .string()
                                .min(2, 'Organization name must be at least 2 characters')
                                .max(255, 'Organization name must be at most 255 characters')
                                .required('Description is required')
                        })}
                    validateOnBlur
                    validateOnChange
                    enableReinitialize
                    onSubmit={async (
                        values: Values,
                        { resetForm }: FormikHelpers<Values>
                    ) => {

                        sumitCreateOrganization(values)

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
                                    className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
                                >
                                    {
                                        typeof (logoImage.logoFile) === "string" ?
                                            <Avatar
                                                size="lg"
                                            /> :
                                            <img
                                                className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                                                src={typeof (logoImage.logoFile) === "string" ? asset('images/users/bonnie-green-2x.png') : URL.createObjectURL(logoImage.logoFile)}
                                                alt="Jese picture"
                                            />
                                    }

                                    <div>
                                        <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                            Organization Logo
                                        </h3>
                                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                            JPG, GIF or PNG. Max size of 1M
                                        </div>
                                        <div className="flex items-center space-x-4">


                                            <div className="camera-btn">
                                                <input type="file" accept="image/*" name="file" id="exampleFile1" title=""
                                                    onChange={(event): void => handleImageChange(event)} />
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
                                </div>
                                <Field
                                    id="name"
                                    name="name"
                                    value={formikHandlers.values.name}
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="OrgTech" />

                            </div>
                            <div>
                                <div
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    <Label
                                        htmlFor="description"
                                        value="Description"
                                    />
                                </div>

                                <Field
                                    id="description"
                                    name="description"
                                    value={formikHandlers.values.description}
                                    as='textarea'
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Description of your organization" />

                            </div>

                            <Button type="submit"
                                isProcessing={loading}

                                className='float-right text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                            >
                                Create
                            </Button>
                        </Form>
                    )}

                </Formik>
            </Modal.Body>

        </Modal>
    )
}

export default CreateOrgFormModal;