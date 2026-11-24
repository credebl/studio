import { AxiosResponse } from 'axios'

import { ICreateIssuerPayload } from '@/app/oid4vc/interface/interface'
import { apiRoutes } from '@/config/apiRoutes'
import { axiosPost } from '@/services/apiRequests'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const createIssuer = async (
  orgId: string,
  payload: ICreateIssuerPayload,
): Promise<AxiosResponse> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.oid4vc.createIssuer}`

  const axiosPayload = {
    url,
    payload,
    config: getHeaderConfigs(),
  }

  return axiosPost(axiosPayload)
}
