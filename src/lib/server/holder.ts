import { type ApiEnvelope, loadSessionUserId, platformFetch } from './platform'
import {
  BINDING_ERROR_MESSAGES,
  type BindingErrorCode,
  type HolderCredentialRequestPayload,
  assertValidHolderCredentialRequest,
} from '@/lib/holderBinding'
import type {
  HolderCredentialFormat,
  HolderWalletState,
} from '@/features/holder/types'
import type { Session } from 'next-auth'
import { apiRoutes } from '@/config/apiRoutes'
import { authOptions } from '@/utils/authOptions'
import { cache } from 'react'
import { getServerSession } from 'next-auth/next'
import { normalizeHolderDids } from '@/features/holder/normalize'
import { redirect } from 'next/navigation'

/**
 * Server-only access to the user-scoped holder cloud-wallet APIs shipped in
 * platform v2.3.0. No orgId is ever sent; the platform derives the wallet from
 * the authenticated user. The holder role is re-checked live on every request
 * because the session claim is only a UI hint.
 */

export class HolderApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: BindingErrorCode,
  ) {
    super(message)
    this.name = 'HolderApiError'
  }
}

const cloudFetch = (
  path: string,
  init: RequestInit = {},
): Promise<Response | null> => platformFetch(path, init)

/**
 * The platform's holder guard checks a Keycloak `userRole` attribute that
 * cloud-wallet accounts carry and org accounts do not. An effective holder is
 * therefore one that can call GET /did: 200 (wallet exists) or 404 (no wallet
 * yet). A 403 means the account is not a platform holder.
 *
 * GET /users/profile cannot be used here: the platform's UserAccessGuard
 * rejects holder accounts, so it would produce a false negative.
 */
const holdsHolderRole = cache(async (): Promise<boolean> => {
  const response = await cloudFetch(apiRoutes.cloudWallet.did)
  return response?.status === 200 || response?.status === 404
})

export const getHolderSession = async (): Promise<Session | null> => {
  const session = await getServerSession(authOptions)
  if (!session?.sessionId) {
    return null
  }

  return (await holdsHolderRole()) ? session : null
}

export const requireHolderSession = async (): Promise<Session> => {
  const currentSession = await getServerSession(authOptions)
  if (!currentSession?.sessionId) {
    redirect('/sign-in')
  }

  const session = await getHolderSession()
  if (!session) {
    redirect('/dashboard')
  }
  return session
}

const bindingErrorCode = (value: unknown): BindingErrorCode | undefined => {
  if (typeof value !== 'string' || !(value in BINDING_ERROR_MESSAGES)) {
    return undefined
  }
  return value as BindingErrorCode
}

const failureMessage = (
  status: number | undefined,
  code?: BindingErrorCode,
): string => {
  // Only allow-listed codes are surfaced; upstream bodies can contain tx codes
  // or other sensitive details and are never forwarded to the browser.
  if (code) {
    return BINDING_ERROR_MESSAGES[code]
  }
  if (status === 409) {
    return 'A personal wallet already exists for this account.'
  }
  if (status === 404) {
    return 'Your wallet is not set up yet. Create it to continue.'
  }
  if (status === 400 || status === 422) {
    return 'Check the details and try again.'
  }
  if (status === 401 || status === 403) {
    return 'You are not allowed to use the holder wallet.'
  }
  return 'The wallet service is unavailable. Please try again.'
}

const requestCloud = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const response = await cloudFetch(path, init)
  if (!response) {
    throw new HolderApiError('The wallet service is unavailable.')
  }
  if (!response.ok) {
    let code: BindingErrorCode | undefined = undefined
    try {
      const body = (await response.json()) as { errorCode?: unknown } | null
      code = bindingErrorCode(body?.errorCode)
    } catch {
      // A non-JSON error body still produces the generic status-based message.
    }
    throw new HolderApiError(
      failureMessage(response.status, code),
      response.status,
      code,
    )
  }

  try {
    const body = (await response.json()) as ApiEnvelope<T>
    return (body?.data ?? body) as T
  } catch {
    throw new HolderApiError('The wallet service returned an invalid response.')
  }
}

const post = async <T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<T> =>
  requestCloud<T>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/**
 * v2.3.0 has no explicit wallet-status endpoint. GET /did returns 404 when no
 * sub-wallet exists, so it doubles as a side-effect-free onboarding probe.
 */
export const getHolderWalletState = async (): Promise<HolderWalletState> => {
  const response = await cloudFetch(apiRoutes.cloudWallet.did)

  if (!response) {
    return { available: false, hasWallet: false, dids: [] }
  }
  if (response.status === 404) {
    return { available: true, hasWallet: false, dids: [] }
  }
  if (response.status === 403) {
    return {
      available: false,
      hasWallet: false,
      dids: [],
      message:
        'Your account is missing the holder entitlement. Sign up with the updated registration flow or ask your platform administrator to add the holder role to your account.',
    }
  }
  if (!response.ok) {
    return { available: false, hasWallet: false, dids: [] }
  }

  try {
    const body = (await response.json()) as ApiEnvelope<unknown>
    return {
      available: true,
      hasWallet: true,
      dids: normalizeHolderDids(body?.data),
    }
  } catch {
    return { available: false, hasWallet: false, dids: [] }
  }
}

const DID_URL_PATTERN = /^did:[a-z0-9]+:.+$/i

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined
  }
  return value as Record<string, unknown>
}

/**
 * Platform's primary DID preference. It is a UI suggestion only: callers must
 * never use it as an implicit holderDidUrl (spec 6.3 / N-P-01).
 *
 * The preference is org-scoped on the platform side, so it is only available
 * when the holder session can supply both ids. A personal wallet without an
 * org simply has no suggestion.
 */
export const getPrimaryDidUrl = async (
  orgId?: string | null,
  userId?: string | null,
): Promise<string | null> => {
  const normalizedOrgId = orgId?.trim()
  if (!normalizedOrgId) {
    return null
  }

  const session = userId ? null : await getServerSession(authOptions)
  // The NextAuth session user id is the email/session state, while the platform
  // primary-DID route is scoped by its database user id. Resolve the latter
  // from the same session-details exchange used for API tokens.
  const normalizedUserId =
    userId?.trim() || (await loadSessionUserId()) || session?.user?.id?.trim()
  if (!normalizedUserId) {
    return null
  }

  const path = `${apiRoutes.organizations.root}/${encodeURIComponent(normalizedOrgId)}/users/${encodeURIComponent(normalizedUserId)}${apiRoutes.cloudWallet.holderPrimaryDid}`
  const response = await cloudFetch(path)
  if (!response?.ok) {
    return null
  }

  try {
    const body = (await response.json()) as ApiEnvelope<unknown>
    const data = asRecord(body?.data)
    const didUrl = [data?.didUrl, data?.primaryDidUrl, data?.did].find(
      (value): value is string => typeof value === 'string',
    )
    return didUrl && DID_URL_PATTERN.test(didUrl.trim()) ? didUrl.trim() : null
  } catch {
    return null
  }
}

export const createHolderWallet = (
  label: string,
  connectionImageUrl?: string,
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.createWallet, {
    label,
    ...(connectionImageUrl ? { connectionImageUrl } : {}),
  })

export const createHolderDid = (
  payload: Record<string, unknown>,
): Promise<unknown> => post(apiRoutes.cloudWallet.did, payload)

export const createHolderDidImportSession = (
  method: 'key' | 'web' | 'polygon',
): Promise<unknown> => post(apiRoutes.cloudWallet.didImportSession, { method })

const credentialPath = (format: HolderCredentialFormat): string => {
  switch (format) {
    case 'sd-jwt-vc':
      return apiRoutes.cloudWallet.sdJwtCredentials
    case 'mso_mdoc':
      return apiRoutes.cloudWallet.mdocCredentials
    case 'w3c-vc':
      return apiRoutes.cloudWallet.w3cCredentials
    default:
      throw new HolderApiError('Unsupported credential format.')
  }
}

export const listHolderCredentials = (
  format: HolderCredentialFormat,
): Promise<unknown> => requestCloud<unknown>(credentialPath(format))

export const decodeHolderMdoc = (base64Url: string): Promise<unknown> =>
  post(apiRoutes.cloudWallet.decodeMdoc, { base64Url })

export const decodeHolderSdJwt = (jwt: string): Promise<unknown> =>
  post(apiRoutes.cloudWallet.decodeSdJwt, { jwt })

export const deleteHolderCredential = (
  credentialType: HolderCredentialFormat,
  credentialId: string,
): Promise<unknown> =>
  requestCloud<unknown>(apiRoutes.cloudWallet.deleteCredential, {
    method: 'DELETE',
    body: JSON.stringify({ credentialType, credentialId }),
  })

export const resolveCredentialOffer = (
  credentialOfferUri: string,
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.resolveCredentialOffer, { credentialOfferUri })

export const authorizationRequest = (
  credentialOfferUri: string,
  credentialsToRequest: string[],
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.authorizationRequest, {
    credentialOfferUri,
    credentialsToRequest,
  })

export const requestHolderCredential = async (
  payload: HolderCredentialRequestPayload,
): Promise<unknown> => {
  // Validate every selection before token redemption so a user input error
  // cannot consume the offer or transaction code (spec 5.1). Keeping this
  // function async also surfaces the validation failure as a rejected promise.
  assertValidHolderCredentialRequest(payload)
  return post(apiRoutes.cloudWallet.requestCredential, { ...payload })
}

export const getHolderProofs = (): Promise<unknown> =>
  requestCloud<unknown>(apiRoutes.cloudWallet.proofs)

export const getHolderProof = (proofRecordId: string): Promise<unknown> =>
  requestCloud<unknown>(
    `${apiRoutes.cloudWallet.proof}/${encodeURIComponent(proofRecordId)}`,
  )

export const acceptHolderProof = (
  proofRecordId: string,
  comment?: string,
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.acceptProof, {
    proofRecordId,
    ...(comment ? { comment } : {}),
  })

export const resolveProofRequest = (
  proofRequestUri: string,
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.resolveProofRequest, { proofRequestUri })

export const acceptProofRequest = (proofRequestUri: string): Promise<unknown> =>
  post(apiRoutes.cloudWallet.acceptProofRequest, { proofRequestUri })

export const getHolderConnections = (): Promise<unknown> =>
  requestCloud<unknown>(apiRoutes.cloudWallet.connections)

export const createHolderConnection = (label: string): Promise<unknown> =>
  post(apiRoutes.cloudWallet.connectionInvitation, { label })

export const receiveHolderInvitation = (
  invitationUrl: string,
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.receiveInvitation, { invitationUrl })

export const acceptHolderOffer = (
  credentialRecordId: string,
): Promise<unknown> =>
  post(apiRoutes.cloudWallet.acceptOffer, {
    credentialRecordId,
    autoAcceptCredential: 'always',
    credentialFormats: {},
  })
