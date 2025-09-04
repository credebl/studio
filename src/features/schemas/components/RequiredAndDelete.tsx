import React, { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
import { IRequiredAndDeleteProps } from '../type/schemas-interface'

function RequiredAndDelete({
  index,
  formikHandlers,
  areFirstInputsSelected,
  values,
  element,
  remove,
}: IRequiredAndDeleteProps): JSX.Element {
  return (
    <>
      <div className="absolute bottom-[-8px] left-6">
        <label
          className="flex items-center space-x-2"
          title="This will make the field required when issuing a credential"
        >
          <Checkbox
            name={`attribute[${index}].isRequired`}
            checked={
              formikHandlers.values.attribute[index]?.isRequired || false
            }
            disabled={!areFirstInputsSelected}
            onCheckedChange={(checked) => {
              formikHandlers.setFieldValue(
                `attribute[${index}].isRequired`,
                checked,
                true,
              )
            }}
            className={
              'border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground h-4 w-4 translate-y-[2px] rounded-sm border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            }
          />
          <span className="text-foreground disabled:text-muted-foreground mt-1 text-sm">
            Required
          </span>
        </label>
      </div>

      <div className="max-w-[50px]" style={{ width: '5%' }}>
        {index === 0 && values.attribute.length === 1 ? (
          <div key={element.id} className="sm:w-0.5/3 text-destructive"></div>
        ) : (
          <div key={element.id} className="sm:w-0.5/3 text-destructive">
            <Button
              data-testid="deleteBtn"
              type="button"
              color="danger"
              onClick={() => remove(index)}
              className={`${
                index === 0 && values.attribute.length === 1
                  ? 'hidden'
                  : 'block'
              } mt-2 flex justify-end bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0`}
            >
              <DeleteIcon />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default RequiredAndDelete
