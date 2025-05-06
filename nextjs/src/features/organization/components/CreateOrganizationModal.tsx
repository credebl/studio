'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import Stepper from '@/components/StepperComponent';
import {
  createOrganization,
  getAllCities,
  getAllCountries,
  getAllStates,
  getOrganizationById,
  updateOrganization
} from '@/app/api/organization';
import { processImageFile } from '@/components/ProcessImage';
import { AxiosResponse } from 'axios';
import { apiStatusCodes } from '@/config/CommonConstant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WalletSpinup from '@/features/wallet/WalletSpinupComponent';
import PageContainer from '@/components/layout/page-container';
import { IOrgFormValues } from './interfaces/organization';
import { Card } from '@/components/ui/card';
import Loader from '@/components/Loader';

export default function OrganizationOnboarding() {
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
  const [orgData, setOrgData] = useState<IOrgFormValues | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentOrgId = searchParams.get('orgId');
  const stepParam = searchParams.get('step');

  const [step, setStep] = useState<number>(1);

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
    if (currentOrgId) {
      setIsEditMode(true);
      fetchOrganizationDetails();
      getCountries();
    } else {
      if (stepParam) {
        setStep(Number(stepParam));
      }
    }
  }, [stepParam]);

  useEffect(() => {
    if (selectedCountryId) fetchStates(selectedCountryId);
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId && selectedCountryId)
      fetchCities(selectedCountryId, selectedStateId);
  }, [selectedStateId]);

  const getCountries = async () => {
    const response = await getAllCountries();
    const { data } = response as AxiosResponse;

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setCountries(data?.data || []);
      setFailure(null);
      setMessage(data?.message);
    } else {
      setFailure(data?.message as string);
      setMessage(response as string);
    }
  };

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

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    setImgError('');

    processImageFile(e, (result: string | null, error: string | null) => {
      if (result) {
        setLogoPreview(result);
        setFieldValue('logoPreview', result);
      } else {
        setImgError(error || 'Image processing failed');
        setFieldValue('logoPreview', '');
      }
    });
  };

  const handleSubmit = (values: IOrgFormValues) => {
    setOrgData(values);
    setStep(2);
  };

  const handleUpdateOrganization = async (values: IOrgFormValues) => {
    setLoading(true);
    try {
      setSuccess(null);
      setFailure(null);
  
      const orgData = {
        name: values.name,
        description: values.description,
        logo: logoPreview || '',
        website: values.website || '',
        countryId: values.countryId,
        stateId: values.stateId,
        cityId: values.cityId,
        isPublic: isPublic
      };
  
      const resCreateOrg = await updateOrganization(
        orgData,
        currentOrgId as string
      );
  
      const { data } = resCreateOrg as AxiosResponse;
  
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(data?.message as string);
        setTimeout(() => {
          setSuccess(null);
          setLoading(true); 
          router.push('/organizations'); 
        }, 3000);
      } else {
        setFailure(data?.message as string);
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      setFailure('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (values: IOrgFormValues) => {
    try {
      setSuccess(null);
      setFailure(null);
      setLoading(true);

      const orgData = {
        name: values.name,
        description: values.description,
        logo: logoPreview || '',
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

        setTimeout(() => {
          setSuccess(null);
          setLoading(true); 
          router.push('/organizations'); 
        }, 3000);

        return orgId;
      } else {
        setFailure(data?.message as string);
        return null;
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setLoading(false);
      return null;
    }
  };
  return (
    <PageContainer>
      <div className='bg-background flex min-h-screen items-start justify-center p-6'>
        {step === 1 ? (
          <Card className='p-8 py-12 border-border relative overflow-hidden rounded-xl border shadow-xl transition-transform duration-300 min-w-[700px] max-w-[800px] w-full'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-semibold'>
                  {isEditMode ? 'Edit Organization' : 'Organization Setup'}
                </h1>
                <p className=''>
                  {isEditMode
                    ? 'Edit your organization details'
                    : 'Tell us about your organization'}
                </p>
              </div>
              {!isEditMode && (
                <div className='text-muted-foreground text-sm'>
                  Step {step} of {totalSteps}
                </div>
              )}
            </div>

            {!isEditMode && (
              <Stepper currentStep={step} totalSteps={totalSteps} />
            )}

            {success && (
              <div className='bg-success text-success text-success mb-4 rounded px-4 py-3'>
                {success}
              </div>
            )}
            {failure && (
              <div className='bg-error text-destructive mb-4 rounded px-4 py-3'>
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
                logoPreview: orgData?.logoPreview || ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, setFieldValue, values, isValid, dirty }) => (
                <Form className='space-y-6'>
                  {/* Logo Upload */}
                  <div>
                    <Label className='mb-2 block pb-4'>Organization Logo</Label>
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
                            src={
                              logoPreview ||
                              orgData?.logoPreview ||
                              '/images/person_24dp_FILL0_wght400_GRAD0_opsz24 (2).svg'
                            }
                            alt='Logo Preview'
                          />
                        </Avatar>
                      )}

                      <div className='flex flex-col'>
                        <Input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                        {imgError && (
                          <p className='mt-1 text-sm text-destructive'>
                            {imgError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className='pb-4'>
                      Organization Name <span className='text-destructive'>*</span>
                    </Label>
                    <Field
                      as={Input}
                      name='name'
                      placeholder='Enter organization name'
                    />
                    {errors.name && touched.name && (
                      <p className='mt-1 text-xs text-destructive'>{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <Label className='pb-4'>
                      Description <span className='text-destructive'>*</span>
                    </Label>
                    <Field
                      as={Textarea}
                      name='description'
                      placeholder='Enter organization description'
                    />
                    {errors.description && touched.description && (
                      <p className='mt-1 text-xs text-destructive'>
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div>
                      <Label className='pb-4'>Country</Label>
                      <select
                        name='countryId'
                        value={values.countryId || ''}
                        className='w-full rounded-md border p-2'
                        onChange={(e) => {
                          const countryId = e.target.value
                            ? Number(e.target.value)
                            : null;
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
                        <p className='mt-1 text-xs text-destructive'>
                          {errors.countryId}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className='pb-4'>State</Label>
                      <select
                        name='stateId'
                        value={values.stateId || ''}
                        className='w-full rounded-md border p-2'
                        onChange={(e) => {
                          const stateId = e.target.value
                            ? Number(e.target.value)
                            : null;
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
                        <p className='mt-1 text-xs text-destructive'>
                          {errors.stateId}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className='pb-4'>City</Label>
                      <select
                        name='cityId'
                        value={values.cityId || ''}
                        className='w-full rounded-md border p-2'
                        onChange={(e) => {
                          const cityId = e.target.value
                            ? Number(e.target.value)
                            : null;
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
                        <p className='mt-1 text-xs text-destructive'>
                          {errors.cityId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <Label className='pb-4'>Website URL</Label>
                    <Field
                      as={Input}
                      name='website'
                      placeholder='https://example.com'
                    />
                    {errors.website && touched.website && (
                      <p className='mt-1 text-xs text-destructive'>
                        {errors.website}
                      </p>
                    )}
                  </div>

                  <div className='mx-2 grid'>
                    {isEditMode && (
                      <>
                        <div>
                          <div className='mt-2 mb-2 block text-sm font-medium'>
                            <Label htmlFor='name' />
                          </div>
                          <Field
                            type='radio'
                            checked={isPublic === false}
                            onChange={() => setIsPublic(false)}
                            id='private'
                            name='private'
                          />
                          <span className='ml-2'>
                            Private
                            <span className='block pl-6 text-sm'>
                              Only the connected organization can see your
                              organization details
                            </span>
                          </span>
                        </div>
                        <div>
                          <div className='mt-2 mb-2 block text-sm font-medium'>
                            <Label htmlFor='name' />
                          </div>
                          <Field
                            type='radio'
                            onChange={() => setIsPublic(true)}
                            checked={isPublic === true}
                            id='public'
                            name='public'
                          />
                          <span className='ml-2'>
                            Public
                            <span className='block pl-6 text-sm'>
                              Your profile and organization details can be seen
                              by everyone
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-between items-center">
                    <Button variant="secondary" onClick={() => router.push('/organizations')}>
                      Back
                    </Button>

                    {/* Right side: Conditional buttons */}
                    {!isEditMode ? (
                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleCreateOrganization(values)}
                          disabled={!isValid || !dirty}
                        >
                          {loading ? <Loader colorClass="animate-spin" height='1.5rem' width='1.5rem' /> : null} 
                          Setup Wallet Later
                        </Button>
                        <Button type="submit" disabled={!isValid || !dirty}>
                          Continue to Agent Setup
                        </Button>
                      </div>
                    ) : (
                      <div className="flex">
                        <Button
                          type="button"
                          onClick={() => handleUpdateOrganization(values)}
                        >
                         {loading ? <Loader colorClass="animate-spin" height='1.5rem' width='1.5rem' /> : null} 
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        ) : (
          <div>
            <WalletSpinup
          step={step}
          formData={orgData}
          orgId={currentOrgId ? currentOrgId : null}
          orgName={orgData?.name || ''}
          setWalletSpinupStatus={(flag: boolean) => setWalletSpinupStatus(flag)} ledgerConfig={false}							/>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
