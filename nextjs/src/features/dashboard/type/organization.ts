export interface Organization {
    id: string
    name: string
    description: string
    logoUrl: string
    userOrgRoles: Array<{
      orgRole: {
        name: string
      }
    }>
  }
  
  export interface GetOrganizationsResponse {
    data: {
      organizations: Organization[]
    }
  }