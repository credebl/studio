import type {
  HolderConnection,
  HolderCredential,
  HolderCredentialFormat,
  HolderDid,
  HolderOfferConfiguration,
  HolderProof,
  HolderResolvedOffer,
} from './types'
import {
  credentialIssuedAt,
  credentialIssuer,
  credentialTypeLabel,
  firstString,
  isRecord,
  nestedRecord,
} from './credential-fields'

/** Unwrap the optional inner pagination envelope used by holder list APIs. */
export const unwrapList = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
  }
  if (isRecord(value) && Array.isArray(value.data)) {
    return value.data
  }
  return []
}

export const asRecordList = (value: unknown): Record<string, unknown>[] => {
  const list = unwrapList(value)
  return Array.isArray(list) ? list.filter(isRecord) : []
}

export const rawRecords = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter(isRecord)
}

const countValues = (value: unknown): number => {
  if (Array.isArray(value)) {
    return value.length
  }
  return 0
}

const keyTypeLabel = (
  verificationMethods: Record<string, unknown>[],
): string | undefined => {
  const [firstMethod] = verificationMethods
  if (!firstMethod) {
    return undefined
  }

  const type = firstString(firstMethod, ['type'])
  if (type) {
    return type
      .replace(/VerificationKey\d{4}$/, '')
      .replace(/KeyAgreementKey\d{4}$/, '')
  }

  const jwk = nestedRecord(firstMethod.publicKeyJwk)
  return jwk ? firstString(jwk, ['crv', 'kty']) : undefined
}

/**
 * The released cloud-wallet DID endpoint returns the agent's DID records. The
 * record's searchable fields live under `_tags`, while verification methods and
 * timestamps live in `didDocument`, so both shapes are normalised here.
 */
export const normalizeHolderDids = (value: unknown): HolderDid[] =>
  asRecordList(value).map((raw) => {
    const tags = nestedRecord(raw._tags) ?? {}
    const document = nestedRecord(raw.didDocument) ?? {}
    const verificationMethods = Array.isArray(document.verificationMethod)
      ? document.verificationMethod.filter(isRecord)
      : []
    const did =
      firstString(raw, ['did', 'didUrl']) ?? firstString(tags, ['did'])
    const method =
      firstString(raw, ['method', 'didMethod']) ??
      firstString(tags, ['method']) ??
      did?.match(/^did:([^:]+)/)?.[1]

    return {
      id: firstString(raw, ['id', 'didRecordId']),
      did,
      method,
      methodSpecificIdentifier:
        firstString(tags, ['methodSpecificIdentifier']) ??
        (did && method ? did.slice(`did:${method}:`.length) : undefined),
      keyType:
        firstString(raw, ['keyType']) ?? keyTypeLabel(verificationMethods),
      role: firstString(raw, ['role']) ?? firstString(tags, ['role']),
      isPrimary:
        raw.isPrimary === true ||
        raw.primary === true ||
        tags.isPrimary === true,
      createdAt: firstString(raw, ['createdAt', 'created']),
      updatedAt: firstString(raw, ['updatedAt', 'updated']),
      verificationMethodCount: verificationMethods.length,
      authenticationCount: countValues(document.authentication),
      assertionMethodCount: countValues(document.assertionMethod),
      keyAgreementCount: countValues(document.keyAgreement),
      didDocument: nestedRecord(raw.didDocument),
      metadata: nestedRecord(raw.metadata),
      raw,
    }
  })

const encodedKeys: Record<HolderCredentialFormat, string[]> = {
  'sd-jwt-vc': ['jwt', 'sdJwt', 'compact', 'credential', 'encodedCredential'],
  // The wire format name is fixed by the released API.
  // eslint-disable-next-line camelcase
  mso_mdoc: ['base64Url', 'mdoc', 'credential', 'encodedCredential', 'cbor'],
  'w3c-vc': [],
}

export const normalizeHolderCredentials = (
  value: unknown,
  format: HolderCredentialFormat,
): HolderCredential[] =>
  asRecordList(value).map((raw) => ({
    id:
      firstString(raw, [
        'id',
        'credentialRecordId',
        'credentialId',
        'recordId',
      ]) ?? '',
    format,
    title:
      credentialTypeLabel(raw, format) ??
      (format === 'sd-jwt-vc' ? 'SD-JWT credential' : 'Credential'),
    issuer: credentialIssuer(raw, format),
    issuedAt: credentialIssuedAt(raw, format),
    encoded: firstString(raw, encodedKeys[format]),
    raw,
  }))

const configurationId = (
  value: unknown,
  index: number,
): HolderOfferConfiguration => {
  if (typeof value === 'string') {
    return { id: value, label: value, raw: { id: value } }
  }
  if (isRecord(value)) {
    const id =
      firstString(value, [
        'id',
        'credentialConfigurationId',
        'credential_configuration_id',
      ]) ?? String(index)
    return {
      id,
      label: firstString(value, ['label', 'name', 'format']) ?? id,
      raw: value,
    }
  }
  return { id: String(index), label: String(index), raw: {} }
}

const OFFERED_ID_KEYS = [
  'credential_configuration_ids',
  'credentialConfigurationIds',
]

/**
 * The resolved offer carries the configurations that were actually offered in
 * the offer payload. Issuer metadata also lists every configuration the issuer
 * supports, so it must not be used while that payload is present.
 */
const findOfferedConfigurationIds = (value: unknown): unknown[] => {
  if (isRecord(value)) {
    for (const key of OFFERED_ID_KEYS) {
      const candidate = value[key]
      if (Array.isArray(candidate)) {
        return candidate
      }
    }
    for (const key of [
      'credentialOfferPayload',
      'credentialOffer',
      'credential_offer',
      'resolvedCredentialOffer',
    ]) {
      const nested = findOfferedConfigurationIds(value[key])
      if (nested.length) {
        return nested
      }
    }
  }
  if (Array.isArray(value)) {
    for (const child of value) {
      const nested = findOfferedConfigurationIds(child)
      if (nested.length) {
        return nested
      }
    }
  }
  return []
}

/**
 * Extract credential configuration ids from the resolved offer. Prefer the
 * ids in the offer payload, then fall back to known configuration collections
 * and a shallow recursive search for older or differently shaped responses.
 */
const findConfigurations = (value: unknown): unknown[] => {
  const offeredIds = findOfferedConfigurationIds(value)
  if (offeredIds.length) {
    return offeredIds
  }

  const knownKeys = [
    'credential_configurations_supported',
    'credentialConfigurationsSupported',
    ...OFFERED_ID_KEYS,
    'credentialsToRequest',
    'supportedCredentialConfigurations',
    'configurations',
  ]
  if (isRecord(value)) {
    for (const key of knownKeys) {
      const candidate = value[key]
      if (Array.isArray(candidate)) {
        return candidate
      }
      if (isRecord(candidate)) {
        return Object.keys(candidate)
      }
    }
    for (const child of Object.values(value)) {
      if (isRecord(child) || Array.isArray(child)) {
        const nested = findConfigurations(child)
        if (nested.length) {
          return nested
        }
      }
    }
  }
  if (Array.isArray(value)) {
    for (const child of value) {
      const nested = findConfigurations(child)
      if (nested.length) {
        return nested
      }
    }
  }
  return []
}

export const normalizeResolvedOffer = (
  value: unknown,
): HolderResolvedOffer => ({
  configurations: findConfigurations(value).map(configurationId),
  raw: value,
})

export const normalizeHolderConnections = (
  value: unknown,
): HolderConnection[] =>
  asRecordList(value).map((raw) => ({
    id: firstString(raw, ['id', 'connectionId']) ?? '',
    label: firstString(raw, ['alias', 'label', 'theirLabel']) ?? 'Connection',
    state: firstString(raw, ['state', 'status']),
    raw,
  }))

export const normalizeHolderProofs = (value: unknown): HolderProof[] =>
  asRecordList(value).map((raw) => ({
    id: firstString(raw, ['id', 'proofRecordId']) ?? '',
    state: firstString(raw, ['state', 'status']),
    raw,
  }))
