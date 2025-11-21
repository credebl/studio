'use client'

import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'
import React, { useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { setAgentConfigDetails } from '@/app/api/Agent'

interface DedicatedAgentFormProps {
  orgId: string
  onSuccess?: (data?: WalletResponse) => void
}

export interface WalletData {
  id: string
  orgId: string
  agentSpinUpStatus: number
  agentEndPoint: string
  tenantId: string | null
  walletName: string
}

export interface WalletResponse {
  statusCode: number
  message: string
  data: WalletData
}

const DedicatedAgentForm = ({
  orgId,
  onSuccess,
}: DedicatedAgentFormProps): React.JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validationSchema = yup.object({
    walletName: yup.string().required('Wallet name is required'),
    agentEndpoint: yup.string().required('Agent endpoint is required'),
    apiKey: yup.string().required('API key is required'),
  })

  const handleSubmit = async (values: {
    walletName: string
    agentEndpoint: string
    apiKey: string
  }): Promise<void> => {
    setError(null)
    setLoading(true)

    const payload = {
      walletName: values.walletName,
      agentEndpoint: values.agentEndpoint,
      apiKey: values.apiKey,
    }

    try {
      const res = (await setAgentConfigDetails(payload, orgId)) as AxiosResponse

      const { data } = res
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        onSuccess?.(data)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong while creating dedicated wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Formik
        initialValues={{
          walletName: '',
          agentEndpoint: '',
          apiKey: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <Label htmlFor="walletName">Wallet Name</Label>
              <Field
                as={Input}
                id="walletName"
                name="walletName"
                placeholder="Enter wallet name"
                className="mt-2"
              />
              {errors.walletName && touched.walletName && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.walletName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="agentEndpoint">Agent Endpoint</Label>
              <Field
                as={Input}
                id="agentEndpoint"
                name="agentEndpoint"
                placeholder="https://agent.example.com"
                className="mt-2"
              />
              {errors.agentEndpoint && touched.agentEndpoint && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.agentEndpoint}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Field
                as={Input}
                id="apiKey"
                name="apiKey"
                placeholder="Enter API key"
                className="mt-2"
              />
              {errors.apiKey && touched.apiKey && (
                <p className="text-destructive mt-1 text-sm">{errors.apiKey}</p>
              )}
            </div>

            {error && (
              <AlertComponent
                message={error}
                type="failure"
                onAlertClose={() => setError(null)}
              />
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader /> : 'Create Dedicated Wallet'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default DedicatedAgentForm
