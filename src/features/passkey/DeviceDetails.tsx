'use client'

import { Laptop, Pencil } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { deleteDeviceById, editDeviceDetails } from '@/app/api/Fido'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import DeleteModal from './DeleteModal'
import EditModal from './EditModal'
import { Separator } from '@/components/ui/separator'
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
      <div className="flex items-start space-x-4 py-4">
        <div className="flex-shrink-0">
          <Laptop className="text-muted-foreground h-6 w-6" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex">
            <p className="truncate text-base font-semibold">
              {deviceFriendlyName}
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenEditModal(true)}
              className="h-7 w-7"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-muted-foreground truncate text-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{dateConversion(createDateTime)}</span>
              </TooltipTrigger>
              <TooltipContent>{createDateTime}</TooltipContent>
            </Tooltip>
          </p>

          <p className="text-muted-foreground truncate text-sm">
            {credentialID}
          </p>

          <div className="mt-2 flex justify-end">
            <Button onClick={() => setOpenDeleteModal(true)}>Revoke</Button>
          </div>
        </div>
      </div>

      <Separator />

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
      />
    </>
  )
}
