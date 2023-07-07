import type { AxiosResponse } from 'axios';
import axiosUser from './axoisIntercepter';

export interface APIParameters {
    url: string,
    payload?: Record<never, unknown>
    config?: Record<string, unknown>
}

export const axoisGet = async({url, config}: APIParameters): Promise<AxiosResponse> =>{
    try{
        const response = await axiosUser.get(url, config);

        return response
    }
    catch (error) {
       return error as AxiosResponse
    }
}

export const axoisPost = async({url, payload, config}: APIParameters): Promise<AxiosResponse> =>{
    try{
        const response = await axiosUser.post(url, payload, config);

        return response
    }
    catch (error) {
       return error as AxiosResponse
    }
}

export const axoisPatch = async({url, payload, config}: APIParameters): Promise<AxiosResponse> =>{
    try{
        const response = await axiosUser.patch(url, payload, config);

        return response
    }
    catch (error) {
       return error as AxiosResponse
    }
}

export const axoisPut = async({url, payload, config}: APIParameters): Promise<AxiosResponse> =>{
    try{
        const response = await axiosUser.put(url, payload, config);

        return response
    }
    catch (error) {
       return error as AxiosResponse
    }
}

export const axoisDelete = async({url, config}: APIParameters): Promise<AxiosResponse> =>{
    try{
        const response = await axiosUser.delete(url, config);

        return response
    }
    catch (error) {
       return error as AxiosResponse
    }
}