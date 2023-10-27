export interface IEcosystem {
    name: string
    description: string
    logoUrl: string
    joinedDate?: string
    role?: string
}

export interface Ecosystem {
    id: string
    createDateTime: string
    createdBy: string
    lastChangedDateTime: string
    lastChangedBy: string
    name: string
    description: string
    logoUrl: string
    website: string
    roles: string[] 
    logoFile:string
}