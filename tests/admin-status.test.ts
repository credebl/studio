import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkDefinitions,
  getServiceStatusReport,
  stateFromStatus,
  uncheckableServices,
} from '@/lib/server/admin-status'
import { adminNavGroups } from '@/components/layout/admin-nav'
import { jsonResponse } from './helpers'

const platformFetch = vi.hoisted(() => vi.fn())
const loadSessionTokens = vi.hoisted(() => vi.fn())

vi.mock('@/lib/server/platform', () => ({ platformFetch, loadSessionTokens }))

const fetchMock = platformFetch as Mock<
  (path: string) => Promise<Response | null>
>
const rootFetch = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  loadSessionTokens.mockReset()
  loadSessionTokens.mockResolvedValue({ token: 't', refreshToken: 'r' })
  rootFetch.mockReset()
  vi.stubGlobal('fetch', rootFetch)
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'http://gateway.test')
})

describe('stateFromStatus', () => {
  it('treats an answer, including 404 and 302, as operational', () => {
    for (const status of [200, 204, 302, 400, 404]) {
      expect(stateFromStatus(status)).toBe('operational')
    }
  })

  it('treats 5xx and no answer as unavailable', () => {
    for (const status of [500, 502, 503, 504, null]) {
      expect(stateFromStatus(status)).toBe('unavailable')
    }
  })

  it('cannot tell when the call was refused before reaching the service', () => {
    expect(stateFromStatus(401)).toBe('unknown')
    expect(stateFromStatus(403)).toBe('unknown')
  })
})

describe('getServiceStatusReport', () => {
  it('checks every defined service and reports each separately', async () => {
    rootFetch.mockResolvedValue(new Response(null, { status: 302 }))
    fetchMock.mockImplementation(async (path: string) => {
      if (path.includes('platform-settings')) {
        return jsonResponse({}, 200)
      }
      if (path.includes('get-all-platform-organisations')) {
        return jsonResponse({}, 200)
      }
      return jsonResponse({}, 500)
    })

    const report = await getServiceStatusReport()

    expect(report.checks.map((check) => check.id)).toEqual(
      checkDefinitions.map((definition) => definition.id),
    )
    const byId = Object.fromEntries(
      report.checks.map((check) => [check.id, check.state]),
    )
    expect(byId).toEqual({
      'api-gateway': 'operational',
      'user-service': 'operational',
      'organization-service': 'operational',
      'platform-service': 'unavailable',
    })
    expect(Number.isNaN(Date.parse(report.checkedAt))).toBe(false)
    report.checks.forEach((check) => {
      expect(check.latencyMs).toBeGreaterThanOrEqual(0)
      expect(check.detail.length).toBeGreaterThan(0)
    })
  })

  it('does not follow the gateway redirect and calls the root path', async () => {
    rootFetch.mockResolvedValue(new Response(null, { status: 200 }))
    fetchMock.mockResolvedValue(jsonResponse({}, 200))

    await getServiceStatusReport()

    expect(rootFetch).toHaveBeenCalledWith(
      'http://gateway.test/',
      expect.objectContaining({ redirect: 'manual', cache: 'no-store' }),
    )
  })

  it('marks a service unavailable when the call throws or times out', async () => {
    rootFetch.mockRejectedValue(new Error('refused'))
    fetchMock.mockRejectedValue(new DOMException('timeout', 'TimeoutError'))

    const report = await getServiceStatusReport()

    expect(report.checks.every((check) => check.state === 'unavailable')).toBe(
      true,
    )
  })

  it('marks a service unavailable when there is no answer at all', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', '')
    fetchMock.mockResolvedValue(null)

    const report = await getServiceStatusReport()

    expect(report.checks.every((check) => check.state === 'unavailable')).toBe(
      true,
    )
    expect(report.checks[0].detail).toContain('No answer')
  })

  it('reports a refused call as unknown, not as down', async () => {
    rootFetch.mockResolvedValue(new Response(null, { status: 200 }))
    fetchMock.mockResolvedValue(jsonResponse({}, 403))

    const report = await getServiceStatusReport()

    expect(report.checks.find((c) => c.id === 'user-service')?.state).toBe(
      'unknown',
    )
  })

  it('still runs when the session exchange fails', async () => {
    loadSessionTokens.mockRejectedValue(new Error('no session'))
    rootFetch.mockResolvedValue(new Response(null, { status: 200 }))
    fetchMock.mockResolvedValue(jsonResponse({}, 200))

    const report = await getServiceStatusReport()
    expect(report.checks).toHaveLength(checkDefinitions.length)
  })

  it('passes a timeout signal to every authenticated call', async () => {
    rootFetch.mockResolvedValue(new Response(null, { status: 200 }))
    fetchMock.mockResolvedValue(jsonResponse({}, 200))

    await getServiceStatusReport()

    const calls = platformFetch.mock.calls as [string, RequestInit][]
    expect(calls.length).toBeGreaterThan(0)
    calls.forEach(([, init]) => expect(init?.signal).toBeDefined())
  })
})

describe('uncheckable services and navigation', () => {
  it('lists what cannot be checked, each with a reason', () => {
    expect(uncheckableServices.length).toBeGreaterThan(0)
    uncheckableServices.forEach((service) => {
      expect(service.name).not.toBe('')
      expect(service.reason).not.toBe('')
    })
  })

  it('shows the status page under Platform', () => {
    const platform = adminNavGroups.find((group) => group.label === 'Platform')
    expect(platform?.items.map((item) => item.url)).toContain('/admin/status')
  })
})
