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
