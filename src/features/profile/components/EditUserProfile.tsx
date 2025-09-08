'use client'

import * as yup from 'yup'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field, Form, Formik } from 'formik'
import {
  IMG_MAX_HEIGHT,
  IMG_MAX_WIDTH,
  imageSizeAccepted,
} from '@/config/CommonConstant'
import React, { useEffect, useRef, useState } from 'react'
import { calculateSize, dataURItoBlob } from '@/utils/CompressImage'

import { Button } from '@/components/ui/button'
import type { IUserProfile } from '@/components/profile/interfaces'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { updateUserProfile } from '@/app/api/Auth'

interface Values {
  profileImg: string
  firstName: string
  lastName: string
  email: string
}

interface ILogoImage {
  logoFile: string | File
  imagePreviewUrl: string | ArrayBuffer | null
  fileName: string
}

interface EditUserProfileProps {
  toggleEditProfile: () => void
  userProfileInfo: IUserProfile
  updateProfile: (updatedProfile: IUserProfile) => void
}

export default function EditUserProfile({
  toggleEditProfile,
  userProfileInfo,
  updateProfile,
}: Readonly<EditUserProfileProps>): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [logoImage, setLogoImage] = useState<ILogoImage>({
    logoFile: '',
    imagePreviewUrl: userProfileInfo.profileImg || '',
    fileName: '',
  })
  const [imgError, setImgError] = useState('')
  const firstNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus()
    }
  }, [])

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .required('First Name is required')
      .min(2, 'First Name must be at least 2 characters')
      .max(50, 'First Name must be at most 50 characters'),
    lastName: yup
      .string()
      .required('Last Name is required')
      .min(2, 'Last Name must be at least 2 characters')
      .max(50, 'Last Name must be at most 50 characters'),
  })

  const processImage = (file: File): void => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event): void => {
      const imgElement = document.createElement('img')
      imgElement.src = event.target?.result as string
      imgElement.onload = (e): void => {
        const { width, height, ev } = calculateSize(
          imgElement,
          IMG_MAX_WIDTH,
          IMG_MAX_HEIGHT,
        )
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx && e.target) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(ev, 0, 0, canvas.width, canvas.height)
          const srcEncoded = canvas.toDataURL(file.type)
          const blob = dataURItoBlob(srcEncoded, file.type)
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: new Date().getTime(),
          })
          setLogoImage({
            logoFile: compressedFile,
            imagePreviewUrl: srcEncoded,
            fileName: file.name,
          })
        }
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setImgError('')
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const fileSizeMB = file.size / 1024 / 1024
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!['jpg', 'jpeg', 'png'].includes(extension || '')) {
      setImgError('Invalid image type')
      return
    }
    if (fileSizeMB > imageSizeAccepted) {
      setImgError('Please check image size')
      return
    }

    processImage(file)
  }

  const handleSubmit = async (values: Values): Promise<void> => {
    setLoading(true)
    try {
      const updatedData: IUserProfile = {
        ...userProfileInfo, // Keep all existing data
        ...values, // Override with form values
        profileImg: (logoImage.imagePreviewUrl as string) || values.profileImg,
        id: userProfileInfo.id,
        roles: userProfileInfo.roles,
      }
      const response = await updateUserProfile(updatedData)
      if (typeof response !== 'string' && response?.data?.statusCode === 200) {
        updateProfile(updatedData)
        toggleEditProfile()
      } else {
        console.error('Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (): void => {
    setLogoImage({
      logoFile: '',
      imagePreviewUrl: userProfileInfo.profileImg || '',
      fileName: '',
    })
    setImgError('')
    toggleEditProfile()
  }

  return (
    <div className="p-4">
      <div className="rounded-lg p-6">
        <Formik
          initialValues={{
            profileImg: userProfileInfo.profileImg || '',
            firstName: userProfileInfo.firstName || '',
            lastName: userProfileInfo.lastName || '',
            email: userProfileInfo.email || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {(formik) => (
            <Form className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <div>
                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Profile Image
                    </span>
                    <div className="flex items-center space-x-4">
                      {logoImage.imagePreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoImage.imagePreviewUrl as string}
                          alt="Profile Preview"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src=""
                            alt={userProfileInfo?.email || 'Unknown'}
                          />
                          <AvatarFallback>
                            {userProfileInfo?.firstName?.[0]?.toUpperCase() ||
                              userProfileInfo?.lastName?.[0]?.toUpperCase() ||
                              '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <label
                          htmlFor="profileImg"
                          className="border-input text-foreground flex cursor-pointer items-center gap-4 rounded-md border p-2 text-base text-sm hover:bg-gray-50"
                        >
                          Upload Profile Image
                        </label>
                        <Input
                          id="profileImg"
                          name="profileImg"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        {imgError && (
                          <p className="text-destructive mt-1 text-sm">
                            {imgError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      First Name <span className="text-destructive">*</span>
                    </span>
                    <Field
                      as={Input}
                      innerref={firstNameInputRef}
                      name="firstName"
                      type="text"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full rounded-md p-2"
                      disabled={loading}
                    />
                    {formik.errors.firstName && formik.touched.firstName && (
                      <div className="text-destructive mt-1 text-sm">
                        {formik.errors.firstName}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </span>
                    <Field
                      as={Input}
                      name="lastName"
                      type="text"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full rounded-md p-2"
                      disabled={loading}
                    />
                    {formik.errors.lastName && formik.touched.lastName && (
                      <div className="text-destructive mt-1 text-sm">
                        {formik.errors.lastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky footer for Save/Cancel */}

              <div className="bg-background absolute bottom-0 left-0 flex w-full flex-col gap-2 space-y-2 border-t px-6 py-4">
                <Button
                  type="submit"
                  disabled={loading || !formik.isValid}
                  className="w-full"
                >
                  {loading ? <Loader /> : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
