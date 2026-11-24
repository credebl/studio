import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config.js'

interface HeaderRule {
  source: string
  headers: { key: string; value: string }[]
}

describe('holder security configuration', () => {
  it('marks holder pages as uncacheable, unindexable and non-sniffable', async () => {
    const rules = (await nextConfig.headers?.()) as HeaderRule[] | undefined
    const holderRule = rules?.find((rule) => rule.source === '/holder/:path*')

    expect(holderRule).toBeDefined()

    const headers = Object.fromEntries(
      (holderRule?.headers ?? []).map((header) => [header.key, header.value]),
    )

    expect(headers['Cache-Control']).toBe('no-store, max-age=0')
    expect(headers['Pragma']).toBe('no-cache')
    expect(headers['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['Referrer-Policy']).toBe('no-referrer')
  })
})
