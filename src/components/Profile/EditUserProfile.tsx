import { useEffect, useRef, useState} from "react";
import type { UserProfile } from "./interfaces";
import { getFromLocalStorage, setToLocalStorage, updateUserProfile } from "../../api/Auth";
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, imageSizeAccepted, storageKeys } from "../../config/CommonConstant";
import type { AxiosResponse } from "axios";
import CustomAvatar from '../Avatar'
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { Alert, Button } from "flowbite-react";
import { Form, Formik, FormikHelpers } from "formik";
import * as yup from "yup"

interface Values {
  profileImg: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ILogoImage {
  logoFile: string | File,
  imagePreviewUrl: string | ArrayBuffer | null | File,
  fileName: string
}
interface EditUserProfileProps {
  toggleEditProfile: () => void;
  userProfileInfo: UserProfile | null;
  updateProfile: (updatedProfile: UserProfile) => void;
}

const EditUserProfile = ({ toggleEditProfile, userProfileInfo, updateProfile }: EditUserProfileProps) => {

  const [loading, setLoading] = useState<boolean>(false)
  const [isImageEmpty, setIsImageEmpty] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const [initialProfileData, setInitialProfileData] = useState({
    profileImg: userProfileInfo?.profileImg || "",
    firstName: userProfileInfo?.firstName || "",
    lastName: userProfileInfo?.lastName || "",
    email: userProfileInfo?.email || "",

  })
  const [logoImage, setLogoImage] = useState<ILogoImage>({
    logoFile: '',
    imagePreviewUrl: userProfileInfo?.profileImg || "",
    fileName: ''
  })

  const firstNameInputRef = useRef(null);

  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus();
    }
  }, []);


  useEffect(() => {

    if (userProfileInfo) {
      setInitialProfileData({
        profileImg: userProfileInfo?.profileImg || "",
        firstName: userProfileInfo.firstName || "",
        lastName: userProfileInfo.lastName || "",
        email: userProfileInfo?.email,
      });

      setLogoImage({
        logoFile: "",
        imagePreviewUrl: userProfileInfo.profileImg || "",
        fileName: ''
      });
    }
  }, [userProfileInfo]);

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
      setIsImageEmpty(false)
      return false
    }
    setIsImageEmpty(true)
    return true
  }

  const [imgError, setImgError] = useState('')

  const handleImageChange = (event: any): void => {
    setImgError('')
    setLogoImage({
      ...logoImage,
      imagePreviewUrl: '',
    });

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


  const updateUserDetails = async (values: Values) => {
    setLoading(true)

    const userData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      profileImg: logoImage?.imagePreviewUrl as string || values?.profileImg
    }
    const resUpdateUserDetails = await updateUserProfile(userData)

    const existingUser = await getFromLocalStorage(storageKeys.USER_PROFILE)

    const { data } = resUpdateUserDetails as AxiosResponse

    const updatedUser = JSON.parse(existingUser)

    const updatedUserData = {
      ...updatedUser,
      ...userData
    }

    updateProfile(userData);
    await setToLocalStorage(storageKeys.USER_PROFILE, updatedUserData);
    window.location.reload();
    setLoading(false)
  }

  const validationSchema = yup.object().shape({
    firstName: yup.string()
      .required("First Name is required")
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be at most 50 characters'),
  
    lastName: yup.string()
      .required("Last Name is required")
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be at most 50 characters')

  });

  return (
    <div>
      <div className='h-full'>
        <div className='page-container relative h-full flex flex-auto flex-col py-4 sm:py-6'>
          <div className='container mx-auto bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700'>
            <div className="px-6 py-6">

              {
                (success === "Profile Updated Successfully" || failure) &&
                <Alert
                  color={success ? "success" : "failure"}
                  onDismiss={() => {
                    setSuccess(null)
                    setFailure(null)
                  }}
                >
                  <span>
                    <p>
                      {success || failure}
                    </p>
                  </span>
                </Alert>
              }


              <Formik
                initialValues={initialProfileData}
                onSubmit={async (
                  values: Values,
                  { resetForm }: FormikHelpers<Values>
                ) => {
                  await updateUserDetails(values);
                  toggleEditProfile();
                }}

                validationSchema={validationSchema}>
                {(formikHandlers): JSX.Element => (
                  <Form onSubmit={
                    formikHandlers.handleSubmit
                  }>

                    <div>
                      <div className="flex items-center justify-between">

                        <div>
                          <h1 className="text-gray-500 text-xl font-medium font-montserrat dark:text-white">General</h1>
                          <p className="mt-2 text-gray-700 font-montserrat text-sm font-normal font-light leading-normal dark:text-white">Basic info, like your first name, last name and profile image that will be displayed</p>
                        </div>

                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                      <div className="text-base text-gray-700 font-montserrat dark:text-white">
                        First Name
                        <span className='text-red-500 text-xs'>*</span>

                      </div>

                      <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            name="firstName"
                            placeholder="Enter your first name"
                            value={formikHandlers.values.firstName}
                            onChange={(e) => {
                              const value = e.target.value;
                              formikHandlers.setFieldValue('firstName', value);
                              formikHandlers.setFieldTouched('firstName', true, false);
                          
                              if (value.length > 50) {
                                formikHandlers.setFieldError('firstName', 'First name must be at most 50 characters');
                              } 
                            }}
                            onBlur={formikHandlers.handleBlur}
                            ref={firstNameInputRef}
                            className="bg-gray-50 py-3 px-4 font-medium text-gray-900 border border-gray-300 w-full rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 max-w-100/6rem" />
                          {(formikHandlers?.errors?.firstName && formikHandlers?.touched?.firstName) && (
                            <span className="text-red-500 text-xs mt-1">
                              {formikHandlers?.errors?.firstName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 py-8 border-b border-gray-200 dark:border-gray-600 items-center">
                      <div className="text-base text-gray-700 font-montserrat dark:text-white">
                        Last Name
                        <span className='text-red-500 text-xs'>*</span>
                      </div>

                      <div className="focus:ring-indigo-600 col-span-2 w-full focus:ring-primary-500 focus:border-primary-500">
                        <div className="flex flex-col">
                          <input
                            name="lastName"
                            placeholder="Enter your last name"
                            value={formikHandlers.values.lastName}
                            onChange={(e) => {
                              const value = e.target.value;
                              formikHandlers.setFieldValue('lastName', value);
                              formikHandlers.setFieldTouched('lastName', true, false);
                          
                              if (value.length > 50) {
                                formikHandlers.setFieldError('lastName', 'Last name must be at most 50 characters');
                              }
                            }}
                            onBlur={formikHandlers.handleBlur}
                            className="bg-gray-50 py-3 px-4 font-medium text-gray-900 border border-gray-300 w-full rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 max-w-100/6rem" />
                          {(formikHandlers?.errors?.lastName && formikHandlers?.touched?.lastName) && (
                            <span className="text-red-500 text-xs mt-1">
                              {formikHandlers?.errors?.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 py-8 border-gray-200 dark:border-gray-600 items-center">
                      <div className="text-base text-gray-600 font-montserrat font-normal dark:text-white">Profile Image</div>
                      <div className="focus:ring-indigo-600 col-span-2 w-full focus-within:ring-indigo-600 focus-within:border-indigo-600 focus:border-indigo-600">
                        <div className="flex items-center gap-4 space-x-4">
                          {logoImage.imagePreviewUrl ? (
                            <img
                              className="mb-4 rounded-full w-24 h-24 sm:mb-0 xl:mb-4 2xl:mb-0"
                              src={logoImage.imagePreviewUrl}
                              alt="Profile Picture"
                            />
                          ) : (
                            <CustomAvatar
                              className="mb-4 rounded-full w-24 h-24 sm:mb-0 xl:mb-4 2xl:mb-0"
                              size="90"
                              name={userProfileInfo?.firstName} />)}

                          <div className="flex flex-col mt-2">
                            <label htmlFor="organizationlogo">
                              <div className="px-4 py-1 bg-primary-700 hover:bg-primary-800 text-white text-center font-montserrat rounded-md">Choose file</div>
                              <input type="file" accept="image/*" name="file"
                                className="hidden"
                                id="organizationlogo" title=""
                                onChange={(event): void => handleImageChange(event)} />
                              {imgError ? <div className="text-red-500">{imgError}</div> : <span className="mt-1 ml-2 text-sm text-gray-500 dark:text-white">{logoImage.fileName || 'No File Chosen'}</span>}
                            </label>

                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-16">
                      <div className='float-right p-2'>
                        <Button
                          type="submit"
                          isProcessing={loading}
                          fill="none"
                          className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 px-3'
                        >
                          <svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="22" fill="none" viewBox="0 0 18 18">
                            <path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 1v12l-4-2-4 2V1h8ZM3 17h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                          </svg>
                          Save
                        </Button>
                      </div>
                      <div className='float-right p-3'>
                        <Button
                          type="reset"
                          color='bg-primary-800'
                          className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-3 mr-2 ml-auto dark:text-secondary-700 dark:hover:text-primary-700'
                          onClick={() => toggleEditProfile()}
                          style={{ height: '2.5rem', width: '7rem', minWidth: '4rem' }}
                        >
                          <svg className="h-6 w-6 text-primary-700 mr-1"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>

                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
