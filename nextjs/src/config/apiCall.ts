/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosResponse } from 'axios'

const handleError = (error: any): never => {
  if (error.response) {
    // Server responded with a status other than 200 range
    throw new Error(error.response.data.message || 'Server Error')
  } else if (error.request) {
    // Request was made but no response was received
    throw new Error('No response received from server')
  } else {
    // Something happened in setting up the request
    throw new Error(error.message || 'Error in setting up request')
  }
}

const postRequest = async (
  url: string,
  data?: object,
  config?: object,
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.post(url, data, config)
    return response
  } catch (error) {
    handleError(error)
  }
}

const getRequest = async (
  url: string,
  params?: object,
  config?: object,
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.get(url, { params, headers: config })
    return response
  } catch (error) {
    handleError(error)
  }
}

const putRequest = async (
  url: string,
  data: object,
  config?: object,
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.put(url, data, config)
    return response
  } catch (error) {
    handleError(error)
  }
}

const deleteRequest = async (
  url: string,
  data?: object,
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.delete(url, { data })
    return response
  } catch (error) {
    handleError(error)
  }
}

export { postRequest, getRequest, putRequest, deleteRequest }