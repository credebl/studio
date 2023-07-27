import type { UserOrgRole } from "."

export interface User {
    id: number
    username: string
    email: string
    firstName: string
    lastName: string
    isEmailVerified: boolean
    clientId: any
    clientSecret: any
    keycloakUserId: string
    userOrgRoles: UserOrgRole[]
    roles: string[]

}