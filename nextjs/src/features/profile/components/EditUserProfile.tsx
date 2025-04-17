'use client';

import { useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import {
  IMG_MAX_HEIGHT,
  IMG_MAX_WIDTH,
  imageSizeAccepted
} from '@/config/CommonConstant';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { IUserProfile } from '@/components/profile/interfaces';
import { updateUserProfile } from '@/app/api/Auth';
import { calculateSize, dataURItoBlob } from '@/utils/CompressImage';

interface Values {
  profileImg: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ILogoImage {
  logoFile: string | File;
  imagePreviewUrl: string | ArrayBuffer | null;
  fileName: string;
}

interface EditUserProfileProps {
  toggleEditProfile: () => void;
  userProfileInfo: IUserProfile;
  updateProfile: (updatedProfile: IUserProfile) => void;
}

export default function EditUserProfile({
  toggleEditProfile,
  userProfileInfo,
  updateProfile
}: EditUserProfileProps) {
  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState<ILogoImage>({
    logoFile: '',
    imagePreviewUrl: userProfileInfo.profileImg || '',
    fileName: ''
  });
  const [imgError, setImgError] = useState('');
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus();
    }
  }, []);

  const validationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required').min(2).max(50),
    lastName: yup.string().required('Last name is required').min(2).max(50)
  });

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const imgElement = document.createElement('img');
      imgElement.src = event.target?.result as string;
      imgElement.onload = (e) => {
        const { width, height, ev } = calculateSize(
          imgElement,
          IMG_MAX_WIDTH,
          IMG_MAX_HEIGHT
        );
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx && e.target) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(ev, 0, 0, canvas.width, canvas.height);
          const srcEncoded = canvas.toDataURL(file.type);
          const blob = dataURItoBlob(srcEncoded, file.type);
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: new Date().getTime()
          });
          setLogoImage({
            logoFile: compressedFile,
            imagePreviewUrl: srcEncoded,
            fileName: file.name
          });
        }
      };
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / 1024 / 1024;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!['jpg', 'jpeg', 'png'].includes(extension || '')) {
      setImgError('Invalid image type');
      return;
    }
    if (fileSizeMB > imageSizeAccepted) {
      setImgError('Please check image size');
      return;
    }

    processImage(file);
  };

  const handleSubmit = async (values: Values) => {
    setLoading(true);
    try {
      const updatedData: IUserProfile = {
        ...values,
        profileImg: (logoImage.imagePreviewUrl as string) || values.profileImg,
        id: userProfileInfo.id,
        roles: userProfileInfo.roles
      };
      const response = await updateUserProfile(updatedData);
      if (typeof response !== 'string' && response?.data?.statusCode === 200) {
        updateProfile(updatedData);
        toggleEditProfile();
      } else {
        console.error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-card rounded-lg p-6'>
      <Formik
        initialValues={{
          profileImg: userProfileInfo.profileImg || '',
          firstName: userProfileInfo.firstName || '',
          lastName: userProfileInfo.lastName || '',
          email: userProfileInfo.email || ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                First Name
              </label>
              <input
                ref={firstNameInputRef}
                name='firstName'
                type='text'
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className='w-full rounded-md border p-2'
              />
              {formik.errors.firstName && formik.touched.firstName && (
                <div className='mt-1 text-sm text-red-500'>
                  {formik.errors.firstName}
                </div>
              )}
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Last Name
              </label>
              <input
                name='lastName'
                type='text'
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className='w-full rounded-md border p-2'
              />
              {formik.errors.lastName && formik.touched.lastName && (
                <div className='mt-1 text-sm text-red-500'>
                  {formik.errors.lastName}
                </div>
              )}
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>
                Profile Image
              </label>
              <div className='flex items-center space-x-4'>
                {logoImage.imagePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoImage.imagePreviewUrl as string}
                    alt='Profile Preview'
                    className='h-24 w-24 rounded-full object-cover'
                  />
                ) : (
                  <Avatar className='h-24 w-24'>
                    <AvatarImage
                      src=''
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
                  <input
                    id='profileImg'
                    name='profileImg'
                    type='file'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='file:bg-primary hover:file:bg-primary-dark text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white'
                  />
                  {imgError && (
                    <div className='text-sm text-red-500'>{imgError}</div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='secondary'
                onClick={toggleEditProfile}
              >
                Cancel
              </Button>
              <Button type='submit'>
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
