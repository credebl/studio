'use server'

import type {
  HolderActionResult,
  HolderCredentialFormat,
} from '@/features/holder/types'
import {
  acceptHolderOffer,
  acceptHolderProof,
  acceptProofRequest,
  authorizationRequest,
  createHolderConnection,
  createHolderDid,
  createHolderDidImportSession,
  createHolderWallet,
  decodeHolderMdoc,
  decodeHolderSdJwt,
  deleteHolderCredential,
  getHolderSession,
  receiveHolderInvitation,
  requestHolderCredential,
  resolveCredentialOffer,
  resolveProofRequest,
} from '@/lib/server/holder'
import { revalidatePath } from 'next/cache'

const CREDENTIAL_FORMATS: HolderCredentialFormat[] = [
  'sd-jwt-vc',
  'mso_mdoc',
  'w3c-vc',
]

const forbidden = (): HolderActionResult => ({
  status: 'error',
  message: 'You are not allowed to perform this action.',
})

const field = (formData: FormData, name: string): string =>
  String(formData.get(name) ?? '').trim()

const revalidateHolder = (): void => {
  revalidatePath('/holder')
  revalidatePath('/holder/credentials')
  revalidatePath('/holder/dids')
  revalidatePath('/holder/connections')
  revalidatePath('/holder/proofs')
}

/**
 * Server actions are independently invocable, so each one re-checks the live
 * holder role before calling the platform API.
 */
const authorize = async (): Promise<boolean> =>
  (await getHolderSession()) !== null

export async function createWalletAction(
  _previousState: HolderActionResult | null,
  formData: FormData,
): Promise<HolderActionResult> {
  if (!(await authorize())) {
    return forbidden()
  }

  const label = field(formData, 'label')
  const connectionImageUrl = field(formData, 'connectionImageUrl')

  if (!label || label.length > 120) {
    return {
      status: 'error',
      message: 'Enter a wallet label of at most 120 characters.',
    }
  }

  try {
    await createHolderWallet(label, connectionImageUrl || undefined)
    revalidateHolder()
    return { status: 'success', message: 'Your personal wallet is ready.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function createDidAction(
  _previousState: HolderActionResult | null,
  formData: FormData,
): Promise<HolderActionResult> {
  if (!(await authorize())) {
    return forbidden()
  }

  const keyType = field(formData, 'keyType')
  const method = field(formData, 'method')
  const network = field(formData, 'network')
  const domain = field(formData, 'domain')
  const endpoint = field(formData, 'endpoint')

  if (!keyType || !method) {
    return { status: 'error', message: 'Key type and method are required.' }
  }

  if (method === 'web' && !domain) {
    return {
      status: 'error',
      message: 'did:web requires the domain you control.',
    }
  }

  try {
    await createHolderDid({
      keyType,
      method,
      ...(network ? { network } : {}),
      ...(domain ? { domain } : {}),
      ...(endpoint ? { endpoint } : {}),
    })
    revalidateHolder()
    return { status: 'success', message: 'DID created in your wallet.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function createDidImportSessionAction(
  method: 'key' | 'web' | 'polygon',
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!['key', 'web', 'polygon'].includes(method)) {
    return { status: 'error', message: 'Invalid DID import method.' }
  }

  try {
    const data = await createHolderDidImportSession(method)
    return {
      status: 'success',
      message:
        'Import session created. Use its public key to encrypt your private key.',
      data,
    }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function deleteCredentialAction(
  credentialType: HolderCredentialFormat,
  credentialId: string,
): Promise<HolderActionResult> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!CREDENTIAL_FORMATS.includes(credentialType) || !credentialId) {
    return { status: 'error', message: 'Invalid credential selection.' }
  }

  try {
    await deleteHolderCredential(credentialType, credentialId)
    revalidateHolder()
    return { status: 'success', message: 'Credential deleted.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function decodeCredentialAction(
  format: HolderCredentialFormat,
  encoded: string,
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!encoded) {
    return {
      status: 'error',
      message: 'This credential cannot be decoded from the stored data.',
    }
  }

  try {
    const data =
      format === 'sd-jwt-vc'
        ? await decodeHolderSdJwt(encoded)
        : format === 'mso_mdoc'
          ? await decodeHolderMdoc(encoded)
          : null
    return {
      status: 'success',
      message: 'Credential decoded.',
      data,
    }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function resolveOfferAction(
  _previousState: HolderActionResult<unknown> | null,
  formData: FormData,
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }

  const credentialOfferUri = field(formData, 'credentialOfferUri')
  if (!credentialOfferUri.toLowerCase().startsWith('openid-credential-offer')) {
    return {
      status: 'error',
      message: 'Enter an openid-credential-offer:// URI.',
    }
  }

  try {
    const data = await resolveCredentialOffer(credentialOfferUri)
    return {
      status: 'success',
      message: 'Offer resolved. Choose a credential to request.',
      data,
    }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function authorizationRequestAction(
  credentialOfferUri: string,
  credentialsToRequest: string[],
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!credentialOfferUri || credentialsToRequest.length === 0) {
    return {
      status: 'error',
      message: 'Resolve an offer and select a credential.',
    }
  }

  try {
    const data = await authorizationRequest(
      credentialOfferUri,
      credentialsToRequest,
    )
    return {
      status: 'success',
      message: 'Authorization request prepared.',
      data,
    }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function requestCredentialAction(
  _previousState: HolderActionResult<unknown> | null,
  formData: FormData,
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }

  const credentialOfferUri = field(formData, 'credentialOfferUri')
  const credentialsToRequest = field(formData, 'credentialsToRequest')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const authorizationCode = field(formData, 'authorizationCode')
  const codeVerifier = field(formData, 'codeVerifier')
  const txCode = field(formData, 'txCode')
  const holderDidUrl = field(formData, 'holderDidUrl')
  const bindingPolicy = field(formData, 'bindingPolicy')
  const sendNotification = formData.get('sendNotification') !== 'false'

  if (!credentialOfferUri || credentialsToRequest.length === 0) {
    return {
      status: 'error',
      message: 'Resolve an offer and select a credential.',
    }
  }

  try {
    const data = await requestHolderCredential({
      credentialOfferUri,
      credentialsToRequest,
      ...(authorizationCode ? { authorizationCode } : {}),
      ...(codeVerifier ? { codeVerifier } : {}),
      ...(txCode ? { txCode } : {}),
      ...(holderDidUrl ? { holderDidUrl } : {}),
      ...(holderDidUrl && ['require', 'prefer'].includes(bindingPolicy)
        ? { bindingPolicy: bindingPolicy as 'require' | 'prefer' }
        : {}),
      sendNotification,
    })
    revalidateHolder()
    return {
      status: 'success',
      message: 'Credential request completed.',
      data,
    }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function resolveProofRequestAction(
  _previousState: HolderActionResult<unknown> | null,
  formData: FormData,
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }

  const proofRequestUri = field(formData, 'proofRequestUri')
  if (!proofRequestUri) {
    return { status: 'error', message: 'Enter a proof request URI.' }
  }

  try {
    const data = await resolveProofRequest(proofRequestUri)
    return { status: 'success', message: 'Proof request resolved.', data }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function acceptProofRequestAction(
  proofRequestUri: string,
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!proofRequestUri) {
    return { status: 'error', message: 'Resolve a proof request first.' }
  }

  try {
    const data = await acceptProofRequest(proofRequestUri)
    revalidateHolder()
    return { status: 'success', message: 'Presentation shared.', data }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function acceptDidCommProofAction(
  proofRecordId: string,
): Promise<HolderActionResult> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!proofRecordId) {
    return { status: 'error', message: 'Invalid proof record.' }
  }

  try {
    await acceptHolderProof(proofRecordId)
    revalidateHolder()
    return { status: 'success', message: 'Presentation shared.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function createConnectionAction(
  _previousState: HolderActionResult<unknown> | null,
  formData: FormData,
): Promise<HolderActionResult<unknown>> {
  if (!(await authorize())) {
    return forbidden()
  }

  const label = field(formData, 'label')
  try {
    const data = await createHolderConnection(label)
    revalidateHolder()
    return { status: 'success', message: 'Invitation created.', data }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function receiveInvitationAction(
  _previousState: HolderActionResult | null,
  formData: FormData,
): Promise<HolderActionResult> {
  if (!(await authorize())) {
    return forbidden()
  }

  const invitationUrl = field(formData, 'invitationUrl')
  if (!invitationUrl) {
    return { status: 'error', message: 'Enter an invitation URL.' }
  }

  try {
    await receiveHolderInvitation(invitationUrl)
    revalidateHolder()
    return { status: 'success', message: 'Invitation accepted.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function acceptOfferAction(
  credentialRecordId: string,
): Promise<HolderActionResult> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!credentialRecordId) {
    return { status: 'error', message: 'Invalid credential offer.' }
  }

  try {
    await acceptHolderOffer(credentialRecordId)
    revalidateHolder()
    return { status: 'success', message: 'Credential offer accepted.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}
