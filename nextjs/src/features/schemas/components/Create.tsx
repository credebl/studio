/* eslint-disable max-lines */
'use client'

import * as yup from 'yup'
import { DidMethod, SchemaType, SchemaTypeValue } from '@/common/enums'
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  type FormikErrors,
  type FormikProps,
} from 'formik'
import { FieldName, IAttributes, IFormData } from '../type/schemas-interface'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  apiStatusCodes,
  schemaVersionRegex,
} from '../../../config/CommonConstant'

import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import ConfirmationModal from './ConfirmationModal'
import { Plus } from 'lucide-react'
import { createSchemas } from '@/app/api/schema'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const options = [
  {
    value: 'string',
    label: 'String',
  },
  {
    value: 'number',
    label: 'Number',
  },
  {
    value: 'time',
    label: 'Time',
  },
  {
    value: 'datetime-local',
    label: 'Date & Time',
  },
]

interface IPopup {
  show: boolean
  type: 'reset' | 'create'
}

const CreateSchema = (): React.JSX.Element => {
  const [failure, setFailure] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createLoader, setCreateLoader] = useState<boolean>(false)
  const [showPopup, setShowPopup] = useState<IPopup>({
    show: false,
    type: 'reset',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [schemaTypeValues, setSchemaTypeValues] = useState<SchemaTypeValue>()
  const [type, setType] = useState<SchemaType>()
  const orgId = useAppSelector((state) => state.organization.orgId)

  const route = useRouter()

  const initFormData: IFormData = {
    schemaName: '',
    schemaVersion: '',
    attribute: [
      {
        attributeName: '',
        schemaDataType: 'string',
        displayName: '',
        isRequired: false,
      },
    ],
  }
  const fetchOrganizationDetails = async (): Promise<void> => {
    setLoading(true)
    const response = await getOrganizationById(orgId as string)
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid
      if (did) {
        if (did.includes(DidMethod.INDY)) {
          setSchemaTypeValues(SchemaTypeValue.INDY)
          setType(SchemaType.INDY)
        } else if (did.includes(DidMethod.POLYGON)) {
          setType(SchemaType.W3C)
          setSchemaTypeValues(SchemaTypeValue.POLYGON)
        } else if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
          setType(SchemaType.W3C)
          setSchemaTypeValues(SchemaTypeValue.NO_LEDGER)
        }
      }
    } else {
      setFailure(response as string)
    }

    setLoading(false)
  }

  const [formData, setFormData] = useState(initFormData)

  useEffect(() => {
    fetchOrganizationDetails()
  }, [])

  const filledInputs = (formData: IFormData): boolean => {
    const { schemaName, schemaVersion, attribute } = formData

    if (
      (type === SchemaType.INDY && (!schemaName || !schemaVersion)) ||
      (type === SchemaType.W3C && !schemaName)
    ) {
      return false
    }

    const isAtLeastOneRequired = attribute.some((attr) => attr.isRequired)
    if (!isAtLeastOneRequired) {
      return false
    }

    for (const attr of attribute) {
      if (!attr.attributeName || !attr.schemaDataType || !attr.displayName) {
        return false
      }
    }

    return true
  }

  const submit = async (values: IFormData): Promise<void> => {
    setCreateLoader(true)
    if (!type) {
      setFailure('Schema type not determined.')
      setCreateLoader(false)
      return
    }

    const schemaFieldName: FieldName = {
      type,
      schemaPayload: {
        schemaName: values.schemaName,
        ...(type === SchemaType.W3C && { schemaType: schemaTypeValues }),
        ...(type === SchemaType.INDY && {
          schemaVersion: values.schemaVersion,
        }),
        attributes: values.attribute,
        description: values.schemaName,
        orgId,
      },
    }

    const createSchema = await createSchemas(
      schemaFieldName as unknown as Record<string, unknown>,
      orgId,
    )
    const { data } = createSchema as AxiosResponse

    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setSuccess(data?.message)
      setCreateLoader(false)
      setLoading(true)
      setTimeout(() => {
        setSuccess(null)
        route.push('/organizations/schemas')
      }, 1500)
    } else {
      setFailure(createSchema as string)
      setCreateLoader(false)
      setTimeout(() => setFailure(null), 2000)
    }

    setTimeout(() => {
      setShowPopup({ type: 'create', show: false })
    }, 2000)
  }

  const confirmCreateSchema = (): void => {
    formData.attribute.forEach((element: IAttributes) => {
      if (!element.schemaDataType) {
        const updatedElement = { ...element, schemaDataType: 'string' }
        Object.assign(element, updatedElement)
      }
    })

    submit(formData)
  }

  const validSameAttribute = (
    formikHandlers: FormikProps<IFormData>,
    index: number,
    field: 'attributeName' | 'displayName',
  ): boolean => {
    const attributeError = formikHandlers?.errors?.attribute
    const attributeTouched = formikHandlers?.touched?.attribute
    const attributeValue = formikHandlers?.values?.attribute

    const isError = (
      attributeError as FormikErrors<IAttributes>[] | undefined
    )?.[index]?.[field]
    const isTouched = attributeTouched?.[index]?.[field]
    const value = attributeValue?.[index]?.[field]

    if (!(isTouched && isError) && value) {
      const matchCount = attributeValue.filter((item) => {
        const itemAttr = item[field]?.trim()?.toLowerCase()
        const enteredAttr = value?.trim()?.toLowerCase()
        return itemAttr === enteredAttr
      }).length

      return matchCount > 1
    }
    return false
  }

  const inValidAttributes = (
    formikHandlers: FormikProps<IFormData>,
    propertyName: 'attributeName' | 'displayName',
  ): boolean => {
    const attributeValue = formikHandlers?.values?.attribute
    if (!attributeValue?.length) {
      return true
    }

    const seen: { [key: string]: boolean } = {}
    for (const obj of attributeValue) {
      if (seen[obj[propertyName]]) {
        return true
      }
      seen[obj[propertyName]] = true
    }

    return false
  }

  const filteredOptions = useMemo(() => {
    if (
      schemaTypeValues === SchemaTypeValue.POLYGON ||
      schemaTypeValues === SchemaTypeValue.NO_LEDGER
    ) {
      return options.filter(
        (opt) => opt.label === 'String' || opt.label === 'Number',
      )
    }
    return options
  }, [schemaTypeValues])

  return (
    <div className="pt-2">
      <h1 className="text-foreground ml-10 text-xl font-semibold">
        Create Schema
      </h1>
      <Card className="m-0 px-4 py-8 md:m-6" id="createSchemaCard">
        <div>
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
                  .required('Schema version is required'),
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
                        .required('Attribute name is required'),
                      displayName: yup
                        .string()
                        .trim()
                        .required('Display name is required'),
                      isRequired: yup.boolean(),
                    })
                    .default(() => ({ isRequired: false })),
                )
                .required('At least one attribute is required')
                .test({
                  name: 'at-least-one-is-required',
                  message: 'At least one attribute must be required',
                  test: (value) =>
                    value.some((attr) => attr.isRequired === true),
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
                <input
                  type="hidden"
                  name="_csrf"
                  value={new Date().getTime()}
                />
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
                          {formikHandlers.errors.schemaName}
                        </label>
                      ) : (
                        <label className="text-destructive h-5 text-xs"></label>
                      )}
                    </div>
                  </div>
                  {type === SchemaType.INDY && (
                    <div
                      className="flex-col sm:w-full md:flex md:w-96"
                      style={{ marginLeft: 0 }}
                    >
                      <div>
                        <label
                          htmlFor="Version"
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Version<span className="text-destructive">*</span>
                        </label>
                      </div>

                      <div className="flex-col md:flex">
                        {' '}
                        <Field
                          id="schemaVersion"
                          name="schemaVersion"
                          placeholder="eg. 0.1 or 0.0.1"
                          className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        {formikHandlers.errors &&
                        formikHandlers.touched.schemaVersion &&
                        formikHandlers.errors.schemaVersion ? (
                          <label className="text-destructive h-5 text-xs">
                            {formikHandlers.errors.schemaVersion}
                          </label>
                        ) : (
                          <label className="text-destructive h-5 text-xs"></label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-md mt-2 font-normal">
                  You must select at least one attribute to create schema
                </p>
                <Card className="bg-card text-card-foreground mt-2 rounded-xl pt-4 pb-10 shadow">
                  <FieldArray name="attribute">
                    {(
                      fieldArrayProps: FieldArrayRenderProps,
                    ): React.JSX.Element => {
                      const { form, remove, push } = fieldArrayProps
                      const { values } = form
                      const { attribute } = values

                      const areFirstInputsSelected =
                        type === SchemaType.INDY
                          ? values.schemaName && values.schemaVersion
                          : values.schemaName
                      return (
                        <div className="relative flex flex-col">
                          {attribute?.map(
                            (element: IAttributes, index: number) => (
                              <div
                                key={`attribute-${index}`}
                                className="relative mt-5"
                              >
                                <div
                                  key={`attribute-${index}`}
                                  className="relative flex cursor-pointer flex-col justify-between px-4 sm:flex-row md:flex-row"
                                >
                                  <div
                                    key={`attribute-${index}`}
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
                                        onChange={(
                                          e: ChangeEvent<HTMLInputElement>,
                                        ) => {
                                          formikHandlers.handleChange(e)
                                          formikHandlers.setFieldValue(
                                            `attribute[${index}].displayName`,
                                            e.target.value,
                                            true,
                                          )
                                        }}
                                        className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                      />
                                      {validSameAttribute(
                                        formikHandlers,
                                        index,
                                        'attributeName',
                                      ) && (
                                        <label className="text-destructive h-5 text-xs">
                                          Attribute name already exists
                                        </label>
                                      )}
                                      {formikHandlers.touched.attribute &&
                                      attribute[index] &&
                                      formikHandlers?.errors?.attribute &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      formikHandlers?.touched?.attribute[index]
                                        ?.attributeName &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      typeof formikHandlers.errors.attribute[
                                        index
                                      ] === 'object' &&
                                      formikHandlers.errors.attribute[index]
                                        ?.attributeName ? (
                                        <label className="text-destructive h-5 text-xs">
                                          {
                                            formikHandlers?.errors?.attribute[
                                              index
                                            ]?.attributeName
                                          }
                                        </label>
                                      ) : (
                                        <label className="text-destructive h-5 text-xs"></label>
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
                                        onValueChange={(val) =>
                                          formikHandlers.setFieldValue(
                                            `attribute.${index}.schemaDataType`,
                                            val,
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {filteredOptions.map((opt) => (
                                            <SelectItem
                                              key={opt.value}
                                              value={opt.value}
                                            >
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {formikHandlers?.touched?.attribute &&
                                      attribute[index] &&
                                      formikHandlers?.errors?.attribute &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      formikHandlers?.touched?.attribute[index]
                                        ?.schemaDataType &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      typeof formikHandlers.errors.attribute[
                                        index
                                      ] === 'object' &&
                                      formikHandlers.errors.attribute[index]
                                        ?.schemaDataType ? (
                                        <label className="text-destructive h-5 text-xs">
                                          {
                                            formikHandlers?.errors?.attribute[
                                              index
                                            ]?.schemaDataType
                                          }
                                        </label>
                                      ) : (
                                        <label className="text-destructive h-5 text-xs"></label>
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
                                        <label className="text-destructive h-5 text-xs">
                                          Display name of attribute already
                                          exists
                                        </label>
                                      )}
                                      {formikHandlers?.touched?.attribute &&
                                      attribute[index] &&
                                      formikHandlers?.errors?.attribute &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      formikHandlers?.touched?.attribute[index]
                                        ?.displayName &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      typeof formikHandlers.errors.attribute[
                                        index
                                      ] === 'object' &&
                                      formikHandlers.errors.attribute[index]
                                        ?.displayName ? (
                                        <label className="text-destructive h-5 text-xs">
                                          {
                                            formikHandlers?.errors?.attribute[
                                              index
                                            ]?.displayName
                                          }
                                        </label>
                                      ) : (
                                        <label className="text-destructive h-5 text-xs"></label>
                                      )}
                                    </div>
                                  </div>

                                  <div className="absolute bottom-[-8px] left-6">
                                    <label
                                      className="flex items-center space-x-2"
                                      title="This will make the field required when issuing a credential"
                                    >
                                      <Checkbox
                                        name={`attribute[${index}].isRequired`}
                                        checked={
                                          formikHandlers.values.attribute[index]
                                            ?.isRequired || false
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

                                  <div
                                    className="max-w-[50px]"
                                    style={{ width: '5%' }}
                                  >
                                    {index === 0 &&
                                    values.attribute.length === 1 ? (
                                      <div
                                        key={element.id}
                                        className="sm:w-0.5/3 text-destructive"
                                      ></div>
                                    ) : (
                                      <div
                                        key={element.id}
                                        className="sm:w-0.5/3 text-destructive"
                                      >
                                        <Button
                                          data-testid="deleteBtn"
                                          type="button"
                                          color="danger"
                                          onClick={() => remove(index)}
                                          className={`${
                                            index === 0 &&
                                            values.attribute.length === 1
                                              ? 'hidden'
                                              : 'block'
                                          } mt-2 flex justify-end bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0`}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="red"
                                            className="!h-6 !w-6"
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
                                  <div className="absolute bottom-[-36px] left-6">
                                    <span>
                                      {formikHandlers?.touched?.attribute &&
                                      attribute[index] &&
                                      formikHandlers?.errors?.attribute &&
                                      formikHandlers?.errors?.attribute[
                                        index
                                      ] &&
                                      formikHandlers?.touched?.attribute[
                                        index
                                      ] &&
                                      typeof formikHandlers.errors.attribute[
                                        index
                                      ] === 'object' &&
                                      formikHandlers.errors.attribute[index]
                                        ?.isRequired &&
                                      formikHandlers?.errors?.attribute[index]
                                        ?.isRequired &&
                                      !attribute.some(
                                        (item: { isRequired: boolean }) =>
                                          item.isRequired === true,
                                      ) ? (
                                        <label className="text-destructive h-5 text-xs">
                                          {
                                            formikHandlers?.errors?.attribute[
                                              index
                                            ]?.isRequired
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
                                      onClick={() =>
                                        push({
                                          attributeName: '',
                                          schemaDataType: 'string',
                                          displayName: '',
                                          isRequired: false,
                                        })
                                      }
                                      disabled={
                                        !filledInputs(formikHandlers.values)
                                      }
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

                                      <span className="my-0.5 ml-1">
                                        Add attribute
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )
                    }}
                  </FieldArray>
                </Card>
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
                    style={{
                      height: '2.6rem',
                      width: '6rem',
                      minWidth: '2rem',
                    }}
                    onClick={() => setShowPopup({ show: true, type: 'reset' })}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="dark:group-hover:text-primary-700 mr-2"
                      width="10"
                      height="18"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="currentColor"
                        d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z"
                      />
                    </svg>
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    color="bg-primary-700"
                    disabled={
                      !filledInputs(formikHandlers.values) ||
                      inValidAttributes(formikHandlers, 'attributeName') ||
                      inValidAttributes(formikHandlers, 'displayName')
                    }
                    className="ml-auto rounded-lg text-center text-base font-medium sm:w-auto"
                    style={{
                      height: '2.6rem',
                      width: 'auto',
                      minWidth: '2rem',
                    }}
                  >
                    <Plus />
                    Create
                  </Button>
                </div>
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
        </div>
      </Card>
    </div>
  )
}

export default CreateSchema
