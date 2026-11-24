import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse } from './helpers'
import { resolvePlatformAccess } from '@/utils/authOptions'

vi.mock('@/app/api/server/encryption', () => ({
  passwordEncryption: (value: string): string => `encrypted:${value}`,
}))

let fetchMock: Mock<typeof fetch> = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
})

const profile = (userOrgRoles: unknown[]): Response =>
  jsonResponse({ data: { userOrgRoles } })

const role = (
  name: string,
  orgId: string | null = null,
): Record<string, unknown> => ({
  orgId,
  orgRole: { name },
})

describe('resolvePlatformAccess', () => {
  it('treats the holder role as a user capability, not org access', async () => {
    fetchMock.mockResolvedValueOnce(profile([role('holder')]))

    await expect(resolvePlatformAccess('token')).resolves.toEqual({
      isPlatformAdmin: false,
      hasOrgAccess: false,
      hasHolderAccess: true,
    })

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer token',
    })
  })

  it('keeps three independent claims for a dual-role user', async () => {
    fetchMock.mockResolvedValueOnce(
      profile([role('holder'), role('issuer', 'org-1')]),
    )

    await expect(resolvePlatformAccess('token')).resolves.toEqual({
      isPlatformAdmin: false,
      hasOrgAccess: true,
      hasHolderAccess: true,
    })
  })

  it('does not grant org access to ecosystem-only roles', async () => {
    fetchMock.mockResolvedValueOnce(profile([role('Ecosystem Lead')]))

    await expect(resolvePlatformAccess('token')).resolves.toEqual({
      isPlatformAdmin: false,
      hasOrgAccess: false,
      hasHolderAccess: false,
    })
  })

  it('preserves admin-only behaviour', async () => {
    fetchMock.mockResolvedValueOnce(profile([role('platform_admin')]))

    await expect(resolvePlatformAccess('token')).resolves.toEqual({
      isPlatformAdmin: true,
      hasOrgAccess: false,
      hasHolderAccess: false,
    })
  })

  it('fails closed when the profile lookup fails', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(resolvePlatformAccess('token')).resolves.toBeNull()
  })

  it('detects a holder from the wallet probe when the profile is forbidden', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse({}, 404))

    await expect(resolvePlatformAccess('token')).resolves.toEqual({
      isPlatformAdmin: false,
      hasOrgAccess: false,
      hasHolderAccess: true,
    })

    expect(fetchMock.mock.calls[1]?.[0]).toContain('/did')
  })

  it('does not grant holder access when the wallet probe is forbidden', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse({}, 403))

    await expect(resolvePlatformAccess('token')).resolves.toEqual({
      isPlatformAdmin: false,
      hasOrgAccess: false,
      hasHolderAccess: false,
    })
  })
})
