import type { KnownAgentOrg } from '@/lib/server/known-agents'
import { apiRoutes } from '@/config/apiRoutes'

const MAX_KNOWN_AGENT_ORGS = 10

interface ApiEnvelope<T> {
  data?: T
}

interface OrgSummary {
  id: string
  name: string
}

export type PlatformFetcher = (path: string) => Promise<Response | null>

const parseAccessibleOrgs = (body: unknown): OrgSummary[] => {
  const organizations = (body as ApiEnvelope<{ organizations?: unknown }>)?.data
    ?.organizations
  if (!Array.isArray(organizations)) {
    return []
  }

  const seen = new Set<string>()
  const orgs: OrgSummary[] = []
  for (const item of organizations) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const record = item as { id?: unknown; name?: unknown }
    const id = typeof record.id === 'string' ? record.id.trim() : ''
    const name = typeof record.name === 'string' ? record.name.trim() : ''
    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    orgs.push({ id, name: name || 'Organization' })
    if (orgs.length >= MAX_KNOWN_AGENT_ORGS) {
      break
    }
  }

  return orgs
}

const listAccessibleOrgs = async (
  fetcher: PlatformFetcher,
  role: string,
): Promise<OrgSummary[]> => {
  const query = new URLSearchParams({
    pageNumber: '1',
    pageSize: String(MAX_KNOWN_AGENT_ORGS),
    role,
  })
  const response = await fetcher(
    `${apiRoutes.organizations.getAll}?${query.toString()}`,
  )
  if (!response?.ok) {
    return []
  }

  try {
    return parseAccessibleOrgs(await response.json())
  } catch {
    return []
  }
}

/**
 * v2.3.0 exposes stored org agents only to callers with an org role. Studio
 * reads them through the same authenticated helper used by the admin screens;
 * failures are ignored so the allowlist and manual entry still work.
 */
export const loadAccessibleOrgAgents = async ({
  fetcher,
  roles,
}: {
  fetcher: PlatformFetcher
  roles: string[]
}): Promise<KnownAgentOrg[]> => {
  const lists = await Promise.all(
    roles.map((role) => listAccessibleOrgs(fetcher, role)),
  )
  const summaries = new Map<string, OrgSummary>()

  for (const list of lists) {
    for (const org of list) {
      summaries.set(org.id, org)
      if (summaries.size >= MAX_KNOWN_AGENT_ORGS) {
        break
      }
    }
    if (summaries.size >= MAX_KNOWN_AGENT_ORGS) {
      break
    }
  }

  const orgs = await Promise.all(
    Array.from(summaries.values()).map(
      async (org): Promise<KnownAgentOrg | null> => {
        try {
          const response = await fetcher(
            `${apiRoutes.organizations.getById}/${encodeURIComponent(org.id)}`,
          )
          if (!response?.ok) {
            return null
          }

          const body = (await response.json()) as ApiEnvelope<{
            ['org_agents']?: unknown
          }>
          const agents = Array.isArray(body?.data?.['org_agents'])
            ? body.data['org_agents']
            : []

          return {
            id: org.id,
            name: org.name,
            orgAgents: agents.map((item) => {
              const record =
                item && typeof item === 'object'
                  ? (item as { agentEndPoint?: unknown })
                  : {}
              return { agentEndPoint: record.agentEndPoint }
            }),
          }
        } catch {
          return null
        }
      },
    ),
  )

  return orgs.filter((org): org is KnownAgentOrg => org !== null)
}
