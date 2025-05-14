export interface OrgRole {
  id: string
  name: string
  description: string
  createDateTime?: string
  createdBy?: string
  lastChangedDateTime?: string
  lastChangedBy?: string
  deletedAt?: Date | null
}

export interface UserOrgRole {
  id: string
  userId: string
  orgRoleId: string
  orgId: string
  orgRole: OrgRole
}
export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isEmailVerified: boolean
  clientId: string
  clientSecret: string
  keycloakUserId: string
  userOrgRoles: UserOrgRole[]
  roles: string[]
}
