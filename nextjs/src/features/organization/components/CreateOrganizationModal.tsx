/* eslint-disable max-lines */
'use client'

import * as yup from 'yup'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import {
  createOrganization,
  getOrganizationById,
  updateOrganization,
} from '@/app/api/organization'
import {
  getAllCities,
  getAllCountries,
  getAllStates,
} from '@/app/api/geolocation'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IOrgFormValues } from './interfaces/organization'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import PageContainer from '@/components/layout/page-container'
import Stepper from '@/components/StepperComponent'
import { Textarea } from '@/components/ui/textarea'
import { apiStatusCodes } from '@/config/CommonConstant'
import { processImageFile } from '@/components/ProcessImage'

type Countries = {
  id: number
  name: string
}

type State = {
  id: number
  name: string
  countryId: number
  countryCode: string
}

type City = {
  id: number
  name: string
  stateId: number
  stateCode: string
  countryId: number
  countryCode: string
}

export default function OrganizationOnboarding(): React.JSX.Element {
  const [isPublic, setIsPublic] = useState<boolean>()
  const totalSteps = 4
  const [countries, setCountries] = useState<Countries[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [imgError, setImgError] = useState<string>('')
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  )
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null)
  const [orgData, setOrgData] = useState<IOrgFormValues | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const orgId = searchParams.get('orgId')

  const getCountries = async (): Promise<void> => {
    const response = await getAllCountries()
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      setCountries(data?.data || [])
      setFailure(null)
      setMessage(data?.message)
    } else {
      setFailure(data?.message as string)
      setMessage(response as string)
    }
  }

  const fetchStates = async (countryId: number): Promise<void> => {
    try {
      const response = await getAllStates(countryId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setStates(data.data || [])
      } else {
        setStates([])
      }
    } catch (err) {
      console.error('Error fetching states:', err)
      setStates([])
    }
  }

  const fetchCities = async (
    countryId: number,
    stateId: number,
  ): Promise<void> => {
    try {
      const response = await getAllCities(countryId, stateId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setCities(data.data || [])
      } else {
        setCities([])
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      setCities([])
    }
  }

  const fetchOrganizationDetails = async (): Promise<void> => {
    setLoading(true)
    const response = await getOrganizationById(orgId as string)
    const { data } = response as AxiosResponse
    setLoading(false)
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const org = data?.data
      setOrgData(org)
      setIsPublic(org.publicProfile)
      if (org?.countryId) {
        setSelectedCountryId(org.countryId)
        fetchStates(org.countryId)
      }

      if (org?.stateId && org?.countryId) {
        setSelectedStateId(org.stateId)
        fetchCities(org.countryId, org.stateId)
      }
    } else {
      setFailure(data?.message as string)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (orgId) {
      setIsEditMode(true)
      fetchOrganizationDetails()
      getCountries()
    }
  }, [])

  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId)
    }
  }, [selectedCountryId])

  useEffect(() => {
    if (selectedStateId && selectedCountryId) {
      fetchCities(selectedCountryId, selectedStateId)
    }
  }, [selectedStateId])

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
    cityId: yup.number().nullable(),
  })

  type ImageProcessCallback = (result: string | null, error?: string) => void

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<ImageProcessCallback>['setFieldValue'],
  ): Promise<void> => {
    setImgError('')

    processImageFile(e, (result: string | null, error?: string) => {
      if (result) {
        setLogoPreview(result)
        setFieldValue('logoPreview', result)
      } else {
        setImgError(error || 'Image processing failed')
        setFieldValue('logoPreview', '')
      }
    })
  }

  // const handleSubmit = (values: IOrgFormValues) => {
  //   dispatch(setFormData(values));
  //   dispatch(setIsCreateOrgForm(false));
  //   dispatch(setStep(2));

  //   router.push('/organizations/agent-config')
  // };

  const handleUpdateOrganization = async (
    values: IOrgFormValues,
  ): Promise<void> => {
    setLoading(true)
    try {
      setSuccess(null)
      setFailure(null)

      const orgData = {
        name: values.name,
        description: values.description,
        logo: logoPreview || '',
        website: values.website || '',
        countryId: values.countryId,
        stateId: values.stateId,
        cityId: values.cityId,
        isPublic,
      }

      const resCreateOrg = await updateOrganization(orgData, orgId as string)

      const { data } = resCreateOrg as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(data?.message as string)
        setTimeout(() => {
          setSuccess(null)
          setLoading(true)
          router.push('/organizations')
        }, 3000)
      } else {
        setFailure(data?.message as string)
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      setFailure('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAndContinue = async (
    values: IOrgFormValues,
  ): Promise<void> => {
    setLoading(true)
    try {
      setSuccess(null)
      setFailure(null)

      const orgData = {
        name: values.name,
        description: values.description,
        logo: logoPreview || '',
        website: values.website || '',
        countryId: values.countryId,
        stateId: values.stateId,
        cityId: values.cityId,
      }

      const resCreateOrg = await createOrganization(orgData)
      const { data } = resCreateOrg as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const orgId = data?.data?.id || data?.data?._id
        setSuccess(data.message as string)

        setTimeout(() => {
          router.push(`/organizations/agent-config?orgId=${orgId}`)
        }, 3000)
      } else {
        setFailure(data?.message as string)
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      setFailure('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex min-h-screen items-start justify-center bg-[image:var(--card-gradient)] p-6">
        <Card className="border-border relative w-full max-w-[800px] min-w-[700px] overflow-hidden rounded-xl border p-8 py-12 shadow-xl transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {isEditMode ? 'Edit Organization' : 'Organization Setup'}
              </h1>
              <p className="">
                {isEditMode
                  ? 'Edit your organization details'
                  : 'Tell us about your organization'}
              </p>
            </div>
            {!isEditMode && (
              <div className="text-muted-foreground text-sm">
                Step 1 of {totalSteps}
              </div>
            )}
          </div>
          {!isEditMode && <Stepper currentStep={1} totalSteps={totalSteps} />}

          {success && (
            <div className="w-full" role="alert">
              <AlertComponent
                message={success}
                type={'success'}
                onAlertClose={() => {
                  if (setSuccess) {
                    setSuccess(null)
                  }
                }}
              />
            </div>
          )}
          {failure && (
            <div className="w-full" role="alert">
              <AlertComponent
                message={failure}
                type={'failure'}
                onAlertClose={() => {
                  if (setFailure) {
                    setFailure(null)
                  }
                }}
              />
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
              logoPreview: orgData?.logoPreview || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleCreateAndContinue}
          >
            {({ errors, touched, setFieldValue, values, isValid, dirty }) => (
              <Form className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label className="mb-2 block pb-4">Organization Logo</Label>
                  <div className="border-input flex items-center gap-4 rounded-md border p-4">
                    {logoPreview ? (
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={logoPreview}
                          alt="Logo Preview"
                          className="object-cover"
                        />
                        <AvatarFallback>Logo</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-24 w-24 rounded-none">
                        <AvatarImage
                          src={
                            logoPreview ||
                            orgData?.logoPreview ||
                            '/images/upload_logo_file.svg'
                          }
                          alt="Logo Preview"
                        />
                      </Avatar>
                    )}

                    <div className="flex flex-col">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, setFieldValue)}
                      />
                      {imgError && (
                        <p className="text-destructive mt-1 text-sm">
                          {imgError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="pb-4">
                    Organization Name{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Field
                    as={Input}
                    name="name"
                    placeholder="Enter organization name"
                  />
                  {errors.name && touched.name && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="pb-4">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Field
                    as={Textarea}
                    name="description"
                    placeholder="Enter organization description"
                  />
                  {errors.description && touched.description && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label className="pb-4">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <select
                      name="countryId"
                      value={values.countryId || ''}
                      className="w-full rounded-md border p-2"
                      onChange={(e) => {
                        const countryId = e.target.value
                          ? Number(e.target.value)
                          : null
                        setSelectedCountryId(countryId)
                        setSelectedStateId(null)
                        setCities([])
                        setStates([])
                        setFieldValue('countryId', countryId)
                        setFieldValue('stateId', null)
                        setFieldValue('cityId', null)
                      }}
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.countryId && touched.countryId && (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.countryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="pb-4">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <select
                      name="stateId"
                      value={values.stateId || ''}
                      className="w-full rounded-md border p-2"
                      onChange={(e) => {
                        const stateId = e.target.value
                          ? Number(e.target.value)
                          : null
                        setSelectedStateId(stateId)
                        setFieldValue('stateId', stateId)
                        setFieldValue('cityId', null)
                      }}
                      disabled={!values.countryId}
                    >
                      <option value="">Select state</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    {errors.stateId && touched.stateId && (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.stateId}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="pb-4">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <select
                      name="cityId"
                      value={values.cityId || ''}
                      className="w-full rounded-md border p-2"
                      onChange={(e) => {
                        const cityId = e.target.value
                          ? Number(e.target.value)
                          : null
                        setFieldValue('cityId', cityId)
                      }}
                      disabled={!values.stateId}
                    >
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.cityId && touched.cityId && (
                      <p className="text-destructive mt-1 text-xs">
                        {errors.cityId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <Label className="pb-4">Website URL</Label>
                  <Field
                    as={Input}
                    name="website"
                    placeholder="https://example.com"
                  />
                  {errors.website && touched.website && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.website}
                    </p>
                  )}
                </div>

                <div className="mx-2 grid">
                  {isEditMode && (
                    <>
                      <div>
                        <div className="mt-2 mb-2 block text-sm font-medium">
                          <Label htmlFor="name" />
                        </div>
                        <Field
                          type="radio"
                          checked={isPublic === false}
                          onChange={() => setIsPublic(false)}
                          id="private"
                          name="private"
                        />
                        <span className="ml-2">
                          Private
                          <span className="block pl-6 text-sm">
                            Only the connected organization can see your
                            organization details
                          </span>
                        </span>
                      </div>
                      <div>
                        <div className="mt-2 mb-2 block text-sm font-medium">
                          <Label htmlFor="name" />
                        </div>
                        <Field
                          type="radio"
                          onChange={() => setIsPublic(true)}
                          checked={isPublic === true}
                          id="public"
                          name="public"
                        />
                        <span className="ml-2">
                          Public
                          <span className="block pl-6 text-sm">
                            Your profile and organization details can be seen by
                            everyone
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/organizations')}
                  >
                    Back
                  </Button>

                  {!isEditMode ? (
                    <Button
                      type="submit"
                      disabled={!isValid || !dirty || loading}
                    >
                      {loading ? (
                        <Loader
                          colorClass="animate-spin"
                          height="1.5rem"
                          width="1.5rem"
                        />
                      ) : (
                        'Create Organization'
                      )}
                    </Button>
                  ) : (
                    <div className="flex">
                      <Button
                        type="button"
                        onClick={() => handleUpdateOrganization(values)}
                      >
                        {loading ? (
                          <Loader
                            colorClass="animate-spin"
                            height="1.5rem"
                            width="1.5rem"
                          />
                        ) : null}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </PageContainer>
  )
}
