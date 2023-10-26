import type { OrgRole } from "."

export interface Invitation {
		ecosystem: any
    id: string
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    deletedAt: any
    userId: string
    orgId: string
    status: string
    orgRoles: OrgRole[]
    email: string
    organisation: Organisation
}
