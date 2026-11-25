export interface ILogo {
  uri: string
  // eslint-disable-next-line camelcase
  alt_text: string
}

export interface IDisplayItem {
  locale: string
  name: string
  description: string
  logo: ILogo
}

export interface ILocaleEntry {
  name: string
  description: string
  locale: string
}

export interface ICreateIssuerPayload {
  issuerId: string
  display: IDisplayItem[]
  authorizationServerUrl: string
  batchCredentialIssuanceSize?: number
  cryptographicBindingMethods?: string[]
}

export interface ICreateIssuerResponse {
  statusCode: number
  message?: string
  data?: {
    id?: string
    issuerId?: string
    publicIssuerId?: string
  }
}

export interface IApiResponse<T> {
  statusCode: number
  message?: string
  data?: T
}

export interface IIssuerDisplay {
  locale: string
  name: string
  description?: string
  logo?: Partial<ILogo>
}

export interface IIssuerListItem {
  id: string
  publicIssuerId: string
  metadata?: IIssuerDisplay[]
  authorizationServerUrl?: string
  orgAgentId?: string
  batchCredentialIssuanceSize?: number
  cryptographicBindingMethods?: string[]
  orgId?: string
  isPrimary?: boolean
  createDateTime?: string
}

export interface IIssuerDetails {
  id?: string
  issuerId?: string
  display?: IIssuerDisplay[]
  metadata?: IIssuerDisplay[]
  credentialConfigurationsSupported?: Record<string, unknown>
  dpopSigningAlgValuesSupported?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface IUpdateIssuerPayload {
  display: IIssuerDisplay[]
  batchCredentialIssuanceSize?: number
  cryptographicBindingMethods?: string[]
  isPrimary?: boolean
}

export type CredentialFormat =
  'dc+sd-jwt' | 'mso_mdoc' | 'jwt_vc_json-ld' | 'ldp_vc'

export type SignerOption = 'DID' | 'X509_P256' | 'X509_ED25519'

export type AttributeValueType =
  'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'image'

export interface ITemplateAttributeDisplay {
  name: string
  locale?: string
}

export interface ITemplateAttribute {
  key: string
  // eslint-disable-next-line camelcase
  value_type: AttributeValueType
  disclose?: boolean
  mandatory?: boolean
  display?: ITemplateAttributeDisplay[]
  children?: ITemplateAttribute[]
}

export interface ITemplateNamespace {
  namespace: string
  attributes: ITemplateAttribute[]
}

export interface ITemplateDefinition {
  vct?: string
  schemaUrl?: string
  doctype?: string
  attributes?: ITemplateAttribute[]
  namespaces?: ITemplateNamespace[]
}

export interface ITemplateAppearanceDisplay {
  locale?: string
  name: string
  description?: string
  logo?: Partial<ILogo>
  background_color?: string
  text_color?: string
}

export interface ITemplateAppearance {
  display: ITemplateAppearanceDisplay[]
}

export interface ITemplate {
  id: string
  name: string
  description?: string | null
  format: CredentialFormat
  // eslint-disable-next-line camelcase
  signerOption?: SignerOption
  canBeRevoked?: boolean
  attributes?: ITemplateDefinition
  appearance?: ITemplateAppearance
  noticeUrl?: string | null
  issuerId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ICreateTemplatePayload {
  name: string
  description?: string
  signerOption: SignerOption
  format: CredentialFormat
  template: ITemplateDefinition
  canBeRevoked: boolean
  appearance?: ITemplateAppearance
  noticeUrl?: string
}

export type IUpdateTemplatePayload = Partial<ICreateTemplatePayload>

export interface ICredentialOfferStatus {
  code?: string
  label?: string
  description?: string
  canBeRedeemed?: boolean
  needsNewOffer?: boolean
}

export interface ICredentialOffer {
  id: string
  credentialOfferId?: string
  credentialOfferUri?: string
  credentialOffer?: string
  issuerId?: string
  state?: string
  status?: ICredentialOfferStatus
  createdAt?: string
  expiresAt?: string
  userPin?: string
  preAuthorizedCode?: string
  credentialOfferPayload?: Record<string, unknown>
  issuanceMetadata?: Record<string, unknown>
  issuedCredentials?: unknown[]
}

export interface IValidityInfo {
  validFrom?: string
  validUntil?: string
}

export interface ICredentialRequest {
  templateId: string
  payload: Record<string, unknown>
  validityInfo?: IValidityInfo
}

export interface ICreateOfferPayload {
  credentials: ICredentialRequest[]
  authorizationType:
    'preAuthorizedCodeFlow' | 'authorizationCodeFlow' | 'noAuth'
  noticeUrl?: string
  isRevocable?: boolean
  credentialVersion?: 'v1.0' | 'v2.0'
}

export interface ICreateOfferResponseData {
  credentialOffer?: string
  issuanceSession?: ICredentialOffer
}

export interface IReissueOfferPayload {
  validityInfo?: IValidityInfo
}

export interface IUpdateOfferPayload {
  issuerMetadata: Record<string, unknown>
}
