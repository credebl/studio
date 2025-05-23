import * as Yup from 'yup'

import {
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
  FormikTouched,
} from 'formik'
import React, { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IAttributesData } from '../type/Issuance'

const FieldArrayData = ({arrayHelpers,values,w3cSchema,issuanceFormPayload}): JSX.Element => {
  const Name = (attr: { attr: string }): JSX.Element => (
    <>
      {attr?.attr
        ?.split('_')
        .map(
          (item: string) => item[0].toUpperCase() + item.slice(1, item.length),
        )
        .join(' ')}
    </>
  )

  return (
    <FieldArray name="credentialData">
      {(arrayHelpers) => (
        <>
          {values?.credentialData?.length > 0 &&
            values?.credentialData?.map((user, index: number) => {
              const attributes = w3cSchema
                ? issuanceFormPayload?.credentialData?.[0].attributes
                : user?.attributes

              return (
                <div key={user.connectionId}>
                  <Card
                    className="bg-background my-5 px-4 py-8"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      overflow: 'auto',
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="flex">
                        <h5 className="flex flex-wrap text-xl leading-none font-bold dark:text-white">
                          Connection Id
                        </h5>
                        <span className="pl-1 text-xl leading-none font-bold dark:text-white">
                          :
                        </span>
                        <p className="pl-1 dark:text-white">
                          {user?.connectionId}
                        </p>
                      </div>
                      {values.credentialData.length > 1 && (
                        <div
                          key={index}
                          className="flex justify-end text-red-600 sm:w-2/12"
                        >
                          <Button
                            data-testid="deleteBtn"
                            color="danger"
                            type="button"
                            className={
                              'flex justify-end focus:ring-0 dark:bg-gray-700'
                            }
                            onClick={() => {
                              arrayHelpers.remove(index)
                            }}
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

                    <h3 className="dark:text-white">Attributes</h3>
                    <div className="container mx-auto pr-2">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {Array.isArray(attributes) &&
                          attributes?.map(
                            (attr: IAttributesData, attrIndex: number) => (
                              <div
                                key={`${user.connectionId}-${attr.name}-${attrIndex}`}
                              >
                                <div key={attr?.name} className="flex">
                                  <label
                                    htmlFor={`credentialData.${index}.attributes.${attrIndex}.value`}
                                    className="flex w-2/5 items-center justify-end pr-3 font-light dark:text-white"
                                  >
                                    <div className="word-break-word flex items-center text-end">
                                      <Name attr={attr?.name} />
                                      {attr.isRequired && (
                                        <span className="text-red-500">*</span>
                                      )}{' '}
                                      :
                                    </div>
                                  </label>
                                  <div className="w-3/5">
                                    <Field
                                      type={
                                        attr?.dataType === 'date'
                                          ? 'date'
                                          : attr?.dataType
                                      }
                                      id={`credentialData.${index}.attributes.${attrIndex}.value`}
                                      name={`credentialData.${index}.attributes.${attrIndex}.value`}
                                      className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 relative block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                      validate={(value: string) => {
                                        try {
                                          const schema = Yup.reach(
                                            validationSchema,
                                            `credentialData.${index}.attributes.${attrIndex}.value`,
                                          )

                                          // Check if schema is an actual Yup schema with validateSync
                                          if (
                                            'validateSync' in schema &&
                                            typeof schema.validateSync ===
                                              'function'
                                          ) {
                                            schema.validateSync(value, {
                                              abortEarly: false,
                                            })
                                          }

                                          return undefined // No error
                                        } catch (error) {
                                          if (
                                            error instanceof Yup.ValidationError
                                          ) {
                                            return error.message
                                          }
                                          return 'Validation failed'
                                        }
                                      }}
                                    />
                                    {showErrors(
                                      errors,
                                      touched,
                                      index,
                                      attrIndex,
                                    )}{' '}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
        </>
      )}
    </FieldArray>
  )
}

export default FieldArrayData
