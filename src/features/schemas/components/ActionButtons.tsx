import React, { JSX } from 'react'

import { ActionButtonsProps } from '../type/schemas-interface'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ResetSVG } from '@/config/svgs/CreateSchema'
import { createSchemaStyles } from '@/config/CommonConstant'

function ActionButtons({
  createLoader,
  formikHandlers,
  setShowPopup,
  disabled = false,
}: Readonly<ActionButtonsProps>): JSX.Element {
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
        style={createSchemaStyles.resetButton}
        onClick={() => setShowPopup({ show: true, type: 'reset' })}
      >
        <ResetSVG />
        Reset
      </Button>
      <Button
        type="submit"
        disabled={disabled}
        className="ml-auto rounded-lg text-center text-base font-medium sm:w-auto"
        style={createSchemaStyles.createButton}
      >
        <Plus />
        Create
      </Button>
    </div>
  )
}

export default ActionButtons
