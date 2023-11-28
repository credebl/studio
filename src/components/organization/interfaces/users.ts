import type { UserOrgRole } from "."

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