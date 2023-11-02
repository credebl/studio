export interface IEcosystem {
    id: string
    name: string
    description: string
    logoUrl: string
    joinedDate?: string
    role?: string
    autoEndorsement:boolean
    ecosystemOrgs?: {
        ecosystemRole: {
            name: string
        }
    }[]
}

export interface Ecosystem {
    id: string
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    autoEndorsement:boolean
    lastChangedBy: number
    name: string
    description: string
    logoUrl: string
    website: string
    roles: string[] 
    logoFile:string
}