import { useEffect, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser'
import type { AxiosError, AxiosResponse } from 'axios';
import { addDeviceDetails, generateRegistrationOption, getUserDeviceDetails, verifyRegistration } from '../../api/Fido';
import DeviceDetails from '../../commonComponents/DeviceDetailsCard';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage, getUserProfile } from '../../api/Auth';
import BreadCrumbs from '../BreadCrumbs';
import { Alert } from 'flowbite-react';
import type { IDeviceData, IdeviceBody, RegistrationOptionInterface, UserProfile, verifyRegistrationObjInterface } from './interfaces';
import DisplayUserProfile from './DisplayUserProfile';
import UpdateUserProfile from './EditUserProfile';
import CustomSpinner from '../CustomSpinner';
import PasskeyAddDevice from '../../commonComponents/PasseyAddDevicePopup';
import { apiRoutes } from '../../config/apiRoutes';
import React from 'react';

const AddPasskey = () => {
  const [fidoError, setFidoError] = useState("")
  const [fidoLoader, setFidoLoader] = useState(true)
  const [OrgUserEmail, setOrgUserEmail] = useState<string>('')
  const [deviceList, setDeviceList] = useState<IDeviceData[]>([])
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [addfailure, setAddFailur] = useState<string | null>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [prePopulatedUserProfile, setPrePopulatedUserProfile] = useState<UserProfile | null>(null);
  const [disableFlag, setDisableFlag] = useState<boolean>(false)


  const [openModel, setOpenModel] = useState<boolean>(false)

  const props = { openModel, setOpenModel };
  const fetchUserProfile = async () => {
    try {
      const token = await getFromLocalStorage(storageKeys.TOKEN);
      const userDetailsResponse = await getUserProfile(token);
      const { data } = userDetailsResponse as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setPrePopulatedUserProfile(data?.data);
      }
    } catch (error) {
    }
  };

  const toggleEditProfile = async () => {
    await fetchUserProfile()
    setIsEditProfileOpen(!isEditProfileOpen);
  };

  const showFidoError = (error: unknown): void => {
    const err = error as AxiosError
    if (err.message.includes("The operation either timed out or was not allowed")) {
      const [errorMsg] = err.message.split('.')
      setFidoError(errorMsg)
    } else {
      setFidoError(err.message)
    }
  }

  const addDevice = async (): Promise<void> => {
    try {
      setOpenModel(true)
    } catch (error) {
      setFidoLoader(false)
    }
  }
  const setProfile = async () => {
    const UserEmail = await getFromLocalStorage(storageKeys.USER_EMAIL)
    setOrgUserEmail(UserEmail)
    return UserEmail
  }

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
      setOpenModel(false)
      const attResp = await startRegistration(opts)

      const verifyRegistrationObj = {
        ...attResp,
        challangeId
      }
      console.log("verifyRegistrationObj::::", verifyRegistrationObj)
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
        window.location.href = `${apiRoutes.auth.profile}`
      } else {
        setAddFailur(deviceDetailsResp as string)
      }
    } catch (error) {
      showFidoError(error)
    }
  }

  //userDeviceDetails on page reload
  const userDeviceDetails = async (): Promise<void> => {
    try {
      setFidoLoader(true)

      const userDeviceDetailsResp = await getUserDeviceDetails(OrgUserEmail)
      const { data } = userDeviceDetailsResp as AxiosResponse
      setFidoLoader(false)
      if (userDeviceDetailsResp) {
        const deviceDetails = Object.keys(data)?.length > 0 ?
          userDeviceDetailsResp?.data?.data.map((data) => {
            data.lastChangedDateTime = data.lastChangedDateTime ? data.lastChangedDateTime : "-"
            return data
          })
          : []
          if (data?.data?.length === 1){
            setDisableFlag(true)
          }
        setDeviceList(deviceDetails)
      }
    } catch (error) {
      setAddFailur("Error while fetching the device details")
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

  const updatePrePopulatedUserProfile = (updatedProfile: UserProfile) => {
    setPrePopulatedUserProfile(updatedProfile);
  };

  return (

    <div className="mb-4 col-span-full xl:mb-2 p-4">
      <BreadCrumbs />
      <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
        User's Profile
      </h1>

      {fidoLoader
        ? <div className="flex items-center justify-center mb-4">

          <CustomSpinner />
        </div>
        :

        <div className="lg:flex max-sm p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800 grid-cols-2 gap-10 mt-6">

          {/* first section */}
          <div className='lg:w-1/3'>

            {!isEditProfileOpen && prePopulatedUserProfile && (
              <DisplayUserProfile
                toggleEditProfile={toggleEditProfile}
                userProfileInfo={prePopulatedUserProfile}
              />
            )}

            {isEditProfileOpen && prePopulatedUserProfile && (
              <UpdateUserProfile
                toggleEditProfile={toggleEditProfile}
                userProfileInfo={prePopulatedUserProfile}
                updateProfile={updatePrePopulatedUserProfile}
              />
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
                    <DeviceDetails deviceFriendlyName={element['deviceFriendlyName']} createDateTime={element['createDateTime']} credentialID={element['credentialId']} refreshList={userDeviceDetails} disableRevoke={disableFlag} />
                  ))}
              </div>

              <div>

                <button onClick={addDevice} type="button" className="ml-2 mt-2 text-white bg-primary-700 hover:!bg-primary-800 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 mr-2 mb-2">
                  <svg className='mr-2 pr-2' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                  </svg>
                  Create Passkey
                </button>
                {
                  (addSuccess || addfailure || fidoError) &&
                  <div className='p-2'>
                    <Alert
                      color={addSuccess ? "success" : "failure"}
                      onDismiss={() => {
                        setAddSuccess(null)
                        setFidoError('')
                        setAddFailur('')
                      }}
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

          <PasskeyAddDevice openModal={openModel} setOpenModel={props.setOpenModel} closeModal={function (flag: boolean): void {
            throw new Error('Function not implemented.');
          }
          }
            registerWithPasskey={registerWithPasskey}
          />
        </div>
      }
    </div>
  );
};

export default AddPasskey;
