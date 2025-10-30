'use client'

import * as yup from 'yup'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, CreditCard, FileText } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Formik } from 'formik'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageContainer from '@/components/layout/page-container'
import { Textarea } from '@/components/ui/textarea'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'

interface IValuesShared {
  name: string
  description: string
  format: string
  issuer: string
  canBeRevoked: boolean
}

interface IOrgAgent {
  orgDid: string
  // Add other properties as needed
}

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  format: yup.string().required('Format is required'),
  issuer: yup.string().required('Issuer is required'),
  canBeRevoked: yup.boolean(),
})

const TemplateCreation = (): React.JSX.Element => {
  const [useExistingDid, setUseExistingDid] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [existingDidList, setExistingDidList] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(true)

  // Get orgId from Redux store or props
  const selectedDropdownOrgId = useAppSelector(
    (state) => state.organization.orgId,
  )

  const initialValues: IValuesShared = {
    name: '',
    description: '',
    format: 'sd-jwt-vc',
    issuer: '',
    canBeRevoked: false,
  }

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!selectedDropdownOrgId) {
      setLoading(false)
      return
    }

    try {
      const response = await getOrganizationById(selectedDropdownOrgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        // Extract DIDs from org_agents
        if (data?.data?.org_agents?.length > 0) {
          const dids = data.data.org_agents
            .filter((agent: IOrgAgent) => agent.orgDid)
            .map((agent: IOrgAgent) => ({
              value: agent.orgDid,
              label: agent.orgDid,
            }))
          
          setExistingDidList(dids)
        } else {
          setExistingDidList([])
        }
      } else {
        console.error(response as string)
        setExistingDidList([])
      }
    } catch (error) {
      console.error('Error fetching organization details:', error)
      setExistingDidList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizationDetails()
  }, [selectedDropdownOrgId])

  const handleSubmit = (values: IValuesShared) => {
    console.log('Form values:', values)
    setAlertMessage(`Template "${values.name}" has been created successfully.`)
  }

  const formatOptions = [
    {
      id: 'sd-jwt-vc',
      title: 'Selective Disclosure',
      subtitle: 'SD-JWT-VC',
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      desc: 'Works with OpenID4VC issuance and verification.',
      iconBg: 'bg-blue-100',
    },
    {
      id: 'mdoc',
      title: 'Mobile Document',
      subtitle: 'mDoc',
      icon: <FileText className="h-6 w-6 text-slate-600" />,
      desc: 'Compatible with OpenID4VC issuance and verification.',
      iconBg: 'bg-slate-100',
    },
    {
      id: 'anoncreds',
      title: 'Anonymous Credentials',
      subtitle: 'AnonCreds',
      icon: <FileText className="h-6 w-6 text-slate-600" />,
      desc: 'Works with DIDComm issuance and verification.',
      iconBg: 'bg-slate-100',
    },
  ]

  const getIssuerOptions = (format: string) => {
    switch (format) {
      case 'sd-jwt-vc':
        return [
          { value: 'did:web', label: 'did:web' },
          { value: 'did:cheqd:testnet', label: 'did:cheqd:testnet' },
          { value: 'x509-p256', label: 'X.509 certificate (P-256)' },
          { value: 'x509-ed25519', label: 'X.509 certificate (Ed25519)' },
        ]
      case 'mdoc':
        return [
          { value: 'x509-p256', label: 'X.509 certificate (P-256)' },
          { value: 'x509-ed25519', label: 'X.509 certificate (Ed25519)' },
        ]
      case 'anoncreds':
        return [
          { value: 'did:web', label: 'did:web' },
          { value: 'did:cheqd:testnet', label: 'did:cheqd:testnet' },
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Loading organization details...</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            handleChange,
            handleBlur,
          }) => {
            const issuerOptions = getIssuerOptions(values.format)

            return (
              <div className="mx-auto max-w-5xl space-y-6">
                {/* Use Existing DID */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-existing"
                      checked={useExistingDid}
                      className="border"
                      onCheckedChange={(checked) => {
                        setUseExistingDid(!!checked)
                        if (!checked) {
                          setFieldValue('issuer', '')
                        }
                      }}
                      disabled={existingDidList.length === 0}
                    />
                    <Label htmlFor="use-existing" className="text-sm">
                      Use existing DID {existingDidList.length === 0 && '(No DIDs available)'}
                    </Label>
                  </div>

                  {useExistingDid && existingDidList.length > 0 && (
                    <div className="w-64">
                      <Select
                        value={values.issuer}
                        onValueChange={(value) =>
                          setFieldValue('issuer', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select existing DID" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingDidList.map((did) => (
                            <SelectItem key={did.value} value={did.value}>
                              {did.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Credential Format Section */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Credential Format
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-500">
                          {useExistingDid
                            ? 'Use your existing DID to issue credentials'
                            : 'Choose the format for your credential'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {!useExistingDid ? (
                      <>
                        {/* Credential Format Options */}
                        <div className="grid gap-4 md:grid-cols-3">
                          {formatOptions.map((format) => (
                            <button
                              key={format.id}
                              type="button"
                              onClick={() => {
                                setFieldValue('format', format.id)
                                setFieldValue('issuer', '')
                              }}
                              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                                values.format === format.id
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                              }`}
                            >
                              {values.format === format.id && (
                                <div className="absolute top-3 right-3">
                                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                              <div
                                className={`inline-flex rounded-lg p-3 ${format.iconBg} mb-4`}
                              >
                                {format.icon}
                              </div>
                              <h3 className="mb-1 font-semibold text-gray-900">
                                {format.title}
                              </h3>
                              <p className="text-xs font-medium text-gray-500">
                                {format.subtitle}
                              </p>
                              <p className="mb-4 text-sm text-gray-600">
                                {format.desc}
                              </p>
                            </button>
                          ))}
                        </div>

                        {/* Issuer + Revocation Options (only when format selected) */}
                        {values.format && (
                          <div className="mt-8 grid gap-6 md:grid-cols-2">
                            {/* Issuer */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="issuer"
                                className="text-sm font-medium text-gray-700"
                              >
                                Issuer DID Method{' '}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={values.issuer}
                                onValueChange={(value) =>
                                  setFieldValue('issuer', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select issuer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {issuerOptions.map((issuer) => (
                                    <SelectItem
                                      key={issuer.value}
                                      value={issuer.value}
                                    >
                                      {issuer.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.issuer && touched.issuer && (
                                <p className="text-sm text-red-500">
                                  {errors.issuer}
                                </p>
                              )}
                            </div>

                            {/* Revocation */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Revocation Options
                              </Label>
                              <div className="flex h-10 items-center rounded-md border px-4">
                                <Checkbox
                                  id="canBeRevoked"
                                  checked={values.canBeRevoked}
                                  onCheckedChange={(checked) =>
                                    setFieldValue('canBeRevoked', checked)
                                  }
                                  className="mr-2"
                                />
                                <Label
                                  htmlFor="canBeRevoked"
                                  className="cursor-pointer text-sm text-gray-700"
                                >
                                  Enable credential revocation
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* When existing DID is selected — only show issuer + revocation */}
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Issuer DID Method */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="issuer"
                              className="text-sm font-medium text-gray-700"
                            >
                              Issuer DID Method{' '}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={values.issuer}
                              onValueChange={(value) =>
                                setFieldValue('issuer', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select existing DID" />
                              </SelectTrigger>
                              <SelectContent>
                                {existingDidList.map((did) => (
                                  <SelectItem key={did.value} value={did.value}>
                                    {did.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.issuer && touched.issuer && (
                              <p className="text-sm text-red-500">
                                {errors.issuer}
                              </p>
                            )}
                          </div>

                          {/* Revocation Option */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Revocation Options
                            </Label>
                            <div className="flex h-10 items-center rounded-md border px-4">
                              <Checkbox
                                id="canBeRevoked"
                                checked={values.canBeRevoked}
                                onCheckedChange={(checked) =>
                                  setFieldValue('canBeRevoked', checked)
                                }
                                className="mr-2"
                              />
                              <Label
                                htmlFor="canBeRevoked"
                                className="cursor-pointer text-sm text-gray-700"
                              >
                                Enable credential revocation
                              </Label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Template Creation Section */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Template Information
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-500">
                          Fill in the template details for the selected
                          credential
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-6">
                    {/* Template Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Template Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter template name"
                      />
                      {errors.name && touched.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-700"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter template description"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit + Alert */}
                <div className="flex flex-col items-end space-y-4">
                  <Button
                    type="submit"
                    onClick={() => handleSubmit(values)}
                    className="rounded-lg bg-blue-600 px-8 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    Create Template
                  </Button>

                  {alertMessage && (
                    <Alert className="w-fit border-green-300 bg-green-50 shadow-sm">
                      <AlertTitle className="font-semibold text-green-700">
                        Success
                      </AlertTitle>
                      <AlertDescription className="text-green-700">
                        {alertMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )
          }}
        </Formik>
      </div>
    </PageContainer>
  )
}

export default TemplateCreation