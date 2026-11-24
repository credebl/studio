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
