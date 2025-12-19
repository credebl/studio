/* eslint-disable max-lines */
'use client'

import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createOrganization,
  getOrganizationById,
  updateOrganization,
} from '@/app/api/organization'
import { fetchCities, fetchCountries, fetchStates } from '../helper/geoHelpers'
import { setOrgId, setTenantData } from '@/lib/orgSlice'
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
import LogoUploader from './LogoUploader'
import PageContainer from '@/components/layout/page-container'
import Stepper from '@/components/StepperComponent'
import { apiStatusCodes } from '@/config/CommonConstant'
import { useAppDispatch } from '@/lib/hooks'

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
  const [loading, setLoading] = useState<boolean>(false)
  const [createLoading, setCreateLoading] = useState<boolean>(false)
  const [dataLoaded, setDataLoaded] = useState<boolean>(false)
  const [initializing, setInitializing] = useState<boolean>(true)
  const [isBackLoading, setIsBackLoading] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const orgId = searchParams.get('orgId')
  const redirectTo = searchParams.get('redirectTo')
  const clientAlias = searchParams.get('clientAlias')
  const dispatch = useAppDispatch()

  const fetchOrganizationDetails = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await getOrganizationById(orgId as string)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const org = data?.data
        setOrgData(org)
        setIsPublic(org.publicProfile)
        if (org?.countryId) {
          setSelectedCountryId(org.countryId)
          const fetchedStates = await fetchStates(org.countryId)
          setStates(fetchedStates)
        }

        if (org?.stateId && org?.countryId) {
          setSelectedStateId(org.stateId)

          const fetchedCities = await fetchCities(org.countryId, org.stateId)
          setCities(fetchedCities)
        }
      } else {
        setFailure(data?.message as string)
      }
    } catch (error) {
      console.error('Error fetching organization details:', error)
      setFailure('Failed to load organization details')
    } finally {
      setLoading(false)
      setDataLoaded(true)
    }
  }

  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      setInitializing(true)
      try {
        const countryList = await fetchCountries()
        setCountries(countryList)

        if (orgId) {
          setIsEditMode(true)
          await fetchOrganizationDetails()
        } else {
          setDataLoaded(true)
        }
      } catch (e) {
        setFailure((e as Error).message)
      } finally {
        setInitializing(false)
      }
    }

    initializeData()
  }, [orgId])

  // These useEffects handle state/city loading when user changes selections
  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId).then(setStates)
    }
  }, [selectedCountryId])

  useEffect(() => {
    if (selectedStateId && selectedCountryId) {
      fetchCities(selectedCountryId, selectedStateId).then(setCities)
    }
  }, [selectedStateId, selectedCountryId])

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
    countryId: yup.number().required('Country is required'),
    stateId: yup.number().nullable(),
    cityId: yup.number().nullable(),
  })

  const handleUpdateOrganization = async (
    values: IOrgFormValues,
  ): Promise<void> => {
    setCreateLoading(true)
    try {
      setSuccess(null)
      setFailure(null)

      const orgData = {
        name: values.name,
        description: values.description,
        logo: logoPreview || values?.logoUrl || '',
        website: values.website || '',
        countryId: values.countryId,
        // Only include state/city if they exist and are selected
        stateId: states.length > 0 ? values.stateId : null,
        cityId: cities.length > 0 ? values.cityId : null,
        isPublic,
      }

      const resCreateOrg = await updateOrganization(orgData, orgId as string)

      const { data } = resCreateOrg as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setSuccess(data?.message as string)

        if (orgId) {
          dispatch(
            setTenantData({
              id: orgId,
              name: values.name,
              logoUrl: values.logoPreview ?? orgData?.logo,
            }),
          )
        }
        setTimeout(() => {
          setSuccess(null)
          setLoading(true)
          router.push('/dashboard')
        }, 3000)
      } else {
        setFailure(resCreateOrg as string)
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      setFailure('An unexpected error occurred. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCreateAndContinue = async (
    values: IOrgFormValues,
  ): Promise<void> => {
    setCreateLoading(true)
    try {
      setSuccess(null)
      setFailure(null)

      const orgData = {
        name: values.name,
        description: values.description,
        logo: logoPreview || '',
        website: values.website || '',
        countryId: values.countryId,
        stateId: states.length > 0 ? values.stateId : null,
        cityId: cities.length > 0 ? values.cityId : null,
      }

      const resCreateOrg = await createOrganization(orgData)
      const { data } = resCreateOrg as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const orgId = data?.data?.id || data?.data?._id

        dispatch(setOrgId(orgId))
        dispatch(
          setTenantData({
            id: orgId,
            name: data.name,
            logoUrl: data.logoUrl,
          }),
        )
        setSuccess(data.message as string)

        setTimeout(() => {
          const redirectUrl =
            redirectTo && clientAlias
              ? `/wallet-setup?orgId=${orgId}&redirectTo=${encodeURIComponent(redirectTo)}&clientAlias=${clientAlias}`
              : `/wallet-setup?orgId=${orgId}`
          router.push(redirectUrl)
        }, 3000)
      } else {
        setFailure(resCreateOrg as string)
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      setFailure('An unexpected error occurred. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <PageContainer>
      {initializing || (isEditMode && !dataLoaded) ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="flex min-h-screen items-start justify-center p-6">
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
                logoPreview: orgData?.logoUrl || '',
                logoUrl: orgData?.logoPreview || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleCreateAndContinue}
            >
              {({ errors, touched, setFieldValue, values }) => (
                <Form className="space-y-6">
                  <LogoUploader
                    logoPreview={logoPreview}
                    setLogoPreview={setLogoPreview}
                    setFieldValue={setFieldValue}
                    imgError={imgError}
                    setImgError={setImgError}
                    existingLogoUrl={orgData?.logoUrl ?? undefined}
                  />

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
                      as={Input}
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
                      <Label className="pb-2">
                        Country <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        name="countryId"
                        value={
                          values.countryId ? values.countryId.toString() : ''
                        }
                        onValueChange={async (value) => {
                          const countryId = Number(value)
                          setSelectedCountryId(countryId)
                          setSelectedStateId(null)
                          setCities([])
                          setStates([])
                          setFieldValue('countryId', countryId)
                          setFieldValue('stateId', null)
                          setFieldValue('cityId', null)

                          if (countryId) {
                            await fetchStates(countryId)
                          }
                        }}
                      >
                        <SelectTrigger className="disabled:bg-muted flex h-10 w-full items-center justify-between border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-scroll">
                          {countries.map((country) => (
                            <SelectItem
                              key={country.id}
                              value={country.id.toString()}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.countryId && touched.countryId && (
                        <p className="text-destructive mt-1 text-xs">
                          {errors.countryId}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="pb-2">
                        State{' '}
                        {states.length > 0 && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <Select
                        value={values.stateId ? values.stateId.toString() : ''}
                        onValueChange={async (value) => {
                          const stateId = Number(value)
                          setSelectedStateId(stateId)
                          setFieldValue('stateId', stateId)
                          setFieldValue('cityId', null)

                          setCities([])

                          if (selectedCountryId && stateId) {
                            await fetchCities(selectedCountryId, stateId)
                          }
                        }}
                        disabled={!values.countryId}
                      >
                        <SelectTrigger className="disabled:bg-muted flex h-10 w-full items-center justify-between border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-scroll">
                          {states.length > 0 ? (
                            states.map((state) => (
                              <SelectItem
                                key={state.id}
                                value={state.id.toString()}
                              >
                                {state.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-muted-foreground px-3 py-2 text-sm">
                              No states available
                            </div>
                          )}
                        </SelectContent>
                      </Select>

                      {errors.stateId && touched.stateId && (
                        <p className="text-destructive mt-1 text-xs">
                          {errors.stateId}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="pb-2">
                        City{' '}
                        {cities.length > 0 && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <Select
                        value={values.cityId ? values.cityId.toString() : ''}
                        onValueChange={(value) => {
                          const cityId = Number(value)
                          setFieldValue('cityId', cityId)
                        }}
                        disabled={!values.stateId}
                      >
                        <SelectTrigger className="disabled:bg-muted flex h-10 w-full items-center justify-between border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-scroll">
                          {cities.length > 0 ? (
                            cities.map((city) => (
                              <SelectItem
                                key={city.id}
                                value={city.id.toString()}
                              >
                                {city.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-muted-foreground px-3 py-2 text-sm">
                              No cities available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
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
                          <span className="ml-2">Private</span>
                          <span className="block pl-6 text-sm">
                            Only the connected organization can see your
                            organization details
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
                          <span className="ml-2">Public</span>
                          <span className="block pl-6 text-sm">
                            Your profile and organization details can be seen by
                            everyone
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setIsBackLoading(true)
                        router.push('/dashboard')
                      }}
                      disabled={isBackLoading}
                    >
                      {isBackLoading ? <Loader /> : 'Cancel'}
                    </Button>

                    {!isEditMode ? (
                      <Button
                        type="submit"
                        disabled={
                          !values.name ||
                          !values.description ||
                          !values.countryId ||
                          (states.length > 0 && !values.stateId) ||
                          (cities.length > 0 && !values.cityId) ||
                          loading
                        }
                      >
                        {createLoading ? <Loader /> : 'Create Organization'}
                      </Button>
                    ) : (
                      <div className="flex">
                        <Button
                          type="button"
                          onClick={() => handleUpdateOrganization(values)}
                          disabled={
                            !values.name ||
                            !values.description ||
                            !values.countryId ||
                            (states.length > 0 && !values.stateId) ||
                            (cities.length > 0 && !values.cityId) ||
                            loading
                          }
                        >
                          {createLoading ? <Loader /> : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
