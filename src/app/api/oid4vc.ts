import { AxiosResponse } from 'axios'
import { ICreateIssuerPayload } from '../oid4vc/interface/interface'
import apiRoutes from './apiRoutes'
import { axiosPost } from '@/services/apiRequests'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const createIssuer = async (
  orgId: string,
  payload: ICreateIssuerPayload,
): Promise<AxiosResponse | string> => {
  const url = `/orgs/${orgId}${apiRoutes.Oid4vcIssuer.createIssuer}`

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
