import type {
  ServiceState,
  ServiceStatusCheck,
  ServiceStatusReport,
  UncheckableService,
} from '@/features/admin/types'
import { loadSessionTokens, platformFetch } from './platform'
import { apiRoutes } from '@/config/apiRoutes'

/**
 * Reachability checks for the platform services, run from the server.
 *
 * The platform has no health endpoint for its services (they talk over NATS
 * and expose no HTTP port). Each check therefore calls a read-only gateway
 * endpoint that is served by the service and infers the state from the
 * answer. This is a stand-in, not a health report, and the page says so.
 */

const CHECK_TIMEOUT_MS = 5000
const NO_EXCLUDED_ORG_ID = '00000000-0000-4000-8000-000000000000'

interface CheckDefinition {
  id: string
  name: string
  covers: string
  probe: string
  /** Calls the endpoint and returns its HTTP status, or null with no answer. */
  call: () => Promise<number | null>
}

const authenticatedStatus = async (path: string): Promise<number | null> => {
  const response = await platformFetch(path, {
    signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
  })

  return response ? response.status : null
}

const gatewayRootStatus = async (): Promise<number | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    return null
  }

  const response = await fetch(`${baseUrl}/`, {
    redirect: 'manual',
    cache: 'no-store',
    signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
  })

  return response.status
}

export const checkDefinitions: CheckDefinition[] = [
  {
    id: 'api-gateway',
    name: 'API gateway',
    covers: 'The public HTTP entry point of the platform.',
    probe: 'GET /',
    call: gatewayRootStatus,
  },
  {
    id: 'user-service',
    name: 'User service',
    covers: 'Users, sessions and platform settings.',
    probe: `GET ${apiRoutes.platformAdmin.platformSettings}`,
    call: () => authenticatedStatus(apiRoutes.platformAdmin.platformSettings),
  },
  {
    id: 'organization-service',
    name: 'Organization service',
    covers: 'Organizations and their members.',
    probe: 'GET /orgs/:orgId/get-all-platform-organisations',
    call: () =>
      authenticatedStatus(
        `${apiRoutes.platformAdmin.organisations}/${NO_EXCLUDED_ORG_ID}/get-all-platform-organisations?pageNumber=1&pageSize=1`,
      ),
  },
  {
    id: 'agent-service',
    name: 'Agent service',
    covers: 'Agent provisioning and ledger configuration.',
    probe: `GET ${apiRoutes.platformAdmin.agentLedgerConfig}`,
    call: () => authenticatedStatus(apiRoutes.platformAdmin.agentLedgerConfig),
  },
  {
    id: 'platform-service',
    name: 'Platform service',
    covers: 'Ledgers, schemas and ecosystem settings.',
    probe: `GET ${apiRoutes.platformAdmin.ledgers}`,
    call: () => authenticatedStatus(apiRoutes.platformAdmin.ledgers),
  },
]

/**
 * Services and infrastructure that cannot be checked from here. They are
 * listed so nobody reads their absence as "healthy".
 */
export const uncheckableServices: UncheckableService[] = [
  {
    name: 'Agent controllers',
    reason:
      'The agents themselves are only checked by an organization-level health call.',
  },
  {
    name: 'Issuance, verification and connections',
    reason: 'Their endpoints need an organization role.',
  },
  {
    name: 'OID4VC issuance and verification',
    reason: 'Their endpoints need an organization role.',
  },
  {
    name: 'X.509 and cloud wallet',
    reason: 'No read-only endpoint is open to the platform admin.',
  },
  {
    name: 'Notification, webhook and utility services',
    reason: 'They expose no read-only endpoint through the gateway.',
  },
  {
    name: 'NATS, database, Keycloak and storage',
    reason: 'Not reachable from Studio and not exposed by the platform.',
  },
]

/**
 * A 5xx or no answer means the gateway could not get a reply from the service.
 * 401 and 403 mean the call was refused before reaching it, so nothing can be
 * said. Anything else, including a 404 for an empty list, is an answer.
 */
export const stateFromStatus = (status: number | null): ServiceState => {
  if (status === null || status >= 500) {
    return 'unavailable'
  }

  if (status === 401 || status === 403) {
    return 'unknown'
  }

  return 'operational'
}

const describe = (status: number | null, state: ServiceState): string => {
  if (status === null) {
    return 'No answer from the gateway.'
  }

  if (state === 'operational') {
    return `Answered with HTTP ${status}.`
  }

  if (state === 'unknown') {
    return `Refused with HTTP ${status} before reaching the service.`
  }

  return `Failed with HTTP ${status}. The service may be down, or it errored.`
}

const runCheck = async (
  definition: CheckDefinition,
): Promise<ServiceStatusCheck> => {
  const base = {
    id: definition.id,
    name: definition.name,
    covers: definition.covers,
    probe: definition.probe,
  }
  const started = Date.now()

  try {
    const status = await definition.call()
    const state = stateFromStatus(status)

    return {
      ...base,
      state,
      latencyMs: Date.now() - started,
      detail: describe(status, state),
    }
  } catch {
    return {
      ...base,
      state: 'unavailable',
      latencyMs: Date.now() - started,
      detail: 'No answer within 5 seconds, or the request failed.',
    }
  }
}

export const getServiceStatusReport =
  async (): Promise<ServiceStatusReport> => {
    // Exchange the session once up front so the first check does not pay for it.
    await loadSessionTokens().catch(() => null)

    const checks = await Promise.all(checkDefinitions.map(runCheck))

    return { checkedAt: new Date().toISOString(), checks }
  }
