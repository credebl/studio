import React, { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { IContext } from '../type/BulkIssuance'
import { handleReset } from './BulkIssuanceUtils'

interface IResetIssueProps {
  context: IContext
}
export default function ResetIssue({ context }: IResetIssueProps): JSX.Element {
  const handleOpenConfirmation = (): void => {
    context.setOpenModal(true)
  }
  return (
    <div className="mt-4">
      <Button
        onClick={handleOpenConfirmation}
        disabled={!context.isFileUploaded}
        type="reset"
        className="bg-primary ring-primary hover:bg-primary/90 dark:hover:bg-primary float-right mx-4 mr-0 mb-4 ml-4 rounded-lg px-4 py-2 text-sm font-medium ring-2 lg:px-5 lg:py-2.5"
        style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="27"
          height="18"
          fill="current"
          viewBox="0 0 27 18"
          className="mr-1"
          style={{ height: '20px', width: '30px' }}
        >
          <path
            fill="currentColor"
            d="M26.82 6.288 20.469.173a.632.632 0 0 0-.87 0l-2.256 2.172H9.728c-1.754 0-3.424.77-4.53 2.073h-1.2V3.53a.604.604 0 0 0-.614-.592H.615A.604.604 0 0 0 0 3.53c0 .327.275.592.615.592h2.153v8.293H.615a.604.604 0 0 0-.615.592c0 .327.275.592.615.592h2.769c.34 0 .615-.265.615-.592v-1.481h1.2c1.105 1.304 2.775 2.073 4.53 2.073h.715l4.391 4.227c.12.116.278.174.435.174a.626.626 0 0 0 .435-.174l11.115-10.7a.581.581 0 0 0 .18-.419.581.581 0 0 0-.18-.419ZM5.998 10.585a.623.623 0 0 0-.498-.244H4V5.603h1.5c.197 0 .382-.09.498-.243.867-1.146 2.262-1.83 3.73-1.83h6.384l-3.65 3.514a6.103 6.103 0 0 1-1.355-1.31.63.63 0 0 0-.86-.131.578.578 0 0 0-.135.827c1.167 1.545 2.89 2.56 4.85 2.857a.67.67 0 0 1 .575.762.69.69 0 0 1-.791.555 8.905 8.905 0 0 1-4.534-2.08.632.632 0 0 0-.869.04.577.577 0 0 0 .043.837c.11.096.223.19.337.28l-1.24 1.193a.582.582 0 0 0-.18.419c0 .157.066.308.18.419l.698.67a4.675 4.675 0 0 1-3.183-1.797Zm9.272 5.985-5.48-5.277.942-.907a10.27 10.27 0 0 0 3.823 1.388c.101.015.201.022.3.022.93 0 1.75-.651 1.899-1.562.165-1.009-.553-1.958-1.6-2.117a6.411 6.411 0 0 1-1.592-.456l6.473-6.231 5.48 5.277L15.27 16.57Z"
          />
        </svg>
        <span className="text-custom-900">Issue</span>
      </Button>
      <Button
        onClick={() => handleReset(context)}
        type="reset"
        variant={'outline'}
        className="group ml-auto flex h-[2.6rem] w-[6rem] min-w-[2rem] shrink-0 rounded-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className=""
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z" />
        </svg>
        Reset
      </Button>
    </div>
  )
}
