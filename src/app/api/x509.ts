import { axiosGet, axiosPost, axiosPut } from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import apiRoutes from './apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const createCertificate = async (
  orgId: string,
  data: object,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}`
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
  orgId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}`

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

  try {
    return await axiosPut({
      url,
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err.message
  }
}

export const deactivateCertificate = async (
  orgId: string,
  certificateId: string,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}${apiRoutes.x509.deactivateCertificate}/${certificateId}`

  try {
    return await axiosPut({
      url,
      config: getHeaderConfigs(),
    })
  } catch (error) {
    const err = error as Error
    return err.message
  }
}

export const importCertificate = async (
  orgId: string,
  data: object,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.x509.root}/${orgId}${apiRoutes.x509.importCertificate}`
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
