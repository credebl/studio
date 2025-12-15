import { axiosGet, axiosPost, axiosPut } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { SortActions } from '@/components/ui/generic-table-component/columns'
import apiRoutes from './apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const createCerificate = async (
  orgId: string,
  data: object,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}`
  console.log('🚀 ~ createCerificate ~ url:', url)
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

export const getx509Certificate = async (
  orgId: string,
  certificateId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}/${certificateId}`
  console.log("🚀 ~ getx509Certificate ~ url:", url)

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

export const getAllx509Certificates = async (
orgId: string, p0: { page: number; itemPerPage: number; search: string; sortBy: string; sortingOrder: SortActions },
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}`
  console.log("🚀 ~ getx509Certificate ~ url:", url)

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

export const activateCertificate = async (
  orgId: string,
  certificateId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}${apiRoutes.x509.activateCertificate}/${certificateId}`

  const axiosPayload = {
    url,
   
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const updatePrimaryDid = async (
  orgId: string,
  certificateId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}${apiRoutes.x509.deactivateCertificate}/${certificateId}`

  const axiosPayload = {
    url,
    config: getHeaderConfigs(),
  }

  try {
    return await axiosPut(axiosPayload)
  } catch (error) {
    const err = error as Error
    return err?.message
  }
}

