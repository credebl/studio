import axios from 'axios'
import { envConfig } from '../config/envConfig';

const instance = axios.create({
    baseURL: envConfig.PUBLIC_BASE_URL
})

const { PUBLIC_BASE_URL}: any = globalThis

instance.interceptors.request.use(async config => { 
    config.baseURL = PUBLIC_BASE_URL;    
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
    return Promise.reject(error);
});

export default instance
