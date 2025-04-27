'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createOrganization, updateOrganization } from '@/app/api/organization';
import Image from 'next/image';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { AxiosResponse } from 'axios';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { personSvg } from '@/config/CommonConstant';
import { Organisation } from './organization-dashboard';

interface OrganizationModalProps {
  open: boolean;
  setOpen: (flag: boolean) => void;
  setMessage?: (msg: string) => void;
  mode: string;
  orgData?: Organisation | null;
  onSuccess?: () => void;
}

interface ILogoImage {
  imagePreviewUrl: string | null;
  fileName: string;
}

export default function OrganizationModal({
  open,
  setOpen,
  setMessage,
  mode,
  orgData,
  onSuccess
}: OrganizationModalProps) {
  const [logoImage, setLogoImage] = useState<ILogoImage>({
    imagePreviewUrl: null,
    fileName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [imgError, setImgError] = useState('');
  const router = useRouter();

  const imageSizeAccepted = 1; // 1MB

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      website: '',
      isPublic: false
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .min(2, 'Organization name must be at least 2 characters')
        .max(200, 'Max 200 characters')
        .required('Organization name is required'),
      description: Yup.string()
        .min(2, 'Description must be at least 2 characters')
        .max(500, 'Max 500 characters')
        .required('Description is required'),
      website: Yup.string().url('Please enter a valid URL').nullable()
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        if (mode === 'create') {
          const orgData = {
            name: values.name,
            description: values.description,
            logo: logoImage.imagePreviewUrl || '',
            website: values.website || '',
            isPublic: values.isPublic
          };

          const response = await createOrganization(orgData);
          const { data } = response as AxiosResponse;

          if (data?.statusCode === 201) {
            setMessage?.(data.message || 'Organization created successfully');
            setOpen(false);
            router.refresh();
            if (onSuccess) onSuccess();
          } else {
            setErrMsg((response as string) || 'Failed to create organization');
          }
        } else if (mode === 'edit') {
          const updateData = {
            orgId: orgData?.id,
            name: values.name,
            description: values.description,
            website: values.website || '',
            isPublic: values.isPublic
          };

          const logo = logoImage?.imagePreviewUrl || '';
          if (
            logo &&
            logo.includes('data:image/') &&
            logo.includes(';base64')
          ) {
            updateData['logo'] = logo;
          }

          const response = await updateOrganization(
            updateData,
            orgData?.id as string
          );
          const { data } = response as AxiosResponse;

          if (data?.statusCode === 200) {
            setMessage?.(data.message || 'Organization updated successfully');
            setOpen(false);
            if (onSuccess) onSuccess();

            window.location.reload();
          } else {
            setErrMsg((response as string) || 'Failed to update organization');
          }
        }
      } catch (error) {
        console.error('Organization operation failed:', error);
        setErrMsg('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (open && mode === 'edit' && orgData) {
      console.log('Setting form values for edit mode:', orgData);

      formik.setValues({
        name: orgData.name || '',
        description: orgData.description || '',
        website: orgData.website || '',
        isPublic: orgData.publicProfile || false
      });

      setLogoImage({
        imagePreviewUrl: orgData.logoUrl || null,
        fileName: orgData.logoUrl ? 'Current logo' : ''
      });
    } else if (open && mode === 'create') {
      formik.resetForm();
      setLogoImage({
        imagePreviewUrl: null,
        fileName: ''
      });
    }
  }, [open, mode, orgData]);

  useEffect(() => {
    if (!open) {
      setErrMsg(null);
      setImgError('');
    }
  }, [open]);

  const processImage = (
    event: ChangeEvent<HTMLInputElement>,
    callback: (result: string | null, error?: string) => void
  ) => {
    const reader = new FileReader();
    const file = event.target.files;
    if (file && file[0]) {
      const fileSize = Number((file[0].size / 1024 / 1024).toFixed(2));
      const extension = file[0].name.split('.').pop()?.toLowerCase();
      if (
        ['png', 'jpeg', 'jpg'].includes(extension!) &&
        fileSize <= imageSizeAccepted
      ) {
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file[0]);
      } else {
        callback(
          null,
          extension ? 'Please check image size (max 1MB)' : 'Invalid image type'
        );
      }
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImgError('');
    processImage(event, (result, error) => {
      if (result) {
        setLogoImage({
          imagePreviewUrl: result,
          fileName: event.target.files?.[0].name || ''
        });
      } else {
        setImgError(error || 'Image processing failed.');
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setErrMsg(null);
          setImgError('');
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Organization' : 'Edit Organization'}
          </DialogTitle>
        </DialogHeader>

        {errMsg && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{errMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className='space-y-4'>
          <div className='flex flex-col items-center gap-4 rounded-lg p-4 sm:flex-row'>
            {logoImage.imagePreviewUrl ? (
              <Image
                src={logoImage.imagePreviewUrl}
                alt={logoImage.fileName}
                width={80}
                height={80}
                className='rounded-lg object-cover'
              />
            ) : (
              <Image
              src={personSvg}
              alt={personSvg}
              width={80}
              height={80}
              className='rounded-lg object-cover'
            />
            )}
            <div className='flex-1'>
              <h3 className='mb-1 font-medium'>Organization Logo</h3>
              <p className='text-muted-foreground mb-2 text-xs'>
                JPG, JPEG and PNG. Max size of 1MB
              </p>
              <div>
              <label htmlFor="organizationlogo">
             
													<input
														type="file"
														accept="image/*"
														name="file"
														className=""
														id="organizationlogo"
														title=""
														onChange={(event): void => handleImageChange(event)}
													/>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {logoImage.fileName || ''}
                </p>
                {imgError && <p className='text-xs text-red-500'>{imgError}</p>}
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor='name'>
              Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              name='name'
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Your organization name'
            />
            {formik.touched.name && formik.errors.name && (
              <p className='mt-1 text-xs text-red-500'>{formik.errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor='description'>
              Description <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='description'
              name='description'
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Description of your organization'
            />
            {formik.touched.description && formik.errors.description && (
              <p className='mt-1 text-xs text-red-500'>
                {formik.errors.description}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='website'>Website URL</Label>
            <Input
              id='website'
              name='website'
              value={formik.values.website || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder='Add org URL'
            />
            {formik.touched.website && formik.errors.website && (
              <p className='mt-1 text-xs text-red-500'>
                {formik.errors.website}
              </p>
            )}
          </div>

          {mode === 'edit' && (
            <div className='space-y-3'>
              <Label>Organization Visibility</Label>
              <RadioGroup
                value={formik.values.isPublic ? 'public' : 'private'}
                onValueChange={(value) => {
                  formik.setFieldValue('isPublic', value === 'public');
                }}
              >
                <div className='flex items-start space-x-2'>
                  <RadioGroupItem value='private' id='private' />
                  <div className='grid gap-1'>
                    <Label htmlFor='private'>Private</Label>
                    <p className='text-muted-foreground text-sm'>
                      Only the connected organization can see your organization
                      details
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-2'>
                  <RadioGroupItem value='public' id='public' />
                  <div className='grid gap-1'>
                    <Label htmlFor='public'>Public</Label>
                    <p className='text-muted-foreground text-sm'>
                      Your profile and organization details can be seen by
                      everyone
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <span className='flex items-center gap-2'>
                  <svg
                    className='mr-2 -ml-1 h-4 w-4 animate-spin text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </span>
              ) : (
                <span className='flex items-center gap-2'>
                  {mode === 'create' ? 'Create' : 'Save'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
