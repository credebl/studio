'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface DeleteModalProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSucess: (flag: boolean) => void
  deviceName: string
}

const DeleteModal = ({
  openModal,
  closeModal,
  onSucess,
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
                {deviceName}
              </span>
              ?
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
      </DialogHeader>

      <div className="flex justify-center">
        <Trash2 className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </div>

      <DialogFooter className="mt-4 flex justify-center gap-4">
        <Button variant="outline" onClick={() => closeModal(false)}>
          No, cancel
        </Button>
        <Button variant="destructive" onClick={() => onSucess(true)}>
          Yes, I am sure
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default DeleteModal
