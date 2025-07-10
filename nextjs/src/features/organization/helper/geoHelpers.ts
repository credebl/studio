import {
  getAllCities,
  getAllCountries,
  getAllStates,
} from '@/app/api/geolocation'

import { AxiosResponse } from 'axios'
import { apiStatusCodes } from '@/config/CommonConstant'

export interface Country {
  id: number
  name: string
}

export interface State {
  id: number
  name: string
  countryId: number
  countryCode: string
}

export interface City {
  id: number
  name: string
  stateId: number
  stateCode: string
  countryId: number
  countryCode: string
}

export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await getAllCountries()
    const { data } = response as AxiosResponse
    return data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
      ? data.data || []
      : []
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}

export const fetchStates = async (countryId: number): Promise<State[]> => {
  try {
    const response = await getAllStates(countryId)
    const { data } = response as AxiosResponse
    return data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
      ? data.data || []
      : []
  } catch (error) {
    console.error('Error fetching states:', error)
    return []
  }
}

export const fetchCities = async (
  countryId: number,
  stateId: number,
): Promise<City[]> => {
  try {
    const response = await getAllCities(countryId, stateId)
    const { data } = response as AxiosResponse
    return data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
      ? data.data || []
      : []
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}
