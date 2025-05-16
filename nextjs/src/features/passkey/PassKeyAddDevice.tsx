'use client'

import * as yup from 'yup'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, EyeOff } from 'lucide-react'
import { Field, Form, Formik } from 'formik'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RootState } from '@/lib/store'
import { addPasskeyUserDetails } from '@/app/api/Fido'
import { apiStatusCodes } from '@/config/CommonConstant'
import { passwordEncryption } from '@/app/api/Auth'
import { useSelector } from 'react-redux'
import { useState } from 'react'

interface PasswordValue {
  Password: string
}

interface PasskeyAddDeviceProps {
  openModal: boolean
  setOpenModel: (flag: boolean) => void
  closeModal: (flag: boolean) => void
  registerWithPasskey: (flag: boolean) => Promise<void>
}

export default function PasskeyAddDevice({
  openModal,
  setOpenModel,
  registerWithPasskey,
}: PasskeyAddDeviceProps): React.JSX.Element {
  const [fidoUserError, setFidoUserError] = useState<string | null>(null)
  const [success] = useState<string | null>(null)
  const [nextStep, setNextStep] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const userEmail = useSelector((state: RootState) => state.profile.email)
  const savePassword = async (values: PasswordValue): Promise<void> => {
    try {
      const payload = {
        password: passwordEncryption(values.Password),
      }
      const res = await addPasskeyUserDetails(payload, userEmail)
      const { data } = res as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setNextStep(true)
      } else if (res.toString().includes('401')) {
        setFidoUserError('Invalid Credentials')
      } else {
        setFidoUserError(res as string)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setFidoUserError('An unexpected error occurred')
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Passkey</DialogTitle>
        </DialogHeader>

        {fidoUserError || success ? (
          <Alert variant={fidoUserError ? 'destructive' : 'default'}>
            <AlertTitle>{fidoUserError ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{fidoUserError || success}</AlertDescription>
          </Alert>
        ) : null}

        {!nextStep ? (
          <Formik
            initialValues={{ Password: '' }}
            validationSchema={yup.object().shape({
              Password: yup.string().required('Password is required'),
            })}
            onSubmit={savePassword}
          >
            {({ handleSubmit, errors, touched }) => (
              <Form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Field
                      as={Input}
                      id="Password"
                      name="Password"
                      type={passwordVisible ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((prev) => !prev)}
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                    >
                      {passwordVisible ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.Password && touched.Password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.Password}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Next</Button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4">
            <img
              src="/images/passkeyAddDevice.svg"
              alt="Passkey Device"
              className="h-[300px] w-[300px]"
            />
            <Button onClick={() => registerWithPasskey(true)}>
              Create Passkey
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
