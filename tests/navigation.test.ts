import { describe, expect, it } from 'vitest'
import { getActiveNavGroup, isNavItemActive, navItems } from '@/constants/data'
import { NavItem } from '../types'

const credentialsGroup = navItems.find((item) => item.title === 'Credentials')

if (!credentialsGroup?.items) {
  throw new Error('Credentials navigation group is missing')
}

const credentialItems: NavItem[] = credentialsGroup.items

const credentialItem = (url: string): NavItem => {
  const item = credentialItems.find((candidate) => candidate.url === url)
  if (!item) {
    throw new Error(`Missing credential navigation item: ${url}`)
  }
  return item
}

describe('sidebar navigation structure', () => {
  it('groups all credential flows under Credentials', () => {
    expect(credentialItems.map((item) => item.title)).toEqual([
      'Issued credentials',
      'Issue via DIDComm',
      'Verify via DIDComm',
      'OID4VC issuance',
    ])
    expect(credentialItems.map((item) => item.url)).toEqual([
      '/credentials',
      '/credentials/issue',
      '/verification',
      '/oid4vc/issuers',
    ])
  })

  it('removes Trust and exposes x509 certificates at the top level', () => {
    expect(navItems.some((item) => item.title === 'Trust')).toBe(false)
    expect(navItems.some((item) => item.url === '/x509-certificate')).toBe(true)
  })

  it('keeps command bar shortcuts unique', () => {
    const shortcuts = navItems
      .flatMap((item) => [
        item.shortcut,
        ...(item.items ?? []).map((child) => child.shortcut),
      ])
      .filter(
        (shortcut): shortcut is [string, string] => shortcut !== undefined,
      )
      .map((shortcut) => shortcut.join(''))

    expect(new Set(shortcuts).size).toBe(shortcuts.length)
  })
})

describe('isNavItemActive', () => {
  it('does not mark issued credentials active on nested issuance routes', () => {
    expect(
      isNavItemActive(
        '/credentials/issue/schemas',
        credentialItem('/credentials'),
      ),
    ).toBe(false)
  })

  it('matches nested DIDComm issuance and verification routes', () => {
    expect(
      isNavItemActive(
        '/credentials/issue/email',
        credentialItem('/credentials/issue'),
      ),
    ).toBe(true)
    expect(
      isNavItemActive(
        '/verification/verify-credentials',
        credentialItem('/verification'),
      ),
    ).toBe(true)
  })

  it('matches both OID4VC list and create routes', () => {
    const item = credentialItem('/oid4vc/issuers')

    expect(isNavItemActive('/oid4vc/issuers', item)).toBe(true)
    expect(isNavItemActive('/oid4vc/create-issuer', item)).toBe(true)
  })
})

describe('getActiveNavGroup', () => {
  it('returns Credentials for every credential route', () => {
    expect(getActiveNavGroup(navItems, '/credentials')).toBe('Credentials')
    expect(getActiveNavGroup(navItems, '/credentials/issue')).toBe(
      'Credentials',
    )
    expect(getActiveNavGroup(navItems, '/verification')).toBe('Credentials')
    expect(getActiveNavGroup(navItems, '/oid4vc/issuers')).toBe('Credentials')
  })

  it('returns undefined for top-level routes without children', () => {
    expect(getActiveNavGroup(navItems, '/dashboard')).toBeUndefined()
    expect(getActiveNavGroup(navItems, '/x509-certificate')).toBeUndefined()
  })
})
