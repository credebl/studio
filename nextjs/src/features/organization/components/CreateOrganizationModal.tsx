'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import Stepper from '@/features/common/stepperComponent';
import {
  createOrganization,
  getAllCities,
  getAllCountries,
  getAllStates,
  getOrganizationById,
  updateOrganization,
} from '@/app/api/organization';
import { processImage } from '@/utils/ProcessImage';
import { AxiosResponse } from 'axios';
import { apiStatusCodes } from '@/config/CommonConstant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WalletSpinup from '@/features/wallet/WalletSpinUp';

interface OrgFormValues {
  name: string;
  description: string;
  countryId?: number | null;
  stateId?: number | null;
  cityId?: number | null;
  website: string;
  logoFile?: File | null;
  logoPreview?: string;
}

export default function OrganizationOnboarding() {
  const [step, setStep] = useState<number>(1);
  const [isPublic, setIsPublic] = useState<boolean>();
  const totalSteps = 4;
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [imgError, setImgError] = useState<string>('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [orgData, setOrgData] = useState<OrgFormValues | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentOrgId = searchParams.get('orgId');
  const stepParam = searchParams.get('step');
  console.log("🚀 ~ OrganizationOnboarding ~ stepParam:", stepParam)

  const fetchOrganizationDetails = async () => {
    setLoading(true);
    const response = await getOrganizationById(currentOrgId as string);
    const { data } = response as AxiosResponse;
    setLoading(false);
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const org = data?.data;
      setOrgData(org);
      setIsPublic(org.publicProfile);
      if (org?.countryId) {
        setSelectedCountryId(org.countryId);
        fetchStates(org.countryId);
      }

      if (org?.stateId && org?.countryId) {
        setSelectedStateId(org.stateId);
        fetchCities(org.countryId, org.stateId);
      }
    } else {
      setFailure(data?.message as string);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    // Check if we're in edit mode
    if (currentOrgId) {
      setIsEditMode(true);
      fetchOrganizationDetails();
      getCountries();
    } else {
          if (stepParam) setStep(Number(stepParam));
    }
  }, []);

  useEffect(() => {
    if (selectedCountryId) fetchStates(selectedCountryId);
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId && selectedCountryId)
      fetchCities(selectedCountryId, selectedStateId);
  }, [selectedStateId]);


  const getCountries = async () => {
    const response = await getAllCountries();
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setCountries(data?.data || []);
        setError(null)
        setMessage(data?.message)

    } else {
        setError(error)
        setMessage(response as string)
    }
}

const fetchStates = async (countryId: number) => {
  try {
    const response = await getAllStates(countryId);
    const { data } = response as AxiosResponse;
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setStates(data.data || []);
    } else {
      setStates([]);
    }
  } catch (err) {
    console.error('Error fetching states:', err);
    setStates([]);
  }
};

const fetchCities = async (countryId: number, stateId: number) => {
  try {
    const response = await getAllCities(countryId, stateId);
    const { data } = response as AxiosResponse;
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setCities(data.data || []);
    } else {
      setCities([]);
    }
  } catch (err) {
    console.error('Error fetching cities:', err);
    setCities([]);
  }
};

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .min(2)
      .max(200)
      .required('Organization name is required'),
    description: yup
      .string()
      .min(2)
      .max(500)
      .required('Description is required'),
    website: yup.string().url('Enter a valid URL').nullable(),
    countryId: yup.number().nullable(),
    stateId: yup.number().nullable(),
    cityId: yup.number().nullable()
  });

  const handleImageChange = (e: any, setFieldValue: any) => {
    setImgError('');
    processImage(e, (result: any, error: any) => {
      if (result) {
        setLogoPreview(result);
        setFieldValue('logoFile', e.target.files[0]);
      } else {
        setImgError(error || 'Image processing failed');
      }
    });
  };

  const handleSubmit = (values: OrgFormValues) => {
    setOrgData(values);
    setStep(2); // Move to wallet setup
    // router.push('/organization/agent-configuration?step=2');
  };

  const handleUpdateOrganization = async (values: OrgFormValues) => {
    setLoading(true);

    try {
      setSuccess(null);
      setFailure(null);

      const orgData = {
        name: values.name,
        description: values.description,
        logo: values.logoFile ? values.logoFile : null,
        website: values.website || '',
        countryId: values.countryId,
        stateId: values.stateId,
        cityId: values.cityId,
        isPublic: isPublic,
      };

      const resCreateOrg = await updateOrganization(orgData, currentOrgId as string);
      const { data } = resCreateOrg as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(data?.message as string);
        setLoading(false);
        router.push('/organizations');
      } else {
        setFailure(data?.message as string);

        return null;
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      // setFailure( error as string);
      return null;
    }
  };


  const handleCreateOrganization = async (values: OrgFormValues) => {
    try {
      setSuccess(null);
      setFailure(null);

      const orgData = {
        name: values.name,
        description: values.description,
        logo: values.logoFile ? values.logoFile : null,
        website: values.website || '',
        countryId: values.countryId,
        stateId: values.stateId,
        cityId: values.cityId
      };

      const resCreateOrg = await createOrganization(orgData);
      const { data } = resCreateOrg as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const orgId = data?.data?.id || data?.data?._id;
        setSuccess(data.message as string);
        // Redirect to organizations page or wherever needed after creation
        router.push('/organizations');
        return orgId;
      } else {
        setFailure(data?.message as string);

        return null;
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      // setFailure(error as string);
      return null;
    }
  };


  return (
    <div className='bg-background flex min-h-screen items-start justify-center p-6'>
      {step === 1 ? (
        <div className='max-w-4xl rounded-lg p-6 shadow-md'>
          {/* Header */}
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-semibold'>{isEditMode ? 'Edit Organization' : 'Organization Setup'}</h1>
              <p className='text-gray-600'>{isEditMode ? 'Edit your organization details' : 'Tell us about your organization'}</p>
            </div>
            {!isEditMode && 
            <div className='text-muted-foreground text-sm'>
              Step {step} of {totalSteps}
            </div>}
            
          </div>

          {/* Stepper */}
          {
            !isEditMode && 
          <Stepper currentStep={step} totalSteps={totalSteps} />
          }

          {/* Success/Error Messages */}
          {success && (
            <div className='text-success text-success mb-4 rounded px-4 py-3'>
              {success}
            </div>
          )}
          {failure && (
            <div className='text-destructive mb-4 rounded px-4 py-3'>
              {failure}
            </div>
          )}
          <Formik
            enableReinitialize
            initialValues={{
              name: orgData?.name || '',
              description: orgData?.description || '',
              countryId: orgData?.countryId ?? null,
              stateId: orgData?.stateId ?? null,
              cityId: orgData?.cityId ?? null,
              website: orgData?.website || '',
              logoFile: null,
              logoPreview: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, setFieldValue, values, isValid, dirty }) => (
              <Form className='space-y-6'>
                {/* Logo Upload */}
                <div>
                  <Label className='mb-2 block'>Organization Logo</Label>
                  <div className='border-input flex items-center gap-4 rounded-md border p-4'>
                    {logoPreview ? (
                      <Avatar className='h-24 w-24'>
                        <AvatarImage
                          src={logoPreview}
                          alt='Logo Preview'
                          className='object-cover'
                        />
                        <AvatarFallback>Logo</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className='h-24 w-24'>
                       <AvatarImage
                        src={logoPreview || orgData?.logoPreview || '/images/person_24dp_FILL0_wght400_GRAD0_opsz24 (2).svg'}
                        alt='Logo Preview'
                      />

                        {/* <AvatarFallback>No Logo</AvatarFallback> */}
                      </Avatar>
                    )}

                    <div className='flex flex-col'>
                      <Input
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, setFieldValue)}
                      />
                      {imgError && (
                        <p className='mt-1 text-sm text-red-500'>{imgError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organization Name */}
                <div>
                  <Label>
                    Organization Name <span className='text-red-500'>*</span>
                  </Label>
                  <Field
                    as={Input}
                    name='name'
                    placeholder='Enter organization name'
                  />
                  {errors.name && touched.name && (
                    <p className='mt-1 text-xs text-red-500'>{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label>
                    Description <span className='text-red-500'>*</span>
                  </Label>
                  <Field
                    as={Textarea}
                    name='description'
                    placeholder='Enter organization description'
                  />
                  {errors.description && touched.description && (
                    <p className='mt-1 text-xs text-red-500'>
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div>
                    <Label>Country</Label>
                    <select
                      name='countryId'
                      value={values.countryId || ''}
                      className='w-full rounded-md border p-2'
                      onChange={(e) => {
                        const countryId = e.target.value ? Number(e.target.value) : null;
                        setSelectedCountryId(countryId);
                        setSelectedStateId(null);
                        setCities([]);
                        setStates([]);
                        setFieldValue('countryId', countryId);
                        setFieldValue('stateId', null);
                        setFieldValue('cityId', null);
                      }}
                    >
                      <option value=''>Select country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.countryId && touched.countryId && (
                      <p className='mt-1 text-xs text-red-500'>{errors.countryId}</p>
                    )}
                  </div>

                  <div>
                    <Label>State</Label>
                    <select
                      name='stateId'
                      value={values.stateId || ''}
                      className='w-full rounded-md border p-2'
                      onChange={(e) => {
                        const stateId = e.target.value ? Number(e.target.value) : null;
                        setSelectedStateId(stateId);
                        setFieldValue('stateId', stateId);
                        setFieldValue('cityId', null);
                      }}
                      disabled={!values.countryId}
                    >
                      <option value=''>Select state</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    {errors.stateId && touched.stateId && (
                      <p className='mt-1 text-xs text-red-500'>{errors.stateId}</p>
                    )}
                  </div>

                  <div>
                    <Label>City</Label>
                    <select
                      name='cityId'
                      value={values.cityId || ''}
                      className='w-full rounded-md border p-2'
                      onChange={(e) => {
                        const cityId = e.target.value;
                        setFieldValue('cityId', cityId);
                      }}
                      disabled={!values.stateId}
                    >
                      <option value=''>Select city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.cityId && touched.cityId && (
                      <p className='mt-1 text-xs text-red-500'>{errors.cityId}</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <Label>Website URL</Label>
                  <Field
                    as={Input}
                    name='website'
                    placeholder='https://example.com'
                  />
                  {errors.website && touched.website && (
                    <p className='mt-1 text-xs text-red-500'>
                      {errors.website}
                    </p>
                  )}
                </div>

                <div className="mx-2 grid ">
                  {isEditMode && 
                  <><div>
                      <div className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        <Label htmlFor="name" />
                      </div>
                      <Field
                        type="radio"
                        checked={isPublic === false}
                        onChange={() => setIsPublic(false)}
                        id="private"
                        name="private" />
                      <span className="ml-2 text-gray-900 dark:text-white">
                        Private
                        <span className="block pl-6 text-gray-500 text-sm">
                          Only the connected organization can see your organization
                          details
                        </span>
                      </span>
                    </div><div>
                        <div className="block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-white">
                          <Label htmlFor="name" />
                        </div>
                        <Field
                          type="radio"
                          onChange={() => setIsPublic(true)}
                          checked={isPublic === true}
                          id="public"
                          name="public" />
                        <span className="ml-2 text-gray-900 dark:text-white">
                          Public
                          <span className="block pl-6 text-gray-500 text-sm">
                            Your profile and organization details can be seen by
                            everyone
                          </span>
                        </span>
                      </div></>
                  }
								
							</div>

                {/* Actions */}
                <div className='mt-6 flex justify-between'>
                  <Button
                    
                    onClick={() => router.push('/organizations')}
                  >
                    Back
                  </Button>
                  {
                    !isEditMode ? 
                    (
                    <><Button
                      type='button'
                      onClick={() => handleCreateOrganization(values)}
                      disabled={!isValid || !dirty}
                    >
                      Setup Wallet Later
                    </Button>
                    <Button type='submit' disabled={!isValid || !dirty}>
                        Continue to Agent Setup
                      </Button></>)
                      :
                      (
                        <>
                        <Button
                      type='button'
                      onClick={() => handleUpdateOrganization(values)}
                      // disabled={!isValid || !dirty}
                    >
                      Save
                    </Button>
                        </>
                      )
                  }
                </div>
              </Form>
            )}
          </Formik>
        </div>
      ) : <div>
      <WalletSpinup
          step={step}
          formData={orgData}
          orgId={currentOrgId ? currentOrgId : null}
          orgName={orgData?.name || ''}
          setWalletSpinupStatus={(flag: boolean) => setWalletSpinupStatus(flag)} ledgerConfig={false}							/>
      </div>}
       
    </div>
  );
}
