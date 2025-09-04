'use client'

import { AxiosError, AxiosResponse } from 'axios'
import {
  IDeviceData,
  IVerifyRegistrationObj,
  IdeviceBody,
} from '@/components/profile/interfaces'
import React, { useEffect, useState } from 'react'
import {
  addDeviceDetails,
  generateRegistrationOption,
  getUserDeviceDetails,
  verifyRegistration,
} from '@/app/api/Fido'

import { AlertComponent } from '@/components/AlertComponent'
import { Button } from '@/components/ui/button'
import DeviceDetails from './DeviceDetails'
import { Devices } from '../components/UserInfoForm'
import { ExternalLink } from 'lucide-react'
import PasskeyAddDevice from './PassKeyAddDevice'
import PasskeyAlert from './PasskeyAlert'
import { apiStatusCodes } from '@/config/CommonConstant'
import { startRegistration } from '@simplewebauthn/browser'

interface RegistrationOptionInterface {
  userName: string | null
  deviceFlag: boolean
}

interface AddPasskeyProps {
  email?: string
}

interface AlertResponseType {
  type: 'success' | 'error'
  message: string
}

const AddPasskey = ({
  email: userEmail,
}: AddPasskeyProps = {}): React.JSX.Element => {
  const [error, setError] = useState('')
  const [loader, setLoader] = useState(false)
  const [OrgUserEmail, setOrgUserEmail] = useState<string>('')
  const [deviceList, setDeviceList] = useState<IDeviceData[]>([])
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [editFailure, setEditFailure] = useState<string | null>(null)
  const [addFailure, setAddFailure] = useState<string | null>(null)
  const [disableFlag, setDisableFlag] = useState<boolean>(false)
  const [isDevice, setIsDevice] = useState<boolean>(false)
  const [openModel, setOpenModel] = useState<boolean>(false)

  const showFidoError = (error: unknown): void => {
    const err = error as AxiosError
    if (
      err.message.includes('The operation either timed out or was not allowed')
    ) {
      const [errorMsg] = err.message.split('.')
      setError(errorMsg)
    } else {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (userEmail) {
      setOrgUserEmail(userEmail)
    }
  }, [userEmail])

  const userDeviceData = async (): Promise<void> => {
    try {
      setLoader(true)

      const userDeviceDetailsResp = await getUserDeviceDetails(OrgUserEmail)
      const { data } = userDeviceDetailsResp
      setLoader(false)
      if (userDeviceDetailsResp) {
        const deviceDetails =
          Object.keys(data)?.length > 0
            ? userDeviceDetailsResp?.data?.data.map(
                (data: { lastChangedDateTime: string }) => ({
                  ...data,
                  lastChangedDateTime: data.lastChangedDateTime
                    ? data.lastChangedDateTime
                    : '-',
                }),
              )
            : []
        if (data?.data?.length === 1) {
          setDisableFlag(true)
        } else {
          setDisableFlag(false)
        }
        setDeviceList(deviceDetails)
      }
    } catch (error) {
      console.error('Error fetching device details:', error)
      setAddFailure('Error while fetching the device details')
      setLoader(false)
    }
  }

  const addDeviceDetailsMethod = async (
    deviceBody: IdeviceBody,
  ): Promise<void> => {
    try {
      const deviceDetailsResp = await addDeviceDetails(deviceBody)
      const { data } = deviceDetailsResp as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setAddSuccess('Device added successfully')
        userDeviceData()
      } else {
        setAddFailure(deviceDetailsResp as string)
      }
      setTimeout(() => {
        setAddSuccess('')
        setAddFailure('')
      }, 3000)
    } catch (error) {
      showFidoError(error)
    }
  }

  const verifyRegistrationMethod = async (
    verifyRegistrationObject: IVerifyRegistrationObj,
    OrgUserEmail: string,
  ): Promise<void> => {
    try {
      const verificationRegisterResponse = await verifyRegistration(
        verifyRegistrationObject,
        OrgUserEmail,
      )
      const { data } = verificationRegisterResponse as AxiosResponse
      let credentialsID = ''

      credentialsID = encodeURIComponent(data?.data?.newDevice?.credentialID)
      if (data?.data?.verified) {
        let platformDeviceName = ''

        if (
          verifyRegistrationObject?.authenticatorAttachment === 'cross-platform'
        ) {
          platformDeviceName = 'Passkey'
        } else {
          platformDeviceName = navigator.platform
        }

        const deviceBody: IdeviceBody = {
          userName: OrgUserEmail,
          credentialId: credentialsID,
          deviceFriendlyName: platformDeviceName,
        }
        await addDeviceDetailsMethod(deviceBody)
      }
    } catch (error) {
      showFidoError(error)
    }
  }

  const registerWithPasskey = async (flag: boolean): Promise<void> => {
    try {
      const RegistrationOption: RegistrationOptionInterface = {
        userName: OrgUserEmail,
        deviceFlag: flag,
      }
      // Generate Registration Option
      const generateRegistrationResponse =
        await generateRegistrationOption(RegistrationOption)
      const { data } = generateRegistrationResponse as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const opts = data?.data
        const challangeId = opts?.challenge

        if (opts) {
          opts.authenticatorSelection = {
            residentKey: 'preferred',
            requireResidentKey: false,
            userVerification: 'preferred',
          }
        }
        setOpenModel(false)

        const attResp = await startRegistration(opts)
        const verifyRegistrationObj: IVerifyRegistrationObj = {
          ...attResp,
          challangeId,
        }

        await verifyRegistrationMethod(verifyRegistrationObj, OrgUserEmail)
      } else {
        console.error(
          (generateRegistrationResponse as AxiosResponse)?.data?.message ||
            'An error occurred',
        )
      }
    } catch (error) {
      showFidoError(error)
    }
  }

  const addDevice = async (): Promise<void> => {
    try {
      if (deviceList?.length > 0) {
        registerWithPasskey(true)
        setOpenModel(false)
      } else {
        setOpenModel(true)
      }
    } catch (error) {
      console.error('Error adding device:', error)
    }
  }

  useEffect(() => {
    if (OrgUserEmail) {
      userDeviceData()
    }
    const platform = navigator.platform.toLowerCase()
    if (platform.includes(Devices.Linux)) {
      setIsDevice(true)
    }
  }, [OrgUserEmail])

  const handleResponseMessages = (value: AlertResponseType): void => {
    if (value.type === 'success') {
      setEditSuccess(value.message)
    } else {
      setEditFailure(value.message)
    }
  }

  const closeModal = (flag: boolean): void => {
    setOpenModel(flag)
  }

  return (
    <div className="h-full">
      {(addSuccess || addFailure || error) && (
        <div className="p-2">
          {addSuccess && (
            <div className="w-full" role="alert">
              <AlertComponent
                message={addSuccess}
                type={'success'}
                onAlertClose={() => {
                  if (addSuccess) {
                    setAddSuccess(null)
                  }
                }}
              />
            </div>
          )}
          {addFailure && (
            <div className="w-full" role="alert">
              <AlertComponent
                message={addFailure}
                type={'failure'}
                onAlertClose={() => {
                  if (addFailure) {
                    setAddFailure(null)
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
      <div className="relative flex h-full flex-auto flex-col p-3 sm:p-4">
        <div className="mx-auto w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-xl px-6 py-6">
            {loader ? (
              <div className="mb-4 flex items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-solid border-t-transparent"></div>
              </div>
            ) : (
              <div>
                <div className="form-container">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4">
                      <h1 className="text-xl font-medium text-gray-500 dark:text-white">
                        Add Passkey
                      </h1>
                      <p className="text-sm font-normal text-gray-700 dark:text-white">
                        With passkey, you don&apos;t need to remember complex
                        password.{' '}
                        <a
                          href="https://www.passkeycentral.org/introduction-to-passkeys/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          Learn more
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </p>
                      {isDevice && (
                        <div className="mt-2">
                          <PasskeyAlert />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0">
                      <Button
                        onClick={addDevice}
                        type="button"
                        className="flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2"
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            stroke="currentColor"
                            d="M11.03 4.32a3.82 3.82 0 1 1-7.64 0 3.82 3.82 0 0 1 7.64 0Zm6.473 4.047a2.94 2.94 0 0 1-.486 1.62c-.315.476-.76.838-1.273 1.044l-.691.276.517.535.812.842-1.053 1.091-.335.348.335.347 1.053 1.091-1.619 1.678-.888-.92v-5.241l-.28-.138a2.774 2.774 0 0 1-1.098-.98 2.958 2.958 0 0 1-.168-2.917c.226-.455.566-.838.98-1.109a2.65 2.65 0 0 1 2.775-.081 2.79 2.79 0 0 1 1.038 1.05c.25.443.383.948.38 1.463Zm-1.55-1.761-.42.27.42-.27a1.434 1.434 0 0 0-.638-.542 1.396 1.396 0 0 0-1.566.32 1.491 1.491 0 0 0-.305 1.578c.105.265.286.494.52.656a1.403 1.403 0 0 0 1.813-.183 1.484 1.484 0 0 0 .175-1.83Zm-7.48 3.934c.664 0 1.32.122 1.934.359a5.18 5.18 0 0 0 1.332 1.626v4.213H.5v-1.3c0-1.291.537-2.535 1.5-3.456a5.284 5.284 0 0 1 3.649-1.443h2.824Z"
                          />
                        </svg>
                        Add Passkey
                      </Button>
                    </div>
                  </div>

                  {editSuccess && (
                    <div className="w-full" role="alert">
                      <AlertComponent
                        message={editSuccess}
                        type="success"
                        onAlertClose={() => {
                          setEditSuccess(null)
                        }}
                      />
                    </div>
                  )}
                  {editFailure && (
                    <div className="w-full" role="alert">
                      <AlertComponent
                        message={editFailure}
                        type="failure"
                        onAlertClose={() => {
                          setEditFailure(null)
                        }}
                      />
                    </div>
                  )}

                  <DeviceDetails
                    devices={deviceList}
                    refreshList={userDeviceData}
                    disableRevoke={disableFlag}
                    responseMessages={handleResponseMessages}
                  />
                  <PasskeyAddDevice
                    openModal={openModel}
                    setOpenModel={setOpenModel}
                    closeModal={closeModal}
                    registerWithPasskey={registerWithPasskey}
                    email={userEmail ?? null}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPasskey
