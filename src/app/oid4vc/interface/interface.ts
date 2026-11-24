export interface ILogo {
  uri: string
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
