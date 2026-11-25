import {
  buildCreateIssuerPayload,
  generateIssuerKey,
  getCreateIssuerErrors,
  isValidHttpUrl,
} from '@/features/oid4vc/utils/createIssuer'
import { describe, expect, it } from 'vitest'

const validFields = {
  name: 'Credebl University',
  description: 'Issues verified student credentials',
  logoLink: 'https://example.com/logo.svg',
  authorizationServerUrl: 'http://localhost:4002',
  locales: [],
}

describe('isValidHttpUrl', () => {
  it('accepts http and https URLs, including localhost', () => {
    expect(isValidHttpUrl('https://example.com/logo.svg')).toBe(true)
    expect(isValidHttpUrl('http://localhost:4002')).toBe(true)
  })

  it('rejects other protocols and malformed values', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false)
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isValidHttpUrl('not a url')).toBe(false)
    expect(isValidHttpUrl('')).toBe(false)
  })
})

describe('generateIssuerKey', () => {
  it('creates a unique id with a readable prefix', () => {
    const first = generateIssuerKey('Credebl Corp', 'University')
    const second = generateIssuerKey('Credebl Corp', 'University')

    expect(first).not.toBe(second)
    expect(first).toMatch(/^credebl-corp-university-[0-9a-f-]{36}-jwt-issuer$/)
  })

  it('does not produce a leading dash when the org name is missing', () => {
    expect(generateIssuerKey('', 'University')).toMatch(
      /^university-[0-9a-f-]{36}-jwt-issuer$/,
    )
  })
})

describe('getCreateIssuerErrors', () => {
  it('reports logo errors under the logo key', () => {
    const errors = getCreateIssuerErrors({
      ...validFields,
      logoLink: 'not a url',
    })

    expect(errors.logo).toBe('Please enter a valid URL')
    expect(errors.serverUrl).toBeUndefined()
  })

  it('requires the authorization server URL', () => {
    expect(
      getCreateIssuerErrors({
        ...validFields,
        authorizationServerUrl: '',
      }).authorizationServerUrl,
    ).toBe('Authorization server URL is required')
  })

  it('flags duplicate and incomplete locales', () => {
    const errors = getCreateIssuerErrors({
      ...validFields,
      locales: [
        { name: 'Université', description: 'Desc', locale: 'fr' },
        { name: '', description: '', locale: 'fr' },
      ],
    })

    expect(errors['locale-0-locale']).toBe('This locale is already in use')
    expect(errors['locale-1-locale']).toBe('This locale is already in use')
    expect(errors['locale-1-name']).toBe('Name is required')
    expect(errors['locale-1-description']).toBe('Description is required')
  })
})

describe('buildCreateIssuerPayload', () => {
  it('includes the authorization server URL and all display entries', () => {
    const payload = buildCreateIssuerPayload('Credebl Corp', {
      ...validFields,
      locales: [{ name: 'Université', description: 'Desc', locale: 'fr' }],
    })

    expect(payload.authorizationServerUrl).toBe('http://localhost:4002')
    expect(payload.display).toHaveLength(2)
    expect(payload.display[0]).toMatchObject({
      locale: 'en',
      name: 'Credebl University',
    })
    expect(payload.display[1]).toMatchObject({
      locale: 'fr',
      name: 'Université',
    })
    expect(payload.issuerId).toMatch(/^credebl-corp-credebl-university-/)
  })
})
