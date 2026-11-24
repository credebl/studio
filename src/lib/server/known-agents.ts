import {
  MAX_AGENT_ENDPOINT_LENGTH,
  isValidAgentEndpoint,
} from '@/lib/agent-endpoints'
import type { KnownAgentOption } from '@/features/admin/types'

export const MAX_KNOWN_AGENTS = 20

const MAX_LABEL_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 240

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

/**
 * Server-only allowlist. It contains labels and endpoints only; anything that
 * looks like a credential is ignored by the endpoint validator.
 */
export const parseKnownAgentAllowlist = (
  raw: string | undefined,
): KnownAgentOption[] => {
  if (!raw?.trim()) {
    return []
  }

  let parsed: unknown = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) {
    return []
  }

  const options: KnownAgentOption[] = []
  for (const entry of parsed.slice(0, MAX_KNOWN_AGENTS)) {
    if (!entry || typeof entry !== 'object') {
      continue
    }

    const record = entry as Record<string, unknown>
    const endpoint = cleanText(record.endpoint, MAX_AGENT_ENDPOINT_LENGTH)
    if (!isValidAgentEndpoint(endpoint)) {
      continue
    }

    const label =
      cleanText(record.label, MAX_LABEL_LENGTH) ||
      `Known agent ${options.length + 1}`
    const tokenEndpoint = cleanText(
      record.tokenEndpoint,
      MAX_AGENT_ENDPOINT_LENGTH,
    )
    const description = cleanText(record.description, MAX_DESCRIPTION_LENGTH)

    options.push({
      id: `allowlist:${options.length}:${endpoint}`,
      label,
      endpoint,
      source: 'allowlist',
      ...(tokenEndpoint && isValidAgentEndpoint(tokenEndpoint)
        ? { tokenEndpoint }
        : {}),
      ...(description ? { description } : {}),
    })
  }

  return options
}

interface OrgAgentRecord {
  agentEndPoint?: unknown
}

export interface KnownAgentOrg {
  id?: unknown
  name?: unknown
  orgAgents?: OrgAgentRecord[]
}

export const buildKnownAgentOptions = ({
  cloudEndpoint,
  allowlist,
  orgs,
}: {
  cloudEndpoint?: string
  allowlist: KnownAgentOption[]
  orgs: KnownAgentOrg[]
}): KnownAgentOption[] => {
  const candidates: KnownAgentOption[] = [...allowlist]
  const endpoint = cleanText(cloudEndpoint, MAX_AGENT_ENDPOINT_LENGTH)

  if (endpoint && isValidAgentEndpoint(endpoint)) {
    candidates.push({
      id: 'cloud-wallet:current',
      label: 'Cloud base wallet',
      endpoint,
      source: 'cloud-wallet',
      description: 'Endpoint currently stored for the base wallet',
    })
  }

  for (const org of orgs) {
    const orgName = cleanText(org.name, MAX_LABEL_LENGTH) || 'Organization'
    for (const agent of org.orgAgents ?? []) {
      const agentEndpoint = cleanText(
        agent.agentEndPoint,
        MAX_AGENT_ENDPOINT_LENGTH,
      )
      if (!isValidAgentEndpoint(agentEndpoint)) {
        continue
      }

      candidates.push({
        id: `platform-org:${cleanText(org.id, MAX_LABEL_LENGTH)}:${agentEndpoint}`,
        label: `Org agent: ${orgName}`,
        endpoint: agentEndpoint,
        source: 'platform-org',
      })
    }
  }

  const seen = new Set<string>()
  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.endpoint)) {
        return false
      }
      seen.add(candidate.endpoint)
      return true
    })
    .slice(0, MAX_KNOWN_AGENTS)
}
