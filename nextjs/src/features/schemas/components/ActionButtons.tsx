import React, { JSX } from 'react'

import { ActionButtonsProps } from '../type/schemas-interface'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

function ActionButtons({
  createLoader,
  formikHandlers,
  setShowPopup,
  disabled = false,
}: ActionButtonsProps): JSX.Element {
  return (
    <div className="float-right mt-16 ml-4 flex gap-4">
      <Button
        type="button"
        variant={'outline'}
        disabled={
          createLoader ||
          !(
            formikHandlers.values.schemaName ||
            formikHandlers.values.schemaVersion
          )
        }
        className="ml-auto rounded-lg text-base font-medium"
        style={{
          height: '2.6rem',
          width: '6rem',
          minWidth: '2rem',
        }}
        onClick={() => setShowPopup({ show: true, type: 'reset' })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="dark:group-hover:text-primary-700 mr-2"
          width="10"
          height="18"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            fill="currentColor"
            d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z"
          />
        </svg>
        Reset
      </Button>
      <Button
        type="submit"
        color="bg-primary-700"
        disabled={disabled}
        className="ml-auto rounded-lg text-center text-base font-medium sm:w-auto"
        style={{
          height: '2.6rem',
          width: 'auto',
          minWidth: '2rem',
        }}
      >
        <Plus />
        Create
      </Button>
    </div>
  )
}

export default ActionButtons
