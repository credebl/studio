export interface ICreateIssuerPayload {
  issuerId: string
  display: Display[]
}

export interface Display {
  locale: string
  name: string
  description: string
  logo: Logo
}

export interface Logo {
  uri: string
  alt_text: string
}

export interface IDisplayItem {
  locale: string
  name: string
  description: string
  logo: {
    uri: string
    alt_text: string
  }
}
