import { FieldArrayRenderProps, FormikProps } from 'formik'
import { IAttributes, UserData } from '../type/EmailIssuance'
import React, { JSX } from 'react'

import { Button } from '@/components/ui/button'

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
  <div className="absolute flex w-full justify-center">
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
      className="border-ring hover:bg-primary flex items-center rounded-xl border px-4 py-2 transition-colors disabled:cursor-not-allowed"
      variant={'ghost'}
      type="button"
      style={{
        height: '2rem',
        width: '10rem',
        minWidth: '2rem',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="my-0.5 ml-1">Add another</span>
    </Button>
  </div>
)

export default FormikAddButton
