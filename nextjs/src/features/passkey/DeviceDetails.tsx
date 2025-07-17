import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { deleteDeviceById, editDeviceDetails } from '@/app/api/Fido'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
import DeleteModal from './DeleteModal'
import { EditIcon } from '@/config/svgs/EditIcon'
import EditModal from './EditModal'
import { Laptop } from 'lucide-react'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { useState } from 'react'

interface IResponseMessages {
  type: 'error' | 'success'
  message: string
}

interface DeviceDetailsProps {
  deviceFriendlyName: string
  createDateTime: string
  credentialID: string
  refreshList: () => void
  disableRevoke: boolean
  responseMessages: (value: IResponseMessages) => void
}

export default function DeviceDetails({
  deviceFriendlyName,
  createDateTime,
  credentialID,
  refreshList,
  responseMessages,
  disableRevoke,
}: DeviceDetailsProps): React.JSX.Element {
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)

  const deleteDevice = async (credentialId: string): Promise<void> => {
    try {
      const encodedUrl = encodeURIComponent(credentialId)
      const response = await deleteDeviceById(encodedUrl)
      if (response) {
        refreshList()
      }
    } catch (error) {
      console.error('Error while deleting device:', error)
    }
  }

  const handleDeleteConfirm = async (confirmed: boolean): Promise<void> => {
    if (confirmed) {
      await deleteDevice(credentialID)
    }
    setOpenDeleteModal(false)
  }

  const handleEditConfirm = async (newDeviceName: string): Promise<void> => {
    try {
      const encodedUrl = encodeURIComponent(credentialID)
      const payload = {
        enCodedUrl: encodedUrl,
        updatedDeviceName: newDeviceName,
      }

      const editDeviceDetailsResponse = await editDeviceDetails(payload)
      const { data } = editDeviceDetailsResponse as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        responseMessages({ type: 'success', message: data?.message })
        refreshList()
      } else {
        responseMessages({ type: 'error', message: 'Device update failed' })
      }
    } catch (err) {
      responseMessages({ type: 'error', message: 'Error updating device' })
    }
    setOpenEditModal(false)
  }

  return (
    <>
      <tr className="border-t text-sm text-gray-700">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Laptop className="h-4 w-4 text-gray-500" />
            </div>
            <span>{deviceFriendlyName}</span>
          </div>
        </td>

        <td className="px-6 py-4">{credentialID}</td>

        <td className="px-6 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{dateConversion(createDateTime)}</span>
            </TooltipTrigger>
            <TooltipContent>{createDateTime}</TooltipContent>
          </Tooltip>
        </td>

        <td className="space-x-2 px-6 py-4 text-right">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenEditModal(true)}
            className="h-8 w-8"
          >
            <EditIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenDeleteModal(true)}
            disabled={disableRevoke}
            className={
              disableRevoke
                ? 'h-8 w-8 cursor-not-allowed opacity-50'
                : 'h-8 w-8'
            }
          >
            <DeleteIcon />
          </Button>
        </td>
      </tr>

      <DeleteModal
        openModal={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        onSucess={handleDeleteConfirm}
        deviceName={deviceFriendlyName}
      />

      <EditModal
        openModal={openEditModal}
        closeModal={() => setOpenEditModal(false)}
        onSucess={handleEditConfirm}
        initialName={deviceFriendlyName}
      />
    </>
  )
}
