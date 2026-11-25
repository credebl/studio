import { describe, expect, it, vi } from 'vitest'
import {
  getHolderConnections,
  getHolderProofs,
  listHolderCredentials,
} from '@/lib/server/holder'
import { getHolderOverviewData } from '@/lib/server/holder-overview'

vi.mock('@/lib/server/holder', () => ({
  getHolderConnections: vi.fn(),
  getHolderProofs: vi.fn(),
  listHolderCredentials: vi.fn(),
}))

describe('getHolderOverviewData', () => {
  it('keeps the available sources when one endpoint fails', async () => {
    vi.mocked(listHolderCredentials).mockImplementation((format) => {
      if (format === 'w3c-vc') {
        return Promise.reject(new Error('service unavailable'))
      }
      return Promise.resolve([
        { id: `${format}-1`, createdAt: '2026-11-24T10:00:00.000Z' },
      ])
    })
    vi.mocked(getHolderProofs).mockResolvedValue([
      { id: 'proof-1', state: 'requestReceived' },
    ])
    vi.mocked(getHolderConnections).mockResolvedValue([
      { id: 'conn-1', alias: 'Alice', state: 'connected' },
    ])

    const data = await getHolderOverviewData()

    expect(data.credentialAvailability).toEqual({
      'sd-jwt-vc': true,
      // eslint-disable-next-line camelcase
      mso_mdoc: true,
      'w3c-vc': false,
    })
    expect(data.credentials['sd-jwt-vc']).toMatchObject([{ id: 'sd-jwt-vc-1' }])
    expect(data.credentials['w3c-vc']).toEqual([])
    expect(data.proofsAvailable).toBe(true)
    expect(data.proofs).toMatchObject([
      { id: 'proof-1', state: 'requestReceived' },
    ])
    expect(data.connectionsAvailable).toBe(true)
    expect(data.connections).toMatchObject([
      { id: 'conn-1', label: 'Alice', state: 'connected' },
    ])
  })
})
