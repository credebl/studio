import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDidAction,
  createWalletAction,
  requestCredentialAction,
} from '@/app/holder/actions'
import {
  createHolderDid,
  createHolderWallet,
  getHolderSession,
  requestHolderCredential,
} from '@/lib/server/holder'
import { makeSession } from './helpers'
import { revalidatePath } from 'next/cache'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/server/holder', () => ({
  acceptHolderOffer: vi.fn(),
  acceptHolderProof: vi.fn(),
  acceptProofRequest: vi.fn(),
  authorizationRequest: vi.fn(),
  createHolderConnection: vi.fn(),
  createHolderDid: vi.fn(),
  createHolderDidImportSession: vi.fn(),
  createHolderWallet: vi.fn(),
  decodeHolderMdoc: vi.fn(),
  decodeHolderSdJwt: vi.fn(),
  deleteHolderCredential: vi.fn(),
  getHolderSession: vi.fn(),
  receiveHolderInvitation: vi.fn(),
  requestHolderCredential: vi.fn(),
  resolveCredentialOffer: vi.fn(),
  resolveProofRequest: vi.fn(),
}))

const formData = (values: Record<string, string>): FormData => {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value)
  }
  return data
}

beforeEach(() => {
  vi.mocked(getHolderSession).mockResolvedValue(makeSession())
})

describe('holder server actions', () => {
  it('refuses actions without a live holder session', async () => {
    vi.mocked(getHolderSession).mockResolvedValue(null)

    const result = await createWalletAction(null, formData({ label: 'Wallet' }))

    expect(result).toMatchObject({ status: 'error' })
    expect(createHolderWallet).not.toHaveBeenCalled()
  })

  it('creates a wallet without sending an orgId', async () => {
    vi.mocked(createHolderWallet).mockResolvedValue({ id: 'wallet-1' })

    const result = await createWalletAction(
      null,
      formData({
        label: 'My wallet',
        connectionImageUrl: 'https://img.test/a.png',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(createHolderWallet).toHaveBeenCalledWith(
      'My wallet',
      'https://img.test/a.png',
    )
    expect(revalidatePath).toHaveBeenCalledWith('/holder')
  })

  it('rejects did:web without a domain before calling the API', async () => {
    const result = await createDidAction(
      null,
      formData({ method: 'web', keyType: 'ed25519' }),
    )

    expect(result).toMatchObject({ status: 'error' })
    expect(createHolderDid).not.toHaveBeenCalled()
  })

  it('passes DID binding and notification flags to the issuance API', async () => {
    vi.mocked(requestHolderCredential).mockResolvedValue({ credential: 'ok' })

    const result = await requestCredentialAction(
      null,
      formData({
        credentialOfferUri: 'openid-credential-offer://?x=1',
        credentialsToRequest: 'Degree, IdCard',
        authorizationCode: 'code-1',
        holderDidUrl: 'did:key:z6Mk',
        bindingPolicy: 'require',
        sendNotification: 'false',
      }),
    )

    expect(result).toMatchObject({ status: 'success' })
    expect(requestHolderCredential).toHaveBeenCalledWith({
      credentialOfferUri: 'openid-credential-offer://?x=1',
      credentialsToRequest: ['Degree', 'IdCard'],
      authorizationCode: 'code-1',
      holderDidUrl: 'did:key:z6Mk',
      bindingPolicy: 'require',
      sendNotification: false,
    })
  })
})
