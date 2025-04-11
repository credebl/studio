import { apiRoutes } from '@/config/apiRoutes';
import { apiStatusCodes } from '@/config/CommonConstant';
import axios, { AxiosRequestConfig } from 'axios';
// import type { AxiosRequestConfig } from 'axios';
// import { envConfig } from '../config/envConfig';
// import { apiRoutes } from '../config/apiRoutesOld';
// import { getFromLocalStorage, setToLocalStorage } from '../api/Auth';
// import { apiStatusCodes, storageKeys } from '../config/CommonConstant';

const instance = axios.create({
  // baseURL: import.meta.env.NEXT_PUBLIC_BASE_URL,
  baseURL: process.env.NEXT_PUBLIC_BASE_URL
});

const EcosystemInstance = axios.create({
  // baseURL: import.meta.env.PUBLIC_ECOSYSTEM_BASE_URL,
  baseURL: process.env.PUBLIC_ECOSYSTEM_BASE_URL
});

const checkAuthentication = async (
  sessionCookie: string,
  request: AxiosRequestConfig
) => {
  const isAuthPage =
    window.location.href.includes('/authentication/sign-in') ||
    window.location.href.includes('/authentication/sign-up');
  try {
    // const baseURL = import.meta.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionCookie}`
      },
      method: 'GET'
    };
    const res = await fetch(`${baseURL + apiRoutes.users.userProfile}`, {
      ...config
    });
    const userData = await res.json();

    if (userData.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
      if (sessionCookie && !isAuthPage) {
        const { access_token, refresh_token }: any = globalThis;

        // await setToLocalStorage(storageKeys.TOKEN, access_token);
        // await setToLocalStorage(storageKeys.REFRESH_TOKEN, refresh_token);

        window.location.reload();
      } else {
        window.location.assign('/authentication/sign-in');
      }
    }
  } catch (error) {}
};
// const { NEXT_PUBLIC_BASE_URL, PUBLIC_ECOSYSTEM_BASE_URL }: any = process.env;

instance.interceptors.request.use(
  async (config) => {
    config.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    return config;
  },
  (error) => Promise.reject(error)
);

EcosystemInstance.interceptors.request.use(
  async (config) => {
    config.baseURL = process.env.PUBLIC_ECOSYSTEM_BASE_URL;
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const isAuthPage =
      window.location.href.includes('/authentication/sign-in') ||
      window.location.href.includes('/authentication/sign-up');
    const errorRes = error?.response;
    const originalRequest = error.config;
    // const token = await getFromLocalStorage(storageKeys.TOKEN);
    const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN || '';
    if (errorRes?.status === 401 && !isAuthPage) {
      await checkAuthentication(token, originalRequest);
    }

    return Promise.reject(error);
  }
);

export { instance, EcosystemInstance };
