import {
  AttributeValueType,
  CredentialFormat,
  ICreateTemplatePayload,
  IIssuerDisplay,
  IIssuerListItem,
  ILocaleEntry,
  ITemplate,
  ITemplateAttribute,
  ITemplateNamespace,
  IUpdateIssuerPayload,
  SignerOption,
} from '@/app/oid4vc/interface/interface'

import { isValidHttpUrl } from './createIssuer'

export interface IssuerFormFields {
  name: string
  description: string
  logoLink: string
  authorizationServerUrl: string
  locales: ILocaleEntry[]
  isPrimary: boolean
  batchCredentialIssuanceSize: string
}

export interface TemplateAttributeForm {
  key: string
  valueType: AttributeValueType
  mandatory: boolean
  disclose: boolean
  displayName: string
}

export interface TemplateNamespaceForm {
  namespace: string
  attributes: TemplateAttributeForm[]
}

export interface TemplateFormState {
  name: string
  description: string
  format: CredentialFormat
  signerOption: SignerOption
  vct: string
  doctype: string
  schemaUrl: string
  noticeUrl: string
  canBeRevoked: boolean
  appearanceName: string
  appearanceDescription: string
  appearanceLogo: string
  attributes: TemplateAttributeForm[]
  namespaces: TemplateNamespaceForm[]
}

export const emptyAttribute = (): TemplateAttributeForm => ({
  key: '',
  valueType: 'string',
  mandatory: true,
  disclose: true,
  displayName: '',
})

export const emptyTemplateFormState = (): TemplateFormState => ({
  name: '',
  description: '',
  format: 'dc+sd-jwt',
  signerOption: 'DID',
  vct: '',
  doctype: '',
  schemaUrl: '',
  noticeUrl: '',
  canBeRevoked: false,
  appearanceName: '',
  appearanceDescription: '',
  appearanceLogo: '',
  attributes: [emptyAttribute()],
  namespaces: [],
})

export const getIssuerDisplay = (
  issuer?: IIssuerListItem,
): IIssuerDisplay | undefined =>
  issuer?.metadata?.find((item) => item.locale === 'en') ??
  issuer?.metadata?.[0]

export const getIssuerName = (issuer?: IIssuerListItem): string =>
  getIssuerDisplay(issuer)?.name || issuer?.publicIssuerId || 'Unknown issuer'

export const getIssuerDescription = (issuer?: IIssuerListItem): string =>
  getIssuerDisplay(issuer)?.description ?? ''

export const getIssuerLogo = (issuer?: IIssuerListItem): string =>
  getIssuerDisplay(issuer)?.logo?.uri ?? ''

export const getIssuerLocales = (issuer?: IIssuerListItem): ILocaleEntry[] =>
  (issuer?.metadata ?? [])
    .filter((item) => item.locale !== 'en')
    .map((item) => ({
      locale: item.locale,
      name: item.name,
      description: item.description ?? '',
    }))

export const buildIssuerDisplay = (
  fields: Omit<IssuerFormFields, 'isPrimary' | 'batchCredentialIssuanceSize'>,
): IIssuerDisplay[] => {
  const logoUri = fields.logoLink.trim()
  const logo = logoUri
    ? {
        uri: logoUri,
        // eslint-disable-next-line camelcase
        alt_text: `${fields.name.trim()} logo`,
      }
    : undefined

  return [
    {
      locale: 'en',
      name: fields.name.trim(),
      description: fields.description.trim(),
      logo,
    },
    ...fields.locales.map((locale) => ({
      locale: locale.locale.trim(),
      name: locale.name.trim(),
      description: locale.description.trim(),
      logo,
    })),
  ]
}

export const buildUpdateIssuerPayload = (
  fields: IssuerFormFields,
): IUpdateIssuerPayload => ({
  display: buildIssuerDisplay(fields),
  batchCredentialIssuanceSize: Number(fields.batchCredentialIssuanceSize) || 1,
  cryptographicBindingMethods: [],
  isPrimary: fields.isPrimary,
})

export const buildIssuerFormState = (
  issuer?: IIssuerListItem,
): IssuerFormFields => {
  const display = getIssuerDisplay(issuer)

  return {
    name: display?.name ?? '',
    description: display?.description ?? '',
    logoLink: display?.logo?.uri ?? '',
    authorizationServerUrl: issuer?.authorizationServerUrl ?? '',
    locales: getIssuerLocales(issuer),
    isPrimary: issuer?.isPrimary ?? false,
    batchCredentialIssuanceSize: String(
      issuer?.batchCredentialIssuanceSize || 1,
    ),
  }
}

export const parseJsonObject = (
  value: string,
  label: string,
): { data?: Record<string, unknown>; error?: string } => {
  if (!value.trim()) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: `${label} must be a JSON object` }
    }
    return { data: parsed as Record<string, unknown> }
  } catch {
    return { error: `${label} is not valid JSON` }
  }
}

const toTemplateAttributes = (
  attributes: TemplateAttributeForm[],
): ITemplateAttribute[] =>
  attributes
    .filter((attribute) => attribute.key.trim())
    .map((attribute) => ({
      key: attribute.key.trim(),
      // eslint-disable-next-line camelcase
      value_type: attribute.valueType,
      disclose: attribute.disclose,
      mandatory: attribute.mandatory,
      display: attribute.displayName.trim()
        ? [{ name: attribute.displayName.trim(), locale: 'en' }]
        : undefined,
    }))

const toTemplateNamespaces = (
  namespaces: TemplateNamespaceForm[],
): ITemplateNamespace[] =>
  namespaces
    .filter((namespace) => namespace.namespace.trim())
    .map((namespace) => ({
      namespace: namespace.namespace.trim(),
      attributes: toTemplateAttributes(namespace.attributes),
    }))

export const buildTemplatePayload = (
  state: TemplateFormState,
): ICreateTemplatePayload => {
  const isMdoc = state.format === 'mso_mdoc'
  const template = isMdoc
    ? {
        doctype: state.doctype.trim(),
        namespaces: toTemplateNamespaces(state.namespaces),
      }
    : {
        vct: state.vct.trim(),
        ...(state.schemaUrl.trim()
          ? { schemaUrl: state.schemaUrl.trim() }
          : {}),
        attributes: toTemplateAttributes(state.attributes),
      }

  const appearanceName = state.appearanceName.trim() || state.name.trim()
  const logoUri = state.appearanceLogo.trim()
  const appearance =
    appearanceName || state.appearanceDescription.trim() || logoUri
      ? {
          display: [
            {
              locale: 'en',
              name: appearanceName,
              description: state.appearanceDescription.trim(),
              logo: logoUri
                ? {
                    uri: logoUri,
                    // eslint-disable-next-line camelcase
                    alt_text: `${appearanceName} logo`,
                  }
                : undefined,
            },
          ],
        }
      : undefined

  const payload: ICreateTemplatePayload = {
    name: state.name.trim(),
    description: state.description.trim(),
    signerOption: state.signerOption,
    format: state.format,
    template,
    canBeRevoked: state.canBeRevoked,
    noticeUrl: state.noticeUrl.trim() || undefined,
    appearance,
  }

  return payload
}

const fromTemplateAttributes = (
  attributes?: ITemplateAttribute[],
): TemplateAttributeForm[] =>
  (attributes ?? []).map((attribute) => ({
    key: attribute.key ?? '',
    valueType: attribute.value_type ?? 'string',
    mandatory: Boolean(attribute.mandatory),
    disclose: Boolean(attribute.disclose),
    displayName: attribute.display?.[0]?.name ?? '',
  }))

export const templateToFormState = (
  template?: ITemplate,
): TemplateFormState => {
  if (!template) {
    return emptyTemplateFormState()
  }

  const definition = template.attributes ?? {}
  const appearance = template.appearance?.display?.[0]

  return {
    name: template.name ?? '',
    description: template.description ?? '',
    format: template.format ?? 'dc+sd-jwt',
    signerOption: template.signerOption ?? 'DID',
    vct: definition.vct ?? '',
    doctype: definition.doctype ?? '',
    schemaUrl: definition.schemaUrl ?? '',
    noticeUrl: template.noticeUrl ?? '',
    canBeRevoked: Boolean(template.canBeRevoked),
    appearanceName: appearance?.name ?? '',
    appearanceDescription: appearance?.description ?? '',
    appearanceLogo: appearance?.logo?.uri ?? '',
    attributes: fromTemplateAttributes(definition.attributes),
    namespaces: (definition.namespaces ?? []).map((namespace) => ({
      namespace: namespace.namespace ?? '',
      attributes: fromTemplateAttributes(namespace.attributes),
    })),
  }
}

export const getTemplateErrors = (
  state: TemplateFormState,
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!state.name.trim()) {
    errors.name = 'Template name is required'
  }

  if (state.format === 'mso_mdoc') {
    if (!state.doctype.trim()) {
      errors.doctype = 'Document type is required'
    }
    if (state.namespaces.length === 0) {
      errors.namespaces = 'At least one namespace is required'
    }
    state.namespaces.forEach((namespace, index) => {
      if (!namespace.namespace.trim()) {
        errors[`namespace-${index}`] = 'Namespace is required'
      }
      if (namespace.attributes.filter((item) => item.key.trim()).length === 0) {
        errors[`namespace-${index}-attributes`] =
          'At least one attribute is required'
      }
    })
  } else {
    if (!state.vct.trim()) {
      errors.vct = 'Credential type (vct) is required'
    }
    if (state.attributes.filter((item) => item.key.trim()).length === 0) {
      errors.attributes = 'At least one attribute is required'
    }
  }

  if (state.schemaUrl.trim() && !isValidHttpUrl(state.schemaUrl)) {
    errors.schemaUrl = 'Please enter a valid URL'
  }
  if (state.noticeUrl.trim() && !isValidHttpUrl(state.noticeUrl)) {
    errors.noticeUrl = 'Please enter a valid URL'
  }
  if (state.appearanceLogo.trim() && !isValidHttpUrl(state.appearanceLogo)) {
    errors.appearanceLogo = 'Please enter a valid URL'
  }

  return errors
}

export const formatDate = (value?: string): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export const getErrorMessage = (caught: unknown, fallback: string): string => {
  const response = (
    caught as { response?: { data?: { message?: unknown } } } | null
  )?.response
  const message = response?.data?.message

  if (typeof message === 'string' && message) {
    return message
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.map((item) => String(item)).join(', ')
  }
  if (caught instanceof Error && caught.message) {
    return caught.message
  }
  return fallback
}

export const asArray = <T>(data: unknown): T[] => {
  if (!Array.isArray(data)) {
    return []
  }
  return data as T[]
}

export const isSuccessStatus = (
  status: number | undefined,
  allowed: number[],
): boolean => Boolean(status && allowed.includes(status))
