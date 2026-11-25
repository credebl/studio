/**
 * Shared OID4VC holder-binding types and pure helpers.
 *
 * The canonical contract lives in docs/oid4vc-holder-binding-design.md (5.1).
 * Nothing in this module talks to the network: the same rules drive the offer
 * redemption UI, the server wrapper and the route handlers so a selection can
 * never be rendered as valid but serialized differently.
 */

export type CredentialBindingMode = 'new-key' | 'existing-did'
export type CredentialBindingPolicy = 'require' | 'prefer'

export interface CredentialBindingOptions {
  mode: CredentialBindingMode
  holderDidUrl?: string
  policy?: CredentialBindingPolicy
  didMethod?: string
  signatureAlgorithm?: string
}

export interface HolderCredentialRequestPayload {
  credentialOfferUri: string
  credentialsToRequest: string[]
  txCode?: string
  authorizationCode?: string
  codeVerifier?: string
  sendNotification?: boolean
  /** Legacy flat form. Kept for backward compatibility, never sent by the UI. */
  holderDidUrl?: string
  /** Legacy flat form. Kept for backward compatibility, never sent by the UI. */
  bindingPolicy?: CredentialBindingPolicy
  binding?: CredentialBindingOptions
}

export interface ProofTypesMetadata {
  jwt?: {
    proof_signing_alg_values_supported?: string[]
  }
}

export interface CredentialConfigurationMetadata {
  format?: string
  cryptographic_binding_methods_supported?: string[]
  proof_types_supported?: ProofTypesMetadata
}

export interface HolderOfferMetadata {
  credentialConfigurationsSupported?: Record<
    string,
    CredentialConfigurationMetadata
  >
  cryptographic_binding_methods_supported?: string[]
  proof_types_supported?: ProofTypesMetadata
}

export interface ResolvedHolderOffer {
  credentialOfferUri: string
  credentialsToRequest: string[]
  txCode?: string
  authorizationCode?: string
  codeVerifier?: string
  issuerMetadata?: HolderOfferMetadata
  metadata?: HolderOfferMetadata
}

export interface BindingSelection {
  mode: CredentialBindingMode
  didMethod?: string
  signatureAlgorithm?: string
  holderDidUrl?: string
  policy?: CredentialBindingPolicy
}

export type BindingErrorCode =
  | 'INVALID_BINDING_MODE'
  | 'MISSING_HOLDER_DID_URL'
  | 'MALFORMED_HOLDER_DID_URL'
  | 'CONFLICTING_HOLDER_DID_URL'
  | 'CONFLICTING_BINDING_POLICY'
  | 'INVALID_BINDING_OPTIONS'
  | 'UNSUPPORTED_DID_METHOD'
  | 'UNSUPPORTED_PROOF_ALGORITHM'
  | 'INCOMPATIBLE_DID_METHOD_AND_ALGORITHM'
  | 'DID_BINDING_NOT_SUPPORTED_FOR_FORMAT'
  | 'EMPTY_CREDENTIALS_TO_REQUEST'
  | 'MISSING_CREDENTIAL_OFFER_URI'

export const BINDING_ERROR_MESSAGES: Record<BindingErrorCode, string> = {
  INVALID_BINDING_MODE: 'Unsupported binding mode',
  MISSING_HOLDER_DID_URL: 'A holder DID URL is required for this binding mode',
  MALFORMED_HOLDER_DID_URL: 'The holder DID URL is malformed',
  CONFLICTING_HOLDER_DID_URL: 'Conflicting holder DID URLs were supplied',
  CONFLICTING_BINDING_POLICY: 'Conflicting binding policies were supplied',
  INVALID_BINDING_OPTIONS:
    'The binding options are not valid for the selected mode',
  UNSUPPORTED_DID_METHOD: 'The DID method is not supported by this offer',
  UNSUPPORTED_PROOF_ALGORITHM:
    'The proof algorithm is not supported by this offer',
  INCOMPATIBLE_DID_METHOD_AND_ALGORITHM:
    'The DID method and proof algorithm are incompatible',
  DID_BINDING_NOT_SUPPORTED_FOR_FORMAT:
    'DID binding is not supported for this credential format',
  EMPTY_CREDENTIALS_TO_REQUEST: 'No credentials were selected',
  MISSING_CREDENTIAL_OFFER_URI: 'A credential offer URI is required',
}

export class HolderBindingError extends Error {
  readonly code: BindingErrorCode

  constructor(code: BindingErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'HolderBindingError'
    this.code = code
  }
}

/**
 * Labels and order are shared with the cloud-wallet UI (spec P-UI-07).
 * Fresh key is deliberately first: it is the privacy-preserving default.
 */
export const BINDING_MODE_OPTIONS = [
  { mode: 'new-key', label: 'Use a fresh key — recommended' },
  { mode: 'existing-did', label: 'Use an existing DID' },
] as const satisfies readonly {
  mode: CredentialBindingMode
  label: string
}[]

export const PRIMARY_DID_BADGE = 'suggested'

export const POLICY_OPTIONS = [
  { value: 'require', label: 'Fail if the DID is unavailable' },
  { value: 'prefer', label: 'Fall back to a fresh key' },
] as const satisfies readonly {
  value: CredentialBindingPolicy
  label: string
}[]

/** Wallet capabilities, in the implicit preference order from spec 6.2. */
export const WALLET_PROOF_ALGORITHMS = [
  'EdDSA',
  'ES256',
  'ES384',
  'ES512',
  'RS256',
  'PS256',
] as const

const WALLET_FRESH_KEY_DID_METHODS = ['did:jwk', 'did:key'] as const
const RSA_ALGORITHMS = ['RS256', 'PS256'] as const
const DID_URL_PATTERN = /^did:[a-z0-9]+:.+$/i

const uniqueStrings = (values: string[]): string[] =>
  Array.from(new Set(values))

const isLdpVcFormat = (format: string): boolean =>
  format === 'ldp_vc' || format === 'jwt_vc_json-ld'

const isMsoMdocFormat = (format: string): boolean => format === 'mso_mdoc'

const readMetadata = (
  offer: ResolvedHolderOffer,
): HolderOfferMetadata | undefined => offer.issuerMetadata ?? offer.metadata

export const getOfferedFormats = (offer: ResolvedHolderOffer): string[] => {
  const metadata = readMetadata(offer)
  const configurations = metadata?.credentialConfigurationsSupported ?? {}

  return uniqueStrings(
    offer.credentialsToRequest
      .map((id) => configurations[id]?.format)
      .filter((format): format is string => Boolean(format)),
  )
}

export const getAllowedDidMethods = (offer: ResolvedHolderOffer): string[] => {
  const metadata = readMetadata(offer)
  const configurations = metadata?.credentialConfigurationsSupported ?? {}
  const formats = getOfferedFormats(offer)
  const advertised = uniqueStrings([
    ...(metadata?.cryptographic_binding_methods_supported ?? []),
    ...offer.credentialsToRequest.flatMap(
      (id) => configurations[id]?.cryptographic_binding_methods_supported ?? [],
    ),
  ])

  const walletMethods: string[] = [...WALLET_FRESH_KEY_DID_METHODS]
  if (formats.some(isMsoMdocFormat)) {
    walletMethods.push('jwk')
  }

  const allowed = walletMethods.filter((method) => advertised.includes(method))
  if (allowed.length > 0) {
    return allowed
  }

  // Spec P-FK-09 / 6.2: nothing advertised -> did:key (plain JWK for mdoc,
  // did:key for W3C LDP VC because Credo rejects fresh plain-JWK binding).
  return formats.length === 1 && formats.some(isMsoMdocFormat)
    ? ['jwk']
    : ['did:key']
}

export const getAllowedProofAlgorithms = (
  offer: ResolvedHolderOffer,
): string[] => {
  const metadata = readMetadata(offer)
  const configurations = metadata?.credentialConfigurationsSupported ?? {}
  const advertised = uniqueStrings([
    ...(metadata?.proof_types_supported?.jwt
      ?.proof_signing_alg_values_supported ?? []),
    ...offer.credentialsToRequest.flatMap(
      (id) =>
        configurations[id]?.proof_types_supported?.jwt
          ?.proof_signing_alg_values_supported ?? [],
    ),
  ])

  const allowed = WALLET_PROOF_ALGORITHMS.filter((alg) =>
    advertised.includes(alg),
  )

  // Metadata may omit proof algorithms; offer wallet defaults rather than an
  // empty selector so a fresh-key request can still be submitted.
  return allowed.length > 0 ? allowed : ['EdDSA', 'ES256']
}

export const getDidMethodFromUrl = (didUrl: string): string | undefined =>
  didUrl.match(/^(did:[a-z0-9]+:)/i)?.[1]?.toLowerCase()

const isIncompatibleDidMethodAndAlgorithm = (
  didMethod: string,
  signatureAlgorithm: string,
): boolean => {
  const method = didMethod.toLowerCase()
  return (
    method === 'did:key' &&
    (RSA_ALGORITHMS as readonly string[]).includes(signatureAlgorithm)
  )
}

/**
 * Primary DID is a suggestion only. It is pre-filled inside the explicit
 * existing-DID mode, never selected by default (spec 6.3 / P-UI-04).
 */
export const getInitialBindingSelection = (options: {
  primaryDidUrl?: string | null
  offer?: ResolvedHolderOffer
}): BindingSelection => {
  const didMethods = options.offer ? getAllowedDidMethods(options.offer) : []
  const algorithms = options.offer
    ? getAllowedProofAlgorithms(options.offer)
    : []

  return {
    mode: 'new-key',
    didMethod: didMethods[0],
    signatureAlgorithm: algorithms[0],
  }
}

export const getExistingDidSelection = (
  primaryDidUrl: string,
  policy: CredentialBindingPolicy = 'require',
): BindingSelection => ({
  mode: 'existing-did',
  holderDidUrl: primaryDidUrl,
  policy,
})

export interface BindingValidation {
  valid: boolean
  errors: BindingErrorCode[]
}

export const validateBindingSelection = (
  selection: BindingSelection,
  offer: ResolvedHolderOffer,
): BindingValidation => {
  const errors: BindingErrorCode[] = []
  const formats = getOfferedFormats(offer)

  if (
    !(BINDING_MODE_OPTIONS as readonly { mode: string }[]).some(
      (option) => option.mode === selection.mode,
    )
  ) {
    errors.push('INVALID_BINDING_MODE')
  }

  if (selection.mode === 'existing-did') {
    const didUrl = selection.holderDidUrl?.trim()

    if (!didUrl) {
      errors.push('MISSING_HOLDER_DID_URL')
    } else if (!DID_URL_PATTERN.test(didUrl)) {
      errors.push('MALFORMED_HOLDER_DID_URL')
    } else if (formats.some(isMsoMdocFormat)) {
      errors.push('DID_BINDING_NOT_SUPPORTED_FOR_FORMAT')
    }
  } else {
    const didMethods = getAllowedDidMethods(offer)
    const algorithms = getAllowedProofAlgorithms(offer)

    if (selection.didMethod && !didMethods.includes(selection.didMethod)) {
      errors.push('UNSUPPORTED_DID_METHOD')
    }
    if (
      selection.signatureAlgorithm &&
      !algorithms.includes(selection.signatureAlgorithm)
    ) {
      errors.push('UNSUPPORTED_PROOF_ALGORITHM')
    }
    if (
      selection.didMethod &&
      selection.signatureAlgorithm &&
      isIncompatibleDidMethodAndAlgorithm(
        selection.didMethod,
        selection.signatureAlgorithm,
      )
    ) {
      errors.push('INCOMPATIBLE_DID_METHOD_AND_ALGORITHM')
    }
    if (selection.didMethod === 'jwk' && formats.some(isLdpVcFormat)) {
      errors.push('DID_BINDING_NOT_SUPPORTED_FOR_FORMAT')
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Serialize a UI selection. Fresh-key requests deliberately omit the flat
 * holderDidUrl field entirely, even when a primary DID suggestion is present.
 */
export const buildBindingOptions = (
  selection: BindingSelection,
): CredentialBindingOptions => {
  if (selection.mode === 'new-key') {
    return {
      mode: 'new-key',
      ...(selection.didMethod ? { didMethod: selection.didMethod } : {}),
      ...(selection.signatureAlgorithm
        ? { signatureAlgorithm: selection.signatureAlgorithm }
        : {}),
    }
  }

  return {
    mode: 'existing-did',
    holderDidUrl: selection.holderDidUrl?.trim() ?? '',
    policy: selection.policy ?? 'require',
  }
}

export const buildCredentialRequest = (
  offer: ResolvedHolderOffer,
  selection: BindingSelection,
  extras: Pick<
    HolderCredentialRequestPayload,
    'authorizationCode' | 'codeVerifier' | 'txCode' | 'sendNotification'
  > = {},
): HolderCredentialRequestPayload => ({
  credentialOfferUri: offer.credentialOfferUri,
  credentialsToRequest: [...offer.credentialsToRequest],
  ...(offer.txCode ? { txCode: offer.txCode } : {}),
  ...extras,
  binding: buildBindingOptions(selection),
})

export const getConfirmationSummary = (
  selection: BindingSelection,
  primaryDidUrl?: string | null,
): string[] => {
  if (selection.mode === 'new-key') {
    return [
      'Use a fresh key — recommended',
      `DID method: ${selection.didMethod ?? 'automatic'}`,
      `Proof algorithm: ${selection.signatureAlgorithm ?? 'automatic'}`,
    ]
  }

  const didUrl = selection.holderDidUrl?.trim() ?? ''
  const suggested =
    Boolean(primaryDidUrl) && didUrl === primaryDidUrl ? ' (suggested)' : ''
  const policyLabel =
    POLICY_OPTIONS.find(
      (option) => option.value === (selection.policy ?? 'require'),
    )?.label ?? POLICY_OPTIONS[0].label

  return [
    'Use an existing DID',
    `DID: ${didUrl}${suggested}`,
    `Binding policy: ${policyLabel}`,
  ]
}

/** Validate an inbound request before any token is redeemed (spec 5.1). */
export const assertValidHolderCredentialRequest = (
  payload: HolderCredentialRequestPayload,
): void => {
  if (
    !Array.isArray(payload.credentialsToRequest) ||
    payload.credentialsToRequest.length === 0
  ) {
    throw new HolderBindingError('EMPTY_CREDENTIALS_TO_REQUEST')
  }

  const { binding } = payload
  if (binding) {
    if (
      !(BINDING_MODE_OPTIONS as readonly { mode: string }[]).some(
        (option) => option.mode === binding.mode,
      )
    ) {
      throw new HolderBindingError('INVALID_BINDING_MODE')
    }

    if (
      payload.holderDidUrl &&
      binding.holderDidUrl &&
      payload.holderDidUrl.trim() !== binding.holderDidUrl.trim()
    ) {
      throw new HolderBindingError('CONFLICTING_HOLDER_DID_URL')
    }

    if (
      payload.bindingPolicy &&
      binding.policy &&
      payload.bindingPolicy !== binding.policy
    ) {
      throw new HolderBindingError('CONFLICTING_BINDING_POLICY')
    }

    if (binding.mode === 'new-key') {
      if (binding.holderDidUrl || payload.holderDidUrl) {
        throw new HolderBindingError('CONFLICTING_HOLDER_DID_URL')
      }
      if (binding.policy) {
        throw new HolderBindingError('INVALID_BINDING_OPTIONS')
      }
    } else {
      const didUrl = binding.holderDidUrl ?? payload.holderDidUrl
      if (!didUrl?.trim()) {
        throw new HolderBindingError('MISSING_HOLDER_DID_URL')
      }
      if (!DID_URL_PATTERN.test(didUrl.trim())) {
        throw new HolderBindingError('MALFORMED_HOLDER_DID_URL')
      }
      if (binding.didMethod || binding.signatureAlgorithm) {
        throw new HolderBindingError('INVALID_BINDING_OPTIONS')
      }
    }
  } else if (
    payload.holderDidUrl &&
    !DID_URL_PATTERN.test(payload.holderDidUrl.trim())
  ) {
    throw new HolderBindingError('MALFORMED_HOLDER_DID_URL')
  }
}
