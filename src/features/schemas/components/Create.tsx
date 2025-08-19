'use client'

import { DidMethod, SchemaType, SchemaTypeValue } from '@/common/enums'
import { FieldName, IAttributes, IFormData } from '../type/schemas-interface'
import { type FormikErrors, type FormikProps } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'

import {
  apiStatusCodes,
  optionsSchemaCreation as options,
} from '../../../config/CommonConstant'

import type { AxiosResponse } from 'axios'
import { Card } from '@/components/ui/card'
import FormikData from './FormikData'
import { createSchemas } from '@/app/api/schema'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export interface IPopup {
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
        route.push('/schemas')
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
          <FormikData
            formData={formData}
            type={type}
            setFormData={setFormData}
            setShowPopup={setShowPopup}
            validSameAttribute={validSameAttribute}
            filteredOptions={filteredOptions}
            filledInputs={filledInputs}
            createLoader={createLoader}
            inValidAttributes={inValidAttributes}
            success={success}
            failure={failure}
            showPopup={showPopup}
            confirmCreateSchema={confirmCreateSchema}
            initFormData={initFormData}
            setFailure={setFailure}
            setSuccess={setSuccess}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  )
}

export default CreateSchema
