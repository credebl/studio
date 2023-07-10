export interface UserOrgData {
    id: number
    userId: number
    orgRoleId: number
    orgId: number
    organisation: Organisation
}

export interface Organisation {
    id: number
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    name: string
    description: string
    logoUrl: string
    website: string
    org_agents: object[]
    orgInvitations: object[]
}