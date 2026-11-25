import {
  BINDING_ERROR_MESSAGES,
  type CredentialBindingOptions,
  type CredentialBindingPolicy,
  HolderBindingError,
  type HolderCredentialRequestPayload,
} from '@/lib/holderBinding'
import { HolderApiError } from '@/lib/server/holder'
import { NextResponse } from 'next/server'

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

const readString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

export const readJsonBody = async (
  request: Request,
): Promise<Record<string, unknown> | undefined> => {
  try {
    return asRecord(await request.json())
  } catch {
    return undefined
  }
}

export const parseHolderCredentialRequest = (
  body: Record<string, unknown> | undefined,
): HolderCredentialRequestPayload => {
  if (!body) {
    throw new HolderBindingError('MISSING_CREDENTIAL_OFFER_URI')
  }

  const credentialOfferUri = readString(body.credentialOfferUri)?.trim() ?? ''
  if (!credentialOfferUri) {
    throw new HolderBindingError('MISSING_CREDENTIAL_OFFER_URI')
  }

  const rawBinding = asRecord(body.binding)
  const binding: CredentialBindingOptions | undefined = rawBinding
    ? {
        mode: rawBinding.mode as CredentialBindingOptions['mode'],
        ...(readString(rawBinding.holderDidUrl)
          ? { holderDidUrl: readString(rawBinding.holderDidUrl) }
          : {}),
        ...(readString(rawBinding.policy)
          ? {
              policy: readString(rawBinding.policy) as CredentialBindingPolicy,
            }
          : {}),
        ...(readString(rawBinding.didMethod)
          ? { didMethod: readString(rawBinding.didMethod) }
          : {}),
        ...(readString(rawBinding.signatureAlgorithm)
          ? { signatureAlgorithm: readString(rawBinding.signatureAlgorithm) }
          : {}),
      }
    : undefined

  return {
    credentialOfferUri,
    credentialsToRequest: asStringArray(body.credentialsToRequest),
    ...(readString(body.txCode) ? { txCode: readString(body.txCode) } : {}),
    ...(readString(body.authorizationCode)
      ? { authorizationCode: readString(body.authorizationCode) }
      : {}),
    ...(readString(body.codeVerifier)
      ? { codeVerifier: readString(body.codeVerifier) }
      : {}),
    ...(typeof body.sendNotification === 'boolean'
      ? { sendNotification: body.sendNotification }
      : {}),
    ...(readString(body.holderDidUrl)
      ? { holderDidUrl: readString(body.holderDidUrl) }
      : {}),
    ...(readString(body.bindingPolicy)
      ? {
          bindingPolicy: readString(
            body.bindingPolicy,
          ) as CredentialBindingPolicy,
        }
      : {}),
    ...(binding ? { binding } : {}),
  }
}

/** All error responses are generic: upstream bodies never reach the browser. */
export const holderErrorResponse = (error: unknown): NextResponse => {
  if (error instanceof HolderBindingError) {
    return NextResponse.json(
      { code: error.code, message: BINDING_ERROR_MESSAGES[error.code] },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (error instanceof HolderApiError) {
    return NextResponse.json(
      {
        ...(error.code ? { code: error.code } : {}),
        message: error.message,
      },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(
    { message: 'Unexpected holder request failure' },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  )
}
