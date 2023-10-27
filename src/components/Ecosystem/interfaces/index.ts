export interface IEcosystem {
    id: string
    name: string
    description: string
    logoUrl: string
    joinedDate?: string
    role?: string
    ecosystemOrgs?: {
        ecosystemRole: {
            name: string
        }
    }[]
}

export interface Ecosystem {
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
    logoFile:string
}