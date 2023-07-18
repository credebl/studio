import React, { useState } from 'react';
import { axiosPost, axiosPut } from '../../services/apiRequests';
import { startRegistration } from '@simplewebauthn/browser'
import type { AxiosError } from 'axios';
import { generateRegistrationOption, verifyRegistration } from '../../api/Fido';

const SessionCard = () => {
  let userEmail = 'tipuone1@yopmail.com'
  const [fidoError, setFidoError] = useState("")
  const [fidoLoader, setFidoLoader] = useState(false)

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
    alert("Test")
    console.log("tipuone1@yopmail.com::::----------", 797878)
    try {
      registerWithPasskey(true)
    } catch (error) {
      setFidoLoader(false)
      console.log("error:::", error)
    }
  }

  const registerWithPasskey = async (flag: any): Promise<void> => {
    try {
      const config = { headers: {} }
      const payload = {
        userName: userEmail,
        deviceFlag: flag
      }

      // Generate Registration Option
      const response: any = await generateRegistrationOption(payload)

      const opts = response?.data?.data
      const challangeId = response?.data?.data?.challenge
      if (opts) {
        opts.authenticatorSelection = {
          residentKey: "preferred",
          requireResidentKey: false,
          userVerification: "preferred"
        }
      }
      const attResp = await startRegistration(opts)

      const newObj = {
        ...attResp,
        challangeId
      }
      // Verify Registration Option
      // const verificationDetails = {
      //     url: `${process.env.REACT_APP_API_ENDPOINT}${API_ROUTES.fido.verifyRegistration}${userEmail}`,
      //     payload: newObj,
      //     config
      // }
      const verificationRegisterResp: any = await verifyRegistration(newObj)
      const credentialID = verificationRegisterResp?.data?.data?.newDevice?.credentialID

      if (verificationRegisterResp?.data?.data?.verified) {

        alert("Passkey Created sucessfully")
        let platformDeviceName = ''

        if (attResp?.authenticatorAttachment === "cross-platform") {
          platformDeviceName = 'Passkey'
        } else {
          platformDeviceName = navigator.platform
        }


        const deviceBody = {
          userName: userEmail,
          credentialId: credentialID,
          deviceFriendlyName: platformDeviceName
        }

        //send device details after sucessfull verify
        // const sendDeviceDetails = {
        //     url: `${process.env.REACT_APP_API_ENDPOINT}${API_ROUTES.fido.userUpdate}`,
        //     payload: deviceBody,
        //     config
        // }

        try {
          // const deviceDetailsResp = await axiosPut(sendDeviceDetails)
          // if (deviceDetailsResp) {
          //     // userDeviceDetails()
          // }

        } catch (error) {
          showFidoError(error)
        }
      }

    } catch (error) {
      showFidoError(error)
    }
  }
  return (
    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
      <div className="flow-root">
        <h3 className="text-xl font-semibold dark:text-white">Sessions</h3>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate dark:text-white">
                  California 123.123.123.123
                </p>
                <p className="text-sm font-normal text-gray-500 truncate dark:text-gray-400">
                  Chrome on macOS
                </p>
              </div>
              <div className="inline-flex items-center">
                <a
                  href="#"
                  className="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Revoke
                </a>
              </div>
            </div>
          </li>
          <li className="pt-4 pb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate dark:text-white">
                  Rome 24.456.355.98
                </p>
                <p className="text-sm font-normal text-gray-500 truncate dark:text-gray-400">
                  Safari on iPhone
                </p>
              </div>
              <div className="inline-flex items-center">
                <a
                  href="#"
                  className="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Revoke
                </a>
              </div>
            </div>
          </li>
        </ul>
        <div>
          <button
            className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            onClick={() => {
              alert("Test");
            }}
          >
            See more
          </button>

        </div>
      </div>
    </div>
  );
};

export default SessionCard;
