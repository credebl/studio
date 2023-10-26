export interface UserActivity {
    id: number
    userId: string
    orgId: string
    action: string
    details: string
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    deletedAt: any
}
