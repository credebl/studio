import { useEffect, useState } from "react";
import type { UserProfile } from "./interfaces";
import { getFromLocalStorage, getUserProfile, updateUserProfile } from "../../api/Auth";
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, apiStatusCodes, imageSizeAccepted, storageKeys } from "../../config/CommonConstant";
import type { AxiosResponse } from "axios";
import CustomAvatar from '../Avatar'
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { Avatar, Button, Label } from "flowbite-react";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { asset } from "../../lib/data";
import * as yup from "yup"

interface Values {
  profileImg: string;
  firstName: string;
  lastName: string;
  email:string;
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

const UpdateUserProfile = ({ toggleEditProfile, userProfileInfo, updateProfile }: EditUserProfileProps) => {

  const [loading, setLoading] = useState<boolean>(false)
  const [isImageEmpty, setIsImageEmpty] = useState(true)
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

  useEffect(() => {

    if (userProfileInfo) {
      setInitialProfileData({
        profileImg: userProfileInfo?.profileImg || "",
        firstName: userProfileInfo.firstName || '',
        lastName: userProfileInfo.lastName || '',
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

    console.log(`Image::`, logoImage?.imagePreviewUrl);


    setLoading(true)

    const userData = {
      id: userProfileInfo?.id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      profileImg: logoImage?.imagePreviewUrl as string || values?.profileImg

    }

    const resUpdateUserDetails = await updateUserProfile(userData)

    const { data } = resUpdateUserDetails as AxiosResponse

    updateProfile(userData);

    setLoading(false)

  }

  const validationSchema = yup.object().shape({
    firstName: yup.string()
                  .required("First Name is required")
                  .min(2, 'First name must be at least 2 characters')
                  .max(255, 'First name must be at most 255 characters'),

    lastName: yup.string()
                 .required("Last Name is required")
                 .min(2, 'Last name must be at least 2 characters')
                 .max(255, 'Last name must be at most 255 characters')

  });


  return (
    <div
      className="mb-4 md:p-8 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 md:p-8 dark:bg-gray-800"
    >
      <div className="flow-root">
        <Formik
          initialValues={initialProfileData}
          onSubmit={async (
            values: Values, 
            { resetForm }: FormikHelpers<Values>
            ) => {
            if (!values.firstName || !values.lastName) {
              return;
            }
        
            updateUserDetails(values);
            toggleEditProfile();
          }}
        
          validationSchema={validationSchema}>
          {(formikHandlers): JSX.Element => (
            <Form onSubmit={
              formikHandlers.handleSubmit
            }>
              <div
                className="max-w-lg mx-auto mb-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
              >
                <div
                  className="relative justify-center sm:px-2 sm:py-2 sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4"
                >

                  {
                    (typeof (logoImage.logoFile) === "string" && userProfileInfo?.profileImg) ?
                      <img
                        className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                        src={userProfileInfo?.profileImg}
                        alt="Jese picture"
                      />
                      : typeof (logoImage.logoFile) === "string" ?
                        <Avatar
                          size="90"
                        /> :
                        <img
                          className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                          src={URL.createObjectURL(logoImage?.logoFile)}
                          alt="Jese picture"
                        />
                  }


                  <div>
                    <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                      Profile Image
                    </h3>
                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      JPG, JPEG and PNG . Max size of 1MB
                    </div>
                    <div className="flex items-center space-x-4">

                      <div>
                        <label htmlFor="organizationlogo">
                          <div className="px-4 py-2 bg-blue-700 text-white text-center rounded-lg">Choose file</div>
                          <input type="file" accept="image/*" name="file"
                            className="hidden"
                            id="organizationlogo" title=""
                            onChange={(event): void => handleImageChange(event)} />
                          {imgError ? <div className="text-red-500">{imgError}</div> : <span className="mt-1">{logoImage.fileName || 'No File Chosen'}</span>}
                        </label>

                      </div>

                    </div>
                  </div>
                  <button
                  type="button"
                  className="absolute top-0 right-0  w-6 h-6 m-2 "
                  onClick={toggleEditProfile}
                >
                  <svg className="-top-1 -right-6 mr-1 w-6 h-6 mb-20"
                    width="24" height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <line x1="5" y1="12" x2="11" y2="18" />
                    <line x1="5" y1="12" x2="11" y2="6" />
                  </svg>

                </button>


                </div>


              </div>
              <div className="mx-2">
                <div
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  <Label
                    htmlFor="name"
                    value="First Name"
                  />
                  <span className='text-red-500 text-xs'>*</span>

                </div>
                <Field
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  type="text" id="firstName" name="firstName" />
                {
                  (formikHandlers?.errors?.firstName && formikHandlers?.touched?.firstName) &&
                  <span className="text-red-500 text-xs">{formikHandlers?.errors?.firstName}</span>
                }
              </div>

              <div className="mx-2">
                <div
                  className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white"
                >

                  <Label
                    htmlFor="name"
                    value="Last Name"
                  />
                  <span className='text-red-500 text-xs'>*</span>
                </div>
                <Field
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"

                  type="text" id="lastName" name="lastName" />
                {
                  (formikHandlers?.errors?.lastName && formikHandlers?.touched?.lastName) &&
                  <span className="text-red-500 text-xs">{formikHandlers?.errors?.lastName}</span>
                }
              </div>

              <div className="flex flex-col items-center sm:flex-row sm:justify-end">
                <Button type="submit"
                  isProcessing={loading}
                  onClick={toggleEditProfile}
                  className='mt-4 mb-4 float-right text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'

                >
                  Edit
                </Button>
              </div>
            </Form>
          )}
        </Formik>

      </div>
    </div>
  );
};

export default UpdateUserProfile;
