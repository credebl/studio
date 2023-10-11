export interface IEcosystem {
    name: string
    description: string
    logoUrl: string
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