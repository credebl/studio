import { FieldArrayRenderProps, FormikProps } from 'formik'
import { IAttributes, UserData } from '../type/EmailIssuance'
import React, { JSX } from 'react'

import { AddAnotherButton } from '@/config/svgs/EmailIssuance'
import { Button } from '@/components/ui/button'
import { formikAddButtonStyles } from '@/config/CommonConstant'

interface IFormikAddButton {
  arrayHelpers: FieldArrayRenderProps
  attributes?: IAttributes[]
  formikHandlers?: FormikProps<UserData>
}

const FormikAddButton = ({
  arrayHelpers,
  attributes,
  formikHandlers,
}: IFormikAddButton): JSX.Element => (
  <div className="absolute bottom-[17px] flex w-full justify-center">
    <Button
      onClick={() =>
        arrayHelpers.push({
          email: '',
          attributes: attributes?.map((item: IAttributes) => ({
            attributeName: item.attributeName,
            schemaDataType: item.schemaDataType,
            displayName: item.displayName,
            value: '',
            name: item.attributeName,
            isRequired: item.isRequired,
          })),
        })
      }
      disabled={
        arrayHelpers.form.values.formData.length >= 10 ||
        !formikHandlers?.isValid
      }
      className="border-ring hover:bg-primary/90 flex items-center rounded-full border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-100"
      variant={'default'}
      type="button"
      style={formikAddButtonStyles}
    >
      <AddAnotherButton />
      <span className="my-0.5 ml-1">Add another</span>
    </Button>
  </div>
)

export default FormikAddButton
