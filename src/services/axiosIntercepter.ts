import axios from 'axios'
import { pathRoutes } from '../config/pathRoutes';
const instance = axios.create({
    baseURL: import.meta.env.PUBLIC_BASE_URL
})


// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const errorRes = error?.response;

    if(errorRes?.status === 401){
        window.location.href = pathRoutes.auth.sinIn
    }
    
    return Promise.reject(error);
});

export default instance