import {
  type EncryptedKey,
  type KeyImportKeyMaterial,
  type KeyImportSession,
  encryptKeyMaterialForImport,
} from './keyImport'
import type { AxiosResponse } from 'axios'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createDidImportSession } from '@/app/api/Agent'

function messageOf(value: unknown): string | undefined {
  if (typeof value === 'string' && value) {
    return value
  }
  if (Array.isArray(value) && value.length) {
    return value.join(', ')
  }
  return undefined
}

/** Session method for importing an X.509 certificate together with its private key. */
export const X509_CERTIFICATE_IMPORT_METHOD = 'x509-certificate'

/**
 * Requests a single-use import session from the gateway for `didMethod` (`key`, `web`, `x509`, `polygon` or
 * `x509-certificate`) and encrypts `material` to it in the browser. Only the returned envelope may be sent to the
 * platform.
 */
export async function encryptKeyForDidImport(
  orgId: string,
  didMethod: string,
  material: KeyImportKeyMaterial,
): Promise<EncryptedKey> {
  const sessionResponse = await createDidImportSession(orgId, didMethod)
  if (typeof sessionResponse === 'string') {
    throw new Error(sessionResponse)
  }

  const { data } = sessionResponse as AxiosResponse
  if (data?.statusCode !== apiStatusCodes.API_STATUS_CREATED) {
    throw new Error(
      messageOf(data?.message) ?? 'Failed to create a key import session',
    )
  }

  return encryptKeyMaterialForImport(data.data as KeyImportSession, material)
}

/** The X.509 certificate import encrypts exactly the PEM or base64 DER private key, nothing else. */
export function x509CertificateKeyMaterial(
  privateKey: string,
): KeyImportKeyMaterial {
  return { privateKey }
}

/** did:polygon keys are 32 byte secp256k1 keys, as 64 hex characters with an optional 0x prefix. */
export function polygonKeyMaterial(
  privateKeyHex: string,
): KeyImportKeyMaterial {
  const hex = privateKeyHex.trim().replace(/^0x/i, '')
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('The Polygon private key must be 64 hexadecimal characters')
  }
  return { privateKey: hex }
}
