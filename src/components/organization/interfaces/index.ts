export interface UserOrgRole {
    id: number
    userId: number
    orgRoleId: number
    orgId: number
    orgRole: OrgRole
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
    roles: string[]
    userOrgRoles: UserOrgRole[]

}

export interface OrgRole {
    id: number
    name: string
    description: string
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    deletedAt: any
}
