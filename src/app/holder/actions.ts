'use server'

import {
  BINDING_ERROR_MESSAGES,
  type CredentialBindingOptions,
  HolderBindingError,
  type HolderCredentialRequestPayload,
  assertValidHolderCredentialRequest,
} from '@/lib/holderBinding'
import type {
  HolderActionResult,
  HolderCredentialFormat,
} from '@/features/holder/types'
import { type KeyImportSession, isKeyImportSession } from '@/utils/keyImport'
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
import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'

const HOLDER_DID_METHODS = ['key', 'web', 'polygon'] as const
const HOLDER_DID_KEY_TYPE = 'ed25519'
const DID_SEED_BYTES = 16
const MAX_ENCRYPTED_KEY_JWE_LENGTH = 200_000

const CREDENTIAL_FORMATS: HolderCredentialFormat[] = [
  'sd-jwt-vc',
  'mso_mdoc',
  'w3c-vc',
]

const forbidden = <T>(): HolderActionResult<T> => ({
  status: 'error',
  message: 'You are not allowed to perform this action.',
})

const field = (formData: FormData, name: string): string =>
  String(formData.get(name) ?? '').trim()

const revalidateHolder = (): void => {
  revalidatePath('/holder')
  revalidatePath('/holder/offers')
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
  const domain = field(formData, 'domain')
  const network = field(formData, 'network')
  const sessionId = field(formData, 'encryptedKeySessionId')
  const jwe = field(formData, 'encryptedKeyJwe')

  if (!keyType || !method) {
    return { status: 'error', message: 'Key type and method are required.' }
  }

  if (method === 'x509') {
    return {
      status: 'error',
      message:
        'did:x509 is not available for holder wallets on platform v2.3.0. Follow credebl/platform#1864.',
    }
  }

  if (!HOLDER_DID_METHODS.some((candidate) => candidate === method)) {
    return {
      status: 'error',
      message: 'Choose did:key, did:web or did:polygon for your holder DID.',
    }
  }

  if (keyType !== HOLDER_DID_KEY_TYPE) {
    return {
      status: 'error',
      message: 'Ed25519 is the supported key type for holder DIDs.',
    }
  }

  if (Boolean(sessionId) !== Boolean(jwe)) {
    return {
      status: 'error',
      message: 'The encrypted key is incomplete. Prepare it again.',
    }
  }
  if (jwe.length > MAX_ENCRYPTED_KEY_JWE_LENGTH) {
    return { status: 'error', message: 'The encrypted key is too large.' }
  }
  // Only the opaque single-use envelope crosses the server boundary. Plaintext
  // private keys are encrypted in the browser and never accepted here.
  const encryptedKey = sessionId ? { sessionId, jwe } : undefined

  if (method === 'web') {
    if (!domain) {
      return {
        status: 'error',
        message: 'did:web requires the domain you control.',
      }
    }
    // The agent rejects domains with a scheme, path, or whitespace. A clear
    // message here is better than the platform's generic 400 response.
    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/i.test(domain)) {
      return {
        status: 'error',
        message: 'Enter a bare did:web domain, such as example.com.',
      }
    }
  }

  if (method === 'polygon') {
    if (!network) {
      return {
        status: 'error',
        message: 'did:polygon requires a network, such as polygon:testnet.',
      }
    }
    if (!/^[a-z0-9:_-]+$/i.test(network)) {
      return {
        status: 'error',
        message: 'Enter a bare did:polygon network, such as polygon:testnet.',
      }
    }
    if (!encryptedKey) {
      return {
        status: 'error',
        message: 'did:polygon requires an imported secp256k1 private key.',
      }
    }
  }

  try {
    await createHolderDid({
      keyType,
      method,
      // Platform v2.3.0 requires a seed for did:key and did:web without an
      // imported key. Generate it server-side so it is never exposed to the
      // browser or supplied by it. Imported keys use the encrypted envelope.
      ...(encryptedKey
        ? { encryptedKey }
        : { seed: randomBytes(DID_SEED_BYTES).toString('hex') }),
      ...(method === 'web' ? { domain } : {}),
      ...(method === 'polygon' ? { network } : {}),
    })
    revalidateHolder()
    return { status: 'success', message: 'DID created in your wallet.' }
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }
}

export async function createDidImportSessionAction(
  method: (typeof HOLDER_DID_METHODS)[number],
): Promise<HolderActionResult<KeyImportSession>> {
  if (!(await authorize())) {
    return forbidden()
  }
  if (!HOLDER_DID_METHODS.some((candidate) => candidate === method)) {
    return { status: 'error', message: 'Invalid DID import method.' }
  }

  try {
    const data = await createHolderDidImportSession(method)
    if (!isKeyImportSession(data)) {
      throw new Error('The wallet service returned an invalid import session.')
    }
    return {
      status: 'success',
      message:
        'Import session created. Encrypt your private key in the browser before continuing.',
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
  const bindingMode = field(formData, 'bindingMode')
  const holderDidUrl = field(formData, 'holderDidUrl')
  const bindingPolicy = field(formData, 'bindingPolicy')
  const sendNotification = formData.get('sendNotification') !== 'false'

  if (!credentialOfferUri || credentialsToRequest.length === 0) {
    return {
      status: 'error',
      message: 'Resolve an offer and select a credential.',
    }
  }

  // The UI always submits the nested form. A flat holderDidUrl is accepted for
  // backwards compatibility and must agree with the nested value; anything
  // else is rejected before the server wrapper can redeem the offer.
  const binding: CredentialBindingOptions | undefined = bindingMode
    ? {
        mode: bindingMode as CredentialBindingOptions['mode'],
        ...(bindingMode === 'new-key'
          ? {
              ...(field(formData, 'bindingDidMethod')
                ? { didMethod: field(formData, 'bindingDidMethod') }
                : {}),
              ...(field(formData, 'bindingSignatureAlgorithm')
                ? {
                    signatureAlgorithm: field(
                      formData,
                      'bindingSignatureAlgorithm',
                    ),
                  }
                : {}),
            }
          : {}),
        ...(bindingMode === 'existing-did'
          ? {
              ...(field(formData, 'bindingHolderDidUrl')
                ? { holderDidUrl: field(formData, 'bindingHolderDidUrl') }
                : {}),
              ...(bindingPolicy && ['require', 'prefer'].includes(bindingPolicy)
                ? {
                    policy: bindingPolicy as CredentialBindingOptions['policy'],
                  }
                : {}),
            }
          : {}),
      }
    : undefined

  const payload: HolderCredentialRequestPayload = {
    credentialOfferUri,
    credentialsToRequest,
    ...(authorizationCode ? { authorizationCode } : {}),
    ...(codeVerifier ? { codeVerifier } : {}),
    ...(txCode ? { txCode } : {}),
    ...(holderDidUrl ? { holderDidUrl } : {}),
    ...(bindingPolicy && ['require', 'prefer'].includes(bindingPolicy)
      ? { bindingPolicy: bindingPolicy as CredentialBindingOptions['policy'] }
      : {}),
    ...(binding ? { binding } : {}),
    sendNotification,
  }

  try {
    assertValidHolderCredentialRequest(payload)
  } catch (error) {
    if (error instanceof HolderBindingError) {
      return { status: 'error', message: BINDING_ERROR_MESSAGES[error.code] }
    }
    return { status: 'error', message: (error as Error).message }
  }

  try {
    const data = await requestHolderCredential(payload)
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
