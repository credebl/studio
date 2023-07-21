import React, { useEffect, useState } from 'react';
import { axiosPost, axiosPut } from '../../services/apiRequests';
import { startRegistration } from '@simplewebauthn/browser'
import type { AxiosError, AxiosResponse } from 'axios';
import { addDeviceDetails, generateRegistrationOption, getUserDeviceDetails, verifyRegistration } from '../../api/Fido';
import DeviceDetails from '../../commonComponents/DeviceDetailsCard';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage } from '../../api/Auth';
import { string } from 'yup';
import BreadCrumbs from '../BreadCrumbs';
import { Alert, Spinner } from 'flowbite-react';
import type { IDeviceData, IdeviceBody, RegistrationOptionInterface, verifyRegistrationObjInterface } from './interfaces';

const AddPasskey = () => {
  const [fidoError, setFidoError] = useState("")
  const [fidoLoader, setFidoLoader] = useState(false)
  const [OrgUserEmail, setOrgUserEmail] = useState<string>('')
  const [deviceList, setDeviceList] = useState<IDeviceData[]>([])
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [addfailure, setAddFailur] = useState<string | null>(null)

  const showFidoError = (error: unknown): void => {
    const err = error as AxiosError
    if (err.message.includes("The operation either timed out or was not allowed")) {
      const [errorMsg] = err.message.split('.')
      setFidoError(errorMsg)
      setTimeout(() => {
        setFidoError("")
      }, 5000)
    } else {
      setFidoError(err.message)
      setTimeout(() => {
        setFidoError("")
      }, 5000)
    }
  }

  const addDevice = async (): Promise<void> => {
    try {
      registerWithPasskey(true)
    } catch (error) {
      setFidoLoader(false)
    }
  }

  const setProfile = async () => {
    const UserEmail = await getFromLocalStorage(storageKeys.USER_EMAIL)
    setOrgUserEmail(UserEmail)
    return UserEmail
  }

  const registerWithPasskey = async (flag: boolean): Promise<void> => {
    try {
      const RegistrationOption: RegistrationOptionInterface = {
        userName: OrgUserEmail,
        deviceFlag: flag
      }
      // Generate Registration Option
      const generateRegistrationResponse = await generateRegistrationOption(RegistrationOption)
      const { data } = generateRegistrationResponse as AxiosResponse
      const opts =data?.data
      const challangeId = data?.data?.challenge
      if (opts) {
        opts.authenticatorSelection = {
          residentKey: "preferred",
          requireResidentKey: false,
          userVerification: "preferred"
        }
      }
      const attResp = await startRegistration(opts)

      const verifyRegistrationObj = {
        ...attResp,
        challangeId
      }
      
      await verifyRegistrationMethod(verifyRegistrationObj, OrgUserEmail);
    } catch (error) {
      showFidoError(error)
    }
  }

  const verifyRegistrationMethod = async (verifyRegistrationObj, OrgUserEmail:string) => {
    try {
      const verificationRegisterResp = await verifyRegistration(verifyRegistrationObj, OrgUserEmail)
      const { data } = verificationRegisterResp as AxiosResponse
      const credentialID = data?.data?.newDevice?.credentialID

      if (data?.data?.verified) {
        let platformDeviceName = ''

        if (verifyRegistrationObj?.authenticatorAttachment === "cross-platform") {
          platformDeviceName = 'Passkey'
        } else {
          platformDeviceName = navigator.platform
        }

        const deviceBody: IdeviceBody = {
          userName: OrgUserEmail,
          credentialId: credentialID,
          deviceFriendlyName: platformDeviceName
        }
        await addDeviceDetailsMethod(deviceBody)
      }
    } catch (error) {
      showFidoError(error)
    }
  }

  const addDeviceDetailsMethod = async (deviceBody: IdeviceBody) => {
    try {
      const deviceDetailsResp = await addDeviceDetails(deviceBody)
      const { data } = deviceDetailsResp as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setAddSuccess("Device added successfully")
        userDeviceDetails()
      } else {
        setAddFailur(deviceDetailsResp as string)
      }
      setTimeout(() => {
        setAddSuccess('')
        setAddFailur('')
      }, 3000);
    } catch (error) {
      showFidoError(error)
    }
  }

  //userDeviceDetails on page reload
  const userDeviceDetails = async (): Promise<void> => {
    try {
      const config = { headers: {} }
      setFidoLoader(true)

      const userDeviceDetailsResp = await getUserDeviceDetails(OrgUserEmail)
      setFidoLoader(false)

      if (userDeviceDetailsResp) {
        const deviceDetails = Object.keys(userDeviceDetailsResp?.data?.data)?.length > 0 ?
          userDeviceDetailsResp?.data?.data.map((data) => {
            data.lastChangedDateTime = data.lastChangedDateTime ? data.lastChangedDateTime : "-"
            return data
          })
          : []
        setDeviceList(deviceDetails)
      }
    } catch (error) {
      setFidoLoader(false)
    }
  }

  useEffect(() => {
    if (OrgUserEmail) {
      userDeviceDetails();
    } else {
      setProfile();
    }
  }, [OrgUserEmail]);

  return (
    <>
      <div className="mb-4 col-span-full xl:mb-2 p-4">
        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Devices
        </h1>
        {fidoLoader
          ? <div className="flex items-center justify-center mb-4">
            <Spinner
              color="info"
            />
          </div>
          :
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="flow-root">
              <div className='divide-y'>
                {deviceList && deviceList.length > 0 &&
                  deviceList.map((element, key) => (
                    <DeviceDetails deviceFriendlyName={element['deviceFriendlyName']} createDateTime={element['createDateTime']} credentialID={element['credentialId']} refreshList={userDeviceDetails} />
                  ))}
              </div>

              <div>
                <button
                  className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  onClick={addDevice}
                >
                  Add Device
                </button>
                {
                  (addSuccess || addfailure || fidoError) &&
                  <div className='p-2'>
                  <Alert
                    color={addSuccess ? "success" : "failure"}
                    onDismiss={() => setAddSuccess(null)}
                  >
                    <span>
                      <p>
                        {addSuccess || addfailure || fidoError}
                      </p>
                    </span>
                  </Alert>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
};

export default AddPasskey;
