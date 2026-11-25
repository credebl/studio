/* eslint-disable camelcase -- OID4VC wire metadata uses snake_case field names */
import {
  BINDING_ERROR_MESSAGES,
  BINDING_MODE_OPTIONS,
  type BindingSelection,
  type CredentialBindingMode,
  HolderBindingError,
  POLICY_OPTIONS,
  PRIMARY_DID_BADGE,
  type ResolvedHolderOffer,
  assertValidHolderCredentialRequest,
  buildCredentialRequest,
  getAllowedDidMethods,
  getAllowedProofAlgorithms,
  getConfirmationSummary,
  getExistingDidSelection,
  getInitialBindingSelection,
  validateBindingSelection,
} from '@/lib/holderBinding'
import { describe, expect, it } from 'vitest'

const PRIMARY_DID = 'did:web:holder.example.com#key-1'

const makeOffer = (
  overrides: Partial<ResolvedHolderOffer> = {},
): ResolvedHolderOffer => ({
  credentialOfferUri: 'openid-credential-offer://?credential_offer=abc',
  credentialsToRequest: ['person-sdjwt'],
  issuerMetadata: {
    credentialConfigurationsSupported: {
      'person-sdjwt': {
        format: 'dc+sd-jwt',
        cryptographic_binding_methods_supported: ['did:jwk', 'did:key'],
        proof_types_supported: {
          jwt: {
            proof_signing_alg_values_supported: ['ES256', 'EdDSA', 'RS256'],
          },
        },
      },
    },
  },
  ...overrides,
})

const makeSelection = (
  overrides: Partial<BindingSelection> = {},
): BindingSelection => ({
  mode: 'new-key',
  didMethod: 'did:jwk',
  signatureAlgorithm: 'EdDSA',
  ...overrides,
})

describe('holder binding defaults and labels', () => {
  it('P-UI-04 keeps fresh key selected even when a primary DID exists', () => {
    const selection = getInitialBindingSelection({
      primaryDidUrl: PRIMARY_DID,
      offer: makeOffer(),
    })

    expect(selection.mode).toBe('new-key')
    expect(selection).not.toHaveProperty('holderDidUrl')
  })

  it('P-UI-07 renders the shared labels and ordering', () => {
    expect(
      BINDING_MODE_OPTIONS.map((option) => [option.mode, option.label]),
    ).toEqual([
      ['new-key', 'Use a fresh key — recommended'],
      ['existing-did', 'Use an existing DID'],
    ])
    expect(POLICY_OPTIONS.map((option) => option.value)).toEqual([
      'require',
      'prefer',
    ])
    expect(PRIMARY_DID_BADGE).toBe('suggested')
  })

  it('N-P-03 never labels the primary DID as required or default', () => {
    const labels = [
      ...BINDING_MODE_OPTIONS.map((option) => option.label),
      ...POLICY_OPTIONS.map((option) => option.label),
      ...getConfirmationSummary(
        getExistingDidSelection(PRIMARY_DID),
        PRIMARY_DID,
      ),
    ].join(' ')

    expect(labels).toContain('suggested')
    expect(labels).not.toMatch(/\brequired\b/i)
    expect(labels).not.toMatch(/\bdefault\b/i)
  })
})

describe('offer-driven advanced controls', () => {
  it('P-UI-05 only exposes methods and algorithms allowed by metadata', () => {
    const offer = makeOffer()

    expect(getAllowedDidMethods(offer)).toEqual(['did:jwk', 'did:key'])
    expect(getAllowedProofAlgorithms(offer)).toEqual([
      'EdDSA',
      'ES256',
      'RS256',
    ])
  })

  it('P-UI-05 excludes unsupported methods and algorithms in every mode', () => {
    const offer = makeOffer({
      issuerMetadata: {
        credentialConfigurationsSupported: {
          'person-sdjwt': {
            format: 'ldp_vc',
            cryptographic_binding_methods_supported: ['jwk', 'did:web'],
            proof_types_supported: {
              jwt: {
                proof_signing_alg_values_supported: ['PS256'],
              },
            },
          },
        },
      },
    })

    expect(getAllowedDidMethods(offer)).toEqual(['did:key'])
    expect(getAllowedProofAlgorithms(offer)).toEqual(['PS256'])
    expect(getAllowedProofAlgorithms(offer)).not.toContain('EdDSA')
  })
})

describe('confirmation summary and submit validity', () => {
  it('P-UI-06 shows the selected binding before submit', () => {
    expect(getConfirmationSummary(makeSelection(), PRIMARY_DID)).toEqual([
      'Use a fresh key — recommended',
      'DID method: did:jwk',
      'Proof algorithm: EdDSA',
    ])
    expect(
      getConfirmationSummary(getExistingDidSelection(PRIMARY_DID), PRIMARY_DID),
    ).toEqual([
      'Use an existing DID',
      `DID: ${PRIMARY_DID} (suggested)`,
      'Binding policy: Fail if the DID is unavailable',
    ])
  })

  it('P-UI-08 disables submit for an unsupported algorithm', () => {
    const validation = validateBindingSelection(
      makeSelection({ signatureAlgorithm: 'PS256' }),
      makeOffer(),
    )

    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain('UNSUPPORTED_PROOF_ALGORITHM')
  })

  it('P-UI-08 disables submit for mso_mdoc with an existing DID', () => {
    const offer = makeOffer({
      issuerMetadata: {
        credentialConfigurationsSupported: {
          mdl: {
            format: 'mso_mdoc',
            cryptographic_binding_methods_supported: ['jwk'],
            proof_types_supported: {
              jwt: { proof_signing_alg_values_supported: ['ES256'] },
            },
          },
        },
      },
      credentialsToRequest: ['mdl'],
    })

    const validation = validateBindingSelection(
      getExistingDidSelection(PRIMARY_DID),
      offer,
    )

    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain('DID_BINDING_NOT_SUPPORTED_FOR_FORMAT')
  })
})

describe('privacy-preserving request serialization', () => {
  it('P-FK-16 sends a new-key binding and omits holderDidUrl', () => {
    const offer = makeOffer()
    const selection = getInitialBindingSelection({
      primaryDidUrl: PRIMARY_DID,
      offer,
    })
    const payload = buildCredentialRequest(offer, selection, {
      sendNotification: true,
    })

    expect(payload.binding).toEqual({
      mode: 'new-key',
      didMethod: 'did:jwk',
      signatureAlgorithm: 'EdDSA',
    })
    expect(payload).not.toHaveProperty('holderDidUrl')
    expect(JSON.stringify(payload)).not.toContain(PRIMARY_DID)
  })

  it('P-ED-11 sends a prefilled primary DID only in existing-did mode', () => {
    const offer = makeOffer()
    const payload = buildCredentialRequest(
      offer,
      getExistingDidSelection(PRIMARY_DID),
    )

    expect(payload.binding).toEqual({
      mode: 'existing-did',
      holderDidUrl: PRIMARY_DID,
      policy: 'require',
    })
    expect(payload).not.toHaveProperty('holderDidUrl')
  })

  it('N-P-01 includes the primary DID only when the user opts in', () => {
    const offer = makeOffer()
    const freshPayload = buildCredentialRequest(
      offer,
      getInitialBindingSelection({ primaryDidUrl: PRIMARY_DID, offer }),
    )
    const existing = JSON.stringify(
      buildCredentialRequest(offer, getExistingDidSelection(PRIMARY_DID)),
    )

    expect(JSON.stringify(freshPayload)).not.toContain(PRIMARY_DID)
    expect(freshPayload).not.toHaveProperty('holderDidUrl')
    expect(existing).toContain(PRIMARY_DID)
  })
})

describe('validation taxonomy (N-V)', () => {
  const expectInvalid = (
    selection: BindingSelection,
    offer: ResolvedHolderOffer,
    code: string,
  ): void => {
    const validation = validateBindingSelection(selection, offer)
    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain(code)
    expect(
      BINDING_ERROR_MESSAGES[code as keyof typeof BINDING_ERROR_MESSAGES],
    ).toBeTypeOf('string')
  }

  it('N-V-01 rejects an unknown binding mode', () => {
    expectInvalid(
      makeSelection({ mode: 'bogus' as CredentialBindingMode }),
      makeOffer(),
      'INVALID_BINDING_MODE',
    )
    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: ['person-sdjwt'],
        binding: {
          mode: 'bogus' as CredentialBindingMode,
          didMethod: 'did:key',
        },
      }),
    ).toThrow(HolderBindingError)
  })

  it('N-V-02 requires a DID URL in existing-did mode', () => {
    expectInvalid(
      makeSelection({ mode: 'existing-did' }),
      makeOffer(),
      'MISSING_HOLDER_DID_URL',
    )
    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: ['person-sdjwt'],
        binding: { mode: 'existing-did' },
      }),
    ).toThrow(/MISSING_HOLDER_DID_URL/)
  })

  it('N-V-03 rejects conflicting flat and nested DID URLs', () => {
    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: ['person-sdjwt'],
        holderDidUrl: 'did:key:z6Mkflat',
        binding: { mode: 'existing-did', holderDidUrl: PRIMARY_DID },
      }),
    ).toThrow(/CONFLICTING_HOLDER_DID_URL/)
  })

  it('N-V-04 and N-V-05 reject new-key options in existing-did mode', () => {
    for (const extra of [
      { didMethod: 'did:key' },
      { signatureAlgorithm: 'EdDSA' },
    ]) {
      expect(() =>
        assertValidHolderCredentialRequest({
          credentialOfferUri: 'uri',
          credentialsToRequest: ['person-sdjwt'],
          binding: {
            mode: 'existing-did',
            holderDidUrl: PRIMARY_DID,
            ...extra,
          },
        }),
      ).toThrow(/INVALID_BINDING_OPTIONS/)
    }
  })

  it('N-V-06 rejects a DID URL in new-key mode', () => {
    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: ['person-sdjwt'],
        binding: { mode: 'new-key', holderDidUrl: PRIMARY_DID },
      }),
    ).toThrow(/CONFLICTING_HOLDER_DID_URL/)

    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: ['person-sdjwt'],
        holderDidUrl: PRIMARY_DID,
        binding: { mode: 'new-key' },
      }),
    ).toThrow(/CONFLICTING_HOLDER_DID_URL/)
  })

  it('N-V-07 and N-V-08 reject unsupported methods and algorithms', () => {
    expectInvalid(
      makeSelection({ didMethod: 'did:web' }),
      makeOffer(),
      'UNSUPPORTED_DID_METHOD',
    )
    expectInvalid(
      makeSelection({ signatureAlgorithm: 'PS256' }),
      makeOffer(),
      'UNSUPPORTED_PROOF_ALGORITHM',
    )
  })

  it('N-V-09 rejects did:key with an RSA algorithm', () => {
    expectInvalid(
      makeSelection({ didMethod: 'did:key', signatureAlgorithm: 'RS256' }),
      makeOffer(),
      'INCOMPATIBLE_DID_METHOD_AND_ALGORITHM',
    )
  })

  it('N-V-10 rejects DID binding for mso_mdoc', () => {
    const offer = makeOffer({
      credentialsToRequest: ['mdl'],
      issuerMetadata: {
        credentialConfigurationsSupported: {
          mdl: {
            format: 'mso_mdoc',
            cryptographic_binding_methods_supported: ['jwk'],
            proof_types_supported: {
              jwt: { proof_signing_alg_values_supported: ['ES256'] },
            },
          },
        },
      },
    })

    expectInvalid(
      getExistingDidSelection(PRIMARY_DID),
      offer,
      'DID_BINDING_NOT_SUPPORTED_FOR_FORMAT',
    )
  })

  it('N-V-11 rejects plain JWK fresh binding for ldp_vc', () => {
    const offer = makeOffer({
      issuerMetadata: {
        credentialConfigurationsSupported: {
          degree: {
            format: 'ldp_vc',
            cryptographic_binding_methods_supported: ['jwk', 'did:key'],
            proof_types_supported: {
              jwt: { proof_signing_alg_values_supported: ['EdDSA'] },
            },
          },
        },
      },
      credentialsToRequest: ['degree'],
    })

    expectInvalid(
      makeSelection({ didMethod: 'jwk', signatureAlgorithm: 'EdDSA' }),
      offer,
      'DID_BINDING_NOT_SUPPORTED_FOR_FORMAT',
    )
  })

  it('N-V-13 rejects a malformed DID URL', () => {
    expectInvalid(
      makeSelection({ mode: 'existing-did', holderDidUrl: 'not-a-did' }),
      makeOffer(),
      'MALFORMED_HOLDER_DID_URL',
    )
  })

  it('N-V-14 rejects an empty credentialsToRequest', () => {
    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: [],
      }),
    ).toThrow(/EMPTY_CREDENTIALS_TO_REQUEST/)
  })

  it('accepts the backward-compatible flat holderDidUrl form', () => {
    expect(() =>
      assertValidHolderCredentialRequest({
        credentialOfferUri: 'uri',
        credentialsToRequest: ['person-sdjwt'],
        holderDidUrl: PRIMARY_DID,
        bindingPolicy: 'prefer',
      }),
    ).not.toThrow()
  })
})
