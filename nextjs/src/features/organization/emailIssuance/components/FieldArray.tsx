import { Field, FieldArrayRenderProps, FormikProps } from 'formik'
import React, { JSX, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { UserData } from '../type/EmailIssuance'

interface IFormikAddButton {
  arrayHelpers: FieldArrayRenderProps
  formikHandlers?: FormikProps<UserData>
}
function FieldArrayData({
  arrayHelpers,
  formikHandlers,
}: IFormikAddButton): JSX.Element {
  return (
    <div className="">
      {arrayHelpers.form.values.formData &&
        arrayHelpers.form.values.formData.length > 0 &&
        arrayHelpers.form.values.formData.map(
          (
            formData1: {
              attributes: {
                isRequired: boolean
                displayName: ReactNode | string
                attributeName: ReactNode | string
                name:
                  | string
                  | number
                  | boolean
                  | React.ReactElement
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | null
                  | undefined
                schemaDataType: string
              }[]
            },
            index: React.Key | null | undefined,
          ) => (
            <div
              key={index}
              className="mb-4 rounded-lg border border-gray-200 px-4 pt-8 pb-10"
            >
              <div className="flex justify-between">
                <div className="relative mb-4 flex w-10/12 items-center gap-2">
                  <label
                    className="text-base font-semibold dark:text-white"
                    style={{
                      minWidth: '80px',
                    }}
                  >
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name={`formData[${index}].email`}
                    placeholder={'email'}
                    type="email"
                    className="sm:text-md focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 md:w-5/12 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />

                  <div className="absolute top-11 left-24">
                    {((): JSX.Element | null => {
                      const errorItem =
                        formikHandlers?.errors?.formData?.[index as number]
                      const touchedItem =
                        formikHandlers?.touched?.formData?.[index as number]

                      if (
                        errorItem &&
                        typeof errorItem === 'object' && // narrow to object
                        'email' in errorItem && // ensure 'email' exists in error
                        touchedItem &&
                        typeof touchedItem === 'object' &&
                        'email' in touchedItem &&
                        touchedItem.email // check that email field was touched
                      ) {
                        return (
                          <label
                            style={{
                              color: 'red',
                            }}
                            className="text-sm"
                          >
                            {errorItem.email}
                          </label>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>

                {arrayHelpers.form.values.formData.length > 1 && (
                  <div
                    key={index as number}
                    className="flex justify-end text-red-600 sm:w-2/12"
                  >
                    <Button
                      data-testid="deleteBtn"
                      type="button"
                      color="danger"
                      onClick={() => arrayHelpers.remove(index as number)}
                      disabled={arrayHelpers.form.values.formData.length === 1}
                      className={
                        'flex justify-end focus:ring-0 dark:bg-gray-700'
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>

              <label className="w-20 text-base font-semibold dark:text-white">
                Credential data:
              </label>
              <div className="grid w-full grid-cols-1 gap-2 gap-8 md:grid-cols-2">
                {formData1.attributes &&
                  formData1?.attributes.length > 0 &&
                  formData1?.attributes.map(
                    (
                      item: {
                        isRequired: boolean
                        displayName: ReactNode | string
                        attributeName: ReactNode | string
                        name:
                          | string
                          | number
                          | boolean
                          | React.ReactElement
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | null
                          | undefined
                        schemaDataType: string
                      },
                      attIndex: number,
                    ) => (
                      <div className="mt-3" key={attIndex}>
                        <div className="relative flex w-full items-center gap-2">
                          <label className="word-break-word w-[300px] text-base text-gray-800 dark:text-white">
                            {item?.displayName}
                            {item.isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <div className="w-8/12">
                            <Field
                              type={item.schemaDataType}
                              placeholder={item.name}
                              name={`formData[${index}].attributes.${attIndex}.value`}
                              className="sm:text-md focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            />
                            {((): JSX.Element | null => {
                              const errorAtIndex =
                                formikHandlers?.errors?.formData?.[
                                  index as number
                                ]
                              const touchedAtIndex =
                                formikHandlers?.touched?.formData?.[
                                  index as number
                                ]

                              if (
                                errorAtIndex &&
                                typeof errorAtIndex === 'object' &&
                                'attributes' in errorAtIndex &&
                                touchedAtIndex &&
                                typeof touchedAtIndex === 'object' &&
                                'attributes' in touchedAtIndex
                              ) {
                                const errorAttr =
                                  errorAtIndex.attributes?.[attIndex]
                                const touchedAttr =
                                  touchedAtIndex.attributes?.[attIndex]

                                // Narrow the errorAttr: it must be an object with 'value' prop
                                if (
                                  errorAttr &&
                                  typeof errorAttr === 'object' &&
                                  'value' in errorAttr &&
                                  touchedAttr &&
                                  typeof touchedAttr === 'object' &&
                                  'value' in touchedAttr &&
                                  touchedAttr.value // touchedAttr.value must be truthy
                                ) {
                                  return (
                                    <label className="absolute text-xs text-red-500">
                                      {errorAttr.value}
                                    </label>
                                  )
                                }
                              }

                              return null
                            })()}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>
          ),
        )}
    </div>
  )
}

export default FieldArrayData
