import {
  credentialEmbedded,
  credentialInstance,
  credentialIssuer,
  credentialState,
  credentialTags,
  credentialTypeLabel,
  firstArrayString,
  firstString,
  nestedRecord,
  specificType,
  stringValue,
} from './credential-fields'
import type { HolderCredential } from './types'

export interface CredentialDetail {
  label: string
  value: string
}

export interface CredentialSummary {
  metadata: CredentialDetail[]
  claims: CredentialDetail[]
}

export const formatCredentialDate = (value?: string): string => {
  if (!value) {
    return 'Not reported'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const iso = date.toISOString()
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`
}

const epochDate = (value: unknown): string | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }
  const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value
  return new Date(milliseconds).toISOString()
}

const decodeBase64UrlValue = (value: string): unknown => {
  if (typeof atob === 'undefined') {
    return undefined
  }

  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    )
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown
  } catch {
    return undefined
  }
}

const decodeBase64UrlRecord = (
  value: string,
): Record<string, unknown> | undefined =>
  nestedRecord(decodeBase64UrlValue(value))

const compactSdJwt = (credential: HolderCredential): string | undefined =>
  firstString(credentialInstance(credential.raw), [
    'compactSdJwtVc',
    'jwt',
    'sdJwt',
    'compact',
    'credential',
    'encodedCredential',
  ])

const sdJwtPayload = (
  credential: HolderCredential,
): Record<string, unknown> | undefined => {
  const compact = compactSdJwt(credential)
  const payloadPart = compact?.split('.')[1]
  return payloadPart ? decodeBase64UrlRecord(payloadPart) : undefined
}

const formatClaimValue = (value: unknown): string => {
  const text = stringValue(value)
  if (text) {
    return text
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return 'Not reported'
  }
  return JSON.stringify(value) ?? 'Not reported'
}

const sdJwtClaims = (credential: HolderCredential): CredentialDetail[] => {
  const compact = compactSdJwt(credential)
  if (!compact) {
    return []
  }

  return compact
    .split('~')
    .slice(1)
    .flatMap((segment) => {
      const disclosure = decodeBase64UrlValue(segment)
      if (!Array.isArray(disclosure) || disclosure.length < 3) {
        return []
      }
      const label = stringValue(disclosure[1])
      if (!label) {
        return []
      }
      return [{ label, value: formatClaimValue(disclosure[2]) }]
    })
}

const w3cClaims = (
  embedded: Record<string, unknown> | undefined,
): CredentialDetail[] => {
  const subject = nestedRecord(embedded?.credentialSubject)
  if (!subject) {
    return []
  }

  return Object.entries(subject)
    .filter(([label]) => label !== 'id')
    .map(([label, value]) => ({ label, value: formatClaimValue(value) }))
}

export interface CredentialFacts {
  type?: string
  issuer?: string
  issuedAt?: string
  expiresAt?: string
  bindingKid?: string
  storedAt?: string
  updatedAt?: string
  state?: string
}

/**
 * Extract the fields shared by the vault details and the wallet metrics from
 * the stored agent record. No decode action or private key material is needed.
 */
export const credentialFacts = (
  credential: HolderCredential,
): CredentialFacts => {
  const { raw, format } = credential
  const embedded = credentialEmbedded(raw, format)
  const payload = format === 'sd-jwt-vc' ? sdJwtPayload(credential) : embedded

  return {
    type: credentialTypeLabel(raw, format) ?? specificType(payload?.type),
    issuer: credentialIssuer(raw, format) ?? stringValue(payload?.iss),
    issuedAt:
      format === 'w3c-vc'
        ? firstString(embedded ?? {}, ['issuanceDate', 'issuedAt', 'validFrom'])
        : (epochDate(payload?.iat) ?? credential.issuedAt),
    expiresAt:
      epochDate(payload?.exp) ?? firstString(payload ?? {}, ['expirationDate']),
    bindingKid:
      firstString(nestedRecord(payload?.cnf) ?? {}, ['kid', 'kidUrl']) ??
      firstString(nestedRecord(embedded?.proof) ?? {}, [
        'verificationMethod',
        'kid',
      ]),
    storedAt: firstString(raw, ['createdAt', 'createDateTime']),
    updatedAt: firstString(raw, ['updatedAt']),
    state: credentialState(raw),
  }
}

/** Build a human-readable summary directly from the stored agent record. */
export const summarizeCredential = (
  credential: HolderCredential,
): CredentialSummary => {
  const { raw, format } = credential
  const tags = credentialTags(raw)
  const facts = credentialFacts(credential)
  const embedded = credentialEmbedded(raw, format)
  const metadata: CredentialDetail[] = []
  const add = (label: string, value?: string): void => {
    if (value) {
      metadata.push({ label, value })
    }
  }

  const proofAlgorithm =
    firstString(tags, ['alg', 'signatureAlgorithm', 'proofType']) ??
    firstArrayString(tags.proofTypes) ??
    firstString(nestedRecord(embedded?.proof) ?? {}, ['type'])

  add(format === 'mso_mdoc' ? 'Document type' : 'Credential type', facts.type)
  add('Issuer', facts.issuer)
  add(
    'Issued',
    facts.issuedAt ? formatCredentialDate(facts.issuedAt) : undefined,
  )
  add(
    'Expires',
    facts.expiresAt ? formatCredentialDate(facts.expiresAt) : undefined,
  )
  add('Holder binding', facts.bindingKid)
  add('Proof algorithm', proofAlgorithm)
  if (format === 'sd-jwt-vc') {
    add('Disclosure algorithm', firstString(tags, ['sdAlg']))
  }
  add(
    'Stored',
    facts.storedAt ? formatCredentialDate(facts.storedAt) : undefined,
  )
  add(
    'Updated',
    facts.updatedAt ? formatCredentialDate(facts.updatedAt) : undefined,
  )
  add('Wallet state', facts.state)
  add('Record ID', credential.id)

  return {
    metadata,
    claims:
      format === 'sd-jwt-vc'
        ? sdJwtClaims(credential)
        : format === 'w3c-vc'
          ? w3cClaims(embedded)
          : [],
  }
}
