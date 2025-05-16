import { deleteDeviceById, editDeviceDetails } from '../api/Fido'

import { Alert } from 'flowbite-react'
import type { AxiosResponse } from 'axios'
import DateTooltip from '../components/Tooltip'
import DeleteModal from './DeletePopup'
import EditModal from './EditPopup'
import { apiStatusCodes } from '../config/CommonConstant'
import { dateConversion } from '../utils/DateConversion'
import { useState } from 'react'

interface IResponseMessages {
  type: 'error' | 'success'
  message: string
}

const DeviceDetails = (props: {
  deviceFriendlyName: string
  createDateTime: string
  credentialID: string
  refreshList: () => void
  disableRevoke: boolean
  responseMessages: (value: IResponseMessages) => void
}) => {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openEditModel, setOpenEditModel] = useState<boolean>(false)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [editfailure, setEditFailure] = useState<string | null>(null)
  const handleDeleteModel = (flag: boolean) => {
    setOpenModal(flag)
  }
  const handleEditModel = (flag: boolean) => {
    setOpenEditModel(flag)
  }
  const deleteDeviceCredentialById = (deviceDeleteflag: boolean) => {
    if (deviceDeleteflag) {
      deleteDevice(props?.credentialID)
      setOpenModal(false)
    }
  }

  const deleteDevice = async (credentialId: string): Promise<void> => {
    try {
      const enCodedUrl = encodeURIComponent(credentialId)
      const verificationRegisterResp = await deleteDeviceById(enCodedUrl)
      if (verificationRegisterResp) {
        props.refreshList()
      }
    } catch (error) {
      console.error('Error while deleting device:', error)
    }
  }

  const editDevice = async (deviceName: string) => {
    const enCodedUrl = encodeURIComponent(props.credentialID)
    const deviceDetails = {
      enCodedUrl: enCodedUrl,
      updatedDeviceName: deviceName,
    }
    const editDeviceDetailsResponse = await editDeviceDetails(deviceDetails)
    const { data } = editDeviceDetailsResponse as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      await setEditSuccess(data?.message)
      props.responseMessages({
        type: 'success',
        message: data?.message,
      })
      props.refreshList()
    } else {
      setEditFailure(editDeviceDetailsResponse as string)
      props.responseMessages({
        type: 'error',
        message: editDeviceDetailsResponse as string,
      })
    }
  }

  return (
    <>
      <ul className="divide-gray-200 dark:divide-gray-700">
        <li className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex">
                <p className="!mb-0 truncate pr-3 text-base font-semibold text-gray-900 dark:text-white">
                  {props?.deviceFriendlyName}
                </p>
                <button
                  className="rounded border border-gray-400 p-1 hover:bg-gray-100 dark:text-white dark:hover:bg-black dark:hover:text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    setOpenEditModel(true)
                  }}
                >
                  <svg
                    className="h-4 w-4 dark:text-white dark:hover:text-white"
                    viewBox="0 0 20 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                    <line x1="16" y1="5" x2="19" y2="8" />
                  </svg>
                </button>
              </div>
              <p className="truncate text-sm font-normal text-gray-500 dark:text-gray-400">
                <DateTooltip date={props?.createDateTime}>
                  {dateConversion(props?.createDateTime)}
                </DateTooltip>
              </p>
              <p className="truncate text-sm font-normal text-gray-500 dark:text-gray-400">
                {props.credentialID}
              </p>
            </div>
            <div className="inline-flex items-center">
              <button
                className={`mr-3 mb-3 border bg-white px-3 py-2 text-center text-sm font-medium text-gray-900 ${
                  props.disableRevoke
                    ? 'cursor-not-allowed border-gray-400 text-gray-400'
                    : 'focus:ring-primary-300 border-gray-300 text-gray-900 hover:bg-gray-100 focus:ring-4'
                } rounded-lg ${
                  props.disableRevoke
                    ? 'dark:border-gray-400 dark:bg-gray-800 dark:text-gray-400'
                    : 'dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
                disabled={props.disableRevoke}
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteModel(true)
                }}
              >
                Revoke
              </button>
            </div>
          </div>
        </li>
      </ul>
      <>
        <DeleteModal
          openModal={openModal}
          closeModal={handleDeleteModel}
          onSucess={deleteDeviceCredentialById}
          deviceName={props?.deviceFriendlyName}
        />
      </>
      <>
        <EditModal
          openModal={openEditModel}
          closeModal={handleEditModel}
          onSucess={editDevice}
        />
      </>
    </>
  )
}

export default DeviceDetails
