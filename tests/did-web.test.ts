import { buildDidWebIdentifier, didWebToUrl } from '@/lib/did'
import { describe, expect, it } from 'vitest'

describe('buildDidWebIdentifier', () => {
  it('returns the bare domain when there is no path', () => {
    expect(buildDidWebIdentifier('example.com')).toEqual({
      ok: true,
      identifier: 'example.com',
    })
  })

  it('joins folders with colons', () => {
    expect(
      buildDidWebIdentifier('ayanworks.github.io', 'iec/0522012345'),
    ).toEqual({ ok: true, identifier: 'ayanworks.github.io:iec:0522012345' })
  })

  it('cleans a pasted URL, slashes and did.json', () => {
    expect(
      buildDidWebIdentifier(
        'https://Ayanworks.github.io',
        '/iec/0522012345/did.json',
      ),
    ).toEqual({ ok: true, identifier: 'ayanworks.github.io:iec:0522012345' })
  })

  it('encodes a port', () => {
    expect(buildDidWebIdentifier('localhost:3000', 'a')).toEqual({
      ok: true,
      identifier: 'localhost%3A3000:a',
    })
  })

  it('rejects folders in the domain, bad hosts and bad segments', () => {
    expect(buildDidWebIdentifier('example.com/iec').ok).toBe(false)
    expect(buildDidWebIdentifier('not a domain').ok).toBe(false)
    expect(buildDidWebIdentifier('example.com', 'a b').ok).toBe(false)
    expect(buildDidWebIdentifier('example.com', '../x').ok).toBe(false)
    expect(buildDidWebIdentifier('').ok).toBe(false)
  })

  it('round-trips to the hosting URL', () => {
    const result = buildDidWebIdentifier(
      'ayanworks.github.io',
      'iec/1258457256',
    )
    expect(result.ok && didWebToUrl(`did:web:${result.identifier}`)).toBe(
      'https://ayanworks.github.io/iec/1258457256/did.json',
    )
  })
})
