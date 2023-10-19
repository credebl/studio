import type { OrgRole, Organisation } from "."

export interface Invitation {
		ecosystem: any
    id: number
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    deletedAt: any
    userId: number
    orgId: number
    status: string
    orgRoles: OrgRole[]
    email: string
    organisation: Organisation
}
