'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'

interface DeleteModalProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (flag: boolean) => void
  deviceName: string
}

const DeleteModal = ({
  openModal,
  closeModal,
  onSuccess,
  deviceName,
}: DeleteModalProps): React.JSX.Element => (
  <Dialog open={openModal} onOpenChange={closeModal}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1.5">
            <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Revoke Device
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Are you sure you want to revoke{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {deviceName}?
              </span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <DialogFooter className="mt-4 flex justify-center gap-4">
        <Button variant="outline" onClick={() => closeModal(false)}>
          No, cancel
        </Button>
        <Button variant="destructive" onClick={() => onSuccess(true)}>
          Yes, I am sure
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default DeleteModal
