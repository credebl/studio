import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { axiosGet } from '@/services/apiRequests'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

export const getAllCountries = async (): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.geolocation.countries}`

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

export const getAllStates = async (
  countryId: number | null,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.geolocation.countries}/${countryId}${apiRoutes.geolocation.state}`

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

export const getAllCities = async (
  countryId: number | null,
  stateId: number | null,
): Promise<AxiosResponse | string> => {
  const url = `${apiRoutes.geolocation.countries}/${countryId}${apiRoutes.geolocation.state}/${stateId}${apiRoutes.geolocation.cities}`

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
