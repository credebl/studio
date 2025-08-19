import { Button } from '@/components/ui/button'
import { CircleCheck } from 'lucide-react'
import { JSX } from 'react'
import { Modal } from '@/components/ui/modal'

interface IProps {
  openModal: boolean
  closeModal: (flag: boolean) => void
  onSuccess: (flag: boolean) => void
  isProcessing: boolean
}

const IssuancePopup = (props: IProps): JSX.Element => (
  <Modal
    title=""
    description=""
    className="m-0 p-0 dark:bg-gray-700"
    isOpen={props.openModal}
    onClose={() => {
      props.closeModal(false)
    }}
  >
    <div className="relative max-h-full w-full max-w-xl">
      <div className="relative rounded-lg bg-white dark:bg-gray-700">
        <div className="p-6 text-center">
          <CircleCheck size={80} color="var(--primary)" className="m-auto" />
          <p className="text-primary dark:text-primary/80 mb-4 text-3xl">
            Confirmation
          </p>
          <h3 className="mb-6 text-xl font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to{' '}
            <span className="text-primary-900 dark:text-primary-700">
              {' '}
              Offer
            </span>{' '}
            Credentials ?
          </h3>

          <div className="flex justify-center">
            <Button
              data-modal-hide="popup-modal"
              type="button"
              className="dark:hover:text-red:700 mr-8 flex items-center justify-center rounded-lg border border-red-500 bg-white px-5 py-2.5 text-lg text-red-500 hover:bg-gray-50 hover:text-red-600 focus:outline-none dark:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600"
              onClick={() => {
                props.closeModal(false)
              }}
            >
              No, Cancel
            </Button>
            <Button
              type="submit"
              // isProcessing={props.isProcessing}
              disabled={props.isProcessing}
              variant={'default'}
              onClick={() => {
                props.onSuccess(true)
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
              }}
              className="ml-2 inline-flex items-center rounded-lg text-center"
            >
              <p className="text-lg font-normal">Yes, I&apos;m sure</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
)

export default IssuancePopup
