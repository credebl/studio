import { useEffect, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser'
import type { AxiosError, AxiosResponse } from 'axios';
import { addDeviceDetails, generateRegistrationOption, getUserDeviceDetails, verifyRegistration } from '../../api/Fido';
import DeviceDetails from '../../commonComponents/DeviceDetailsCard';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage } from '../../api/Auth';
import BreadCrumbs from '../BreadCrumbs';
import { Alert, Spinner } from 'flowbite-react';
import type { IDeviceData, IdeviceBody, RegistrationOptionInterface, verifyRegistrationObjInterface } from './interfaces';
import DisplayUserProfile from './DisplayUserProfile';
import EditUserProfile from './EditUserProfile';

const AddPasskey = () => {
  const [fidoError, setFidoError] = useState("")
  const [fidoLoader, setFidoLoader] = useState(false)
  const [OrgUserEmail, setOrgUserEmail] = useState<string>('')
  const [deviceList, setDeviceList] = useState<IDeviceData[]>([])
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [addfailure, setAddFailur] = useState<string | null>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const toggleEditProfile = () => {
    setIsEditProfileOpen(!isEditProfileOpen);
  };


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
      const opts = data?.data
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

  const verifyRegistrationMethod = async (verifyRegistrationObj, OrgUserEmail: string) => {
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

    <div className="mb-4 col-span-full xl:mb-2 p-4">
      <BreadCrumbs />
      <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
        User's Profile
      </h1>

      {fidoLoader
        ? <div className="flex items-center justify-center mb-4">
          <Spinner
            color="info"
          />
        </div>
        :

        <div className="flex p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800 grid-cols-2 gap-10 mt-6">

          {/* first section */}
          <div className='w-1/3'>

            {isEditProfileOpen ? (
              <EditUserProfile toggleEditProfile={toggleEditProfile} />
            ) : (
              <DisplayUserProfile toggleEditProfile={toggleEditProfile} />
            )}

          </div>

          {/* second section */}
          <div className="flow-root w-2/3">
            <div
              className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
            >

              <div className='divide-y'>
                {deviceList && deviceList.length > 0 &&
                  deviceList.map((element, key) => (
                    <DeviceDetails deviceFriendlyName={element['deviceFriendlyName']} createDateTime={element['createDateTime']} credentialID={element['credentialId']} refreshList={userDeviceDetails} />
                  ))}
              </div>

              <div>

                <button onClick={addDevice} type="button" className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 mr-2 mb-2">
                  <svg className='mr-2 pr-2' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                  </svg>
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

        </div>
      }
    </div>
  );
};

export default AddPasskey;
