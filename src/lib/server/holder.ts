import { type ApiEnvelope, platformFetch } from './platform'
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

const HOLDER_ROLE = 'holder'

interface HolderProfile {
  userOrgRoles?: { orgRole?: { name?: string }; orgId?: string | null }[]
}

class HolderApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'HolderApiError'
  }
}

const loadHolderProfile = cache(async (): Promise<HolderProfile | null> => {
  const response = await platformFetch(apiRoutes.users.userProfile)
  if (!response?.ok) {
    return null
  }

  try {
    const body = (await response.json()) as ApiEnvelope<HolderProfile>
    return body?.data ?? null
  } catch {
    return null
  }
})

const holdsHolderRole = cache(async (): Promise<boolean> => {
  const roles = (await loadHolderProfile())?.userOrgRoles
  return (
    Array.isArray(roles) &&
    roles.some((item) => item?.orgRole?.name === HOLDER_ROLE)
  )
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

const cloudFetch = (
  path: string,
  init: RequestInit = {},
): Promise<Response | null> => platformFetch(path, init)

const failureMessage = (status: number | undefined): string => {
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
    throw new HolderApiError(failureMessage(response.status), response.status)
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

export const requestHolderCredential = (payload: {
  credentialOfferUri: string
  credentialsToRequest: string[]
  authorizationCode?: string
  codeVerifier?: string
  txCode?: string
  holderDidUrl?: string
  bindingPolicy?: 'require' | 'prefer'
  sendNotification?: boolean
}): Promise<unknown> =>
  post(apiRoutes.cloudWallet.requestCredential, { ...payload })

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
