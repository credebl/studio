import * as yup from 'yup'

import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikProps,
} from 'formik'
import {
  IAttributes,
  IFormData,
  IFormikDataProps,
} from '../type/schemas-interface'
import React, { ChangeEvent, JSX } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import ActionButtons from './ActionButtons'
import { AddAttributeSVG } from '@/config/svgs/CreateSchema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConfirmationModal from './ConfirmationModal'
import RequiredAndDelete from './RequiredAndDelete'
import { SchemaType } from '@/common/enums'
import SchemaVersion from './SchemaVersion'
import { schemaVersionRegex } from '@/config/CommonConstant'

function FormikData({
  formData,
  type,
  setFormData,
  setShowPopup,
  validSameAttribute,
  filteredOptions,
  filledInputs,
  createLoader,
  inValidAttributes,
  success,
  failure,
  showPopup,
  confirmCreateSchema,
  initFormData,
  setFailure,
  setSuccess,
  loading,
}: Readonly<IFormikDataProps>): JSX.Element {
  const handleAttributeChange =
    (index: number, formikHandlers: FormikProps<IFormData>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      formikHandlers.handleChange(e)
      formikHandlers.setFieldValue(
        `attribute[${index}].displayName`,
        e.target.value,
        true,
      )
    }

  const handleSchemaDataTypeChange =
    (index: number, formikHandlers: FormikProps<IFormData>) =>
    (val: string) => {
      formikHandlers.setFieldValue(`attribute.${index}.schemaDataType`, val)
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddAttribute = (push: (item: any) => void) => () => {
    push({
      attributeName: '',
      schemaDataType: 'string',
      displayName: '',
      isRequired: false,
    })
  }
  const SelectItems = ({
    options,
  }: {
    options: typeof filteredOptions
  }): JSX.Element => (
    <>
      {options.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </>
  )

  function hasNoRequiredAttributes(
    attribute: { isRequired: boolean }[],
  ): boolean {
    return !attribute.some((item) => item.isRequired === true)
  }
  return (
    <Formik
      initialValues={formData}
      validationSchema={yup.object().shape({
        schemaName: yup.string().trim().required('Schema is required'),
        ...(type === SchemaType.INDY && {
          schemaVersion: yup
            .string()
            .matches(
              schemaVersionRegex,
              'Enter valid schema version (eg. 0.1 or 0.0.1)',
            )
            .required('Schema version is required.'),
        }),
        attribute: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                attributeName: yup
                  .string()
                  .trim()
                  .required('Attribute name is required.')
                  .min(2, 'Please enter at least two characters'),
                displayName: yup
                  .string()
                  .trim()
                  .min(2, 'Please enter at least two characters')
                  .required('Display name is required.'),
                isRequired: yup.boolean(),
              })
              .default(() => ({ isRequired: false })),
          )
          .required('At least one attribute is required.')
          .test({
            name: 'at-least-one-is-required.',
            message: 'At least one attribute must be required.',
            test: (value) => value.some((attr) => attr.isRequired === true),
          }),
      })}
      validateOnBlur
      validateOnChange
      enableReinitialize
      onSubmit={async (values): Promise<void> => {
        setFormData(values)
        setShowPopup({
          type: 'create',
          show: true,
        })
      }}
    >
      {(formikHandlers): React.JSX.Element => (
        <Form onSubmit={formikHandlers.handleSubmit} className="mx-4">
          <input type="hidden" name="_csrf" value={new Date().getTime()} />
          <div className="items-center space-x-4 md:flex">
            <div className="flex-col pr-0 sm:w-full md:flex md:w-96 md:pr-4">
              <div>
                <label
                  htmlFor="schema"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Schema<span className="text-destructive">*</span>
                </label>
              </div>
              <div className="flex-col sm:mr-0 md:flex lg:mr-4">
                {' '}
                <Field
                  id="schemaName"
                  name="schemaName"
                  placeholder="Schema Name eg. PAN CARD"
                  className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                {formikHandlers.errors &&
                formikHandlers.touched.schemaName &&
                formikHandlers.errors.schemaName ? (
                  <label className="text-destructive h-5 text-xs">
                    {typeof formikHandlers.errors.schemaName === 'string'
                      ? formikHandlers.errors.schemaName
                      : null}
                  </label>
                ) : (
                  <span className="text-destructive h-5 text-xs"></span>
                )}
              </div>
            </div>
            {type === SchemaType.INDY && (
              <SchemaVersion formikHandlers={formikHandlers} />
            )}
          </div>
          <p className="text-md mt-2 font-normal">
            You must select at least one attribute to create schema
          </p>
          <Card className="bg-card text-card-foreground mt-2 rounded-xl pt-4 pb-10 shadow">
            <FieldArray name="attribute">
              {(fieldArrayProps: FieldArrayRenderProps): React.JSX.Element => {
                const { form, remove, push } = fieldArrayProps
                const { values } = form
                const { attribute } = values

                const areFirstInputsSelected =
                  type === SchemaType.INDY
                    ? values.schemaName && values.schemaVersion
                    : values.schemaName
                return (
                  <div className="relative flex flex-col">
                    {attribute?.map((element: IAttributes, index: number) => (
                      <div
                        key={`attribute-${element.id}`}
                        className="relative mt-5"
                      >
                        <div
                          key={`attribute-inner-${attribute.id}`}
                          className="relative flex cursor-pointer flex-col justify-between px-4 sm:flex-row md:flex-row"
                        >
                          <div
                            key={`attribute-grid-${attribute.id}`}
                            style={{
                              overflow: 'auto',
                              width: '95%',
                            }}
                            className="grid min-[320]:grid-cols-1 sm:grid-cols-3 md:grid-cols-3"
                          >
                            <div className="relative flex max-w-[411px] flex-col items-start gap-x-4 p-2">
                              <Field
                                id={`attribute[${index}]`}
                                name={`attribute.${index}.attributeName`}
                                placeholder="Attribute eg. NAME, ID"
                                disabled={!areFirstInputsSelected}
                                onChange={handleAttributeChange(
                                  index,
                                  formikHandlers,
                                )}
                                className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              />
                              {validSameAttribute(
                                formikHandlers,
                                index,
                                'attributeName',
                              ) && (
                                <span className="text-destructive h-5 text-xs">
                                  Attribute name already exists
                                </span>
                              )}
                              {formikHandlers.touched.attribute &&
                              attribute[index] &&
                              formikHandlers?.errors?.attribute &&
                              formikHandlers?.errors?.attribute[index] &&
                              formikHandlers?.touched?.attribute[index]
                                ?.attributeName &&
                              formikHandlers?.errors?.attribute[index] &&
                              typeof formikHandlers.errors.attribute[index] ===
                                'object' &&
                              formikHandlers.errors.attribute[index]
                                ?.attributeName ? (
                                <label className="text-destructive h-5 text-xs">
                                  {
                                    formikHandlers?.errors?.attribute[index]
                                      ?.attributeName
                                  }
                                </label>
                              ) : (
                                <span className="text-destructive h-5 text-xs"></span>
                              )}
                            </div>

                            <div className="relative flex max-w-[411px] flex-col items-start gap-x-4 p-2">
                              <Select
                                name={`attribute.${index}.schemaDataType`}
                                disabled={!areFirstInputsSelected}
                                value={
                                  formikHandlers.values.attribute[index]
                                    .schemaDataType
                                }
                                onValueChange={handleSchemaDataTypeChange(
                                  index,
                                  formikHandlers,
                                )}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItems options={filteredOptions} />
                                </SelectContent>
                              </Select>
                              {formikHandlers?.touched?.attribute &&
                              attribute[index] &&
                              formikHandlers?.errors?.attribute &&
                              formikHandlers?.errors?.attribute[index] &&
                              formikHandlers?.touched?.attribute[index]
                                ?.schemaDataType &&
                              formikHandlers?.errors?.attribute[index] &&
                              typeof formikHandlers.errors.attribute[index] ===
                                'object' &&
                              formikHandlers.errors.attribute[index]
                                ?.schemaDataType ? (
                                <label className="text-destructive h-5 text-xs">
                                  {
                                    formikHandlers?.errors?.attribute[index]
                                      ?.schemaDataType
                                  }
                                </label>
                              ) : (
                                <span className="text-destructive h-5 text-xs"></span>
                              )}
                            </div>
                            <div className="relative flex max-w-[411px] flex-col items-start gap-x-4 p-2">
                              <Field
                                id={`attribute[${index}]`}
                                name={`attribute.${index}.displayName`}
                                placeholder="Display Name"
                                disabled={!areFirstInputsSelected}
                                className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              />
                              {validSameAttribute(
                                formikHandlers,
                                index,
                                'displayName',
                              ) && (
                                <span className="text-destructive h-5 text-xs">
                                  Display name of attribute already exists
                                </span>
                              )}
                              {formikHandlers?.touched?.attribute &&
                              attribute[index] &&
                              formikHandlers?.errors?.attribute &&
                              formikHandlers?.errors?.attribute[index] &&
                              formikHandlers?.touched?.attribute[index]
                                ?.displayName &&
                              formikHandlers?.errors?.attribute[index] &&
                              typeof formikHandlers.errors.attribute[index] ===
                                'object' &&
                              formikHandlers.errors.attribute[index]
                                ?.displayName ? (
                                <label className="text-destructive h-5 text-xs">
                                  {
                                    formikHandlers?.errors?.attribute[index]
                                      ?.displayName
                                  }
                                </label>
                              ) : (
                                <span className="text-destructive h-5 text-xs"></span>
                              )}
                            </div>
                          </div>
                          <RequiredAndDelete
                            index={index}
                            formikHandlers={formikHandlers}
                            values={values}
                            element={element}
                            remove={remove}
                            areFirstInputsSelected={areFirstInputsSelected}
                          />
                          <div className="absolute bottom-[-36px] left-6">
                            <span>
                              {formikHandlers?.touched?.attribute &&
                              attribute[index] &&
                              formikHandlers?.errors?.attribute &&
                              formikHandlers?.errors?.attribute[index] &&
                              formikHandlers?.touched?.attribute[index] &&
                              typeof formikHandlers.errors.attribute[index] ===
                                'object' &&
                              formikHandlers.errors.attribute[index]
                                ?.isRequired &&
                              formikHandlers?.errors?.attribute[index]
                                ?.isRequired &&
                              hasNoRequiredAttributes(attribute) ? (
                                <label className="text-destructive h-5 text-xs">
                                  {
                                    formikHandlers?.errors?.attribute[index]
                                      ?.isRequired
                                  }
                                </label>
                              ) : null}
                            </span>
                          </div>
                        </div>
                        <div>
                          {index === values.attribute.length - 1 && (
                            <Button
                              key={element.id}
                              className={
                                'absolute bottom-[-62px] left-[50%] m-auto flex w-max translate-x-[-50%] flex-row items-center gap-2 rounded-full py-0 disabled:opacity-100'
                              }
                              type="button"
                              onClick={handleAddAttribute(push)}
                              disabled={!filledInputs(formikHandlers.values)}
                            >
                              <AddAttributeSVG />
                              <span className="my-0.5 ml-1">Add attribute</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }}
            </FieldArray>
          </Card>
          <ActionButtons
            createLoader={createLoader}
            formikHandlers={formikHandlers}
            setShowPopup={setShowPopup}
            disabled={
              !filledInputs(formikHandlers.values) ||
              inValidAttributes(formikHandlers, 'attributeName') ||
              inValidAttributes(formikHandlers, 'displayName')
            }
          />
          <ConfirmationModal
            success={success}
            failure={failure}
            openModal={showPopup.show}
            closeModal={() =>
              setShowPopup({
                ...showPopup,
                show: false,
              })
            }
            onSuccess={() => {
              if (showPopup.type === 'create') {
                confirmCreateSchema()
              } else {
                formikHandlers.resetForm()
                setFormData(initFormData)
                setShowPopup({ show: false, type: 'reset' })
              }
            }}
            message={
              showPopup.type === 'create' ? (
                'Would you like to proceed? Keep in mind that this action cannot be undone.'
              ) : (
                <div>
                  This will reset all the entries you entered. <br />
                  Do you want to proceed?
                </div>
              )
            }
            buttonTitles={['No, cancel', 'Yes, I am sure']}
            isProcessing={createLoader}
            setFailure={setFailure}
            setSuccess={setSuccess}
            loading={loading}
          />
        </Form>
      )}
    </Formik>
  )
}

export default FormikData
