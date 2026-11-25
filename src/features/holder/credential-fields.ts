import type { HolderCredentialFormat } from './types'

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const stringValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }
  return value.trim()
}

export const firstString = (
  record: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = stringValue(record[key])
    if (value) {
      return value
    }
  }
  return undefined
}

export const firstArrayString = (value: unknown): string | undefined => {
  if (!Array.isArray(value)) {
    return undefined
  }
  for (const item of value) {
    const text = stringValue(item)
    if (text) {
      return text
    }
  }
  return undefined
}

export const nestedRecord = (
  value: unknown,
): Record<string, unknown> | undefined => (isRecord(value) ? value : undefined)

export const firstRecord = (
  value: unknown,
): Record<string, unknown> | undefined => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const record = nestedRecord(item)
      if (record) {
        return record
      }
    }
    return undefined
  }
  return nestedRecord(value)
}

const GENERIC_TYPES = new Set([
  'Credential',
  'VerifiableCredential',
  'https://www.w3.org/2018/credentials#VerifiableCredential',
])

/** Prefer a credential-specific type over the generic W3C wrapper type. */
export const specificType = (value: unknown): string | undefined => {
  const candidates = (Array.isArray(value) ? value : [value])
    .map(stringValue)
    .filter((item): item is string => Boolean(item))

  return (
    candidates.find((candidate) => !GENERIC_TYPES.has(candidate)) ??
    candidates[0]
  )
}

export const credentialTags = (
  raw: Record<string, unknown>,
): Record<string, unknown> => nestedRecord(raw._tags) ?? {}

export const credentialInstance = (
  raw: Record<string, unknown>,
): Record<string, unknown> =>
  firstRecord(raw.credentialInstances) ?? nestedRecord(raw.credential) ?? {}

/** The W3C agent record embeds the signed credential in its first instance. */
export const credentialEmbedded = (
  raw: Record<string, unknown>,
  format: HolderCredentialFormat,
): Record<string, unknown> | undefined => {
  if (format !== 'w3c-vc') {
    return undefined
  }
  return nestedRecord(credentialInstance(raw).credential)
}

export const credentialTypeLabel = (
  raw: Record<string, unknown>,
  format: HolderCredentialFormat,
): string | undefined => {
  const tags = credentialTags(raw)
  const embedded = credentialEmbedded(raw, format)

  return (
    firstString(raw, [
      'label',
      'name',
      'title',
      'vct',
      'docType',
      'credentialType',
    ]) ??
    firstString(tags, ['vct', 'docType', 'name', 'title', 'credentialType']) ??
    specificType(tags.types ?? tags.expandedTypes) ??
    specificType(embedded?.type)
  )
}

export const credentialIssuer = (
  raw: Record<string, unknown>,
  format: HolderCredentialFormat,
): string | undefined => {
  const tags = credentialTags(raw)
  const embedded = credentialEmbedded(raw, format)

  return (
    firstString(raw, ['issuer', 'issuerDid', 'issuerId']) ??
    firstString(tags, ['issuerId', 'issuer', 'issuerDid']) ??
    firstString(embedded ?? {}, ['issuer'])
  )
}

export const credentialIssuedAt = (
  raw: Record<string, unknown>,
  format: HolderCredentialFormat,
): string | undefined => {
  const embedded = credentialEmbedded(raw, format)

  return (
    firstString(raw, ['createdAt', 'issuedAt', 'createDateTime']) ??
    firstString(embedded ?? {}, ['issuanceDate', 'issuedAt', 'validFrom'])
  )
}

export const credentialState = (
  raw: Record<string, unknown>,
): string | undefined =>
  firstString(raw, ['multiInstanceState', 'state', 'status'])
