'use client'

import * as yup from 'yup'

import { Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import SOCKET from '@/config/SocketConfig'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { spinupSharedAgent } from '@/app/api/Agent'

interface SharedAgentFormProps {
  orgId: string
  onSuccess?: (data?: WalletResponse) => void
  disabled?: boolean
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

const SharedAgentForm = ({
  orgId,
  onSuccess,
  disabled,
}: SharedAgentFormProps): React.JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string>('')

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    try {
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const name = data?.data?.name || ''
        setOrgName(name)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const generateWalletLabel = (orgName: string): string => {
    if (!orgName) {
      return 'Wallet'
    }

    const words = orgName.split(/\s+/).filter(Boolean)

    const first = words[0] || ''
    const second = words[1]?.substring(0, 5) || ''

    const label = `${first}${second}Wallet`

    return label.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25)
  }

  const validationSchema = yup.object({
    label: yup.string().required('Wallet label is required'),
  })

  const handleSubmit = async (values: { label: string }): Promise<void> => {
    setError(null)
    setLoading(true)

    const payload = {
      label: values.label,
      clientSocketId: SOCKET.id,
    }

    try {
      const res = (await spinupSharedAgent(payload, orgId)) as AxiosResponse
      const { data } = res

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        onSuccess?.(data)
      } else {
        setError(data?.message || 'Failed to create shared wallet')
      }
    } catch (err) {
      console.error('Failed to create shared wallet', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizationDetails()
  }, [orgId])

  return (
    <div className="mt-6">
      <Formik
        enableReinitialize
        initialValues={{ label: generateWalletLabel(orgName) }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <Label htmlFor="label">Wallet Label</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                This label is auto-generated based on your organization name.
                You can edit it if needed.
              </p>
              <Field
                as={Input}
                id="label"
                name="label"
                placeholder="Enter wallet label"
                className="mt-2"
                disabled={disabled}
              />
              {errors.label && touched.label && (
                <p className="text-destructive mt-1 text-sm">{errors.label}</p>
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
              <Button type="submit" disabled={loading || disabled}>
                {loading ? <Loader /> : 'Create Shared Wallet'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default SharedAgentForm
