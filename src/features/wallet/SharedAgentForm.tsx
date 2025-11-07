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
import SOCKET from '@/config/SocketConfig'
import { apiStatusCodes } from '@/config/CommonConstant'
import { spinupSharedAgent } from '@/app/api/Agent'

interface SharedAgentFormProps {
  orgId: string
  onSuccess?: (data?: any) => void
  disabled?: boolean
}

const SharedAgentForm = ({ orgId, onSuccess, disabled }: SharedAgentFormProps): React.JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validationSchema = yup.object({
    label: yup.string().required('Wallet label is required'),
  })

  const handleSubmit = async (values: { label: string }) => {
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
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Something went wrong while creating shared wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Formik
        initialValues={{ label: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <Label htmlFor="label">Wallet Label</Label>
              <Field
                as={Input}
                id="label"
                name="label"
                placeholder="Enter wallet label"
                className="mt-2"
                disabled={disabled}
              />
              {errors.label && touched.label && (
                <p className="text-sm text-destructive mt-1">{errors.label}</p>
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
