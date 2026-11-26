import {
  buildKnownAgentOptions,
  parseKnownAgentAllowlist,
} from '@/lib/server/known-agents'
import { describe, expect, it } from 'vitest'

describe('parseKnownAgentAllowlist', () => {
  it('returns no options when the allowlist is missing or malformed', () => {
    expect(parseKnownAgentAllowlist(undefined)).toEqual([])
    expect(parseKnownAgentAllowlist('')).toEqual([])
    expect(parseKnownAgentAllowlist('not-json')).toEqual([])
    expect(parseKnownAgentAllowlist('{"label":"x"}')).toEqual([])
  })

  it('keeps only valid endpoints and sanitizes optional fields', () => {
    const options = parseKnownAgentAllowlist(
      JSON.stringify([
        {
          label: '  Local shared agent  ',
          endpoint: ' http://localhost:4001 ',
          tokenEndpoint: 'http://127.0.0.1:4001',
          description: 'Studio reaches this one over localhost',
        },
        { label: 'Bad', endpoint: 'https://user:pass@example.com:4001' },
        { label: 'No endpoint' },
      ]),
    )

    expect(options).toEqual([
      {
        id: 'allowlist:0:http://localhost:4001',
        label: 'Local shared agent',
        endpoint: 'http://localhost:4001',
        tokenEndpoint: 'http://127.0.0.1:4001',
        source: 'allowlist',
        description: 'Studio reaches this one over localhost',
      },
    ])
  })

  it('ignores an invalid token override but keeps a valid endpoint', () => {
    const options = parseKnownAgentAllowlist(
      JSON.stringify([
        {
          label: 'Agent',
          endpoint: 'https://agent.example.com:4001',
          tokenEndpoint: 'https://agent.example.com:4001/agent/token',
        },
      ]),
    )

    expect(options[0]?.endpoint).toBe('https://agent.example.com:4001')
    expect(options[0]).not.toHaveProperty('tokenEndpoint')
  })
})

describe('buildKnownAgentOptions', () => {
  it('merges sources, deduplicates by endpoint and prefers the allowlist', () => {
    const allowlist = parseKnownAgentAllowlist(
      JSON.stringify([
        {
          label: 'Named local agent',
          endpoint: 'http://host.docker.internal:4001',
          tokenEndpoint: 'http://localhost:4001',
        },
      ]),
    )

    const options = buildKnownAgentOptions({
      cloudEndpoint: 'http://host.docker.internal:4001',
      allowlist,
      orgs: [
        {
          id: 'org-1',
          name: 'Engineering',
          orgAgents: [
            { agentEndPoint: 'http://host.docker.internal:4001' },
            { agentEndPoint: 'https://org.example.com:4001' },
            { agentEndPoint: 'not-a-url' },
          ],
        },
      ],
    })

    expect(options.map((option) => option.label)).toEqual([
      'Named local agent',
      'Org agent: Engineering',
    ])
    expect(options[0]).toMatchObject({
      endpoint: 'http://host.docker.internal:4001',
      tokenEndpoint: 'http://localhost:4001',
      source: 'allowlist',
    })
    expect(options[1]).toMatchObject({
      endpoint: 'https://org.example.com:4001',
      source: 'platform-org',
    })
  })

  it('adds the stored cloud endpoint when it is not in another source', () => {
    const options = buildKnownAgentOptions({
      cloudEndpoint: 'https://cloud.example.com:4001',
      allowlist: [],
      orgs: [],
    })

    expect(options).toEqual([
      {
        id: 'cloud-wallet:current',
        label: 'Cloud base wallet',
        endpoint: 'https://cloud.example.com:4001',
        source: 'cloud-wallet',
        description: 'Endpoint currently stored for the base wallet',
      },
    ])
  })

  it('caps the dropdown at 20 unique endpoints', () => {
    const allowlist = Array.from({ length: 25 }, (_, index) => ({
      id: `allowlist:${index}`,
      label: `Agent ${index}`,
      endpoint: `https://agent-${index}.example.com:4001`,
      source: 'allowlist' as const,
    }))

    const options = buildKnownAgentOptions({
      allowlist,
      orgs: [],
    })

    expect(options).toHaveLength(20)
  })
})
