import React, { JSX } from 'react'
import { SchemaType, SchemaTypeValue } from '@/common/enums'

import { FormikProps } from 'formik'
import { IPopup } from '../components/Create'

export interface ISchemaData {
  schemaId: string
  schemaName: string
  attributes: IAttributes[]
}
export interface ISchemaDataSchemaList {
  createDateTime: string
  name: string
  version: string
  attributes: IAttributesDetails[]
  schemaLedgerId: string
  createdBy: string
  publisherDid: string
  orgId: string
  issuerId: string
  organizationName: string
  userName: string
}

export interface IAttributesDetails {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}

export interface ISchema {
  schemaLedgerId?: string
  schemaId: string
  attributes: IAttributesDetails[]
  issuerId: string
  createdDate: string
}

export interface IAttributesDetails {
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired: boolean
}

export interface ISchemaCardProps {
  className?: string
  schemaName: string
  selectedSchemas?: ISchema[]
  version: string
  schemaId: string
  issuerDid: string
  issuerName?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any
  created: string
  isClickable?: boolean
  showCheckbox?: boolean
  onClickCallback?: (SchemaData: {
    schemaId: string
    attributes: string[]
    issuerDid: string
    created: string
  }) => void

  onClickW3CCallback?: (W3CSchemaData: {
    schemaId: string
    schemaName: string
    version: string
    issuerDid: string
    attributes: []
    created: string
  }) => void

  onClickW3cIssue?: (
    schemaId: string,
    schemaName: string,
    version: string,
    issuerDid: string,
    attributes: [],
    created: string,
  ) => void
  onChange?: (checked: boolean, schemaData: ISchemaData[]) => void
  limitedAttributes?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectionChange?: (selectedSchemas: any[]) => void
  w3cSchema?: boolean
  noLedger?: boolean
  isVerification?: boolean
  isVerificationUsingEmail?: boolean
  onTitleClick?: (e: React.MouseEvent) => void
}

export interface IW3cSchemaDetails {
  schemaName: string
  version: string
  schemaId: string
  w3cAttributes?: IAttributesData[]
  issuerDid?: string
  created?: string
}

export interface IAttributesData {
  isRequired: boolean
  name: string
  value: string
  dataType: string
}

export interface SchemaListItem {
  attribute: string[]
  issuerDid: string
  createdDate: string
  schemaName?: string
  version?: string
  schemaId?: string
}

export interface SchemaDetail {
  schemaName: string
  schemaVersion?: string
  schemaType?: SchemaTypeValue
  attributes: IAttributes[]
  description?: string
  orgId: string
}
export interface FieldName {
  type: string
  schemaPayload: SchemaDetail
}

export interface IAttributes {
  id?: string
  attributeName: string
  schemaDataType: string
  displayName: string
  isRequired?: boolean
}
export interface IFormData {
  schemaName: string
  schemaVersion?: string
  schemaType?: SchemaTypeValue
  description?: string
  attribute: IAttributes[]
}

export interface CredDeffFieldNameType {
  tag: string
  revocable: boolean
  orgId: string
  schemaLedgerId: string
}

export interface Values {
  tagName: string
  revocable: boolean
}

export interface ICredDefCard {
  tag: string
  credentialDefinitionId: string
  schemaLedgerId: string
  revocable: boolean
}

export interface ActionButtonsProps {
  createLoader: boolean
  formikHandlers: FormikProps<IFormData>
  setShowPopup: (
    value: React.SetStateAction<{
      show: boolean
      type: 'reset' | 'create'
    }>,
  ) => void
  disabled: boolean
}

export interface IFormikDataProps {
  formData: IFormData
  type: SchemaType | undefined
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>
  setShowPopup: React.Dispatch<React.SetStateAction<IPopup>>
  validSameAttribute: (
    formikHandlers: FormikProps<IFormData>,
    index: number,
    field: 'attributeName' | 'displayName',
  ) => boolean
  filteredOptions: {
    value: string
    label: string
  }[]
  filledInputs: (formData: IFormData) => boolean
  createLoader: boolean
  inValidAttributes: (
    formikHandlers: FormikProps<IFormData>,
    propertyName: 'attributeName' | 'displayName',
  ) => boolean
  success: string | null
  failure: string | null
  showPopup: IPopup
  confirmCreateSchema: () => void
  initFormData: IFormData
  setFailure: React.Dispatch<React.SetStateAction<string | null>>
  setSuccess: React.Dispatch<React.SetStateAction<string | null>>
  loading: boolean
}

export interface IRequiredAndDeleteProps {
  index: number
  formikHandlers: FormikProps<IFormData>
  values: IFormData
  element: IAttributes
  remove: (index: number) => void
  areFirstInputsSelected: boolean
}

export interface ISidebarSliderData {
  label: string
  value: string | JSX.Element
  copyable?: boolean
}
export interface UserOrgRole {
  orgId: string
  orgRole: {
    name: string
  }
}

export interface GetUserProfileResponse {
  data: {
    userOrgRoles: UserOrgRole[]
  }
}
