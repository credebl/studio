import {
  ICreateIssuerPayload,
  IDisplayItem,
  ILocaleEntry,
  ILogo,
} from '@/app/oid4vc/interface/interface'

export interface CreateIssuerFields {
  name: string
  description: string
  logoLink: string
  authorizationServerUrl: string
  locales: ILocaleEntry[]
}

export const isValidHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value.trim())
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const generateIssuerKey = (
  orgName: string,
  issuerName: string,
): string => {
  const slug = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32)

  const parts = [slug(orgName), slug(issuerName)].filter(Boolean)
  const prefix = parts.length > 0 ? `${parts.join('-')}-` : ''

  return `${prefix}${crypto.randomUUID()}-jwt-issuer`
}

export const getCreateIssuerErrors = ({
  name,
  description,
  logoLink,
  authorizationServerUrl,
  locales,
}: CreateIssuerFields): Record<string, string> => {
  const nextErrors: Record<string, string> = {}

  if (!name.trim()) {
    nextErrors.name = 'Name is required'
  }

  if (!description.trim()) {
    nextErrors.description = 'Description is required'
  }

  if (!logoLink.trim()) {
    nextErrors.logo = 'Logo link is required'
  } else if (!isValidHttpUrl(logoLink)) {
    nextErrors.logo = 'Please enter a valid URL'
  }

  if (!authorizationServerUrl.trim()) {
    nextErrors.authorizationServerUrl = 'Authorization server URL is required'
  } else if (!isValidHttpUrl(authorizationServerUrl)) {
    nextErrors.authorizationServerUrl = 'Please enter a valid URL'
  }

  const firstLocaleIndex = new Map<string, number>()

  locales.forEach((locale, index) => {
    const key = `locale-${index}`
    const localeCode = locale.locale.trim()

    if (!locale.name.trim()) {
      nextErrors[`${key}-name`] = 'Name is required'
    }

    if (!locale.description.trim()) {
      nextErrors[`${key}-description`] = 'Description is required'
    }

    if (!localeCode) {
      nextErrors[`${key}-locale`] = 'Locale is required'
    } else if (firstLocaleIndex.has(localeCode)) {
      const duplicateOf = firstLocaleIndex.get(localeCode) as number
      nextErrors[`${key}-locale`] = 'This locale is already in use'
      nextErrors[`locale-${duplicateOf}-locale`] =
        'This locale is already in use'
    } else {
      firstLocaleIndex.set(localeCode, index)
    }
  })

  return nextErrors
}

export const buildCreateIssuerPayload = (
  orgName: string,
  fields: CreateIssuerFields,
): ICreateIssuerPayload => {
  const logo: ILogo = {
    uri: fields.logoLink.trim(),
    // eslint-disable-next-line camelcase
    alt_text: `${fields.name.trim()} logo`,
  }

  const display: IDisplayItem[] = [
    {
      locale: 'en',
      name: fields.name.trim(),
      description: fields.description.trim(),
      logo,
    },
    ...fields.locales.map((locale) => ({
      locale: locale.locale,
      name: locale.name.trim(),
      description: locale.description.trim(),
      logo,
    })),
  ]

  return {
    issuerId: generateIssuerKey(orgName, fields.name),
    display,
    authorizationServerUrl: fields.authorizationServerUrl.trim(),
  }
}
