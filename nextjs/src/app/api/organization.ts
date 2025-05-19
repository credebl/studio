import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  ecosystemAxiosPost,
} from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const createOrganization = async (
  data: object,
): Promise<AxiosResponse | string> => {
  const url = apiRoutes.organizations.create
  const payload = data

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload,
    config,
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updateOrganization = async (
  data: object,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.update}/${orgId}`
  const payload = data

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    payload,
    config,
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getOrganizations = async (
  pageNumber: number,
  pageSize: number,
  search = '',
  role = '',
): Promise<AxiosResponse | string> => {
  const roleQuery = role ? `&role=${role}` : ''
  const url = `${apiRoutes.organizations.getAll}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}${roleQuery}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getOrganizationById = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.getById}/${orgId}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getOrgDashboard = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.getOrgDashboard}/${orgId}`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getOrganizationRoles = async (
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}/roles`

  const config = getHeaderConfigs()

  const axiosPayload = {
    url,
    config,
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const createConnection = async (
  orgId: string,
  orgName: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.connection.create}`

  const data = {
    label: orgName,
    multiUseInvitation: true,
    autoAcceptConnection: true,
    orgId,
  }
  const payload = data

  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getOrganizationUsers = async (
  orgId: string,
  pageNumber: number,
  pageSize: number,
  search = '',
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.users.fetchUsers}?&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosGet(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const editOrganizationUserRole = async (
  userId: string,
  roles: string[],
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.editUserROle}/${userId}`
  const payload = {
    orgId,
    userId,
    orgRoleId: roles,
  }

  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const deleteOrganizationInvitation = async (
  orgId: string,
  invitationId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.organizations.root}/${orgId}/invitations/${invitationId}`

  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosDelete(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const createSchemaRequest = async (
  data: object,
  // endorsementId: string,
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.endorsements.createSchemaRequest}`
  const payload = data
  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  try {
    return await ecosystemAxiosPost(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}
