import { Field, FieldArrayRenderProps, FormikProps } from 'formik'
import React, { JSX, ReactNode } from 'react'
import { fieldArrayLabelStyles, labelRed } from '@/config/CommonConstant'

import { Button } from '@/components/ui/button'
import { UserData } from '../type/EmailIssuance'
import delSvg from '@/../public/svgs/del.svg'

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
                name: string

                schemaDataType: string
              }[]
            },
            index: React.Key | null | undefined,
          ) => (
            <div
              key={`firstLayer-${index}`}
              className="mb-4 rounded-lg border border-gray-200 px-4 pt-8 pb-10"
            >
              <div className="flex justify-between">
                <div className="relative mb-4 flex w-10/12 items-center gap-2">
                  <span
                    className="text-base font-semibold dark:text-white"
                    style={fieldArrayLabelStyles}
                  >
                    Email ID <span className="text-destructive">*</span>
                  </span>
                  <Field
                    name={`formData[${index}].email`}
                    placeholder={'email'}
                    type="email"
                    className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:w-5/12 md:text-sm"
                  />

                  <div className="absolute top-8 left-24">
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
                          <label style={labelRed} className="text-sm">
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
                    className="text-destructive flex justify-end sm:w-2/12"
                  >
                    <Button
                      data-testid="deleteBtn"
                      type="button"
                      variant={'default'}
                      onClick={() => arrayHelpers.remove(index as number)}
                      disabled={arrayHelpers.form.values.formData.length === 1}
                      className={
                        'flex justify-center border-none bg-transparent shadow-none hover:bg-transparent focus:ring-0'
                      }
                    >
                      <img
                        src={delSvg.src}
                        alt="delete"
                        className="mx-auto h-6 w-6"
                      />
                    </Button>
                  </div>
                )}
              </div>

              <span className="mt-8 w-20 text-base font-semibold">
                Credential data:
              </span>
              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
                {formData1.attributes &&
                  formData1?.attributes.length > 0 &&
                  formData1?.attributes.map(
                    (
                      item: {
                        isRequired: boolean
                        displayName: ReactNode | string
                        attributeName: ReactNode | string
                        name: string
                        schemaDataType: string
                      },
                      attIndex: number,
                    ) => (
                      <div className="mt-3" key={attIndex}>
                        <div className="relative grid w-full grid-cols-[1fr_3fr] items-center gap-2">
                          <label className="word-break-word text-base">
                            {item?.displayName}
                            {item.isRequired && (
                              <span className="text-destructive">*</span>
                            )}
                          </label>
                          <div className="w-8/12">
                            <Field
                              type={item.schemaDataType}
                              placeholder={item.name}
                              name={`formData[${index}].attributes.${attIndex}.value`}
                              className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                                    <label className="text-destructive absolute text-xs">
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
