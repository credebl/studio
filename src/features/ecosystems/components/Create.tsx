import * as Yup from 'yup'

import { Formik, Form as FormikForm } from 'formik'
import React, { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createEcosystem } from '@/app/api/ecosystem'
import { generateSessionToken } from '@/app/api/users'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const Create = (): React.JSX.Element => {
  const [ecosystemDetail, setEcosystemDetail] = useState({
    name: '',
    description: '',
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState(false)

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Ecosystem name is required')
      .min(2, 'Please enter at least two characters')
      .max(50, 'Name cannot exceed 50 characters'),
    description: Yup.string()
      .required('description is required')
      .min(2, 'Please enter at least two characters')
      .max(255, 'Description cannot exceed 255 characters'),
  })

  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      setSuccess(null)
      setFailure(null)
    }, 5000)
  }, [success, failure])

  const onSubmit = async (values: {
    name: string
    description: string
  }): Promise<void> => {
    setLoading(true)
    setSuccess(null)
    setFailure(null)

    try {
      const response = await createEcosystem(orgId, values)
      const { data } = response as AxiosResponse
      if (typeof response === 'string') {
        setFailure(response)
      }
      if (data && data.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(data.message)
        await generateSessionToken()
        setTimeout(() => router.push('/ecosystems'), 2000)
      }
    } catch (err) {
      setFailure('Failed to create ecosystem')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div>
        {success && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={success}
              type={'success'}
              onAlertClose={() => setSuccess(null)}
            />
          </div>
        )}
        {failure && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={failure}
              type={'failure'}
              onAlertClose={() => setFailure(null)}
            />
          </div>
        )}

        <Formik
          initialValues={{
            name: '',
            description: '',
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, handleChange, handleBlur, isValid }) => (
            <FormikForm className="space-y-4">
              <div className="flex flex-col gap-8">
                <div className="max-w-md flex-1">
                  <p>
                    Ecosystem name{' '}
                    <span className="text-semi-bold text-red-500">*</span>
                  </p>
                  <Input
                    placeholder="Ecosystem Name"
                    name="name"
                    value={ecosystemDetail.name}
                    onChange={(e) => {
                      handleChange(e)
                      setEcosystemDetail((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }}
                    onBlur={handleBlur}
                    className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                  />
                  {errors.name && touched.name && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <p>
                    Ecosystem description{' '}
                    <span className="text-semi-bold text-red-500">*</span>
                  </p>
                  <Textarea
                    placeholder="Description"
                    name="description"
                    value={ecosystemDetail.description}
                    onChange={(e) => {
                      handleChange(e)
                      setEcosystemDetail((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }}
                    onBlur={handleBlur}
                    className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                  />
                  {errors.description && touched.description && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-start gap-2">
                <Button type="submit" disabled={loading || !isValid}>
                  {loading ? 'Creating ecosystem...' : 'Create ecosystem'}
                </Button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </div>
    </>
  )
}

export default Create
