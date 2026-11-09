import {
  X509_CERTIFICATE_IMPORT_METHOD,
  encryptKeyForDidImport,
  x509CertificateKeyMaterial,
} from '@/utils/didKeyImport'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import { createDidImportSession } from '@/app/api/Agent'

vi.mock('@/app/api/Agent', () => ({
  createDidImportSession: vi.fn(),
}))

const base64UrlDecode = (value: string): Uint8Array =>
  new Uint8Array(Buffer.from(value, 'base64url'))

const makeSession = async (
  method: string,
): Promise<{
  session: Record<string, unknown>
  privateKey: CryptoKey
}> => {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  )
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  return {
    privateKey: pair.privateKey,
    session: {
      sessionId: 'session-1',
      kid: 'kid-1',
      method,
      expiresAt: '2099-01-01T00:00:00.000Z',
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM',
      publicKeyJwk,
      protectedHeader: {
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: 'kid-1',
      },
    },
  }
}

beforeEach(() => {
  vi.mocked(createDidImportSession).mockReset()
})

describe('encryptKeyForDidImport', () => {
  it('requests an x509-certificate session and encrypts only the private key', async () => {
    const { session, privateKey } = await makeSession(
      X509_CERTIFICATE_IMPORT_METHOD,
    )
    const response: Partial<AxiosResponse> = {
      data: { statusCode: 201, data: session },
    }
    vi.mocked(createDidImportSession).mockResolvedValue(
      response as AxiosResponse,
    )

    const pem = '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----'
    const result = await encryptKeyForDidImport(
      'org-1',
      X509_CERTIFICATE_IMPORT_METHOD,
      x509CertificateKeyMaterial(pem),
    )

    expect(createDidImportSession).toHaveBeenCalledWith(
      'org-1',
      'x509-certificate',
    )
    expect(result.sessionId).toBe('session-1')
    expect(result.jwe).not.toContain('BEGIN PRIVATE KEY')

    const [header, wrappedKey, iv, ciphertext, tag] = result.jwe.split('.')
    const cek = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      base64UrlDecode(wrappedKey),
    )
    const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, [
      'decrypt',
    ])
    const sealed = Buffer.concat([
      base64UrlDecode(ciphertext),
      base64UrlDecode(tag),
    ])
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64UrlDecode(iv),
        additionalData: new TextEncoder().encode(header),
      },
      aesKey,
      sealed,
    )

    expect(JSON.parse(new TextDecoder().decode(plaintext))).toEqual({
      privateKey: pem,
    })
  })

  it('throws when the session cannot be created', async () => {
    vi.mocked(createDidImportSession).mockResolvedValue('Network Error')

    await expect(
      encryptKeyForDidImport(
        'org-1',
        X509_CERTIFICATE_IMPORT_METHOD,
        x509CertificateKeyMaterial('key'),
      ),
    ).rejects.toThrow('Network Error')
  })
})
