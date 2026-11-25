import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getPlatformAdminSession,
  getPlatformInvitations,
} from '@/lib/server/admin'
import { GET } from '@/app/api/admin/invitations/route'
import { NextRequest } from 'next/server'
import { makeSession } from './helpers'

vi.mock('@/lib/server/admin', () => ({
  getPlatformAdminSession: vi.fn(),
  getPlatformInvitations: vi.fn(),
}))

const makeRequest = (query = ''): NextRequest =>
  new NextRequest(`http://localhost/api/admin/invitations${query}`)

beforeEach(() => {
  vi.mocked(getPlatformAdminSession).mockResolvedValue(makeSession())
  vi.mocked(getPlatformInvitations).mockResolvedValue({
    data: [],
    totalPages: 1,
  })
})

describe('GET /api/admin/invitations', () => {
  it('returns 403 without a platform-admin session', async () => {
    vi.mocked(getPlatformAdminSession).mockResolvedValue(null)

    const response = await GET(makeRequest('?page=1'))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ message: 'Forbidden' })
    expect(getPlatformInvitations).not.toHaveBeenCalled()
  })

  it('returns 403 when the guard resolves a non-admin session to null', async () => {
    vi.mocked(getPlatformAdminSession).mockResolvedValue(null)

    const response = await GET(makeRequest())

    expect(response.status).toBe(403)
    expect(getPlatformAdminSession).toHaveBeenCalledTimes(1)
    expect(getPlatformInvitations).not.toHaveBeenCalled()
  })

  it('uses safe defaults for missing or non-numeric paging params', async () => {
    await GET(makeRequest('?page=nope&pageSize=also-nope'))

    expect(getPlatformInvitations).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      search: '',
    })
  })

  it('clamps the page, page size and search length', async () => {
    const search = 'x'.repeat(200)

    await GET(makeRequest(`?page=0&pageSize=999&search=${search}`))

    expect(getPlatformInvitations).toHaveBeenCalledWith({
      page: 1,
      pageSize: 50,
      search: 'x'.repeat(100),
    })
  })

  it('truncates fractional paging params instead of passing them through', async () => {
    await GET(makeRequest('?page=2.9&pageSize=4.7'))

    expect(getPlatformInvitations).toHaveBeenCalledWith({
      page: 2,
      pageSize: 4,
      search: '',
    })
  })

  it('marks the response as non-cacheable', async () => {
    const response = await GET(makeRequest())

    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('returns the paginated payload for admins', async () => {
    vi.mocked(getPlatformInvitations).mockResolvedValue({
      data: [],
      totalPages: 3,
    })

    const response = await GET(makeRequest('?page=2&pageSize=5'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: [],
      totalPages: 3,
    })
  })
})
