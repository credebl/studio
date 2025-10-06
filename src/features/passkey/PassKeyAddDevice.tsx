'use client'

import * as yup from 'yup'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, EyeOff } from 'lucide-react'
import { Field, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addPasskeyUserDetails } from '@/app/api/Fido'
import { apiStatusCodes } from '@/config/CommonConstant'
import { passwordValueEncryption } from '@/utils/passwordEncryption'

interface PasswordValue {
  Password: string
}

interface PasskeyAddDeviceProps {
  openModal: boolean
  setOpenModel: (flag: boolean) => void
  closeModal: (flag: boolean) => void
  registerWithPasskey: (flag: boolean) => Promise<void>
  email: string | null
}

export default function PasskeyAddDevice({
  openModal,
  email,
  setOpenModel,
  registerWithPasskey,
}: Readonly<PasskeyAddDeviceProps>): React.JSX.Element {
  const [fidoUserError, setFidoUserError] = useState<string | null>(null)
  const [nextStep, setNextStep] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const savePassword = async (values: PasswordValue): Promise<void> => {
    try {
      if (!userEmail) {
        setFidoUserError('User email is missing. Please refresh the page.')
        return
      }
      const encryptedPassword = await passwordValueEncryption(values.Password)
      const payload = {
        password: encryptedPassword,
      }
      const res = await addPasskeyUserDetails(payload, userEmail)
      const { data } = res as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setFidoUserError(null)
        setNextStep(true)
      } else if (res.toString().includes('401')) {
        setFidoUserError(res as string)
      } else {
        setFidoUserError(res as string)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setFidoUserError('An unexpected error occurred')
    }
  }

  useEffect(() => {
    if (email) {
      setUserEmail(email)
    }
  }, [email])

  return (
    <Dialog
      open={openModal}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setFidoUserError(null)
          setNextStep(false)
          setPasswordVisible(false)
        }
        setOpenModel(isOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Passkey</DialogTitle>
        </DialogHeader>

        {fidoUserError && (
          <div className="w-full" role="alert">
            <AlertComponent
              message={fidoUserError}
              type="failure"
              onAlertClose={() => {
                setFidoUserError(null)
              }}
            />
          </div>
        )}

        {!nextStep ? (
          <Formik
            initialValues={{ Password: '' }}
            validationSchema={yup.object().shape({
              Password: yup.string().required('Password is required'),
            })}
            onSubmit={savePassword}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ handleSubmit, errors, touched, setFieldTouched }) => (
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
                  <Button
                    type="submit"
                    onClick={() => setFieldTouched('Password', true)}
                  >
                    Next
                  </Button>
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
