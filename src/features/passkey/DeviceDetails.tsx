import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { deleteDeviceById, editDeviceDetails } from '@/app/api/Fido'
import { useEffect, useState } from 'react'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/DataTable'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
import DeleteModal from './DeleteModal'
import { EditIcon } from '@/config/svgs/EditIcon'
import EditModal from './EditModal'
import { Laptop } from 'lucide-react'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'

interface IResponseMessages {
  type: 'error' | 'success'
  message: string
}

interface DeviceRow {
  deviceFriendlyName: string
  createDateTime: string
  credentialId: string
}
interface DeviceDetailsTableProps {
  devices: DeviceRow[]
  refreshList: () => void
  disableRevoke: boolean
  responseMessages: (value: IResponseMessages) => void
}

export default function DeviceDetails({
  devices,
  refreshList,
  disableRevoke,
  responseMessages,
}: Readonly<DeviceDetailsTableProps>): React.JSX.Element {
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceRow | null>(null)

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
    if (confirmed && selectedDevice?.credentialId) {
      await deleteDevice(selectedDevice.credentialId)
    }
    setOpenDeleteModal(false)
  }

  const handleEditConfirm = async (newDeviceName: string): Promise<void> => {
    if (!selectedDevice) {
      return
    }
    try {
      const encodedUrl = encodeURIComponent(selectedDevice.credentialId)
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
      console.error('Error updating device:', err)
      responseMessages({ type: 'error', message: 'Error updating device' })
    }
    setOpenEditModal(false)
  }

  const headers = [
    { columnName: 'Device' },
    { columnName: 'Credential ID' },
    { columnName: 'Created' },
    { columnName: 'Actions' },
  ]

  const rows = devices.map((device) => ({
    data: [
      {
        data: (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Laptop className="h-4 w-4 text-gray-500" />
            </div>
            <span>{device.deviceFriendlyName}</span>
          </div>
        ),
        inputType: 'custom',
      },
      {
        data: device.credentialId,
        inputType: 'custom',
      },
      {
        data: (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{dateConversion(device.createDateTime)}</span>
            </TooltipTrigger>
            <TooltipContent>{device.createDateTime}</TooltipContent>
          </Tooltip>
        ),
        inputType: 'custom',
      },
      {
        data: (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedDevice(device)
                setOpenEditModal(true)
              }}
              className="h-8 w-8"
              aria-label="Edit device"
            >
              <EditIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedDevice(device)
                setOpenDeleteModal(true)
              }}
              disabled={disableRevoke}
              className={
                disableRevoke
                  ? 'h-8 w-8 cursor-not-allowed opacity-50'
                  : 'h-8 w-8'
              }
              aria-label="Delete device"
            >
              <DeleteIcon />
            </Button>
          </div>
        ),
        inputType: 'custom',
      },
    ],
  }))

  useEffect(() => {
    if (!selectedDevice) {
      setOpenDeleteModal(false)
      setOpenEditModal(false)
    }
  }, [selectedDevice])

  return (
    <>
      {devices.length > 0 && (
        <DataTable header={headers} data={rows} loading={false} />
      )}

      {selectedDevice && (
        <DeleteModal
          openModal={openDeleteModal}
          closeModal={() => setOpenDeleteModal(false)}
          onSuccess={handleDeleteConfirm}
          deviceName={selectedDevice.deviceFriendlyName}
        />
      )}

      {selectedDevice && (
        <EditModal
          openModal={openEditModal}
          closeModal={() => setOpenEditModal(false)}
          onSuccess={handleEditConfirm}
          initialName={selectedDevice.deviceFriendlyName}
        />
      )}
    </>
  )
}
