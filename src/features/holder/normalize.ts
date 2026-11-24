import type {
  HolderConnection,
  HolderCredential,
  HolderCredentialFormat,
  HolderDid,
  HolderOfferConfiguration,
  HolderProof,
  HolderResolvedOffer,
} from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const stringValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }
  return value.trim()
}

const firstString = (
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

export const normalizeHolderDids = (value: unknown): HolderDid[] =>
  asRecordList(value).map((raw) => ({
    id: firstString(raw, ['id', 'didRecordId']),
    did: firstString(raw, ['did', 'didUrl']),
    method: firstString(raw, ['method', 'didMethod']),
    keyType: firstString(raw, ['keyType']),
    isPrimary: raw.isPrimary === true || raw.primary === true,
    raw,
  }))

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
      firstString(raw, ['label', 'name', 'title', 'type', 'credentialType']) ??
      (format === 'sd-jwt-vc' ? 'SD-JWT credential' : 'Credential'),
    issuer: firstString(raw, ['issuer', 'issuerDid', 'issuerId']),
    issuedAt: firstString(raw, ['createdAt', 'issuedAt', 'createDateTime']),
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

/**
 * Extract credential configuration ids from the resolved offer. The agent may
 * return them at several nesting levels, so scan the known keys and fall back
 * to a shallow recursive search.
 */
const findConfigurations = (value: unknown): unknown[] => {
  const knownKeys = [
    'credentialConfigurationsSupported',
    'credential_configurations_supported',
    'credentialConfigurationIds',
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
