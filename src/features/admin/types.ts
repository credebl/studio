export interface AdminDashboardSummary {
  ecosystem: number
  invitations: number
  activeOrgs: number
}

export interface AdminInvitation {
  id: string
  email: string
  status: string
  createDateTime: string
  ecosystem?: {
    id: string
    name: string
    description: string
    createDateTime: string
  } | null
  organisation?: {
    name: string
  } | null
}

export interface AdminInvitationPage {
  data: AdminInvitation[]
  totalPages: number
}

export interface AdminActionResult {
  status: 'success' | 'error'
  message: string
}

/**
 * Operator-supplied settings for the single shared agent that hosts every
 * holder's cloud wallet tenant. Secrets are sent to the platform over TLS and
 * encrypted at rest by the platform; Studio never stores or echoes them.
 */
export interface CloudBaseWalletConfigInput {
  agentEndpoint: string
  apiKey: string
  walletKey: string
}

/**
 * Non-secret details Studio can safely keep after a successful configuration.
 * Platform v2.3.0 has no read endpoint for the base wallet, so this is a UI
 * hint only; the backend's 409 response remains the authoritative check.
 */
export interface CloudBaseWalletStatus {
  configured: boolean
  agentEndpoint?: string
  configuredAt?: string
}

/**
 * Non-secret candidate shown in the base-wallet agent dropdown. Values are
 * built on the server from configured sources; no keys or tokens are included.
 */
export interface KnownAgentOption {
  id: string
  label: string
  endpoint: string
  tokenEndpoint?: string
  source: 'allowlist' | 'cloud-wallet' | 'platform-org'
  description?: string
}

/** Sanitized fields returned by the platform after configuration. */
export interface CloudBaseWalletSummary {
  id?: string
  email?: string
  type?: string
  userId?: string
  agentEndpoint?: string
}

export interface CloudBaseWalletActionResult extends AdminActionResult {
  configured?: boolean
  agentEndpoint?: string
  configuredAt?: string
}

/**
 * Runtime token fetched directly from the shared agent. The token is returned
 * only to populate the form; the raw authorization key is never returned.
 */
export interface AgentTokenActionResult extends AdminActionResult {
  token?: string
}
