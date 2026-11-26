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

/**
 * Result of one independent dashboard data source. A source that fails is
 * `{ ok: false }` so its card can say "Unavailable" without hiding the rest.
 */
export type MetricResult<T> = { ok: true; value: T } | { ok: false }

export interface AdminOrganizationSummary {
  id: string
  name: string
}

export interface AdminLedgerSummary {
  id: string
  name: string
  networkType?: string
}

/**
 * Invitation counts computed from the most recent pages. `capped` is true when
 * more invitations exist than were counted.
 */
export interface AdminInvitationsMetric {
  created: number
  pending: number
  counted: number
  capped: boolean
  recent: AdminInvitation[]
}

/** Non-secret platform feature flags. Never carries other platform settings. */
export interface AdminPlatformFeatures {
  ecosystemEnabled: boolean | null
}

export interface AdminDashboardMetrics {
  summary: MetricResult<AdminDashboardSummary>
  organizationCount: MetricResult<number>
  recentOrganizations: MetricResult<AdminOrganizationSummary[]>
  schemaCount: MetricResult<number>
  credentialDefinitionCount: MetricResult<number>
  ledgers: MetricResult<AdminLedgerSummary[]>
  invitations: MetricResult<AdminInvitationsMetric>
  features: MetricResult<AdminPlatformFeatures>
  cloudWallet: CloudBaseWalletStatus
}

/**
 * Read-only platform configuration. Built from an allow-list: secrets are
 * reduced to a "configured" flag and internal ids are left out.
 */
export interface AdminPlatformSettings {
  externalIp: string
  inboundEndpoint: string
  apiEndpoint: string
  tailsFileServer: string
  emailFrom: string
  emailUsername: string
  emailApiKeyConfigured: boolean
  ecosystemEnabled: boolean | null
  createdAt?: string
  updatedAt?: string
}
