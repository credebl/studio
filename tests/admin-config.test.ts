import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config.js'

interface HeaderRule {
  source: string
  headers: { key: string; value: string }[]
}

const getHeaderRules = async (): Promise<HeaderRule[]> => {
  const rules = await nextConfig.headers?.()
  return (rules ?? []) as HeaderRule[]
}

describe('admin security configuration', () => {
  it('disables the powered-by header and emits a standalone bundle', () => {
    expect(nextConfig.poweredByHeader).toBe(false)
    expect(nextConfig.output).toBe('standalone')
  })

  it('marks admin pages as uncacheable, unindexable and non-sniffable', async () => {
    const rules = await getHeaderRules()
    const adminRule = rules.find((rule) => rule.source === '/admin/:path*')

    expect(adminRule).toBeDefined()

    const headers = Object.fromEntries(
      (adminRule?.headers ?? []).map((header) => [header.key, header.value]),
    )

    expect(headers['Cache-Control']).toBe('no-store, max-age=0')
    expect(headers['Pragma']).toBe('no-cache')
    expect(headers['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['Referrer-Policy']).toBe('no-referrer')
  })

  it('applies the same hardened headers to /api/admin routes', async () => {
    const rules = await getHeaderRules()
    const adminRule = rules.find((rule) => rule.source === '/admin/:path*')
    const apiRule = rules.find((rule) => rule.source === '/api/admin/:path*')

    expect(apiRule).toBeDefined()
    expect(apiRule?.headers).toEqual(adminRule?.headers)
  })
})
