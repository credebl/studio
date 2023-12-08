import type { OrgRole, Organisation } from "."

export interface Invitation {
		ecosystem: any
    id: string
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    lastChangedBy: string
    deletedAt: any
    userId: string
    orgId: string
    status: string
    orgRoles: OrgRole[]
    email: string
    organisation: Organisation
}
