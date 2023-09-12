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
import UpdatePassword from './UpdatePassword';
import EditUserProfile from './EditUserProfile';
import UpdateUserProfile from './EditUserProfile';
import CustomSpinner from '../CustomSpinner';

const AddPasskey = () => {
  const [fidoError, setFidoError] = useState("")
  const [fidoLoader, setFidoLoader] = useState(false)
  const [OrgUserEmail, setOrgUserEmail] = useState<string>('')
  const [deviceList, setDeviceList] = useState<IDeviceData[]>([])
  const [addSuccess, setAddSuccess] = useState<string | null>(null)
  const [addfailure, setAddFailur] = useState<string | null>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [prePopulatedUserProfile, setPrePopulatedUserProfile] = useState<UserProfile | null>(null);


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

  const updatePrePopulatedUserProfile = (updatedProfile: UserProfile) => {
    setPrePopulatedUserProfile(updatedProfile);
  };

  return (

    <div className="mb-4 col-span-full xl:mb-2 p-4">
      <BreadCrumbs />

      {fidoLoader
        ? <div className="flex items-center justify-center mb-4">

          <CustomSpinner />
        </div>
        :
        <div>
          <div className=' h-full flex flex-auto flex-col justify-between'>
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
              <ul className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
                <li className="mr-2" role="presentation">
                  <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 border-blue-600 dark:border-blue-500 " id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="true">Profile</button>
                </li>
                <li className="mr-2" role="presentation">
                  <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="password-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Password</button>
                </li>
                {/* <li className="mr-2" role="presentation">
                  <button className="text-xl inline-block p-4 border-b-2 rounded-t-lg text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Passkey</button>
                </li> */}

              </ul>
            </div>

          </div>
          <div id="myProfileTabContent">
                <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <DisplayUserProfile
                  toggleEditProfile={toggleEditProfile}
                  userProfileInfo={prePopulatedUserProfile}
                />               
                </div>
                <div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="password" role="tabpanel" aria-labelledby="password-tab">
                    <UpdatePassword />
                </div>
            </div>
        </div>
      }
    </div>
  );
};

export default AddPasskey;
