import axios from 'axios'
import { envConfig } from '../config/envConfig';
import { pathRoutes } from '../config/pathRoutes';

const instance = axios.create({
    baseURL: envConfig.PUBLIC_BASE_URL
})

instance.interceptors.request.use(async config => { 
    config.baseURL = globalThis.baseUrl;    
    return config; 
}, error => Promise.reject(error));


// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const errorRes = error?.response;

    if(errorRes?.status === 401){
        await localStorage.clear()
        window.location.href = pathRoutes.auth.sinIn
    }
    
    return Promise.reject(error);
});

export default instance