'use client'

import * as Yup from 'yup'

import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  FormikErrors,
  FormikTouched,
} from 'formik'
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

/* ---------- Helper functions ---------- */
function formatName(attr: string): string {
  return attr
    ?.split('_')
    .map((item) => item[0].toUpperCase() + item.slice(1))
    .join(' ')
}

function renderError(
  errors: FormikErrors<{ credentialData: ICredentialdata[] }>,
  touched: FormikTouched<{ credentialData: ICredentialdata[] }>,
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

  return error && touchedField ? (
    <div className="text-destructive text-xs break-words">{error}</div>
  ) : null
}

function validateField(
  validationSchema: Yup.AnySchema,
  path: string,
  value: string,
): string | undefined {
  try {
    const schema = Yup.reach(validationSchema, path)

    if ('validateSync' in schema && typeof schema.validateSync === 'function') {
      schema.validateSync(value, { abortEarly: false })
    }
    return undefined
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message
    }
    return 'Validation failed'
  }
}

/* ---------- Attribute Input ---------- */
function AttributeInput({
  attr,
  index,
  attrIndex,
  validationSchema,
  errors,
  touched,
}: Readonly<{
  attr: IAttributesData
  index: number
  attrIndex: number
  validationSchema: Yup.AnySchema
  errors: FormikErrors<{ credentialData: ICredentialdata[] }>
  touched: FormikTouched<{ credentialData: ICredentialdata[] }>
}>): JSX.Element {
  const path = `credentialData.${index}.attributes.${attrIndex}.value`
  return (
    <div
      key={`${attr.name}-${attrIndex}`}
      className="relative grid w-full grid-cols-[1fr_3fr] items-center gap-2"
    >
      <label htmlFor={path} className="text-base break-words">
        <div className="word-break-word flex items-center text-end">
          {formatName(attr.name)}
          {attr.isRequired && <span className="text-destructive">*</span>} :
        </div>
      </label>
      <div className="w-3/5">
        <Field
          type={attr?.dataType === 'date' ? 'date' : attr?.dataType}
          placeholder={attr?.name}
          id={path}
          name={path}
          className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          validate={(value: string) =>
            validateField(validationSchema, path, value)
          }
        />
        {renderError(errors, touched, index, attrIndex)}
      </div>
    </div>
  )
}

/* ---------- User Card ---------- */
function UserCard({
  user,
  index,
  attributes,
  arrayHelpers,
  validationSchema,
  errors,
  touched,
  showDelete,
}: Readonly<{
  user: ICredentialdata
  index: number
  attributes: IAttributesData[]
  arrayHelpers: FieldArrayRenderProps
  validationSchema: Yup.AnySchema
  errors: FormikErrors<{ credentialData: ICredentialdata[] }>
  touched: FormikTouched<{ credentialData: ICredentialdata[] }>
  showDelete: boolean
}>): JSX.Element {
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
            <p className="pl-1 dark:text-white">{user?.connectionId}</p>
          </div>
          {showDelete && (
            <div className="text-destructive flex justify-end sm:w-2/12">
              <Button
                data-testid="deleteBtn"
                type="button"
                className="flex justify-center border-none bg-transparent shadow-none hover:bg-transparent focus:ring-0 dark:bg-gray-700"
                onClick={() => arrayHelpers.remove(index)}
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
            {attributes.map((attr, attrIndex) => (
              <AttributeInput
                key={`${user.connectionId}-${attr.name}-${attrIndex}`}
                attr={attr}
                index={index}
                attrIndex={attrIndex}
                validationSchema={validationSchema}
                errors={errors}
                touched={touched}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ---------- Main Component ---------- */
const FieldArrayData = ({
  values,
  w3cSchema,
  issuanceFormPayload,
  errors,
  touched,
  validationSchema,
}: IFieldArrayProps): JSX.Element => (
  <FieldArray name="credentialData">
    {(arrayHelpers) => (
      <>
        {values?.credentialData?.map((user, index) => {
          const attributes = w3cSchema
            ? (issuanceFormPayload?.credentialData?.[0].attributes ?? [])
            : (user?.attributes ?? [])

          return (
            <UserCard
              key={user.connectionId}
              user={user}
              index={index}
              attributes={attributes}
              arrayHelpers={arrayHelpers}
              validationSchema={validationSchema}
              errors={errors}
              touched={touched}
              showDelete={values.credentialData.length > 1}
            />
          )
        })}
      </>
    )}
  </FieldArray>
)

export default FieldArrayData
