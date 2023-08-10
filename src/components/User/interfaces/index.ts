export interface UserActivity {
    id: number
    userId: number
    orgId: number
    action: string
    details: string
    createDateTime: string
    createdBy: number
    lastChangedDateTime: string
    lastChangedBy: number
    deletedAt: any
}
