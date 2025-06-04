import * as Yup from 'yup'

import { Field, FieldArray, FormikErrors, FormikTouched } from 'formik'
import {
  IAttributesData,
  ICredentialdata,
  IFieldArrayProps,
} from '../type/Issuance'
import React, { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import delSvg from '@/../public/svgs/del.svg'
import { fieldCardStyles } from '@/config/CommonConstant'

const FieldArrayData = ({
  values,
  w3cSchema,
  issuanceFormPayload,
  errors,
  touched,
  validationSchema,
}: IFieldArrayProps): JSX.Element => {
  function showErrors(
    errors: FormikErrors<{
      userName?: string
      credentialData: ICredentialdata[]
      credentialDefinitionId?: string
      orgId: string
    }>,
    touched: FormikTouched<{
      userName?: string
      credentialData: ICredentialdata[]
      credentialDefinitionId?: string
      orgId: string
    }>,
    index: number,
    attrIndex: number,
  ): JSX.Element | null {
    const attrErrors = errors?.credentialData?.[index]
    const attrTouched = Array.isArray(touched?.credentialData)
      ? touched.credentialData[index]
      : undefined
    const error =
      typeof attrErrors === 'object' && Array.isArray(attrErrors.attributes)
        ? attrErrors.attributes[attrIndex]?.value
        : undefined

    const touchedField =
      typeof attrTouched === 'object' && Array.isArray(attrTouched.attributes)
        ? attrTouched.attributes[attrIndex]?.value
        : undefined

    if (error && touchedField) {
      return <div className="text-destructive text-xs break-words">{error}</div>
    }

    return null
  }

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
                  <Card className="my-5 px-4 py-8" style={fieldCardStyles}>
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
                          className="text-destructive flex justify-end sm:w-2/12"
                        >
                          <Button
                            data-testid="deleteBtn"
                            color="danger"
                            type="button"
                            className={
                              'flex justify-center border-none bg-transparent shadow-none hover:bg-transparent focus:ring-0 dark:bg-gray-700'
                            }
                            onClick={() => {
                              arrayHelpers.remove(index)
                            }}
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

                    <h3 className="mb-2 leading-none font-semibold tracking-tight">
                      Attributes :
                    </h3>
                    <div className="container mx-auto pr-2">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {Array.isArray(attributes) &&
                          attributes?.map(
                            (attr: IAttributesData, attrIndex: number) => (
                              <div
                                key={`${user.connectionId}-${attr.name}-${attrIndex}`}
                              >
                                <div
                                  key={attr?.name}
                                  className="relative grid w-full grid-cols-[1fr_3fr] items-center gap-2"
                                >
                                  <label
                                    htmlFor={`credentialData.${index}.attributes.${attrIndex}.value`}
                                    className="break-words text-base"
                                  >
                                    <div className="word-break-word flex items-center text-end">
                                      <Name attr={attr?.name} />
                                      {attr.isRequired && (
                                        <span className="text-destructive">
                                          *
                                        </span>
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
                                      placeholder={attr?.name}
                                      id={`credentialData.${index}.attributes.${attrIndex}.value`}
                                      name={`credentialData.${index}.attributes.${attrIndex}.value`}
                                      className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
