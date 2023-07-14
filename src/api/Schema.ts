import type { GetAllSchemaListParameter } from "../components/Resources/Schema/interfaces";
import { apiRoutes } from "../config/apiRoutes";
import { axiosGet, axiosPost } from "../services/apiRequests";

const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQQXN4LUIzZnBhaTZtVUVJaXFrNGFNUG5COWlQOV9vN1d6Z2JyVlZhYzdVIn0.eyJleHAiOjE2ODkzNTE3NTYsImlhdCI6MTY4OTMxNTc1NiwianRpIjoiNzZhOGE0N2UtZDRhYy00NjQxLWFjYjctNmE0MjFmZTg3MjQ2IiwiaXNzIjoiaHR0cDovLzAuMC4wLjA6ODA4OS9hdXRoL3JlYWxtcy9jcmVkZWJsLXBsYXRmb3JtIiwiYXVkIjpbImFkbWluLWZpZG90ZXN0dXNlckBnZXRuYWRhLmNvbSIsImFkbWluLXRlc3RzY2hlbWF1c2VyQHlvcG1haWwuY29tIiwiYWRtaW4td2VydHl1aW82N2U0ZUB5b3BtYWlsLmNvbSIsImFkbWluLWpvaG44OTg5QGdldG5hZGEuY29tIiwiYWRtaW4tYXNkYWZAeW9wbWFpbC5jb20iLCJhZG1pbi1maWRvdGVzdHVzZXJAeW9wbWFpbC5jb20iLCJhZG1pbi1zY2hlbWF1c2VyMDkwQHlvcG1haWwuY29tIiwiYWRtaW4tdGVzdHVzZXIxMjM0QHlvcG1haWwuY29tIiwiYWRtaW4tYXV0b2pAZ2V0bmFkYS5jb20iLCJhZG1pbi1maWRvdGVzdHVzZXJhYmNkQHlvcG1haWwuY29tIiwiYWRtaW4td2VydHl1aW90YXBwQHlvcG1haWwuY29tIiwiYWRtaW4tam9obnNtaXRoMDAxQHlvcG1haWwuY29tIiwiYWRtaW4tdGVzdHVzZXJ5QHlvcG1haWwuY29tIiwiYWRtaW4tam9obnNtaXRoQGdldG5hZGEuY29tIiwiYWRtaW4tdXNlcnRlc3Q4OUBnZXRuYWRhLmNvbSIsImFkbWluLXNjaGVtYWNyZWQxQHlvcG1haWwuY29tIiwiYWRtaW4tY3JlZHVzZXJAeW9wbWFpbC5jb20iLCJhZG1pbi12dnZiY2FAdm9tb3RvLmNvbSIsImFkbWluLXdlcnR5dWlvdHV5QHlvcG1haWwuY29tIiwiYWRtaW4tcXdlcnR5QHlvcG1haWwuY29tIiwiYWNjb3VudCIsImFkbWluLXNjaGVtYWNyZWRAeW9wbWFpbC5jb20iXSwic3ViIjoiYTljMWRlMTktMmY4OC00NWYwLWE2MGYtNzg4NDQ5OGUwY2ZkIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYWRtaW5DbGllbnQiLCJzZXNzaW9uX3N0YXRlIjoiZjdkYWZlM2ItM2VkMC00ZDgxLWFkMTUtZTE0OTM5YjliODAzIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhZG1pbi1maWRvdGVzdHVzZXJAZ2V0bmFkYS5jb20iOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX0sImFkbWluLXRlc3RzY2hlbWF1c2VyQHlvcG1haWwuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi13ZXJ0eXVpbzY3ZTRlQHlvcG1haWwuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi1qb2huODk4OUBnZXRuYWRhLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tYXNkYWZAeW9wbWFpbC5jb20iOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX0sImFkbWluLWZpZG90ZXN0dXNlckB5b3BtYWlsLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tc2NoZW1hdXNlcjA5MEB5b3BtYWlsLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tdGVzdHVzZXIxMjM0QHlvcG1haWwuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi1hdXRvakBnZXRuYWRhLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tZmlkb3Rlc3R1c2VyYWJjZEB5b3BtYWlsLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4td2VydHl1aW90YXBwQHlvcG1haWwuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi1qb2huc21pdGgwMDFAeW9wbWFpbC5jb20iOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX0sImFkbWluLXRlc3R1c2VyeUB5b3BtYWlsLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tam9obnNtaXRoQGdldG5hZGEuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi11c2VydGVzdDg5QGdldG5hZGEuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi1zY2hlbWFjcmVkMUB5b3BtYWlsLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tY3JlZHVzZXJAeW9wbWFpbC5jb20iOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX0sImFkbWluLXZ2dmJjYUB2b21vdG8uY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhZG1pbi13ZXJ0eXVpb3R1eUB5b3BtYWlsLmNvbSI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfSwiYWRtaW4tcXdlcnR5QHlvcG1haWwuY29tIjp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX0sImFkbWluLXNjaGVtYWNyZWRAeW9wbWFpbC5jb20iOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6InF3ZXJ0eSBxd2VydHkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJxd2VydHlAeW9wbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoicXdlcnR5IiwiZmFtaWx5X25hbWUiOiJxd2VydHkiLCJlbWFpbCI6InF3ZXJ0eUB5b3BtYWlsLmNvbSJ9.Svjor2y-I5FYrYm6v38ge-gqEkFkeTBJl50ltTkfhBAoW5m8pNbOddTEZZCxFLAI3A3-g_8XEol_4jbK6j_r-UlvLGDW3cAqoO4U2Borl1ZjMtjCK31ZlLeliiARxpJeGo34aKd6OlsEOTYsfDIV6LhN-A5IfPkWLkVA71TyYTccCAdAgpOcpS2tYZ7J0gjcy_GNNv_v-Ah0a_YXPCNyVOeOVfwv_mkhW-UiYfgynOuQdqxkBtfib0RwGWpeCQ7NIHgt8eQf7-Zh0PS1zXE2_kf_r1WDB2YKntIMfXUmabQnw3uuXQ-wOo0e9O48NLMRMZBTAOh9y1LqaNtKennw_w'

export const getAllSchemas = async({ search, itemPerPage, sortBy, page }:GetAllSchemaListParameter) => {
    const details = {
        url: `${apiRoutes.schema.getAll}?orgId=2&searchByText=${search}&pagepage=${page}&items_per_page=${itemPerPage}&schemaSortBy=${sortBy}&items_per_page=${itemPerPage}&schemaSortBy=${sortBy}`,
        config: {
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      };
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    }
}

export const addSchema = async(payload:any) => {
  const details = {
    url: apiRoutes.schema.create,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosPost(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

export const getSchemaById = async(id:any) => {
  const details = {
    url: `${apiRoutes.schema.getSchemaById}?schemaId=${id}&orgId=2`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

export const createCredentialDefinition = async(payload:any) => {
  const details = {
    url: apiRoutes.schema.createCredentialDefinition,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosPost(details)
        return response
    }
    catch(error){
        const err = error as Error
        return err?.message
    } 
}

export const getCredDeffById = async(id:string) => {
  const details = {
    url: `${apiRoutes.schema.getCredDeffBySchemaId}?schemaId=${id}&orgId=2`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
}
      
    try{
        const response = await axiosGet(details)
        return response
    }
    catch(error){
        const err = error as Error
        throw err?.message
    } 
}

