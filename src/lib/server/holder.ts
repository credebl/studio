import {
  type BindingErrorCode,
  type HolderCredentialRequestPayload,
  type HolderOfferMetadata,
  type ResolvedHolderOffer,
  assertValidHolderCredentialRequest,
} from '@/lib/holderBinding'
import { apiRoutes } from '@/config/apiRoutes'
import { authOptions } from '@/utils/authOptions'
import { cache } from 'react'
import { getServerSession } from 'next-auth/next'
import { passwordEncryption } from '@/app/api/server/encryption'

/**
 * Server-only access to the platform's OID4VC holder APIs.
 *
 * As with the platform-admin wrapper, the httpOnly NextAuth session cookie is
 * exchanged for a short-lived access token on the server. No token, offer
 * payload, tx code or proof JWT is logged or forwarded to the browser beyond
 * the fields the redemption UI needs.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
const MAX_URI_LENGTH = 4096
const MAX_DID_LIST_LENGTH = 100
const DID_PATTERN = /^did:[a-z0-9]+:.+$/i

const STABLE_ERROR_CODES: readonly BindingErrorCode[] = [
  'INVALID_BINDING_MODE',
  'MISSING_HOLDER_DID_URL',
  'MALFORMED_HOLDER_DID_URL',
  'CONFLICTING_HOLDER_DID_URL',
  'CONFLICTING_BINDING_POLICY',
  'INVALID_BINDING_OPTIONS',
  'UNSUPPORTED_DID_METHOD',
  'UNSUPPORTED_PROOF_ALGORITHM',
  'INCOMPATIBLE_DID_METHOD_AND_ALGORITHM',
  'DID_BINDING_NOT_SUPPORTED_FOR_FORMAT',
  'EMPTY_CREDENTIALS_TO_REQUEST',
  'MISSING_CREDENTIAL_OFFER_URI',
]

export class HolderApiError extends Error {
  readonly status: number
  readonly code?: BindingErrorCode

  constructor(message: string, code?: BindingErrorCode, status = 502) {
    super(message)
    this.name = 'HolderApiError'
    this.status = status
    this.code = code
  }
}

interface SessionTokens {
  token: string
  refreshToken: string
}

interface ApiEnvelope<T> {
  data?: T
  message?: string
  errorCode?: string
}

interface SessionDetails {
  sessionToken?: string
  refreshToken?: string
}

interface RefreshedTokens {
  access_token?: string
}

const loadSessionTokens = cache(async (): Promise<SessionTokens | null> => {
  if (!BASE_URL) {
    return null
  }

  const session = await getServerSession(authOptions)
  if (!session?.sessionId) {
    return null
  }

  try {
    const encryptedSessionId = passwordEncryption(
      JSON.stringify(session.sessionId),
    )
    const response = await fetch(
      `${BASE_URL}${apiRoutes.auth.fetchSessionDetails}?sessionId=${encodeURIComponent(encryptedSessionId)}`,
      { cache: 'no-store' },
    )

    if (!response.ok) {
      return null
    }

    const body = (await response.json()) as ApiEnvelope<SessionDetails>
    const token = body?.data?.sessionToken
    const refreshToken = body?.data?.refreshToken

    return token && refreshToken ? { token, refreshToken } : null
  } catch {
    return null
  }
})

const refreshAccessToken = async (
  refreshToken: string,
): Promise<string | null> => {
  if (!BASE_URL) {
    return null
  }

  try {
    const response = await fetch(`${BASE_URL}${apiRoutes.auth.refreshToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const body = (await response.json()) as ApiEnvelope<RefreshedTokens>
    return body?.data?.access_token ?? null
  } catch {
    return null
  }
}

const platformFetch = async (
  path: string,
  existingTokens: SessionTokens | null | undefined,
  init: RequestInit = {},
): Promise<Response | null> => {
  if (!BASE_URL) {
    return null
  }

  // A flow may need several calls (profile then preference); reuse the same
  // session lookup so the token exchange happens once per flow.
  const tokens =
    existingTokens === undefined ? await loadSessionTokens() : existingTokens
  if (!tokens) {
    return null
  }

  const send = (token: string): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

  const response = await send(tokens.token)
  if (response.status !== 401) {
    return response
  }

  const refreshedToken = await refreshAccessToken(tokens.refreshToken)
  return refreshedToken ? send(refreshedToken) : response
}

const readBody = async (response: Response): Promise<ApiEnvelope<unknown>> => {
  try {
    return (await response.json()) as ApiEnvelope<unknown>
  } catch {
    return {}
  }
}

const stableCode = (body: ApiEnvelope<unknown>): BindingErrorCode | undefined =>
  STABLE_ERROR_CODES.find((code) => code === body.errorCode)

const clientStatus = (status: number): number => {
  return status >= 400 && status < 500 ? status : 502
}

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

const asStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

const asArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : []
}

const parseJsonObject = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const parseConfigurationIds = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return asStringArray(value)
  }

  if (typeof value === 'string') {
    try {
      return asStringArray(JSON.parse(value))
    } catch {
      return []
    }
  }

  return []
}

/** Platform primary DID is a UI suggestion, never an implicit binding. */
export const getPrimaryDidUrl = async (
  orgId: string,
): Promise<string | null> => {
  if (!orgId) {
    return null
  }

  const tokens = await loadSessionTokens()
  if (!tokens) {
    return null
  }

  const profileResponse = await platformFetch(
    apiRoutes.users.userProfile,
    tokens,
  )
  if (!profileResponse?.ok) {
    return null
  }

  const profile = asRecord((await readBody(profileResponse)).data)
  const userId =
    typeof profile?.id === 'string'
      ? profile.id
      : typeof profile?.userId === 'string'
        ? profile.userId
        : undefined

  if (!userId) {
    return null
  }

  const path = `${apiRoutes.organizations.root}/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}${apiRoutes.oid4vc.holderPrimaryDid}`
  const response = await platformFetch(path, tokens)
  if (!response?.ok) {
    return null
  }

  const data = asRecord((await readBody(response)).data)
  const didUrl = [data?.didUrl, data?.primaryDidUrl, data?.did].find(
    (value): value is string => typeof value === 'string',
  )

  return didUrl && DID_PATTERN.test(didUrl.trim()) ? didUrl.trim() : null
}

export const getHolderDidUrls = async (orgId: string): Promise<string[]> => {
  if (!orgId) {
    return []
  }

  const path = `${apiRoutes.organizations.root}/${encodeURIComponent(orgId)}${apiRoutes.organizations.didList}`
  const response = await platformFetch(path, undefined)
  if (!response?.ok) {
    return []
  }

  const { data } = await readBody(response)
  const entries = Array.isArray(data)
    ? data
    : asArray(asRecord(data)?.dids ?? asRecord(data)?.data)

  return entries
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry
      }
      const record = asRecord(entry)
      const value = record?.didUrl ?? record?.did ?? record?.id
      return typeof value === 'string' ? value : ''
    })
    .filter((didUrl) => DID_PATTERN.test(didUrl.trim()))
    .map((didUrl) => didUrl.trim())
    .slice(0, MAX_DID_LIST_LENGTH)
}

const readString = (...values: unknown[]): string | undefined =>
  values.find(
    (value): value is string => typeof value === 'string' && Boolean(value),
  )

export const resolveCredentialOffer = async (
  credentialOfferUri: string,
): Promise<ResolvedHolderOffer> => {
  if (
    typeof credentialOfferUri !== 'string' ||
    !credentialOfferUri.trim() ||
    credentialOfferUri.length > MAX_URI_LENGTH
  ) {
    throw new HolderApiError('Invalid credential offer URI', undefined, 400)
  }

  const response = await platformFetch(
    apiRoutes.oid4vc.holderResolveOffer,
    undefined,
    {
      method: 'POST',
      body: JSON.stringify({ credentialOfferUri: credentialOfferUri.trim() }),
    },
  )

  if (!response) {
    throw new HolderApiError(
      'Unable to resolve the credential offer',
      undefined,
      401,
    )
  }
  if (!response.ok) {
    const body = await readBody(response)
    throw new HolderApiError(
      'Unable to resolve the credential offer',
      stableCode(body),
      clientStatus(response.status),
    )
  }

  const body = await readBody(response)
  const data = asRecord(body.data) ?? {}
  const offerPayload = asRecord(data.credentialOfferPayload) ?? {}
  const encodedOffer =
    typeof data.credentialOffer === 'string'
      ? asRecord(parseJsonObject(data.credentialOffer))
      : undefined
  const metadataValue =
    data.issuerMetadata ??
    data.metadata ??
    offerPayload.issuerMetadata ??
    encodedOffer?.issuerMetadata

  const credentialsToRequest = parseConfigurationIds(
    data.credentialsToRequest ??
      data.credentialConfigurationIds ??
      offerPayload.credential_configuration_ids ??
      encodedOffer?.credential_configuration_ids,
  )

  if (credentialsToRequest.length === 0) {
    throw new HolderApiError(
      'The offer has no requestable credentials',
      undefined,
      400,
    )
  }

  return {
    credentialOfferUri:
      readString(data.credentialOfferUri, data.offerUri) ??
      credentialOfferUri.trim(),
    credentialsToRequest,
    txCode: readString(data.txCode, data.userPin),
    authorizationCode: readString(data.authorizationCode),
    codeVerifier: readString(data.codeVerifier),
    issuerMetadata: asRecord(metadataValue) as HolderOfferMetadata | undefined,
  }
}

export const requestCredential = async (
  payload: HolderCredentialRequestPayload,
): Promise<{ message?: string }> => {
  // Validation runs before redemption so a bad selection cannot consume the
  // offer or transaction code (spec 5.1).
  assertValidHolderCredentialRequest(payload)

  const response = await platformFetch(
    apiRoutes.oid4vc.holderRequestCredential,
    undefined,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  if (!response) {
    throw new HolderApiError(
      'Unable to request the credential',
      undefined,
      401,
    )
  }
  if (!response.ok) {
    const body = await readBody(response)
    throw new HolderApiError(
      'Unable to request the credential',
      stableCode(body),
      clientStatus(response.status),
    )
  }

  const body = await readBody(response)
  return {
    message:
      typeof body.message === 'string'
        ? body.message
        : 'Credential requested successfully',
  }
}
